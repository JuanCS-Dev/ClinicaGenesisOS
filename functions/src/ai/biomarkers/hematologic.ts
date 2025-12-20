/**
 * Hematologic Biomarkers - Complete Blood Count
 * ==============================================
 */

import { BiomarkerDefinition } from '../types.js';

export const HEMATOLOGIC_BIOMARKERS: Record<string, BiomarkerDefinition> = {
  hemoglobin: {
    id: 'hemoglobin',
    name: 'Hemoglobina',
    unit: 'g/dL',
    labRange: { min: 12.0, max: 16.0 },
    functionalRange: { min: 13.5, max: 14.5 },
    criticalLow: 7.0,
    criticalHigh: 20.0,
    category: 'hematologic',
    aliases: ['hb', 'hgb', 'hemoglobina'],
    adjustments: {
      male: { min: 13.5, max: 17.5 },
      female: { min: 12.0, max: 16.0 },
    },
  },

  hematocrit: {
    id: 'hematocrit',
    name: 'Hematócrito',
    unit: '%',
    labRange: { min: 36, max: 48 },
    functionalRange: { min: 40, max: 45 },
    criticalLow: 25,
    criticalHigh: 60,
    category: 'hematologic',
    aliases: ['ht', 'hct', 'hematocrito'],
    adjustments: {
      male: { min: 40, max: 54 },
      female: { min: 36, max: 48 },
    },
  },

  rbc: {
    id: 'rbc',
    name: 'Hemácias',
    unit: 'milhões/mm³',
    labRange: { min: 4.0, max: 5.5 },
    functionalRange: { min: 4.5, max: 5.0 },
    criticalLow: 2.5,
    criticalHigh: 7.0,
    category: 'hematologic',
    aliases: ['eritrocitos', 'globulos vermelhos', 'red blood cells'],
    adjustments: {
      male: { min: 4.5, max: 6.0 },
      female: { min: 4.0, max: 5.5 },
    },
  },

  mcv: {
    id: 'mcv',
    name: 'VCM',
    unit: 'fL',
    labRange: { min: 80, max: 100 },
    functionalRange: { min: 85, max: 92 },
    criticalLow: 60,
    criticalHigh: 120,
    category: 'hematologic',
    aliases: ['vcm', 'volume corpuscular medio', 'mean corpuscular volume'],
  },

  mch: {
    id: 'mch',
    name: 'HCM',
    unit: 'pg',
    labRange: { min: 27, max: 33 },
    functionalRange: { min: 28, max: 32 },
    category: 'hematologic',
    aliases: ['hcm', 'hemoglobina corpuscular media', 'mean corpuscular hemoglobin'],
  },

  mchc: {
    id: 'mchc',
    name: 'CHCM',
    unit: 'g/dL',
    labRange: { min: 32, max: 36 },
    functionalRange: { min: 33, max: 35 },
    category: 'hematologic',
    aliases: ['chcm', 'concentracao hemoglobina corpuscular media'],
  },

  rdw: {
    id: 'rdw',
    name: 'RDW',
    unit: '%',
    labRange: { min: 11.5, max: 14.5 },
    functionalRange: { min: 11.5, max: 13.0 },
    criticalHigh: 20,
    category: 'hematologic',
    aliases: ['amplitude distribuicao eritrocitaria', 'red cell distribution width'],
  },

  wbc: {
    id: 'wbc',
    name: 'Leucócitos',
    unit: '/mm³',
    labRange: { min: 4000, max: 11000 },
    functionalRange: { min: 5000, max: 8000 },
    criticalLow: 2000,
    criticalHigh: 30000,
    category: 'hematologic',
    aliases: ['leucocitos', 'globulos brancos', 'white blood cells'],
  },

  neutrophils: {
    id: 'neutrophils',
    name: 'Neutrófilos',
    unit: '%',
    labRange: { min: 40, max: 70 },
    functionalRange: { min: 50, max: 60 },
    category: 'hematologic',
    aliases: ['neutrofilos', 'segmentados'],
  },

  lymphocytes: {
    id: 'lymphocytes',
    name: 'Linfócitos',
    unit: '%',
    labRange: { min: 20, max: 40 },
    functionalRange: { min: 25, max: 35 },
    category: 'hematologic',
    aliases: ['linfocitos'],
  },

  monocytes: {
    id: 'monocytes',
    name: 'Monócitos',
    unit: '%',
    labRange: { min: 2, max: 8 },
    functionalRange: { min: 3, max: 6 },
    category: 'hematologic',
    aliases: ['monocitos'],
  },

  eosinophils: {
    id: 'eosinophils',
    name: 'Eosinófilos',
    unit: '%',
    labRange: { min: 1, max: 4 },
    functionalRange: { min: 1, max: 3 },
    criticalHigh: 15,
    category: 'hematologic',
    aliases: ['eosinofilos'],
  },

  basophils: {
    id: 'basophils',
    name: 'Basófilos',
    unit: '%',
    labRange: { min: 0, max: 1 },
    functionalRange: { min: 0, max: 0.5 },
    category: 'hematologic',
    aliases: ['basofilos'],
  },

  platelets: {
    id: 'platelets',
    name: 'Plaquetas',
    unit: '/mm³',
    labRange: { min: 150000, max: 400000 },
    functionalRange: { min: 200000, max: 300000 },
    criticalLow: 50000,
    criticalHigh: 1000000,
    category: 'hematologic',
    aliases: ['plaquetas', 'trombocitos', 'platelets'],
  },

  mpv: {
    id: 'mpv',
    name: 'VPM',
    unit: 'fL',
    labRange: { min: 7.5, max: 11.5 },
    functionalRange: { min: 8.0, max: 10.0 },
    category: 'hematologic',
    aliases: ['vpm', 'volume plaquetario medio', 'mean platelet volume'],
  },
};
