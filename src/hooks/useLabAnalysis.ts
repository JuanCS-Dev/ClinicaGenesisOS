/**
 * useLabAnalysis Hook
 * ===================
 *
 * Manages the Clinical Reasoning workflow:
 * 1. Upload lab document (image/PDF)
 * 2. Wait for Cloud Function to OCR + analyze with AI
 * 3. Return structured analysis for physician review
 */

import { useState, useCallback, useEffect } from 'react';
import { useClinicContext } from '../contexts/ClinicContext';
import { clinicalReasoningService } from '../services/clinical-reasoning.service';
import type {
  LabAnalysisStatus,
  LabAnalysisResult,
  LabAnalysisSession,
  PatientContext,
  RawLabResult,
} from '../types';

interface UseLabAnalysisProps {
  /** Patient ID for the analysis. */
  patientId: string;
  /** Called when processing completes successfully. */
  onComplete?: (result: LabAnalysisResult) => void;
  /** Called on error. */
  onError?: (error: Error) => void;
}

interface UseLabAnalysisReturn {
  /** Current status of the analysis session. */
  status: LabAnalysisStatus;
  /** Whether upload is in progress. */
  isUploading: boolean;
  /** Whether analysis is processing. */
  isProcessing: boolean;
  /** Processing result (when status is 'ready'). */
  result: LabAnalysisResult | null;
  /** Full session data. */
  session: LabAnalysisSession | null;
  /** Error message (when status is 'error'). */
  error: string | null;
  /** Upload and analyze a lab document. */
  uploadAndAnalyze: (file: File, context: PatientContext) => Promise<void>;
  /** Analyze manually entered lab results. */
  analyzeManual: (results: RawLabResult[], context: PatientContext) => Promise<void>;
  /** Reset to idle state. */
  reset: () => void;
  /** Mark analysis as reviewed. */
  markReviewed: (feedback?: 'helpful' | 'not_helpful' | 'incorrect') => Promise<void>;
}

/**
 * Hook for Clinical Reasoning lab analysis functionality.
 *
 * Handles the complete workflow from upload to AI analysis.
 *
 * @example
 * ```tsx
 * const {
 *   status,
 *   isProcessing,
 *   result,
 *   uploadAndAnalyze,
 * } = useLabAnalysis({
 *   patientId: 'patient-123',
 *   onComplete: (result) => {
 *     // Show analysis results panel
 *   },
 * });
 * ```
 */
export function useLabAnalysis({
  patientId,
  onComplete,
  onError,
}: UseLabAnalysisProps): UseLabAnalysisReturn {
  const { clinicId, userProfile } = useClinicContext();
  const [status, setStatus] = useState<LabAnalysisStatus>('idle');
  const [session, setSession] = useState<LabAnalysisSession | null>(null);
  const [result, setResult] = useState<LabAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Subscribe to session updates when we have a sessionId
  useEffect(() => {
    if (!clinicId || !sessionId) return;

    const unsubscribe = clinicalReasoningService.subscribeToSession(
      clinicId,
      sessionId,
      (updatedSession) => {
        if (!updatedSession) return;

        setSession(updatedSession);
        setStatus(updatedSession.status);

        if (updatedSession.status === 'ready' && updatedSession.result) {
          setResult(updatedSession.result);
          onComplete?.(updatedSession.result);
        } else if (updatedSession.status === 'error') {
          setError(updatedSession.error || 'Unknown error');
          onError?.(new Error(updatedSession.error || 'Analysis failed'));
        }
      }
    );

    // Timeout after 3 minutes (analysis can take a while)
    const timeout = setTimeout(() => {
      if (status === 'processing' || status === 'extracting') {
        unsubscribe();
        setStatus('error');
        setError('Processing timeout');
        onError?.(new Error('Processing timeout'));
      }
    }, 180000);

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, [clinicId, sessionId, status, onComplete, onError]);

  /**
   * Upload a lab document and start analysis.
   */
  const uploadAndAnalyze = useCallback(
    async (file: File, context: PatientContext) => {
      if (!clinicId || !userProfile) {
        setError('Not authenticated');
        setStatus('error');
        return;
      }

      try {
        setStatus('uploading');
        setResult(null);
        setError(null);

        const id = await clinicalReasoningService.uploadAndAnalyze(
          clinicId,
          patientId,
          userProfile.id,
          file,
          context
        );

        setSessionId(id);
        setStatus('extracting'); // Will change to 'processing' when OCR completes
      } catch (err) {
        setStatus('error');
        const message = err instanceof Error ? err.message : 'Upload failed';
        setError(message);
        onError?.(err instanceof Error ? err : new Error(message));
      }
    },
    [clinicId, patientId, userProfile, onError]
  );

  /**
   * Analyze manually entered lab results.
   */
  const analyzeManual = useCallback(
    async (results: RawLabResult[], context: PatientContext) => {
      if (!clinicId || !userProfile) {
        setError('Not authenticated');
        setStatus('error');
        return;
      }

      try {
        setStatus('processing');
        setResult(null);
        setError(null);

        const id = await clinicalReasoningService.analyzeManual(
          clinicId,
          {
            patientId,
            patientContext: context,
            labResults: results,
            source: 'manual',
          },
          userProfile.id
        );

        setSessionId(id);
      } catch (err) {
        setStatus('error');
        const message = err instanceof Error ? err.message : 'Analysis failed';
        setError(message);
        onError?.(err instanceof Error ? err : new Error(message));
      }
    },
    [clinicId, patientId, userProfile, onError]
  );

  /**
   * Mark analysis as reviewed by physician.
   */
  const markReviewed = useCallback(
    async (feedback?: 'helpful' | 'not_helpful' | 'incorrect') => {
      if (!clinicId || !sessionId) return;

      try {
        await clinicalReasoningService.markReviewed(clinicId, sessionId, feedback);
      } catch (err) {
        console.error('Error marking as reviewed:', err);
      }
    },
    [clinicId, sessionId]
  );

  /**
   * Reset to idle state.
   */
  const reset = useCallback(() => {
    setStatus('idle');
    setSession(null);
    setResult(null);
    setError(null);
    setSessionId(null);
  }, []);

  return {
    status,
    isUploading: status === 'uploading',
    isProcessing: status === 'processing' || status === 'extracting',
    result,
    session,
    error,
    uploadAndAnalyze,
    analyzeManual,
    reset,
    markReviewed,
  };
}

export default useLabAnalysis;
