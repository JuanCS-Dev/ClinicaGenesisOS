/**
 * Cardiac and Bone Metabolism Biomarkers
 * =======================================
 */

import { BiomarkerDefinition } from '../types.js';

export const CARDIAC_BIOMARKERS: Record<string, BiomarkerDefinition> = {
  bnp: {
    id: 'bnp',
    name: 'BNP',
    unit: 'pg/mL',
    labRange: { min: 0, max: 100 },
    functionalRange: { min: 0, max: 50 },
    criticalHigh: 400,
    category: 'cardiac',
    aliases: ['peptideo natriuretico cerebral', 'brain natriuretic peptide'],
  },

  nt_probnp: {
    id: 'nt_probnp',
    name: 'NT-proBNP',
    unit: 'pg/mL',
    labRange: { min: 0, max: 300 },
    functionalRange: { min: 0, max: 125 },
    criticalHigh: 2000,
    category: 'cardiac',
    aliases: ['pro bnp'],
  },

  troponin_i: {
    id: 'troponin_i',
    name: 'Troponina I',
    unit: 'ng/mL',
    labRange: { min: 0, max: 0.04 },
    functionalRange: { min: 0, max: 0.01 },
    criticalHigh: 0.4,
    category: 'cardiac',
    aliases: ['troponina', 'tni', 'cardiac troponin'],
  },
};

export const BONE_BIOMARKERS: Record<string, BiomarkerDefinition> = {
  pth: {
    id: 'pth',
    name: 'PTH',
    unit: 'pg/mL',
    labRange: { min: 15, max: 65 },
    functionalRange: { min: 20, max: 45 },
    criticalHigh: 300,
    category: 'bone',
    aliases: ['paratormonio', 'parathyroid hormone'],
  },

  osteocalcin: {
    id: 'osteocalcin',
    name: 'Osteocalcina',
    unit: 'ng/mL',
    labRange: { min: 11, max: 43 },
    functionalRange: { min: 15, max: 35 },
    category: 'bone',
    aliases: ['bone gla protein', 'bgp'],
  },
};
