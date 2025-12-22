/**
 * TelemedicineModal Component
 *
 * Full-screen modal that manages the teleconsultation flow:
 * 1. Waiting Room (pre-call setup)
 * 2. Video Room (actual call)
 * 3. Post-call summary (optional notes)
 *
 * This modal represents the complete telemedicine experience.
 * Every transition, every state - designed to make both doctor
 * and patient feel confident and cared for.
 */

import { useState, useCallback, useEffect } from 'react';
import { X, Video, AlertCircle } from 'lucide-react';
import { VideoRoom } from './VideoRoom';
import { WaitingRoom } from './WaitingRoom';
import { useTelemedicine } from '@/hooks/useTelemedicine';
import { useClinicContext } from '@/contexts/ClinicContext';
import type { TelemedicineSession, CreateTelemedicineSessionInput } from '@/types';
import { toast } from 'sonner';

type ModalState = 'waiting' | 'in_call' | 'ended';

interface TelemedicineModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** Existing session ID to join */
  sessionId?: string;
  /** Appointment data for creating new session */
  appointmentData?: {
    appointmentId: string;
    patientId: string;
    patientName: string;
    scheduledAt: string;
  };
}

/**
 * TelemedicineModal - Full telemedicine experience container.
 *
 * @param isOpen - Whether modal is visible
 * @param onClose - Close handler
 * @param sessionId - Existing session to join
 * @param appointmentData - Data for creating new session
 */
export function TelemedicineModal({
  isOpen,
  onClose,
  sessionId,
  appointmentData,
}: TelemedicineModalProps) {
  const { userProfile } = useClinicContext();
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>(sessionId);
  const [modalState, setModalState] = useState<ModalState>('waiting');
  const [notes, setNotes] = useState('');

  const {
    session,
    loading,
    error,
    startSession,
    joinWaitingRoom,
    startCall,
    endCall,
  } = useTelemedicine(currentSessionId);

  const isProfessional =
    userProfile?.role === 'professional' || userProfile?.role === 'owner' || userProfile?.role === 'admin';

  // Create session if we have appointment data but no session
  useEffect(() => {
    if (!isOpen || sessionId || currentSessionId || !appointmentData || !userProfile) {
      return;
    }

    async function createSession() {
      try {
        const input: CreateTelemedicineSessionInput = {
          appointmentId: appointmentData.appointmentId,
          patientId: appointmentData.patientId,
          patientName: appointmentData.patientName,
          professionalId: userProfile.id,
          professionalName: userProfile.displayName,
          scheduledAt: appointmentData.scheduledAt,
          recordingEnabled: false,
        };

        const newSessionId = await startSession(input);
        setCurrentSessionId(newSessionId);
        toast.success('Sessão de teleconsulta criada');
      } catch (err) {
        console.error('Failed to create session:', err);
        toast.error('Erro ao criar sessão de teleconsulta');
      }
    }

    createSession();
  }, [isOpen, sessionId, currentSessionId, appointmentData, userProfile, startSession]);

  // Join waiting room when session is ready
  useEffect(() => {
    if (!session || !currentSessionId || modalState !== 'waiting') {
      return;
    }

    // Auto-join waiting room if not already joined
    if (session.status === 'scheduled') {
      joinWaitingRoom(currentSessionId).catch((err) => {
        console.error('Failed to join waiting room:', err);
      });
    }
  }, [session, currentSessionId, modalState, joinWaitingRoom]);

  // Update state based on session status
  useEffect(() => {
    if (!session) return;

    if (session.status === 'in_progress') {
      setModalState('in_call');
    } else if (session.status === 'completed') {
      setModalState('ended');
    }
  }, [session]);

  /**
   * Format duration in seconds to human readable.
   */
  const formatDuration = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins} min`;
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours}h ${remainingMins}min`;
  }, []);

  /**
   * Handle user ready to join call.
   */
  const handleReady = useCallback(async () => {
    try {
      await startCall();
      setModalState('in_call');
    } catch (err) {
      console.error('Failed to start call:', err);
      toast.error('Erro ao iniciar chamada');
    }
  }, [startCall]);

  /**
   * Handle call end.
   */
  const handleCallEnd = useCallback(
    async (endedSession: TelemedicineSession) => {
      try {
        await endCall();
        setModalState('ended');
        toast.success(`Consulta finalizada (${formatDuration(endedSession.durationSeconds || 0)})`);
      } catch (err) {
        console.error('Failed to end call:', err);
        // Still show ended state even if update fails
        setModalState('ended');
      }
    },
    [endCall, formatDuration]
  );

  /**
   * Handle cancel/close.
   */
  const handleCancel = useCallback(() => {
    if (modalState === 'in_call') {
      // Confirm before closing during call
      if (window.confirm('Tem certeza que deseja encerrar a teleconsulta?')) {
        endCall().finally(() => onClose());
      }
    } else {
      onClose();
    }
  }, [modalState, endCall, onClose]);

  /**
   * Handle saving notes and closing.
   */
  const handleSaveAndClose = useCallback(() => {
    // Notes could be saved to the session here
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  // Show loading state
  if (loading && !session) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg">Preparando teleconsulta...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="bg-genesis-surface rounded-2xl p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-genesis-dark mb-2">Erro na Teleconsulta</h2>
          <p className="text-genesis-medium mb-6">{error.message}</p>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-900 hover:bg-genesis-dark/90 text-white rounded-xl font-medium"
          >
            Fechar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/90">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 rounded-lg">
            <Video className="w-4 h-4 text-white" />
            <span className="text-white font-medium text-sm">Teleconsulta</span>
          </div>
          {session && (
            <span className="text-genesis-subtle text-sm">
              {session.patientName}
            </span>
          )}
        </div>

        <button
          onClick={handleCancel}
          className="p-2 hover:bg-genesis-surface/10 rounded-full transition-colors"
          title="Fechar"
        >
          <X className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Content */}
      <div className="h-full pt-16 pb-4 px-4">
        {session && modalState === 'waiting' && (
          <WaitingRoom
            session={session}
            displayName={userProfile?.displayName || 'Usuário'}
            isProfessional={isProfessional}
            onReady={handleReady}
            onCancel={handleCancel}
          />
        )}

        {session && modalState === 'in_call' && (
          <VideoRoom
            session={session}
            displayName={userProfile?.displayName || 'Usuário'}
            isProfessional={isProfessional}
            onCallEnd={handleCallEnd}
          />
        )}

        {modalState === 'ended' && (
          <div className="flex flex-col items-center justify-center h-full max-w-lg mx-auto">
            <div className="w-20 h-20 rounded-full bg-emerald-600 flex items-center justify-center mb-6">
              <Video className="w-10 h-10 text-white" />
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">
              Consulta Finalizada
            </h2>

            {session?.durationSeconds && (
              <p className="text-genesis-subtle mb-8">
                Duração: {formatDuration(session.durationSeconds)}
              </p>
            )}

            {isProfessional && (
              <div className="w-full mb-6">
                <label className="block text-genesis-subtle text-sm mb-2">
                  Notas da consulta (opcional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Adicione observações sobre a teleconsulta..."
                  className="w-full h-32 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            )}

            <button
              onClick={handleSaveAndClose}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-colors"
            >
              {isProfessional ? 'Salvar e Fechar' : 'Fechar'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
