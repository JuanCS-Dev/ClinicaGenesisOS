/**
 * useWhatsAppMetrics Hook
 *
 * Real-time WhatsApp reminder metrics with memoization.
 * Optimized following React 2025 best practices.
 */

import { useMemo, useState, useCallback } from 'react'
import { useAppointments } from './useAppointments'
import { calculateWhatsAppMetrics, WhatsAppMetrics } from '../services/whatsapp-metrics.service'

export interface UseWhatsAppMetricsReturn {
  metrics: WhatsAppMetrics
  loading: boolean
  error: Error | null
  /** Refresh metrics data */
  refresh: () => void
}

/**
 * Hook for real-time WhatsApp metrics.
 * Uses memoization to prevent unnecessary recalculations.
 */
export function useWhatsAppMetrics(): UseWhatsAppMetricsReturn {
  const { appointments, loading, error } = useAppointments()
  const [refreshKey, setRefreshKey] = useState(0)

  // Memoize metrics calculation - only recalculates when appointments change
  const metrics = useMemo(() => {
    // refreshKey forces recalculation when refresh is called
    void refreshKey
    return calculateWhatsAppMetrics(appointments)
  }, [appointments, refreshKey])

  // Refresh handler
  const refresh = useCallback(() => {
    setRefreshKey(prev => prev + 1)
  }, [])

  return {
    metrics,
    loading,
    error,
    refresh,
  }
}

/**
 * Hook for WhatsApp metrics filtered by date range.
 */
export function useWhatsAppMetricsFiltered(
  startDate?: Date,
  endDate?: Date
): UseWhatsAppMetricsReturn {
  const { appointments, loading, error } = useAppointments()
  const [refreshKey, setRefreshKey] = useState(0)

  const filteredMetrics = useMemo(() => {
    // refreshKey forces recalculation when refresh is called
    void refreshKey
    let filtered = appointments

    if (startDate || endDate) {
      filtered = appointments.filter(apt => {
        const aptDate = new Date(apt.date)
        if (startDate && aptDate < startDate) return false
        if (endDate && aptDate > endDate) return false
        return true
      })
    }

    return calculateWhatsAppMetrics(filtered)
  }, [appointments, startDate, endDate, refreshKey])

  // Refresh handler
  const refresh = useCallback(() => {
    setRefreshKey(prev => prev + 1)
  }, [])

  return {
    metrics: filteredMetrics,
    loading,
    error,
    refresh,
  }
}
