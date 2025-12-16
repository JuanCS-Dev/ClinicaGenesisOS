import React, { useState } from 'react';
import { SpecialtyType, PluginDefinition, RecordType } from '../types';
import { Stethoscope, Apple, Brain, Pill, FileText, Activity, Plus, Trash2, CheckCircle2, FlaskConical, AlertCircle } from 'lucide-react';

// --- PLUGIN DEFINITIONS ---

export const PLUGINS: Record<SpecialtyType, PluginDefinition> = {
  medicina: {
    id: 'medicina',
    name: 'Medicina Geral',
    color: 'text-blue-600 bg-blue-50 border-blue-100',
    icon: Stethoscope,
    features: ['Anamnese SOAP', 'Prescrição Digital', 'Solicitação de Exames']
  },
  nutricao: {
    id: 'nutricao',
    name: 'Nutrição',
    color: 'text-green-600 bg-green-50 border-green-100',
    icon: Apple,
    features: ['Antropometria', 'Plano Alimentar', 'Recordatório 24h']
  },
  psicologia: {
    id: 'psicologia',
    name: 'Psicologia',
    color: 'text-pink-600 bg-pink-50 border-pink-100',
    icon: Brain,
    features: ['Evolução de Sessão', 'Diário de Humor', 'Anotações Privadas']
  }
};

// --- MEDICINA RENDERER (Full Implementation) ---

