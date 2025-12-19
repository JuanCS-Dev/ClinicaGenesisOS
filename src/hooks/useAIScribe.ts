/**
 * useAIScribe Hook
 * =================
 *
 * Manages the AI Scribe workflow:
 * 1. Record audio from browser
 * 2. Upload to Cloud Storage
 * 3. Wait for Cloud Function to process with Gemini
 * 4. Return transcription and SOAP note for review
 */

import { useState, useCallback } from 'react';
import { ref, uploadBytes } from 'firebase/storage';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { storage, db } from '../services/firebase';
import { useClinicContext } from '../contexts/ClinicContext';
import { useAudioRecorder } from '../components/ai/AudioRecorder';
import type {
  AIScribeStatus,
  AIScribeResult,
  AIScribeSession,
} from '../types';

interface UseAIScribeProps {
  /** Patient ID for the current consultation. */
  patientId: string;
  /** Called when processing completes successfully. */
  onComplete?: (result: AIScribeResult) => void;
  /** Called on error. */
  onError?: (error: Error) => void;
}

interface UseAIScribeReturn {
  /** Current status of the scribe session. */
  status: AIScribeStatus;
  /** Whether currently recording. */
  isRecording: boolean;
  /** Whether recording is paused. */
  isPaused: boolean;
  /** Recording duration in seconds. */
  duration: number;
  /** Processing result (when status is 'ready'). */
  result: AIScribeResult | null;
  /** Error message (when status is 'error'). */
  error: string | null;
  /** Start recording. */
  startRecording: () => Promise<void>;
  /** Stop recording and begin processing. */
  stopRecording: () => void;
  /** Pause recording. */
  pauseRecording: () => void;
  /** Resume recording. */
  resumeRecording: () => void;
  /** Reset to idle state. */
  reset: () => void;
}

/**
 * Hook for AI Scribe functionality.
 *
 * Handles the complete workflow from recording to SOAP generation.
 *
 * @example
 * ```tsx
 * const {
 *   status,
 *   isRecording,
 *   duration,
 *   result,
 *   startRecording,
 *   stopRecording,
 * } = useAIScribe({
 *   patientId: 'patient-123',
 *   onComplete: (result) => {
 *     // Show SOAP review modal
 *   },
 * });
 * ```
 */
export function useAIScribe({
  patientId,
  onComplete,
  onError,
}: UseAIScribeProps): UseAIScribeReturn {
  const { clinicId, userProfile } = useClinicContext();
  const [status, setStatus] = useState<AIScribeStatus>('idle');
  const [result, setResult] = useState<AIScribeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Session ID is set but only used for reset - using underscore to indicate intentional
  const [, setSessionId] = useState<string | null>(null);

  /**
   * Upload audio blob to Cloud Storage.
   */
  const uploadAudio = useCallback(
    async (blob: Blob, durationSec: number): Promise<string> => {
      if (!clinicId) throw new Error('Clinic ID not available');

      const timestamp = new Date().toISOString().split('T')[0];
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const path = `recordings/${clinicId}/${timestamp}/${patientId}/${id}.webm`;

      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, blob, {
        contentType: 'audio/webm',
        customMetadata: {
          patientId,
          clinicId,
          durationSec: durationSec.toString(),
          uploadedBy: userProfile?.id || 'unknown',
        },
      });

      return path;
    },
    [clinicId, patientId, userProfile]
  );

  /**
   * Create session document and listen for processing result.
   */
  const createSessionAndListen = useCallback(
    async (audioPath: string, durationSec: number): Promise<void> => {
      if (!clinicId) throw new Error('Clinic ID not available');

      const id = audioPath.split('/').pop()?.replace('.webm', '') || Date.now().toString();
      setSessionId(id);

      const sessionRef = doc(db, 'clinics', clinicId, 'aiScribeSessions', id);

      // Create session document (triggers Cloud Function)
      const session: Omit<AIScribeSession, 'id'> = {
        patientId,
        clinicId,
        status: 'processing',
        audioUrl: audioPath,
        audioDurationSec: durationSec,
        createdAt: new Date().toISOString(),
      };

      await setDoc(sessionRef, { ...session, id });

      // Listen for result
      const unsubscribe = onSnapshot(sessionRef, (snapshot) => {
        const data = snapshot.data() as AIScribeSession | undefined;

        if (!data) return;

        if (data.status === 'ready' && data.result) {
          setStatus('ready');
          setResult(data.result);
          onComplete?.(data.result);
          unsubscribe();
        } else if (data.status === 'error') {
          setStatus('error');
          setError(data.error || 'Unknown error');
          onError?.(new Error(data.error || 'Processing failed'));
          unsubscribe();
        }
      });

      // Timeout after 2 minutes
      setTimeout(() => {
        if (status === 'processing') {
          unsubscribe();
          setStatus('error');
          setError('Processing timeout');
          onError?.(new Error('Processing timeout'));
        }
      }, 120000);
    },
    [clinicId, patientId, status, onComplete, onError]
  );

  /**
   * Handle recording completion.
   */
  const handleRecordingComplete = useCallback(
    async (blob: Blob, durationSec: number) => {
      try {
        setStatus('uploading');
        const audioPath = await uploadAudio(blob, durationSec);

        setStatus('processing');
        await createSessionAndListen(audioPath, durationSec);
      } catch (err) {
        setStatus('error');
        const message = err instanceof Error ? err.message : 'Upload failed';
        setError(message);
        onError?.(err instanceof Error ? err : new Error(message));
      }
    },
    [uploadAudio, createSessionAndListen, onError]
  );

  /**
   * Handle recording error.
   */
  const handleRecordingError = useCallback(
    (err: Error) => {
      setStatus('error');
      setError(err.message);
      onError?.(err);
    },
    [onError]
  );

  const {
    isRecording,
    isPaused,
    duration,
    startRecording: startRec,
    stopRecording: stopRec,
    pauseRecording,
    resumeRecording,
  } = useAudioRecorder({
    onRecordingComplete: handleRecordingComplete,
    onError: handleRecordingError,
  });

  /**
   * Start recording with status update.
   */
  const startRecording = useCallback(async () => {
    setStatus('idle');
    setResult(null);
    setError(null);
    await startRec();
    setStatus('recording');
  }, [startRec]);

  /**
   * Stop recording (triggers upload and processing).
   */
  const stopRecording = useCallback(() => {
    stopRec();
    // Status will be updated in handleRecordingComplete
  }, [stopRec]);

  /**
   * Reset to idle state.
   */
  const reset = useCallback(() => {
    setStatus('idle');
    setResult(null);
    setError(null);
    setSessionId(null);
  }, []);

  return {
    status,
    isRecording,
    isPaused,
    duration,
    result,
    error,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    reset,
  };
}

export default useAIScribe;
