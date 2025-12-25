/**
 * Patient Portal - Medical History
 * ================================
 *
 * View complete medical history and records (past appointments).
 *
 * @module pages/patient-portal/History
 * @version 2.0.0
 */

import React from 'react'
import { FileText, Calendar, User, ChevronRight, Download } from 'lucide-react'
import { usePatientPortalAppointments } from '../../hooks/usePatientPortal'
import { Skeleton } from '../../components/ui/Skeleton'
import type { Appointment } from '@/types'

// ============================================================================
// Components
// ============================================================================

function HistorySkeleton() {
  return (
    <div className="space-y-6 animate-enter pb-8">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <FileText className="w-7 h-7 text-blue-600" />
            <Skeleton className="h-8 w-32" />
          </div>
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <Skeleton className="h-10 w-40 rounded-xl" />
      </div>

      {/* Timeline Skeleton */}
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="relative pl-8">
            <div className="absolute left-0 top-4 w-6 h-6 rounded-full bg-genesis-muted/30" />
            <Skeleton className="h-32 rounded-2xl" />
          </div>
        ))}
      </div>
    </div>
  )
}

function EmptyHistory() {
  return (
    <div className="bg-genesis-surface rounded-2xl border border-genesis-border p-8 text-center">
      <FileText className="w-12 h-12 text-genesis-muted mx-auto mb-4" />
      <p className="font-medium text-genesis-dark">Nenhum histórico disponível</p>
      <p className="text-sm text-genesis-muted mt-2">
        Seu histórico de atendimentos aparecerá aqui após suas consultas.
      </p>
    </div>
  )
}

interface HistoryRecordProps {
  appointment: Appointment
  isLast: boolean
}

const HistoryRecord: React.FC<HistoryRecordProps> = ({ appointment, isLast }) => {
  const appointmentDate = new Date(appointment.date)

  // Determine record type
  const recordType = appointment.procedure?.toLowerCase().includes('exame') ? 'Exame' : 'Consulta'

  return (
    <div className="relative pl-8 before:absolute before:left-3 before:top-0 before:bottom-0 before:w-px before:bg-genesis-border">
      {/* Timeline Dot */}
      <div className="absolute left-0 top-4 w-6 h-6 rounded-full bg-genesis-primary flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-white" />
      </div>

      {/* Card */}
      <div className="bg-genesis-surface rounded-2xl border border-genesis-border p-4 hover:shadow-lg transition-all">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-info-soft text-info">
                {recordType}
              </span>
              <span className="text-xs text-genesis-muted flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {appointmentDate.toLocaleDateString('pt-BR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
            <p className="font-medium text-genesis-dark flex items-center gap-2">
              <User className="w-4 h-4 text-genesis-muted" />
              {appointment.professional}
            </p>
            <p className="text-sm text-genesis-muted">{appointment.specialty || 'Consulta'}</p>
            {appointment.procedure && (
              <p className="text-sm text-genesis-medium mt-2">{appointment.procedure}</p>
            )}
            {appointment.notes && (
              <p className="text-sm text-genesis-medium mt-1 italic">{appointment.notes}</p>
            )}
          </div>
          <ChevronRight className="w-5 h-5 text-genesis-muted flex-shrink-0" />
        </div>
      </div>

      {/* Last item doesn't need the line continuing */}
      {isLast && <div className="absolute left-0 bottom-0 w-6 h-4 bg-genesis-soft" />}
    </div>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function PatientHistory(): React.ReactElement {
  const { pastAppointments, loading } = usePatientPortalAppointments()

  // Export handler
  const handleExport = () => {
    // Generate a simple text export of history
    if (pastAppointments.length === 0) return

    const content = pastAppointments
      .map(apt => {
        const date = new Date(apt.date).toLocaleDateString('pt-BR')
        return `${date} - ${apt.professional} (${apt.specialty || 'Consulta'})\n${apt.procedure || ''}\n${apt.notes || ''}\n`
      })
      .join('\n---\n\n')

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'historico-medico.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return <HistorySkeleton />
  }

  return (
    <div className="space-y-6 animate-enter pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-genesis-dark flex items-center gap-3">
            <FileText className="w-7 h-7 text-blue-600" />
            Meu Histórico
          </h1>
          <p className="text-genesis-muted text-sm mt-1">
            {pastAppointments.length > 0
              ? `${pastAppointments.length} atendimento${pastAppointments.length !== 1 ? 's' : ''} registrado${pastAppointments.length !== 1 ? 's' : ''}`
              : 'Histórico completo de atendimentos e prontuário'}
          </p>
        </div>

        <button
          onClick={handleExport}
          disabled={pastAppointments.length === 0}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-genesis-border text-genesis-medium font-medium hover:bg-genesis-hover hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <Download className="w-5 h-5" />
          Exportar Histórico
        </button>
      </div>

      {/* Timeline */}
      {pastAppointments.length === 0 ? (
        <EmptyHistory />
      ) : (
        <div className="space-y-4">
          {pastAppointments.map((apt, index) => (
            <HistoryRecord
              key={apt.id}
              appointment={apt}
              isLast={index === pastAppointments.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default PatientHistory
