/**
 * Thyroid Function Biomarkers
 * ===========================
 */

import { BiomarkerDefinition } from '../types.js';

export const THYROID_BIOMARKERS: Record<string, BiomarkerDefinition> = {
  tsh: {
    id: 'tsh',
    name: 'TSH',
    unit: 'mUI/L',
    labRange: { min: 0.4, max: 4.0 },
    functionalRange: { min: 1.0, max: 2.5 },
    criticalLow: 0.01,
    criticalHigh: 10.0,
    category: 'thyroid',
    aliases: ['tireotrofina', 'hormonio tireoestimulante'],
  },

  t4_free: {
    id: 't4_free',
    name: 'T4 Livre',
    unit: 'ng/dL',
    labRange: { min: 0.8, max: 1.8 },
    functionalRange: { min: 1.0, max: 1.5 },
    criticalLow: 0.4,
    criticalHigh: 3.0,
    category: 'thyroid',
    aliases: ['t4l', 't4 livre', 'tiroxina livre', 'free t4'],
  },

  t3_free: {
    id: 't3_free',
    name: 'T3 Livre',
    unit: 'pg/mL',
    labRange: { min: 2.0, max: 4.4 },
    functionalRange: { min: 3.0, max: 3.8 },
    criticalLow: 1.0,
    criticalHigh: 6.0,
    category: 'thyroid',
    aliases: ['t3l', 't3 livre', 'triiodotironina livre', 'free t3'],
  },

  t4_total: {
    id: 't4_total',
    name: 'T4 Total',
    unit: 'ug/dL',
    labRange: { min: 4.5, max: 12.0 },
    functionalRange: { min: 6.0, max: 10.0 },
    category: 'thyroid',
    aliases: ['t4 total', 'tiroxina total'],
  },

  t3_total: {
    id: 't3_total',
    name: 'T3 Total',
    unit: 'ng/dL',
    labRange: { min: 80, max: 200 },
    functionalRange: { min: 100, max: 150 },
    category: 'thyroid',
    aliases: ['t3 total', 'triiodotironina total'],
  },

  reverse_t3: {
    id: 'reverse_t3',
    name: 'T3 Reverso',
    unit: 'ng/dL',
    labRange: { min: 9.2, max: 24.1 },
    functionalRange: { min: 11, max: 18 },
    category: 'thyroid',
    aliases: ['rt3', 't3 reverso', 'reverse t3'],
  },

  anti_tpo: {
    id: 'anti_tpo',
    name: 'Anti-TPO',
    unit: 'UI/mL',
    labRange: { min: 0, max: 35 },
    functionalRange: { min: 0, max: 15 },
    criticalHigh: 100,
    category: 'thyroid',
    aliases: ['anticorpo anti-tireoperoxidase', 'tpo', 'anti tpo'],
  },

  anti_tg: {
    id: 'anti_tg',
    name: 'Anti-Tireoglobulina',
    unit: 'UI/mL',
    labRange: { min: 0, max: 115 },
    functionalRange: { min: 0, max: 50 },
    category: 'thyroid',
    aliases: ['anticorpo anti-tireoglobulina', 'anti tg', 'tgab'],
  },
};
