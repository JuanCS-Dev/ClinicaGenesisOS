/**
 * Prescription Editor - Receituário Digital
 * ==========================================
 *
 * Editor para criação de prescrições médicas com:
 * - Adição de medicamentos (nome, posologia, instruções)
 * - Lista editável de itens
 * - Geração de receita estruturada
 *
 * @module plugins/medicina/PrescriptionEditor
 */

import { useState } from 'react';
import { Plus, Trash2, Pill } from 'lucide-react';
import { RecordType, EditorRecordData } from '../../types';

interface Medication {
  name: string;
  dosage: string;
  instructions: string;
}

interface PrescriptionEditorProps {
  onSave: (data: EditorRecordData) => void;
}

const EMPTY_MED: Medication = { name: '', dosage: '', instructions: '' };

export function PrescriptionEditor({ onSave }: PrescriptionEditorProps) {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [currentMed, setCurrentMed] = useState<Medication>(EMPTY_MED);

  const handleAdd = () => {
    if (!currentMed.name || !currentMed.dosage) return;
    setMedications([...medications, currentMed]);
    setCurrentMed(EMPTY_MED);
  };

  const handleRemove = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (medications.length === 0) return;
    onSave({
      type: RecordType.PRESCRIPTION,
      medications,
    });
    setMedications([]);
  };

  const canSave = medications.length > 0;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-left-2">
      {/* Formulário de adição */}
      <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
        <h4 className="text-sm font-bold text-genesis-dark mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Adicionar Medicamento
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-4 space-y-1">
            <label className="text-[10px] font-bold text-genesis-medium uppercase">
              Nome do Fármaco
            </label>
            <input
              className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 transition-colors"
              placeholder="Ex: Dipirona Sódica"
              value={currentMed.name}
              onChange={(e) => setCurrentMed({ ...currentMed, name: e.target.value })}
            />
          </div>
          <div className="md:col-span-3 space-y-1">
            <label className="text-[10px] font-bold text-genesis-medium uppercase">
              Posologia / Conc.
            </label>
            <input
              className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 transition-colors"
              placeholder="Ex: 500mg"
              value={currentMed.dosage}
              onChange={(e) => setCurrentMed({ ...currentMed, dosage: e.target.value })}
            />
          </div>
          <div className="md:col-span-4 space-y-1">
            <label className="text-[10px] font-bold text-genesis-medium uppercase">
              Instruções de Uso
            </label>
            <input
              className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 transition-colors"
              placeholder="Ex: 1 cp a cada 6 horas se dor"
              value={currentMed.instructions}
              onChange={(e) => setCurrentMed({ ...currentMed, instructions: e.target.value })}
            />
          </div>
          <div className="md:col-span-1">
            <button
              onClick={handleAdd}
              className="w-full p-2.5 bg-blue-600 text-white rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Lista de medicamentos */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-genesis-medium uppercase tracking-wider mb-2">
          Itens da Receita
        </h4>
        {medications.length === 0 ? (
          <div className="text-center p-8 border-2 border-dashed border-gray-100 rounded-xl">
            <Pill className="w-8 h-8 text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-400">Nenhum medicamento adicionado.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {medications.map((med, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-bold text-xs">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-genesis-dark">
                      {med.name}{' '}
                      <span className="text-gray-400 font-normal">• {med.dosage}</span>
                    </p>
                    <p className="text-xs text-genesis-medium">{med.instructions}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemove(idx)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ação */}
      <div className="flex justify-end pt-4 border-t border-gray-50">
        <button
          onClick={handleSave}
          disabled={!canSave}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-all transform hover:-translate-y-0.5 ${
            canSave
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
          }`}
        >
          <Pill className="w-4 h-4" /> Gerar Receita Digital
        </button>
      </div>
    </div>
  );
}
