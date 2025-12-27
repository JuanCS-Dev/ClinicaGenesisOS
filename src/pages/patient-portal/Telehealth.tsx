/**
 * Patient Portal - Telehealth
 * ===========================
 *
 * Video consultation waiting room and join interface.
 * Supports Google Meet (primary) and Jitsi (legacy).
 *
 * @module pages/patient-portal/Telehealth
 * @version 3.0.0
 */

import React, { useState } from 'react'
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Settings,
  User,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react'
import { toast } from 'sonner'
import { usePatientTelehealth } from '../../hooks/usePatientTelehealth'
import { Skeleton } from '../../components/ui/Skeleton'
import type { Appointment } from '@/types'

// ============================================================================
// Components
// ============================================================================

function TelehealthSkeleton() {
  return (
    <div className="space-y-6 animate-enter pb-8">
      {/* Header Skeleton */}
      <div>
        <div className="flex items-center gap-3">
          <Video className="w-7 h-7 text-clinical-start" />
          <Skeleton className="h-8 w-40" />
        </div>
        <Skeleton className="h-4 w-64 mt-2" />
      </div>

      {/* Main Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-80 rounded-2xl" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>

      {/* Instructions Skeleton */}
      <Skeleton className="h-40 rounded-2xl" />
    </div>
  )
}

