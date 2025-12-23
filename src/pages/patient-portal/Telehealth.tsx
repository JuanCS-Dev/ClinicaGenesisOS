/**
 * Patient Portal - Telehealth
 * ===========================
 *
 * Video consultation waiting room and join interface.
 *
 * @module pages/patient-portal/Telehealth
 * @version 1.0.0
 */

import React, { useState } from 'react';
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
} from 'lucide-react';

// ============================================================================
// Mock Data
// ============================================================================

const MOCK_TELECONSULTA = {
  id: '1',
  date: '2024-12-28',
  time: '14:30',
  provider: 'Dr. João Silva',
  specialty: 'Clínica Geral',
  status: 'scheduled', // 'scheduled' | 'waiting' | 'in_progress' | 'completed'
};

// ============================================================================
// Components
// ============================================================================

function DeviceCheck() {
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);

  return (
    <div className="bg-white dark:bg-genesis-surface rounded-2xl border border-genesis-border p-6">
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
          <div className="absolute inset-0 flex items-center justify-center bg-genesis-dark">
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
            videoEnabled
              ? 'bg-genesis-primary text-white'
              : 'bg-danger text-white'
          }`}
        >
          {videoEnabled ? (
            <Video className="w-6 h-6" />
          ) : (
            <VideoOff className="w-6 h-6" />
          )}
        </button>

        <button
          onClick={() => setAudioEnabled(!audioEnabled)}
          className={`p-4 rounded-xl transition-all duration-200 hover:scale-[1.05] active:scale-[0.95] ${
            audioEnabled
              ? 'bg-genesis-primary text-white'
              : 'bg-danger text-white'
          }`}
        >
          {audioEnabled ? (
            <Mic className="w-6 h-6" />
          ) : (
            <MicOff className="w-6 h-6" />
          )}
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
  );
}

function AppointmentInfo({ appointment }: { appointment: typeof MOCK_TELECONSULTA }) {
  const appointmentDate = new Date(`${appointment.date}T${appointment.time}`);
  const now = new Date();
  const isToday = appointmentDate.toDateString() === now.toDateString();
  const canJoin =
    isToday && now >= new Date(appointmentDate.getTime() - 15 * 60 * 1000);

  return (
    <div className="bg-white dark:bg-genesis-surface rounded-2xl border border-genesis-border p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-xl bg-genesis-primary/10 flex items-center justify-center">
          <User className="w-7 h-7 text-genesis-primary" />
        </div>
        <div>
          <p className="font-semibold text-genesis-dark">{appointment.provider}</p>
          <p className="text-sm text-genesis-muted">{appointment.specialty}</p>
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
          <span>{appointment.time}</span>
        </div>
      </div>

      {canJoin ? (
        <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-success text-white font-medium hover:bg-success/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
          <Video className="w-5 h-5" />
          Entrar na Sala
        </button>
      ) : (
        <div className="text-center">
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 mb-4">
            <AlertCircle className="w-6 h-6 text-amber-600 mx-auto mb-2" />
            <p className="text-sm text-amber-700 dark:text-amber-300">
              A sala estará disponível 15 minutos antes do horário agendado.
            </p>
          </div>
          <button
            disabled
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-genesis-muted/30 text-genesis-muted font-medium cursor-not-allowed"
          >
            <Video className="w-5 h-5" />
            Aguardando horário
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function PatientTelehealth(): React.ReactElement {
  return (
    <div className="space-y-6 animate-enter pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-genesis-dark flex items-center gap-3">
          <Video className="w-7 h-7 text-purple-600" />
          Teleconsulta
        </h1>
        <p className="text-genesis-muted text-sm mt-1">
          Sala de espera virtual para consulta online
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Check */}
        <DeviceCheck />

        {/* Appointment Info */}
        <AppointmentInfo appointment={MOCK_TELECONSULTA} />
      </div>

      {/* Instructions */}
      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-6 border border-purple-100 dark:border-purple-800">
        <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-4">
          Preparação para a Teleconsulta
        </h3>
        <ul className="space-y-2 text-sm text-purple-700 dark:text-purple-300">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Escolha um local silencioso e bem iluminado</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Verifique sua conexão com a internet</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Tenha seus documentos e exames em mãos</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Use fones de ouvido para melhor qualidade de áudio</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default PatientTelehealth;
