'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  unlockAudio,
  recordUtterance,
  transcribe,
  fetchSpeech,
  playSpeech,
  VoiceError,
  VoiceErrorCode,
} from '@/lib/jarvisAudio';

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

  // Active controllers and locks
  const activeControllerRef = useRef<AbortController | null>(null);
  const isTurnRunningRef = useRef<boolean>(false);
  const isSpeakingRef = useRef<boolean>(false);
  const languageRef = useRef<string>(language);
  const onTranscriptReadyRef = useRef(onTranscriptReady);

  useEffect(() => {
    languageRef.current = language;
  }, [language]);

  useEffect(() => {
    onTranscriptReadyRef.current = onTranscriptReady;
  }, [onTranscriptReady]);

  // Check browser audio support
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hasMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    const hasAudioCtx = !!(window.AudioContext || (window as any).webkitAudioContext);
    setIsSupported(hasMedia && hasAudioCtx);
  }, []);

  // Stop active speech playback
  const cancelSpeech = useCallback(() => {
    if (activeControllerRef.current && isSpeakingRef.current) {
      activeControllerRef.current.abort();
      activeControllerRef.current = null;
    }
    isSpeakingRef.current = false;
    setIsSpeaking(false);
    setAudioLevel(0);
  }, []);

  // Stop active recording
  const stopListening = useCallback(() => {
    if (activeControllerRef.current && !isSpeakingRef.current) {
      activeControllerRef.current.abort();
      activeControllerRef.current = null;
    }
    setIsListening(false);
    setAudioLevel(0);
    isTurnRunningRef.current = false;
  }, []);

  // Speech Output with Gemini Neural TTS
  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (!text || !text.trim()) {
      if (onEnd) onEnd();
      return;
    }

    // Cancel any ongoing speech or recording
    if (activeControllerRef.current) {
      activeControllerRef.current.abort();
    }

    const controller = new AbortController();
    activeControllerRef.current = controller;
    isSpeakingRef.current = true;
    setIsSpeaking(true);
    setSpeechError(null);

    (async () => {
      try {
        // 1. Fetch neural audio from /api/jarvis/tts
        const blob = await fetchSpeech(text, controller.signal);

        // 2. Play speech and drive audio levels into orb animation
        await playSpeech(blob, {
          onLevel: (lvl) => {
            if (!controller.signal.aborted) {
              setAudioLevel(lvl);
            }
          },
          signal: controller.signal,
        });
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          console.warn('[Jarvis TTS Playback Notice]:', err?.message || err);
          if (err instanceof VoiceError) {
            setSpeechError(err.code);
          } else {
            setSpeechError('MODEL_FAILED');
          }
        }
      } finally {
        if (activeControllerRef.current === controller) {
          activeControllerRef.current = null;
        }
        isSpeakingRef.current = false;
        setIsSpeaking(false);
        setAudioLevel(0);
        if (onEnd) onEnd();
      }
    })();
  }, []);

  // Start Voice Listening / Turn Loop
  const startListening = useCallback(async () => {
    // If speaking, interrupt speech immediately and transition to listening
    if (isSpeakingRef.current) {
      cancelSpeech();
    }

    // Guard: ignore if recording turn is already running
    if (isTurnRunningRef.current) {
      return;
    }

    isTurnRunningRef.current = true;

    // Must unlock AudioContext inside the user gesture
    try {
      await unlockAudio();
    } catch {
      // AudioContext unlocking notice
    }

    const controller = new AbortController();
    activeControllerRef.current = controller;

    setTranscript('');
    setSpeechError(null);
    setIsListening(true);

    try {
      // 1. Record voice utterance with live audio levels fed to orb
      const recordingBlob = await recordUtterance({
        onLevel: (lvl) => {
          if (!controller.signal.aborted) {
            setAudioLevel(lvl);
          }
        },
        signal: controller.signal,
      });

      setIsListening(false);
      setAudioLevel(0);

      // 2. Transcribe recorded audio with /api/jarvis/stt
      const spokenText = await transcribe(
        recordingBlob,
        languageRef.current,
        controller.signal
      );

      if (spokenText) {
        setTranscript(spokenText);
        if (onTranscriptReadyRef.current) {
          onTranscriptReadyRef.current(spokenText);
        }
      }
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        console.warn('[Jarvis Voice Input Error]:', err?.message || err);
        if (err instanceof VoiceError) {
          setSpeechError(err.code);
        } else {
          setSpeechError('MIC_FAILED');
        }
      }
    } finally {
      if (activeControllerRef.current === controller) {
        activeControllerRef.current = null;
      }
      setIsListening(false);
      setAudioLevel(0);
      isTurnRunningRef.current = false;
    }
  }, [cancelSpeech]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (activeControllerRef.current) {
        activeControllerRef.current.abort();
        activeControllerRef.current = null;
      }
      isTurnRunningRef.current = false;
      isSpeakingRef.current = false;
    };
  }, []);

  return {
    isSupported,
    isListening,
    isSpeaking,
    audioLevel,
    transcript,
    speechError,
    analyserNode: null, // Audio level is directly streamed via onLevel
    startListening,
    stopListening,
    speak,
    cancelSpeech,
  };
}
