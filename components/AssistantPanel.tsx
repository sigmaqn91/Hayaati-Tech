'use client';

import React, { useState, useEffect, useRef, useCallback, useSyncExternalStore } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Mic, MicOff, X, MessageSquare, Send, ChevronDown, Play } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  isError?: boolean;
}

interface AssistantPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const VOICE_SUPPORTED_LANGUAGES = new Set([
  'en', 'hi', 'es', 'fr', 'de', 'ja', 'ko', 'zh', 'ar', 'pt', 'it', 'ru', 'tr', 'id'
]);

function subscribeReducedMotion(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  media.addEventListener('change', callback);
  return () => media.removeEventListener('change', callback);
}

function getReducedMotionSnapshot() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

// Convert Float32Array to 16 kHz signed 16-bit PCM little-endian
function convertTo16kPcm(input: Float32Array, inputSampleRate: number): Int16Array {
  if (inputSampleRate === 16000) {
    const pcm16 = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]));
      pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return pcm16;
  }
  const ratio = inputSampleRate / 16000;
  const newLength = Math.max(1, Math.round(input.length / ratio));
  const pcm16 = new Int16Array(newLength);
  for (let i = 0; i < newLength; i++) {
    const originalIndex = Math.min(Math.floor(i * ratio), input.length - 1);
    const s = Math.max(-1, Math.min(1, input[originalIndex]));
    pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  return pcm16;
}

