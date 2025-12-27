/**
 * Patient Portal - Reschedule Modal
 * ==================================
 *
 * Modal for rescheduling patient appointments.
 *
 * @module components/patient-portal/RescheduleModal
 * @version 1.0.0
 */

import React, { useState, useMemo } from 'react'
import {
  Calendar,
  Clock,
  X,
  User,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import type { Appointment } from '@/types'

// ============================================================================
// Types
// ============================================================================

interface RescheduleModalProps {
  isOpen: boolean
  appointment: Appointment | null
  onClose: () => void
  onReschedule: (appointmentId: string, newDate: string) => Promise<void>
}

interface TimeSlot {
  time: string
  label: string
  available: boolean
}

// ============================================================================
// Helpers
// ============================================================================

function formatDateDisplay(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function getAvailableTimeSlots(date: string): TimeSlot[] {
  // Generate time slots from 8:00 to 18:00
  const slots: TimeSlot[] = []
  const selectedDate = new Date(date)
  const now = new Date()
  const isToday = selectedDate.toDateString() === now.toDateString()

  for (let hour = 8; hour < 18; hour++) {
    for (const minutes of [0, 30]) {
      const timeStr = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
      const slotTime = new Date(`${date}T${timeStr}:00`)

      // Check if slot is in the past (for today)
      const available = !isToday || slotTime > now

      slots.push({
        time: timeStr,
        label: timeStr,
        available,
      })
    }
  }

  return slots
}

function getMinDate(): string {
  const today = new Date()
  return today.toISOString().split('T')[0]
}

function getMaxDate(): string {
  const maxDate = new Date()
  maxDate.setMonth(maxDate.getMonth() + 3) // 3 months ahead
  return maxDate.toISOString().split('T')[0]
}

// ============================================================================
// Component
// ============================================================================

export function RescheduleModal({
  isOpen,
  appointment,
  onClose,
  onReschedule,
}: RescheduleModalProps): React.ReactElement | null {
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const timeSlots = useMemo(() => {
    if (!selectedDate) return []
    return getAvailableTimeSlots(selectedDate)
  }, [selectedDate])

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value)
    setSelectedTime('') // Reset time when date changes
  }

  const handleSubmit = async () => {
    if (!appointment || !selectedDate || !selectedTime || submitting) return

    const newDateTime = `${selectedDate}T${selectedTime}:00`

    setSubmitting(true)
    try {
      await onReschedule(appointment.id, newDateTime)
      toast.success('Consulta remarcada com sucesso!')
      handleClose()
    } catch (error) {
      console.error('Error rescheduling appointment:', error)
      toast.error('Erro ao remarcar consulta. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    setSelectedDate('')
    setSelectedTime('')
    onClose()
  }

  if (!isOpen || !appointment) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-in fade-in">
      <div className="bg-genesis-surface rounded-2xl w-full max-w-md mx-4 shadow-xl animate-in zoom-in-95 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-genesis-border flex-shrink-0">
          <h3 className="font-semibold text-genesis-dark flex items-center gap-2">
            <Calendar className="w-5 h-5 text-genesis-primary" />
            Remarcar Consulta
          </h3>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-genesis-muted hover:bg-genesis-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto">
          {/* Current Appointment Info */}
          <div className="bg-genesis-soft rounded-xl p-4">
            <p className="text-xs font-medium text-genesis-muted uppercase tracking-wide mb-2">
              Consulta Atual
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-genesis-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-genesis-primary" />
              </div>
              <div>
                <p className="font-medium text-genesis-dark">{appointment.professional}</p>
                <p className="text-sm text-genesis-muted">
                  {formatDateDisplay(appointment.date)}
                </p>
              </div>
            </div>
          </div>

          {/* Date Selection */}
          <div>
            <label className="text-sm font-medium text-genesis-dark mb-2 block">
              Nova Data
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              min={getMinDate()}
              max={getMaxDate()}
              className="w-full px-4 py-3 rounded-xl border border-genesis-border bg-genesis-soft text-genesis-dark focus:outline-none focus:ring-2 focus:ring-genesis-primary focus:border-transparent"
            />
          </div>

          {/* Time Slots */}
          {selectedDate && (
            <div>
              <label className="text-sm font-medium text-genesis-dark mb-2 block">
                Horário Disponível
              </label>
              {timeSlots.length === 0 ? (
                <div className="flex items-center gap-2 p-3 bg-warning-soft rounded-xl text-warning text-sm">
                  <AlertCircle className="w-4 h-4" />
                  Selecione uma data para ver os horários
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                  {timeSlots.map(slot => (
                    <button
                      key={slot.time}
                      onClick={() => slot.available && setSelectedTime(slot.time)}
                      disabled={!slot.available}
                      className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                        selectedTime === slot.time
                          ? 'bg-genesis-primary text-white'
                          : slot.available
                            ? 'bg-genesis-soft text-genesis-dark hover:bg-genesis-hover'
                            : 'bg-genesis-soft/50 text-genesis-muted/50 cursor-not-allowed line-through'
                      }`}
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Selected Summary */}
          {selectedDate && selectedTime && (
            <div className="bg-success-soft rounded-xl p-4">
              <p className="text-xs font-medium text-genesis-muted uppercase tracking-wide mb-2">
                Nova Data e Horário
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="font-medium text-genesis-dark">
                    {formatDateDisplay(selectedDate)}
                  </p>
                  <p className="text-sm text-genesis-muted">às {selectedTime}</p>
                </div>
              </div>
            </div>
          )}

          {/* Notice */}
          <div className="flex items-start gap-2 p-3 bg-info-soft rounded-xl text-info text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>
              Você receberá uma confirmação por email após a remarcação.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-genesis-border flex gap-3 flex-shrink-0">
          <button
            onClick={handleClose}
            disabled={submitting}
            className="flex-1 py-2.5 rounded-xl border border-genesis-border text-genesis-medium font-medium hover:bg-genesis-hover transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedDate || !selectedTime || submitting}
            className="flex-1 py-2.5 rounded-xl bg-genesis-primary text-white font-medium hover:bg-genesis-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Remarcando...
              </>
            ) : (
              'Confirmar'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default RescheduleModal
