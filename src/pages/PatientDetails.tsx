import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { usePatient } from '../hooks/usePatient';
import { useRecords } from '../hooks/useRecords';
import { usePatientAppointments } from '../hooks/useAppointments';
import { useClinicContext } from '../contexts/ClinicContext';
import { PLUGINS, MedicineEditor, NutritionEditor, PsychologyEditor } from '../plugins/registry';
import { Timeline } from '../components/patient/Timeline';
import {
  Calendar,
  FileText,
  History,
  Edit2,
  Stethoscope,
  Pill,
  Activity,
  Brain,
  FlaskConical,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { SpecialtyType, RecordType, TimelineEvent, TimelineEventType, CreateRecordInput } from '../types';

const TabButton = ({ active, onClick, icon: Icon, label, colorClass = 'text-genesis-blue' }: any) => (
  <button
    onClick={onClick}
    className={`
      relative flex items-center justify-center gap-2 px-6 py-2 text-[13px] font-semibold transition-all duration-300 rounded-lg flex-1 md:flex-none
      ${active 
        ? `bg-white text-genesis-dark shadow-sm ring-1 ring-black/5` 
        : 'text-genesis-medium hover:text-genesis-dark hover:bg-black/5'
      }
    `}
  >
    <Icon className={`w-4 h-4 transition-colors ${active ? colorClass : 'text-gray-400'}`} />
    {label}
  </button>
);

const HistoryItem = ({ record, active }: any) => {
  let title = '';
  let content = '';
  let Icon = FileText;

  switch (record.type) {
    case RecordType.SOAP:
      title = 'Evolução Médica';
      content = (record as any).subjective || 'Sem detalhes subjetivos.';
      Icon = Stethoscope;
      break;
    case RecordType.PRESCRIPTION: {
      title = 'Prescrição Médica';
      const medsCount = (record as any).medications?.length || 0;
      content = `${medsCount} medicamentos prescritos: ${(record as any).medications.map((m: any) => m.name).join(', ')}`;
      Icon = Pill;
      break;
    }
    case RecordType.EXAM_REQUEST: {
      title = 'Solicitação de Exames';
      const examCount = (record as any).exams?.length || 0;
      content = `${examCount} exames solicitados: ${(record as any).exams.join(', ')}`;
      Icon = FlaskConical;
      break;
    }
    case RecordType.ANTHROPOMETRY:
      title = 'Antropometria';
      content = `Peso: ${(record as any).weight}kg, IMC: ${(record as any).imc}`;
      Icon = Activity;
      break;
    case RecordType.PSYCHO_SESSION:
      title = 'Sessão de Terapia';
      content = (record as any).summary;
      Icon = Brain;
      break;
    default:
      title = 'Registro';
      content = 'Detalhes do registro...';
  }

  return (
    <div className={`p-4 rounded-xl cursor-pointer transition-all duration-200 group border ${active ? 'bg-white shadow-soft border-gray-100 ring-1 ring-black/5' : 'border-transparent hover:bg-white/50 hover:border-gray-100'}`}>
      <div className="flex justify-between items-start mb-1.5">
        <span className="text-[10px] font-bold text-genesis-medium uppercase tracking-wider bg-gray-50 px-2 py-0.5 rounded-md">
          {format(new Date(record.date), 'dd MMM yy', {locale: ptBR})}
        </span>
        {active && <div className="w-1.5 h-1.5 rounded-full bg-genesis-blue shadow-[0_0_8px_rgba(0,122,255,0.5)]" />}
      </div>
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-3.5 h-3.5 text-genesis-medium/80" />
        <h4 className={`text-sm font-semibold ${active ? 'text-genesis-dark' : 'text-genesis-medium group-hover:text-genesis-dark'}`}>
            {title}
        </h4>
      </div>
      <p className="text-[11px] text-genesis-medium line-clamp-2 leading-relaxed opacity-90 pl-5.5">
         {content}
      </p>
    </div>
  );
};

export const PatientDetails: React.FC = () => {
  const { id } = useParams();
  const { userProfile } = useClinicContext();
  const { patient, loading: patientLoading } = usePatient(id);
  const { records, addRecord } = useRecords(id);
  const { appointments } = usePatientAppointments(id);

  const [activeTab, setActiveTab] = useState<'prontuario' | 'dados' | 'timeline'>('prontuario');

  // Plugin State - default to user's specialty or medicina
  const [activePluginId, setActivePluginId] = useState<SpecialtyType>(
    userProfile?.specialty || 'medicina'
  );
  const activePlugin = PLUGINS[activePluginId];

  if (patientLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-genesis-blue animate-spin" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-genesis-medium">Paciente não encontrado.</p>
      </div>
    );
  }

  const handleSaveRecord = async (data: Omit<CreateRecordInput, 'patientId'>) => {
    if (!id) return;
    try {
      await addRecord({
        patientId: id,
        specialty: activePluginId,
        ...data
      } as CreateRecordInput);
    } catch (error) {
      console.error('Error saving record:', error);
    }
  };

  // --- GENERATE TIMELINE EVENTS FROM STORE DATA ---
  const generateTimelineEvents = (): TimelineEvent[] => {
    const events: TimelineEvent[] = [];

    // 1. Add Records
    records.forEach(r => {
        let type = TimelineEventType.CONSULTATION;
        let title = 'Registro Clínico';
        let desc = '';

        if (r.type === RecordType.PRESCRIPTION) {
            type = TimelineEventType.PRESCRIPTION;
            title = 'Receita Emitida';
            desc = `${(r as any).medications.length} medicamentos prescritos.`;
        } else if (r.type === RecordType.EXAM_REQUEST) {
            type = TimelineEventType.EXAM;
            title = 'Exames Solicitados';
            desc = (r as any).exams.join(', ');
        } else if (r.type === RecordType.ANTHROPOMETRY) {
            type = TimelineEventType.EXAM;
            title = 'Avaliação Física';
            desc = `Peso: ${(r as any).weight}kg - IMC: ${(r as any).imc}`;
        } else {
            // SOAP or others
            type = TimelineEventType.CONSULTATION;
            title = 'Evolução';
            desc = (r as any).subjective || (r as any).summary || 'Registro de consulta.';
        }

        events.push({
            id: r.id,
            date: new Date(r.date),
            type,
            title,
            description: desc
        });
    });

    // 2. Add Appointments
    appointments.forEach(a => {
        if (new Date(a.date) < new Date()) { // Only past appointments in timeline typically
            events.push({
                id: a.id,
                date: new Date(a.date),
                type: TimelineEventType.CONSULTATION,
                title: a.procedure,
                description: `Consulta realizada com ${a.professional}. Status: ${a.status}`
            });
        }
    });

    return events.sort((a,b) => b.date.getTime() - a.date.getTime());
  };

  const timelineEvents = generateTimelineEvents();

  return (
    <div className="space-y-6 animate-enter pb-8">
      
      {/* Patient Header */}
      <div className="bg-white rounded-[24px] border border-white shadow-soft overflow-hidden group relative z-0">
        <div className="h-40 bg-gradient-to-r from-slate-50 via-gray-50 to-zinc-50 border-b border-gray-100 relative overflow-hidden">
           <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-60"></div>
           <div className="absolute top-6 right-8 flex gap-3 z-20">
             <button className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-md border border-gray-200/50 rounded-xl text-xs font-bold text-genesis-dark hover:bg-white hover:shadow-sm transition-all">
                <Edit2 className="w-3.5 h-3.5" /> Editar
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-genesis-dark text-white rounded-xl text-xs font-bold hover:bg-black transition-all shadow-lg shadow-gray-200/50 hover:-translate-y-0.5">
                <Calendar className="w-3.5 h-3.5" /> Agendar
            </button>
           </div>
        </div>

        <div className="px-10 pb-8 relative z-20">
          <div className="flex flex-col md:flex-row justify-between items-end -mt-12 mb-8 gap-6">
            <div className="flex items-end gap-6">
              <div className="relative group/avatar cursor-pointer">
                <div className="w-28 h-28 rounded-[24px] border-[4px] border-white shadow-xl overflow-hidden bg-white transition-transform duration-500 group-hover/avatar:scale-105 group-hover/avatar:shadow-2xl">
                    <img src={patient.avatar || `https://ui-avatars.com/api/?name=${patient.name}`} alt={patient.name} className="w-full h-full object-cover"/>
                </div>
              </div>
              
              <div className="mb-1">
                <h1 className="text-3xl font-bold text-genesis-dark flex items-center gap-3 tracking-tight">
                  {patient.name}
                </h1>
                <div className="flex flex-wrap gap-2 mt-2">
                    {patient.tags.map(tag => (
                        <span key={tag} className="px-2.5 py-0.5 bg-gray-50 text-genesis-medium text-[10px] rounded-md font-bold uppercase border border-gray-100 tracking-wide">
                        {tag}
                        </span>
                    ))}
                    <span className="text-gray-300 mx-1">|</span>
                    <span className="text-sm text-genesis-medium font-medium">{patient.age} anos</span>
                </div>
              </div>
            </div>

            <div className="flex gap-1 bg-gray-50/50 p-1 rounded-2xl border border-gray-100">
                <div className="px-5 py-2 text-center border-r border-gray-200/50">
                    <p className="text-[10px] font-bold text-genesis-medium uppercase tracking-wider">Telefone</p>
                    <p className="text-sm font-bold text-genesis-dark">{patient.phone}</p>
                </div>
                <div className="px-5 py-2 text-center">
                    <p className="text-[10px] font-bold text-genesis-medium uppercase tracking-wider">Convênio</p>
                    <p className="text-sm font-bold text-genesis-dark">{patient.insurance || 'Particular'}</p>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* Plugin Selector (The "Genesis" Modular Part) */}
      <div className="flex gap-4 items-center">
         <span className="text-[10px] font-bold uppercase tracking-widest text-genesis-medium">Especialidade Ativa:</span>
         <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-100">
            {(Object.keys(PLUGINS) as SpecialtyType[]).map(key => {
               const plugin = PLUGINS[key];
               const Icon = plugin.icon;
               const isActive = activePluginId === key;
               return (
                  <button 
                    key={key}
                    onClick={() => setActivePluginId(key)}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${isActive ? `${plugin.color} shadow-sm` : 'text-genesis-medium hover:bg-gray-50'}`}
                  >
                     <Icon className="w-3.5 h-3.5" />
                     {plugin.name}
                  </button>
               )
            })}
         </div>
      </div>

      <div className="min-h-[600px] flex flex-col gap-6">
        <div className="bg-gray-100/80 p-1 rounded-xl self-start inline-flex backdrop-blur-sm">
          <TabButton active={activeTab === 'prontuario'} onClick={() => setActiveTab('prontuario')} icon={FileText} label="Prontuário" />
          <TabButton active={activeTab === 'timeline'} onClick={() => setActiveTab('timeline')} icon={History} label="Histórico" />
        </div>

        <div className="flex-1">
          {activeTab === 'prontuario' && (
            <div className="flex gap-8 animate-in fade-in zoom-in-95 h-[calc(100vh-28rem)]">
              
              {/* History Sidebar */}
              <div className="w-72 flex-shrink-0 flex flex-col bg-white rounded-[24px] border border-white shadow-soft overflow-hidden">
                 <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                    <h3 className="text-xs font-bold text-genesis-medium uppercase tracking-wider">Registros</h3>
                 </div>
                 <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                    {records.length === 0 ? (
                        <p className="text-center text-xs text-genesis-medium p-4">Nenhum registro encontrado.</p>
                    ) : (
                        records.map(r => <HistoryItem key={r.id} record={r} />)
                    )}
                 </div>
              </div>

              {/* Dynamic Editor Area */}
              <div className="flex-1 flex flex-col bg-white rounded-[24px] border border-white shadow-soft overflow-hidden relative">
                <div className={`px-8 py-5 border-b border-gray-50 flex justify-between items-center bg-white sticky top-0 z-10 ${activePlugin.color.split(' ')[1]}`}>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
                            <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">Novo Registro</span>
                        </div>
                        <h2 className="text-lg font-bold text-genesis-dark tracking-tight">{activePlugin.name}</h2>
                    </div>
                </div>

                <div className="flex-1 p-10 overflow-y-auto custom-scrollbar">
                    {/* Render the specific plugin UI */}
                    {activePluginId === 'medicina' && <MedicineEditor onSave={handleSaveRecord} />}
                    {activePluginId === 'nutricao' && <NutritionEditor onSave={handleSaveRecord} />}
                    {activePluginId === 'psicologia' && <PsychologyEditor onSave={handleSaveRecord} />}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
             <div className="bg-white rounded-[32px] border border-white shadow-soft p-10 animate-in fade-in zoom-in-95">
                <h3 className="text-lg font-bold text-genesis-dark mb-8 pl-8">Linha do Tempo</h3>
                {timelineEvents.length === 0 ? (
                    <p className="text-center text-gray-400 py-10">Nenhum evento registrado no histórico.</p>
                ) : (
                    <Timeline events={timelineEvents} />
                )}
             </div>
          )}
        </div>
      </div>
    </div>
  );
};