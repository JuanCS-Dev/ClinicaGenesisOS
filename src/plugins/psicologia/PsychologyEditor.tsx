/**
 * Psychology Editor - Registro de Sessão
 * ======================================
 *
 * Editor para documentação de sessões psicológicas seguindo
 * práticas recomendadas (CFP Resolução 001/2009):
 * - Seleção de humor/estado emocional
 * - Notas da sessão (Progress Notes - compartilháveis)
 * - Notas privadas (Psychotherapy Notes - protegidas)
 *
 * Distinção importante:
 * - Progress Notes: Objetivas, focadas em comportamento e intervenções
 * - Notas Privadas: Reflexões do terapeuta, não compartilhadas
 *
 * @module plugins/psicologia/PsychologyEditor
 */

import { useState } from 'react';
import { Lock, FileText } from 'lucide-react';
import { RecordType, EditorRecordData } from '../../types';
import { MOODS, MoodId } from './data/moods';

interface PsychologyEditorProps {
  onSave: (data: EditorRecordData) => void;
}

export function PsychologyEditor({ onSave }: PsychologyEditorProps) {
  const [summary, setSummary] = useState('');
  const [privateNotes, setPrivateNotes] = useState('');
  const [mood, setMood] = useState<MoodId>('neutral');
  const [showPrivateNotes, setShowPrivateNotes] = useState(false);

  const handleSave = () => {
    if (!summary.trim()) return;

    onSave({
      type: RecordType.PSYCHO_SESSION,
      summary,
      mood,
      privateNotes,
    });

    setSummary('');
    setPrivateNotes('');
    setMood('neutral');
    setShowPrivateNotes(false);
  };

  const canSave = summary.trim().length > 0;

  return (
    <div className="space-y-6">
      {/* Seletor de humor */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-genesis-medium uppercase tracking-wider">
          Estado Emocional do Paciente
        </label>
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
      </div>

      {/* Notas da sessão (Progress Notes) */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-genesis-medium uppercase tracking-wider flex items-center gap-2">
          <FileText className="w-3.5 h-3.5" />
          Registro da Sessão
        </label>
        <textarea
          className="w-full h-32 p-4 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-pink-100 outline-none transition-all text-sm leading-relaxed"
          placeholder="Temas abordados, intervenções realizadas, comportamentos observados, evolução terapêutica..."
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
        />
        <p className="text-[10px] text-gray-400">
          Estas notas podem ser compartilhadas com outros profissionais se necessário.
        </p>
      </div>

      {/* Toggle para notas privadas */}
      <div className="border-t border-gray-100 pt-4">
        <button
          type="button"
          onClick={() => setShowPrivateNotes(!showPrivateNotes)}
          className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-colors ${
            showPrivateNotes ? 'text-pink-600' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          {showPrivateNotes ? 'Ocultar' : 'Adicionar'} Notas Privadas
        </button>
      </div>

      {/* Notas privadas (Psychotherapy Notes) */}
      {showPrivateNotes && (
        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <label className="text-xs font-bold text-pink-600 uppercase tracking-wider flex items-center gap-2">
            <Lock className="w-3.5 h-3.5" />
            Notas Privadas do Terapeuta
          </label>
          <textarea
            className="w-full h-24 p-4 bg-pink-50 border border-pink-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-pink-200 outline-none transition-all text-sm leading-relaxed"
            placeholder="Reflexões pessoais, hipóteses, contratransferência, impressões clínicas reservadas..."
            value={privateNotes}
            onChange={(e) => setPrivateNotes(e.target.value)}
          />
          <p className="text-[10px] text-pink-400">
            Estas notas são protegidas e não serão compartilhadas. Visíveis apenas para você.
          </p>
        </div>
      )}

      {/* Ação */}
      <div className="flex justify-end pt-2">
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
