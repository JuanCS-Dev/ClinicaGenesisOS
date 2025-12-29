/**
 * HistoryItem Component
 * =====================
 *
 * Displays a single medical record item in the patient history sidebar.
 * Shows record type, date, title, content preview, and attachments.
 *
 * @module components/patient/HistoryItem
 */

import { FileText, Stethoscope, Pill, Activity, Brain, FlaskConical, Paperclip } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  RecordType,
  MedicalRecord,
  SoapRecord,
  PrescriptionRecord,
  ExamRequestRecord,
  AnthropometryRecord,
  PsychoSessionRecord,
} from '../../types'
import { AttachmentList } from '../records/AttachmentUpload'

// =============================================================================
// TYPES
// =============================================================================

interface HistoryItemProps {
  record: MedicalRecord
  active?: boolean
}

// =============================================================================
// HELPERS
// =============================================================================

interface RecordDisplayInfo {
  title: string
  content: string
  Icon: React.ComponentType<{ className?: string }>
}

/**
 * Get display information for a medical record based on its type.
 */
function getRecordDisplayInfo(record: MedicalRecord): RecordDisplayInfo {
  switch (record.type) {
    case RecordType.SOAP: {
      const soapRecord = record as SoapRecord
      return {
        title: 'Evolução Médica',
        content: soapRecord.subjective || 'Sem detalhes subjetivos.',
        Icon: Stethoscope,
      }
    }
    case RecordType.PRESCRIPTION: {
      const prescRecord = record as PrescriptionRecord
      const medsCount = prescRecord.medications?.length || 0
      return {
        title: 'Prescrição Médica',
        content: `${medsCount} medicamentos prescritos: ${prescRecord.medications.map(m => m.name).join(', ')}`,
        Icon: Pill,
      }
    }
    case RecordType.EXAM_REQUEST: {
      const examRecord = record as ExamRequestRecord
      const examCount = examRecord.exams?.length || 0
      return {
        title: 'Solicitação de Exames',
        content: `${examCount} exames solicitados: ${examRecord.exams.join(', ')}`,
        Icon: FlaskConical,
      }
    }
    case RecordType.ANTHROPOMETRY: {
      const anthroRecord = record as AnthropometryRecord
      return {
        title: 'Antropometria',
        content: `Peso: ${anthroRecord.weight}kg, IMC: ${anthroRecord.imc}`,
        Icon: Activity,
      }
    }
    case RecordType.PSYCHO_SESSION: {
      const psychoRecord = record as PsychoSessionRecord
      return {
        title: 'Sessão de Terapia',
        content: psychoRecord.summary,
        Icon: Brain,
      }
    }
    default:
      return {
        title: 'Registro',
        content: 'Detalhes do registro...',
        Icon: FileText,
      }
  }
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * Displays a single medical record item in the patient history sidebar.
 *
 * @param record - The medical record to display
 * @param active - Whether this item is currently selected
 */
export const HistoryItem = ({ record, active }: HistoryItemProps) => {
  const { title, content, Icon } = getRecordDisplayInfo(record)
  const hasAttachments = record.attachments && record.attachments.length > 0

  return (
    <div
      className={`p-4 rounded-xl cursor-pointer transition-all duration-200 group border ${active ? 'bg-genesis-surface shadow-md border-genesis-border-subtle ring-1 ring-black/5' : 'border-transparent hover:bg-genesis-surface/50 hover:border-genesis-border-subtle'}`}
    >
      <div className="flex justify-between items-start mb-1.5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-genesis-medium uppercase tracking-wider bg-genesis-soft px-2 py-0.5 rounded-md">
            {format(new Date(record.date), 'dd MMM yy', { locale: ptBR })}
          </span>
          {hasAttachments && record.attachments && (
            <span className="flex items-center gap-0.5 text-[10px] text-genesis-subtle">
              <Paperclip className="w-3 h-3" />
              {record.attachments.length}
            </span>
          )}
        </div>
        {active && (
          <div className="w-1.5 h-1.5 rounded-full bg-genesis-primary shadow-[0_0_8px_rgba(0,122,255,0.5)]" />
        )}
      </div>
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-3.5 h-3.5 text-genesis-medium/80" />
        <h4
          className={`text-sm font-semibold ${active ? 'text-genesis-dark' : 'text-genesis-medium group-hover:text-genesis-dark'}`}
        >
          {title}
        </h4>
      </div>
      <p className="text-[11px] text-genesis-medium line-clamp-2 leading-relaxed opacity-90 pl-5.5">
        {content}
      </p>
      {hasAttachments && active && record.attachments && (
        <div className="mt-2 pl-5.5">
          <AttachmentList attachments={record.attachments} />
        </div>
      )}
    </div>
  )
}
