/**
 * Liver Function Biomarkers
 * =========================
 */

import { BiomarkerDefinition } from '../types.js';

export const LIVER_BIOMARKERS: Record<string, BiomarkerDefinition> = {
  alt: {
    id: 'alt',
    name: 'ALT (TGP)',
    unit: 'U/L',
    labRange: { min: 0, max: 41 },
    functionalRange: { min: 10, max: 25 },
    criticalHigh: 200,
    category: 'liver',
    aliases: ['tgp', 'alanina aminotransferase', 'sgpt', 'alt'],
    adjustments: {
      male: { max: 45 },
      female: { max: 34 },
    },
  },

  ast: {
    id: 'ast',
    name: 'AST (TGO)',
    unit: 'U/L',
    labRange: { min: 0, max: 40 },
    functionalRange: { min: 10, max: 25 },
    criticalHigh: 200,
    category: 'liver',
    aliases: ['tgo', 'aspartato aminotransferase', 'sgot', 'ast'],
    adjustments: {
      male: { max: 40 },
      female: { max: 32 },
    },
  },

  ggt: {
    id: 'ggt',
    name: 'GGT',
    unit: 'U/L',
    labRange: { min: 0, max: 60 },
    functionalRange: { min: 10, max: 30 },
    criticalHigh: 300,
    category: 'liver',
    aliases: ['gama gt', 'gamma gt', 'gama glutamil transferase'],
    adjustments: {
      male: { max: 71 },
      female: { max: 42 },
    },
  },

  alkaline_phosphatase: {
    id: 'alkaline_phosphatase',
    name: 'Fosfatase Alcalina',
    unit: 'U/L',
    labRange: { min: 40, max: 129 },
    functionalRange: { min: 50, max: 100 },
    criticalHigh: 500,
    category: 'liver',
    aliases: ['fa', 'fosfatase alcalina', 'alp'],
  },

  bilirubin_total: {
    id: 'bilirubin_total',
    name: 'Bilirrubina Total',
    unit: 'mg/dL',
    labRange: { min: 0.2, max: 1.2 },
    functionalRange: { min: 0.3, max: 0.9 },
    criticalHigh: 5.0,
    category: 'liver',
    aliases: ['bt', 'bilirrubina total', 'total bilirubin'],
  },

  bilirubin_direct: {
    id: 'bilirubin_direct',
    name: 'Bilirrubina Direta',
    unit: 'mg/dL',
    labRange: { min: 0.0, max: 0.3 },
    functionalRange: { min: 0.0, max: 0.2 },
    criticalHigh: 2.0,
    category: 'liver',
    aliases: ['bd', 'bilirrubina direta', 'direct bilirubin'],
  },

  bilirubin_indirect: {
    id: 'bilirubin_indirect',
    name: 'Bilirrubina Indireta',
    unit: 'mg/dL',
    labRange: { min: 0.1, max: 0.9 },
    functionalRange: { min: 0.2, max: 0.7 },
    category: 'liver',
    aliases: ['bi', 'bilirrubina indireta', 'indirect bilirubin'],
  },

  albumin: {
    id: 'albumin',
    name: 'Albumina',
    unit: 'g/dL',
    labRange: { min: 3.5, max: 5.5 },
    functionalRange: { min: 4.0, max: 5.0 },
    criticalLow: 2.0,
    category: 'liver',
    aliases: ['albumina', 'alb'],
  },

  total_protein: {
    id: 'total_protein',
    name: 'Proteínas Totais',
    unit: 'g/dL',
    labRange: { min: 6.0, max: 8.0 },
    functionalRange: { min: 6.9, max: 7.4 },
    category: 'liver',
    aliases: ['proteinas totais', 'pt', 'total protein'],
  },

  globulin: {
    id: 'globulin',
    name: 'Globulina',
    unit: 'g/dL',
    labRange: { min: 2.0, max: 3.5 },
    functionalRange: { min: 2.4, max: 2.8 },
    category: 'liver',
    aliases: ['globulinas'],
  },
};