export function AssistantPanel({ isOpen, onClose }: AssistantPanelProps) {
  const { t, language } = useLanguage();
  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  const [voiceSessionStarted, setVoiceSessionStarted] = useState(false);
  const [voiceState, setVoiceState] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [showTypeSheet, setShowTypeSheet] = useState(false);
  const [lastCaption, setLastCaption] = useState<string>('');
  const [audioLoudness, setAudioLoudness] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Text chat state
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTextLoading, setIsTextLoading] = useState(false);

  // Audio & Live refs
  const liveSessionRef = useRef<any>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const nextPlayTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const voiceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMutedRef = useRef(false);
  const voiceStateRef = useRef<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    voiceStateRef.current = voiceState;
  }, [voiceState]);

  // Scroll lock when opened
  useEffect(() => {
    if (!isOpen) return;
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    document.body.style.overflow = 'hidden';
    if (scrollBarWidth > 0) {
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    }
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [isOpen]);

  // Focus trap & Esc close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Stop output audio playback cleanly
  const stopAudioPlayback = useCallback(() => {
    for (const src of activeSourcesRef.current) {
      try {
        src.stop();
        src.disconnect();
      } catch {}
    }
    activeSourcesRef.current = [];

    if (outputAudioCtxRef.current) {
      nextPlayTimeRef.current = outputAudioCtxRef.current.currentTime;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setAudioLoudness(0);
  }, []);

  // Play model output audio at the exact sample rate returned by the Live API
  const playModelAudioChunk = useCallback(
    async (base64PcmData: string, sampleRate: number) => {
      try {
        if (typeof window === 'undefined') return;
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return;

        if (!outputAudioCtxRef.current || outputAudioCtxRef.current.state === 'closed') {
          outputAudioCtxRef.current = new AudioCtx({ sampleRate });
        }
        const ctx = outputAudioCtxRef.current;
        if (ctx.state === 'suspended') {
          await ctx.resume();
        }

        // Setup AnalyserNode for orb loudness pulsing
        if (!analyserRef.current) {
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 64;
          analyserRef.current = analyser;
          analyser.connect(ctx.destination);
        }

        // Decode 16-bit PCM little-endian
        const binaryStr = window.atob(base64PcmData);
        const bytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }
        const int16 = new Int16Array(bytes.buffer);
        const float32 = new Float32Array(int16.length);
        for (let i = 0; i < int16.length; i++) {
          float32[i] = int16[i] / 32768.0;
        }

        const audioBuffer = ctx.createBuffer(1, float32.length, sampleRate);
        audioBuffer.getChannelData(0).set(float32);

        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(analyserRef.current);

        // Schedule continuous audio playback without clicks or gaps
        const now = ctx.currentTime;
        const startTime = Math.max(now, nextPlayTimeRef.current);
        source.start(startTime);
        nextPlayTimeRef.current = startTime + audioBuffer.duration;

        activeSourcesRef.current.push(source);
        setVoiceState('speaking');

        // Loudness monitor loop
        if (!animationFrameRef.current) {
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          const updateLoudness = () => {
            if (!analyserRef.current) return;
            analyserRef.current.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const average = sum / dataArray.length;
            setAudioLoudness(average / 128);
            animationFrameRef.current = requestAnimationFrame(updateLoudness);
          };
          updateLoudness();
        }

        source.onended = () => {
          const idx = activeSourcesRef.current.indexOf(source);
          if (idx !== -1) {
            activeSourcesRef.current.splice(idx, 1);
          }
          if (activeSourcesRef.current.length === 0 && ctx.currentTime >= nextPlayTimeRef.current - 0.05) {
            if (animationFrameRef.current) {
              cancelAnimationFrame(animationFrameRef.current);
              animationFrameRef.current = null;
            }
            setAudioLoudness(0);
            setVoiceState(isMutedRef.current ? 'idle' : 'listening');
          }
        };
      } catch (err) {
        console.error('Audio chunk playback error:', err);
      }
    },
    []
  );

  // Stop entire voice session and clean up all resources
  const stopVoiceSession = useCallback(() => {
    stopAudioPlayback();

    // 1. Close Live WebSocket session
    if (liveSessionRef.current) {
      try {
        liveSessionRef.current.close();
      } catch {}
      liveSessionRef.current = null;
    }

    // 2. Stop microphone tracks and processor
    if (processorRef.current) {
      try {
        processorRef.current.disconnect();
      } catch {}
      processorRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }
    if (inputAudioCtxRef.current && inputAudioCtxRef.current.state !== 'closed') {
      try {
        inputAudioCtxRef.current.close();
      } catch {}
      inputAudioCtxRef.current = null;
    }

    // 3. Clear session timer
    if (voiceTimeoutRef.current) {
      clearTimeout(voiceTimeoutRef.current);
      voiceTimeoutRef.current = null;
    }

    setVoiceSessionStarted(false);
    setVoiceState('idle');
    setAudioLoudness(0);
  }, [stopAudioPlayback]);

  // Start real-time Gemini Live session
  const startVoiceSession = useCallback(async () => {
    setErrorMessage(null);

    if (!VOICE_SUPPORTED_LANGUAGES.has(language)) {
      setErrorMessage(t.assistant.voiceNotAvailableLang);
      return;
    }

    // Check getUserMedia availability
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setErrorMessage(t.assistant.voiceUnsupported);
      return;
    }

    setVoiceState('thinking');

    try {
      // 1. Request short-lived session token from backend proxy (GEMINI_API_KEY is never exposed)
      const res = await fetch('/api/assistant/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'session', language }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const code = data.code;
        if (code === 'quota_reached') {
          setErrorMessage(t.assistant.errors.quotaReached);
        } else if (code === 'server_busy') {
          setErrorMessage(t.assistant.errors.serverBusy);
        } else if (code === 'voice_not_supported') {
          setErrorMessage(t.assistant.voiceNotAvailableLang);
        } else {
          setErrorMessage(t.assistant.errors.genericError);
        }
        setVoiceState('idle');
        return;
      }

      const sessionData = await res.json();
      const { token, model, voiceName } = sessionData;

      if (!token) {
        setErrorMessage(t.assistant.errors.genericError);
        setVoiceState('idle');
        return;
      }

      // 2. Request user microphone (16 kHz PCM)
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            channelCount: 1,
            sampleRate: 16000,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        micStreamRef.current = stream;
      } catch (micErr: any) {
        setErrorMessage(t.assistant.errors.micBlocked);
        setVoiceState('idle');
        return;
      }

      // 3. Connect to the official Gemini Live API WebSocket via @google/genai/web
      const { GoogleGenAI, Modality } = await import('@google/genai/web');
      const clientAi = new GoogleGenAI({
        apiKey: token,
        httpOptions: { apiVersion: 'v1alpha' },
      });

      const systemInstruction = `
You are the HAYAATI Voice Assistant for Hayaati Web Technology. You speak with a warm, calm, human, and conversational tone with native pronunciation for ${language}.
Guidelines:
- Reply in ${language}.
- Keep responses short, concise, and conversational (1 to 2 sentences max).
- If the visitor speaks in another language, adapt smoothly.
`;

      const session = await clientAi.live.connect({
        model: model || 'gemini-3.8-live',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: voiceName || 'Kore',
              },
            },
          },
          systemInstruction,
        },
        callbacks: {
          onopen: () => {
            setVoiceSessionStarted(true);
            setVoiceState('listening');
          },
          onmessage: (msg: any) => {
            // Check for model speech interruption
            if (msg.serverContent?.interrupted) {
              stopAudioPlayback();
              setVoiceState('listening');
              return;
            }

            // Extract audio and text parts from model turn
            const parts = msg.serverContent?.modelTurn?.parts;
            if (parts && Array.isArray(parts)) {
              for (const part of parts) {
                if (part.inlineData?.data) {
                  const mimeType = part.inlineData.mimeType || 'audio/pcm;rate=24000';
                  const rateMatch = mimeType.match(/rate=(\d+)/);
                  const sampleRate = rateMatch ? parseInt(rateMatch[1], 10) : 24000;
                  playModelAudioChunk(part.inlineData.data, sampleRate);
                }
                if (part.text) {
                  setLastCaption(part.text);
                  const assistantMsg: Message = {
                    id: `assistant-${Date.now()}-${Math.random()}`,
                    sender: 'assistant',
                    text: part.text,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  };
                  setChatMessages((prev) => [...prev, assistantMsg]);
                }
              }
            }
          },
          onerror: (err: any) => {
            console.error('Live WebSocket session error:', err);
            setErrorMessage(t.assistant.errors.networkError);
            stopVoiceSession();
          },
          onclose: (e: any) => {
            if (e.code !== 1000 && voiceSessionStarted) {
              setErrorMessage(t.assistant.errors.networkError);
            }
            stopVoiceSession();
          },
        },
      });

      liveSessionRef.current = session;

      // 4. Capture microphone and stream 16 kHz PCM to Gemini Live session
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const inputCtx = new AudioCtx({ sampleRate: 16000 });
      inputAudioCtxRef.current = inputCtx;
      if (inputCtx.state === 'suspended') {
        await inputCtx.resume();
      }

      const source = inputCtx.createMediaStreamSource(stream);
      const processor = inputCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (isMutedRef.current || voiceStateRef.current === 'speaking') {
          return;
        }

        const inputChannelData = e.inputBuffer.getChannelData(0);

        // Calculate RMS loudness to animate orb during visitor speech
        let sum = 0;
        for (let i = 0; i < inputChannelData.length; i++) {
          sum += inputChannelData[i] * inputChannelData[i];
        }
        const rms = Math.sqrt(sum / inputChannelData.length);
        if (rms > 0.02) {
          setAudioLoudness(Math.min(1, rms * 4));
          if (voiceStateRef.current !== 'listening') {
            setVoiceState('listening');
          }
        } else {
          setAudioLoudness(0);
        }

        // Convert to 16 kHz PCM
        const pcm16 = convertTo16kPcm(inputChannelData, inputCtx.sampleRate);

        // Convert to base64
        let binary = '';
        const bytes = new Uint8Array(pcm16.buffer);
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64Audio = window.btoa(binary);

        // Stream 16 kHz PCM to Gemini Live session
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

      source.connect(processor);
      processor.connect(inputCtx.destination);

      setVoiceSessionStarted(true);
      setVoiceState('listening');

      // Maximum session timeout (3 minutes)
      voiceTimeoutRef.current = setTimeout(() => {
        stopVoiceSession();
        setErrorMessage(t.assistant.errors.sessionEnded);
      }, 180000);
    } catch (err: any) {
      console.error('Failed to start Live session:', err);
      setErrorMessage(t.assistant.errors.genericError);
      stopVoiceSession();
    }
  }, [
    language,
    playModelAudioChunk,
    stopAudioPlayback,
    stopVoiceSession,
    t.assistant.errors,
    t.assistant.voiceNotAvailableLang,
    t.assistant.voiceUnsupported,
    voiceSessionStarted,
  ]);

  const toggleMute = () => {
    if (!voiceSessionStarted) return;
    if (isMuted) {
      setIsMuted(false);
      setVoiceState('listening');
    } else {
      setIsMuted(true);
      setVoiceState('idle');
      setAudioLoudness(0);
    }
  };

  const handleSendText = async () => {
    const text = inputValue.trim();
    if (!text || isTextLoading) return;
    setInputValue('');
    setIsTextLoading(true);
    setErrorMessage(null);

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages((prev) => [...prev, userMsg]);

    // If Live session is currently connected, send text directly through the Live session
    if (liveSessionRef.current) {
      try {
        setVoiceState('thinking');
        liveSessionRef.current.sendClientContent({
          turns: [
            {
              role: 'user',
              parts: [{ text }],
            },
          ],
          turnComplete: true,
        });
        setIsTextLoading(false);
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 50);
        return;
      } catch {
        // Fallback to text chat API
      }
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, language }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrorMessage(data.error || t.assistant.errors.serverBusy);
      } else {
        const data = await res.json();
        const reply = data.reply || '';
        const assistantMsg: Message = {
          id: `assistant-${Date.now()}`,
          sender: 'assistant',
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setChatMessages((prev) => [...prev, assistantMsg]);
        setLastCaption(reply);
      }
    } catch {
      setErrorMessage(t.assistant.errors.networkError);
    } finally {
      setIsTextLoading(false);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  };

  useEffect(() => {
    return () => {
      stopVoiceSession();
    };
  }, [stopVoiceSession]);

  if (!isOpen) return null;

  let stateText = t.assistant.orb.ready;
  if (!voiceSessionStarted) {
    stateText = t.assistant.orb.tapToStart;
  } else if (voiceState === 'listening') {
    stateText = t.assistant.orb.listening;
  } else if (voiceState === 'thinking') {
    stateText = t.assistant.orb.thinking;
  } else if (voiceState === 'speaking') {
    stateText = t.assistant.orb.speaking;
  }

  const orbScale =
    prefersReducedMotion || voiceState !== 'speaking'
      ? 1
      : 1 + Math.min(audioLoudness * 0.25, 0.35);
  const glowSpread =
    prefersReducedMotion || voiceState !== 'speaking'
      ? '40px'
      : `${40 + Math.min(audioLoudness * 60, 80)}px`;

  const allMessages: Message[] = [
    {
      id: 'welcome',
      sender: 'assistant',
      text: t.assistant.welcomeMessage,
      timestamp: 'SYS//00:01',
    },
    ...chatMessages,
  ];

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-label={t.assistant.panelTitle}
      className="fixed inset-0 z-50 flex items-center justify-center p-0 bg-[#05070a] select-none"
    >
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[#05070a] pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0d1524_1px,transparent_1px),linear-gradient(to_bottom,#0d1524_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-35" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#091322_0%,#05070a_80%)] opacity-85" />
      </div>

      {/* Top Header Bar */}
      <div className="absolute top-0 left-0 right-0 h-16 flex items-center justify-between px-6 z-20 border-b border-[#1e293b]/60 bg-[#070a0f]/90">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#38e8ff] shadow-[0_0_10px_#38e8ff]" />
          <span className="font-mono text-xs tracking-widest text-slate-200 uppercase font-bold">
            HAYAATI // {t.assistant.cognitiveLink}
          </span>
          <span className="text-[10px] font-mono text-[#38e8ff]/60 hidden sm:inline">
            [{language.toUpperCase()}]
          </span>
        </div>
        <button
          onClick={() => {
            stopVoiceSession();
            onClose();
          }}
          className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
          aria-label={t.common.close}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* CENTER GLOSSY ORB CONTAINER */}
      <div className="relative z-10 flex flex-col items-center justify-center max-w-md w-full px-6 py-12 text-center">
        {voiceState === 'listening' && !prefersReducedMotion && (
          <div className="absolute w-[240px] h-[240px] sm:w-[280px] sm:h-[280px] pointer-events-none">
            <div className="absolute inset-0 rounded-full border border-[#38e8ff]/40 animate-ping opacity-75" />
            <div className="absolute -inset-4 rounded-full border border-[#818cf8]/30 animate-pulse opacity-50" />
          </div>
        )}

        <div
          role="button"
          tabIndex={0}
          onClick={!voiceSessionStarted ? startVoiceSession : undefined}
          aria-label={!voiceSessionStarted ? t.assistant.orb.tapToStart : stateText}
          className={`relative w-[210px] h-[210px] sm:w-[260px] sm:h-[260px] rounded-full cursor-pointer transition-transform duration-150 flex items-center justify-center ${
            !voiceSessionStarted ? 'hover:scale-105' : ''
          }`}
          style={{
            transform: `scale(${orbScale})`,
            background:
              'radial-gradient(circle at 35% 30%, #ffffff 0%, #38e8ff 28%, #1e40af 65%, #050b18 95%)',
            boxShadow: `0 0 ${glowSpread} rgba(56, 232, 255, 0.45), 0 0 100px rgba(129, 140, 248, 0.25), inset -10px -10px 30px rgba(0, 0, 0, 0.8), inset 10px 10px 25px rgba(255, 255, 255, 0.4)`,
          }}
        >
          {voiceState === 'thinking' && !prefersReducedMotion && (
            <div className="absolute inset-0 rounded-full animate-spin [animation-duration:3s] opacity-70 bg-[conic-gradient(from_0deg,transparent_0deg,#38e8ff_120deg,transparent_180deg,#818cf8_300deg,transparent_360deg)] pointer-events-none mix-blend-screen" />
          )}

          {voiceState === 'idle' && !prefersReducedMotion && (
            <div className="absolute inset-2 rounded-full animate-pulse [animation-duration:4s] opacity-40 bg-[radial-gradient(circle_at_40%_40%,#ffffff_0%,transparent_60%)] pointer-events-none" />
          )}

          {!voiceSessionStarted && (
            <div className="absolute inset-0 rounded-full flex flex-col items-center justify-center bg-black/35 hover:bg-black/20 transition-colors">
              <Play className="w-12 h-12 text-white fill-white drop-shadow-[0_0_15px_rgba(56,232,255,0.8)] ml-1" />
              <span className="font-mono text-xs uppercase tracking-widest text-[#38e8ff] mt-2 font-bold">
                {t.assistant.orb.start}
              </span>
            </div>
          )}
        </div>

        {/* State indicator line */}
        <div className="mt-8 flex flex-col items-center gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0b0f17] border border-[#1e293b]">
            <span
              className={`w-2 h-2 rounded-full ${
                voiceState === 'listening'
                  ? 'bg-emerald-400 animate-pulse'
                  : voiceState === 'speaking'
                  ? 'bg-[#38e8ff] animate-ping'
                  : voiceState === 'thinking'
                  ? 'bg-amber-400 animate-spin'
                  : 'bg-slate-500'
              }`}
            />
            <span className="font-mono text-xs font-semibold tracking-wider text-slate-200">
              {stateText}
            </span>
          </div>

          {lastCaption && (
            <p className="mt-3 text-sm text-slate-300 max-w-sm line-clamp-3 leading-relaxed font-sans px-2">
              {lastCaption}
            </p>
          )}

          {errorMessage && (
            <p className="mt-2 text-xs font-mono text-rose-400 max-w-sm">
              {errorMessage}
            </p>
          )}
        </div>
      </div>

      {/* CONTROLS AT BOTTOM */}
      <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center gap-6 z-20 px-6">
        {/* Control 1: Mute */}
        <button
          onClick={toggleMute}
          disabled={!voiceSessionStarted}
          className={`flex flex-col items-center gap-1.5 p-3 min-h-[52px] min-w-[52px] rounded-full border transition-colors cursor-pointer ${
            !voiceSessionStarted
              ? 'opacity-40 cursor-not-allowed border-[#1e293b] bg-[#0b0f17] text-slate-500'
              : isMuted
              ? 'bg-rose-500/20 text-rose-400 border-rose-500 hover:bg-rose-500/30'
              : 'bg-[#0b0f17] text-[#38e8ff] border-[#38e8ff]/50 hover:bg-[#38e8ff]/10 hover:border-[#38e8ff]'
          }`}
          aria-label={isMuted ? t.assistant.unmuteMic : t.assistant.muteMic}
        >
          {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          <span className="text-[10px] font-mono text-slate-400">
            {isMuted ? t.assistant.mutedLabel : t.assistant.micLabel}
          </span>
        </button>

        {/* Control 2: Type instead */}
        <button
          onClick={() => setShowTypeSheet(true)}
          className="flex flex-col items-center gap-1.5 px-6 py-3 min-h-[52px] rounded-full bg-[#0b0f17] text-slate-200 border border-[#1e293b] hover:border-[#38e8ff] hover:text-[#38e8ff] transition-colors cursor-pointer"
          aria-label={t.assistant.typeInstead}
        >
          <MessageSquare className="w-5 h-5 text-[#38e8ff]" />
          <span className="text-[10px] font-mono tracking-wider uppercase font-semibold">
            {t.assistant.typeInstead}
          </span>
        </button>

        {/* Control 3: End Session */}
        <button
          onClick={stopVoiceSession}
          disabled={!voiceSessionStarted}
          className={`flex flex-col items-center gap-1.5 p-3 min-h-[52px] min-w-[52px] rounded-full border transition-colors cursor-pointer ${
            !voiceSessionStarted
              ? 'opacity-40 cursor-not-allowed border-[#1e293b] bg-[#0b0f17] text-slate-500'
              : 'bg-rose-950/40 text-rose-300 border-rose-500/50 hover:bg-rose-900/60 hover:border-rose-400'
          }`}
          aria-label={t.assistant.endSession}
        >
          <X className="w-5 h-5" />
          <span className="text-[10px] font-mono text-rose-300/80">
            {t.assistant.endLabel}
          </span>
        </button>
      </div>

      {/* SLIDE-OVER TYPE-INSTEAD TEXT SHEET */}
      {showTypeSheet && (
        <div
          className="absolute inset-0 z-30 bg-[#05070a]/95 backdrop-blur-md flex flex-col justify-between"
          style={{ overscrollBehavior: 'contain' }}
        >
          {/* Sheet Header */}
          <div className="h-16 px-6 border-b border-[#1e293b] flex items-center justify-between bg-[#070a0f]">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#38e8ff]" />
              <span className="font-mono text-xs uppercase tracking-widest text-slate-200 font-bold">
                {t.assistant.panelTitle}
              </span>
            </div>
            <button
              onClick={() => setShowTypeSheet(false)}
              className="p-2 text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-mono"
              aria-label={t.assistant.returnToOrb}
            >
              <span>{t.assistant.returnToOrb}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Log */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {allMessages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-[10px] font-mono text-[#38e8ff]">
                      {isUser ? t.assistant.userTag : t.assistant.assistantTag}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {msg.timestamp}
                    </span>
                  </div>
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] p-3.5 text-sm font-sans leading-relaxed ${
                      isUser
                        ? 'bg-[#1e293b] text-white border border-[#38e8ff]/30'
                        : 'bg-[#0b0f17] text-slate-200 border border-[#1e293b]'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}
            {isTextLoading && (
              <div className="flex flex-col items-start">
                <div className="p-3 bg-[#0b0f17] border border-[#1e293b] text-xs font-mono text-[#38e8ff] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#38e8ff] animate-ping" />
                  <span>{t.assistant.orb.thinking}</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div className="px-4 py-2 border-t border-[#1e293b] bg-[#070a0f] flex gap-2 overflow-x-auto shrink-0">
            {t.assistant.chips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputValue(chip);
                  textInputRef.current?.focus();
                }}
                className="whitespace-nowrap px-3 py-1.5 text-xs font-mono bg-[#0b0f17] border border-[#1e293b] text-slate-300 hover:border-[#38e8ff] hover:text-[#38e8ff] transition-colors cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendText();
            }}
            className="p-3 border-t border-[#1e293b] bg-[#0b0f17] flex items-center gap-2 shrink-0"
            style={{
              paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))',
            }}
          >
            <input
              ref={textInputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={t.assistant.inputPlaceholder}
              style={{ fontSize: '16px' }}
              className="flex-1 px-4 py-2.5 bg-[#05070a] border border-[#1e293b] text-base sm:text-sm font-mono text-white focus:outline-none focus:border-[#38e8ff] min-h-[44px]"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTextLoading}
              className="px-5 py-2.5 bg-[#38e8ff] text-[#05070a] font-mono text-xs font-bold uppercase min-h-[44px] flex items-center gap-1.5 hover:bg-[#38e8ff]/90 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{t.assistant.sendBtn}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
