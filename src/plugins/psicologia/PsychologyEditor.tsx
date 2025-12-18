/**
 * Psychology Editor - Registro de Sessão
 * ======================================
 *
 * Editor para documentação de sessões psicológicas:
 * - Seleção de humor/estado emocional
 * - Notas da sessão
 * - Campo para anotações privadas (não compartilhadas)
 *
 * @module plugins/psicologia/PsychologyEditor
 */

import { useState } from 'react';
import { RecordType, EditorRecordData } from '../../types';
import { MOODS, MoodId } from './data/moods';

interface PsychologyEditorProps {
  onSave: (data: EditorRecordData) => void;
}

export function PsychologyEditor({ onSave }: PsychologyEditorProps) {
  const [notes, setNotes] = useState('');
  const [mood, setMood] = useState<MoodId>('neutral');

  const handleSave = () => {
    if (!notes.trim()) return;

    onSave({
      type: RecordType.PSYCHO_SESSION,
      summary: notes,
      mood,
      privateNotes: '',
    });

    setNotes('');
    setMood('neutral');
  };

  const canSave = notes.trim().length > 0;

  return (
    <div className="space-y-6">
      {/* Seletor de humor */}
      <div className="flex gap-2">
        {MOODS.map((m) => (
          <button
            key={m.id}
            onClick={() => setMood(m.id)}
            className={`flex-1 p-3 rounded-xl border transition-all ${
              mood === m.id
                ? 'bg-pink-50 border-pink-200 shadow-sm'
                : 'bg-white border-gray-100 hover:bg-gray-50'
            }`}
          >
            <span className="text-2xl block mb-1">{m.icon}</span>
            <span className="text-[10px] font-bold uppercase tracking-wide text-genesis-medium">
              {m.label}
            </span>
          </button>
        ))}
      </div>

      {/* Notas da sessão */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-genesis-medium uppercase tracking-wider">
          Notas da Sessão
        </label>
        <textarea
          className="w-full h-32 p-4 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-pink-100 outline-none transition-all text-sm leading-relaxed"
          placeholder="Temas abordados, percepções, evolução terapêutica..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {/* Ação */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={!canSave}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-all transform hover:-translate-y-0.5 ${
            canSave
              ? 'bg-pink-600 hover:bg-pink-700 text-white shadow-pink-200'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
          }`}
        >
          Registrar Sessão
        </button>
      </div>
    </div>
  );
}
