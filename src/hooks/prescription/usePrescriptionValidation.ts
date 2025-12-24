/**
 * usePrescriptionValidation Hook
 *
 * Used by pharmacies to validate prescription authenticity
 * and mark prescriptions as filled.
 *
 * @module hooks/prescription/usePrescriptionValidation
 */

import { useState, useCallback } from 'react'
import { useClinicContext } from '../../contexts/ClinicContext'
import { prescriptionService } from '../../services/firestore'
import type { Prescription } from '@/types'

/**
 * Return type for usePrescriptionValidation hook.
 */
export interface UsePrescriptionValidationReturn {
  prescription: Prescription | null
  loading: boolean
  error: Error | null
  validateCode: (code: string) => Promise<Prescription | null>
  markAsFilled: (pharmacyName: string) => Promise<void>
}

/**
 * Hook for validating a prescription by its validation code.
 * Used by pharmacies to verify prescription authenticity.
 *
 * @returns Validation function and state
 *
 * @example
 * const { validateCode, prescription, loading } = usePrescriptionValidation();
 * await validateCode('ABC123XY');
 */
export function usePrescriptionValidation(): UsePrescriptionValidationReturn {
  const { clinicId } = useClinicContext()

  const [prescription, setPrescription] = useState<Prescription | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  /**
   * Validate a prescription by its unique code.
   */
  const validateCode = useCallback(
    async (code: string): Promise<Prescription | null> => {
      if (!clinicId) {
        throw new Error('No clinic selected')
      }

      setLoading(true)
      setError(null)

      try {
        const found = await prescriptionService.getByValidationCode(clinicId, code)
        setPrescription(found)
        return found
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to validate code')
        setError(error)
        setPrescription(null)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [clinicId]
  )

  /**
   * Mark the validated prescription as filled.
   */
  const markAsFilled = useCallback(
    async (pharmacyName: string): Promise<void> => {
      if (!clinicId || !prescription) {
        throw new Error('No prescription to mark as filled')
      }

      try {
        await prescriptionService.markAsFilled(clinicId, prescription.id, pharmacyName)
        // Refresh the prescription data
        const updated = await prescriptionService.getById(clinicId, prescription.id)
        setPrescription(updated)
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to mark as filled')
        setError(error)
        throw error
      }
    },
    [clinicId, prescription]
  )

  return {
    prescription,
    loading,
    error,
    validateCode,
    markAsFilled,
  }
}