const MedicineTabButton = ({ active, onClick, label, icon: Icon }: any) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
      active 
        ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
        : 'text-gray-500 hover:bg-gray-100'
    }`}
  >
    <Icon className="w-4 h-4" />
    {label}
  </button>
);

export const MedicineEditor = ({ onSave }: { onSave: (data: any) => void }) => {
  const [activeTab, setActiveTab] = useState<'soap' | 'prescription' | 'exams'>('soap');

  // SOAP State
  const [soap, setSoap] = useState({
    s: '',
    o: '',
    a: '',
    p: ''
  });

  // Prescription State
  const [medications, setMedications] = useState<Array<{name: string, dosage: string, instructions: string}>>([]);
  const [currentMed, setCurrentMed] = useState({ name: '', dosage: '', instructions: '' });

  // Exams State
  const [selectedExams, setSelectedExams] = useState<string[]>([]);
  const [justification, setJustification] = useState('');

  // --- HANDLERS ---

  const handleSaveSOAP = () => {
    if (!soap.s && !soap.o) {
      alert("Preencha pelo menos o campo Subjetivo ou Objetivo.");
      return;
    }
    onSave({
      type: RecordType.SOAP,
      subjective: soap.s,
      objective: soap.o,
      assessment: soap.a,
      plan: soap.p
    });
    setSoap({ s: '', o: '', a: '', p: '' });
  };

  const handleAddMedication = () => {
    if (!currentMed.name || !currentMed.dosage) return;
    setMedications([...medications, currentMed]);
    setCurrentMed({ name: '', dosage: '', instructions: '' });
  };

  const handleRemoveMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const handleSavePrescription = () => {
    if (medications.length === 0) return;
    onSave({
      type: RecordType.PRESCRIPTION,
      medications: medications
    });
    setMedications([]);
  };

  const handleSaveExams = () => {
    if (selectedExams.length === 0) return;
    onSave({
      type: RecordType.EXAM_REQUEST,
      exams: selectedExams,
      justification: justification
    });
    setSelectedExams([]);
    setJustification('');
  };

  const commonExams = [
    'Hemograma Completo',
    'Glicemia em Jejum',
    'Colesterol Total e Frações',
    'Triglicerídeos',
    'TSH e T4 Livre',
    'Creatinina',
    'Ureia',
    'TGO / TGP',
    'Vitamina D',
    'Urina Tipo I'
  ];

  const toggleExam = (exam: string) => {
    if (selectedExams.includes(exam)) {
      setSelectedExams(selectedExams.filter(e => e !== exam));
    } else {
      setSelectedExams([...selectedExams, exam]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-Navigation */}
      <div className="flex gap-2 pb-4 border-b border-gray-100">
        <MedicineTabButton 
          active={activeTab === 'soap'} 
          onClick={() => setActiveTab('soap')} 
          label="Evolução (SOAP)" 
          icon={FileText} 
        />
        <MedicineTabButton 
          active={activeTab === 'prescription'} 
          onClick={() => setActiveTab('prescription')} 
          label="Prescrição" 
          icon={Pill} 
        />
        <MedicineTabButton 
          active={activeTab === 'exams'} 
          onClick={() => setActiveTab('exams')} 
          label="Exames" 
          icon={FlaskConical} 
        />
      </div>

      {/* --- SOAP TAB --- */}
      {activeTab === 'soap' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-left-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1">
                <span className="w-4 h-4 rounded bg-blue-100 text-center leading-4 text-[10px]">S</span> Subjetivo
              </label>
              <textarea 
                className="w-full h-32 p-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm resize-none"
                placeholder="Queixa principal, história da moléstia atual..."
                value={soap.s}
                onChange={e => setSoap({...soap, s: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1">
                <span className="w-4 h-4 rounded bg-blue-100 text-center leading-4 text-[10px]">O</span> Objetivo
              </label>
              <textarea 
                className="w-full h-32 p-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm resize-none"
                placeholder="Exame físico, sinais vitais..."
                value={soap.o}
                onChange={e => setSoap({...soap, o: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1">
                <span className="w-4 h-4 rounded bg-blue-100 text-center leading-4 text-[10px]">A</span> Avaliação
              </label>
              <textarea 
                className="w-full h-24 p-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm resize-none"
                placeholder="Hipóteses diagnósticas, CID..."
                value={soap.a}
                onChange={e => setSoap({...soap, a: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1">
                <span className="w-4 h-4 rounded bg-blue-100 text-center leading-4 text-[10px]">P</span> Plano
              </label>
              <textarea 
                className="w-full h-24 p-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm resize-none"
                placeholder="Conduta, orientações, retorno..."
                value={soap.p}
                onChange={e => setSoap({...soap, p: e.target.value})}
              />
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <button 
              onClick={handleSaveSOAP}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-200 transition-all transform hover:-translate-y-0.5"
            >
              <CheckCircle2 className="w-4 h-4" /> Salvar Evolução
            </button>
          </div>
        </div>
      )}

      {/* --- PRESCRIPTION TAB --- */}
      {activeTab === 'prescription' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-left-2">
          
          {/* Add Med Form */}
          <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
             <h4 className="text-sm font-bold text-genesis-dark mb-4 flex items-center gap-2">
               <Plus className="w-4 h-4" /> Adicionar Medicamento
             </h4>
             <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                <div className="md:col-span-4 space-y-1">
                   <label className="text-[10px] font-bold text-genesis-medium uppercase">Nome do Fármaco</label>
                   <input 
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 transition-colors"
                    placeholder="Ex: Dipirona Sódica"
                    value={currentMed.name}
                    onChange={e => setCurrentMed({...currentMed, name: e.target.value})}
                   />
                </div>
                <div className="md:col-span-3 space-y-1">
                   <label className="text-[10px] font-bold text-genesis-medium uppercase">Posologia / Conc.</label>
                   <input 
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 transition-colors"
                    placeholder="Ex: 500mg"
                    value={currentMed.dosage}
                    onChange={e => setCurrentMed({...currentMed, dosage: e.target.value})}
                   />
                </div>
                <div className="md:col-span-4 space-y-1">
                   <label className="text-[10px] font-bold text-genesis-medium uppercase">Instruções de Uso</label>
                   <input 
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 transition-colors"
                    placeholder="Ex: 1 cp a cada 6 horas se dor"
                    value={currentMed.instructions}
                    onChange={e => setCurrentMed({...currentMed, instructions: e.target.value})}
                   />
                </div>
                <div className="md:col-span-1">
                   <button 
                    onClick={handleAddMedication}
                    className="w-full p-2.5 bg-blue-600 text-white rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
                   >
                     <Plus className="w-5 h-5" />
                   </button>
                </div>
             </div>
          </div>

          {/* List */}
          <div className="space-y-2">
             <h4 className="text-xs font-bold text-genesis-medium uppercase tracking-wider mb-2">Itens da Receita</h4>
             {medications.length === 0 ? (
               <div className="text-center p-8 border-2 border-dashed border-gray-100 rounded-xl">
                 <Pill className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                 <p className="text-sm text-gray-400">Nenhum medicamento adicionado.</p>
               </div>
             ) : (
               <div className="space-y-2">
                 {medications.map((med, idx) => (
                   <div key={idx} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-bold text-xs">{idx + 1}</div>
                         <div>
                            <p className="font-bold text-sm text-genesis-dark">{med.name} <span className="text-gray-400 font-normal">• {med.dosage}</span></p>
                            <p className="text-xs text-genesis-medium">{med.instructions}</p>
                         </div>
                      </div>
                      <button 
                        onClick={() => handleRemoveMedication(idx)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                   </div>
                 ))}
               </div>
             )}
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-50">
            <button 
              onClick={handleSavePrescription}
              disabled={medications.length === 0}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-all transform hover:-translate-y-0.5 ${medications.length === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'}`}
            >
              <Pill className="w-4 h-4" /> Gerar Receita Digital
            </button>
          </div>
        </div>
      )}

      {/* --- EXAMS TAB --- */}
      {activeTab === 'exams' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-left-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-3">
                <h4 className="text-xs font-bold text-genesis-medium uppercase tracking-wider">Exames Comuns</h4>
                <div className="space-y-2">
                   {commonExams.map(exam => (
                     <label key={exam} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl cursor-pointer hover:bg-blue-50 hover:border-blue-100 transition-colors">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedExams.includes(exam) ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'}`}>
                           {selectedExams.includes(exam) && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <input 
                          type="checkbox" 
                          className="hidden"
                          checked={selectedExams.includes(exam)}
                          onChange={() => toggleExam(exam)}
                        />
                        <span className="text-sm font-medium text-genesis-dark">{exam}</span>
                     </label>
                   ))}
                </div>
             </div>

             <div className="space-y-4">
                <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                   <div className="flex items-center gap-2 mb-2 text-orange-700">
                      <AlertCircle className="w-4 h-4" />
                      <h5 className="text-xs font-bold uppercase">Justificativa Clínica</h5>
                   </div>
                   <textarea 
                     className="w-full h-32 p-3 bg-white border border-orange-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-200 transition-all resize-none"
                     placeholder="Motivo da solicitação (obrigatório para alguns convênios)..."
                     value={justification}
                     onChange={e => setJustification(e.target.value)}
                   />
                </div>
                
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                   <h5 className="text-xs font-bold text-genesis-dark uppercase mb-2">Resumo da Solicitação</h5>
                   <p className="text-sm text-genesis-medium">
                     {selectedExams.length} exames selecionados.
                   </p>
                </div>
             </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-50">
            <button 
              onClick={handleSaveExams}
              disabled={selectedExams.length === 0}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-all transform hover:-translate-y-0.5 ${selectedExams.length === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'}`}
            >
              <FlaskConical className="w-4 h-4" /> Solicitar Exames
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

// 2. NUTRIÇÃO RENDERER (Unchanged for now)
export const NutritionEditor = ({ onSave }: { onSave: (data: any) => void }) => {
  const [weight, setWeight] = React.useState('');
  const [height, setHeight] = React.useState('');
  
  const handleSave = () => {
    if (!weight || !height) return;
    const hM = Number(height) / 100;
    const imc = Number(weight) / (hM * hM);
    
    onSave({
      type: RecordType.ANTHROPOMETRY,
      weight: Number(weight),
      height: Number(height),
      imc: parseFloat(imc.toFixed(2)),
      waist: 0,
      hip: 0
    });
    setWeight('');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-genesis-medium uppercase tracking-wider">Peso (kg)</label>
          <input 
            type="number"
            className="w-full p-4 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-green-100 outline-none transition-all text-sm font-bold"
            value={weight}
            onChange={e => setWeight(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-genesis-medium uppercase tracking-wider">Altura (cm)</label>
          <input 
            type="number"
            className="w-full p-4 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-green-100 outline-none transition-all text-sm font-bold"
            value={height}
            onChange={e => setHeight(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex justify-end">
        <button 
          onClick={handleSave}
          className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-green-200 transition-all transform hover:-translate-y-0.5"
        >
          Salvar Dados Antropométricos
        </button>
      </div>
    </div>
  );
};

// 3. PSICOLOGIA RENDERER (Unchanged for now)
export const PsychologyEditor = ({ onSave }: { onSave: (data: any) => void }) => {
  const [notes, setNotes] = React.useState('');
  const [mood, setMood] = React.useState<any>('neutral');

  const handleSave = () => {
    if (!notes) return;
    onSave({
      type: RecordType.PSYCHO_SESSION,
      summary: notes,
      mood: mood,
      privateNotes: ''
    });
    setNotes('');
  };

  const moods = [
    { id: 'happy', label: 'Feliz', icon: '😊' },
    { id: 'neutral', label: 'Neutro', icon: '😐' },
    { id: 'anxious', label: 'Ansioso', icon: '😰' },
    { id: 'sad', label: 'Triste', icon: '😢' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex gap-2 mb-4">
        {moods.map(m => (
          <button
            key={m.id}
            onClick={() => setMood(m.id)}
            className={`flex-1 p-3 rounded-xl border transition-all ${mood === m.id ? 'bg-pink-50 border-pink-200 shadow-sm' : 'bg-white border-gray-100 hover:bg-gray-50'}`}
          >
            <span className="text-2xl block mb-1">{m.icon}</span>
            <span className="text-[10px] font-bold uppercase tracking-wide text-genesis-medium">{m.label}</span>
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold text-genesis-medium uppercase tracking-wider">Notas da Sessão</label>
        <textarea 
          className="w-full h-32 p-4 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-pink-100 outline-none transition-all text-sm leading-relaxed"
          placeholder="Temas abordados, percepções..."
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />
      </div>

      <div className="flex justify-end">
        <button 
          onClick={handleSave}
          className="px-6 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-pink-200 transition-all transform hover:-translate-y-0.5"
        >
          Registrar Sessão
        </button>
      </div>
    </div>
  );
};