/**
 * Kidney Function Biomarkers
 * ==========================
 */

import { BiomarkerDefinition } from '../types.js';

export const KIDNEY_BIOMARKERS: Record<string, BiomarkerDefinition> = {
  creatinine: {
    id: 'creatinine',
    name: 'Creatinina',
    unit: 'mg/dL',
    labRange: { min: 0.6, max: 1.2 },
    functionalRange: { min: 0.8, max: 1.1 },
    criticalHigh: 5.0,
    category: 'kidney',
    aliases: ['creatinina', 'cr'],
    adjustments: {
      male: { min: 0.7, max: 1.3 },
      female: { min: 0.5, max: 1.1 },
    },
  },

  urea: {
    id: 'urea',
    name: 'Ureia',
    unit: 'mg/dL',
    labRange: { min: 15, max: 45 },
    functionalRange: { min: 15, max: 25 },
    criticalHigh: 100,
    category: 'kidney',
    aliases: ['ureia', 'urea'],
  },

  bun: {
    id: 'bun',
    name: 'BUN',
    unit: 'mg/dL',
    labRange: { min: 7, max: 20 },
    functionalRange: { min: 10, max: 16 },
    criticalHigh: 50,
    category: 'kidney',
    aliases: ['nitrogenio ureico', 'blood urea nitrogen'],
  },

  gfr: {
    id: 'gfr',
    name: 'Taxa de Filtração Glomerular',
    unit: 'mL/min/1.73m²',
    labRange: { min: 60, max: 999 },
    functionalRange: { min: 90, max: 120 },
    criticalLow: 15,
    category: 'kidney',
    aliases: ['tfg', 'gfr', 'clearance de creatinina', 'egfr'],
  },

  uric_acid: {
    id: 'uric_acid',
    name: 'Ácido Úrico',
    unit: 'mg/dL',
    labRange: { min: 2.5, max: 7.0 },
    functionalRange: { min: 3.0, max: 5.5 },
    criticalHigh: 12,
    category: 'kidney',
    aliases: ['acido urico', 'urato', 'uric acid'],
    adjustments: {
      male: { min: 3.5, max: 7.2 },
      female: { min: 2.5, max: 6.0 },
    },
  },

  microalbumin: {
    id: 'microalbumin',
    name: 'Microalbuminúria',
    unit: 'mg/L',
    labRange: { min: 0, max: 30 },
    functionalRange: { min: 0, max: 20 },
    criticalHigh: 300,
    category: 'kidney',
    aliases: ['microalbuminuria', 'albumina urinaria', 'urine albumin'],
  },
};
