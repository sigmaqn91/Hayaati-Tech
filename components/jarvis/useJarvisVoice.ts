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

    // Interrupt any current speech output
    if (isSpeakingRef.current) {
      cancelSpeech();
    }

    if (isTurnRunningRef.current) return;
    isTurnRunningRef.current = true;

    setFailingLayer('NONE');
    setTranscript('');
    setSpeechError(null);

    // Warm up / Resume AudioContext synchronously during user gesture (critical for Android Chrome autoplay policy)
    try {
      if (!playbackContextRef.current || playbackContextRef.current.state === 'closed') {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        playbackContextRef.current = new AudioCtx({ sampleRate: 24000 });
      }
      if (playbackContextRef.current.state === 'suspended') {
        playbackContextRef.current.resume().catch(() => {});
      }
    } catch (warmupErr) {
      console.warn('[AudioContext Warmup]:', warmupErr);
    }

    // 1. Layer: TOKEN — Request secure ephemeral Gemini Live token from /api/assistant/voice
    let sessionData: any = null;
    try {
      const res = await fetch('/api/assistant/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'session', language: languageRef.current }),
      });

      sessionData = await res.json();
      if (!res.ok || !sessionData?.token) {
        setFailingLayer('TOKEN');
        const errCode = sessionData?.code || 'MIC_FAILED';
        if (errCode === 'quota_reached') setSpeechError('PROVIDER_QUOTA');
        else if (errCode === 'rate_limited') setSpeechError('RATE_LIMIT');
        else if (errCode === 'server_busy') setSpeechError('SERVER_ERROR');
        else setSpeechError('MIC_FAILED');
        isTurnRunningRef.current = false;
        return;
      }
    } catch {
      setFailingLayer('TOKEN');
      setSpeechError('NETWORK');
      isTurnRunningRef.current = false;
      return;
    }

    sessionStartTimeRef.current = Date.now();

    // 2. Start heartbeat to maintain session concurrency slot
    heartbeatTimerRef.current = setInterval(() => {
      fetch('/api/assistant/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'heartbeat' }),
      }).catch(() => {});
    }, 25000);

    // 3. Layer: MIC PERMISSION & MEDIA STREAM — Request microphone MediaStream via getUserMedia
    let stream: MediaStream | null = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;
    } catch (micErr: any) {
      const errName = micErr?.name || '';
      if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError') {
        setFailingLayer('MIC_PERMISSION');
        setSpeechError('DENIED');
      } else if (errName === 'NotFoundError' || errName === 'DevicesNotFoundError') {
        setFailingLayer('MEDIA_STREAM');
        setSpeechError('NO_DEVICE');
      } else {
        setFailingLayer('MEDIA_STREAM');
        setSpeechError('MIC_FAILED');
      }
      stopListening();
      return;
    }

    // 4. Layer: AUDIO CONTEXT — Initialize 16kHz AudioContext & AnalyserNode for Holographic ORB reactivity
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx({ sampleRate: 16000 });
      if (ctx.state === 'suspended') {
        await ctx.resume().catch(() => {});
      }
      audioContextRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.5;
      analyserRef.current = analyser;

      const sourceNode = ctx.createMediaStreamSource(stream);
      sourceNode.connect(analyser);

      // 5. Layer: WEBSOCKET & GEMINI LIVE — Connect to Gemini Live via @google/genai/web using ephemeral token
      const ai = new GoogleGenAI({ apiKey: sessionData.token });
      const liveSession = await ai.live.connect({
        model: sessionData.model,
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: sessionData.voice || 'Kore' },
            },
          },
          systemInstruction:
            'You are J.A.R.V.I.S., the cognitive neural intelligence of Hayaati Web Technology. Guide visitors through the 2030, 2035, and 2050 timeline frontiers, deep tech catalogue, and future city habitats. Answer concisely and with cinematic precision.',
        },
        callbacks: {
          onmessage: (msg: any) => {
            // Handle audio interruption signal from Gemini Live
            if (msg.serverContent?.interrupted) {
              handleInterruption();
            }

            // Stream audio chunk into AudioContext playback (Layer: AUDIO PLAYBACK)
            const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData) {
              playLiveAudioChunk(audioData);
            }

            // Real-time transcript updates if provided by model
            const textPart = msg.serverContent?.modelTurn?.parts?.[0]?.text;
            if (textPart) {
              setTranscript((prev) => prev + textPart);
              if (onTranscriptReadyRef.current) {
                onTranscriptReadyRef.current(textPart);
              }
            }
          },
          onclose: () => {
            stopListening();
          },
          onerror: (err: any) => {
            console.warn('[Gemini Live Session Error]:', err);
            setFailingLayer('GEMINI_LIVE');
            setSpeechError('MIC_FAILED');
            stopListening();
          },
        },
      });

      liveSessionRef.current = liveSession;

      // 6. Set up ScriptProcessor for real-time PCM conversion and streaming
      const processor = ctx.createScriptProcessor(4096, 1, 1);
      scriptProcessorRef.current = processor;

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);

        // Compute RMS level for ORB amplitude reactivity when listening
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
          sum += inputData[i] * inputData[i];
        }
        const rms = Math.sqrt(sum / inputData.length);
        if (!isSpeakingRef.current) {
          setAudioLevel(Math.min(1.0, rms * 5.0));
        }

        // Interruption detection: if visitor speaks loudly while assistant is speaking
        if (isSpeakingRef.current && rms > 0.08) {
          handleInterruption();
        }

        // Convert Float32 samples to 16-bit linear PCM and stream to Gemini Live
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

      setIsListening(true);
      setSpeechError(null);
    } catch (err: any) {
      console.warn('[Live Setup Error]:', err);
      if (!audioContextRef.current) {
        setFailingLayer('AUDIO_CONTEXT');
      } else if (!liveSessionRef.current) {
        setFailingLayer('WEBSOCKET');
      } else {
        setFailingLayer('GEMINI_LIVE');
      }
      setSpeechError('MIC_FAILED');
      stopListening();
    }
  }, [cancelSpeech, handleInterruption, playLiveAudioChunk, stopListening]);

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
