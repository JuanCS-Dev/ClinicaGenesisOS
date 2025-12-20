/**
 * Lab Analysis Utility Functions
 * ==============================
 *
 * Utility functions for processing lab results:
 * - Parsing and validation
 * - Status determination
 * - Interpretation generation
 * - Formatting for prompts
 */

import { FUNCTIONAL_RANGES, findBiomarker } from './biomarkers/index.js';
import { CRITICAL_THRESHOLDS } from './prompts/index.js';
import {
  ExtractedBiomarker,
  RawLabResult,
  BiomarkerStatus,
  PatientContext,
  ClinicalSpecialty,
} from './types.js';

/**
 * Parse numeric value from lab result string.
 */
export function parseNumericValue(value: string): number | null {
  const cleaned = value.replace(/[<>]/g, '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

/**
 * Determine biomarker status based on functional ranges.
 */
export function determineBiomarkerStatus(
  value: number,
  biomarkerId: string
): BiomarkerStatus {
  const definition = FUNCTIONAL_RANGES[biomarkerId];
  if (!definition) return 'normal';

  // Check critical thresholds first
  const critical = CRITICAL_THRESHOLDS[biomarkerId as keyof typeof CRITICAL_THRESHOLDS];
  if (critical) {
    if ('low' in critical && value < critical.low) return 'critical';
    if ('high' in critical && value > critical.high) return 'critical';
  }

  // Check lab range
  if (value < definition.labRange.min || value > definition.labRange.max) {
    return 'attention';
  }

  // Check functional range (optimal)
  if (value >= definition.functionalRange.min &&
      value <= definition.functionalRange.max) {
    return 'normal';
  }

  return 'attention';
}

/**
 * Calculate deviation from optimal range (0 = optimal, higher = worse).
 */
export function calculateDeviationScore(
  value: number,
  functionalRange: { min: number; max: number }
): number {
  const { min, max } = functionalRange;
  const range = max - min;

  if (value >= min && value <= max) {
    return 0; // Within optimal
  }

  if (value < min) {
    return Math.abs(value - min) / (range || 1);
  }

  return Math.abs(value - max) / (range || 1);
}

/**
 * Generate interpretation text for a biomarker.
 */
export function generateInterpretation(
  value: number,
  status: BiomarkerStatus,
  biomarkerId: string
): string {
  const definition = FUNCTIONAL_RANGES[biomarkerId];
  if (!definition) return 'Biomarcador não reconhecido';

  const funcMin = definition.functionalRange.min;
  const funcMax = definition.functionalRange.max;

  if (status === 'critical') {
    return `VALOR CRÍTICO - Ação imediata necessária`;
  }

  if (value < funcMin) {
    const deviation = ((funcMin - value) / funcMin * 100).toFixed(1);
    return `Abaixo do ótimo funcional (${funcMin}-${funcMax}). Desvio: ${deviation}%`;
  }

  if (value > funcMax) {
    const deviation = ((value - funcMax) / funcMax * 100).toFixed(1);
    return `Acima do ótimo funcional (${funcMin}-${funcMax}). Desvio: ${deviation}%`;
  }

  return `Dentro do range funcional ótimo (${funcMin}-${funcMax})`;
}

/**
 * Process raw lab results into extracted biomarkers.
 */
export function processLabResults(rawResults: RawLabResult[]): ExtractedBiomarker[] {
  const processed: ExtractedBiomarker[] = [];

  for (const raw of rawResults) {
    const numValue = parseNumericValue(raw.value);
    if (numValue === null) continue;

    const biomarker = findBiomarker(raw.name);
    if (!biomarker) {
      // Unknown biomarker - still include with basic processing
      processed.push({
        id: raw.name.toLowerCase().replace(/\s+/g, '_'),
        name: raw.name,
        value: numValue,
        unit: raw.unit || '',
        labRange: { min: 0, max: 0 },
        functionalRange: { min: 0, max: 0 },
        status: 'normal',
        interpretation: 'Biomarcador não catalogado no sistema',
      });
      continue;
    }

    const status = determineBiomarkerStatus(numValue, biomarker.id);
    const interpretation = generateInterpretation(numValue, status, biomarker.id);

    processed.push({
      id: biomarker.id,
      name: biomarker.name,
      value: numValue,
      unit: biomarker.unit,
      labRange: biomarker.labRange,
      functionalRange: biomarker.functionalRange,
      status,
      interpretation,
      deviationScore: calculateDeviationScore(numValue, biomarker.functionalRange),
    });
  }

  return processed;
}

/**
 * Detect specialty based on most abnormal markers.
 */
export function detectRelevantSpecialty(markers: ExtractedBiomarker[]): ClinicalSpecialty {
  const abnormalCategories: Record<string, number> = {};

  for (const marker of markers) {
    if (marker.status !== 'normal') {
      const biomarker = FUNCTIONAL_RANGES[marker.id];
      if (biomarker) {
        const category = biomarker.category;
        abnormalCategories[category] = (abnormalCategories[category] || 0) + 1;
      }
    }
  }

  // Map categories to specialties
  const categorySpecialty: Record<string, ClinicalSpecialty> = {
    metabolic: 'endocrinology',
    lipid: 'cardiology',
    thyroid: 'endocrinology',
    hematologic: 'hematology',
    iron: 'hematology',
    liver: 'hepatology',
    kidney: 'nephrology',
    cardiac: 'cardiology',
    hormonal: 'endocrinology',
  };

  const topCategory = Object.entries(abnormalCategories)
    .sort(([, a], [, b]) => b - a)[0]?.[0];

  return categorySpecialty[topCategory] || 'general_practice';
}

/**
 * Format markers for prompt.
 */
export function formatMarkersForPrompt(markers: ExtractedBiomarker[]): string {
  return markers.map(m => {
    const status = m.status === 'critical' ? '🔴' :
                   m.status === 'attention' ? '🟡' : '🟢';
    return `${status} ${m.name}: ${m.value} ${m.unit} (Ref: ${m.labRange.min}-${m.labRange.max})`;
  }).join('\n');
}

/**
 * Format patient context for prompt.
 */
export function formatPatientContext(ctx: PatientContext): string {
  const lines = [
    `Idade: ${ctx.age} anos`,
    `Sexo: ${ctx.sex === 'male' ? 'Masculino' : 'Feminino'}`,
  ];

  if (ctx.chiefComplaint) lines.push(`Queixa principal: ${ctx.chiefComplaint}`);
  if (ctx.relevantHistory?.length) {
    lines.push(`Histórico: ${ctx.relevantHistory.join(', ')}`);
  }
  if (ctx.currentMedications?.length) {
    lines.push(`Medicamentos: ${ctx.currentMedications.join(', ')}`);
  }

  return lines.join('\n');
}
