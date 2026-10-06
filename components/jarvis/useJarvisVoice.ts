'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// Maps language codes from Hayaati's 25 locales to SpeechRecognition/SpeechSynthesis BCP-47 tags
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
    if ('speechSynthesis' in window && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  } catch {
    // Graceful unlock fallback
  }
}

// Clean markdown, symbols, and formatting for spoken speech synthesis
function cleanTextForSpeech(text: string): string {
  if (!text) return '';
  return text
    .replace(/[*_#`~>]/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

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

  // References
  const onTranscriptReadyRef = useRef(onTranscriptReady);
  const languageRef = useRef(language);
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const micAnimFrameRef = useRef<number | null>(null);
  const speechAnimFrameRef = useRef<number | null>(null);
  const isTurnRunningRef = useRef<boolean>(false);
  const isSpeakingRef = useRef<boolean>(false);

  useEffect(() => {
    onTranscriptReadyRef.current = onTranscriptReady;
  }, [onTranscriptReady]);

  useEffect(() => {
    languageRef.current = language;
  }, [language]);

  // Check Web Speech and Audio capabilities on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hasSpeechRec = Boolean(
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    );
    const hasMedia = Boolean(navigator?.mediaDevices?.getUserMedia);
    const hasAudioCtx = Boolean(window.AudioContext || (window as any).webkitAudioContext);
    const hasSynthesis = 'speechSynthesis' in window;

    setIsSupported((hasSpeechRec || hasMedia) && (hasAudioCtx || hasSynthesis));
  }, []);

  // Stop active microphone stream & audio level monitoring
  const stopMicMonitoring = useCallback(() => {
    if (micAnimFrameRef.current) {
      cancelAnimationFrame(micAnimFrameRef.current);
      micAnimFrameRef.current = null;
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
    analyserRef.current = null;
  }, []);

  // Cancel any active speech output and animation
  const cancelSpeech = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    if (speechAnimFrameRef.current) {
      cancelAnimationFrame(speechAnimFrameRef.current);
      speechAnimFrameRef.current = null;
    }
    isSpeakingRef.current = false;
    setIsSpeaking(false);
    setAudioLevel(0);
  }, []);

  // Stop active voice recognition
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    stopMicMonitoring();
    setIsListening(false);
    setAudioLevel(0);
    isTurnRunningRef.current = false;
  }, [stopMicMonitoring]);

  // Start Voice Listening (Speech Recognition + Microphone Amplitude Metering)
  const startListening = useCallback(async () => {
    if (typeof window === 'undefined') return;

    // Interrupt active speech if user speaks or taps mic
    if (isSpeakingRef.current) {
      cancelSpeech();
    }

    // Guard against concurrent turn starts
    if (isTurnRunningRef.current) return;
    isTurnRunningRef.current = true;

    setTranscript('');
    setSpeechError(null);

    // 1. Start live microphone monitoring for real-time 3D hologram reactivity
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        mediaStreamRef.current = stream;

        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          if (ctx.state === 'suspended') {
            await ctx.resume().catch(() => {});
          }
          audioContextRef.current = ctx;

          const analyser = ctx.createAnalyser();
          analyser.fftSize = 256;
          analyser.smoothingTimeConstant = 0.5;
          analyserRef.current = analyser;

          const source = ctx.createMediaStreamSource(stream);
          source.connect(analyser);

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const monitorAudio = () => {
            if (!analyserRef.current) return;
            analyserRef.current.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const average = sum / dataArray.length;
            const normalized = Math.min(1.0, (average / 110));
            setAudioLevel(normalized);
            micAnimFrameRef.current = requestAnimationFrame(monitorAudio);
          };
          micAnimFrameRef.current = requestAnimationFrame(monitorAudio);
        }
      }
    } catch (micErr: any) {
      const errName = micErr?.name || '';
      if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError') {
        setSpeechError('DENIED');
      } else if (errName === 'NotFoundError' || errName === 'DevicesNotFoundError') {
        setSpeechError('NO_DEVICE');
      } else {
        setSpeechError('MIC_FAILED');
      }
    }

    // 2. Start Speech Recognition
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError('UNSUPPORTED');
      setIsListening(false);
      isTurnRunningRef.current = false;
      stopMicMonitoring();
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      const targetLang =
        LOCALE_TO_VOICE_LANG[languageRef.current] ||
        languageRef.current ||
        'en-US';

      recognition.lang = targetLang;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        let isFinal = false;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i];
          if (item[0]) {
            currentTranscript += item[0].transcript;
          }
          if (item.isFinal) {
            isFinal = true;
          }
        }

        setTranscript(currentTranscript);

        if (isFinal && currentTranscript.trim()) {
          const finalText = currentTranscript.trim();
          stopListening();
          if (onTranscriptReadyRef.current) {
            onTranscriptReadyRef.current(finalText);
          }
        }
      };

      recognition.onerror = (event: any) => {
        const error = event?.error;
        if (error === 'not-allowed') {
          setSpeechError('DENIED');
        } else if (error === 'no-speech') {
          // Graceful silence timeout: reset to idle
        } else if (error === 'audio-capture') {
          setSpeechError('MIC_FAILED');
        } else if (error === 'network') {
          setSpeechError('NETWORK');
        } else {
          setSpeechError('MIC_FAILED');
        }
        stopListening();
      };

      recognition.onend = () => {
        stopListening();
      };

      recognition.start();
    } catch {
      setSpeechError('MIC_FAILED');
      stopListening();
    }
  }, [cancelSpeech, stopListening, stopMicMonitoring]);

  // Voice Output (Original Speech Synthesis with Audio Envelope Reactivity)
  const speak = useCallback(
    (text: string, onEnd?: () => void) => {
      if (typeof window === 'undefined' || !text || !text.trim()) {
        if (onEnd) onEnd();
        return;
      }

      // Interrupt any current speech or listening
      cancelSpeech();
      stopListening();

      const cleanedText = cleanTextForSpeech(text);
      if (!cleanedText) {
        if (onEnd) onEnd();
        return;
      }

      if (!('speechSynthesis' in window)) {
        console.warn('[Jarvis Voice]: window.speechSynthesis unavailable in this environment.');
        if (onEnd) onEnd();
        return;
      }

      const synth = window.speechSynthesis;
      const utterance = new SpeechSynthesisUtterance(cleanedText);
      const targetLang =
        LOCALE_TO_VOICE_LANG[languageRef.current] ||
        languageRef.current ||
        'en-US';

      utterance.lang = targetLang;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      // Select best matching natural system voice
      const voices = synth.getVoices();
      if (voices.length > 0) {
        const langPrefix = targetLang.split('-')[0].toLowerCase();
        const matchedVoice =
          voices.find((v) => v.lang === targetLang) ||
          voices.find((v) => v.lang.toLowerCase().startsWith(langPrefix)) ||
          voices.find((v) => v.default);
        if (matchedVoice) {
          utterance.voice = matchedVoice;
        }
      }

      // Live Vocal Envelope Modulation to drive 3D Hologram & Backdrop during speech
      utterance.onstart = () => {
        isSpeakingRef.current = true;
        setIsSpeaking(true);
        setSpeechError(null);

        const startTime = Date.now();
        const modulate = () => {
          if (!isSpeakingRef.current) return;
          const elapsed = (Date.now() - startTime) / 1000;
          // Natural speech cadence envelope
          const wave = Math.abs(Math.sin(elapsed * 6.5) * Math.cos(elapsed * 2.8));
          const microJitter = (Math.random() - 0.5) * 0.12;
          const level = Math.max(0.18, Math.min(0.9, 0.42 + wave * 0.44 + microJitter));
          setAudioLevel(level);
          speechAnimFrameRef.current = requestAnimationFrame(modulate);
        };
        speechAnimFrameRef.current = requestAnimationFrame(modulate);
      };

      const finishSpeech = () => {
        if (speechAnimFrameRef.current) {
          cancelAnimationFrame(speechAnimFrameRef.current);
          speechAnimFrameRef.current = null;
        }
        isSpeakingRef.current = false;
        setIsSpeaking(false);
        setAudioLevel(0);
        if (onEnd) onEnd();
      };

      utterance.onend = finishSpeech;
      utterance.onerror = (err) => {
        if (err.error !== 'canceled' && err.error !== 'interrupted') {
          console.warn('[Jarvis Voice]: Speech synthesis notice:', err.error);
        }
        finishSpeech();
      };

      synth.speak(utterance);
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
