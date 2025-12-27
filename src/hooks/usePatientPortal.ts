/**
 * Patient Portal Hooks
 * ====================
 *
 * Aggregated hooks for patient portal pages.
 * Uses PatientPortalContext for authentication and multi-tenancy.
 *
 * @module hooks/usePatientPortal
 * @version 1.0.0
 */

import { useState, useEffect, useMemo, useCallback } from 'react'
import { usePatientPortal } from '../contexts/PatientPortalContext'
import { appointmentService } from '../services/firestore/appointment.service'
import { prescriptionService } from '../services/firestore/prescription.service'
import { transactionService } from '../services/firestore/transaction.service'
import type { Appointment, Prescription, Transaction } from '@/types'
import { Status } from '@/types'

// ============================================================================
// Types
// ============================================================================

export interface UsePatientPortalAppointmentsReturn {
  /** All appointments for the patient */
  appointments: Appointment[]
  /** Upcoming appointments (future dates) */
  upcomingAppointments: Appointment[]
  /** Past appointments */
  pastAppointments: Appointment[]
  /** Next scheduled appointment */
  nextAppointment: Appointment | null
  /** Loading state */
  loading: boolean
  /** Error state */
  error: Error | null
  /** Cancel an appointment */
  cancelAppointment: (appointmentId: string) => Promise<void>
  /** Reschedule an appointment to a new date/time */
  rescheduleAppointment: (appointmentId: string, newDate: string) => Promise<void>
}

export interface UsePatientPortalPrescriptionsReturn {
  /** All prescriptions for the patient */
  prescriptions: Prescription[]
  /** Active prescriptions (not expired or canceled) */
  activePrescriptions: Prescription[]
  /** Loading state */
  loading: boolean
  /** Error state */
  error: Error | null
}

export interface UsePatientPortalBillingReturn {
  /** All transactions for the patient */
  transactions: Transaction[]
  /** Pending payments */
  pendingPayments: Transaction[]
  /** Total pending amount */
  totalPending: number
  /** Loading state */
  loading: boolean
  /** Error state */
  error: Error | null
}

// ============================================================================
// Helpers
// ============================================================================

function isUpcoming(dateStr: string): boolean {
  const date = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date >= today
}

function isPrescriptionActive(prescription: Prescription): boolean {
  if (prescription.status === 'canceled' || prescription.status === 'expired') {
    return false
  }
  if (prescription.expiresAt) {
    return new Date(prescription.expiresAt) > new Date()
  }
  return true
}

// ============================================================================
// usePatientPortalAppointments
// ============================================================================

/**
 * Hook for accessing patient's appointments in the portal.
 *
 * @returns Appointments data with loading/error states
 *
 * @example
 * const { appointments, nextAppointment, loading } = usePatientPortalAppointments();
 */
export function usePatientPortalAppointments(): UsePatientPortalAppointmentsReturn {
  const { clinicId, patientId, loading: contextLoading } = usePatientPortal()

  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [hasReceived, setHasReceived] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (contextLoading) return
    if (!clinicId || !patientId) {
      setAppointments([])
      setHasReceived(true)
      return
    }

    let isActive = true

    const unsubscribe = appointmentService.subscribeByPatient(clinicId, patientId, data => {
      if (isActive) {
        setAppointments(data)
        setHasReceived(true)
        setError(null)
      }
    })

    return () => {
      isActive = false
      setHasReceived(false)
      unsubscribe()
    }
  }, [clinicId, patientId, contextLoading])

  const upcomingAppointments = useMemo(
    () =>
      appointments
        .filter(apt => isUpcoming(apt.date) && apt.status !== 'cancelled')
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [appointments]
  )

  const pastAppointments = useMemo(
    () =>
      appointments
        .filter(apt => !isUpcoming(apt.date))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [appointments]
  )

  const nextAppointment = useMemo(() => upcomingAppointments[0] || null, [upcomingAppointments])

  const effectiveLoading = clinicId && patientId ? !hasReceived : false

  const cancelAppointment = useCallback(
    async (appointmentId: string): Promise<void> => {
      if (!clinicId) {
        throw new Error('Clinic ID not available')
      }
      await appointmentService.updateStatus(clinicId, appointmentId, Status.CANCELED)
    },
    [clinicId]
  )

  const rescheduleAppointment = useCallback(
    async (appointmentId: string, newDate: string): Promise<void> => {
      if (!clinicId) {
        throw new Error('Clinic ID not available')
      }
      await appointmentService.update(clinicId, appointmentId, { date: newDate })
    },
    [clinicId]
  )

  return {
    appointments,
    upcomingAppointments,
    pastAppointments,
    nextAppointment,
    loading: contextLoading || effectiveLoading,
    error,
    cancelAppointment,
    rescheduleAppointment,
  }
}

