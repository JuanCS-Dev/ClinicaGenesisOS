/**
 * Patient Portal - Appointments
 * =============================
 *
 * View upcoming and past appointments.
 * Request new appointments or reschedule.
 *
 * @module pages/patient-portal/Appointments
 * @version 2.0.0
 */

import React, { useState, useMemo } from 'react'
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
} from 'lucide-react'
import { usePatientPortalAppointments } from '../../hooks/usePatientPortal'
import { Skeleton } from '../../components/ui/Skeleton'
import { Status } from '@/types'
import type { Appointment } from '@/types'

// ============================================================================
// Helpers
// ============================================================================

const STATUS_CONFIG: Record<Status, { label: string; color: string; icon: React.ElementType }> = {
  [Status.CONFIRMED]: {
    label: 'Confirmada',
    color: 'text-success bg-success-soft',
    icon: CheckCircle2,
  },
  [Status.PENDING]: {
    label: 'Pendente',
    color: 'text-warning bg-warning-soft',
    icon: Clock,
  },
  [Status.ARRIVED]: {
    label: 'Chegou',
    color: 'text-info bg-info-soft',
    icon: CheckCircle2,
  },
  [Status.IN_PROGRESS]: {
    label: 'Em Atendimento',
    color: 'text-warning bg-warning-soft',
    icon: AlertCircle,
  },
  [Status.FINISHED]: {
    label: 'Realizada',
    color: 'text-info bg-info-soft',
    icon: CheckCircle2,
  },
  [Status.CANCELED]: {
    label: 'Cancelada',
    color: 'text-danger bg-danger-soft',
    icon: XCircle,
  },
  [Status.NO_SHOW]: {
    label: 'Não Compareceu',
    color: 'text-danger bg-danger-soft',
    icon: XCircle,
  },
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function isUpcoming(dateStr: string): boolean {
  return new Date(dateStr) >= new Date(new Date().toDateString())
}

// ============================================================================
// Components
// ============================================================================

function AppointmentCardSkeleton() {
  return (
    <div className="bg-genesis-surface rounded-2xl border border-genesis-border p-4">
      <div className="flex items-start justify-between mb-3">
        <Skeleton className="h-6 w-24 rounded-lg" />
        <Skeleton className="h-5 w-5 rounded" />
      </div>
      <div className="flex items-center gap-3 mb-3">
        <Skeleton variant="rect" className="w-12 h-12 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  )
}

interface AppointmentCardProps {
  appointment: Appointment
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment }) => {
  const statusConfig = STATUS_CONFIG[appointment.status] || STATUS_CONFIG[Status.PENDING]
  const StatusIcon = statusConfig.icon
  const upcoming = isUpcoming(appointment.date)
  const isTeleconsulta =
    appointment.notes?.toLowerCase().includes('online') ||
    appointment.notes?.toLowerCase().includes('teleconsulta')

  return (
    <div
      className={`bg-genesis-surface rounded-2xl border border-genesis-border p-4 hover:shadow-lg transition-all ${
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
          {isTeleconsulta && (
            <div className="px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center gap-1">
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
          <p className="text-sm text-genesis-muted">{formatTime(appointment.date)}</p>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-genesis-medium">
          <User className="w-4 h-4 text-genesis-muted" />
          <span>
            {appointment.professional}
            {appointment.specialty && ` - ${appointment.specialty}`}
          </span>
        </div>
        {appointment.procedure && (
          <div className="flex items-center gap-2 text-genesis-medium">
            <MapPin className="w-4 h-4 text-genesis-muted" />
            <span>{appointment.procedure}</span>
          </div>
        )}
      </div>

      {upcoming && appointment.status !== Status.CANCELED && (
        <div className="flex gap-2 mt-4 pt-4 border-t border-genesis-border">
          {isTeleconsulta && (
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
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function PatientAppointments(): React.ReactElement {
  const { appointments, upcomingAppointments, loading } = usePatientPortalAppointments()
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all')

  const filteredAppointments = useMemo(() => {
    let result = appointments
    if (filter === 'upcoming') {
      result = appointments.filter(apt => isUpcoming(apt.date))
    } else if (filter === 'past') {
      result = appointments.filter(apt => !isUpcoming(apt.date))
    }
    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [appointments, filter])

  const upcomingCount = upcomingAppointments.length

  if (loading) {
    return (
      <div className="space-y-6 animate-enter pb-8">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <Calendar className="w-7 h-7 text-genesis-primary" />
              <Skeleton className="h-8 w-48" />
            </div>
            <Skeleton className="h-4 w-32 mt-2" />
          </div>
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>

        {/* Filter Skeleton */}
        <Skeleton className="h-10 w-64 rounded-xl" />

        {/* Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AppointmentCardSkeleton />
          <AppointmentCardSkeleton />
          <AppointmentCardSkeleton />
        </div>
      </div>
    )
  }

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
          ].map(option => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value as typeof filter)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === option.value
                  ? 'bg-genesis-surface text-genesis-dark shadow-sm'
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
          {filteredAppointments.map(appointment => (
            <AppointmentCard key={appointment.id} appointment={appointment} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-genesis-surface rounded-2xl border border-genesis-border">
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
              Cancelamentos devem ser feitos com pelo menos 24 horas de antecedência para evitar
              cobrança.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PatientAppointments
