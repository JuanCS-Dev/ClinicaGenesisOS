/**
 * MeetRoom Component
 * ==================
 *
 * Simplified video room for Google Meet teleconsultations.
 * Opens Meet in a new browser tab (no embedded SDK needed).
 *
 * This approach is intentionally simple because:
 * 1. Google Meet is already familiar to most users
 * 2. Meet has its own excellent UX and accessibility
 * 3. Opens native Meet app on Android (90%+ of Brazil)
 * 4. No SDK maintenance burden
 *
 * @module components/telemedicine/MeetRoom
 */

import React, { useState, useCallback } from 'react'
import {
  Video,
  ExternalLink,
  Copy,
  Check,
  Clock,
  User,
  Stethoscope,
  PhoneOff,
  AlertCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import type { MeetRoomProps } from '@/types'

/**
 * MeetRoom - Google Meet launcher for teleconsultations.
 *
 * @param session - The teleconsultation session with meetLink
 * @param displayName - Name of current user
 * @param isProfessional - Whether current user is the professional
 * @param onJoinMeet - Callback when user clicks to join
 * @param onEndSession - Callback when user ends session
 */
export function MeetRoom({
  session,
  displayName: _displayName,
  isProfessional,
  onJoinMeet,
  onEndSession,
}: MeetRoomProps): React.ReactElement {
  const [hasJoined, setHasJoined] = useState(false)
  const [copied, setCopied] = useState(false)

  // Handle join button click
  const handleJoin = useCallback(() => {
    if (!session.meetLink) {
      toast.error('Link do Meet nao disponivel')
      return
    }

    // Open Meet in new tab
    window.open(session.meetLink, '_blank', 'noopener,noreferrer')
    setHasJoined(true)
    onJoinMeet()
    toast.success('Abrindo Google Meet...')
  }, [session.meetLink, onJoinMeet])

  // Handle copy link
  const handleCopyLink = useCallback(async () => {
    if (!session.meetLink) return

    try {
      await navigator.clipboard.writeText(session.meetLink)
      setCopied(true)
      toast.success('Link copiado!')
      setTimeout(() => setCopied(false), 3000)
    } catch {
      toast.error('Erro ao copiar link')
    }
  }, [session.meetLink])

  // Handle end session
  const handleEnd = useCallback(() => {
    onEndSession()
  }, [onEndSession])

  // Format scheduled time
  const scheduledTime = new Date(session.scheduledAt).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })

  // Show error if no Meet link
  if (!session.meetLink) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-genesis-surface rounded-2xl p-8">
        <div className="w-20 h-20 rounded-full bg-danger-soft flex items-center justify-center mb-6">
          <AlertCircle className="w-10 h-10 text-danger" />
        </div>
        <h2 className="text-xl font-bold text-genesis-dark mb-2">
          Link do Meet indisponivel
        </h2>
        <p className="text-genesis-muted text-center max-w-md">
          O link para a teleconsulta ainda nao foi gerado.
          Por favor, aguarde ou entre em contato com a clinica.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full min-h-[500px] bg-genesis-surface rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-genesis-primary text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <Video className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Teleconsulta</h1>
              <p className="text-white/80 text-sm">Google Meet</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-white/80 text-sm">
            <Clock className="w-4 h-4" />
            <span>{scheduledTime}</span>
          </div>
        </div>
      </div>

      {/* Session Info */}
      <div className="p-6 border-b border-genesis-border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Professional Info */}
          <div className="flex items-center gap-3 p-4 bg-genesis-soft rounded-xl">
            <div className="w-10 h-10 rounded-full bg-genesis-primary/10 flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-genesis-primary" />
            </div>
            <div>
              <p className="text-xs text-genesis-muted">Profissional</p>
              <p className="font-medium text-genesis-dark">{session.professionalName}</p>
            </div>
          </div>

          {/* Patient Info */}
          <div className="flex items-center gap-3 p-4 bg-genesis-soft rounded-xl">
            <div className="w-10 h-10 rounded-full bg-info/10 flex items-center justify-center">
              <User className="w-5 h-5 text-info" />
            </div>
            <div>
              <p className="text-xs text-genesis-muted">Paciente</p>
              <p className="font-medium text-genesis-dark">{session.patientName}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Action Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {!hasJoined ? (
          <>
            {/* Join Button */}
            <div className="w-32 h-32 rounded-full bg-success/10 flex items-center justify-center mb-6 animate-pulse">
              <Video className="w-16 h-16 text-success" />
            </div>

            <h2 className="text-2xl font-bold text-genesis-dark mb-2">
              Pronto para entrar?
            </h2>
            <p className="text-genesis-muted text-center mb-8 max-w-md">
              Clique no botao abaixo para entrar na teleconsulta.
              O Google Meet abrira em uma nova aba.
            </p>

            <button
              onClick={handleJoin}
              className="flex items-center gap-3 px-8 py-4 bg-success text-white rounded-xl font-bold text-lg shadow-lg hover:bg-success-dark hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              <ExternalLink className="w-6 h-6" />
              Entrar na Teleconsulta
            </button>

            {/* Copy link option */}
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 mt-4 px-4 py-2 text-genesis-muted hover:text-genesis-dark transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-success" />
                  <span className="text-success">Link copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar link do Meet</span>
                </>
              )}
            </button>
          </>
        ) : (
          <>
            {/* After joining */}
            <div className="w-32 h-32 rounded-full bg-info/10 flex items-center justify-center mb-6">
              <Video className="w-16 h-16 text-info" />
            </div>

            <h2 className="text-2xl font-bold text-genesis-dark mb-2">
              Teleconsulta em andamento
            </h2>
            <p className="text-genesis-muted text-center mb-8 max-w-md">
              A teleconsulta esta aberta em outra aba.
              Quando terminar, clique em &quot;Encerrar Consulta&quot;.
            </p>

            {/* Rejoin button */}
            <button
              onClick={handleJoin}
              className="flex items-center gap-2 px-6 py-3 bg-genesis-primary text-white rounded-xl font-medium hover:bg-genesis-primary-dark transition-colors mb-4"
            >
              <ExternalLink className="w-5 h-5" />
              Abrir Meet novamente
            </button>

            {/* End session button (professional only) */}
            {isProfessional && (
              <button
                onClick={handleEnd}
                className="flex items-center gap-2 px-6 py-3 bg-danger text-white rounded-xl font-medium hover:bg-danger/90 transition-colors"
              >
                <PhoneOff className="w-5 h-5" />
                Encerrar Consulta
              </button>
            )}
          </>
        )}
      </div>

      {/* Instructions */}
      <div className="p-6 bg-info-soft border-t border-genesis-border">
        <h3 className="font-semibold text-genesis-dark mb-3">Instrucoes</h3>
        <ul className="space-y-2 text-sm text-genesis-muted">
          <li className="flex items-start gap-2">
            <span className="text-info">1.</span>
            Clique em &quot;Entrar na Teleconsulta&quot; para abrir o Google Meet
          </li>
          <li className="flex items-start gap-2">
            <span className="text-info">2.</span>
            Permita acesso a camera e microfone quando solicitado
          </li>
          <li className="flex items-start gap-2">
            <span className="text-info">3.</span>
            Aguarde o outro participante entrar na sala
          </li>
          <li className="flex items-start gap-2">
            <span className="text-info">4.</span>
            Ao terminar, clique em encerrar no Meet e volte aqui
          </li>
        </ul>
      </div>
    </div>
  )
}

export default MeetRoom
