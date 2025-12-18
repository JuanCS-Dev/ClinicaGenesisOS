/**
 * Nutrition Editor - Avaliação Nutricional
 * =========================================
 *
 * Editor para registro de dados antropométricos seguindo
 * práticas recomendadas (CFN Resolução 594/2017):
 * - Peso e altura com cálculo automático de IMC
 * - Circunferências (cintura, quadril) com RCQ
 * - Classificação de risco por IMC e RCQ
 *
 * Referências:
 * - OMS: Classificação de IMC
 * - ABESO: Diretrizes brasileiras de obesidade
 *
 * @module plugins/nutricao/NutritionEditor
 */

import { useState } from 'react';
import { Scale, Ruler, Activity } from 'lucide-react';
import { RecordType, EditorRecordData } from '../../types';

interface NutritionEditorProps {
  onSave: (data: EditorRecordData) => void;
}

/**
 * Calculate BMI (IMC) from weight and height.
 */
function calculateIMC(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return parseFloat((weightKg / (heightM * heightM)).toFixed(2));
}

/**
 * Get IMC classification based on WHO standards.
 */
function getIMCClassification(imc: number): { label: string; color: string; risk: string } {
  if (imc < 18.5) return { label: 'Baixo peso', color: 'text-blue-600', risk: 'Moderado' };
  if (imc < 25) return { label: 'Eutrófico', color: 'text-green-600', risk: 'Baixo' };
  if (imc < 30) return { label: 'Sobrepeso', color: 'text-yellow-600', risk: 'Aumentado' };
  if (imc < 35) return { label: 'Obesidade I', color: 'text-orange-600', risk: 'Moderado' };
  if (imc < 40) return { label: 'Obesidade II', color: 'text-red-500', risk: 'Grave' };
  return { label: 'Obesidade III', color: 'text-red-700', risk: 'Muito grave' };
}

/**
 * Calculate waist-to-hip ratio (RCQ).
 */
function calculateRCQ(waist: number, hip: number): number | null {
  if (!waist || !hip) return null;
  return parseFloat((waist / hip).toFixed(2));
}

/**
 * Get RCQ risk classification.
 */
function getRCQRisk(rcq: number, isMale: boolean): { label: string; color: string } {
  const threshold = isMale ? 0.95 : 0.85;
  if (rcq < threshold) return { label: 'Normal', color: 'text-green-600' };
  return { label: 'Risco cardiovascular elevado', color: 'text-red-600' };
}

export function NutritionEditor({ onSave }: NutritionEditorProps) {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [waist, setWaist] = useState('');
  const [hip, setHip] = useState('');
  const [showCircumferences, setShowCircumferences] = useState(false);

  const handleSave = () => {
    const weightNum = Number(weight);
    const heightNum = Number(height);
    const waistNum = Number(waist) || 0;
    const hipNum = Number(hip) || 0;

    if (!weightNum || !heightNum) return;

    onSave({
      type: RecordType.ANTHROPOMETRY,
      weight: weightNum,
      height: heightNum,
      imc: calculateIMC(weightNum, heightNum),
      waist: waistNum,
      hip: hipNum,
    });

    setWeight('');
    setHeight('');
    setWaist('');
    setHip('');
    setShowCircumferences(false);
  };

  const canSave = weight && height;
  const imc = weight && height ? calculateIMC(Number(weight), Number(height)) : null;
  const imcClass = imc ? getIMCClassification(imc) : null;
  const rcq = calculateRCQ(Number(waist), Number(hip));
  const rcqRisk = rcq ? getRCQRisk(rcq, true) : null; // TODO: Get gender from patient

  return (
    <div className="space-y-6">
      {/* Medidas básicas */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-genesis-medium uppercase tracking-wider flex items-center gap-2">
          <Scale className="w-3.5 h-3.5" />
          Medidas Básicas
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-500 uppercase">Peso (kg)</span>
            <input
              type="number"
              step="0.1"
              className="w-full p-4 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-green-100 outline-none transition-all text-sm font-bold"
              placeholder="Ex: 72.5"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-gray-500 uppercase">Altura (cm)</span>
            <input
              type="number"
              className="w-full p-4 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-green-100 outline-none transition-all text-sm font-bold"
              placeholder="Ex: 175"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Preview do IMC com classificação */}
      {imc && imcClass && (
        <div className="p-4 bg-green-50 border border-green-100 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-green-700 uppercase mb-1">IMC Calculado</p>
              <p className="text-3xl font-bold text-green-800">{imc}</p>
            </div>
            <div className="text-right">
              <p className={`text-sm font-bold ${imcClass.color}`}>{imcClass.label}</p>
              <p className="text-[10px] text-gray-500">Risco: {imcClass.risk}</p>
            </div>
          </div>
        </div>
      )}

      {/* Toggle para circunferências */}
      <div className="border-t border-gray-100 pt-4">
        <button
          type="button"
          onClick={() => setShowCircumferences(!showCircumferences)}
          className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-colors ${
            showCircumferences ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <Ruler className="w-3.5 h-3.5" />
          {showCircumferences ? 'Ocultar' : 'Adicionar'} Circunferências
        </button>
      </div>

      {/* Circunferências */}
      {showCircumferences && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="space-y-2">
            <label className="text-xs font-bold text-green-600 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-3.5 h-3.5" />
              Circunferências (cm)
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[10px] text-gray-500 uppercase">Cintura</span>
                <input
                  type="number"
                  step="0.1"
                  className="w-full p-4 bg-green-50 border border-green-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-200 outline-none transition-all text-sm font-bold"
                  placeholder="Ex: 82"
                  value={waist}
                  onChange={(e) => setWaist(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-gray-500 uppercase">Quadril</span>
                <input
                  type="number"
                  step="0.1"
                  className="w-full p-4 bg-green-50 border border-green-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-200 outline-none transition-all text-sm font-bold"
                  placeholder="Ex: 98"
                  value={hip}
                  onChange={(e) => setHip(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* RCQ calculado */}
          {rcq && rcqRisk && (
            <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase">Relação Cintura/Quadril</p>
                  <p className="text-xl font-bold text-gray-800">{rcq}</p>
                </div>
                <p className={`text-xs font-bold ${rcqRisk.color}`}>{rcqRisk.label}</p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end pt-2">
        <button
          onClick={handleSave}
          disabled={!canSave}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-all transform hover:-translate-y-0.5 ${
            canSave
              ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-200'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
          }`}
        >
          Salvar Avaliação Antropométrica
        </button>
      </div>
    </div>
  );
}
