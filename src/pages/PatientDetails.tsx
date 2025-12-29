/**
 * PatientDetails Page
 * ===================
 *
 * Main patient record view with medical history, timeline, and clinical AI.
 * Supports multiple specialties via plugin system.
 *
 * OPTIMIZED: Lazy loads heavy components (ClinicalAI, Prescription, Timeline)
 * Performance: ~148KB → ~40KB initial (AI/prescription loaded on demand)
 *
 * @module pages/PatientDetails
 */

import React, { useState, useMemo, useCallback, Suspense, lazy } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { usePatient } from '../hooks/usePatient'
import { useRecords } from '../hooks/useRecords'
import { usePatientAppointments } from '../hooks/useAppointments'
import { useClinicContext } from '../contexts/ClinicContext'
import { PLUGINS, MedicineEditor, NutritionEditor, PsychologyEditor } from '../plugins'
import { HistoryItem } from '../components/patient/HistoryItem'
import { TabButton } from '../components/ui/TabButton'
import { Calendar, FileText, History, Edit2, Loader2, Sparkles, Receipt } from 'lucide-react'
import type { PatientContext } from '../types'
import {
  SpecialtyType,
  RecordType,
  TimelineEvent,
  TimelineEventType,
  CreateRecordInput,
  EditorRecordData,
  PrescriptionRecord,
  ExamRequestRecord,
  AnthropometryRecord,
  SoapRecord,
  PsychoSessionRecord,
} from '../types'

// =============================================================================
// LAZY LOADED COMPONENTS - Heavy components loaded on demand
// =============================================================================
const ClinicalReasoningPanel = lazy(() =>
  import('../components/ai/clinical-reasoning').then(m => ({ default: m.ClinicalReasoningPanel }))
)
const PrescriptionModal = lazy(() =>
  import('../components/prescription').then(m => ({ default: m.PrescriptionModal }))
)
const Timeline = lazy(() =>
  import('../components/patient/Timeline').then(m => ({ default: m.Timeline }))
)

/**
 * Loading fallback for lazy components.
 */
const ComponentLoader: React.FC = () => (
  <div className="flex items-center justify-center h-64">
    <Loader2 className="w-8 h-8 text-genesis-primary animate-spin" />
  </div>
)

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Generate timeline events from records and appointments.
 */
function generateTimelineEvents(
  records: ReturnType<typeof useRecords>['records'],
  appointments: ReturnType<typeof usePatientAppointments>['appointments']
): TimelineEvent[] {
  const events: TimelineEvent[] = []

  // Add Records
  records.forEach(r => {
    let type = TimelineEventType.CONSULTATION
    let title = 'Registro Clínico'
    let desc = ''

    if (r.type === RecordType.PRESCRIPTION) {
      const prescRecord = r as PrescriptionRecord
      type = TimelineEventType.PRESCRIPTION
      title = 'Receita Emitida'
      desc = `${prescRecord.medications.length} medicamentos prescritos.`
    } else if (r.type === RecordType.EXAM_REQUEST) {
      const examRecord = r as ExamRequestRecord
      type = TimelineEventType.EXAM
      title = 'Exames Solicitados'
      desc = examRecord.exams.join(', ')
    } else if (r.type === RecordType.ANTHROPOMETRY) {
      const anthroRecord = r as AnthropometryRecord
      type = TimelineEventType.EXAM
      title = 'Avaliação Física'
      desc = `Peso: ${anthroRecord.weight}kg - IMC: ${anthroRecord.imc}`
    } else if (r.type === RecordType.SOAP) {
      const soapRecord = r as SoapRecord
      type = TimelineEventType.CONSULTATION
      title = 'Evolução'
      desc = soapRecord.subjective || 'Registro de consulta.'
    } else if (r.type === RecordType.PSYCHO_SESSION) {
      const psychoRecord = r as PsychoSessionRecord
      type = TimelineEventType.CONSULTATION
      title = 'Evolução'
      desc = psychoRecord.summary || 'Registro de consulta.'
    } else {
      type = TimelineEventType.CONSULTATION
      title = 'Evolução'
      desc = 'Registro de consulta.'
    }

    events.push({
      id: r.id,
      date: new Date(r.date),
      type,
      title,
      description: desc,
    })
  })

  // Add past Appointments
  appointments.forEach(a => {
    if (new Date(a.date) < new Date()) {
      events.push({
        id: a.id,
        date: new Date(a.date),
        type: TimelineEventType.CONSULTATION,
        title: a.procedure,
        description: `Consulta realizada com ${a.professional}. Status: ${a.status}`,
      })
    }
  })

  return events.sort((a, b) => b.date.getTime() - a.date.getTime())
}

// =============================================================================
// COMPONENT
// =============================================================================

