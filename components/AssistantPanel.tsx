'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Bot, Mic, MicOff, Send, X, AlertTriangle, Sparkles, Volume2, Shield } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
}

interface AssistantPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AssistantPanel({ isOpen, onClose }: AssistantPanelProps) {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: t.assistant.welcomeMessage,
      timestamp: 'SYS//00:01',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<unknown>(null);
  const voiceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Esc key closes modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Speak text using browser speech synthesis (never autoplays without user interaction)
  const speakResponse = useCallback((text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 0.95;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Speech synthesis error
    }
  }, []);

  // Send prompt to server-side Gemini API
  const handleSendMessage = useCallback(async (textToSend: string, isFromVoice = false) => {
    const query = textToSend.trim();
    if (!query || isLoading) return;

    setErrorMessage(null);
    const userMsg: Message = {
      id: String(Date.now()),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: messages.slice(-4).map((m) => ({
            role: m.sender === 'user' ? 'user' : 'model',
            text: m.text,
          })),
        }),
      });

      const contentType = res.headers.get('content-type') || '';
      let data: { reply?: string; error?: string } = {};

      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        throw new Error(
          `Server returned an invalid HTML response (${res.status}). Please check server logs and configuration.`
        );
      }

      if (!res.ok) {
        throw new Error(data.error || `Server responded with status ${res.status}`);
      }

      if (!data.reply) {
        throw new Error('No reply content received from the assistant.');
      }

      const replyMsg: Message = {
        id: String(Date.now() + 1),
        sender: 'assistant',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, replyMsg]);

      if (isFromVoice || voiceActive) {
        speakResponse(data.reply);
      }
    } catch (err: unknown) {
      let msg = err instanceof Error ? err.message : 'Transmission error. Please try again.';
      // Clean up raw JSON error messages if any
      if (msg.includes('{"error"') || msg.startsWith('{')) {
        msg = 'The cognitive engine is temporarily unavailable. Please retry in a few moments.';
      }
      setErrorMessage(msg);
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          sender: 'system',
          text: `[ALERT]: ${msg}`,
          timestamp: 'SYS//ERR',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, messages, voiceActive, speakResponse]);

  // Voice Session Management
  const stopVoice = useCallback(() => {
    setVoiceActive(false);
    setVoiceStatus('');
    if (voiceTimerRef.current) {
      clearTimeout(voiceTimerRef.current);
      voiceTimerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        (recognitionRef.current as { stop: () => void }).stop();
      } catch {
        // Ignore
      }
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const startVoice = () => {
    setErrorMessage(null);

    // Check browser support
    type SpeechRecognitionConstructor = new () => unknown;
    const windowWithSpeech = window as unknown as {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };

    const SpeechRecognitionClass =
      windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setErrorMessage(t.assistant.notSupportedWarning);
      return;
    }

    try {
      const recognition = new (SpeechRecognitionClass as unknown as {
        new (): {
          continuous: boolean;
          interimResults: boolean;
          lang: string;
          onstart: () => void;
          onresult: (e: { results: Array<Array<{ transcript: string }>> }) => void;
          onerror: (e: { error: string }) => void;
          onend: () => void;
          start: () => void;
          stop: () => void;
        };
      })();
      recognitionRef.current = recognition;

      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setVoiceActive(true);
        setVoiceStatus(t.assistant.voiceListening);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setVoiceStatus('Processing transmission...');
          handleSendMessage(transcript, true);
        }
      };

      recognition.onerror = (event) => {
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setErrorMessage(t.assistant.micDeniedWarning);
        } else if (event.error !== 'no-speech') {
          setErrorMessage(`Audio error: ${event.error}`);
        }
        stopVoice();
      };

      recognition.onend = () => {
        setVoiceActive(false);
        setVoiceStatus('');
      };

      recognition.start();

      // Cost Protection: Max 3-minute voice session limit
      voiceTimerRef.current = setTimeout(() => {
        stopVoice();
        setErrorMessage('Voice link closed: Maximum session duration (3 minutes) reached.');
      }, 180000);
    } catch {
      setErrorMessage('Could not initialize microphone audio pipeline.');
      stopVoice();
    }
  };

  useEffect(() => {
    return () => {
      stopVoice();
    };
  }, [stopVoice]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="assistant-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl bg-[#0b0f17] border border-[#38e8ff]/60 shadow-[0_0_35px_rgba(56,232,255,0.25)] flex flex-col h-[640px] max-h-[90vh] hud-frame">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e293b] bg-[#070a0f]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[#05070a] border border-[#38e8ff] flex items-center justify-center text-[#38e8ff]">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 id="assistant-title" className="font-mono text-xs font-bold text-white tracking-widest uppercase">
                {t.assistant.panelTitle}
              </h3>
              <span className="font-mono text-[10px] text-[#38e8ff]/70 tracking-wider">
                COGNITIVE HORIZON // 2030-2050
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Voice Link Button */}
            <button
              onClick={voiceActive ? stopVoice : startVoice}
              className={`flex items-center gap-1.5 px-3 py-1.5 min-h-[40px] text-xs font-mono uppercase tracking-wider border transition-colors cursor-pointer ${
                voiceActive
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500 animate-pulse'
                  : 'bg-[#070a0f] text-[#38e8ff] border-[#38e8ff]/40 hover:bg-[#38e8ff]/10'
              }`}
              title={voiceActive ? 'Disconnect microphone' : 'Connect real-time voice speech'}
            >
              {voiceActive ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">
                {voiceActive ? t.assistant.voiceStopBtn : t.assistant.voiceBtn}
              </span>
            </button>

            <button
              onClick={onClose}
              className="p-2 min-h-[40px] min-w-[40px] flex items-center justify-center text-slate-400 hover:text-white"
              aria-label="Close assistant"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cost Protection / Safety Banner */}
        <div className="px-5 py-2 bg-[#070a0f] border-b border-[#1e293b] flex items-center justify-between text-[10px] font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3 h-3 text-[#38e8ff]" />
            <span>Server Cost Protected: Rate-limited per visitor</span>
          </div>
          <span className="text-slate-500">SESSION: ACTIVE</span>
        </div>

        {/* Error Alert if any */}
        {errorMessage && (
          <div className="px-5 py-2.5 bg-rose-950/40 border-b border-rose-900/60 text-xs text-rose-300 font-mono flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="flex-1">{errorMessage}</span>
          </div>
        )}

        {/* Voice Active Status */}
        {voiceActive && (
          <div className="px-5 py-2 bg-[#38e8ff]/10 border-b border-[#38e8ff]/30 text-xs text-[#38e8ff] font-mono flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#38e8ff] animate-ping" />
              <span>{voiceStatus || t.assistant.voiceListening}</span>
            </div>
            <Volume2 className="w-4 h-4 animate-pulse" />
          </div>
        )}

        {/* Chat Message Scroll Area */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-[#080b11]">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const isSystem = msg.sender === 'system';

            if (isSystem) {
              return (
                <div key={msg.id} className="p-3 bg-red-950/20 border border-red-900/40 text-xs font-mono text-red-300">
                  {msg.text}
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[85%] ${
                  isUser ? 'ml-auto' : 'mr-auto'
                }`}
              >
                <div className="text-[10px] font-mono text-slate-500 mb-1 flex items-center gap-1">
                  <span>{isUser ? 'VISITOR' : 'HAYAATI COGNITIVE NODE'}</span>
                  <span>{'//'}</span>
                  <span>{msg.timestamp}</span>
                </div>
                <div
                  className={`p-4 text-xs sm:text-sm font-sans leading-relaxed border ${
                    isUser
                      ? 'bg-[#111723] border-[#38e8ff]/40 text-slate-100'
                      : 'bg-[#05070a] border-[#1e293b] text-slate-200 shadow-[0_0_15px_rgba(0,0,0,0.5)]'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs font-mono text-[#38e8ff] p-3 bg-[#05070a] border border-[#1e293b] max-w-xs">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>Reasoning across 2030-2050 timeline...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputValue);
          }}
          className="p-4 bg-[#070a0f] border-t border-[#1e293b] flex items-center gap-3"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={t.assistant.inputPlaceholder}
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-[#05070a] border border-[#1e293b] text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-[#38e8ff] min-h-[44px]"
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="px-5 py-3 min-h-[44px] bg-[#38e8ff] text-[#05070a] font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#38e8ff]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>{t.assistant.sendBtn}</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
