/**
 * useTelemedicine Hook
 *
 * Provides real-time access to teleconsultation sessions.
 * Manages session lifecycle: create, join waiting room, start call, end call.
 *
 * This hook enables doctors to reach patients who can't travel to the clinic:
 * - Elderly patients with mobility issues
 * - Rural patients far from specialists
 * - Parents with young children
 * - Follow-up consultations that don't require physical examination
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useClinicContext } from '../contexts/ClinicContext';
import { telemedicineService } from '../services/firestore';
import type {
  TelemedicineSession,
  CreateTelemedicineSessionInput,
  TelemedicineParticipant,
  UseTelemedicineReturn,
} from '@/types';

/**
 * Hook for managing teleconsultation sessions with real-time updates.
 *
 * @param sessionId - Optional session ID to subscribe to a specific session
 * @returns Telemedicine session data and operations
 *
 * @example
 * // Start a new teleconsultation
 * const { startSession, session, isInCall } = useTelemedicine();
 *
 * // Join an existing session
 * const { session, joinWaitingRoom, startCall } = useTelemedicine(sessionId);
 */
export function useTelemedicine(sessionId?: string): UseTelemedicineReturn {
  const { clinicId, userProfile } = useClinicContext();

  const [session, setSession] = useState<TelemedicineSession | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [hasReceived, setHasReceived] = useState(false);
  const [isInWaitingRoom, setIsInWaitingRoom] = useState(false);
  const [isInCall, setIsInCall] = useState(false);

  // Subscribe to session updates if sessionId is provided
  useEffect(() => {
    if (!clinicId || !sessionId) {
      setSession(null);
      setHasReceived(true);
      return;
    }

    let isActive = true;

    const unsubscribe = telemedicineService.subscribe(
      clinicId,
      sessionId,
      (updatedSession) => {
        if (isActive) {
          setSession(updatedSession);
          setHasReceived(true);
          setError(null);

          // Update state based on session status
          if (updatedSession) {
            setIsInWaitingRoom(updatedSession.status === 'waiting');
            setIsInCall(updatedSession.status === 'in_progress');
          } else {
            setIsInWaitingRoom(false);
            setIsInCall(false);
          }
        }
      }
    );

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, [clinicId, sessionId]);

  // Derive loading state
  const loading = useMemo(() => {
    if (!clinicId) return false;
    if (!sessionId) return false;
    return !hasReceived;
  }, [clinicId, sessionId, hasReceived]);

  /**
   * Start a new teleconsultation session.
   * Creates the session in Firestore and returns the session ID.
   */
  const startSession = useCallback(
    async (input: CreateTelemedicineSessionInput): Promise<string> => {
      if (!clinicId) {
        throw new Error('No clinic selected');
      }

      try {
        const newSessionId = await telemedicineService.create(clinicId, input);
        return newSessionId;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to create session');
        setError(error);
        throw error;
      }
    },
    [clinicId]
  );

  /**
   * Join the waiting room for a session.
   * Adds the current user as a participant and updates status to 'waiting'.
   */
  const joinWaitingRoom = useCallback(
    async (targetSessionId: string): Promise<void> => {
      if (!clinicId || !userProfile) {
        throw new Error('No clinic or user context');
      }

      try {
        const participant: TelemedicineParticipant = {
          id: userProfile.id,
          displayName: userProfile.displayName,
          role: userProfile.role === 'professional' || userProfile.role === 'owner' ? 'professional' : 'patient',
          audioEnabled: false,
          videoEnabled: false,
        };

        await telemedicineService.addParticipant(clinicId, targetSessionId, participant);

        // Update status to waiting if not already
        const currentSession = await telemedicineService.getById(clinicId, targetSessionId);
        if (currentSession && currentSession.status === 'scheduled') {
          await telemedicineService.updateStatus(clinicId, targetSessionId, 'waiting');
        }

        setIsInWaitingRoom(true);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to join waiting room');
        setError(error);
        throw error;
      }
    },
    [clinicId, userProfile]
  );

  /**
   * Start the actual video call.
   * Updates session status to 'in_progress' and records start time.
   */
  const startCall = useCallback(async (): Promise<void> => {
    if (!clinicId || !session) {
      throw new Error('No session to start');
    }

    try {
      await telemedicineService.updateStatus(clinicId, session.id, 'in_progress', {
        startedAt: new Date().toISOString(),
      });

      // Log call started event
      if (userProfile) {
        await telemedicineService.addLog(clinicId, session.id, {
          sessionId: session.id,
          eventType: 'call_started',
          userId: userProfile.id,
        });
      }

      setIsInWaitingRoom(false);
      setIsInCall(true);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to start call');
      setError(error);
      throw error;
    }
  }, [clinicId, session, userProfile]);

  /**
   * End the current call.
   * Calculates duration, marks all participants as left, updates status to 'completed'.
   */
  const endCall = useCallback(async (): Promise<void> => {
    if (!clinicId || !session) {
      throw new Error('No session to end');
    }

    try {
      await telemedicineService.endSession(clinicId, session.id, userProfile?.id || 'unknown');

      setIsInCall(false);
      setIsInWaitingRoom(false);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to end call');
      setError(error);
      throw error;
    }
  }, [clinicId, session, userProfile]);

  /**
   * Cancel a scheduled session.
   * Updates status to 'canceled' with optional reason.
   */
  const cancelSession = useCallback(
    async (targetSessionId: string, reason?: string): Promise<void> => {
      if (!clinicId) {
        throw new Error('No clinic selected');
      }

      try {
        await telemedicineService.updateStatus(clinicId, targetSessionId, 'canceled', {
          notes: reason,
        });

        if (session?.id === targetSessionId) {
          setIsInCall(false);
          setIsInWaitingRoom(false);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to cancel session');
        setError(error);
        throw error;
      }
    },
    [clinicId, session]
  );

  /**
   * Get session by appointment ID.
   * Useful for checking if a teleconsultation already exists for an appointment.
   */
  const getSessionByAppointment = useCallback(
    async (appointmentId: string): Promise<TelemedicineSession | null> => {
      if (!clinicId) {
        throw new Error('No clinic selected');
      }

      try {
        return await telemedicineService.getByAppointment(clinicId, appointmentId);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to get session');
        setError(error);
        throw error;
      }
    },
    [clinicId]
  );

  return {
    session,
    loading,
    error,
    isInWaitingRoom,
    isInCall,
    startSession,
    joinWaitingRoom,
    startCall,
    endCall,
    cancelSession,
    getSessionByAppointment,
  };
}

/**
 * Hook for accessing active teleconsultation sessions in the clinic.
 *
 * @returns Array of active sessions (scheduled, waiting, in_progress)
 *
 * @example
 * const { activeSessions, loading } = useActiveTelemedicineSessions();
 */
export function useActiveTelemedicineSessions(): {
  activeSessions: TelemedicineSession[];
  loading: boolean;
  error: Error | null;
} {
  const { clinicId } = useClinicContext();

  const [activeSessions, setActiveSessions] = useState<TelemedicineSession[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [hasReceived, setHasReceived] = useState(false);

  useEffect(() => {
    if (!clinicId) {
      setActiveSessions([]);
      setHasReceived(true);
      return;
    }

    let isActive = true;

    const unsubscribe = telemedicineService.subscribeActive(clinicId, (sessions) => {
      if (isActive) {
        setActiveSessions(sessions);
        setHasReceived(true);
        setError(null);
      }
    });

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, [clinicId]);

  const loading = useMemo(() => {
    if (!clinicId) return false;
    return !hasReceived;
  }, [clinicId, hasReceived]);

  return {
    activeSessions,
    loading,
    error,
  };
}
