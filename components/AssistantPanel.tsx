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

  // Audio / Speech refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const activeSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);
  const voiceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  // Stop audio playback cleanly
  const stopAudioPlayback = useCallback(() => {
    if (activeSourceRef.current) {
      try {
        activeSourceRef.current.stop();
        activeSourceRef.current.disconnect();
      } catch {}
      activeSourceRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setAudioLoudness(0);
  }, []);

  // Play native audio from Gemini
  const playNativeAudio = useCallback(
    async (base64Data: string) => {
      try {
        if (typeof window === 'undefined') return;
        stopAudioPlayback();
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return;
        if (!audioContextRef.current) {
          audioContextRef.current = new AudioCtx({ sampleRate: 24000 });
        }
        const ctx = audioContextRef.current;
        if (ctx.state === 'suspended') {
          await ctx.resume();
        }

        // Decode base64 to ArrayBuffer
        const binaryStr = window.atob(base64Data);
        const bytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }
        const audioBuffer = await ctx.decodeAudioData(bytes.buffer.slice(0));
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;

        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        analyserRef.current = analyser;

        source.connect(analyser);
        analyser.connect(ctx.destination);
        activeSourceRef.current = source;

        setVoiceState('speaking');

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
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

        source.onended = () => {
          stopAudioPlayback();
          setVoiceState('idle');
          if (voiceSessionStarted && !isMuted && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch {}
          }
        };
        source.start(0);
      } catch (err) {
        console.error('Failed to decode or play native audio:', err);
        stopAudioPlayback();
        setVoiceState('idle');
      }
    },
    [stopAudioPlayback, voiceSessionStarted, isMuted]
  );

  // Send voice query to server proxy
  const sendVoiceQuery = useCallback(
    async (spokenText: string) => {
      setVoiceState('thinking');
      setLastCaption(`“${spokenText}”`);
      setErrorMessage(null);

      const userMsg: Message = {
        id: `user-${Date.now()}`,
        sender: 'user',
        text: spokenText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, userMsg]);

      try {
        const res = await fetch('/api/assistant/voice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: spokenText, language }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setErrorMessage(data.error || t.assistant.errors.serverBusy);
          setVoiceState('idle');
          return;
        }

        const data = await res.json();
        const replyText = data.replyText || '';
        if (replyText) {
          setLastCaption(replyText);
          const assistantMsg: Message = {
            id: `assistant-${Date.now()}`,
            sender: 'assistant',
            text: replyText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setChatMessages((prev) => [...prev, assistantMsg]);
        }

        if (data.audioData) {
          await playNativeAudio(data.audioData);
        } else {
          setVoiceState('idle');
        }
      } catch {
        setErrorMessage(t.assistant.errors.networkError);
        setVoiceState('idle');
      }
    },
    [language, playNativeAudio, t.assistant.errors]
  );

  // Stop voice recognition session
  const stopVoiceSession = useCallback(() => {
    stopAudioPlayback();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    if (voiceTimeoutRef.current) {
      clearTimeout(voiceTimeoutRef.current);
      voiceTimeoutRef.current = null;
    }
    setVoiceSessionStarted(false);
    setVoiceState('idle');
  }, [stopAudioPlayback]);

  // Start voice session on user gesture
  const startVoiceSession = useCallback(() => {
    setErrorMessage(null);
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx && !audioContextRef.current) {
      audioContextRef.current = new AudioCtx({ sampleRate: 24000 });
    }
    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }

    if (!VOICE_SUPPORTED_LANGUAGES.has(language)) {
      setErrorMessage(t.assistant.voiceNotAvailableLang);
      return;
    }

    const windowWithSpeech = window as any;
    const SpeechRecognitionClass =
      windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setErrorMessage(t.assistant.voiceUnsupported);
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang =
        language === 'hi'
          ? 'hi-IN'
          : language === 'ur'
          ? 'ur-PK'
          : language === 'ar'
          ? 'ar-SA'
          : language === 'bn'
          ? 'bn-BD'
          : language === 'fr'
          ? 'fr-FR'
          : language === 'de'
          ? 'de-DE'
          : language === 'es'
          ? 'es-ES'
          : 'en-US';

      recognition.onstart = () => {
        setVoiceSessionStarted(true);
        setVoiceState('listening');
      };
      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript;
        if (transcript) {
          sendVoiceQuery(transcript);
        }
      };
      recognition.onerror = (event: any) => {
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setErrorMessage(t.assistant.errors.micBlocked);
          stopVoiceSession();
        } else if (event.error === 'no-speech') {
          setVoiceState('idle');
        } else {
          setVoiceState('idle');
        }
      };
      recognition.start();

      voiceTimeoutRef.current = setTimeout(() => {
        stopVoiceSession();
        setErrorMessage(t.assistant.errors.sessionEnded);
      }, 180000);
    } catch {
      setErrorMessage(t.assistant.errors.genericError);
      stopVoiceSession();
    }
  }, [language, sendVoiceQuery, stopVoiceSession, t.assistant.errors, t.assistant.voiceNotAvailableLang, t.assistant.voiceUnsupported]);

  const toggleMute = () => {
    if (!voiceSessionStarted) return;
    if (isMuted) {
      setIsMuted(false);
      try {
        recognitionRef.current?.start();
        setVoiceState('listening');
      } catch {}
    } else {
      setIsMuted(true);
      try {
        recognitionRef.current?.stop();
      } catch {}
      setVoiceState('idle');
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

        {/* Control 3: End session */}
        <button
          onClick={() => {
            stopVoiceSession();
            onClose();
          }}
          className="flex flex-col items-center gap-1.5 p-3 min-h-[52px] min-w-[52px] rounded-full bg-[#0b0f17] text-slate-400 border border-[#1e293b] hover:border-rose-500 hover:text-rose-400 transition-colors cursor-pointer"
          aria-label={t.assistant.endSession}
        >
          <X className="w-5 h-5" />
          <span className="text-[10px] font-mono text-slate-400">{t.assistant.endLabel}</span>
        </button>
      </div>

      {/* SLIDE-UP TEXT CHAT SHEET */}
      {showTypeSheet && (
        <div
          className="absolute inset-x-0 bottom-0 top-16 z-30 bg-[#070a0f] border-t border-[#38e8ff]/50 shadow-2xl flex flex-col transition-transform duration-250 animate-in slide-in-from-bottom"
          style={{ overscrollBehavior: 'contain' }}
        >
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#1e293b] bg-[#0b0f17] shrink-0">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#38e8ff]" />
              <span className="font-mono text-xs text-white uppercase tracking-wider">
                {t.assistant.panelTitle} // {t.assistant.typeInstead}
              </span>
            </div>
            <button
              onClick={() => setShowTypeSheet(false)}
              className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
              aria-label={t.assistant.returnToOrb}
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#05070a]">
            {allMessages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] p-3.5 text-xs sm:text-sm font-sans leading-relaxed border ${
                      isUser
                        ? 'bg-[#111723] border-[#38e8ff]/40 text-slate-100'
                        : 'bg-[#0b0f17] border-[#1e293b] text-slate-200'
                    }`}
                  >
                    <div className="text-[10px] font-mono text-slate-500 mb-1">
                      {isUser ? t.assistant.userTag : t.assistant.assistantTag} // {msg.timestamp}
                    </div>
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
              );
            })}
            {isTextLoading && (
              <div className="flex justify-start">
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
