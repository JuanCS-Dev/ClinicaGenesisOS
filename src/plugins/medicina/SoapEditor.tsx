/**
 * SOAP Editor - Evolução Clínica
 * ==============================
 *
 * Editor para registro de evolução médica no formato SOAP:
 * - Subjetivo: Queixa do paciente
 * - Objetivo: Achados do exame físico
 * - Avaliação: Hipóteses diagnósticas
 * - Plano: Conduta terapêutica
 *
 * @module plugins/medicina/SoapEditor
 */

import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { RecordType, EditorRecordData } from '../../types';

interface SoapData {
  s: string;
  o: string;
  a: string;
  p: string;
}

interface SoapEditorProps {
  onSave: (data: EditorRecordData) => void;
}

const SoapField = ({
  letter,
  label,
  placeholder,
  value,
  onChange,
  rows = 4,
}: {
  letter: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) => (
  <div className="space-y-2">
    <label className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1">
      <span className="w-4 h-4 rounded bg-blue-100 text-center leading-4 text-[10px]">
        {letter}
      </span>{' '}
      {label}
    </label>
    <textarea
      className="w-full p-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm resize-none"
      style={{ height: rows === 4 ? '8rem' : '6rem' }}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

export function SoapEditor({ onSave }: SoapEditorProps) {
  const [soap, setSoap] = useState<SoapData>({ s: '', o: '', a: '', p: '' });

  const handleSave = () => {
    if (!soap.s && !soap.o) {
      alert('Preencha pelo menos o campo Subjetivo ou Objetivo.');
      return;
    }

    onSave({
      type: RecordType.SOAP,
      subjective: soap.s,
      objective: soap.o,
      assessment: soap.a,
      plan: soap.p,
    });

    setSoap({ s: '', o: '', a: '', p: '' });
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-left-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SoapField
          letter="S"
          label="Subjetivo"
          placeholder="Queixa principal, história da moléstia atual..."
          value={soap.s}
          onChange={(v) => setSoap({ ...soap, s: v })}
        />
        <SoapField
          letter="O"
          label="Objetivo"
          placeholder="Exame físico, sinais vitais..."
          value={soap.o}
          onChange={(v) => setSoap({ ...soap, o: v })}
        />
        <SoapField
          letter="A"
          label="Avaliação"
          placeholder="Hipóteses diagnósticas, CID..."
          value={soap.a}
          onChange={(v) => setSoap({ ...soap, a: v })}
          rows={3}
        />
        <SoapField
          letter="P"
          label="Plano"
          placeholder="Conduta, orientações, retorno..."
          value={soap.p}
          onChange={(v) => setSoap({ ...soap, p: v })}
          rows={3}
        />
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-200 transition-all transform hover:-translate-y-0.5"
        >
          <CheckCircle2 className="w-4 h-4" /> Salvar Evolução
        </button>
      </div>
    </div>
  );
}
