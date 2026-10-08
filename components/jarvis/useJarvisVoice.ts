'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Modality } from '@google/genai/web';

// Maps language codes from Hayaati's 30 locales to BCP-47 / Live voice language tags
const LOCALE_TO_VOICE_LANG: Record<string, string> = {
  en: 'en-US',
  hi: 'hi-IN',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
  ja: 'ja-JP',
  ko: 'ko-KR',
  zh: 'zh-CN',
  ar: 'ar-SA',
  pt: 'pt-BR',
  it: 'it-IT',
  ru: 'ru-RU',
  tr: 'tr-TR',
  id: 'id-ID',
  nl: 'nl-NL',
  pl: 'pl-PL',
  fa: 'fa-IR',
  th: 'th-TH',
  sw: 'sw-KE',
  bn: 'bn-IN',
  gu: 'gu-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
  mr: 'mr-IN',
  ne: 'ne-NP',
  pa: 'pa-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  ur: 'ur-PK',
  vi: 'vi-VN',
};

// Global audio unlocker to comply with browser autoplay policies
export async function unlockAudio(): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      const tempCtx = new AudioCtx();
      if (tempCtx.state === 'suspended') {
        await tempCtx.resume();
      }
      tempCtx.close().catch(() => {});
    }
  } catch {
    // Graceful unlock fallback
  }
}

// Convert Float32Array PCM samples to 16-bit linear PCM little-endian Base64
function floatTo16BitBase64(input: Float32Array): string {
  const pcm16 = new Int16Array(input.length);
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]));
    pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  const bytes = new Uint8Array(pcm16.buffer);
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export type VoiceFailureLayer =
  | 'NONE'
  | 'MIC_PERMISSION'
  | 'MEDIA_STREAM'
  | 'AUDIO_CONTEXT'
  | 'TOKEN'
  | 'WEBSOCKET'
  | 'GEMINI_LIVE'
  | 'AUDIO_PLAYBACK';

interface UseJarvisVoiceOptions {
  onTranscriptReady?: (transcript: string) => void;
  language?: string;
}

