/**
 * Lipid Profile Biomarkers
 * ========================
 */

import { BiomarkerDefinition } from '../types.js';

export const LIPID_BIOMARKERS: Record<string, BiomarkerDefinition> = {
  cholesterol_total: {
    id: 'cholesterol_total',
    name: 'Colesterol Total',
    unit: 'mg/dL',
    labRange: { min: 0, max: 200 },
    functionalRange: { min: 150, max: 200 },
    criticalHigh: 300,
    category: 'lipid',
    aliases: ['colesterol', 'ct', 'total cholesterol'],
  },

  hdl: {
    id: 'hdl',
    name: 'HDL Colesterol',
    unit: 'mg/dL',
    labRange: { min: 40, max: 999 },
    functionalRange: { min: 60, max: 90 },
    criticalLow: 30,
    category: 'lipid',
    aliases: ['hdl-c', 'hdl colesterol', 'bom colesterol'],
    adjustments: {
      male: { min: 40 },
      female: { min: 50 },
    },
  },

  ldl: {
    id: 'ldl',
    name: 'LDL Colesterol',
    unit: 'mg/dL',
    labRange: { min: 0, max: 130 },
    functionalRange: { min: 0, max: 100 },
    criticalHigh: 190,
    category: 'lipid',
    aliases: ['ldl-c', 'ldl colesterol', 'mau colesterol'],
  },

  vldl: {
    id: 'vldl',
    name: 'VLDL Colesterol',
    unit: 'mg/dL',
    labRange: { min: 0, max: 40 },
    functionalRange: { min: 0, max: 20 },
    category: 'lipid',
    aliases: ['vldl-c'],
  },

  triglycerides: {
    id: 'triglycerides',
    name: 'Triglicerídeos',
    unit: 'mg/dL',
    labRange: { min: 0, max: 150 },
    functionalRange: { min: 0, max: 100 },
    criticalHigh: 500,
    category: 'lipid',
    aliases: ['triglicerideos', 'tg', 'triglycerides', 'triglicérides'],
  },

  non_hdl_cholesterol: {
    id: 'non_hdl_cholesterol',
    name: 'Colesterol Não-HDL',
    unit: 'mg/dL',
    labRange: { min: 0, max: 160 },
    functionalRange: { min: 0, max: 130 },
    category: 'lipid',
    aliases: ['colesterol nao hdl', 'non hdl'],
  },

  apolipoprotein_b: {
    id: 'apolipoprotein_b',
    name: 'Apolipoproteína B',
    unit: 'mg/dL',
    labRange: { min: 55, max: 140 },
    functionalRange: { min: 55, max: 90 },
    criticalHigh: 180,
    category: 'lipid',
    aliases: ['apo b', 'apob', 'apolipoprotein b'],
  },

  lp_a: {
    id: 'lp_a',
    name: 'Lipoproteína(a)',
    unit: 'nmol/L',
    labRange: { min: 0, max: 75 },
    functionalRange: { min: 0, max: 50 },
    criticalHigh: 125,
    category: 'lipid',
    aliases: ['lpa', 'lipoprotein a', 'lipoproteina a'],
  },
};
