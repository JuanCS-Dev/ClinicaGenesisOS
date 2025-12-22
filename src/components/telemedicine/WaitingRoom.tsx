/**
 * WaitingRoom Component
 *
 * Pre-call waiting room where patients wait for the professional.
 * Allows testing audio/video before joining the actual call.
 *
 * This is often the most anxious moment for a patient - waiting to see
 * their doctor. We make it calm, informative, and reassuring.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  User,
  Clock,
  CheckCircle,
  Loader2,
  XCircle,
} from 'lucide-react';
import type { WaitingRoomProps } from '@/types';

interface DeviceStatus {
  camera: 'checking' | 'granted' | 'denied' | 'error';
  microphone: 'checking' | 'granted' | 'denied' | 'error';
}

/**
 * WaitingRoom - Pre-call setup and waiting area.
 *
 * @param session - The teleconsultation session
 * @param displayName - User's display name
 * @param isProfessional - Whether current user is the professional
 * @param onReady - Callback when user is ready to join
 * @param onCancel - Callback to cancel/leave
 */
export function WaitingRoom({
  session,
  displayName,
  isProfessional,
  onReady,
  onCancel,
}: WaitingRoomProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [deviceStatus, setDeviceStatus] = useState<DeviceStatus>({
    camera: 'checking',
    microphone: 'checking',
  });
  const [waitingTime, setWaitingTime] = useState(0);

  // Request media permissions and set up preview
  useEffect(() => {
    let isActive = true;

    async function setupMediaPreview() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: videoEnabled,
          audio: audioEnabled,
        });

        if (!isActive) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current && videoEnabled) {
          videoRef.current.srcObject = stream;
        }

        setDeviceStatus({
          camera: videoEnabled ? 'granted' : 'checking',
          microphone: audioEnabled ? 'granted' : 'checking',
        });
      } catch (err) {
        console.error('Media access error:', err);
        if (isActive) {
          const error = err as Error;
          if (error.name === 'NotAllowedError') {
            setDeviceStatus({ camera: 'denied', microphone: 'denied' });
          } else {
            setDeviceStatus({ camera: 'error', microphone: 'error' });
          }
        }
      }
    }

    setupMediaPreview();

    return () => {
      isActive = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [videoEnabled, audioEnabled]);

  // Waiting timer
  useEffect(() => {
    const interval = setInterval(() => {
      setWaitingTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  /**
   * Toggle video on/off.
   */
  const toggleVideo = useCallback(() => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoEnabled;
      }
    }
    setVideoEnabled((prev) => !prev);
  }, [videoEnabled]);

  /**
   * Toggle audio on/off.
   */
  const toggleAudio = useCallback(() => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioEnabled;
      }
    }
    setAudioEnabled((prev) => !prev);
  }, [audioEnabled]);

  /**
   * Format waiting time as mm:ss.
   */
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  /**
   * Get status icon for device.
   */
  const getStatusIcon = (status: DeviceStatus['camera']) => {
    switch (status) {
      case 'checking':
        return <Loader2 className="w-4 h-4 animate-spin text-genesis-subtle" />;
      case 'granted':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'denied':
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const canJoin = deviceStatus.camera !== 'denied' && deviceStatus.microphone !== 'denied';

  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">
          {isProfessional ? 'Sala de Espera' : 'Aguardando o Médico'}
        </h2>
        <p className="text-genesis-subtle">
          {isProfessional
            ? `Paciente: ${session.patientName}`
            : `Dr(a). ${session.professionalName} entrará em breve`}
        </p>
      </div>

      {/* Video preview */}
      <div className="relative w-full max-w-md aspect-video bg-gray-800 rounded-2xl overflow-hidden mb-6 shadow-2xl">
        {videoEnabled && deviceStatus.camera === 'granted' ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover mirror"
            style={{ transform: 'scaleX(-1)' }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center mb-4">
              <User className="w-12 h-12 text-genesis-muted" />
            </div>
            <p className="text-genesis-subtle text-sm">
              {deviceStatus.camera === 'denied'
                ? 'Câmera sem permissão'
                : 'Câmera desativada'}
            </p>
          </div>
        )}

        {/* Name overlay */}
        <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-lg text-white text-sm font-medium">
          {displayName}
        </div>
      </div>

      {/* Device controls */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={toggleVideo}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
            videoEnabled
              ? 'bg-gray-700 hover:bg-gray-600 text-white'
              : 'bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/50'
          }`}
          disabled={deviceStatus.camera === 'denied'}
        >
          {videoEnabled ? (
            <Video className="w-5 h-5" />
          ) : (
            <VideoOff className="w-5 h-5" />
          )}
          <span>{videoEnabled ? 'Câmera' : 'Câmera Off'}</span>
        </button>

        <button
          onClick={toggleAudio}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
            audioEnabled
              ? 'bg-gray-700 hover:bg-gray-600 text-white'
              : 'bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/50'
          }`}
          disabled={deviceStatus.microphone === 'denied'}
        >
          {audioEnabled ? (
            <Mic className="w-5 h-5" />
          ) : (
            <MicOff className="w-5 h-5" />
          )}
          <span>{audioEnabled ? 'Microfone' : 'Mic Off'}</span>
        </button>
      </div>

      {/* Device status */}
      <div className="flex items-center gap-6 mb-8 text-sm">
        <div className="flex items-center gap-2 text-genesis-subtle">
          {getStatusIcon(deviceStatus.camera)}
          <span>Câmera</span>
        </div>
        <div className="flex items-center gap-2 text-genesis-subtle">
          {getStatusIcon(deviceStatus.microphone)}
          <span>Microfone</span>
        </div>
      </div>

      {/* Waiting indicator */}
      {!isProfessional && (
        <div className="flex items-center gap-3 px-4 py-2 bg-blue-600/20 border border-blue-600/30 rounded-xl mb-8">
          <Clock className="w-5 h-5 text-blue-400" />
          <span className="text-blue-300">
            Aguardando há {formatTime(waitingTime)}
          </span>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-4">
        <button
          onClick={onCancel}
          className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-colors"
        >
          Cancelar
        </button>

        <button
          onClick={onReady}
          disabled={!canJoin}
          className={`px-8 py-3 rounded-xl font-semibold transition-all ${
            canJoin
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 hover:scale-105'
              : 'bg-gray-600 text-genesis-subtle cursor-not-allowed'
          }`}
        >
          {isProfessional ? 'Iniciar Consulta' : 'Entrar na Consulta'}
        </button>
      </div>

      {/* Permission warning */}
      {(deviceStatus.camera === 'denied' || deviceStatus.microphone === 'denied') && (
        <div className="mt-6 p-4 bg-amber-600/20 border border-amber-600/30 rounded-xl max-w-md text-center">
          <p className="text-amber-300 text-sm">
            Para participar da teleconsulta, você precisa permitir o acesso à
            câmera e microfone nas configurações do seu navegador.
          </p>
        </div>
      )}
    </div>
  );
}
