/**
 * Inflammatory Biomarkers
 * =======================
 */

import { BiomarkerDefinition } from '../types.js';

export const INFLAMMATORY_BIOMARKERS: Record<string, BiomarkerDefinition> = {
  crp: {
    id: 'crp',
    name: 'PCR',
    unit: 'mg/L',
    labRange: { min: 0, max: 5.0 },
    functionalRange: { min: 0, max: 1.0 },
    criticalHigh: 50,
    category: 'inflammatory',
    aliases: ['proteina c reativa', 'pcr', 'c-reactive protein'],
  },

  crp_high_sensitivity: {
    id: 'crp_high_sensitivity',
    name: 'PCR Ultra Sensível',
    unit: 'mg/L',
    labRange: { min: 0, max: 3.0 },
    functionalRange: { min: 0, max: 0.8 },
    criticalHigh: 10,
    category: 'inflammatory',
    aliases: ['pcr us', 'pcr alta sensibilidade', 'hs-crp'],
  },

  esr: {
    id: 'esr',
    name: 'VHS',
    unit: 'mm/h',
    labRange: { min: 0, max: 20 },
    functionalRange: { min: 0, max: 10 },
    criticalHigh: 100,
    category: 'inflammatory',
    aliases: ['vhs', 'velocidade de hemossedimentacao', 'esr'],
    adjustments: {
      male: { max: 15 },
      female: { max: 20 },
    },
  },

  homocysteine: {
    id: 'homocysteine',
    name: 'Homocisteína',
    unit: 'umol/L',
    labRange: { min: 4, max: 15 },
    functionalRange: { min: 6, max: 9 },
    criticalHigh: 30,
    category: 'inflammatory',
    aliases: ['homocisteina', 'homocysteine'],
  },

  fibrinogen: {
    id: 'fibrinogen',
    name: 'Fibrinogênio',
    unit: 'mg/dL',
    labRange: { min: 200, max: 400 },
    functionalRange: { min: 200, max: 300 },
    criticalLow: 100,
    criticalHigh: 700,
    category: 'inflammatory',
    aliases: ['fibrinogenio', 'fibrinogen'],
  },
};
