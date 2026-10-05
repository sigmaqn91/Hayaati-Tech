'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mic,
  MicOff,
  Send,
  X,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  Activity,
  Terminal,
  Volume2,
  VolumeX,
  Search,
  Settings,
  RefreshCw,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { HologramCanvas, AssistantVisualState } from './HologramCanvas';
import { useJarvisVoice } from './useJarvisVoice';

interface JarvisOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  language?: string;
}

export const JarvisOverlay: React.FC<JarvisOverlayProps> = ({
  isOpen,
  onClose,
  language = 'en',
}) => {
  // Assistant Mode & States
  const [visualState, setVisualState] = useState<AssistantVisualState>('idle');
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [bootCompleted, setBootCompleted] = useState<boolean>(false);
  const [bootLogs, setBootLogs] = useState<string[]>([]);

  // Input & Messages
  const [inputQuery, setInputQuery] = useState<string>('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [audioMuted, setAudioMuted] = useState<boolean>(false);

  // Verification Prompt Modal
  const [showVerifyModal, setShowVerifyModal] = useState<boolean>(false);
  const [verifyCode, setVerifyCode] = useState<string>('');
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  // Admin Slide-in Panel
  const [showAdminPanel, setShowAdminPanel] = useState<boolean>(false);
  const [adminData, setAdminData] = useState<any>(null);
  const [adminSearch, setAdminSearch] = useState<string>('');
  const [profileEdit, setProfileEdit] = useState({
    about: '',
    preferences: '',
    businessNotes: '',
  });
  const [profileSaved, setProfileSaved] = useState<boolean>(false);

  const sessionIdRef = useRef<string>(`sess-${Date.now()}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Voice Hook
  const {
    isSupported: voiceSupported,
    isListening,
    isSpeaking,
    audioLevel,
    transcript,
    analyserNode,
    startListening,
    stopListening,
    speak,
    cancelSpeech,
  } = useJarvisVoice({
    language: language === 'hi' ? 'hi-IN' : 'en-IN',
    onTranscriptReady: (spokenText) => {
      if (spokenText) {
        handleSendMessage(spokenText);
      }
    },
  });

  // Sync Visual State with Voice
  useEffect(() => {
    if (isProcessing) {
      setVisualState('thinking');
    } else if (isSpeaking) {
      setVisualState('speaking');
    } else if (isListening) {
      setVisualState('listening');
    } else {
      setVisualState('idle');
    }
  }, [isProcessing, isSpeaking, isListening]);

  // Boot Sequence Simulation on Open
  useEffect(() => {
    if (!isOpen) {
      setBootCompleted(false);
      setBootLogs([]);
      cancelSpeech();
      return;
    }

    const logs = [
      'SYS_INIT: Booting Quantum Holographic Neural Core...',
      'MEM_CHECK: Synchronizing 2030-2050 timeline indices [OK]',
      'AUDIO_BUS: Calibrating WebGL particle shader grid [OK]',
      'AUTH_PROTO: Cryptographic identity firewall engaged [LOCKED]',
      'READY: Neural Core online. Speak or transmit query.',
    ];

    setBootLogs([]);
    let currentIndex = 0;

    const interval = setInterval(() => {
      if (currentIndex < logs.length) {
        setBootLogs((prev) => [...prev, logs[currentIndex]]);
        currentIndex++;
      } else {
        clearInterval(interval);
        setBootCompleted(true);
      }
    }, 280);

    return () => clearInterval(interval);
  }, [isOpen, cancelSpeech]);

  // Keyboard shortcut Esc to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showAdminPanel) {
          setShowAdminPanel(false);
        } else if (showVerifyModal) {
          setShowVerifyModal(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, showAdminPanel, showVerifyModal]);

  // Scroll to bottom of terminal messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, bootLogs]);

  // Send Query to /api/jarvis/chat
  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query || !query.trim() || isProcessing) return;

    setInputQuery('');
    setMessages((prev) => [...prev, { role: 'user', text: query }]);
    setIsProcessing(true);

    try {
      const res = await fetch('/api/jarvis/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          sessionId: sessionIdRef.current,
          language,
        }),
      });

      const data = await res.json();

      if (res.ok && data.reply) {
        setMessages((prev) => [...prev, { role: 'assistant', text: data.reply }]);

        if (data.isOwner) {
          setIsOwner(true);
        }

        if (data.requiresVerification) {
          setShowVerifyModal(true);
        }

        if (!audioMuted) {
          speak(data.reply);
        }
      } else {
        const errorMsg = data.error || 'Transmission failed. Signal lost.';
        setMessages((prev) => [...prev, { role: 'assistant', text: errorMsg }]);
        if (!audioMuted) {
          speak(errorMsg);
        }
      }
    } catch {
      const errorMsg = 'Neural connection interrupted. Reconnecting...';
      setMessages((prev) => [...prev, { role: 'assistant', text: errorMsg }]);
      if (!audioMuted) {
        speak(errorMsg);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Submit Verification Code
  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyCode.trim() || isVerifying) return;

    setIsVerifying(true);
    setVerifyError(null);

    try {
      const res = await fetch('/api/jarvis/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: verifyCode.trim() }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsOwner(true);
        setShowVerifyModal(false);
        setVerifyCode('');
        const welcome = 'Owner credentials verified. Welcome back, Aliya Khan.';
        setMessages((prev) => [...prev, { role: 'assistant', text: welcome }]);
        if (!audioMuted) speak(welcome);
        fetchAdminData();
      } else {
        setVerifyError(data.error || 'Verification failed. Access denied.');
      }
    } catch {
      setVerifyError('Verification pipeline disrupted.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Lock Owner Mode / Logout
  const handleLockOwnerMode = async () => {
    try {
      await fetch('/api/jarvis/logout', { method: 'POST' });
      setIsOwner(false);
      setShowAdminPanel(false);
      const lockedMsg = 'Owner mode locked. Standard visitor security reinstated.';
      setMessages((prev) => [...prev, { role: 'assistant', text: lockedMsg }]);
      if (!audioMuted) speak(lockedMsg);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Admin Data
  const fetchAdminData = async () => {
    try {
      const res = await fetch('/api/jarvis/admin');
      if (res.ok) {
        const data = await res.json();
        setAdminData(data);
        if (data.profile) {
          setProfileEdit({
            about: data.profile.about || '',
            preferences: data.profile.preferences || '',
            businessNotes: data.profile.businessNotes || '',
          });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Update Owner Profile in Admin Panel
  const handleSaveProfile = async () => {
    try {
      const res = await fetch('/api/jarvis/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateProfile',
          profileData: profileEdit,
        }),
      });

      if (res.ok) {
        setProfileSaved(true);
        setTimeout(() => setProfileSaved(false), 2500);
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle Rate Limits
  const handleToggleRateLimits = async () => {
    try {
      const res = await fetch('/api/jarvis/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggleRateLimits' }),
      });

      if (res.ok) {
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#05070a]/95 backdrop-blur-xl text-slate-100 font-mono overflow-hidden select-none">
      {/* 1. Subtle Hologram Scanline & Vignette Effect */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(5,7,10,0.85)_100%)]" />
      <div className="absolute inset-0 pointer-events-none opacity-[0.035] bg-[linear-gradient(rgba(56,232,255,0.2)_1px,transparent_1px)] bg-[size:100%_4px]" />

      {/* 2. Scanning Perspective Grid Floor */}
      <div className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none overflow-hidden opacity-30">
        <div className="w-[200%] -left-[50%] h-full relative [transform:perspective(500px)_rotateX(60deg)] bg-[linear-gradient(to_right,rgba(56,232,255,0.15)_1px,transparent_1px),linear-gradient(to_bottom,rgba(56,232,255,0.15)_1px,transparent_1px)] bg-[size:40px_40px] animate-[pulse_4s_ease-in-out_infinite]" />
      </div>

      {/* 3. Sci-Fi HUD Corner Brackets */}
      <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-[#38e8ff]/60 pointer-events-none" />
      <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-[#38e8ff]/60 pointer-events-none" />
      <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-[#38e8ff]/60 pointer-events-none" />
      <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-[#38e8ff]/60 pointer-events-none" />

      {/* 4. Top Telemetry Bar */}
      <div className="absolute top-0 left-0 right-0 h-14 border-b border-[#38e8ff]/20 bg-[#05070a]/70 flex items-center justify-between px-6 z-20">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[#38e8ff] animate-ping" />
          <span className="text-xs uppercase tracking-widest text-[#38e8ff] font-bold">
            HAYAATI // NEURAL CORE v3.8
          </span>
          <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded border border-[#38e8ff]/30 text-slate-400">
            {isOwner ? 'MODE: VERIFIED ARCHITECT' : 'MODE: PUBLIC HORIZON'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Audio Mute Toggle */}
          <button
            onClick={() => {
              if (!audioMuted) cancelSpeech();
              setAudioMuted(!audioMuted);
            }}
            className="p-2 rounded border border-[#38e8ff]/30 text-[#38e8ff] hover:bg-[#38e8ff]/10 transition-colors"
            title={audioMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {audioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Admin Panel Trigger (Owner Only) */}
          {isOwner && (
            <button
              onClick={() => {
                fetchAdminData();
                setShowAdminPanel(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#ffaa00]/60 bg-[#ffaa00]/10 text-[#ffaa00] text-xs hover:bg-[#ffaa00]/20 transition-colors"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>ADMIN PANEL</span>
            </button>
          )}

          {/* Lock / Unlock Status */}
          {isOwner ? (
            <button
              onClick={handleLockOwnerMode}
              className="flex items-center gap-1 px-3 py-1.5 rounded border border-emerald-500/50 bg-emerald-500/10 text-emerald-400 text-xs hover:bg-rose-500/20 hover:text-rose-400 hover:border-rose-500/50 transition-colors"
              title="Lock Owner Mode"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">LOCKED TO ALIYA</span>
            </button>
          ) : (
            <button
              onClick={() => setShowVerifyModal(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded border border-[#38e8ff]/30 text-slate-400 hover:text-[#38e8ff] hover:border-[#38e8ff] text-xs transition-colors"
              title="Owner Authentication"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">AUTHENTICATE</span>
            </button>
          )}

          {/* Close Overlay Button */}
          <button
            onClick={onClose}
            className="p-2 rounded border border-slate-700 hover:border-rose-500/80 hover:text-rose-400 text-slate-400 transition-colors"
            title="Close Interface (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 5. Main Holographic Stage Grid */}
      <div className="w-full h-full pt-16 pb-20 px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10 max-w-7xl mx-auto">
        {/* Left Side: System Terminal & Conversation Stream */}
        <div className="lg:col-span-4 flex flex-col h-full bg-[#0a0f18]/60 border border-[#38e8ff]/20 rounded-lg p-4 backdrop-blur-md overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#38e8ff]/20 pb-2 mb-3">
            <div className="flex items-center gap-2 text-xs text-[#38e8ff]">
              <Terminal className="w-4 h-4" />
              <span>TERMINAL TELEMETRY</span>
            </div>
            <span className="text-[10px] text-slate-500">REAL-TIME BUS</span>
          </div>

          {/* Terminal Log Messages */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin text-xs">
            {bootLogs.map((log, idx) => (
              <div key={`boot-${idx}`} className="text-slate-400 text-[11px] font-mono leading-relaxed">
                <span className="text-[#38e8ff]/70 mr-1.5">&gt;</span>
                {log}
              </div>
            ))}

            {messages.map((m, idx) => (
              <div
                key={`msg-${idx}`}
                className={`p-2.5 rounded border ${
                  m.role === 'user'
                    ? 'border-[#38e8ff]/40 bg-[#38e8ff]/10 text-slate-100 ml-4'
                    : 'border-slate-800 bg-[#070b12]/80 text-[#38e8ff] mr-4'
                }`}
              >
                <div className="text-[10px] uppercase font-bold tracking-wider mb-1 opacity-70">
                  {m.role === 'user' ? 'TRANSMISSION // SENDER' : 'CORE // RESPONSE'}
                </div>
                <div className="text-xs leading-relaxed font-sans">{m.text}</div>
              </div>
            ))}

            {isProcessing && (
              <div className="p-2.5 rounded border border-[#ffaa00]/40 bg-[#ffaa00]/5 text-[#ffaa00] mr-4 animate-pulse flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 animate-spin" />
                <span className="text-xs">Processing neural synthesis...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Waveform Equalizer Display */}
          <div className="mt-3 pt-3 border-t border-[#38e8ff]/20 flex items-center justify-between">
            <span className="text-[10px] text-slate-500 uppercase">SPECTRUM:</span>
            <div className="flex items-end gap-1 h-5">
              {[0.4, 0.8, 0.6, 1.0, 0.5, 0.9, 0.3, 0.7, 0.5, 0.8].map((mult, i) => {
                const barHeight = Math.max(3, (audioLevel || 0.1) * mult * 20);
                return (
                  <div
                    key={i}
                    style={{ height: `${barHeight}px` }}
                    className="w-1 bg-[#38e8ff] rounded-t transition-all duration-75"
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Center: 3D Holographic Arc-Reactor Neural Core */}
        <div className="lg:col-span-8 flex flex-col items-center justify-center relative min-h-[350px]">
          {/* Radar Sweep HUD Element */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[340px] h-[340px] md:w-[480px] md:h-[480px] rounded-full border border-[#38e8ff]/15 relative">
              <div className="absolute inset-4 rounded-full border border-dashed border-[#38e8ff]/20 animate-[spin_60s_linear_infinite]" />
              <div className="absolute inset-16 rounded-full border border-[#38e8ff]/10" />
              {/* Radar sweep beam */}
              <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent_0_300deg,rgba(56,232,255,0.12)_360deg)] animate-[spin_6s_linear_infinite]" />
            </div>
          </div>

          {/* Real 3D WebGL Hologram Canvas */}
          <div className="w-full h-[400px] md:h-[500px] relative z-10">
            <HologramCanvas
              visualState={visualState}
              audioLevel={audioLevel}
              analyserNode={analyserNode}
            />
          </div>

          {/* State Indicator */}
          <div className="mt-1 text-center z-10">
            <span
              className={`text-xs uppercase tracking-widest font-bold px-3 py-1 rounded-full border ${
                visualState === 'listening'
                  ? 'border-[#ffaa00] text-[#ffaa00] bg-[#ffaa00]/10'
                  : visualState === 'thinking'
                  ? 'border-[#38e8ff] text-[#38e8ff] bg-[#38e8ff]/10 animate-pulse'
                  : visualState === 'speaking'
                  ? 'border-emerald-400 text-emerald-400 bg-emerald-400/10'
                  : 'border-slate-700 text-slate-400 bg-slate-900/60'
              }`}
            >
              STATE // {visualState.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* 6. Bottom Input & Voice Control Matrix */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-[#38e8ff]/20 bg-[#05070a]/90 backdrop-blur-md p-4 z-20">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          {/* Voice Microphone Button */}
          {voiceSupported && (
            <button
              onClick={isListening ? stopListening : startListening}
              className={`p-3 rounded-full border transition-all ${
                isListening
                  ? 'border-rose-500 bg-rose-500/20 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.4)] animate-pulse'
                  : 'border-[#38e8ff]/40 bg-[#38e8ff]/10 text-[#38e8ff] hover:bg-[#38e8ff]/20'
              }`}
              title={isListening ? 'Stop Listening' : 'Speak to Core'}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
          )}

          {/* Text Command Input Box */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              placeholder={
                isListening
                  ? 'Listening for voice transmission...'
                  : 'Type transmission or speak into neural core...'
              }
              className="w-full bg-[#0a0f18] border border-[#38e8ff]/30 focus:border-[#38e8ff] text-slate-100 placeholder-slate-500 text-xs px-4 py-3 rounded-md outline-none transition-colors"
            />
          </div>

          {/* Send Button */}
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputQuery.trim() || isProcessing}
            className="px-5 py-3 rounded-md bg-[#38e8ff] text-[#05070a] font-bold text-xs uppercase tracking-wider hover:bg-[#38e8ff]/90 disabled:opacity-40 disabled:pointer-events-none transition-colors flex items-center gap-1.5"
          >
            <span>TRANSMIT</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 7. Verification Code Modal (Masked Typed Input) */}
      <AnimatePresence>
        {showVerifyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 bg-[#05070a]/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-[#0a0f18] border-2 border-[#38e8ff]/50 rounded-lg p-6 shadow-[0_0_30px_rgba(56,232,255,0.2)] text-left"
            >
              <div className="flex items-center justify-between border-b border-[#38e8ff]/20 pb-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-[#38e8ff]">
                  <Shield className="w-5 h-5" />
                  <span className="font-bold">OWNER CLEARANCE REQUIRED</span>
                </div>
                <button
                  onClick={() => setShowVerifyModal(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-300 mb-4 leading-relaxed font-sans">
                Identity claim noted. Please provide your secure verification code. Plain code is verified
                server-side via cryptographic hash.
              </p>

              <form onSubmit={handleVerifySubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1">
                    CONFIDENTIAL ACCESS CODE
                  </label>
                  <input
                    type="password"
                    autoFocus
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-[#05070a] border border-[#38e8ff]/40 focus:border-[#38e8ff] px-4 py-2.5 rounded text-sm text-[#38e8ff] tracking-widest outline-none font-mono"
                  />
                </div>

                {verifyError && (
                  <div className="p-2.5 rounded border border-rose-500/40 bg-rose-500/10 text-rose-400 text-xs flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>{verifyError}</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowVerifyModal(false)}
                    className="px-4 py-2 rounded border border-slate-700 text-slate-400 text-xs hover:bg-slate-800"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    disabled={!verifyCode.trim() || isVerifying}
                    className="px-5 py-2 rounded bg-[#38e8ff] text-[#05070a] font-bold text-xs hover:bg-[#38e8ff]/90 disabled:opacity-40"
                  >
                    {isVerifying ? 'VERIFYING...' : 'CONFIRM ACCESS'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 8. Owner Admin Panel (Slide-In Holographic Panel) */}
      <AnimatePresence>
        {showAdminPanel && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute top-0 right-0 bottom-0 w-full max-w-xl bg-[#070b12]/98 border-l border-[#38e8ff]/40 backdrop-blur-2xl z-40 p-6 flex flex-col overflow-y-auto text-xs"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#38e8ff]/30 pb-4 mb-6">
              <div className="flex items-center gap-2 text-[#ffaa00]">
                <ShieldCheck className="w-5 h-5" />
                <span className="font-bold text-sm tracking-wider">ARCHITECT ADMIN MATRIX</span>
              </div>
              <button
                onClick={() => setShowAdminPanel(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Telemetry Stats Grid */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="p-3 rounded border border-[#38e8ff]/20 bg-[#38e8ff]/5">
                <span className="text-[10px] text-slate-400 uppercase">SESSIONS</span>
                <div className="text-xl font-bold text-[#38e8ff] mt-1">
                  {adminData?.stats?.totalConversations ?? 0}
                </div>
              </div>
              <div className="p-3 rounded border border-emerald-500/20 bg-emerald-500/5">
                <span className="text-[10px] text-slate-400 uppercase">REQUESTS</span>
                <div className="text-xl font-bold text-emerald-400 mt-1">
                  {adminData?.stats?.totalRequests ?? 0}
                </div>
              </div>
              <div className="p-3 rounded border border-rose-500/20 bg-rose-500/5">
                <span className="text-[10px] text-slate-400 uppercase">ERRORS</span>
                <div className="text-xl font-bold text-rose-400 mt-1">
                  {adminData?.stats?.totalErrors ?? 0}
                </div>
              </div>
            </div>

            {/* Rate Limits Global Toggle */}
            <div className="p-3 rounded border border-[#38e8ff]/20 bg-[#0a0f18] flex items-center justify-between mb-6">
              <div>
                <div className="font-bold text-slate-200">Public Rate Limiting</div>
                <div className="text-[10px] text-slate-400">
                  Controls strict hourly quota enforcement for public visitors
                </div>
              </div>
              <button
                onClick={handleToggleRateLimits}
                className={`px-3 py-1.5 rounded text-xs font-bold ${
                  adminData?.profile?.rateLimitsEnabled
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                }`}
              >
                {adminData?.profile?.rateLimitsEnabled ? 'ENABLED' : 'BYPASSED'}
              </button>
            </div>

            {/* Editable Owner Profile & Notes */}
            <div className="mb-6 space-y-3">
              <div className="font-bold text-[#38e8ff] text-xs uppercase tracking-wider">
                CONFIDENTIAL OWNER PROFILE & KNOWLEDGE
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">About Owner (Aliya Khan)</label>
                <textarea
                  rows={2}
                  value={profileEdit.about}
                  onChange={(e) => setProfileEdit({ ...profileEdit, about: e.target.value })}
                  className="w-full bg-[#05070a] border border-slate-700 focus:border-[#38e8ff] p-2 rounded text-xs text-slate-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Interaction Preferences</label>
                <input
                  type="text"
                  value={profileEdit.preferences}
                  onChange={(e) => setProfileEdit({ ...profileEdit, preferences: e.target.value })}
                  className="w-full bg-[#05070a] border border-slate-700 focus:border-[#38e8ff] p-2 rounded text-xs text-slate-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Internal Business Notes</label>
                <textarea
                  rows={2}
                  value={profileEdit.businessNotes}
                  onChange={(e) => setProfileEdit({ ...profileEdit, businessNotes: e.target.value })}
                  className="w-full bg-[#05070a] border border-slate-700 focus:border-[#38e8ff] p-2 rounded text-xs text-slate-200 outline-none"
                />
              </div>

              <button
                onClick={handleSaveProfile}
                className="w-full py-2 bg-[#38e8ff] text-[#05070a] font-bold text-xs uppercase rounded hover:bg-[#38e8ff]/90 flex items-center justify-center gap-1.5"
              >
                {profileSaved ? <CheckCircle2 className="w-4 h-4" /> : null}
                <span>{profileSaved ? 'PROFILE COMMITTED' : 'SAVE OWNER CONTEXT'}</span>
              </button>
            </div>

            {/* Conversation Log with Search */}
            <div className="flex-1 flex flex-col min-h-[220px]">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-[#38e8ff] text-xs uppercase tracking-wider">
                  CONVERSATION LOGS
                </span>
                <div className="relative w-44">
                  <Search className="w-3 h-3 absolute left-2 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    value={adminSearch}
                    onChange={(e) => setAdminSearch(e.target.value)}
                    placeholder="Search logs..."
                    className="w-full bg-[#05070a] border border-slate-700 pl-7 pr-2 py-1 text-[11px] rounded outline-none"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 border border-slate-800 rounded p-2 bg-[#05070a]/60">
                {(adminData?.sessions || [])
                  .filter((s: any) =>
                    !adminSearch
                      ? true
                      : s.turns?.some((t: any) =>
                          t.text.toLowerCase().includes(adminSearch.toLowerCase())
                        )
                  )
                  .map((sess: any) => (
                    <div
                      key={sess.sessionId}
                      className="p-2 border border-slate-800 rounded bg-[#0a0f18] text-[11px]"
                    >
                      <div className="flex justify-between text-slate-500 text-[10px] mb-1">
                        <span>{sess.sessionId}</span>
                        <span>{new Date(sess.startedAt).toLocaleTimeString()}</span>
                      </div>
                      <div className="space-y-1">
                        {sess.turns.slice(-4).map((turn: any) => (
                          <div key={turn.id} className="text-slate-300">
                            <span className="text-[#38e8ff] mr-1">
                              {turn.role === 'user' ? 'USER:' : 'CORE:'}
                            </span>
                            {turn.text}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Lock Button */}
            <div className="pt-4 border-t border-[#38e8ff]/20 mt-4">
              <button
                onClick={handleLockOwnerMode}
                className="w-full py-2.5 rounded border border-rose-500/50 bg-rose-500/10 text-rose-400 font-bold hover:bg-rose-500/20 text-xs flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>TERMINATE & LOCK OWNER SESSION</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
