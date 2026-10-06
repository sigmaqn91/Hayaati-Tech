'use client';

export type VoiceErrorCode =
  | 'UNSUPPORTED'
  | 'INSECURE'
  | 'DENIED'
  | 'NO_DEVICE'
  | 'MIC_FAILED'
  | 'RATE_LIMIT'
  | 'PROVIDER_QUOTA'
  | 'NO_KEY'
  | 'MODEL_FAILED'
  | 'NETWORK'
  | 'SERVER_ERROR';

export class VoiceError extends Error {
  code: VoiceErrorCode;
  retryAfter?: number;

  constructor(code: VoiceErrorCode, message: string, retryAfter?: number) {
    super(message);
    this.name = 'VoiceError';
    this.code = code;
    this.retryAfter = retryAfter;
  }
}

let sharedAudioContext: AudioContext | null = null;

/**
 * Returns or initializes the shared browser AudioContext.
 */
export function getAudioContext(): AudioContext {
  if (typeof window === 'undefined') {
    throw new VoiceError('UNSUPPORTED', 'Web Audio API is only available in browser environments.');
  }
  if (!sharedAudioContext) {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) {
      throw new VoiceError('UNSUPPORTED', 'AudioContext is not supported on this device.');
    }
    sharedAudioContext = new AudioCtx();
  }
  return sharedAudioContext;
}

/**
 * Unlocks the AudioContext within a user interaction gesture (tap / click).
 */
export async function unlockAudio(): Promise<AudioContext> {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }
  return ctx;
}

interface RecordUtteranceOptions {
  onLevel?: (level: number) => void;
  signal?: AbortSignal;
}

/**
 * Records a single voice utterance from the user's microphone.
 * Feeds live volume levels to onLevel and automatically stops on silence or signal.
 */
export async function recordUtterance({
  onLevel,
  signal,
}: RecordUtteranceOptions = {}): Promise<Blob> {
  if (typeof window === 'undefined') {
    throw new VoiceError('UNSUPPORTED', 'Microphone recording requires a browser window.');
  }

  if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    throw new VoiceError('INSECURE', 'Microphone recording requires a secure HTTPS context.');
  }

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new VoiceError('UNSUPPORTED', 'Audio recording is not supported on this browser.');
  }

  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });
  } catch (err: any) {
    if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
      throw new VoiceError('DENIED', 'Microphone permission was denied by the user or browser.');
    }
    if (err?.name === 'NotFoundError' || err?.name === 'DevicesNotFoundError') {
      throw new VoiceError('NO_DEVICE', 'No microphone input device was detected.');
    }
    throw new VoiceError('MIC_FAILED', err?.message || 'Failed to initialize microphone.');
  }

  if (signal?.aborted) {
    stream.getTracks().forEach((t) => t.stop());
    throw new DOMException('Aborted', 'AbortError');
  }

  const audioCtx = await unlockAudio();
  const source = audioCtx.createMediaStreamSource(stream);
  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 64;
  analyser.smoothingTimeConstant = 0.8;
  source.connect(analyser);

  const freqData = new Uint8Array(analyser.frequencyBinCount);
  let animFrameId: number | null = null;

  // Best supported mimeType
  let mimeType = 'audio/webm';
  if (typeof MediaRecorder !== 'undefined') {
    if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
      mimeType = 'audio/webm;codecs=opus';
    } else if (MediaRecorder.isTypeSupported('audio/webm')) {
      mimeType = 'audio/webm';
    } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
      mimeType = 'audio/mp4';
    } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
      mimeType = 'audio/ogg';
    }
  }

  return new Promise<Blob>((resolve, reject) => {
    let recorder: MediaRecorder;
    try {
      recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    } catch {
      recorder = new MediaRecorder(stream);
    }

    const chunks: Blob[] = [];
    let hasDetectedSpeech = false;
    let silenceStart: number | null = null;
    let maxTimeoutId: any = null;

    const cleanup = () => {
      if (animFrameId) cancelAnimationFrame(animFrameId);
      if (maxTimeoutId) clearTimeout(maxTimeoutId);
      onLevel?.(0);
      try {
        source.disconnect();
        analyser.disconnect();
      } catch {}
      stream.getTracks().forEach((t) => t.stop());
    };

    const monitorLoop = () => {
      analyser.getByteFrequencyData(freqData);
      let sum = 0;
      for (let i = 0; i < freqData.length; i++) {
        sum += freqData[i];
      }
      const avg = sum / (freqData.length * 255);
      const level = Math.min(1.0, avg * 2.2);
      onLevel?.(level);

      const now = Date.now();
      if (level > 0.08) {
        hasDetectedSpeech = true;
        silenceStart = null;
      } else if (hasDetectedSpeech) {
        if (!silenceStart) {
          silenceStart = now;
        } else if (now - silenceStart > 1800) {
          // 1.8s of silence after speech detected -> automatically end utterance
          if (recorder.state === 'recording') {
            recorder.stop();
          }
          return;
        }
      }

      animFrameId = requestAnimationFrame(monitorLoop);
    };

    animFrameId = requestAnimationFrame(monitorLoop);

    // Hard ceiling: 15 seconds max turn
    maxTimeoutId = setTimeout(() => {
      if (recorder.state === 'recording') {
        recorder.stop();
      }
    }, 15000);

    if (signal) {
      signal.addEventListener(
        'abort',
        () => {
          cleanup();
          if (recorder.state === 'recording') {
            try {
              recorder.stop();
            } catch {}
          }
          reject(new DOMException('Aborted', 'AbortError'));
        },
        { once: true }
      );
    }

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    recorder.onerror = (e: any) => {
      cleanup();
      reject(new VoiceError('MIC_FAILED', e?.error?.message || 'Recording error occurred.'));
    };

    recorder.onstop = () => {
      cleanup();
      const outputBlob = new Blob(chunks, { type: recorder.mimeType || mimeType || 'audio/webm' });
      resolve(outputBlob);
    };

    recorder.start(100);
  });
}

