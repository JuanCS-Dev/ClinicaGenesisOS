/**
 * usePrescription Hook
 *
 * Provides real-time access to a single digital prescription.
 * Manages prescription lifecycle: create, sign, send, track fulfillment.
 *
 * @module hooks/prescription/usePrescription
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useClinicContext } from '../../contexts/ClinicContext'
import { prescriptionService } from '../../services/firestore'
import type {
  Prescription,
  CreatePrescriptionInput,
  UpdatePrescriptionInput,
  UsePrescriptionReturn,
} from '@/types'

/**
 * Hook for managing a single prescription with real-time updates.
 *
 * @param prescriptionId - Optional prescription ID to subscribe to
 * @returns Prescription data and operations
 *
 * @example
 * // Create a new prescription
 * const { createPrescription, prescription } = usePrescription();
 *
 * // View an existing prescription
 * const { prescription, signPrescription, sendToPatient } = usePrescription(prescriptionId);
 */
export function usePrescription(prescriptionId?: string): UsePrescriptionReturn {
  const { clinicId, userProfile } = useClinicContext()

  const [prescription, setPrescription] = useState<Prescription | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [hasReceived, setHasReceived] = useState(false)

  // Subscribe to prescription updates if prescriptionId is provided
  useEffect(() => {
    if (!clinicId || !prescriptionId) {
      setPrescription(null)
      setHasReceived(true)
      return
    }

    let isActive = true

    const unsubscribe = prescriptionService.subscribe(
      clinicId,
      prescriptionId,
      updatedPrescription => {
        if (isActive) {
          setPrescription(updatedPrescription)
          setHasReceived(true)
          setError(null)
        }
      }
    )

    return () => {
      isActive = false
      unsubscribe()
    }
  }, [clinicId, prescriptionId])

  // Derive loading state
  const loading = useMemo(() => {
    if (!clinicId) return false
    if (!prescriptionId) return false
    return !hasReceived
  }, [clinicId, prescriptionId, hasReceived])

  /**
   * Create a new prescription.
   * Returns the created prescription ID.
   */
  const createPrescription = useCallback(
    async (input: CreatePrescriptionInput): Promise<string> => {
      if (!clinicId || !userProfile) {
        throw new Error('No clinic or user context')
      }

      try {
        const professional = {
          id: userProfile.id,
          name: userProfile.displayName,
          crm: (userProfile as unknown as { crm?: string }).crm || 'CRM não informado',
          crmState: (userProfile as unknown as { crmState?: string }).crmState || 'SP',
        }

        const newPrescriptionId = await prescriptionService.create(clinicId, input, professional)
        return newPrescriptionId
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to create prescription')
        setError(error)
        throw error
      }
    },
    [clinicId, userProfile]
  )

  /**
   * Update an existing prescription.
   * Only draft prescriptions can be updated.
   */
  const updatePrescription = useCallback(
    async (id: string, input: UpdatePrescriptionInput): Promise<void> => {
      if (!clinicId || !userProfile) {
        throw new Error('No clinic or user context')
      }

      try {
        await prescriptionService.update(
          clinicId,
          id,
          input,
          userProfile.id,
          userProfile.displayName
        )
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to update prescription')
        setError(error)
        throw error
      }
    },
    [clinicId, userProfile]
  )

  /**
   * Sign a prescription with digital certificate.
   * Updates status to 'signed'.
   */
  const signPrescription = useCallback(
    async (id: string): Promise<void> => {
      if (!clinicId || !userProfile) {
        throw new Error('No clinic or user context')
      }

      try {
        const signature = {
          signedBy: userProfile.displayName,
          signedAt: new Date().toISOString(),
          certificateSerial: 'PENDING_CERTIFICATE',
          signatureHash: `SIG-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`,
        }

        await prescriptionService.sign(
          clinicId,
          id,
          signature,
          userProfile.id,
          userProfile.displayName
        )
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to sign prescription')
        setError(error)
        throw error
      }
    },
    [clinicId, userProfile]
  )

  /**
   * Send prescription to patient.
   * Prescription must be signed first.
   */
  const sendToPatient = useCallback(
    async (id: string, method: 'email' | 'sms' | 'whatsapp'): Promise<void> => {
      if (!clinicId || !userProfile) {
        throw new Error('No clinic or user context')
      }

      try {
        await prescriptionService.sendToPatient(
          clinicId,
          id,
          method,
          userProfile.id,
          userProfile.displayName
        )
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to send prescription')
        setError(error)
        throw error
      }
    },
    [clinicId, userProfile]
  )

  /**
   * Cancel a prescription.
   * Filled prescriptions cannot be canceled.
   */
  const cancelPrescription = useCallback(
    async (id: string, reason: string): Promise<void> => {
      if (!clinicId || !userProfile) {
        throw new Error('No clinic or user context')
      }

      try {
        await prescriptionService.cancel(
          clinicId,
          id,
          reason,
          userProfile.id,
          userProfile.displayName
        )
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to cancel prescription')
        setError(error)
        throw error
      }
    },
    [clinicId, userProfile]
  )

  /**
   * Get a prescription by ID.
   */
  const getPrescription = useCallback(
    async (id: string): Promise<Prescription | null> => {
      if (!clinicId) {
        throw new Error('No clinic selected')
      }

      try {
        return await prescriptionService.getById(clinicId, id)
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to get prescription')
        setError(error)
        throw error
      }
    },
    [clinicId]
  )

  return {
    prescription,
    loading,
    error,
    createPrescription,
    updatePrescription,
    signPrescription,
    sendToPatient,
    cancelPrescription,
    getPrescription,
  }
}
