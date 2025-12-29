/**
 * VideoRoom Component
 *
 * Main video conferencing component supporting:
 * - Google Meet (primary) - Opens Meet link in new tab
 * - Jitsi Meet (legacy) - Embedded Jitsi iframe
 *
 * This component is the heart of telemedicine - where doctor and patient
 * connect face-to-face despite the distance. Every pixel matters because
 * this might be the only way a bedridden patient can see their doctor.
 */

import { useCallback, useRef, useEffect, useState } from 'react'
import { JitsiMeeting } from '@jitsi/react-sdk'
import type { IJitsiMeetExternalApi } from '@jitsi/react-sdk/lib/types'
import {
  PhoneOff,
  AlertCircle,
  Loader2,
  Video,
  ExternalLink,
  Copy,
  Check,
  Clock,
} from 'lucide-react'
import { toast } from 'sonner'
import type { VideoRoomProps } from '@/types'
import { ConsultationTimer } from './ConsultationTimer'
import { RecordingBadge } from './RecordingBadge'
import { DEFAULT_JITSI_CONFIG } from '@/types'

/**
 * GoogleMeetInterface - Interface for Google Meet sessions.
 * Opens Meet in new tab (no embedded iframe needed).
 */
function GoogleMeetInterface({
  session,
  displayName: _displayName,
  isProfessional,
  onCallEnd,
}: VideoRoomProps) {
  const [hasJoined, setHasJoined] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleJoinMeet = useCallback(() => {
    if (!session.meetLink) {
      toast.error('Link do Meet nao disponivel')
      return
    }

    window.open(session.meetLink, '_blank', 'noopener,noreferrer')
    setHasJoined(true)
    toast.success('Abrindo Google Meet...')
  }, [session.meetLink])

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

  const handleEndSession = useCallback(() => {
    onCallEnd(session)
  }, [session, onCallEnd])

  const scheduledDate = new Date(session.scheduledAt)

  return (
    <div className="flex flex-col h-full min-h-[500px] bg-genesis-surface rounded-2xl border border-genesis-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-genesis-border-subtle bg-genesis-soft">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
            <Video className="w-5 h-5 text-success" />
          </div>
          <div>
            <h2 className="font-semibold text-genesis-dark">Teleconsulta</h2>
            <p className="text-xs text-genesis-muted">Google Meet</p>
          </div>
        </div>

        {session.startedAt && <ConsultationTimer startTime={session.startedAt} />}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {!hasJoined ? (
          <>
            {/* Session Info */}
            <div className="grid grid-cols-2 gap-4 w-full max-w-md mb-8">
              <div className="bg-genesis-soft rounded-xl p-4 text-center">
                <p className="text-xs text-genesis-muted mb-1">Profissional</p>
                <p className="font-medium text-genesis-dark truncate">{session.professionalName}</p>
              </div>
              <div className="bg-genesis-soft rounded-xl p-4 text-center">
                <p className="text-xs text-genesis-muted mb-1">Paciente</p>
                <p className="font-medium text-genesis-dark truncate">{session.patientName}</p>
              </div>
            </div>

            {/* Time Info */}
            <div className="flex items-center gap-2 text-genesis-muted mb-8">
              <Clock className="w-4 h-4" />
              <span className="text-sm">
                Agendado para{' '}
                {scheduledDate.toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>

            {/* Join Button */}
            <button
              onClick={handleJoinMeet}
              className="flex items-center justify-center gap-3 px-8 py-4 bg-success text-white rounded-xl font-bold text-lg shadow-lg hover:bg-success/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              <ExternalLink className="w-6 h-6" />
              Entrar na Teleconsulta
            </button>

            {/* Copy Link */}
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 mt-4 px-4 py-2 text-genesis-muted hover:text-genesis-dark transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-success" />
                  <span className="text-sm text-success">Link copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span className="text-sm">Copiar link do Meet</span>
                </>
              )}
            </button>
          </>
        ) : (
          <>
            {/* In Call State */}
            <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mb-6 animate-pulse">
              <Video className="w-10 h-10 text-success" />
            </div>

            <h3 className="text-xl font-semibold text-genesis-dark mb-2">
              Teleconsulta em andamento
            </h3>
            <p className="text-genesis-muted text-center mb-8">
              A chamada esta aberta em outra aba
            </p>

            {/* Rejoin Button */}
            <button
              onClick={handleJoinMeet}
              className="flex items-center gap-2 px-6 py-3 bg-genesis-primary text-white rounded-xl font-medium hover:bg-genesis-primary-dark hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              <ExternalLink className="w-5 h-5" />
              Abrir Meet novamente
            </button>

            {/* End Session (Professional only) */}
            {isProfessional && (
              <button
                onClick={handleEndSession}
                className="flex items-center gap-2 mt-4 px-6 py-3 bg-danger text-white rounded-xl font-medium hover:bg-danger/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                <PhoneOff className="w-5 h-5" />
                Encerrar Consulta
              </button>
            )}
          </>
        )}
      </div>

      {/* Instructions */}
      <div className="p-4 border-t border-genesis-border-subtle bg-genesis-soft">
        <p className="text-xs text-genesis-muted text-center">
          O Meet abrira em nova aba. Permita acesso a camera e microfone quando solicitado.
        </p>
      </div>
    </div>
  )
}