function DeviceCheck() {
  const [videoEnabled, setVideoEnabled] = useState(true)
  const [audioEnabled, setAudioEnabled] = useState(true)

  return (
    <div className="bg-genesis-surface rounded-2xl border border-genesis-border p-6">
      <h3 className="font-semibold text-genesis-dark mb-4 flex items-center gap-2">
        <Settings className="w-5 h-5" />
        Verificar Dispositivos
      </h3>

      {/* Preview */}
      <div className="relative aspect-video bg-genesis-dark rounded-xl mb-4 overflow-hidden">
        {videoEnabled ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <User className="w-16 h-16 text-genesis-muted" />
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-genesis-dark">
            <VideoOff className="w-12 h-12 text-genesis-muted" />
            <p className="text-genesis-muted text-sm mt-2">Câmera desligada</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4">
        <button
          onClick={() => setVideoEnabled(!videoEnabled)}
          className={`p-4 rounded-xl transition-all duration-200 hover:scale-[1.05] active:scale-[0.95] ${
            videoEnabled ? 'bg-genesis-primary text-white' : 'bg-danger text-white'
          }`}
        >
          {videoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
        </button>

        <button
          onClick={() => setAudioEnabled(!audioEnabled)}
          className={`p-4 rounded-xl transition-all duration-200 hover:scale-[1.05] active:scale-[0.95] ${
            audioEnabled ? 'bg-genesis-primary text-white' : 'bg-danger text-white'
          }`}
        >
          {audioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
        </button>
      </div>

      {/* Status */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <CheckCircle2 className="w-4 h-4 text-success" />
          <span className="text-genesis-medium">Câmera funcionando</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <CheckCircle2 className="w-4 h-4 text-success" />
          <span className="text-genesis-medium">Microfone funcionando</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <CheckCircle2 className="w-4 h-4 text-success" />
          <span className="text-genesis-medium">Conexão estável</span>
        </div>
      </div>
    </div>
  )
}

interface AppointmentInfoProps {
  appointment: Appointment
  canJoin: boolean
  minutesUntilJoin: number | null
  meetLink: string | null
  isMeetSession: boolean
  onJoin: () => void
  onOpenMeet: () => void
  joining: boolean
}

function AppointmentInfo({
  appointment,
  canJoin,
  minutesUntilJoin,
  meetLink,
  isMeetSession,
  onJoin,
  onOpenMeet,
  joining,
}: AppointmentInfoProps) {
  const [copied, setCopied] = useState(false)
  const appointmentDate = new Date(appointment.date)

  const handleCopyLink = async () => {
    if (!meetLink) return
    try {
      await navigator.clipboard.writeText(meetLink)
      setCopied(true)
      toast.success('Link copiado!')
      setTimeout(() => setCopied(false), 3000)
    } catch {
      toast.error('Erro ao copiar link')
    }
  }

  return (
    <div className="bg-genesis-surface rounded-2xl border border-genesis-border p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-xl bg-genesis-primary/10 flex items-center justify-center">
          <User className="w-7 h-7 text-genesis-primary" />
        </div>
        <div>
          <p className="font-semibold text-genesis-dark">{appointment.professional}</p>
          <p className="text-sm text-genesis-muted">{appointment.specialty || 'Medico'}</p>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-3 text-genesis-medium">
          <Calendar className="w-5 h-5 text-genesis-muted" />
          <span>
            {appointmentDate.toLocaleDateString('pt-BR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </span>
        </div>
        <div className="flex items-center gap-3 text-genesis-medium">
          <Clock className="w-5 h-5 text-genesis-muted" />
          <span>
            {appointmentDate.toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
      </div>

      {canJoin ? (
        <div className="space-y-3">
          {/* Main action button - Meet or legacy */}
          {isMeetSession ? (
            <button
              onClick={onOpenMeet}
              disabled={joining}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-success text-white font-bold text-lg shadow-lg hover:bg-success/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50"
            >
              <ExternalLink className="w-6 h-6" />
              Entrar no Google Meet
            </button>
          ) : (
            <button
              onClick={onJoin}
              disabled={joining}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-success text-white font-medium hover:bg-success/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50"
            >
              <Video className="w-5 h-5" />
              {joining ? 'Entrando...' : 'Entrar na Sala'}
            </button>
          )}

          {/* Copy link option for Meet sessions */}
          {isMeetSession && meetLink && (
            <button
              onClick={handleCopyLink}
              className="w-full flex items-center justify-center gap-2 py-2 text-genesis-muted hover:text-genesis-dark transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-success" />
                  <span className="text-success text-sm">Link copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span className="text-sm">Copiar link do Meet</span>
                </>
              )}
            </button>
          )}

          {/* Google Meet badge */}
          {isMeetSession && (
            <p className="text-xs text-center text-genesis-muted">
              A consulta abrira no Google Meet
            </p>
          )}
        </div>
      ) : (
        <div className="text-center">
          <div className="bg-warning-soft rounded-xl p-4 mb-4">
            <AlertCircle className="w-6 h-6 text-warning mx-auto mb-2" />
            <p className="text-sm text-genesis-medium">
              {minutesUntilJoin !== null ? (
                <>
                  A sala estara disponivel em{' '}
                  <strong>
                    {minutesUntilJoin > 60
                      ? `${Math.floor(minutesUntilJoin / 60)}h ${minutesUntilJoin % 60}min`
                      : `${minutesUntilJoin} minutos`}
                  </strong>
                </>
              ) : (
                'A sala estara disponivel 15 minutos antes do horario agendado.'
              )}
            </p>
          </div>
          <button
            disabled
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-genesis-muted/30 text-genesis-muted font-medium cursor-not-allowed"
          >
            <Video className="w-5 h-5" />
            Aguardando horario
          </button>
        </div>
      )}
    </div>
  )
}

function NoAppointment() {
  return (
    <div className="bg-genesis-surface rounded-2xl border border-genesis-border p-6 text-center">
      <Video className="w-12 h-12 text-genesis-muted mx-auto mb-4" />
      <p className="font-medium text-genesis-dark">Nenhuma teleconsulta agendada</p>
      <p className="text-sm text-genesis-muted mt-2">
        Você não possui teleconsultas agendadas no momento.
      </p>
      <a
        href="/portal/consultas"
        className="inline-flex items-center justify-center gap-2 mt-4 px-4 py-2 rounded-xl bg-genesis-primary text-white font-medium hover:bg-genesis-primary-dark hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
      >
        Agendar Consulta
      </a>
    </div>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function PatientTelehealth(): React.ReactElement {
  const {
    nextTeleconsulta,
    loading,
    canJoin,
    minutesUntilJoin,
    meetLink,
    isMeetSession,
    joinWaitingRoom,
    openMeet,
  } = usePatientTelehealth()

  const [joining, setJoining] = useState(false)

  const handleJoin = async () => {
    setJoining(true)
    try {
      await joinWaitingRoom()
    } catch (error) {
      console.error('Error joining waiting room:', error)
      toast.error('Erro ao entrar na sala')
    } finally {
      setJoining(false)
    }
  }

  const handleOpenMeet = () => {
    openMeet()
  }

  if (loading) {
    return <TelehealthSkeleton />
  }

  return (
    <div className="space-y-6 animate-enter pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-genesis-dark flex items-center gap-3">
          <Video className="w-7 h-7 text-clinical-start" />
          Teleconsulta
        </h1>
        <p className="text-genesis-muted text-sm mt-1">
          {isMeetSession
            ? 'Consulta online via Google Meet'
            : 'Sala de espera virtual para consulta online'}
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Check - only show for non-Meet sessions or when waiting */}
        {(!isMeetSession || !canJoin) && <DeviceCheck />}

        {/* Meet Session Info - larger when Meet is ready */}
        {nextTeleconsulta.appointment ? (
          <div className={isMeetSession && canJoin ? 'lg:col-span-2' : ''}>
            <AppointmentInfo
              appointment={nextTeleconsulta.appointment}
              canJoin={canJoin}
              minutesUntilJoin={minutesUntilJoin}
              meetLink={meetLink}
              isMeetSession={isMeetSession}
              onJoin={handleJoin}
              onOpenMeet={handleOpenMeet}
              joining={joining}
            />
          </div>
        ) : (
          <NoAppointment />
        )}
      </div>

      {/* Instructions */}
      <div className="bg-clinical-soft rounded-2xl p-6 border border-clinical-start/20">
        <h3 className="font-semibold text-genesis-dark mb-4">
          Preparacao para a Teleconsulta
        </h3>
        <ul className="space-y-2 text-sm text-genesis-medium">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Escolha um local silencioso e bem iluminado</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Verifique sua conexao com a internet</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Tenha seus documentos e exames em maos</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Use fones de ouvido para melhor qualidade de audio</span>
          </li>
          {isMeetSession && (
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-success" />
              <span>O Meet abrira em nova aba - permita camera e microfone</span>
            </li>
          )}
        </ul>
      </div>
    </div>
  )
}

export default PatientTelehealth
