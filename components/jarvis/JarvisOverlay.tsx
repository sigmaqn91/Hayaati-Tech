'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useOverlayHistory } from '@/hooks/use-overlay-history';
import {
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
import { JarvisBackdrop } from './JarvisBackdrop';
import { useLanguage } from '@/context/LanguageContext';
import { QUICK_ACK } from '@/lib/jarvisLocale';
import { collectLiveSiteSnapshot } from '@/lib/jarvisKnowledge';
import { runJarvisAction } from '@/lib/jarvisActions';

// Owner flow phrases (voice captions arrive in small pieces, so these run on the whole spoken turn).
const OWNER_NAME = '(a+l[iy]+a+h?|aaliya)';
const OWNER_CLAIM_PATTERNS: RegExp[] = [
  new RegExp(`\\b(main|mai|mein|i am|i'm|im|this is|it's|its|my name is)\\s+${OWNER_NAME}(\\s+khan)?\\b`, 'i'),
  new RegExp(`\\b${OWNER_NAME}\\s+khan\\s+(hoon|hun|hu|here|bol\\s+rahi)\\b`, 'i'),
  /\b(i am|i'm|im)\s+(the\s+)?(owner|founder)\b/i,
  /\b(main|मैं)\s+(owner|founder|मालिक|संस्थापक)\b/i,
  /\b(owner|founder)\s+(hoon|hun|hu)\b/i,
  /(मैं|मै|में)\s*(आलिया|अलिया|आलिआ)/,
  /मैं\s+(मालिक|संस्थापक|ओनर|फाउंडर)\s+(हूँ|हूं|हु)/,
  /(میں|مَیں)\s*(عالیہ|علیا|عالیا|علیہ)/,
];
const isOwnerClaim = (text: string) => OWNER_CLAIM_PATTERNS.some((re) => re.test(text));

// Jarvis asking for the code (after a claim) / clearly naming the verification code on its own.
const ASKS_FOR_CODE = /verif|code|कोड|सत्यापन|वेरिफ़?िकेशन|کوڈ|تصدیق/i;
const NAMES_VERIFY_CODE = /verification\s+code|access\s+code|owner\s+code|वेरिफ़?िकेशन\s+कोड|सत्यापन\s+कोड|تصدیقی\s+کوڈ/i;

// "Okay bye Jarvis", "bye Jarvis, see you", "Allah Hafiz", "owner mode off" ...
const GOODBYE = /\b(bye+|bye\s*bye|good\s*bye|alvida|khuda\s*hafiz|allah\s*hafiz|see\s+you|see\s+ya|tata|logout|log\s+out)\b|बाय|अलविदा|खुदा\s*हाफ़?िज़?|ख़ुदा\s*हाफ़?िज़?|अल्लाह\s*हाफ़?िज़?|फिर\s+मिलेंगे|خدا\s*حافظ|اللہ\s*حافظ|الوداع|بائے/i;
const JARVIS_NAME = /jarvis|jarwis|जार्विस|जारविस|جاروس|جارویس/i;
const OWNER_MODE_OFF = /\bowner\s*mod(e)?\s*(off|band|lock|close)\b/i;
const isOwnerGoodbye = (text: string) => {
  const clean = text.trim();
  if (!clean) return false;
  if (OWNER_MODE_OFF.test(clean)) return true;
  if (!GOODBYE.test(clean)) return false;
  // Only a real goodbye: a short line, or "bye" at the start/end of a line that names Jarvis
  const words = clean.split(/\s+/);
  if (words.length <= 6) return true;
  if (!JARVIS_NAME.test(clean) || words.length > 12) return false;
  return GOODBYE.test(words.slice(0, 4).join(' ')) || GOODBYE.test(words.slice(-4).join(' '));
};

interface JarvisOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  language?: string;
  embedded?: boolean;
}

export const JarvisOverlay: React.FC<JarvisOverlayProps> = ({
  isOpen,
  onClose,
  language = 'en',
  embedded = false,
}) => {
  // Assistant Mode & States
  const [visualState, setVisualState] = useState<AssistantVisualState>('idle');
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [bootCompleted, setBootCompleted] = useState<boolean>(false);
  const [bootLogs, setBootLogs] = useState<string[]>([]);

  // Orb Geometry for HUD Backdrop synchronization
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const orbContainerRef = useRef<HTMLDivElement | null>(null);
  const [orbGeometry, setOrbGeometry] = useState<{ centerY: number; orbRadius: number }>({
    centerY: 0.46,
    orbRadius: 180,
  });
  const [mobileLogOpen, setMobileLogOpen] = useState<boolean>(false);

  // Input & Messages
  const [inputQuery, setInputQuery] = useState<string>('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; lang?: string }>>([]);
  // UI-only chat view state: the stored messages (used as chat history) are never edited, the view just starts later.
  const [clearedBefore, setClearedBefore] = useState<number>(0);
  const messagesLenRef = useRef<number>(0);
  const langRef = useRef<string>(language || 'en');
  const prevLangRef = useRef<string>(language || 'en');
  const [panelOpen, setPanelOpen] = useState<boolean>(false);
  const userStoppedRef = useRef<boolean>(false);
  const feedRef = useRef<HTMLDivElement | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [audioMuted, setAudioMuted] = useState<boolean>(false);

  // Verification Prompt Modal
  const [showVerifyModal, setShowVerifyModal] = useState<boolean>(false);
  const [verifyCode, setVerifyCode] = useState<string>('');
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verifyGranted, setVerifyGranted] = useState<boolean>(false);
  const verifyInputRef = useRef<HTMLInputElement | null>(null);
  const [verifyFocused, setVerifyFocused] = useState<boolean>(false);
  const isOwnerRef = useRef<boolean>(false);
  const showVerifyRef = useRef<boolean>(false);
  // Spoken turn text (voice captions come in pieces) + "she said she is the owner, wait for Jarvis to ask for the code"
  const turnRoleRef = useRef<'user' | 'assistant' | null>(null);
  const userTurnRef = useRef<string>('');
  const assistantTurnRef = useRef<string>('');
  const claimPendingRef = useRef<boolean>(false);
  const claimTimerRef = useRef<number | null>(null);
  const byeHandledRef = useRef<boolean>(false);

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
  const { t, content, setLanguage } = useLanguage();
  const [conversationMode] = useState<boolean>(true);
  const [embeddedActive, setEmbeddedActive] = useState<boolean>(false);

  // Back button closes only the overlay that is open (verification modal, admin panel, legacy full-screen mode)
  useOverlayHistory(showVerifyModal, () => setShowVerifyModal(false));
  useOverlayHistory(showAdminPanel, () => setShowAdminPanel(false));
  useOverlayHistory(isOpen && !embedded, onClose);

  // UI-only: typing box lifts above the on-screen keyboard (visualViewport) and expands while focused
  const commandInputRef = useRef<HTMLInputElement | null>(null);
  const inputFocusedRef = useRef<boolean>(false);
  const [inputFocused, setInputFocused] = useState<boolean>(false);
  // Where the lifted bar sits: the visible part of the page (visual viewport) just above the keyboard.
  // Also works in Chrome "Desktop site" mode, where the page is zoomed out (or zoomed in on focus):
  // `scale` makes the bar render at normal phone size there, so the typing text stays readable.
  type KbBox = { left: number; width: number; bottom: number; scale: number };
  const [kbBox, setKbBox] = useState<KbBox | null>(null);
  const [kbOpen, setKbOpen] = useState<boolean>(false);
  const baseScreenHRef = useRef<number>(0);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    // Visible height in screen units: does not change with zoom, only when the keyboard takes space.
    const screenH = () => vv.height * vv.scale;
    baseScreenHRef.current = screenH();
    let raf = 0;
    const update = () => {
      // Pinch zoom also changes the visual viewport. Only follow it while the typing box is focused,
      // otherwise every zoom frame would re-render Jarvis and make zooming jerky.
      if (!inputFocusedRef.current) {
        baseScreenHRef.current = screenH();
        return;
      }
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const h = screenH();
        if (h > baseScreenHRef.current) baseScreenHRef.current = h;
        const open = baseScreenHRef.current - h > 120;
        setKbOpen((prev) => (prev === open ? prev : open));
        const layoutH = document.documentElement.clientHeight;
        const scale = Math.min(1.6, Math.max(1, 1 / vv.scale));
        const next: KbBox = {
          left: Math.round(vv.offsetLeft),
          width: Math.round(vv.width),
          bottom: Math.max(0, Math.round(layoutH - vv.offsetTop - vv.height)),
          scale: Math.round(scale * 100) / 100,
        };
        setKbBox((prev) =>
          prev &&
          Math.abs(prev.left - next.left) < 1 &&
          Math.abs(prev.width - next.width) < 1 &&
          Math.abs(prev.bottom - next.bottom) < 1 &&
          prev.scale === next.scale
            ? prev
            : next
        );
      });
    };
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    window.addEventListener('resize', update);
    update();
    return () => {
      cancelAnimationFrame(raf);
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  // Place the bar right away when the box is tapped (before the keyboard animation starts).
  useEffect(() => {
    if (!inputFocused && !verifyFocused) {
      setKbOpen(false);
      return;
    }
    window.visualViewport?.dispatchEvent(new Event('resize'));
  }, [inputFocused, verifyFocused]);

  const handleCommandFocus = () => {
    inputFocusedRef.current = true;
    setInputFocused(true);
  };
  const handleCommandBlur = () => {
    inputFocusedRef.current = false;
    setInputFocused(false);
  };
  // The owner code box follows the keyboard the same way, so it always sits right above it.
  const handleVerifyFocus = () => {
    inputFocusedRef.current = true;
    setVerifyFocused(true);
  };
  const handleVerifyBlur = () => {
    inputFocusedRef.current = false;
    setVerifyFocused(false);
  };
  // Touch devices only (desktop keeps the bar exactly as it was)
  const [coarsePointer, setCoarsePointer] = useState<boolean>(false);
  useEffect(() => {
    setCoarsePointer(window.matchMedia('(pointer: coarse)').matches);
  }, []);
  const commandLifted = inputFocused && (kbOpen || coarsePointer);
  const verifyLifted = verifyFocused && coarsePointer && kbOpen && kbBox !== null;

  // Keyboard closed by the phone (back gesture / hide-keyboard) while the input still holds focus:
  // release the focus so the bar glides back to its place and the next tap opens the keyboard again.
  const kbSeenRef = useRef<boolean>(false);
  useEffect(() => {
    if (!coarsePointer || !inputFocused) {
      kbSeenRef.current = false;
      return;
    }
    if (kbOpen) {
      kbSeenRef.current = true;
      return;
    }
    if (kbSeenRef.current) {
      kbSeenRef.current = false;
      commandInputRef.current?.blur();
      return;
    }
    // Keyboard never showed up (slow device or hardware keyboard): drop the lifted state after a short wait
    const id = window.setTimeout(() => {
      if (!kbSeenRef.current) commandInputRef.current?.blur();
    }, 1800);
    return () => window.clearTimeout(id);
  }, [coarsePointer, inputFocused, kbOpen]);

  // Voice Hook
  const {
    isListening,
    isConnecting,
    isSpeaking,
    audioLevel,
    transcript,
    speechError,
    failingLayer,
    speechDetail,
    analyserNode,
    audioLevelRef,
    startListening,
    stopListening,
    speak,
    sendLiveText,
    notifyOwnerVerified,
    notifyOwnerLocked,
    cancelSpeech,
  } = useJarvisVoice({
    language: language || 'en',
    welcomeMessage: t.assistant.welcomeMessage,
    // Live facts from the open website (current-language hero text, sections, photos) for Jarvis.
    getSiteSnapshot: () =>
      collectLiveSiteSnapshot({
        headline: (t as any)?.hero?.headline,
        subtitle: (t as any)?.hero?.subtitle,
        advert: (t as any)?.heroAdvert?.headline,
      }),
    onTranscriptReady: (spokenText) => {
      if (!spokenText) return;
      setMessages((prev) => [...prev, { role: 'user', text: spokenText, lang: langRef.current }]);
      if (turnRoleRef.current !== 'user') userTurnRef.current = '';
      turnRoleRef.current = 'user';
      userTurnRef.current = `${userTurnRef.current} ${spokenText}`.trim();
      const said = userTurnRef.current;
      if (isOwnerRef.current) {
        if (!byeHandledRef.current && isOwnerGoodbye(said)) {
          byeHandledRef.current = true;
          handleLockOwnerMode('goodbye');
        }
        return;
      }
      if (!claimPendingRef.current && !showVerifyRef.current && isOwnerClaim(said)) {
        // Let Jarvis welcome her first; the code box opens when Jarvis asks for the code
        // (or by itself a few seconds later if Jarvis does not mention it).
        claimPendingRef.current = true;
        if (claimTimerRef.current) window.clearTimeout(claimTimerRef.current);
        claimTimerRef.current = window.setTimeout(() => openVerifyBox(), 6000);
      }
    },
    // Website actions Jarvis performs for the visitor (section, scroll, card, language, rating)
    onToolCall: (name, args) => runJarvisAction(name, args, { setLanguage, content }),
    onAssistantTextReady: (assistantText) => {
      if (assistantText) {
        setMessages((prev) => [...prev, { role: 'assistant', text: assistantText, lang: langRef.current }]);
        if (turnRoleRef.current !== 'assistant') assistantTurnRef.current = '';
        turnRoleRef.current = 'assistant';
        assistantTurnRef.current = `${assistantTurnRef.current} ${assistantText}`.trim();
        const reply = assistantTurnRef.current;
        if (!isOwnerRef.current && !showVerifyRef.current) {
          if ((claimPendingRef.current && ASKS_FOR_CODE.test(reply)) || NAMES_VERIFY_CODE.test(reply)) {
            openVerifyBox(350);
          }
        }
      }
    },
  });

  // Opens the owner code box (keyboard comes up with it). Safe to call more than once.
  function openVerifyBox(delay = 0) {
    claimPendingRef.current = false;
    if (claimTimerRef.current) {
      window.clearTimeout(claimTimerRef.current);
      claimTimerRef.current = null;
    }
    if (isOwnerRef.current) return;
    const open = () => {
      if (isOwnerRef.current) return;
      setVerifyError(null);
      setVerifyGranted(false);
      setShowVerifyModal(true);
    };
    if (delay > 0) {
      claimTimerRef.current = window.setTimeout(open, delay);
    } else {
      open();
    }
  }

  useEffect(() => {
    isOwnerRef.current = isOwner;
    if (isOwner) byeHandledRef.current = false;
  }, [isOwner]);

  useEffect(() => {
    showVerifyRef.current = showVerifyModal;
    if (!showVerifyModal) {
      verifyInputRef.current?.blur();
      return;
    }
    // Put the cursor in the code box as soon as it appears (and again after its pop-in animation),
    // so the phone keyboard opens by itself and stays open.
    const focusBox = () => {
      const el = verifyInputRef.current;
      if (el && document.activeElement !== el) el.focus({ preventScroll: true });
    };
    focusBox();
    const ids = [60, 220, 480].map((ms) => window.setTimeout(focusBox, ms));
    return () => ids.forEach((id) => window.clearTimeout(id));
  }, [showVerifyModal]);

  useEffect(
    () => () => {
      if (claimTimerRef.current) window.clearTimeout(claimTimerRef.current);
    },
    []
  );

  // Tap handler: start immediately, ignore taps while connecting, and stop an active session.
  const handleVoiceTap = () => {
    // Tapping while connecting cancels it, so the button can never get stuck.
    if (isConnecting) {
      userStoppedRef.current = true;
      cancelSpeech();
      stopListening();
      if (embedded) setEmbeddedActive(false);
      return;
    }

    if (isSpeaking) {
      userStoppedRef.current = true;
      cancelSpeech();
      stopListening();
      if (embedded) setEmbeddedActive(false);
      return;
    }

    if (isListening) {
      userStoppedRef.current = true;
      stopListening();
      if (embedded) setEmbeddedActive(false);
      return;
    }

    // Fresh session: the chat panel opens with a clean view.
    userStoppedRef.current = false;
    setClearedBefore(messagesLenRef.current);
    if (embedded) setEmbeddedActive(true);
    startListening();
  };

  // Embedded hero controls dispatch the same toggle event so the existing voice hook stays single-instance.
  useEffect(() => {
    if (!embedded) return;

    const handleEmbeddedToggle = () => handleVoiceTap();
    window.addEventListener('jarvis:toggle', handleEmbeddedToggle);
    return () => window.removeEventListener('jarvis:toggle', handleEmbeddedToggle);
  }, [embedded, handleVoiceTap]);

  useEffect(() => {
    if (embedded && speechError && !isConnecting && !isListening) {
      setEmbeddedActive(false);
    }
  }, [embedded, speechError, isConnecting, isListening]);

  useEffect(() => {
    messagesLenRef.current = messages.length;
  }, [messages]);

  useEffect(() => {
    langRef.current = language || 'en';
  }, [language]);

  // Website language changed: the old-language chat disappears from the screen (view only, history is kept).
  useEffect(() => {
    const current = language || 'en';
    if (prevLangRef.current !== current) {
      prevLangRef.current = current;
      setClearedBefore(messagesLenRef.current);
    }
  }, [language]);

  // Chat panel shows while the assistant is on and leaves right after the user switches it off.
  const sessionLive = isConnecting || isListening || isSpeaking || isProcessing || embeddedActive;
  useEffect(() => {
    if (!embedded) return;
    if (sessionLive) {
      userStoppedRef.current = false;
      setPanelOpen(true);
      return;
    }
    const id = window.setTimeout(() => setPanelOpen(false), userStoppedRef.current ? 0 : 2800);
    return () => window.clearTimeout(id);
  }, [embedded, sessionLive]);

  // Map VoiceError codes to friendly localized messages in terminal
  useEffect(() => {
    if (speechError) {
      const voiceErrors = (t?.assistant as any)?.voiceErrors;
      let friendlyMsg = t?.assistant?.errors?.genericError || 'Voice service notice.';
      if (voiceErrors) {
        if (speechError === 'UNSUPPORTED') friendlyMsg = voiceErrors.unsupported;
        else if (speechError === 'INSECURE') friendlyMsg = voiceErrors.insecure;
        else if (speechError === 'DENIED') friendlyMsg = voiceErrors.denied;
        else if (speechError === 'NO_DEVICE') friendlyMsg = voiceErrors.noDevice;
        else if (speechError === 'MIC_FAILED') friendlyMsg = voiceErrors.micFailed;
        else if (speechError === 'RATE_LIMIT') friendlyMsg = voiceErrors.rateLimit;
        else if (speechError === 'PROVIDER_QUOTA') friendlyMsg = voiceErrors.providerQuota;
        else if (speechError === 'NO_KEY') friendlyMsg = voiceErrors.noKey;
        else if (speechError === 'MODEL_FAILED') friendlyMsg = voiceErrors.modelFailed;
        else if (speechError === 'NETWORK') friendlyMsg = voiceErrors.network;
        else if (speechError === 'SERVER_ERROR') friendlyMsg = voiceErrors.serverError;
      }
      if (speechError === 'SESSION_ENDED') {
        friendlyMsg = t?.assistant?.errors?.sessionEnded || friendlyMsg;
      }
      const layerTag = failingLayer && failingLayer !== 'NONE' ? ` [${failingLayer}]` : '';
      setBootLogs((prev) => [...prev, `SYS_VOICE_NOTICE${layerTag}: ${friendlyMsg}`]);
      // Also show the real technical cause on screen (the boot log is hidden in the hero).
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: `[VOICE ${speechError}${layerTag}] ${friendlyMsg}${speechDetail ? ' | ' + speechDetail : ''}` },
      ]);
    }
  }, [speechError, failingLayer, speechDetail, t]);

  // Sync Visual State with Voice
  useEffect(() => {
    if (isProcessing || isConnecting) {
      setVisualState('thinking');
    } else if (isSpeaking) {
      setVisualState('speaking');
    } else if (isListening) {
      setVisualState('listening');
    } else {
      setVisualState('idle');
    }
  }, [isProcessing, isConnecting, isSpeaking, isListening]);

  // Boot Sequence Simulation on Open & Clean up on close
  useEffect(() => {
    if (!isOpen) {
      try { sessionStorage.removeItem('hayaati_jarvis_transcript'); } catch {}
      setBootCompleted(false);
      setBootLogs([]);
      if (embedded) setEmbeddedActive(false);
      cancelSpeech();
      stopListening();
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
  }, [isOpen, cancelSpeech, stopListening]);

  // Synchronize Orb geometry with HUD Backdrop rings
  useEffect(() => {
    if (!isOpen) return;

    const measureOrb = () => {
      if (overlayRef.current && orbContainerRef.current) {
        const overlayRect = overlayRef.current.getBoundingClientRect();
        const orbRect = orbContainerRef.current.getBoundingClientRect();
        if (overlayRect.height > 0) {
          const cy = (orbRect.top + orbRect.height / 2 - overlayRect.top) / overlayRect.height;
          const radius = Math.min(orbRect.width, orbRect.height) / 2;
          setOrbGeometry({
            centerY: Math.max(0.2, Math.min(0.8, cy)),
            orbRadius: Math.max(50, radius),
          });
        }
      }
    };

    measureOrb();
    const frameId = requestAnimationFrame(measureOrb);
    window.addEventListener('resize', measureOrb);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', measureOrb);
    };
  }, [isOpen]);

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

  // Live-chat feel: newest line stays in view, older lines drift up and fade.
  useEffect(() => {
    const el = feedRef.current;
    if (!el) return;
    const id = window.requestAnimationFrame(() => el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' }));
    return () => window.cancelAnimationFrame(id);
  }, [messages, panelOpen, clearedBefore]);

  // Send Query to original working Gemini connection /api/chat
  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query || !query.trim() || isProcessing) return;

    setInputQuery('');
    setMessages((prev) => [...prev, { role: 'user', text: query }]);

    // "Okay bye Jarvis" while verified: owner mode switches off by itself
    if (isOwner && isOwnerGoodbye(query)) {
      commandInputRef.current?.blur();
      await handleLockOwnerMode('goodbye');
      return;
    }

    setIsProcessing(true);

    // Keep an active Live session alive: typed input goes directly into the same session.
    if (isListening) {
      const sent = sendLiveText(query);
      setIsProcessing(false);
      if (!sent) {
        setMessages((prev) => [...prev, { role: 'assistant', text: 'Live transmission failed. Please try again.' }]);
      }
      return;
    }

    // Give typed chat an immediate spoken acknowledgement while the existing /api/chat reply is pending.
    if (!audioMuted) {
      // Short "one moment" in the visitor's own language (was English for 28 of the 30 languages).
      speak(QUICK_ACK[language || 'en'] || QUICK_ACK.en);
    }

    const requestController = new AbortController();
    const requestTimeout = window.setTimeout(() => requestController.abort(), 20000);

    try {
      const historyPayload = messages.slice(-6).map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        text: m.text,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: historyPayload,
          language,
        }),
        signal: requestController.signal,
      });

      const responseText = await res.text();
      let data: any = {};
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch {
        data = {};
      }

      const actions: Array<{ name: string; args?: Record<string, unknown> }> = Array.isArray(data.actions) ? data.actions : [];
      let screenResult: { name: string; result: Record<string, unknown> } | null = null;
      if (res.ok && actions.length) {
        const results = [];
        for (const a of actions) {
          const result = await runJarvisAction(a.name, a.args, { setLanguage, content });
          results.push(result);
          if (result.ok && (a.name === 'tour' || a.name === 'whats_on_screen')) screenResult = { name: a.name, result };
        }
        if (!data.reply && !screenResult) {
          const failed = results.find((r) => !r.ok);
          data.reply = failed ? `Sorry, I could not do that (${failed.error}).` : 'Done.';
        }
      }

      // Tour / screen reading in typed chat: Jarvis is told what is on the screen now and describes only that.
      if (res.ok && screenResult) {
        if (data.reply) setMessages((prev) => [...prev, { role: 'assistant', text: data.reply }]);
        const follow = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: query.slice(0, 400),
            history: [...historyPayload, ...(data.reply ? [{ role: 'model', text: data.reply }] : [])].slice(-6),
            language,
            screen: JSON.stringify({ tool: screenResult.name, ...screenResult.result }),
          }),
          signal: requestController.signal,
        }).catch(() => null);
        const followData = follow ? await follow.json().catch(() => ({})) : {};
        data = {
          ...data,
          reply: follow?.ok && followData.reply ? followData.reply : data.reply ? '' : 'Done.',
        };
        if (!data.reply) return;
      }

      if (res.ok && data.reply) {
        setMessages((prev) => [...prev, { role: 'assistant', text: data.reply }]);

        if (data.isOwner) {
          setIsOwner(true);
        }

        if (data.requiresVerification) {
          setShowVerifyModal(true);
        }

        if (!audioMuted) {
          speak(data.reply, () => {
            if (conversationMode && (embedded ? embeddedActive : isOpen)) {
              startListening();
            }
          });
        }
      } else {
        const errorMsg =
          res.status === 401 || res.status === 403
            ? 'Jarvis authentication is unavailable. Please try again.'
            : res.status === 404
              ? 'Jarvis model endpoint was not found. Please try again later.'
              : res.status === 429 || data.code === 'quota_reached' || data.code === 'rate_limited'
                ? 'Jarvis is temporarily rate-limited or out of quota. Please try again later.'
                : res.status === 500
                  ? 'Jarvis encountered a server error. Please try again.'
                  : res.status === 504 || data.code === 'timeout'
                    ? 'Jarvis took too long to respond. Please try again.'
                    : data.error ||
                      (data.code === 'server_busy'
                        ? 'The cognitive service is temporarily busy. Please try again.'
                        : t?.assistant?.errors?.genericError || 'Transmission failed. Please try again.');
        setMessages((prev) => [...prev, { role: 'assistant', text: errorMsg }]);
        if (!audioMuted) {
          speak(errorMsg);
        }
      }
    } catch (error: any) {
      const errorMsg =
        error?.name === 'AbortError'
          ? 'Cognitive service timed out. Please try again.'
          : t?.assistant?.errors?.networkError || 'Neural connection interrupted. Reconnecting...';
      setMessages((prev) => [...prev, { role: 'assistant', text: errorMsg }]);
      if (!audioMuted) {
        speak(errorMsg);
      }
    } finally {
      window.clearTimeout(requestTimeout);
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
        // Keyboard goes away first, a short "granted" tick shows, then the box closes.
        verifyInputRef.current?.blur();
        setVerifyGranted(true);
        setIsOwner(true);
        setVerifyCode('');
        window.setTimeout(() => {
          setShowVerifyModal(false);
          setVerifyGranted(false);
        }, 650);
        const welcome = 'Owner credentials verified. Welcome back, Aliya Khan.';
        setMessages((prev) => [...prev, { role: 'assistant', text: welcome }]);
        const notified = notifyOwnerVerified();
        if (!notified && !audioMuted) {
          speak(welcome);
        }
        fetchAdminData();
      } else {
        setVerifyError(data.error || 'Verification failed. Access denied.');
        // Keep the keyboard up so the code can be typed again straight away
        window.setTimeout(() => {
          verifyInputRef.current?.focus({ preventScroll: true });
          verifyInputRef.current?.select();
        }, 0);
      }
    } catch {
      setVerifyError('Verification pipeline disrupted.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Lock Owner Mode / Logout
  // reason 'goodbye': she said "okay bye Jarvis" - Jarvis says the goodbye itself in the live voice session.
  async function handleLockOwnerMode(reason: 'button' | 'goodbye' = 'button') {
    try {
      isOwnerRef.current = false;
      await fetch('/api/jarvis/logout', { method: 'POST' });
      setIsOwner(false);
      setShowAdminPanel(false);
      if (reason === 'goodbye') {
        const byeMsg = 'Owner mode switched off. Goodbye, Aliya. See you soon.';
        setMessages((prev) => [...prev, { role: 'assistant', text: byeMsg }]);
        const notified = notifyOwnerLocked();
        if (!notified && !audioMuted) speak(byeMsg);
        return;
      }
      const lockedMsg = 'Owner mode locked. Standard visitor security reinstated.';
      setMessages((prev) => [...prev, { role: 'assistant', text: lockedMsg }]);
      if (!audioMuted) speak(lockedMsg);
    } catch (err) {
      console.error(err);
    }
  }

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

  if (!isOpen && !embedded) return null;

  return (
    <div
      ref={overlayRef}
      className={embedded
        ? `absolute inset-0 ${commandLifted ? 'z-[25]' : 'z-10'} flex flex-col bg-transparent text-slate-100 font-mono overflow-hidden select-none pointer-events-none`
        : 'fixed inset-0 z-50 flex flex-col bg-[#05070a] text-slate-100 font-mono overflow-hidden select-none h-[100dvh] overscroll-contain touch-manipulation'}
    >
      {/* 1-3. The full-screen HUD chrome stays only in the legacy modal mode. */}
      {!embedded && (
        <>
          <JarvisBackdrop
            state={visualState}
            loudness={audioLevel}
            levelRef={audioLevelRef}
            centerY={orbGeometry.centerY}
            orbRadius={orbGeometry.orbRadius}
          />
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(5,7,10,0.85)_100%)] z-[1]" />
          <div className="absolute inset-0 pointer-events-none opacity-[0.035] bg-[linear-gradient(rgba(56,232,255,0.2)_1px,transparent_1px)] bg-[size:100%_4px] z-[1]" />
          <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-[#38e8ff]/60 pointer-events-none z-[1]" />
          <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-[#38e8ff]/60 pointer-events-none z-[1]" />
          <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-[#38e8ff]/60 pointer-events-none z-[1]" />
          <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-[#38e8ff]/60 pointer-events-none z-[1]" />
        </>
      )}

      {/* 4. Slim Header Telemetry Bar */}
      {!embedded && (
        <div className="h-12 border-b border-[#38e8ff]/20 bg-[#05070a]/80 flex items-center justify-between px-4 sm:px-6 relative z-30 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-[#38e8ff] animate-ping" />
          <span className="text-xs uppercase tracking-widest text-[#38e8ff] font-bold">
            Jarvis // NEURAL CORE v3.8
          </span>
          <span className="hidden md:inline-block text-[10px] px-2 py-0.5 rounded border border-[#38e8ff]/30 text-slate-400">
            LOC: 28.6139° N, 77.2090° E // NOMINAL
          </span>
          <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded border border-[#38e8ff]/30 text-slate-400">
            {isOwner ? 'MODE: VERIFIED ARCHITECT (ALIYA KHAN)' : 'MODE: PUBLIC HORIZON'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Audio Mute Toggle */}
          <button
            onClick={() => {
              if (!audioMuted) cancelSpeech();
              setAudioMuted(!audioMuted);
            }}
            className="p-1.5 sm:p-2 rounded border border-[#38e8ff]/30 text-[#38e8ff] hover:bg-[#38e8ff]/10 transition-colors cursor-pointer"
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
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-[#ffaa00]/60 bg-[#ffaa00]/10 text-[#ffaa00] text-xs hover:bg-[#ffaa00]/20 transition-colors cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ADMIN PANEL</span>
            </button>
          )}

          {/* Lock / Authenticate Status */}
          {isOwner ? (
            <button
              onClick={() => handleLockOwnerMode()}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded border border-emerald-500/50 bg-emerald-500/10 text-emerald-400 text-xs hover:bg-rose-500/20 hover:text-rose-400 hover:border-rose-500/50 transition-colors cursor-pointer"
              title="Lock Owner Mode"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">LOCKED TO ALIYA</span>
            </button>
          ) : (
            <button
              onClick={() => setShowVerifyModal(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded border border-[#38e8ff]/30 text-slate-400 hover:text-[#38e8ff] hover:border-[#38e8ff] text-xs transition-colors cursor-pointer"
              title="Owner Authentication"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">AUTHENTICATE</span>
            </button>
          )}

          {/* Close Overlay Button */}
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded border border-slate-700 hover:border-rose-500/80 hover:text-rose-400 text-slate-400 transition-colors cursor-pointer"
            title="Close Interface (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        </div>
      )}

      {/* 5. Centered Holographic Stage Container (Horizontal & Vertical Center ~46%) */}
      <div
        className={embedded
          ? 'absolute flex flex-col items-center justify-start pointer-events-none z-10'
          : 'absolute inset-x-0 flex flex-col items-center justify-center pointer-events-none z-10'}
        style={embedded
          ? {
              left: 'var(--orb-cx, 50%)',
              top: 'var(--orb-cy, 44%)',
              width: 'max(var(--orb-size, min(78vw, 46vh, 520px)), 18rem)',
              transform: 'translate(-50%, calc(var(--orb-size, min(78vw, 46vh, 520px)) / -2))',
            }
          : { top: '46%', transform: 'translateY(-50%)' }}
      >
        {/* Hologram Orb Container */}
        <div
          ref={orbContainerRef}
          data-jarvis-orb
          onClick={handleVoiceTap}
          style={{
            width: 'var(--orb-size, min(78vw, 46vh, 520px))',
            height: 'var(--orb-size, min(78vw, 46vh, 520px))',
          }}
          className="relative cursor-pointer pointer-events-auto flex items-center justify-center"
          title={isConnecting ? 'Connecting...' : isSpeaking ? 'Speaking (tap to stop)' : isListening ? 'Listening (tap to stop)' : 'Tap to speak'}
        >
          <HologramCanvas
            visualState={visualState}
            audioLevel={audioLevel}
            analyserNode={analyserNode}
            levelRef={audioLevelRef}
          />
        </div>

        {/* State Indicator: centered right below the orb */}
        <div className="mt-3 text-center pointer-events-auto">
          {isConnecting && (
            <div className="mb-2 text-xs uppercase tracking-widest font-bold text-[#38e8ff] animate-pulse">
              Connecting...
            </div>
          )}
          <span
            className={`text-xs uppercase tracking-widest font-bold px-3.5 py-1 rounded-full border ${
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
          {embedded && <div className="mt-2 w-24 border-t border-dotted border-[#38e8ff]/50" aria-hidden="true" />}
        </div>

        {/* Spectrum Bar: right under state indicator (animated straight on the DOM, no re-renders) */}
        <SpectrumBars levelRef={audioLevelRef} />

        {/* Active Response Caption Subtitle (legacy modal only) */}
        {!embedded && messages.length > 0 && (
          <div className="mt-4 max-w-xl mx-4 px-4 py-2 bg-[#0a0f18]/90 border border-[#38e8ff]/30 rounded-full text-center text-xs text-[#38e8ff] shadow-[0_0_20px_rgba(56,232,255,0.2)] backdrop-blur-sm pointer-events-auto line-clamp-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mr-2">
              {messages[messages.length - 1].role === 'user' ? 'TRANSMISSION:' : 'Jarvis:'}
            </span>
            <span className="font-sans text-slate-100">{messages[messages.length - 1].text}</span>
          </div>
        )}

        {isProcessing && (
          <div className="mt-3 px-4 py-1 rounded-full border border-[#ffaa00]/40 bg-[#ffaa00]/10 text-[#ffaa00] text-xs flex items-center gap-2 pointer-events-auto animate-pulse">
            <Activity className="w-3.5 h-3.5 animate-spin" />
            <span className="font-mono text-[11px] tracking-wider uppercase">Processing neural synthesis...</span>
          </div>
        )}
      </div>

      {embedded && (
        <AnimatePresence>
          {panelOpen && (() => {
            // UI only: current-language messages since the view started, same-role chunks merged into one bubble.
            const merged: Array<{ id: number; role: 'user' | 'assistant'; text: string }> = [];
            messages.forEach((m, i) => {
              if (i < clearedBefore) return;
              if (m.lang && m.lang !== language) return;
              const prev = merged[merged.length - 1];
              if (prev && prev.role === m.role) prev.text = `${prev.text} ${m.text}`.trim();
              else merged.push({ id: i, role: m.role, text: m.text });
            });
            const shown = merged.slice(-5);
            const stateLabel =
              visualState === 'listening' ? 'LISTENING' : visualState === 'speaking' ? 'SPEAKING' : visualState === 'thinking' ? 'PROCESSING' : 'STANDBY';
            return (
              <motion.div
                key="jarvis-chat-panel"
                data-jarvis-transcript
                initial={{ opacity: 0, y: 22, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 14, scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 260, damping: 28, mass: 0.8 }}
                className="absolute z-30 left-3 right-3 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:w-[min(94vw,36rem)] lg:left-[var(--orb-cx)] lg:w-[min(34rem,36vw)] flex flex-col pointer-events-auto"
                style={{
                  top: 'var(--tr-top, auto)',
                  maxHeight: 'max(10rem, min(15rem, calc(100% - var(--tr-top, 0px) - 5rem)))',
                }}
                aria-live="polite"
              >
                <div className="hero-panel chat-panel flex flex-col min-h-0 max-h-full">
                  <span className="hero-panel__glow" aria-hidden="true" />
                  <span className="hero-panel__ring" aria-hidden="true" />
                  <span className="hero-panel__glass" aria-hidden="true" />
                  <span className="hero-panel__tick hero-panel__tick--a" style={{ top: -1, left: '18%', width: 46, height: 3 }} aria-hidden="true" />
                  <span className="hero-panel__tick hero-panel__tick--c" style={{ bottom: -1, right: '16%', width: 38, height: 3 }} aria-hidden="true" />
                  <span className="chat-panel__scan" aria-hidden="true" />

                  <div className="chat-panel__body flex flex-col min-h-0">
                    <div className="chat-panel__head">
                      <span className="chat-panel__dot" aria-hidden="true" />
                      <span>LIVE TRANSCRIPT</span>
                      <span className="chat-panel__state">{stateLabel}</span>
                    </div>

                    <div ref={feedRef} className="chat-feed min-h-0 flex-1">
                      <div className="flex-1" aria-hidden="true" />
                      <AnimatePresence initial={false}>
                        {shown.map((message, idx) => {
                          const fromEnd = shown.length - 1 - idx;
                          const fade = [1, 0.86, 0.66, 0.46, 0.3][fromEnd] ?? 0.3;
                          const isUser = message.role === 'user';
                          return (
                            <motion.div
                              key={`msg-${message.id}`}
                              initial={{ opacity: 0, y: 16 }}
                              animate={{ opacity: fade, y: 0 }}
                              exit={{ opacity: 0, y: -12 }}
                              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                              className={`chat-row ${isUser ? 'chat-row--user' : 'chat-row--ai'}`}
                            >
                              <div className={`chat-bubble ${isUser ? 'chat-bubble--user' : 'chat-bubble--ai'}`}>
                                <span className="chat-bubble__who">{isUser ? 'YOU' : 'JARVIS'}</span>
                                <span dir="auto" className="chat-bubble__text">{message.text}</span>
                              </div>
                            </motion.div>
                          );
                        })}
                        {isProcessing && (
                          <motion.div
                            key="msg-typing"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                            className="chat-row chat-row--ai"
                          >
                            <div className="chat-bubble chat-bubble--ai chat-typing" aria-hidden="true">
                              <i /><i /><i />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })()}
        </AnimatePresence>
      )}

      {embedded && (
        <button
          onClick={() => (isOwner ? handleLockOwnerMode() : setShowVerifyModal(true))}
          className="absolute right-3 top-3 sm:right-5 sm:top-5 z-30 pointer-events-auto flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-[#38e8ff]/30 bg-[#05070a]/85 text-slate-400 hover:text-[#38e8ff] hover:border-[#38e8ff] text-xs transition-colors cursor-pointer"
          title="Owner Authentication"
          aria-label="Owner Authentication"
        >
          {isOwner ? <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Lock className="w-3.5 h-3.5" />}
          <span>{isOwner ? 'VERIFIED' : 'AUTHENTICATE'}</span>
        </button>
      )}

      {/* 6. Fixed Bottom Command Bar */}
      <motion.div
        layout="position"
        layoutDependency={commandLifted}
        transition={{ type: 'spring', stiffness: 380, damping: 36, mass: 0.9 }}
        style={commandLifted
          ? kbBox
            ? { left: kbBox.left, width: kbBox.width, bottom: kbBox.bottom }
            : { left: 0, right: 0, bottom: 0 }
          : undefined}
        className={commandLifted
          ? 'fixed px-2.5 pb-2.5 pt-1 z-30 pointer-events-auto'
          : embedded
          ? 'absolute bottom-0 left-0 right-0 p-3 sm:p-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] z-30 pointer-events-auto'
          : 'absolute bottom-0 left-0 right-0 border-t border-[#38e8ff]/20 bg-[#05070a]/95 p-3 sm:p-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] z-30'}>
        <div
          style={commandLifted && kbOpen && kbBox && kbBox.scale !== 1
            ? { width: `${100 / kbBox.scale}%`, transform: `scale(${kbBox.scale})`, transformOrigin: '0 100%' }
            : undefined}
        >
        <motion.div
          animate={commandLifted
            ? {
                padding: 10,
                borderRadius: 16,
                backgroundColor: 'rgba(7,11,19,0.94)',
                boxShadow: '0 0 0 1px rgba(56,232,255,0.65), 0 0 26px rgba(56,232,255,0.32), 0 -10px 30px rgba(129,140,248,0.18)',
              }
            : {
                padding: 0,
                borderRadius: 0,
                backgroundColor: 'rgba(7,11,19,0)',
                boxShadow: '0 0 0 0px rgba(56,232,255,0), 0 0 0px rgba(56,232,255,0), 0 0 0px rgba(129,140,248,0)',
              }}
          transition={{ type: 'spring', stiffness: 360, damping: 30 }}
          className={`max-w-3xl mx-auto flex items-center gap-2 sm:gap-3 ${commandLifted ? 'backdrop-blur-xl' : ''}`}
        >
          {/* Text Command Input Box (font size at least 16px to prevent mobile zoom) */}
          <div className="flex-1 relative">
            <motion.input
              ref={commandInputRef}
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onFocus={handleCommandFocus}
              onBlur={handleCommandBlur}
              animate={{ fontSize: commandLifted ? 18 : 16, paddingTop: commandLifted ? 14 : 10, paddingBottom: commandLifted ? 14 : 10 }}
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              enterKeyHint="send"
              autoComplete="off"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              placeholder={
                isListening
                  ? 'Listening for voice transmission...'
                  : 'Type transmission or speak into neural core...'
              }
              style={{ caretColor: '#38e8ff', touchAction: 'manipulation' }}
              className="w-full bg-[#0a0f18] border border-[#38e8ff]/30 focus:border-[#38e8ff] text-slate-100 placeholder-slate-500 px-4 rounded-md outline-none transition-colors"
            />
          </div>

          {/* Always-visible Owner Authentication Button */}
          <button
            onClick={() => (isOwner ? handleLockOwnerMode() : setShowVerifyModal(true))}
            className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-2.5 sm:py-3 rounded border text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shrink-0 ${
              isOwner
                ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                : 'border-[#38e8ff]/30 text-slate-400 hover:text-[#38e8ff] hover:border-[#38e8ff]'
            }`}
            title={isOwner ? 'Owner Verified' : 'Owner Authentication'}
            aria-label={isOwner ? 'Owner Verified' : 'Owner Authentication'}
          >
            {isOwner ? <ShieldCheck className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isOwner ? 'VERIFIED' : 'AUTHENTICATE'}</span>
          </button>

          {/* TRANSMIT Button */}
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputQuery.trim() || isProcessing}
            className="px-4 sm:px-5 py-2.5 sm:py-3 rounded bg-[#38e8ff] text-[#05070a] font-bold text-xs uppercase tracking-wider hover:bg-[#38e8ff]/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">TRANSMIT</span>
          </button>
        </motion.div>
        </div>
      </motion.div>

      {/* 7. Verification Code Modal (Masked Typed Input) */}
      <AnimatePresence>
        {showVerifyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={verifyLifted && kbBox
              ? { left: kbBox.left, width: kbBox.width, bottom: kbBox.bottom }
              : undefined}
            className={verifyLifted
              ? 'fixed px-2.5 pb-2.5 z-50 pointer-events-auto'
              : embedded
              ? 'absolute bottom-[5.5rem] left-3 right-3 sm:left-auto sm:right-4 sm:w-[min(92vw,28rem)] z-40 pointer-events-auto'
              : 'absolute inset-0 z-40 bg-[#05070a]/90 backdrop-blur-md flex items-center justify-center p-4'}
          >
            {/* With the phone keyboard open the box sits right above it, at normal phone size */}
            <div
              className="w-full flex justify-center"
              style={verifyLifted && kbBox && kbBox.scale !== 1
                ? { width: `${100 / kbBox.scale}%`, transform: `scale(${kbBox.scale})`, transformOrigin: '0 100%' }
                : undefined}
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
                    ref={verifyInputRef}
                    type="password"
                    autoFocus
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value)}
                    onFocus={handleVerifyFocus}
                    onBlur={handleVerifyBlur}
                    enterKeyHint="go"
                    autoComplete="off"
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck={false}
                    readOnly={verifyGranted}
                    style={{ touchAction: 'manipulation' }}
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
                    disabled={verifyGranted || !verifyCode.trim() || isVerifying}
                    className={verifyGranted
                      ? 'px-5 py-2 rounded bg-emerald-400 text-[#05070a] font-bold text-xs flex items-center gap-1.5'
                      : 'px-5 py-2 rounded bg-[#38e8ff] text-[#05070a] font-bold text-xs hover:bg-[#38e8ff]/90 disabled:opacity-40'}
                  >
                    {verifyGranted ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        ACCESS GRANTED
                      </>
                    ) : isVerifying ? 'VERIFYING...' : 'CONFIRM ACCESS'}
                  </button>
                </div>
              </form>
            </motion.div>
            </div>
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
                onClick={() => handleLockOwnerMode()}
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

// Ten small level bars under the orb. They read the live loudness every animation frame and write the
// height straight to the elements, so the big Jarvis panel never has to re-render for them.
const SPECTRUM_MULTS = [0.4, 0.8, 0.6, 1.0, 0.5, 0.9, 0.3, 0.7, 0.5, 0.8];
function SpectrumBars({ levelRef }: { levelRef: React.MutableRefObject<number> }) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const bars = Array.from(wrap.children) as HTMLElement[];
    let raf = 0;
    let shown = -1;
    let visible = true;
    // Off-screen the loop stops completely (no idle frame requests while the visitor scrolls the page).
    const io =
      typeof IntersectionObserver !== 'undefined'
        ? new IntersectionObserver((entries) => {
            visible = entries[0].isIntersecting;
            if (visible && !raf) raf = requestAnimationFrame(tick);
          })
        : null;
    io?.observe(wrap);
    const tick = () => {
      if (!visible) {
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(tick);
      const level = Math.round((levelRef.current || 0.1) * 50) / 50;
      if (level === shown) return;
      shown = level;
      for (let i = 0; i < bars.length; i++) {
        const h = Math.max(3, (level || 0.1) * SPECTRUM_MULTS[i] * 16);
        bars[i].style.transform = `scaleY(${h / 16})`;
      }
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io?.disconnect();
    };
  }, [levelRef]);
  return (
    <div ref={wrapRef} className="mt-2.5 flex items-end gap-1 h-4 pointer-events-auto" aria-hidden="true">
      {SPECTRUM_MULTS.map((_, i) => (
        <div
          key={i}
          style={{ height: '16px', transform: 'scaleY(0.19)', transformOrigin: '50% 100%' }}
          className="w-1 bg-[#38e8ff] rounded-t transition-transform duration-75"
        />
      ))}
    </div>
  );
}

export default JarvisOverlay;
