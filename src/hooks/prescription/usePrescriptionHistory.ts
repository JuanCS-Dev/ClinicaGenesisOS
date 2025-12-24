/**
 * usePrescriptionHistory Hook
 *
 * Provides real-time access to a patient's prescription history.
 *
 * @module hooks/prescription/usePrescriptionHistory
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useClinicContext } from '../../contexts/ClinicContext'
import { prescriptionService } from '../../services/firestore'
import type { Prescription, UsePrescriptionHistoryReturn } from '@/types'

/**
 * Hook for accessing prescription history for a patient.
 *
 * @param patientId - The patient ID to get prescriptions for
 * @returns Array of prescriptions and operations
 *
 * @example
 * const { prescriptions, loading, refresh } = usePrescriptionHistory(patientId);
 */
export function usePrescriptionHistory(patientId: string): UsePrescriptionHistoryReturn {
  const { clinicId } = useClinicContext()

  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [error, setError] = useState<Error | null>(null)
  const [hasReceived, setHasReceived] = useState(false)

  // Subscribe to patient prescriptions
  useEffect(() => {
    if (!clinicId || !patientId) {
      setPrescriptions([])
      setHasReceived(true)
      return
    }

    let isActive = true

    const unsubscribe = prescriptionService.subscribeByPatient(
      clinicId,
      patientId,
      updatedPrescriptions => {
        if (isActive) {
          setPrescriptions(updatedPrescriptions)
          setHasReceived(true)
          setError(null)
        }
      }
    )

    return () => {
      isActive = false
      unsubscribe()
    }
  }, [clinicId, patientId])

  const loading = useMemo(() => {
    if (!clinicId) return false
    if (!patientId) return false
    return !hasReceived
  }, [clinicId, patientId, hasReceived])

  /**
   * Manually refresh the prescription list.
   */
  const refresh = useCallback(async (): Promise<void> => {
    if (!clinicId || !patientId) {
      return
    }

    try {
      const updatedPrescriptions = await prescriptionService.getByPatient(clinicId, patientId)
      setPrescriptions(updatedPrescriptions)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to refresh prescriptions')
      setError(error)
      throw error
    }
  }, [clinicId, patientId])

  return {
    prescriptions,
    loading,
    error,
    refresh,
  }
}