// ============================================================================
// usePatientPortalPrescriptions
// ============================================================================

/**
 * Hook for accessing patient's prescriptions in the portal.
 *
 * @returns Prescriptions data with loading/error states
 *
 * @example
 * const { prescriptions, activePrescriptions, loading } = usePatientPortalPrescriptions();
 */
export function usePatientPortalPrescriptions(): UsePatientPortalPrescriptionsReturn {
  const { clinicId, patientId, loading: contextLoading } = usePatientPortal()

  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [hasReceived, setHasReceived] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (contextLoading) return
    if (!clinicId || !patientId) {
      setPrescriptions([])
      setHasReceived(true)
      return
    }

    let isActive = true

    const unsubscribe = prescriptionService.subscribeByPatient(clinicId, patientId, data => {
      if (isActive) {
        setPrescriptions(data)
        setHasReceived(true)
        setError(null)
      }
    })

    return () => {
      isActive = false
      setHasReceived(false)
      unsubscribe()
    }
  }, [clinicId, patientId, contextLoading])

  const activePrescriptions = useMemo(
    () => prescriptions.filter(isPrescriptionActive),
    [prescriptions]
  )

  const effectiveLoading = clinicId && patientId ? !hasReceived : false

  return {
    prescriptions,
    activePrescriptions,
    loading: contextLoading || effectiveLoading,
    error,
  }
}

// ============================================================================
// usePatientPortalBilling
// ============================================================================

/**
 * Hook for accessing patient's billing/transactions in the portal.
 *
 * @returns Billing data with loading/error states
 *
 * @example
 * const { transactions, pendingPayments, totalPending } = usePatientPortalBilling();
 */
export function usePatientPortalBilling(): UsePatientPortalBillingReturn {
  const { clinicId, patientId, loading: contextLoading } = usePatientPortal()

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [hasReceived, setHasReceived] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (contextLoading) return
    if (!clinicId || !patientId) {
      setTransactions([])
      setHasReceived(true)
      return
    }

    let isActive = true

    // Subscribe to all transactions and filter by patient client-side
    // (Firestore doesn't have subscribeByPatient for transactions)
    const unsubscribe = transactionService.subscribe(
      clinicId,
      data => {
        if (isActive) {
          // Filter transactions for this patient
          const patientTransactions = data.filter(t => t.patientId === patientId)
          setTransactions(patientTransactions)
          setHasReceived(true)
          setError(null)
        }
      },
      err => {
        if (isActive) {
          setError(err)
          setHasReceived(true)
        }
      }
    )

    return () => {
      isActive = false
      setHasReceived(false)
      unsubscribe()
    }
  }, [clinicId, patientId, contextLoading])

  const pendingPayments = useMemo(
    () =>
      transactions.filter(
        t => t.type === 'income' && (t.status === 'pending' || t.status === 'overdue')
      ),
    [transactions]
  )

  const totalPending = useMemo(
    () => pendingPayments.reduce((sum, t) => sum + t.amount, 0),
    [pendingPayments]
  )

  const effectiveLoading = clinicId && patientId ? !hasReceived : false

  return {
    transactions,
    pendingPayments,
    totalPending,
    loading: contextLoading || effectiveLoading,
    error,
  }
}

// ============================================================================
// Re-export context hook for convenience
// ============================================================================

export { usePatientPortal } from '../contexts/PatientPortalContext'