export const PatientDetails: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { userProfile } = useClinicContext()
  const { patient, loading: patientLoading } = usePatient(id)
  const { records, addRecord } = useRecords(id)
  const { appointments } = usePatientAppointments(id)

  const [activeTab, setActiveTab] = useState<'prontuario' | 'dados' | 'timeline' | 'clinicalAI'>(
    'prontuario'
  )
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false)
  const [activePluginId, setActivePluginId] = useState<SpecialtyType>(
    userProfile?.specialty || 'medicina'
  )

  const activePlugin = PLUGINS[activePluginId]

  // Build patient context for Clinical AI
  const patientContext: PatientContext = useMemo(
    () => ({
      age: patient?.age || 0,
      sex: patient?.gender === 'Masculino' ? 'male' : 'female',
      chiefComplaint: undefined,
      relevantHistory: patient?.tags || [],
      currentMedications: [],
      allergies: [],
    }),
    [patient]
  )

  const handlePrescriptionSave = useCallback(() => {
    setShowPrescriptionModal(false)
  }, [])

  const handleSaveRecord = useCallback(
    async (data: EditorRecordData) => {
      if (!id) return
      try {
        await addRecord({
          patientId: id,
          specialty: activePluginId,
          ...data,
        } as CreateRecordInput)
      } catch (error) {
        console.error('Error saving record:', error)
      }
    },
    [id, activePluginId, addRecord]
  )

  const timelineEvents = useMemo(
    () => generateTimelineEvents(records, appointments),
    [records, appointments]
  )

  // Loading state
  if (patientLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-genesis-primary animate-spin" />
      </div>
    )
  }

  // Not found state
  if (!patient) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-genesis-medium">Paciente não encontrado.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-enter pb-8">
      {/* Patient Header */}
      <div className="bg-genesis-surface rounded-[24px] border border-genesis-border-subtle shadow-md overflow-hidden group relative z-0">
        <div className="h-40 bg-gradient-to-r from-slate-50 via-gray-50 to-zinc-50 border-b border-genesis-border-subtle relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-60"></div>
          <div className="absolute top-6 right-8 flex gap-3 z-20">
            <button
              onClick={() => navigate(`/patients/${id}/edit`)}
              className="flex items-center gap-2 px-4 py-2 bg-genesis-surface/60 backdrop-blur-md border border-genesis-border/50 rounded-xl text-xs font-bold text-genesis-dark hover:bg-genesis-surface hover:shadow-sm transition-all"
            >
              <Edit2 className="w-3.5 h-3.5" /> Editar
            </button>
            <button
              onClick={() => setShowPrescriptionModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl text-xs font-bold hover:bg-amber-600 transition-all shadow-lg shadow-amber-200/50"
            >
              <Receipt className="w-3.5 h-3.5" /> Prescrever
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-genesis-primary text-white rounded-xl text-xs font-bold hover:bg-genesis-primary-dark transition-all shadow-lg shadow-genesis-primary/20 hover:-translate-y-0.5">
              <Calendar className="w-3.5 h-3.5" /> Agendar
            </button>
          </div>
        </div>

        <div className="px-10 pb-8 relative z-20">
          <div className="flex flex-col md:flex-row justify-between items-end -mt-12 mb-8 gap-6">
            <div className="flex items-end gap-6">
              <div className="relative group/avatar cursor-pointer">
                <div className="w-28 h-28 rounded-[24px] border-[4px] border-white shadow-xl overflow-hidden bg-genesis-surface transition-transform duration-500 group-hover/avatar:scale-105 group-hover/avatar:shadow-2xl">
                  <img
                    src={patient.avatar || `https://ui-avatars.com/api/?name=${patient.name}`}
                    alt={patient.name}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="mb-1">
                <h1 className="text-3xl font-bold text-genesis-dark flex items-center gap-3 tracking-tight">
                  {patient.name}
                </h1>
                <div className="flex flex-wrap gap-2 mt-2">
                  {patient.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2.5 py-0.5 bg-genesis-soft text-genesis-medium text-[10px] rounded-md font-bold uppercase border border-genesis-border-subtle tracking-wide"
                    >
                      {tag}
                    </span>
                  ))}
                  <span className="text-genesis-subtle mx-1">|</span>
                  <span className="text-sm text-genesis-medium font-medium">
                    {patient.age} anos
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-1 bg-genesis-soft/50 p-1 rounded-2xl border border-genesis-border-subtle">
              <div className="px-5 py-2 text-center border-r border-genesis-border/50">
                <p className="text-[10px] font-bold text-genesis-medium uppercase tracking-wider">
                  Telefone
                </p>
                <p className="text-sm font-bold text-genesis-dark">{patient.phone}</p>
              </div>
              <div className="px-5 py-2 text-center">
                <p className="text-[10px] font-bold text-genesis-medium uppercase tracking-wider">
                  Convênio
                </p>
                <p className="text-sm font-bold text-genesis-dark">
                  {patient.insurance || 'Particular'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Plugin Selector */}
      <div className="flex gap-4 items-center">
        <span className="text-[10px] font-bold uppercase tracking-widest text-genesis-medium">
          Especialidade Ativa:
        </span>
        <div className="flex bg-genesis-surface p-1 rounded-xl shadow-sm border border-genesis-border-subtle">
          {(Object.keys(PLUGINS) as SpecialtyType[]).map(key => {
            const plugin = PLUGINS[key]
            const Icon = plugin.icon
            const isActive = activePluginId === key
            return (
              <button
                key={key}
                onClick={() => setActivePluginId(key)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${isActive ? `${plugin.color} shadow-sm` : 'text-genesis-medium hover:bg-genesis-soft'}`}
              >
                <Icon className="w-3.5 h-3.5" />
                {plugin.name}
              </button>
            )
          })}
        </div>
      </div>

      <div className="min-h-[600px] flex flex-col gap-6">
        <div className="bg-genesis-hover/80 p-1 rounded-xl self-start inline-flex backdrop-blur-sm">
          <TabButton
            active={activeTab === 'prontuario'}
            onClick={() => setActiveTab('prontuario')}
            icon={FileText}
            label="Prontuário"
          />
          <TabButton
            active={activeTab === 'timeline'}
            onClick={() => setActiveTab('timeline')}
            icon={History}
            label="Histórico"
          />
          <TabButton
            active={activeTab === 'clinicalAI'}
            onClick={() => setActiveTab('clinicalAI')}
            icon={Sparkles}
            label="Diagnóstico Assistido"
            colorClass="text-[#6366F1]"
          />
        </div>

        <div className="flex-1">
          {activeTab === 'prontuario' && (
            <div className="flex gap-8 animate-in fade-in zoom-in-95 h-[calc(100vh-18rem)]">
              {/* History Sidebar */}
              <div className="w-72 flex-shrink-0 flex flex-col bg-genesis-surface rounded-[24px] border border-genesis-border-subtle shadow-md overflow-hidden">
                <div className="p-4 border-b border-genesis-border-subtle flex justify-between items-center bg-genesis-soft/30">
                  <h3 className="text-xs font-bold text-genesis-medium uppercase tracking-wider">
                    Registros
                  </h3>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                  {records.length === 0 ? (
                    <p className="text-center text-xs text-genesis-medium p-4">
                      Nenhum registro encontrado.
                    </p>
                  ) : (
                    records.map(r => <HistoryItem key={r.id} record={r} />)
                  )}
                </div>
              </div>

              {/* Dynamic Editor Area */}
              <div className="flex-1 flex flex-col bg-genesis-surface rounded-[24px] border border-genesis-border-subtle shadow-md overflow-hidden relative">
                <div
                  className={`px-8 py-5 border-b border-genesis-border-subtle flex justify-between items-center bg-genesis-surface sticky top-0 z-10 ${activePlugin.color.split(' ')[1]}`}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
                      <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                        Novo Registro
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-genesis-dark tracking-tight">
                      {activePlugin.name}
                    </h2>
                  </div>
                </div>

                <div className="flex-1 p-10 overflow-y-auto custom-scrollbar">
                  {activePluginId === 'medicina' && <MedicineEditor onSave={handleSaveRecord} />}
                  {activePluginId === 'nutricao' && <NutritionEditor onSave={handleSaveRecord} />}
                  {activePluginId === 'psicologia' && (
                    <PsychologyEditor onSave={handleSaveRecord} />
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="bg-genesis-surface rounded-[32px] border border-genesis-border-subtle shadow-md p-10 animate-in fade-in zoom-in-95">
              <h3 className="text-lg font-bold text-genesis-dark mb-8 pl-8">Linha do Tempo</h3>
              {timelineEvents.length === 0 ? (
                <p className="text-center text-genesis-subtle py-10">
                  Nenhum evento registrado no histórico.
                </p>
              ) : (
                <Suspense fallback={<ComponentLoader />}>
                  <Timeline events={timelineEvents} />
                </Suspense>
              )}
            </div>
          )}

          {activeTab === 'clinicalAI' && id && (
            <div className="bg-genesis-surface rounded-[32px] border border-genesis-border-subtle shadow-md overflow-hidden animate-in fade-in zoom-in-95 h-[calc(100vh-18rem)]">
              <Suspense fallback={<ComponentLoader />}>
                <ClinicalReasoningPanel patientId={id} patientContext={patientContext} />
              </Suspense>
            </div>
          )}
        </div>
      </div>

      {/* Prescription Modal - Lazy loaded */}
      {patient && id && showPrescriptionModal && (
        <Suspense fallback={<ComponentLoader />}>
          <PrescriptionModal
            isOpen={showPrescriptionModal}
            onClose={() => setShowPrescriptionModal(false)}
            patientId={id}
            patientName={patient.name}
            onSave={handlePrescriptionSave}
          />
        </Suspense>
      )}
    </div>
  )
}
