/**
 * useGlosas Hook
 *
 * Hook for managing glosas (billing denials) with real-time updates.
 *
 * @module hooks/useGlosas
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useClinic } from '@/contexts/ClinicContext';
import {
  getGlosas,
  getGlosaById,
  subscribeToGlosas,
  updateGlosaStatus,
  calculateGlosaStats,
  type GlosaFirestore,
  type GlosaFilters,
  type GlosaStats,
} from '@/services/firestore/glosa.service';
import type { Glosa } from '@/types/tiss/glosas';

// =============================================================================
// TYPES
// =============================================================================

export interface UseGlosasOptions {
  realtime?: boolean;
  filters?: GlosaFilters;
  enabled?: boolean;
}

export interface UseGlosasResult {
  glosas: GlosaFirestore[];
  stats: GlosaStats;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  updateStatus: (
    glosaId: string,
    status: Glosa['status'],
    recursoId?: string
  ) => Promise<void>;
  getById: (glosaId: string) => Promise<GlosaFirestore | null>;
}

// =============================================================================
// HOOK
// =============================================================================

export function useGlosas(options: UseGlosasOptions = {}): UseGlosasResult {
  const { realtime = true, filters, enabled = true } = options;
  const { clinic } = useClinic();
  const clinicId = clinic?.id;

  const [glosas, setGlosas] = useState<GlosaFirestore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch glosas
  const fetchGlosas = useCallback(async () => {
    if (!clinicId || !enabled) {
      setGlosas([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getGlosas(clinicId, filters);
      setGlosas(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch glosas'));
    } finally {
      setLoading(false);
    }
  }, [clinicId, filters, enabled]);

  // Real-time subscription
  useEffect(() => {
    if (!clinicId || !enabled) {
      setGlosas([]);
      setLoading(false);
      return;
    }

    if (realtime) {
      setLoading(true);
      const unsubscribe = subscribeToGlosas(
        clinicId,
        (data) => {
          setGlosas(data);
          setLoading(false);
          setError(null);
        },
        filters
      );

      return () => unsubscribe();
    } else {
      fetchGlosas();
    }
  }, [clinicId, realtime, filters, enabled, fetchGlosas]);

  // Calculate stats from glosas
  const stats = useMemo(() => calculateGlosaStats(glosas), [glosas]);

  // Update glosa status
  const updateStatus = useCallback(
    async (glosaId: string, status: Glosa['status'], recursoId?: string) => {
      if (!clinicId) throw new Error('Clinic not selected');
      await updateGlosaStatus(clinicId, glosaId, status, recursoId);
    },
    [clinicId]
  );

  // Get glosa by ID
  const getById = useCallback(
    async (glosaId: string) => {
      if (!clinicId) return null;
      return getGlosaById(clinicId, glosaId);
    },
    [clinicId]
  );

  return {
    glosas,
    stats,
    loading,
    error,
    refresh: fetchGlosas,
    updateStatus,
    getById,
  };
}
