/**
 * Hormonal Biomarkers
 * ===================
 */

import { BiomarkerDefinition } from '../types.js';

export const HORMONAL_BIOMARKERS: Record<string, BiomarkerDefinition> = {
  cortisol_am: {
    id: 'cortisol_am',
    name: 'Cortisol Matinal',
    unit: 'ug/dL',
    labRange: { min: 6.0, max: 23.0 },
    functionalRange: { min: 10, max: 18 },
    criticalLow: 3.0,
    criticalHigh: 35,
    category: 'hormonal',
    aliases: ['cortisol manha', 'cortisol 8h', 'morning cortisol'],
  },

  dhea_s: {
    id: 'dhea_s',
    name: 'DHEA-S',
    unit: 'ug/dL',
    labRange: { min: 35, max: 430 },
    functionalRange: { min: 150, max: 350 },
    category: 'hormonal',
    aliases: ['dheas', 'sulfato de dehidroepiandrosterona'],
    adjustments: {
      male: { min: 80, max: 560 },
      female: { min: 35, max: 430 },
    },
  },

  testosterone_total: {
    id: 'testosterone_total',
    name: 'Testosterona Total',
    unit: 'ng/dL',
    labRange: { min: 270, max: 1070 },
    functionalRange: { min: 500, max: 800 },
    criticalLow: 200,
    category: 'hormonal',
    aliases: ['testosterona', 'testosterone'],
    adjustments: {
      male: { min: 270, max: 1070 },
      female: { min: 8, max: 60 },
    },
  },

  estradiol: {
    id: 'estradiol',
    name: 'Estradiol',
    unit: 'pg/mL',
    labRange: { min: 20, max: 300 },
    functionalRange: { min: 50, max: 150 },
    category: 'hormonal',
    aliases: ['e2', 'estrogenio'],
    adjustments: {
      male: { min: 10, max: 50 },
      female: { min: 20, max: 350 },
    },
  },

  progesterone: {
    id: 'progesterone',
    name: 'Progesterona',
    unit: 'ng/mL',
    labRange: { min: 0.2, max: 25 },
    functionalRange: { min: 10, max: 20 },
    category: 'hormonal',
    aliases: ['p4', 'progesterone'],
  },

  prolactin: {
    id: 'prolactin',
    name: 'Prolactina',
    unit: 'ng/mL',
    labRange: { min: 2.0, max: 25.0 },
    functionalRange: { min: 5, max: 15 },
    criticalHigh: 100,
    category: 'hormonal',
    aliases: ['prl'],
    adjustments: {
      male: { min: 2.0, max: 18.0 },
      female: { min: 2.0, max: 25.0 },
    },
  },
};
