/**
 * Electrolyte Biomarkers
 * ======================
 */

import { BiomarkerDefinition } from '../types.js';

export const ELECTROLYTE_BIOMARKERS: Record<string, BiomarkerDefinition> = {
  sodium: {
    id: 'sodium',
    name: 'Sódio',
    unit: 'mEq/L',
    labRange: { min: 136, max: 145 },
    functionalRange: { min: 139, max: 143 },
    criticalLow: 120,
    criticalHigh: 160,
    category: 'electrolytes',
    aliases: ['sodio', 'na', 'sodium'],
  },

  potassium: {
    id: 'potassium',
    name: 'Potássio',
    unit: 'mEq/L',
    labRange: { min: 3.5, max: 5.0 },
    functionalRange: { min: 4.0, max: 4.5 },
    criticalLow: 2.5,
    criticalHigh: 6.5,
    category: 'electrolytes',
    aliases: ['potassio', 'k', 'potassium'],
  },

  chloride: {
    id: 'chloride',
    name: 'Cloreto',
    unit: 'mEq/L',
    labRange: { min: 98, max: 106 },
    functionalRange: { min: 100, max: 104 },
    criticalLow: 85,
    criticalHigh: 120,
    category: 'electrolytes',
    aliases: ['cloro', 'cl', 'chloride'],
  },

  magnesium: {
    id: 'magnesium',
    name: 'Magnésio',
    unit: 'mg/dL',
    labRange: { min: 1.7, max: 2.3 },
    functionalRange: { min: 2.0, max: 2.5 },
    criticalLow: 1.0,
    criticalHigh: 4.0,
    category: 'electrolytes',
    aliases: ['magnesio', 'mg', 'magnesium'],
  },

  calcium: {
    id: 'calcium',
    name: 'Cálcio Total',
    unit: 'mg/dL',
    labRange: { min: 8.5, max: 10.5 },
    functionalRange: { min: 9.2, max: 10.0 },
    criticalLow: 6.0,
    criticalHigh: 14.0,
    category: 'electrolytes',
    aliases: ['calcio', 'ca', 'calcium'],
  },

  calcium_ionized: {
    id: 'calcium_ionized',
    name: 'Cálcio Iônico',
    unit: 'mmol/L',
    labRange: { min: 1.15, max: 1.35 },
    functionalRange: { min: 1.20, max: 1.30 },
    criticalLow: 0.8,
    criticalHigh: 1.6,
    category: 'electrolytes',
    aliases: ['calcio ionico', 'ca ionizado', 'ionized calcium'],
  },

  phosphorus: {
    id: 'phosphorus',
    name: 'Fósforo',
    unit: 'mg/dL',
    labRange: { min: 2.5, max: 4.5 },
    functionalRange: { min: 3.0, max: 4.0 },
    criticalLow: 1.0,
    criticalHigh: 8.0,
    category: 'electrolytes',
    aliases: ['fosforo', 'p', 'phosphorus'],
  },
};
