/**
 * Iron Metabolism Biomarkers
 * ==========================
 */

import { BiomarkerDefinition } from '../types.js';

export const IRON_BIOMARKERS: Record<string, BiomarkerDefinition> = {
  iron: {
    id: 'iron',
    name: 'Ferro Sérico',
    unit: 'ug/dL',
    labRange: { min: 60, max: 170 },
    functionalRange: { min: 85, max: 130 },
    criticalLow: 30,
    criticalHigh: 300,
    category: 'iron',
    aliases: ['ferro', 'ferro serico', 'serum iron'],
    adjustments: {
      male: { min: 65, max: 175 },
      female: { min: 50, max: 170 },
    },
  },

  ferritin: {
    id: 'ferritin',
    name: 'Ferritina',
    unit: 'ng/mL',
    labRange: { min: 12, max: 150 },
    functionalRange: { min: 50, max: 100 },
    criticalLow: 10,
    criticalHigh: 1000,
    category: 'iron',
    aliases: ['ferritina', 'ferritin'],
    adjustments: {
      male: { min: 20, max: 300 },
      female: { min: 12, max: 150 },
    },
  },

  transferrin: {
    id: 'transferrin',
    name: 'Transferrina',
    unit: 'mg/dL',
    labRange: { min: 200, max: 360 },
    functionalRange: { min: 250, max: 320 },
    category: 'iron',
    aliases: ['transferrina', 'transferrin'],
  },

  tibc: {
    id: 'tibc',
    name: 'TIBC',
    unit: 'ug/dL',
    labRange: { min: 250, max: 370 },
    functionalRange: { min: 280, max: 340 },
    category: 'iron',
    aliases: ['capacidade total de ligacao do ferro', 'total iron binding capacity'],
  },

  transferrin_saturation: {
    id: 'transferrin_saturation',
    name: 'Saturação de Transferrina',
    unit: '%',
    labRange: { min: 20, max: 50 },
    functionalRange: { min: 30, max: 40 },
    criticalLow: 10,
    criticalHigh: 80,
    category: 'iron',
    aliases: ['saturacao de transferrina', 'ist', 'iron saturation'],
  },
};