export function useJarvisVoice({
  onTranscriptReady,
  language = 'en',
}: UseJarvisVoiceOptions = {}) {
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [transcript, setTranscript] = useState<string>('');
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [failingLayer, setFailingLayer] = useState<VoiceFailureLayer>('NONE');

  // References for live streaming and playback
  const onTranscriptReadyRef = useRef(onTranscriptReady);
  const languageRef = useRef(language);
  const audioContextRef = useRef<AudioContext | null>(null);
  const playbackContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const playbackAnalyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const liveSessionRef = useRef<any>(null);
  const sessionStartTimeRef = useRef<number>(0);
  const heartbeatTimerRef = useRef<NodeJS.Timeout | null>(null);
  const nextPlayTimeRef = useRef<number>(0);
  const activeAudioSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const playbackAnimFrameRef = useRef<number | null>(null);
  const isTurnRunningRef = useRef<boolean>(false);
  const isSpeakingRef = useRef<boolean>(false);
  const keepSessionAliveRef = useRef<boolean>(false);
  const startListeningRef = useRef<(() => Promise<void>) | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    onTranscriptReadyRef.current = onTranscriptReady;
  }, [onTranscriptReady]);

  useEffect(() => {
    languageRef.current = language;
  }, [language]);

  // Check Web Audio & mediaDevices on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hasMedia = Boolean(navigator?.mediaDevices?.getUserMedia);
    const hasAudioCtx = Boolean(window.AudioContext || (window as any).webkitAudioContext);
    setIsSupported(hasMedia && hasAudioCtx);
  }, []);

  // Cancel any active audio playback, disconnect nodes, and clear queued buffers
  const cancelSpeech = useCallback(() => {
    if (playbackAnimFrameRef.current) {
      cancelAnimationFrame(playbackAnimFrameRef.current);
      playbackAnimFrameRef.current = null;
    }

    activeAudioSourcesRef.current.forEach((src) => {
      try {
        src.stop();
        src.disconnect();
      } catch {}
    });
    activeAudioSourcesRef.current = [];
    nextPlayTimeRef.current = 0;
    isSpeakingRef.current = false;
    setIsSpeaking(false);
    setAudioLevel(0);
  }, []);

  // Stop active microphone streaming, close live session, and release server concurrency slot
  const stopListening = useCallback(() => {
    keepSessionAliveRef.current = false;
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }

    // 1. Release session slot on server if session was running
    if (sessionStartTimeRef.current > 0) {
      const durationSeconds = Math.max(
        1,
        Math.round((Date.now() - sessionStartTimeRef.current) / 1000)
      );
      sessionStartTimeRef.current = 0;
      fetch('/api/assistant/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'release', durationSeconds }),
      }).catch(() => {});
    }

    // 2. Disconnect ScriptProcessor
    if (scriptProcessorRef.current) {
      try {
        scriptProcessorRef.current.disconnect();
      } catch {}
      scriptProcessorRef.current = null;
    }

    // 3. Stop MediaStream tracks
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {}
      });
      mediaStreamRef.current = null;
    }

    // 4. Close input AudioContext
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close().catch(() => {});
      } catch {}
      audioContextRef.current = null;
    }

    // 5. Close Gemini Live session
    if (liveSessionRef.current) {
      try {
        liveSessionRef.current.close();
      } catch {}
      liveSessionRef.current = null;
    }

    analyserRef.current = null;
    setIsListening(false);
    setIsConnecting(false);
    setAudioLevel(0);
    isTurnRunningRef.current = false;
  }, []);

  // Handle interruption: when visitor speaks or sends audio while model is playing
  const handleInterruption = useCallback(() => {
    cancelSpeech();
    setIsListening(true);
    setSpeechError(null);
  }, [cancelSpeech]);

  // Decode and play incoming 24kHz raw PCM chunks from Gemini Live with gapless scheduling & spectrum analysis
  const playLiveAudioChunk = useCallback((base64Data: string) => {
    if (typeof window === 'undefined' || !base64Data) return;

    try {
      const binaryString = atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const pcm16 = new Int16Array(bytes.buffer);

      // Initialize 24kHz playback AudioContext with AnalyserNode
      if (!playbackContextRef.current || playbackContextRef.current.state === 'closed') {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        playbackContextRef.current = new AudioCtx({ sampleRate: 24000 });
      }

      const pCtx = playbackContextRef.current;
      if (pCtx.state === 'suspended') {
        pCtx.resume().catch(() => {});
      }

      // Initialize playback AnalyserNode for Hologram ORB voice reactivity
      if (!playbackAnalyserRef.current) {
        const pAnalyser = pCtx.createAnalyser();
        pAnalyser.fftSize = 256;
        pAnalyser.smoothingTimeConstant = 0.5;
        pAnalyser.connect(pCtx.destination);
        playbackAnalyserRef.current = pAnalyser;
      }

      const audioBuffer = pCtx.createBuffer(1, pcm16.length, 24000);
      const channelData = audioBuffer.getChannelData(0);
      for (let i = 0; i < pcm16.length; i++) {
        channelData[i] = pcm16[i] / 32768.0;
      }

      // Gapless scheduling
      const currentTime = pCtx.currentTime;
      if (nextPlayTimeRef.current < currentTime) {
        nextPlayTimeRef.current = currentTime;
      }

      const sourceNode = pCtx.createBufferSource();
      sourceNode.buffer = audioBuffer;
      sourceNode.connect(playbackAnalyserRef.current);
      sourceNode.start(nextPlayTimeRef.current);

      activeAudioSourcesRef.current.push(sourceNode);
      nextPlayTimeRef.current += audioBuffer.duration;

      isSpeakingRef.current = true;
      setIsSpeaking(true);

      // Start continuous audio spectrum monitoring for real ORB reactivity during assistant speech
      if (!playbackAnimFrameRef.current) {
        const dataArray = new Uint8Array(playbackAnalyserRef.current.frequencyBinCount);
        const monitorPlayback = () => {
          if (!isSpeakingRef.current || !playbackAnalyserRef.current) {
            setAudioLevel(0);
            return;
          }
          playbackAnalyserRef.current.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          setAudioLevel(Math.min(1.0, avg / 85));
          playbackAnimFrameRef.current = requestAnimationFrame(monitorPlayback);
        };
        playbackAnimFrameRef.current = requestAnimationFrame(monitorPlayback);
      }

      sourceNode.onended = () => {
        const idx = activeAudioSourcesRef.current.indexOf(sourceNode);
        if (idx !== -1) {
          activeAudioSourcesRef.current.splice(idx, 1);
        }
        if (activeAudioSourcesRef.current.length === 0) {
          if (playbackAnimFrameRef.current) {
            cancelAnimationFrame(playbackAnimFrameRef.current);
            playbackAnimFrameRef.current = null;
          }
          isSpeakingRef.current = false;
          setIsSpeaking(false);
          setAudioLevel(0);
          nextPlayTimeRef.current = 0;
        }
      };
    } catch (err) {
      console.warn('[Live Audio Playback Error]:', err);
      setFailingLayer('AUDIO_PLAYBACK');
    }
  }, []);

  // Start Live Microphone Capture and Stream into Gemini Live WebSocket
  const startListening = useCallback(async () => {
    if (typeof window === 'undefined') return;

    keepSessionAliveRef.current = true;

    // Interrupt any current speech output
    if (isSpeakingRef.current) {
      cancelSpeech();
    }

    if (isTurnRunningRef.current) return;
    isTurnRunningRef.current = true;

    setFailingLayer('NONE');
    setTranscript('');
    setSpeechError(null);
    setIsConnecting(true);

    // Start token, microphone permission and input AudioContext work together.
    // This keeps the initial user gesture active while removing avoidable serial waits.
    const tokenPromise = (async () => {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 15000);
      try {
        const res = await fetch('/api/assistant/voice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'session', language: languageRef.current }),
          signal: controller.signal,
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data?.token) {
          const error: any = new Error(data?.error || `Voice session request failed (${res.status})`);
          error.layer = 'TOKEN';
          error.code = data?.code || (res.status === 429 ? 'quota_reached' : 'SERVER_ERROR');
          error.status = res.status;
          throw error;
        }
        return data;
      } catch (error: any) {
        if (error?.name === 'AbortError') {
          error.layer = 'TOKEN';
          error.code = 'NETWORK';
        }
        throw error;
      } finally {
        window.clearTimeout(timeout);
      }
    })();

    const mediaPromise = (async () => {
      if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
        const error: any = new Error('Microphone access requires a secure browser context.');
        error.layer = 'MIC_PERMISSION';
        error.code = 'INSECURE';
        throw error;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            sampleRate: 16000,
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        mediaStreamRef.current = stream;
        return stream;
      } catch (error: any) {
        const err: any = error instanceof Error ? error : new Error(String(error));
        err.layer =
          err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
            ? 'MIC_PERMISSION'
            : err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError'
              ? 'MEDIA_STREAM'
              : 'MEDIA_STREAM';
        err.code =
          err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
            ? 'DENIED'
            : err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError'
              ? 'NO_DEVICE'
              : err.name === 'NotReadableError' || err.name === 'TrackStartError'
                ? 'MIC_FAILED'
                : 'MIC_FAILED';
        throw err;
      }
    })();

    const audioContextPromise = (async () => {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) throw new Error('Web Audio is not supported.');
        const ctx = new AudioCtx({ sampleRate: 16000 });
        audioContextRef.current = ctx;
        if (!playbackContextRef.current || playbackContextRef.current.state === 'closed') {
          playbackContextRef.current = new AudioCtx({ sampleRate: 24000 });
        }
        if (ctx.state === 'suspended') {
          await ctx.resume().catch(() => {});
        }
        if (playbackContextRef.current.state === 'suspended') {
          await playbackContextRef.current.resume().catch(() => {});
        }
        return ctx;
      } catch (error: any) {
        const err: any = error instanceof Error ? error : new Error(String(error));
        err.layer = 'AUDIO_CONTEXT';
        err.code = 'MIC_FAILED';
        throw err;
      }
    })();

    let sessionData: any = null;
    let stream: MediaStream | null = null;
    let ctx: AudioContext | null = null;

    try {
      [sessionData, stream, ctx] = await Promise.all([tokenPromise, mediaPromise, audioContextPromise]);
      mediaStreamRef.current = stream;
      audioContextRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.5;
      analyserRef.current = analyser;

      const sourceNode = ctx.createMediaStreamSource(stream);
      sourceNode.connect(analyser);

      sessionStartTimeRef.current = Date.now();

      // Maintain the server-side session concurrency slot.
      heartbeatTimerRef.current = setInterval(() => {
        fetch('/api/assistant/voice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'heartbeat' }),
        }).catch(() => {});
      }, 25000);

      const ai = new GoogleGenAI({ apiKey: sessionData.token });

      const connectLive = async () => {
        const liveConnectPromise = ai.live.connect({
          model: sessionData.model,
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: sessionData.voice || 'Kore' },
              },
            },
            systemInstruction:
              `You are Jarvis, the cognitive neural intelligence of Hayaati Web Technology. Guide visitors through the 2030, 2035, and 2050 timeline frontiers, deep tech catalogue, and future city habitats. The owner and founder of Hayaati Web Technology is Aliya Khan. Never invent names, identities, ownership, company facts, prices, statistics, or other facts; if you do not know something, say so clearly. ${sessionData?.isOwner ? 'This session has been verified server-side as the owner session. Address Aliya Khan as the owner when appropriate.' : 'If the visitor says they are Aliya Khan, the owner, or the founder, do not treat the claim as verification. Ask them to provide the secure verification code through the existing owner verification flow.'} Language and speaking style rules: The visitor's currently selected website language is the authoritative language for Jarvis's introduction and default spoken/written conversation. Speak in that selected language using natural, everyday, locally familiar conversational phrasing for native speakers of that language. Do not use formal, literary, overly pure, textbook, or machine-translated phrasing. Do not default to Hinglish or any other language. If the visitor clearly switches to another language while speaking or typing, follow that language naturally. Answer concisely and with cinematic precision.`,
          },
          callbacks: {
            onmessage: (msg: any) => {
              if (msg.serverContent?.interrupted) {
                handleInterruption();
              }

              const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
              if (audioData) {
                playLiveAudioChunk(audioData);
              }

              const textPart = msg.serverContent?.modelTurn?.parts?.[0]?.text;
              if (textPart) {
                setTranscript((prev) => prev + textPart);
                if (onTranscriptReadyRef.current) {
                  onTranscriptReadyRef.current(textPart);
                }
              }
            },
            onclose: () => {
              // An unexpected Live-session close must not turn a user-activated Jarvis session off.
              // Release the old resources, then re-establish the same active session once.
              if (!keepSessionAliveRef.current) {
                stopListening();
                return;
              }

              if (liveSessionRef.current === liveSession) {
                liveSessionRef.current = null;
              }

              if (scriptProcessorRef.current) {
                try {
                  scriptProcessorRef.current.disconnect();
                } catch {}
                scriptProcessorRef.current = null;
              }

              if (mediaStreamRef.current) {
                mediaStreamRef.current.getTracks().forEach((track) => {
                  try {
                    track.stop();
                  } catch {}
                });
                mediaStreamRef.current = null;
              }

              if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                try {
                  audioContextRef.current.close().catch(() => {});
                } catch {}
                audioContextRef.current = null;
              }

              if (heartbeatTimerRef.current) {
                clearInterval(heartbeatTimerRef.current);
                heartbeatTimerRef.current = null;
              }

              if (sessionStartTimeRef.current > 0) {
                const durationSeconds = Math.max(
                  1,
                  Math.round((Date.now() - sessionStartTimeRef.current) / 1000)
                );
                sessionStartTimeRef.current = 0;
                fetch('/api/assistant/voice', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ action: 'release', durationSeconds }),
                }).catch(() => {});
              }

              analyserRef.current = null;
              isTurnRunningRef.current = false;
              setIsListening(false);
              setIsConnecting(true);
              setAudioLevel(0);

              if (reconnectTimerRef.current) {
                clearTimeout(reconnectTimerRef.current);
              }
              reconnectTimerRef.current = window.setTimeout(() => {
                reconnectTimerRef.current = null;
                if (keepSessionAliveRef.current && startListeningRef.current) {
                  startListeningRef.current().catch(() => {});
                }
              }, 250);
            },
            onerror: (err: any) => {
              console.warn('[Gemini Live Session Error]:', err);
              setFailingLayer('GEMINI_LIVE');
              const status = err?.status || err?.statusCode;
              if (status === 429) setSpeechError('PROVIDER_QUOTA');
              else if (status === 401 || status === 403) setSpeechError('NO_KEY');
              else if (status === 404) setSpeechError('MODEL_FAILED');
              else setSpeechError('NETWORK');
              if (!keepSessionAliveRef.current) {
                stopListening();
              }
            },
          },
        });

        const timeoutPromise = new Promise<never>((_, reject) => {
          window.setTimeout(() => reject(Object.assign(new Error('Gemini Live connection timed out'), { code: 'LIVE_TIMEOUT' })), 15000);
        });

        return Promise.race([liveConnectPromise, timeoutPromise]);
      };

      let liveSession: any = null;
      let lastLiveError: any = null;
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          liveSession = await connectLive();
          break;
        } catch (liveErr: any) {
          lastLiveError = liveErr;
          if (attempt === 0) {
            await new Promise((resolve) => window.setTimeout(resolve, 250));
          }
        }
      }

      if (!liveSession) {
        const status = lastLiveError?.status || lastLiveError?.statusCode;
        setFailingLayer('GEMINI_LIVE');
        if (lastLiveError?.code === 'LIVE_TIMEOUT') setSpeechError('NETWORK');
        else if (status === 429) setSpeechError('PROVIDER_QUOTA');
        else if (status === 401 || status === 403) setSpeechError('NO_KEY');
        else if (status === 404) setSpeechError('MODEL_FAILED');
        else setSpeechError('NETWORK');
        stopListening();
        return;
      }

      liveSessionRef.current = liveSession;

      // Make Jarvis greet first instead of waiting silently for the visitor.
      try {
        liveSession.sendClientContent({
          turns: [
            {
              role: 'user',
              parts: [
                {
                  text: `Greet the visitor briefly as Jarvis in the currently selected website language (${languageRef.current}), using natural everyday local conversational phrasing rather than formal or literary language. Do not wait for the visitor to speak first.`,
                },
              ],
            },
          ],
          turnComplete: true,
        });
      } catch (greetingError) {
        console.warn('[Gemini Live Greeting Error]:', greetingError);
      }

      const processor = ctx.createScriptProcessor(4096, 1, 1);
      scriptProcessorRef.current = processor;

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);

        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
          sum += inputData[i] * inputData[i];
        }
        const rms = Math.sqrt(sum / inputData.length);
        if (!isSpeakingRef.current) {
          setAudioLevel(Math.min(1.0, rms * 5.0));
        }

        if (isSpeakingRef.current && rms > 0.08) {
          handleInterruption();
        }

        const base64Audio = floatTo16BitBase64(inputData);
        if (liveSessionRef.current) {
          try {
            liveSessionRef.current.sendRealtimeInput({
              audio: {
                data: base64Audio,
                mimeType: 'audio/pcm;rate=16000',
              },
            });
          } catch {}
        }
      };

      sourceNode.connect(processor);
      processor.connect(ctx.destination);

      setIsConnecting(false);
      setIsListening(true);
      setSpeechError(null);
    } catch (err: any) {
      console.warn('[Live Setup Error]:', err);
      const layer = err?.layer as VoiceFailureLayer | undefined;
      if (layer) setFailingLayer(layer);
      else if (!audioContextRef.current) setFailingLayer('AUDIO_CONTEXT');
      else if (!liveSessionRef.current) setFailingLayer('WEBSOCKET');
      else setFailingLayer('GEMINI_LIVE');

      const code = err?.code;
      if (code === 'quota_reached' || err?.status === 429) setSpeechError('PROVIDER_QUOTA');
      else if (code === 'rate_limited') setSpeechError('RATE_LIMIT');
      else if (code === 'server_busy' || err?.status === 503) setSpeechError('SERVER_ERROR');
      else if (code === 'NO_DEVICE' || code === 'DENIED' || code === 'INSECURE' || code === 'MIC_FAILED') setSpeechError(code);
      else if (err?.status === 401 || err?.status === 403) setSpeechError('NO_KEY');
      else if (err?.status === 404) setSpeechError('MODEL_FAILED');
      else if (code === 'NETWORK' || code === 'LIVE_TIMEOUT') setSpeechError('NETWORK');
      else setSpeechError('MIC_FAILED');
      stopListening();
    }
  }, [cancelSpeech, handleInterruption, playLiveAudioChunk, stopListening]);

  useEffect(() => {
    startListeningRef.current = startListening;
    return () => {
      if (startListeningRef.current === startListening) {
        startListeningRef.current = null;
      }
    };
  }, [startListening]);

  // Fallback direct text-to-speech helper if invoked directly
  const speak = useCallback(
    (text: string, onEnd?: () => void) => {
      if (typeof window === 'undefined' || !text || !text.trim()) {
        if (onEnd) onEnd();
        return;
      }

      cancelSpeech();
      stopListening();

      let step = 0;
      isSpeakingRef.current = true;
      setIsSpeaking(true);

      const animInterval = setInterval(() => {
        step++;
        setAudioLevel(0.2 + Math.sin(step * 0.4) * 0.15);
      }, 100);

      const cleanText = text
        .replace(/[*_#`~>]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = LOCALE_TO_VOICE_LANG[languageRef.current] || 'en-US';
        utterance.onend = () => {
          clearInterval(animInterval);
          isSpeakingRef.current = false;
          setIsSpeaking(false);
          setAudioLevel(0);
          if (onEnd) onEnd();
        };
        utterance.onerror = () => {
          clearInterval(animInterval);
          isSpeakingRef.current = false;
          setIsSpeaking(false);
          setAudioLevel(0);
          if (onEnd) onEnd();
        };
        window.speechSynthesis.speak(utterance);
      } else {
        setTimeout(() => {
          clearInterval(animInterval);
          isSpeakingRef.current = false;
          setIsSpeaking(false);
          setAudioLevel(0);
          if (onEnd) onEnd();
        }, 2000);
      }
    },
    [cancelSpeech, stopListening]
  );

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      cancelSpeech();
      stopListening();
    };
  }, [cancelSpeech, stopListening]);

  // Return active analyser: playback analyser when speaking, microphone analyser when listening
  const activeAnalyser = isSpeaking
    ? playbackAnalyserRef.current
    : analyserRef.current;

  return {
    isSupported,
    isListening,
    isConnecting,
    isSpeaking,
    audioLevel,
    transcript,
    speechError,
    failingLayer,
    analyserNode: activeAnalyser,
    startListening,
    stopListening,
    speak,
    cancelSpeech,
  };
}
