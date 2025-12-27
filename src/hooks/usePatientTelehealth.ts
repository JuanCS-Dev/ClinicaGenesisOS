/**
 * usePatientTelehealth Hook
 *
 * Provides access to patient's upcoming teleconsultation sessions.
 * Uses PatientPortalContext for patient-scoped access.
 * Supports Google Meet (primary) and Jitsi Meet (legacy).
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import { usePatientPortal } from '@/contexts/PatientPortalContext'
import { telemedicineService, appointmentService } from '@/services/firestore'
import type { TelemedicineSession, Appointment } from '@/types'

/**
 * Return type for usePatientTelehealth hook.
 */
export interface UsePatientTelehealthReturn {
  /** Next scheduled teleconsultation */
  nextTeleconsulta: {
    appointment: Appointment | null
    session: TelemedicineSession | null
  }
  /** Loading state */
  loading: boolean
  /** Error state */
  error: Error | null
  /** Check if can join (within 15 min of scheduled time) */
  canJoin: boolean
  /** Time until can join (in minutes) */
  minutesUntilJoin: number | null
  /** Google Meet link if available */
  meetLink: string | null
  /** Whether this is a Google Meet session (vs legacy Jitsi) */
  isMeetSession: boolean
  /** Join the waiting room (legacy) or open Meet (primary) */
  joinWaitingRoom: () => Promise<void>
  /** Open Google Meet in new tab */
  openMeet: () => void
  /** Refresh data */
  refresh: () => Promise<void>
}

/**
 * Hook for managing patient teleconsultation access.
 *
 * @returns Telehealth data and operations
 *
 * @example
 * const { nextTeleconsulta, canJoin, joinWaitingRoom } = usePatientTelehealth();
 */
export function usePatientTelehealth(): UsePatientTelehealthReturn {
  const { patientId, clinicId, loading: contextLoading } = usePatientPortal()

  const [nextAppointment, setNextAppointment] = useState<Appointment | null>(null)
  const [session, setSession] = useState<TelemedicineSession | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [hasReceived, setHasReceived] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update current time every minute for canJoin calculation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  // Fetch next teleconsultation appointment
  const fetchData = useCallback(async () => {
    if (!clinicId || !patientId) {
      setNextAppointment(null)
      setSession(null)
      setHasReceived(true)
      return
    }

    try {
      // Get patient's upcoming appointments that are teleconsultations
      const appointments = await appointmentService.getByPatient(clinicId, patientId)

      // Find next teleconsultation appointment
      const now = new Date()
      const teleconsultas = appointments
        .filter(apt => {
          // Check if it's a teleconsultation (by notes or procedure)
          const isOnline =
            apt.notes?.toLowerCase().includes('online') ||
            apt.notes?.toLowerCase().includes('teleconsulta') ||
            apt.procedure?.toLowerCase().includes('teleconsulta')

          // Check if it's upcoming and confirmed/pending
          const isUpcoming = new Date(apt.date) >= now
          const isActive = apt.status === 'Confirmado' || apt.status === 'Pendente'

          return isOnline && isUpcoming && isActive
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

      const nextApt = teleconsultas[0] || null
      setNextAppointment(nextApt)

      // If there's an appointment, check for existing session
      if (nextApt) {
        const existingSession = await telemedicineService.getByAppointment(clinicId, nextApt.id)
        setSession(existingSession)
      } else {
        setSession(null)
      }

      setError(null)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch teleconsultation')
      setError(error)
    } finally {
      setHasReceived(true)
    }
  }, [clinicId, patientId])

  // Initial fetch
  useEffect(() => {
    if (!contextLoading) {
      fetchData()
    }
  }, [contextLoading, fetchData])

  // Calculate canJoin and minutesUntilJoin
  const { canJoin, minutesUntilJoin } = useMemo(() => {
    if (!nextAppointment) {
      return { canJoin: false, minutesUntilJoin: null }
    }

    const appointmentTime = new Date(nextAppointment.date)
    const now = currentTime
    const diffMs = appointmentTime.getTime() - now.getTime()
    const diffMinutes = Math.ceil(diffMs / (1000 * 60))

    // Can join 15 minutes before scheduled time
    const canJoinNow = diffMinutes <= 15 && diffMinutes >= -60 // Up to 1 hour after start

    return {
      canJoin: canJoinNow,
      minutesUntilJoin: diffMinutes > 15 ? diffMinutes - 15 : null,
    }
  }, [nextAppointment, currentTime])

  // Loading state
  const loading = contextLoading || (!hasReceived && Boolean(clinicId && patientId))

  /**
   * Join the waiting room.
   */
  const joinWaitingRoom = useCallback(async (): Promise<void> => {
    if (!clinicId || !patientId || !nextAppointment) {
      throw new Error('No teleconsultation available')
    }

    if (!canJoin) {
      throw new Error('Cannot join yet - please wait until closer to the scheduled time')
    }

    try {
      // Check if session exists or create one
      let sessionId = session?.id

      if (!sessionId) {
        // Session should be created by the provider, but we can check
        const existingSession = await telemedicineService.getByAppointment(
          clinicId,
          nextAppointment.id
        )
        if (existingSession) {
          sessionId = existingSession.id
          setSession(existingSession)
        }
      }

      if (!sessionId) {
        throw new Error('Waiting room not available yet - the provider needs to start the session')
      }

      // Redirect to telehealth room (URL with session ID)
      window.location.href = `/portal/teleconsulta/${sessionId}`
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to join waiting room')
      setError(error)
      throw error
    }
  }, [clinicId, patientId, nextAppointment, canJoin, session])

  /**
   * Refresh data manually.
   */
  const refresh = useCallback(async (): Promise<void> => {
    await fetchData()
  }, [fetchData])

  // Determine if this is a Meet session
  const meetLink = session?.meetLink || null
  const isMeetSession = Boolean(meetLink)

  /**
   * Open Google Meet in a new tab.
   */
  const openMeet = useCallback((): void => {
    if (!meetLink) {
      toast.error('Link do Meet nao disponivel')
      return
    }

    if (!canJoin) {
      toast.error('A consulta ainda nao esta disponivel')
      return
    }

    window.open(meetLink, '_blank', 'noopener,noreferrer')
    toast.success('Abrindo Google Meet...')
  }, [meetLink, canJoin])

  return {
    nextTeleconsulta: {
      appointment: nextAppointment,
      session,
    },
    loading,
    error,
    canJoin,
    minutesUntilJoin,
    meetLink,
    isMeetSession,
    joinWaitingRoom,
    openMeet,
    refresh,
  }
}
