/**
 * Metabolic Biomarkers - Glucose Metabolism
 * ==========================================
 */

import { BiomarkerDefinition } from '../types.js';

export const METABOLIC_BIOMARKERS: Record<string, BiomarkerDefinition> = {
  glucose_fasting: {
    id: 'glucose_fasting',
    name: 'Glicose de Jejum',
    unit: 'mg/dL',
    labRange: { min: 70, max: 99 },
    functionalRange: { min: 82, max: 88 },
    criticalLow: 54,
    criticalHigh: 250,
    category: 'metabolic',
    aliases: ['glicemia', 'glicose', 'glucose', 'glycemia', 'glicemia jejum'],
  },

  hba1c: {
    id: 'hba1c',
    name: 'Hemoglobina Glicada',
    unit: '%',
    labRange: { min: 4.0, max: 5.6 },
    functionalRange: { min: 4.8, max: 5.2 },
    criticalHigh: 10.0,
    category: 'metabolic',
    aliases: ['a1c', 'hemoglobina glicosilada', 'hb glicada', 'hba1c'],
  },

  insulin_fasting: {
    id: 'insulin_fasting',
    name: 'Insulina de Jejum',
    unit: 'uUI/mL',
    labRange: { min: 2.6, max: 24.9 },
    functionalRange: { min: 3.0, max: 8.0 },
    criticalHigh: 50,
    category: 'metabolic',
    aliases: ['insulina', 'insulin', 'insulinemia'],
  },

  homa_ir: {
    id: 'homa_ir',
    name: 'HOMA-IR',
    unit: '',
    labRange: { min: 0, max: 2.71 },
    functionalRange: { min: 0, max: 1.5 },
    criticalHigh: 5.0,
    category: 'metabolic',
    aliases: ['homa', 'homeostasis model assessment'],
  },

  homa_beta: {
    id: 'homa_beta',
    name: 'HOMA-Beta',
    unit: '%',
    labRange: { min: 27.7, max: 335.7 },
    functionalRange: { min: 100, max: 200 },
    category: 'metabolic',
    aliases: ['homa b', 'homa beta'],
  },

  fructosamine: {
    id: 'fructosamine',
    name: 'Frutosamina',
    unit: 'umol/L',
    labRange: { min: 205, max: 285 },
    functionalRange: { min: 210, max: 250 },
    category: 'metabolic',
    aliases: ['fructosamine', 'glycated albumin'],
  },
};