/**
 * JitsiInterface - Legacy Jitsi Meet wrapper for teleconsultations.
 *
 * @param session - The teleconsultation session
 * @param displayName - Name to show in the call
 * @param isProfessional - Whether current user is the professional
 * @param onCallEnd - Callback when call ends
 * @param onParticipantJoin - Optional callback when someone joins
 * @param onParticipantLeave - Optional callback when someone leaves
 */
function JitsiInterface({
  session,
  displayName,
  isProfessional,
  onCallEnd,
  onParticipantJoin,
  onParticipantLeave,
}: VideoRoomProps) {
  const apiRef = useRef<IJitsiMeetExternalApi | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [participantCount, setParticipantCount] = useState(0)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (apiRef.current) {
        apiRef.current.dispose()
      }
    }
  }, [])

  /**
   * Handle Jitsi API ready event.
   * Sets up all event listeners for the video call.
   */
  const handleApiReady = useCallback(
    (api: IJitsiMeetExternalApi) => {
      apiRef.current = api
      setIsLoading(false)
      setConnectionError(null)

      // Track participants
      api.addListener('participantJoined', (participant: { id: string; displayName: string }) => {
        setParticipantCount(prev => prev + 1)
        if (onParticipantJoin) {
          onParticipantJoin({
            id: participant.id,
            displayName: participant.displayName,
            role: 'patient', // Will be determined properly by context
            joinedAt: new Date().toISOString(),
          })
        }
      })

      api.addListener('participantLeft', (participant: { id: string }) => {
        setParticipantCount(prev => Math.max(0, prev - 1))
        if (onParticipantLeave) {
          onParticipantLeave({
            id: participant.id,
            displayName: 'Unknown',
            role: 'patient',
            leftAt: new Date().toISOString(),
          })
        }
      })

      // Handle call end
      api.addListener('videoConferenceLeft', () => {
        onCallEnd(session)
      })

      // Handle connection errors
      api.addListener('errorOccurred', (error: { error: string }) => {
        console.error('Jitsi error:', error)
        setConnectionError('Erro de conexão. Por favor, verifique sua internet.')
      })
    },
    [session, onCallEnd, onParticipantJoin, onParticipantLeave]
  )

  /**
   * Handle ready to close event.
   */
  const handleReadyToClose = useCallback(() => {
    onCallEnd(session)
  }, [session, onCallEnd])

  /**
   * End the call programmatically.
   */
  const handleEndCall = useCallback(() => {
    if (apiRef.current) {
      apiRef.current.executeCommand('hangup')
    }
  }, [])

  // Show error state
  if (connectionError) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-900 text-white p-8">
        <AlertCircle className="w-16 h-16 text-danger mb-4" />
        <h2 className="text-xl font-semibold mb-2">Erro de Conexão</h2>
        <p className="text-genesis-subtle text-center mb-6">{connectionError}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-genesis-primary hover:bg-genesis-primary-dark rounded-xl font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          Tentar Novamente
        </button>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full min-h-[500px] bg-gray-900 rounded-2xl overflow-hidden">
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-10">
          <Loader2 className="w-12 h-12 text-genesis-primary animate-spin mb-4" />
          <p className="text-white text-lg">Conectando à teleconsulta...</p>
          <p className="text-genesis-subtle text-sm mt-2">Preparando ambiente seguro de vídeo</p>
        </div>
      )}

      {/* Top bar with info */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/70 to-transparent">
        <div className="flex items-center gap-4">
          {/* Timer */}
          {session.startedAt && <ConsultationTimer startTime={session.startedAt} />}

          {/* Recording indicator */}
          {session.recordingEnabled && <RecordingBadge />}
        </div>

        {/* Patient/Doctor info */}
        <div className="text-white text-sm">
          <span className="text-genesis-subtle">{isProfessional ? 'Paciente: ' : 'Dr(a). '}</span>
          <span className="font-medium">
            {isProfessional ? session.patientName : session.professionalName}
          </span>
        </div>
      </div>

      {/* Jitsi Meeting */}
      <JitsiMeeting
        domain={DEFAULT_JITSI_CONFIG.domain}
        roomName={session.roomName}
        configOverwrite={{
          startWithAudioMuted: DEFAULT_JITSI_CONFIG.startWithAudioMuted,
          startWithVideoMuted: DEFAULT_JITSI_CONFIG.startWithVideoMuted,
          prejoinPageEnabled: false, // Already passed waiting room
          disableDeepLinking: DEFAULT_JITSI_CONFIG.disableDeepLinking,
          disableThirdPartyRequests: true,
          disableLocalVideoFlip: true,
          backgroundAlpha: 0.5,
          // Security
          enableInsecureRoomNameWarning: false,
          // UI
          hideConferenceSubject: true,
          hideConferenceTimer: true, // We use our own timer
          // Features
          toolbarButtons: DEFAULT_JITSI_CONFIG.toolbarButtons,
          // Quality
          resolution: 720,
          constraints: {
            video: {
              height: { ideal: 720, max: 720, min: 240 },
              width: { ideal: 1280, max: 1280, min: 320 },
            },
          },
        }}
        interfaceConfigOverwrite={{
          SHOW_JITSI_WATERMARK: DEFAULT_JITSI_CONFIG.showWatermark,
          SHOW_BRAND_WATERMARK: false,
          SHOW_POWERED_BY: false,
          SHOW_PROMOTIONAL_CLOSE_PAGE: false,
          MOBILE_APP_PROMO: false,
          TOOLBAR_ALWAYS_VISIBLE: true,
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
          DISABLE_PRESENCE_STATUS: false,
          DEFAULT_BACKGROUND: '#1a1a2e',
          DEFAULT_REMOTE_DISPLAY_NAME: 'Participante',
          DEFAULT_LOCAL_DISPLAY_NAME: 'Eu',
        }}
        userInfo={{
          displayName,
          email: '',
        }}
        onApiReady={handleApiReady}
        onReadyToClose={handleReadyToClose}
        getIFrameRef={iframeRef => {
          if (iframeRef) {
            iframeRef.style.height = '100%'
            iframeRef.style.width = '100%'
          }
        }}
      />

      {/* Bottom controls overlay (professional only) */}
      {isProfessional && !isLoading && (
        <div className="absolute bottom-4 right-4 z-20">
          <button
            onClick={handleEndCall}
            className="flex items-center gap-2 px-4 py-2 bg-danger hover:bg-danger/90 text-white rounded-xl font-medium shadow-lg transition-all duration-200 hover:scale-[1.05] active:scale-[0.98]"
            title="Encerrar consulta"
          >
            <PhoneOff className="w-5 h-5" />
            <span className="hidden sm:inline">Encerrar</span>
          </button>
        </div>
      )}

      {/* Participant count indicator */}
      {participantCount > 0 && (
        <div className="absolute bottom-4 left-4 z-20 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-full text-white text-sm">
          {participantCount + 1} participante{participantCount > 0 ? 's' : ''}
        </div>
      )}
    </div>
  )
}

/**
 * VideoRoom - Main component for teleconsultations.
 *
 * Automatically selects the appropriate interface:
 * - Google Meet (primary) - When session has meetLink
 * - Jitsi Meet (legacy) - When session only has roomName
 *
 * @param session - The teleconsultation session
 * @param displayName - Name to show in the call
 * @param isProfessional - Whether current user is the professional
 * @param onCallEnd - Callback when call ends
 * @param onParticipantJoin - Optional callback when someone joins
 * @param onParticipantLeave - Optional callback when someone leaves
 */
export function VideoRoom(props: VideoRoomProps) {
  const { session } = props

  // Use Google Meet if meetLink is available (primary)
  // Fall back to Jitsi if only roomName exists (legacy)
  if (session.meetLink) {
    return <GoogleMeetInterface {...props} />
  }

  return <JitsiInterface {...props} />
}
