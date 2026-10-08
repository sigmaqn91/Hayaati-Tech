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

function getLanguageEnglishName(languageCode: string): string {
  try {
    const baseCode = languageCode.split('-')[0];
    const displayNames = new Intl.DisplayNames(['en'], { type: 'language' });
    return displayNames.of(baseCode) || languageCode;
  } catch {
    return languageCode;
  }
}

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
  onAssistantTextReady?: (text: string) => void;
  language?: string;
  welcomeMessage?: string;
}

export function useJarvisVoice({
  onTranscriptReady,
  onAssistantTextReady,
  language = 'en',
  welcomeMessage = '',
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
  const onAssistantTextReadyRef = useRef(onAssistantTextReady);
  const languageRef = useRef(language);
  const welcomeMessageRef = useRef(welcomeMessage);
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
  const liveSessionIdRef = useRef<number | null>(null);
  const nextSessionIdRef = useRef<number>(0);
  const rollingTranscriptRef = useRef<string[]>([]);
  const ownerVerifiedRef = useRef<boolean>(false);
  // Live API turnComplete is authoritative for the end of the model turn.
  // Playback can finish before/after the event, so both conditions are required
  // before returning the UI to the user-turn/listening state.
  const turnCompleteRef = useRef<boolean>(false);
  const turnHasAudioRef = useRef<boolean>(false);

  useEffect(() => {
    onTranscriptReadyRef.current = onTranscriptReady;
  }, [onTranscriptReady]);

  useEffect(() => {
    onAssistantTextReadyRef.current = onAssistantTextReady;
  }, [onAssistantTextReady]);

  useEffect(() => {
    languageRef.current = language;
  }, [language]);

  useEffect(() => {
    welcomeMessageRef.current = welcomeMessage;
  }, [welcomeMessage]);

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
    turnCompleteRef.current = false;
    turnHasAudioRef.current = false;
    setIsSpeaking(false);
    setAudioLevel(0);
  }, []);

  // Stop active microphone streaming, close live session, and release server concurrency slot
  const stopListening = useCallback(() => {
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

    // 5. Close Gemini Live session. Invalidate its callback first so a stale
    // onclose/onerror cannot tear down a newer session.
    liveSessionIdRef.current = null;
    if (liveSessionRef.current) {
      const sessionToClose = liveSessionRef.current;
      liveSessionRef.current = null;
      try {
        sessionToClose.close();
      } catch {}
    }

    analyserRef.current = null;
    setIsListening(false);
    setIsConnecting(false);
    setAudioLevel(0);
    isTurnRunningRef.current = false;
    turnCompleteRef.current = false;
    turnHasAudioRef.current = false;
  }, []);

  // Return control to the user only after the Live API has completed the model
  // turn AND all already-scheduled PCM playback has finished.
  const finishCompletedTurnIfReady = useCallback(() => {
    if (!turnCompleteRef.current) return;
    if (activeAudioSourcesRef.current.length > 0) return;

    isSpeakingRef.current = false;
    setIsSpeaking(false);
    setAudioLevel(0);
    nextPlayTimeRef.current = 0;
    turnHasAudioRef.current = false;
    setIsListening(true);
  }, []);

  // Handle a genuine server-side Live API interruption/barge-in event.
  // Do not infer interruptions from microphone volume; Gemini Live's VAD is
  // responsible for deciding whether incoming activity is user speech.
  const handleInterruption = useCallback(() => {
    cancelSpeech();
    turnCompleteRef.current = true;
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

      // A new model audio chunk belongs to an active model turn. A later
      // turnComplete event, together with playback completion, will return the
      // UI to LISTENING.
      turnCompleteRef.current = false;
      turnHasAudioRef.current = true;
      isSpeakingRef.current = true;
      setIsSpeaking(true);
      setIsListening(false);

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
          finishCompletedTurnIfReady();
        }
      };
    } catch (err) {
      console.warn('[Live Audio Playback Error]:', err);
      setFailingLayer('AUDIO_PLAYBACK');
    }
  }, [finishCompletedTurnIfReady]);

  const appendTranscript = useCallback((entry: string) => {
    const clean = entry.replace(/\s+/g, ' ').trim();
    if (!clean) return;
    rollingTranscriptRef.current = [...rollingTranscriptRef.current, clean].slice(-20);
    setTranscript((prev) => (prev ? `${prev} ${clean}` : clean));
    try {
      sessionStorage.setItem('hayaati_jarvis_transcript', JSON.stringify(rollingTranscriptRef.current));
    } catch {}
  }, []);

  const sendLiveText = useCallback((text: string) => {
    const clean = text.trim();
    if (!clean || !liveSessionRef.current) return false;
    try {
      liveSessionRef.current.sendRealtimeInput({ text: clean });
      appendTranscript(`USER: ${clean}`);
      return true;
    } catch (error) {
      console.warn('[Gemini Live Text Error]:', error);
      return false;
    }
  }, [appendTranscript]);

  const notifyOwnerVerified = useCallback(() => {
    ownerVerifiedRef.current = true;
    return sendLiveText('[SYSTEM] Owner Aliya Khan has just been verified server-side. Continue the same conversation, greet her briefly as the owner in the currently selected website language, and remember everything said before.');
  }, [sendLiveText]);

  // Start Live Microphone Capture and Stream into Gemini Live WebSocket
  const startListening = useCallback(async () => {
    if (typeof window === 'undefined') return;

    // Interrupt any current speech output
    if (isSpeakingRef.current) {
      cancelSpeech();
    }

    if (isTurnRunningRef.current) return;
    isTurnRunningRef.current = true;

    setFailingLayer('NONE');
    setSpeechError(null);
    try {
      const stored = JSON.parse(sessionStorage.getItem('hayaati_jarvis_transcript') || '[]');
      if (Array.isArray(stored)) rollingTranscriptRef.current = stored.slice(-20);
    } catch {}
    setIsConnecting(true);

    // Start token, microphone permission and input AudioContext work together.
    // The Live connection begins as soon as the token arrives; mic setup continues in parallel.
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
      // Get the ephemeral token first. Do not wait for microphone setup before
      // starting the Live WebSocket connection.
      sessionData = await tokenPromise;
      const sessionId = ++nextSessionIdRef.current;
      liveSessionIdRef.current = sessionId;

      const ai = new GoogleGenAI({
        apiKey: sessionData.token,
        httpOptions: { apiVersion: 'v1beta' },
      });
      const languageName = getLanguageEnglishName(languageRef.current);

      const connectLive = async () => {
        const config: any = {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: sessionData.voice || 'Capella' },
            },
          },
          systemInstruction:
            `You are Jarvis, the cognitive neural intelligence of Hayaati Web Technology. Guide visitors through the 2030, 2035, and 2050 timeline frontiers, deep tech catalogue, and future city habitats. The owner and founder of Hayaati Web Technology is Aliya Khan. Never invent names, identities, ownership, company facts, prices, statistics, or other facts; if you do not know something, say so clearly. ${sessionData?.isOwner ? 'This session has been verified server-side as the owner session. Address Aliya Khan as the owner when appropriate.' : 'If the visitor says they are Aliya Khan, the owner, or the founder, do not treat the claim as verification. Ask them to provide the secure verification code through the existing owner verification flow.'} STRICT LANGUAGE RULES: The website-selected language is ${languageName}. You MUST speak and write only in ${languageName} for this entire session. Never automatically switch, mix, translate, transliterate, or code-switch into another language because of the visitor's accent, detected input language, pronunciation, context, or your own language detection. Do not use Hinglish or English unless ${languageName} is English. Only change language when the visitor explicitly asks you to translate, speak, or respond in another language. If the visitor asks for another language, follow that explicit request for that response; otherwise immediately return to ${languageName}. Your very first response must use the exact localized website welcome message supplied below. Do not paraphrase or translate it. Localized welcome message: ${JSON.stringify(welcomeMessageRef.current || `Hello! I am Jarvis, your Hayaati Web Technology assistant.`, null, 0)}. Use natural, everyday, locally conversational phrasing native to ${languageName}, not formal, literary, stiff, or machine-translated phrasing. Answer concisely and with cinematic precision.`,
        };

        const liveConnectPromise = ai.live.connect({
          model: sessionData.model,
          config,
          callbacks: {
            onmessage: (msg: any) => {
              if (liveSessionIdRef.current !== sessionId) return;
              if (msg.serverContent?.interrupted) {
                handleInterruption();
              }

              if (msg.serverContent?.turnComplete) {
                turnCompleteRef.current = true;
                finishCompletedTurnIfReady();
                // The configured response modality is AUDIO, so normal model turns
                // will set turnHasAudioRef. If a turn completes without audio at all,
                // allow the UI to recover on the next task rather than remaining stuck.
                if (!turnHasAudioRef.current) {
                  window.setTimeout(() => {
                    if (liveSessionIdRef.current === sessionId && turnCompleteRef.current && !turnHasAudioRef.current) {
                      setIsSpeaking(false);
                      setAudioLevel(0);
                      setIsListening(true);
                    }
                  }, 0);
                }
              }

              // Process every audio part in the model turn. The previous working
              // Assistant processed all returned PCM chunks; reading only parts[0]
              // can silently drop later chunks and make Jarvis audio sound cut off.
              const parts = msg.serverContent?.modelTurn?.parts;
              if (Array.isArray(parts)) {
                for (const part of parts) {
                  if (part?.inlineData?.data) {
                    playLiveAudioChunk(part.inlineData.data);
                  }
                }
              }

              const inputText = msg.serverContent?.inputTranscription?.text || msg.serverContent?.inputAudioTranscription?.text;
              if (inputText) {
                appendTranscript(`USER: ${inputText}`);
                onTranscriptReadyRef.current?.(inputText);
              }

              const outputText = msg.serverContent?.outputTranscription?.text || msg.serverContent?.outputAudioTranscription?.text;
              const textPart = msg.serverContent?.modelTurn?.parts?.[0]?.text;
              const assistantText = outputText || textPart;
              if (assistantText) {
                appendTranscript(`JARVIS: ${assistantText}`);
                onAssistantTextReadyRef.current?.(assistantText);
              }
            },
            onclose: (event: any) => {
              if (liveSessionIdRef.current !== sessionId) return;
              const closeCode = event?.code;
              const closeReason = event?.reason || '';
              const ageMs = Date.now() - sessionOpenedAt;
              console.warn(`[Gemini Live Session Closed] code=${closeCode ?? 'unknown'} reason=${closeReason || 'none'}`);
              if (ageMs < 5000) {
                setSpeechError(closeCode === 401 || closeCode === 403 ? 'NO_KEY' : 'NETWORK');
                setFailingLayer('GEMINI_LIVE');
              }
              stopListening();
            },
            onerror: (err: any) => {
              if (liveSessionIdRef.current !== sessionId) return;
              console.warn('[Gemini Live Session Error]:', err);
              setFailingLayer('GEMINI_LIVE');
              const status = err?.status || err?.statusCode;
              if (status === 429) setSpeechError('PROVIDER_QUOTA');
              else if (status === 401 || status === 403) setSpeechError('NO_KEY');
              else if (status === 404) setSpeechError('MODEL_FAILED');
              else setSpeechError('NETWORK');
              stopListening();
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
      const sessionOpenedAt = Date.now();
      try {
        liveSession = await connectLive();
      } catch (liveErr: any) {
        lastLiveError = liveErr;
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

      // The Live session is authoritative from this point onward. Store it before
      // waiting on mic setup so stale callbacks cannot affect another session.
      liveSessionRef.current = liveSession;
      sessionStartTimeRef.current = Date.now();
      heartbeatTimerRef.current = setInterval(() => {
        fetch('/api/assistant/voice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'heartbeat' }),
        }).catch(() => {});
      }, 25000);

      // Preserve conversation across reconnects. Seed via realtime text because this
      // model may restrict sendClientContent to initial history only.
      if (rollingTranscriptRef.current.length > 0) {
        try {
          liveSession.sendRealtimeInput({
            text: `[SYSTEM] Continue this existing conversation. Prior transcript:\n${rollingTranscriptRef.current.join('\n')}`,
          });
        } catch (historyError) {
          console.warn('[Gemini Live History Restore Error]:', historyError);
        }
      }

      // Greet immediately after the session opens, before microphone processor creation.
      // The localized UI welcome string is the single source of truth for the activation greeting.
      try {
        const localizedWelcome = welcomeMessageRef.current.trim();
        liveSession.sendRealtimeInput({
          text: localizedWelcome
            ? `[SYSTEM] Activate Jarvis with the exact localized website welcome message below. Speak it as the first response without paraphrasing, translating, or changing language. Exact welcome message: ${localizedWelcome}`
            : `[SYSTEM] Activate Jarvis with a short self-introduction in ${languageName}. Speak only in the selected website language.`,
        });
      } catch (greetingError) {
        console.warn('[Gemini Live Greeting Error]:', greetingError);
      }

      // Mic and AudioContext work was started in parallel with the Live connection.
      [stream, ctx] = await Promise.all([mediaPromise, audioContextPromise]);
      mediaStreamRef.current = stream;
      audioContextRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.5;
      analyserRef.current = analyser;

      const sourceNode = ctx.createMediaStreamSource(stream);
      sourceNode.connect(analyser);

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

      // ScriptProcessorNode needs an output connection to remain active in some
      // browsers. Route it through a zero-gain node so the microphone is never
      // audibly looped back through the speakers.
      const silentOutput = ctx.createGain();
      silentOutput.gain.value = 0;
      processor.connect(silentOutput);
      silentOutput.connect(ctx.destination);

      setIsConnecting(false);
      // The activation greeting may already be playing because the Live session
      // is connected before microphone setup completes. Do not overwrite SPEAKING
      // with LISTENING while that first response is still active.
      if (!isSpeakingRef.current) {
        setIsListening(true);
      }
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
  }, [cancelSpeech, finishCompletedTurnIfReady, handleInterruption, playLiveAudioChunk, stopListening]);

  // Speak through the existing Live session when one is open; browser TTS is fallback only.
  const speak = useCallback(
    (text: string, onEnd?: () => void) => {
      if (typeof window === 'undefined' || !text || !text.trim()) {
        onEnd?.();
        return;
      }

      if (liveSessionRef.current) {
        const sent = sendLiveText(text);
        if (sent) {
          onEnd?.();
          return;
        }
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
      const cleanText = text.replace(/[*_#`~>]/g, '').replace(/\s+/g, ' ').trim();

      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = LOCALE_TO_VOICE_LANG[languageRef.current] || 'en-US';
        const finish = () => {
          clearInterval(animInterval);
          isSpeakingRef.current = false;
          setIsSpeaking(false);
          setAudioLevel(0);
          onEnd?.();
        };
        utterance.onend = finish;
        utterance.onerror = finish;
        window.speechSynthesis.speak(utterance);
      } else {
        setTimeout(() => {
          clearInterval(animInterval);
          isSpeakingRef.current = false;
          setIsSpeaking(false);
          setAudioLevel(0);
          onEnd?.();
        }, 2000);
      }
    },
    [cancelSpeech, sendLiveText, stopListening]
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
    sendLiveText,
    notifyOwnerVerified,
    cancelSpeech,
  };
}
