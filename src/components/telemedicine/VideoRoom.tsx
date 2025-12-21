/**
 * VideoRoom Component
 *
 * Main video conferencing component using Jitsi Meet.
 * Wraps JitsiMeeting with Genesis-specific configuration.
 *
 * This component is the heart of telemedicine - where doctor and patient
 * connect face-to-face despite the distance. Every pixel matters because
 * this might be the only way a bedridden patient can see their doctor.
 */

import { useCallback, useRef, useEffect, useState } from 'react';
import { JitsiMeeting } from '@jitsi/react-sdk';
import type { IJitsiMeetExternalApi } from '@jitsi/react-sdk/lib/types';
import { PhoneOff, AlertCircle, Loader2 } from 'lucide-react';
import type { VideoRoomProps } from '@/types';
import { ConsultationTimer } from './ConsultationTimer';
import { RecordingBadge } from './RecordingBadge';
import { DEFAULT_JITSI_CONFIG } from '@/types';

/**
 * VideoRoom - Jitsi Meet wrapper for teleconsultations.
 *
 * @param session - The teleconsultation session
 * @param displayName - Name to show in the call
 * @param isProfessional - Whether current user is the professional
 * @param onCallEnd - Callback when call ends
 * @param onParticipantJoin - Optional callback when someone joins
 * @param onParticipantLeave - Optional callback when someone leaves
 */
export function VideoRoom({
  session,
  displayName,
  isProfessional,
  onCallEnd,
  onParticipantJoin,
  onParticipantLeave,
}: VideoRoomProps) {
  const apiRef = useRef<IJitsiMeetExternalApi | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [participantCount, setParticipantCount] = useState(0);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (apiRef.current) {
        apiRef.current.dispose();
      }
    };
  }, []);

  /**
   * Handle Jitsi API ready event.
   * Sets up all event listeners for the video call.
   */
  const handleApiReady = useCallback(
    (api: IJitsiMeetExternalApi) => {
      apiRef.current = api;
      setIsLoading(false);
      setConnectionError(null);

      // Track participants
      api.addListener('participantJoined', (participant: { id: string; displayName: string }) => {
        setParticipantCount((prev) => prev + 1);
        if (onParticipantJoin) {
          onParticipantJoin({
            id: participant.id,
            displayName: participant.displayName,
            role: 'patient', // Will be determined properly by context
            joinedAt: new Date().toISOString(),
          });
        }
      });

      api.addListener('participantLeft', (participant: { id: string }) => {
        setParticipantCount((prev) => Math.max(0, prev - 1));
        if (onParticipantLeave) {
          onParticipantLeave({
            id: participant.id,
            displayName: 'Unknown',
            role: 'patient',
            leftAt: new Date().toISOString(),
          });
        }
      });

      // Handle call end
      api.addListener('videoConferenceLeft', () => {
        onCallEnd(session);
      });

      // Handle connection errors
      api.addListener('errorOccurred', (error: { error: string }) => {
        console.error('Jitsi error:', error);
        setConnectionError('Erro de conexão. Por favor, verifique sua internet.');
      });
    },
    [session, onCallEnd, onParticipantJoin, onParticipantLeave]
  );

  /**
   * Handle ready to close event.
   */
  const handleReadyToClose = useCallback(() => {
    onCallEnd(session);
  }, [session, onCallEnd]);

  /**
   * End the call programmatically.
   */
  const handleEndCall = useCallback(() => {
    if (apiRef.current) {
      apiRef.current.executeCommand('hangup');
    }
  }, []);

  // Show error state
  if (connectionError) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-900 text-white p-8">
        <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Erro de Conexão</h2>
        <p className="text-gray-400 text-center mb-6">{connectionError}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-medium transition-colors"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[500px] bg-gray-900 rounded-2xl overflow-hidden">
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-10">
          <Loader2 className="w-12 h-12 text-blue-400 animate-spin mb-4" />
          <p className="text-white text-lg">Conectando à teleconsulta...</p>
          <p className="text-gray-400 text-sm mt-2">
            Preparando ambiente seguro de vídeo
          </p>
        </div>
      )}

      {/* Top bar with info */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/70 to-transparent">
        <div className="flex items-center gap-4">
          {/* Timer */}
          {session.startedAt && (
            <ConsultationTimer startTime={session.startedAt} />
          )}

          {/* Recording indicator */}
          {session.recordingEnabled && <RecordingBadge />}
        </div>

        {/* Patient/Doctor info */}
        <div className="text-white text-sm">
          <span className="text-gray-300">
            {isProfessional ? 'Paciente: ' : 'Dr(a). '}
          </span>
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
          email: undefined,
        }}
        onApiReady={handleApiReady}
        onReadyToClose={handleReadyToClose}
        getIFrameRef={(iframeRef) => {
          if (iframeRef) {
            iframeRef.style.height = '100%';
            iframeRef.style.width = '100%';
          }
        }}
      />

      {/* Bottom controls overlay (professional only) */}
      {isProfessional && !isLoading && (
        <div className="absolute bottom-4 right-4 z-20">
          <button
            onClick={handleEndCall}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium shadow-lg transition-all hover:scale-105"
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
  );
}
