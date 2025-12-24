/**
 * usePrescriptionStats Hook
 *
 * Provides prescription statistics for a given period.
 *
 * @module hooks/prescription/usePrescriptionStats
 */

import { useState, useEffect, useCallback } from 'react'
import { useClinicContext } from '../../contexts/ClinicContext'
import { prescriptionService } from '../../services/firestore'

/**
 * Prescription statistics structure.
 */
export interface PrescriptionStats {
  total: number
  byStatus: Record<string, number>
  byType: Record<string, number>
  controlled: number
}

/**
 * Return type for usePrescriptionStats hook.
 */
export interface UsePrescriptionStatsReturn {
  stats: PrescriptionStats | null
  loading: boolean
  error: Error | null
  refresh: () => Promise<void>
}

/**
 * Hook for prescription statistics.
 *
 * @param startDate - Start date for the period
 * @param endDate - End date for the period
 * @returns Statistics data
 *
 * @example
 * const { stats, loading } = usePrescriptionStats('2025-01-01', '2025-12-31');
 */
export function usePrescriptionStats(
  startDate: string,
  endDate: string
): UsePrescriptionStatsReturn {
  const { clinicId } = useClinicContext()

  const [stats, setStats] = useState<PrescriptionStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchStats = useCallback(async () => {
    if (!clinicId) {
      setStats(null)
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const data = await prescriptionService.getStatistics(clinicId, startDate, endDate)
      setStats(data)
      setError(null)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to get statistics')
      setError(error)
    } finally {
      setLoading(false)
    }
  }, [clinicId, startDate, endDate])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return {
    stats,
    loading,
    error,
    refresh: fetchStats,
  }
}
