/**
 * Vitamin Biomarkers
 * ==================
 */

import { BiomarkerDefinition } from '../types.js';

export const VITAMIN_BIOMARKERS: Record<string, BiomarkerDefinition> = {
  vitamin_d: {
    id: 'vitamin_d',
    name: 'Vitamina D (25-OH)',
    unit: 'ng/mL',
    labRange: { min: 30, max: 100 },
    functionalRange: { min: 50, max: 80 },
    criticalLow: 10,
    criticalHigh: 150,
    category: 'vitamins',
    aliases: ['vit d', '25-oh vitamina d', '25-hidroxivitamina d', 'calcidiol'],
  },

  vitamin_b12: {
    id: 'vitamin_b12',
    name: 'Vitamina B12',
    unit: 'pg/mL',
    labRange: { min: 200, max: 900 },
    functionalRange: { min: 500, max: 800 },
    criticalLow: 150,
    category: 'vitamins',
    aliases: ['vit b12', 'cobalamina', 'cianocobalamina'],
  },

  folate: {
    id: 'folate',
    name: 'Ácido Fólico',
    unit: 'ng/mL',
    labRange: { min: 3.0, max: 17.0 },
    functionalRange: { min: 10, max: 15 },
    criticalLow: 2.0,
    category: 'vitamins',
    aliases: ['folato', 'acido folico', 'folic acid', 'vitamina b9'],
  },
};
