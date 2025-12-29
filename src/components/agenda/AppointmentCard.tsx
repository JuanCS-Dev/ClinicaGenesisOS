/**
 * AppointmentCard Component
 *
 * Renders a single appointment card with status and specialty colors.
 * Used in both day and week views of the agenda.
 * Includes telemedicine button for starting video consultations.
 */

import React, { memo } from 'react'
import { Repeat, Video } from 'lucide-react'
import { Status, type Appointment, type SpecialtyType } from '@/types'
import { isRecurringInstance, isRecurringParent } from '@/lib/recurrence'

/**
 * Status colors configuration.
 */
export const STATUS_COLORS: Record<Status, { bg: string; text: string; dot: string }> = {
  [Status.CONFIRMED]: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  [Status.PENDING]: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  [Status.ARRIVED]: { bg: 'bg-sky-50', text: 'text-sky-700', dot: 'bg-sky-500' },
  [Status.IN_PROGRESS]: { bg: 'bg-violet-50', text: 'text-violet-700', dot: 'bg-violet-500' },
  [Status.FINISHED]: {
    bg: 'bg-genesis-hover',
    text: 'text-genesis-muted',
    dot: 'bg-genesis-subtle',
  },
  [Status.CANCELED]: { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-400' },
  [Status.NO_SHOW]: { bg: 'bg-orange-50', text: 'text-orange-600', dot: 'bg-orange-500' },
}

/**
 * Specialty colors for the left border.
 */
export const SPECIALTY_COLORS: Record<
  SpecialtyType,
  { border: string; bg: string; ring: string; shadow: string }
> = {
  medicina: {
    border: 'border-blue-500',
    bg: 'from-blue-50/90 to-white',
    ring: 'ring-blue-100',
    shadow: 'hover:shadow-blue-100',
  },
  nutricao: {
    border: 'border-green-500',
    bg: 'from-green-50/90 to-white',
    ring: 'ring-green-100',
    shadow: 'hover:shadow-green-100',
  },
  psicologia: {
    border: 'border-purple-500',
    bg: 'from-purple-50/90 to-white',
    ring: 'ring-purple-100',
    shadow: 'hover:shadow-purple-100',
  },
}

interface AppointmentCardProps {
  appointment: Appointment
  compact?: boolean
  /** Callback to start telemedicine session */
  onStartTelemedicine?: (appointment: Appointment) => void
}

/**
 * Appointment card component with status and specialty colors.
 *
 * OPTIMIZED: Wrapped with React.memo to prevent unnecessary re-renders in day/week views.
 */
export const AppointmentCard = memo(function AppointmentCard({
  appointment: app,
  compact = false,
  onStartTelemedicine,
}: AppointmentCardProps) {
  const specialtyColors = SPECIALTY_COLORS[app.specialty] || SPECIALTY_COLORS.medicina
  const statusColors = STATUS_COLORS[app.status] || STATUS_COLORS[Status.PENDING]
  const isCanceled = app.status === Status.CANCELED
  const isFinished = app.status === Status.FINISHED
  const isDimmed = isCanceled || isFinished
  const isRecurring = isRecurringInstance(app) || isRecurringParent(app)

  // Show telemedicine button for confirmed or in-progress appointments
  const canStartTelemedicine =
    onStartTelemedicine &&
    !isCanceled &&
    !isFinished &&
    (app.status === Status.CONFIRMED || app.status === Status.IN_PROGRESS)

  /**
   * Handle telemedicine button click.
   */
  const handleTelemedicineClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onStartTelemedicine) {
      onStartTelemedicine(app)
    }
  }

  if (compact) {
    return (
      <div
        className={`
          rounded-lg border-l-[3px] p-2 shadow-sm cursor-pointer transition-all duration-200 group/card
          bg-gradient-to-br ${specialtyColors.bg} ${specialtyColors.border} ring-1 ${specialtyColors.ring}
          ${isDimmed ? 'opacity-50' : 'hover:shadow-md'}
          ${isCanceled ? 'grayscale' : ''}
        `}
      >
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1 min-w-0">
            {isRecurring && <Repeat className="w-3 h-3 text-genesis-primary shrink-0" />}
            <span
              className={`text-xs font-bold truncate ${isDimmed ? 'text-genesis-muted' : 'text-genesis-dark'} ${isCanceled ? 'line-through' : ''}`}
            >
              {app.patientName}
            </span>
          </div>
          <span className={`w-2 h-2 rounded-full shrink-0 ${statusColors.dot}`} />
        </div>
        <p className="text-[10px] text-genesis-medium truncate mt-0.5">{app.procedure}</p>
      </div>
    )
  }

  return (
    <div
      className={`
        absolute top-2 left-2 right-4 bottom-2 rounded-2xl border-l-[4px] p-4 shadow-sm cursor-pointer transition-all duration-300 z-10 group/card
        bg-gradient-to-br ${specialtyColors.bg} ${specialtyColors.border} ${specialtyColors.shadow} ring-1 ${specialtyColors.ring}
        ${isDimmed ? 'opacity-60' : 'hover:shadow-lg hover:-translate-y-0.5'}
        ${isCanceled ? 'grayscale' : ''}
      `}
    >
      {/* Header: Patient name + Status badge */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          {isRecurring && (
            <Repeat
              className="w-4 h-4 text-genesis-primary shrink-0"
              aria-label="Consulta recorrente"
            />
          )}
          <span
            className={`font-bold text-sm tracking-tight ${isDimmed ? 'text-genesis-muted' : 'text-genesis-dark'} ${isCanceled ? 'line-through' : ''}`}
          >
            {app.patientName}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {/* Status Badge */}
          <span
            className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColors.bg} ${statusColors.text}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusColors.dot}`} />
            {app.status}
          </span>
        </div>
      </div>

      {/* Procedure + Duration + Telemedicine */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`w-1.5 h-1.5 rounded-full ${specialtyColors.border.replace('border-', 'bg-')}`}
          />
          <p
            className={`text-xs font-medium transition-colors ${isDimmed ? 'text-genesis-subtle' : 'text-genesis-medium group-hover/card:text-genesis-dark'}`}
          >
            {app.procedure}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Telemedicine Button */}
          {canStartTelemedicine && (
            <button
              onClick={handleTelemedicineClick}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold rounded-lg transition-all shadow-sm hover:shadow-md hover:scale-105 opacity-0 group-hover/card:opacity-100"
              title="Iniciar Teleconsulta"
            >
              <Video className="w-3 h-3" />
              <span className="hidden sm:inline">Teleconsulta</span>
            </button>
          )}
          <span className="text-[10px] font-bold text-genesis-dark/50 bg-genesis-surface/80 px-2 py-0.5 rounded-lg">
            {app.durationMin}min
          </span>
        </div>
      </div>
    </div>
  )
})
