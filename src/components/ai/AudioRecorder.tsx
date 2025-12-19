/**
 * AudioRecorder Component
 * =======================
 *
 * Handles browser audio recording using MediaRecorder API.
 * Records in WebM format (natively supported by browsers and Gemini API).
 */

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';

/** Audio recording configuration. */
interface AudioRecorderConfig {
  /** MIME type for recording. Default: audio/webm */
  mimeType?: string;
  /** Audio bitrate in bits/second. Default: 128000 */
  audioBitsPerSecond?: number;
}

/** Props for AudioRecorder hook. */
export interface UseAudioRecorderProps {
  /** Called when recording stops with the audio blob. */
  onRecordingComplete: (blob: Blob, durationSec: number) => void;
  /** Called on recording error. */
  onError?: (error: Error) => void;
  /** Recording configuration. */
  config?: AudioRecorderConfig;
}

/** Return type for useAudioRecorder hook. */
export interface UseAudioRecorderReturn {
  /** Whether browser supports audio recording. */
  isSupported: boolean;
  /** Whether currently recording. */
  isRecording: boolean;
  /** Whether recording is paused. */
  isPaused: boolean;
  /** Current recording duration in seconds. */
  duration: number;
  /** Start recording. */
  startRecording: () => Promise<void>;
  /** Stop recording and trigger onRecordingComplete. */
  stopRecording: () => void;
  /** Pause recording. */
  pauseRecording: () => void;
  /** Resume paused recording. */
  resumeRecording: () => void;
}

const DEFAULT_CONFIG: Required<AudioRecorderConfig> = {
  mimeType: 'audio/webm;codecs=opus',
  audioBitsPerSecond: 128000,
};

/**
 * Hook for recording audio in the browser.
 *
 * Uses MediaRecorder API to capture audio from the microphone.
 * Outputs WebM format compatible with Gemini API.
 *
 * @example
 * ```tsx
 * const { startRecording, stopRecording, isRecording, duration } = useAudioRecorder({
 *   onRecordingComplete: (blob, duration) => uploadToStorage(blob),
 *   onError: (error) => console.error(error),
 * });
 * ```
 */
export function useAudioRecorder({
  onRecordingComplete,
  onError,
  config = {},
}: UseAudioRecorderProps): UseAudioRecorderReturn {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const pausedDurationRef = useRef<number>(0);
  const pauseStartRef = useRef<number>(0);
  const durationRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);

  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);

  const mergedConfig = useMemo(
    () => ({ ...DEFAULT_CONFIG, ...config }),
    [config]
  );

  const isSupported =
    typeof window !== 'undefined' &&
    'MediaRecorder' in window &&
    'mediaDevices' in navigator;

  const startRecording = useCallback(async () => {
    if (!isSupported) {
      onError?.(new Error('Audio recording not supported in this browser'));
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 48000,
        },
      });

      streamRef.current = stream;
      chunksRef.current = [];
      pausedDurationRef.current = 0;

      const mimeType = MediaRecorder.isTypeSupported(mergedConfig.mimeType)
        ? mergedConfig.mimeType
        : 'audio/webm';

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: mergedConfig.audioBitsPerSecond,
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const finalDuration = durationRef.current;
        onRecordingComplete(blob, finalDuration);

        // Cleanup
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        chunksRef.current = [];
      };

      mediaRecorder.onerror = (event) => {
        onError?.(new Error(`MediaRecorder error: ${event}`));
        setIsRecording(false);
        setIsPaused(false);
      };

      mediaRecorderRef.current = mediaRecorder;
      startTimeRef.current = Date.now();
      mediaRecorder.start(1000); // Collect data every second

      setIsRecording(true);
      setIsPaused(false);
      setDuration(0);
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error('Failed to start recording'));
    }
  }, [isSupported, mergedConfig, onRecordingComplete, onError]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      cancelAnimationFrame(animationFrameRef.current);
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
    }
  }, []);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      pauseStartRef.current = Date.now();
      cancelAnimationFrame(animationFrameRef.current);
      setIsPaused(true);
    }
  }, []);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      pausedDurationRef.current += Date.now() - pauseStartRef.current;
      mediaRecorderRef.current.resume();
      setIsPaused(false);
    }
  }, []);

  // Update duration while recording
  useEffect(() => {
    if (!isRecording || isPaused) return;

    const tick = () => {
      const now = Date.now();
      const elapsed = (now - startTimeRef.current - pausedDurationRef.current) / 1000;
      durationRef.current = elapsed;
      setDuration(elapsed);
      animationFrameRef.current = requestAnimationFrame(tick);
    };

    animationFrameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [isRecording, isPaused]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  return {
    isSupported,
    isRecording,
    isPaused,
    duration,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
  };
}
