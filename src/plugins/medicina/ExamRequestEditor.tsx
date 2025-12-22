/**
 * Exam Request Editor - Solicitação de Exames
 * ============================================
 *
 * Editor para solicitação de exames laboratoriais/diagnósticos:
 * - Seleção de exames comuns via checkboxes
 * - Justificativa clínica (requisito de convênios)
 * - Resumo da solicitação
 *
 * @module plugins/medicina/ExamRequestEditor
 */

import { useState } from 'react';
import { CheckCircle2, AlertCircle, FlaskConical } from 'lucide-react';
import { RecordType, EditorRecordData } from '../../types';
import { COMMON_EXAMS } from './data/common-exams';

interface ExamRequestEditorProps {
  onSave: (data: EditorRecordData) => void;
}

export function ExamRequestEditor({ onSave }: ExamRequestEditorProps) {
  const [selectedExams, setSelectedExams] = useState<string[]>([]);
  const [justification, setJustification] = useState('');

  const toggleExam = (exam: string) => {
    setSelectedExams((prev) =>
      prev.includes(exam) ? prev.filter((e) => e !== exam) : [...prev, exam]
    );
  };

  const handleSave = () => {
    if (selectedExams.length === 0) return;
    onSave({
      type: RecordType.EXAM_REQUEST,
      exams: selectedExams,
      justification,
    });
    setSelectedExams([]);
    setJustification('');
  };

  const canSave = selectedExams.length > 0;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-left-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Lista de exames */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-genesis-medium uppercase tracking-wider">
            Exames Comuns
          </h4>
          <div className="space-y-2">
            {COMMON_EXAMS.map((exam) => {
              const isSelected = selectedExams.includes(exam);
              return (
                <label
                  key={exam}
                  className="flex items-center gap-3 p-3 bg-genesis-surface border border-genesis-border-subtle rounded-xl cursor-pointer hover:bg-blue-50 hover:border-blue-100 transition-colors"
                >
                  <div
                    className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                      isSelected ? 'bg-blue-600 border-blue-600' : 'border-genesis-border bg-genesis-surface'
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={isSelected}
                    onChange={() => toggleExam(exam)}
                  />
                  <span className="text-sm font-medium text-genesis-dark">{exam}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Justificativa e resumo */}
        <div className="space-y-4">
          <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
            <div className="flex items-center gap-2 mb-2 text-orange-700">
              <AlertCircle className="w-4 h-4" />
              <h5 className="text-xs font-bold uppercase">Justificativa Clínica</h5>
            </div>
            <textarea
              className="w-full h-32 p-3 bg-genesis-surface border border-orange-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-200 transition-all resize-none"
              placeholder="Motivo da solicitação (obrigatório para alguns convênios)..."
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
            />
          </div>

          <div className="bg-genesis-soft p-4 rounded-xl border border-genesis-border-subtle">
            <h5 className="text-xs font-bold text-genesis-dark uppercase mb-2">
              Resumo da Solicitação
            </h5>
            <p className="text-sm text-genesis-medium">
              {selectedExams.length} exame{selectedExams.length !== 1 ? 's' : ''} selecionado
              {selectedExams.length !== 1 ? 's' : ''}.
            </p>
          </div>
        </div>
      </div>

      {/* Ação */}
      <div className="flex justify-end pt-4 border-t border-genesis-border-subtle">
        <button
          onClick={handleSave}
          disabled={!canSave}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-all transform hover:-translate-y-0.5 ${
            canSave
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'
              : 'bg-genesis-border-subtle text-genesis-subtle cursor-not-allowed shadow-none'
          }`}
        >
          <FlaskConical className="w-4 h-4" /> Solicitar Exames
        </button>
      </div>
    </div>
  );
}
