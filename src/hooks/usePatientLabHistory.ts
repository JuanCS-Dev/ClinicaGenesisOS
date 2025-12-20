/**
 * usePatientLabHistory Hook
 * =========================
 *
 * Fetches and subscribes to a patient's lab analysis history.
 * Useful for showing past analyses in the patient timeline.
 */

import { useState, useEffect, useCallback } from 'react';
import { useClinicContext } from '../contexts/ClinicContext';
import { clinicalReasoningService } from '../services/clinical-reasoning.service';
import type { LabAnalysisSession } from '../types';

interface UsePatientLabHistoryProps {
  /** Patient ID to fetch history for. */
  patientId: string;
  /** Whether to subscribe to real-time updates. */
  realtime?: boolean;
}

interface UsePatientLabHistoryReturn {
  /** List of lab analysis sessions. */
  sessions: LabAnalysisSession[];
  /** Whether data is loading. */
  isLoading: boolean;
  /** Error message if any. */
  error: string | null;
  /** Latest completed analysis (if any). */
  latestAnalysis: LabAnalysisSession | null;
  /** Refresh data manually. */
  refresh: () => Promise<void>;
}

/**
 * Hook for fetching a patient's lab analysis history.
 *
 * @example
 * ```tsx
 * const { sessions, latestAnalysis, isLoading } = usePatientLabHistory({
 *   patientId: 'patient-123',
 *   realtime: true,
 * });
 * ```
 */
export function usePatientLabHistory({
  patientId,
  realtime = false,
}: UsePatientLabHistoryProps): UsePatientLabHistoryReturn {
  const { clinicId } = useClinicContext();
  const [sessions, setSessions] = useState<LabAnalysisSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch sessions once.
   */
  const fetchSessions = useCallback(async () => {
    if (!clinicId) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await clinicalReasoningService.getByPatient(clinicId, patientId);
      setSessions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch history');
    } finally {
      setIsLoading(false);
    }
  }, [clinicId, patientId]);

  /**
   * Initial fetch or subscription setup.
   */
  useEffect(() => {
    if (!clinicId) return;

    if (realtime) {
      // Subscribe to real-time updates
      setIsLoading(true);
      const unsubscribe = clinicalReasoningService.subscribeByPatient(
        clinicId,
        patientId,
        (updatedSessions) => {
          setSessions(updatedSessions);
          setIsLoading(false);
        }
      );

      return () => unsubscribe();
    } else {
      // One-time fetch
      fetchSessions();
    }
  }, [clinicId, patientId, realtime, fetchSessions]);

  /**
   * Get the latest completed analysis.
   */
  const latestAnalysis = sessions.find(
    (s) => s.status === 'ready' && s.result
  ) || null;

  return {
    sessions,
    isLoading,
    error,
    latestAnalysis,
    refresh: fetchSessions,
  };
}

export default usePatientLabHistory;
