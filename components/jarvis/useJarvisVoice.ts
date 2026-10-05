'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { AssistantVisualState } from './HologramCanvas';

interface UseJarvisVoiceOptions {
  onTranscriptReady?: (transcript: string) => void;
  language?: string;
}

export function useJarvisVoice({ onTranscriptReady, language = 'en-IN' }: UseJarvisVoiceOptions = {}) {
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [transcript, setTranscript] = useState<string>('');
  const [speechError, setSpeechError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const speechVolumeIntervalRef = useRef<any>(null);

  // Stop Audio Monitoring Callback
  const stopAudioMonitoring = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    setAudioLevel(0);
  }, []);

  // Initialize Web Speech Recognition
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = language || 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        let interimText = '';
        let finalText = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i];
          if (item.isFinal) {
            finalText += item[0].transcript;
          } else {
            interimText += item[0].transcript;
          }
        }

        const currentText = finalText || interimText;
        setTranscript(currentText);

        if (finalText && onTranscriptReady) {
          onTranscriptReady(finalText.trim());
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error !== 'no-speech') {
          console.warn('[Jarvis Voice Input Error]:', event.error);
          setSpeechError(event.error);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        stopAudioMonitoring();
      };

      recognitionRef.current = recognition;
    } catch (err) {
      console.warn('[Speech Recognition Init Error]:', err);
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
      stopAudioMonitoring();
    };
  }, [language, onTranscriptReady, stopAudioMonitoring]);

  // Start Mic Audio Monitoring with Web Audio API AnalyserNode
  const startAudioMonitoring = useCallback(async () => {
    try {
      if (!audioContextRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioCtx();
      }

      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      mediaStreamRef.current = stream;

      const source = audioContextRef.current.createMediaStreamSource(stream);
      const analyser = audioContextRef.current.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const monitorLoop = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / (dataArray.length * 255);
        setAudioLevel(Math.min(1.0, average * 2.2));

        animationFrameRef.current = requestAnimationFrame(monitorLoop);
      };

      animationFrameRef.current = requestAnimationFrame(monitorLoop);
    } catch {
      // Audio permission not granted or unsupported; continue with simulated level
    }
  }, []);

  // Start Voice Listening
  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    setTranscript('');
    try {
      recognitionRef.current.start();
      startAudioMonitoring();
    } catch (e) {
      console.warn('[Speech Recognition Start Ignored]:', e);
    }
  }, [startAudioMonitoring]);

  // Stop Voice Listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsListening(false);
    stopAudioMonitoring();
  }, [stopAudioMonitoring]);

  // Speech Output with SpeechSynthesis
  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }

    window.speechSynthesis.cancel();

    // Clean markdown and non-verbal tokens for natural speech
    const cleanText = text
      .replace(/[*_#`~>[\]]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) {
      if (onEnd) onEnd();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Pick best available voice: prioritize Indian English (en-IN), Hindi (hi-IN), or natural low-pitched English
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice =
      voices.find((v) => v.lang.includes('en-IN') || v.lang.includes('en_IN')) ||
      voices.find((v) => v.lang.includes('hi-IN')) ||
      voices.find((v) => v.name.toLowerCase().includes('natural') || v.name.toLowerCase().includes('george')) ||
      voices.find((v) => v.lang.startsWith('en')) ||
      voices[0];

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.pitch = 0.94; // Calm, authoritative lower tone
    utterance.rate = 1.0; // Natural pacing

    utterance.onstart = () => {
      setIsSpeaking(true);
      // Simulate voice output modulation on audio level
      clearInterval(speechVolumeIntervalRef.current);
      speechVolumeIntervalRef.current = setInterval(() => {
        setAudioLevel(0.3 + Math.random() * 0.55);
      }, 100);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      clearInterval(speechVolumeIntervalRef.current);
      setAudioLevel(0);
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      clearInterval(speechVolumeIntervalRef.current);
      setAudioLevel(0);
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  const cancelSpeech = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    clearInterval(speechVolumeIntervalRef.current);
    setAudioLevel(0);
  }, []);

  return {
    isSupported,
    isListening,
    isSpeaking,
    audioLevel,
    transcript,
    speechError,
    analyserNode: analyserRef.current,
    startListening,
    stopListening,
    speak,
    cancelSpeech,
  };
}
