/**
 * useAIScribe Hook Tests - AI medical transcription.
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAIScribe } from '../../hooks/useAIScribe';
import * as firebaseStorage from 'firebase/storage';
import * as firebaseFirestore from 'firebase/firestore';
import type { AIScribeResult } from '../../types';

// Mock dependencies
vi.mock('../../contexts/ClinicContext', () => ({
  useClinicContext: vi.fn(() => ({
    clinicId: 'clinic-123',
    userProfile: { id: 'user-123', displayName: 'Dr. João' },
  })),
}));

vi.mock('../../services/firebase', () => ({
  storage: {},
  db: {},
}));

vi.mock('firebase/storage', () => ({
  ref: vi.fn(),
  uploadBytes: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  setDoc: vi.fn(),
  onSnapshot: vi.fn(),
}));

// Mock useAudioRecorder
const mockStartRecording = vi.fn();
const mockStopRecording = vi.fn();
const mockPauseRecording = vi.fn();
const mockResumeRecording = vi.fn();

vi.mock('../../components/ai/AudioRecorder', () => ({
  useAudioRecorder: vi.fn((options) => {
    // Store the callbacks for later use
    (global as unknown as { audioRecorderCallbacks: typeof options }).audioRecorderCallbacks = options;
    return {
      isRecording: false,
      isPaused: false,
      duration: 0,
      startRecording: mockStartRecording,
      stopRecording: mockStopRecording,
      pauseRecording: mockPauseRecording,
      resumeRecording: mockResumeRecording,
    };
  }),
}));

import { useClinicContext } from '../../contexts/ClinicContext';

const mockResult: AIScribeResult = {
  transcription: 'Paciente relata dor de cabeça...',
  soap: {
    subjective: 'Paciente relata dor de cabeça há 2 dias',
    objective: 'PA 120/80, FC 72',
    assessment: 'Cefaleia tensional',
    plan: 'Dipirona 500mg SOS',
  },
  confidence: 0.95,
};

describe('useAIScribe', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useClinicContext).mockReturnValue({
      clinicId: 'clinic-123',
      userProfile: { id: 'user-123', displayName: 'Dr. João' },
    } as unknown as ReturnType<typeof useClinicContext>);

    vi.mocked(firebaseStorage.uploadBytes).mockResolvedValue({
      ref: {} as firebaseStorage.StorageReference,
      metadata: {} as firebaseStorage.FullMetadata,
    });

    vi.mocked(firebaseFirestore.setDoc).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initial state', () => {
    it('should start with idle status', () => {
      const { result } = renderHook(() =>
        useAIScribe({ patientId: 'patient-123' })
      );

      expect(result.current.status).toBe('idle');
      expect(result.current.isRecording).toBe(false);
      expect(result.current.isPaused).toBe(false);
      expect(result.current.duration).toBe(0);
      expect(result.current.result).toBe(null);
      expect(result.current.error).toBe(null);
    });
  });

  describe('startRecording', () => {
    it('should start recording and update status', async () => {
      mockStartRecording.mockResolvedValue(undefined);

      const { result } = renderHook(() =>
        useAIScribe({ patientId: 'patient-123' })
      );

      await act(async () => {
        await result.current.startRecording();
      });

      expect(mockStartRecording).toHaveBeenCalled();
      expect(result.current.status).toBe('recording');
    });

    it('should reset previous state before starting', async () => {
      mockStartRecording.mockResolvedValue(undefined);

      const { result } = renderHook(() =>
        useAIScribe({ patientId: 'patient-123' })
      );

      // Simulate previous error state
      act(() => {
        result.current.reset();
      });

      await act(async () => {
        await result.current.startRecording();
      });

      expect(result.current.result).toBe(null);
      expect(result.current.error).toBe(null);
    });
  });

  describe('stopRecording', () => {
    it('should stop recording', () => {
      const { result } = renderHook(() =>
        useAIScribe({ patientId: 'patient-123' })
      );

      act(() => {
        result.current.stopRecording();
      });

      expect(mockStopRecording).toHaveBeenCalled();
    });
  });

  describe('pauseRecording', () => {
    it('should pause recording', () => {
      const { result } = renderHook(() =>
        useAIScribe({ patientId: 'patient-123' })
      );

      act(() => {
        result.current.pauseRecording();
      });

      expect(mockPauseRecording).toHaveBeenCalled();
    });
  });

  describe('resumeRecording', () => {
    it('should resume recording', () => {
      const { result } = renderHook(() =>
        useAIScribe({ patientId: 'patient-123' })
      );

      act(() => {
        result.current.resumeRecording();
      });

      expect(mockResumeRecording).toHaveBeenCalled();
    });
  });

  describe('reset', () => {
    it('should reset to idle state', () => {
      const { result } = renderHook(() =>
        useAIScribe({ patientId: 'patient-123' })
      );

      act(() => {
        result.current.reset();
      });

      expect(result.current.status).toBe('idle');
      expect(result.current.result).toBe(null);
      expect(result.current.error).toBe(null);
    });
  });

  describe('audio upload and processing', () => {
    it('should upload audio and create session on recording complete', async () => {
      const onComplete = vi.fn();
      const blob = new Blob(['test audio'], { type: 'audio/webm' });

      // Mock onSnapshot to simulate successful processing
      vi.mocked(firebaseFirestore.onSnapshot).mockImplementation(
        (_docRef, callback) => {
          setTimeout(() => {
            (callback as (snapshot: { data: () => unknown }) => void)({
              data: () => ({
                id: 'session-123',
                status: 'ready',
                result: mockResult,
              }),
            });
          }, 10);
          return vi.fn();
        }
      );

      renderHook(() =>
        useAIScribe({ patientId: 'patient-123', onComplete })
      );

      // Simulate recording completion via callback
      const callbacks = (global as unknown as { audioRecorderCallbacks: { onRecordingComplete: (blob: Blob, duration: number) => void } }).audioRecorderCallbacks;

      await act(async () => {
        await callbacks.onRecordingComplete(blob, 30);
      });

      await waitFor(() => {
        expect(firebaseStorage.uploadBytes).toHaveBeenCalled();
      });

      expect(firebaseFirestore.setDoc).toHaveBeenCalled();
    });

    it('should handle upload errors', async () => {
      const onError = vi.fn();
      const blob = new Blob(['test audio'], { type: 'audio/webm' });

      vi.mocked(firebaseStorage.uploadBytes).mockRejectedValue(
        new Error('Upload failed')
      );

      renderHook(() =>
        useAIScribe({ patientId: 'patient-123', onError })
      );

      const callbacks = (global as unknown as { audioRecorderCallbacks: { onRecordingComplete: (blob: Blob, duration: number) => void } }).audioRecorderCallbacks;

      await act(async () => {
        await callbacks.onRecordingComplete(blob, 30);
      });

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(expect.any(Error));
      });
    });

    it('should handle recording errors', async () => {
      const onError = vi.fn();

      renderHook(() =>
        useAIScribe({ patientId: 'patient-123', onError })
      );

      const callbacks = (global as unknown as { audioRecorderCallbacks: { onError: (error: Error) => void } }).audioRecorderCallbacks;

      act(() => {
        callbacks.onError(new Error('Microphone access denied'));
      });

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Microphone access denied' })
      );
    });

    it('should handle processing errors from Firestore', async () => {
      const onError = vi.fn();
      const blob = new Blob(['test audio'], { type: 'audio/webm' });

      vi.mocked(firebaseFirestore.onSnapshot).mockImplementation(
        (_docRef, callback) => {
          setTimeout(() => {
            (callback as (snapshot: { data: () => unknown }) => void)({
              data: () => ({
                id: 'session-123',
                status: 'error',
                error: 'Processing failed',
              }),
            });
          }, 10);
          return vi.fn();
        }
      );

      renderHook(() =>
        useAIScribe({ patientId: 'patient-123', onError })
      );

      const callbacks = (global as unknown as { audioRecorderCallbacks: { onRecordingComplete: (blob: Blob, duration: number) => void } }).audioRecorderCallbacks;

      await act(async () => {
        await callbacks.onRecordingComplete(blob, 30);
      });

      await waitFor(() => {
        expect(onError).toHaveBeenCalled();
      });
    });
  });

  describe('callbacks', () => {
    it('should call onComplete when processing succeeds', async () => {
      const onComplete = vi.fn();
      const blob = new Blob(['test audio'], { type: 'audio/webm' });

      vi.mocked(firebaseFirestore.onSnapshot).mockImplementation(
        (_docRef, callback) => {
          setTimeout(() => {
            (callback as (snapshot: { data: () => unknown }) => void)({
              data: () => ({
                id: 'session-123',
                status: 'ready',
                result: mockResult,
              }),
            });
          }, 10);
          return vi.fn();
        }
      );

      renderHook(() =>
        useAIScribe({ patientId: 'patient-123', onComplete })
      );

      const callbacks = (global as unknown as { audioRecorderCallbacks: { onRecordingComplete: (blob: Blob, duration: number) => void } }).audioRecorderCallbacks;

      await act(async () => {
        await callbacks.onRecordingComplete(blob, 30);
      });

      await waitFor(() => {
        expect(onComplete).toHaveBeenCalledWith(mockResult);
      });
    });

    it('should call onError when processing fails', async () => {
      const onError = vi.fn();
      const blob = new Blob(['test audio'], { type: 'audio/webm' });

      vi.mocked(firebaseFirestore.onSnapshot).mockImplementation(
        (_docRef, callback) => {
          setTimeout(() => {
            (callback as (snapshot: { data: () => unknown }) => void)({
              data: () => ({
                id: 'session-123',
                status: 'error',
                error: 'AI processing failed',
              }),
            });
          }, 10);
          return vi.fn();
        }
      );

      renderHook(() =>
        useAIScribe({ patientId: 'patient-123', onError })
      );

      const callbacks = (global as unknown as { audioRecorderCallbacks: { onRecordingComplete: (blob: Blob, duration: number) => void } }).audioRecorderCallbacks;

      await act(async () => {
        await callbacks.onRecordingComplete(blob, 30);
      });

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(
          expect.objectContaining({ message: 'AI processing failed' })
        );
      });
    });
  });

  describe('clinic context validation', () => {
    it('should throw error when clinic ID not available', async () => {
      const onError = vi.fn();
      const blob = new Blob(['test audio'], { type: 'audio/webm' });

      vi.mocked(useClinicContext).mockReturnValue({
        clinicId: null,
        userProfile: null,
      } as unknown as ReturnType<typeof useClinicContext>);

      renderHook(() =>
        useAIScribe({ patientId: 'patient-123', onError })
      );

      const callbacks = (global as unknown as { audioRecorderCallbacks: { onRecordingComplete: (blob: Blob, duration: number) => void } }).audioRecorderCallbacks;

      await act(async () => {
        await callbacks.onRecordingComplete(blob, 30);
      });

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Clinic ID not available' })
      );
    });
  });
});
