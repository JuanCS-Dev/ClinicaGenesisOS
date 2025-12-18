/**
 * Nutrition Editor - Avaliação Nutricional
 * =========================================
 *
 * Editor para registro de dados antropométricos:
 * - Peso e altura
 * - Cálculo automático de IMC
 * - Base para futuras expansões (circunferências, bioimpedância)
 *
 * @module plugins/nutricao/NutritionEditor
 */

import { useState } from 'react';
import { RecordType, EditorRecordData } from '../../types';

interface NutritionEditorProps {
  onSave: (data: EditorRecordData) => void;
}

function calculateIMC(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return parseFloat((weightKg / (heightM * heightM)).toFixed(2));
}

export function NutritionEditor({ onSave }: NutritionEditorProps) {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');

  const handleSave = () => {
    const weightNum = Number(weight);
    const heightNum = Number(height);

    if (!weightNum || !heightNum) return;

    onSave({
      type: RecordType.ANTHROPOMETRY,
      weight: weightNum,
      height: heightNum,
      imc: calculateIMC(weightNum, heightNum),
      waist: 0,
      hip: 0,
    });

    setWeight('');
    setHeight('');
  };

  const canSave = weight && height;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-genesis-medium uppercase tracking-wider">
            Peso (kg)
          </label>
          <input
            type="number"
            className="w-full p-4 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-green-100 outline-none transition-all text-sm font-bold"
            placeholder="Ex: 72.5"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-genesis-medium uppercase tracking-wider">
            Altura (cm)
          </label>
          <input
            type="number"
            className="w-full p-4 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-green-100 outline-none transition-all text-sm font-bold"
            placeholder="Ex: 175"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
          />
        </div>
      </div>

      {/* Preview do IMC */}
      {weight && height && (
        <div className="p-4 bg-green-50 border border-green-100 rounded-xl">
          <p className="text-xs font-bold text-green-700 uppercase mb-1">IMC Calculado</p>
          <p className="text-2xl font-bold text-green-800">
            {calculateIMC(Number(weight), Number(height))}
          </p>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={!canSave}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-all transform hover:-translate-y-0.5 ${
            canSave
              ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-200'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
          }`}
        >
          Salvar Dados Antropométricos
        </button>
      </div>
    </div>
  );
}
