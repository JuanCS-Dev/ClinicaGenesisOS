/**
 * useWhatsAppMetrics Hook
 *
 * Real-time WhatsApp reminder metrics with memoization.
 * Optimized following React 2025 best practices.
 */

import { useMemo } from 'react';
import { useAppointments } from './useAppointments';
import {
  calculateWhatsAppMetrics,
  WhatsAppMetrics,
} from '../services/whatsapp-metrics.service';

export interface UseWhatsAppMetricsReturn {
  metrics: WhatsAppMetrics;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook for real-time WhatsApp metrics.
 * Uses memoization to prevent unnecessary recalculations.
 */
export function useWhatsAppMetrics(): UseWhatsAppMetricsReturn {
  const { appointments, loading, error } = useAppointments();

  // Memoize metrics calculation - only recalculates when appointments change
  const metrics = useMemo(() => {
    return calculateWhatsAppMetrics(appointments);
  }, [appointments]);

  return {
    metrics,
    loading,
    error,
  };
}

/**
 * Hook for WhatsApp metrics filtered by date range.
 */
export function useWhatsAppMetricsFiltered(
  startDate?: Date,
  endDate?: Date
): UseWhatsAppMetricsReturn {
  const { appointments, loading, error } = useAppointments();

  const filteredMetrics = useMemo(() => {
    let filtered = appointments;

    if (startDate || endDate) {
      filtered = appointments.filter((apt) => {
        const aptDate = new Date(apt.date);
        if (startDate && aptDate < startDate) return false;
        if (endDate && aptDate > endDate) return false;
        return true;
      });
    }

    return calculateWhatsAppMetrics(filtered);
  }, [appointments, startDate, endDate]);

  return {
    metrics: filteredMetrics,
    loading,
    error,
  };
}