/**
 * Sends recorded audio to the /api/jarvis/stt endpoint to obtain verbatim text transcription.
 */
export async function transcribe(
  recording: Blob,
  siteLanguage?: string,
  signal?: AbortSignal
): Promise<string> {
  const formData = new FormData();
  formData.append('audio', recording, 'utterance.webm');
  if (siteLanguage) {
    formData.append('language', siteLanguage);
  }

  let res: Response;
  try {
    res = await fetch('/api/jarvis/stt', {
      method: 'POST',
      body: formData,
      signal,
    });
  } catch (err: any) {
    if (err?.name === 'AbortError') throw err;
    throw new VoiceError('NETWORK', 'Network failure during speech transcription.');
  }

  if (res.status === 429) {
    const data = await res.json().catch(() => ({}));
    throw new VoiceError('RATE_LIMIT', data.error || 'Voice rate limit exceeded.', data.retryAfter);
  }

  if (res.status === 503) {
    throw new VoiceError('PROVIDER_QUOTA', 'Transcription service temporarily unavailable.');
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new VoiceError('SERVER_ERROR', data.error || 'Speech transcription failed.');
  }

  const data = await res.json().catch(() => ({}));
  return (data.text || data.transcript || '').trim();
}

/**
 * Requests speech audio from /api/jarvis/tts for the given text.
 * Returns an audio Blob (WAV format).
 */
export async function fetchSpeech(
  replyText: string,
  signal?: AbortSignal
): Promise<Blob> {
  let res: Response;
  try {
    res = await fetch('/api/jarvis/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: replyText }),
      signal,
    });
  } catch (err: any) {
    if (err?.name === 'AbortError') throw err;
    throw new VoiceError('NETWORK', 'Network connection interrupted during speech synthesis.');
  }

  if (res.status === 429) {
    const data = await res.json().catch(() => ({}));
    throw new VoiceError('RATE_LIMIT', data.error || 'Voice rate limit reached.', data.retryAfter);
  }

  if (res.status === 503) {
    throw new VoiceError('PROVIDER_QUOTA', 'Speech synthesis service quota reached.');
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new VoiceError('MODEL_FAILED', data.error || 'Speech audio generation failed.');
  }

  const data = await res.json().catch(() => ({}));
  if (!data?.audio) {
    throw new VoiceError('MODEL_FAILED', 'No audio bytes received from synthesizer.');
  }

  const binary = atob(data.audio);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return new Blob([bytes], { type: data.mimeType || 'audio/wav' });
}

interface PlaySpeechOptions {
  onLevel?: (level: number) => void;
  signal?: AbortSignal;
}

/**
 * Decodes and plays speech audio through Web Audio API.
 * Feeds live loudness to onLevel and aborts instantly when signal aborts.
 */
export async function playSpeech(
  blob: Blob,
  { onLevel, signal }: PlaySpeechOptions = {}
): Promise<void> {
  const audioCtx = await unlockAudio();
  const arrayBuffer = await blob.arrayBuffer();
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      onLevel?.(0);
      return reject(new DOMException('Aborted', 'AbortError'));
    }

    const source = audioCtx.createBufferSource();
    source.buffer = audioBuffer;

    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 64;
    analyser.smoothingTimeConstant = 0.8;

    source.connect(analyser);
    analyser.connect(audioCtx.destination);

    const freqData = new Uint8Array(analyser.frequencyBinCount);
    let animId: number | null = null;

    const cleanup = () => {
      if (animId) cancelAnimationFrame(animId);
      onLevel?.(0);
      try {
        source.disconnect();
        analyser.disconnect();
      } catch {}
    };

    const monitorLoop = () => {
      analyser.getByteFrequencyData(freqData);
      let sum = 0;
      for (let i = 0; i < freqData.length; i++) {
        sum += freqData[i];
      }
      const avg = sum / (freqData.length * 255);
      onLevel?.(Math.min(1.0, avg * 2.4));
      animId = requestAnimationFrame(monitorLoop);
    };

    animId = requestAnimationFrame(monitorLoop);

    const onAbort = () => {
      cleanup();
      try {
        source.stop();
      } catch {}
      reject(new DOMException('Aborted', 'AbortError'));
    };

    if (signal) {
      signal.addEventListener('abort', onAbort, { once: true });
    }

    source.onended = () => {
      cleanup();
      if (signal) {
        signal.removeEventListener('abort', onAbort);
      }
      resolve();
    };

    source.start(0);
  });
}
