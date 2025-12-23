/**
 * Patient Portal - Appointments
 * =============================
 *
 * View upcoming and past appointments.
 * Request new appointments or reschedule.
 *
 * @module pages/patient-portal/Appointments
 * @version 1.0.0
 */

import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Video,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  ChevronRight,
  Filter,
} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

type AppointmentStatus = 'confirmed' | 'pending' | 'completed' | 'cancelled';

interface Appointment {
  id: string;
  date: string;
  time: string;
  professional: string;
  specialty: string;
  location: string;
  status: AppointmentStatus;
  type: 'presencial' | 'teleconsulta';
}

// ============================================================================
// Mock Data
// ============================================================================

const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: '1',
    date: '2024-12-28',
    time: '14:30',
    professional: 'Dr. João Silva',
    specialty: 'Clínica Geral',
    location: 'Sala 3',
    status: 'confirmed',
    type: 'presencial',
  },
  {
    id: '2',
    date: '2025-01-15',
    time: '10:00',
    professional: 'Dra. Maria Santos',
    specialty: 'Cardiologia',
    location: 'Sala 5',
    status: 'pending',
    type: 'presencial',
  },
  {
    id: '3',
    date: '2024-12-15',
    time: '09:00',
    professional: 'Dr. João Silva',
    specialty: 'Clínica Geral',
    location: 'Online',
    status: 'completed',
    type: 'teleconsulta',
  },
  {
    id: '4',
    date: '2024-11-20',
    time: '15:30',
    professional: 'Dr. Pedro Costa',
    specialty: 'Ortopedia',
    location: 'Sala 2',
    status: 'completed',
    type: 'presencial',
  },
  {
    id: '5',
    date: '2024-10-10',
    time: '11:00',
    professional: 'Dra. Ana Oliveira',
    specialty: 'Dermatologia',
    location: 'Sala 4',
    status: 'cancelled',
    type: 'presencial',
  },
];

// ============================================================================
// Helpers
// ============================================================================

const STATUS_CONFIG: Record<
  AppointmentStatus,
  { label: string; color: string; icon: React.ElementType }
> = {
  confirmed: {
    label: 'Confirmada',
    color: 'text-success bg-success-soft',
    icon: CheckCircle2,
  },
  pending: {
    label: 'Pendente',
    color: 'text-warning bg-warning-soft',
    icon: AlertCircle,
  },
  completed: {
    label: 'Realizada',
    color: 'text-info bg-info-soft',
    icon: CheckCircle2,
  },
  cancelled: {
    label: 'Cancelada',
    color: 'text-danger bg-danger-soft',
    icon: XCircle,
  },
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function isUpcoming(dateStr: string): boolean {
  return new Date(dateStr) >= new Date(new Date().toDateString());
}

// ============================================================================
// Components
// ============================================================================

interface AppointmentCardProps {
  appointment: Appointment;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment }) => {
  const statusConfig = STATUS_CONFIG[appointment.status];
  const StatusIcon = statusConfig.icon;
  const upcoming = isUpcoming(appointment.date);

  return (
    <div
      className={`bg-white dark:bg-genesis-surface rounded-2xl border border-genesis-border p-4 hover:shadow-lg transition-all ${
        upcoming ? '' : 'opacity-75'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 ${statusConfig.color}`}
          >
            <StatusIcon className="w-3 h-3" />
            {statusConfig.label}
          </div>
          {appointment.type === 'teleconsulta' && (
            <div className="px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-50 text-purple-600 flex items-center gap-1">
              <Video className="w-3 h-3" />
              Online
            </div>
          )}
        </div>
        <ChevronRight className="w-5 h-5 text-genesis-muted" />
      </div>

      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-xl bg-genesis-primary/10 flex items-center justify-center">
          <Calendar className="w-6 h-6 text-genesis-primary" />
        </div>
        <div>
          <p className="font-semibold text-genesis-dark">{formatDate(appointment.date)}</p>
          <p className="text-sm text-genesis-muted">{appointment.time}</p>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-genesis-medium">
          <User className="w-4 h-4 text-genesis-muted" />
          <span>
            {appointment.professional} - {appointment.specialty}
          </span>
        </div>
        <div className="flex items-center gap-2 text-genesis-medium">
          <MapPin className="w-4 h-4 text-genesis-muted" />
          <span>{appointment.location}</span>
        </div>
      </div>

      {upcoming && appointment.status !== 'cancelled' && (
        <div className="flex gap-2 mt-4 pt-4 border-t border-genesis-border">
          {appointment.type === 'teleconsulta' && (
            <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-genesis-primary text-white text-sm font-medium hover:bg-genesis-primary-dark hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
              <Video className="w-4 h-4" />
              Entrar
            </button>
          )}
          <button className="flex-1 py-2 rounded-xl border border-genesis-border text-genesis-medium text-sm font-medium hover:bg-genesis-hover hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
            Remarcar
          </button>
          <button className="py-2 px-4 rounded-xl text-danger text-sm font-medium hover:bg-danger-soft hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function PatientAppointments(): React.ReactElement {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');

  const filteredAppointments = MOCK_APPOINTMENTS.filter((apt) => {
    if (filter === 'upcoming') return isUpcoming(apt.date);
    if (filter === 'past') return !isUpcoming(apt.date);
    return true;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const upcomingCount = MOCK_APPOINTMENTS.filter((apt) =>
    isUpcoming(apt.date)
  ).length;

  return (
    <div className="space-y-6 animate-enter pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-genesis-dark flex items-center gap-3">
            <Calendar className="w-7 h-7 text-genesis-primary" />
            Minhas Consultas
          </h1>
          <p className="text-genesis-muted text-sm mt-1">
            {upcomingCount} consulta{upcomingCount !== 1 ? 's' : ''} agendada
            {upcomingCount !== 1 ? 's' : ''}
          </p>
        </div>

        <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-genesis-primary text-white font-medium hover:bg-genesis-primary-dark hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200">
          <Plus className="w-5 h-5" />
          Nova Consulta
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-genesis-muted" />
        <div className="flex bg-genesis-soft rounded-xl p-1">
          {[
            { value: 'all', label: 'Todas' },
            { value: 'upcoming', label: 'Próximas' },
            { value: 'past', label: 'Anteriores' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value as typeof filter)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === option.value
                  ? 'bg-white dark:bg-genesis-surface text-genesis-dark shadow-sm'
                  : 'text-genesis-muted hover:text-genesis-dark'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Appointments List */}
      {filteredAppointments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAppointments.map((appointment) => (
            <AppointmentCard key={appointment.id} appointment={appointment} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-genesis-surface rounded-2xl border border-genesis-border">
          <Calendar className="w-12 h-12 text-genesis-muted mx-auto mb-4" />
          <p className="text-genesis-dark font-medium">Nenhuma consulta encontrada</p>
          <p className="text-genesis-muted text-sm mt-1">
            {filter === 'upcoming'
              ? 'Você não tem consultas agendadas'
              : filter === 'past'
                ? 'Nenhuma consulta anterior'
                : 'Nenhuma consulta registrada'}
          </p>
        </div>
      )}

      {/* Info Card */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 border border-blue-100 dark:border-blue-800">
        <div className="flex gap-3">
          <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Política de Cancelamento
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              Cancelamentos devem ser feitos com pelo menos 24 horas de
              antecedência para evitar cobrança.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientAppointments;
