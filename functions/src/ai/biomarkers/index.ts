/**
 * Biomarkers Index
 * ================
 *
 * Central export for all biomarker definitions and utility functions.
 * Total: 80+ biomarkers across 13 categories.
 */

import { BiomarkerDefinition } from '../types.js';
import { METABOLIC_BIOMARKERS } from './metabolic.js';
import { LIPID_BIOMARKERS } from './lipid.js';
import { THYROID_BIOMARKERS } from './thyroid.js';
import { HEMATOLOGIC_BIOMARKERS } from './hematologic.js';
import { IRON_BIOMARKERS } from './iron.js';
import { LIVER_BIOMARKERS } from './liver.js';
import { KIDNEY_BIOMARKERS } from './kidney.js';
import { ELECTROLYTE_BIOMARKERS } from './electrolytes.js';
import { INFLAMMATORY_BIOMARKERS } from './inflammatory.js';
import { VITAMIN_BIOMARKERS } from './vitamins.js';
import { HORMONAL_BIOMARKERS } from './hormonal.js';
import { CARDIAC_BIOMARKERS, BONE_BIOMARKERS } from './cardiac.js';

/**
 * Biomarker category groupings with display names.
 */
export const BIOMARKER_CATEGORIES = {
  metabolic: 'Metabolismo Glicídico',
  lipid: 'Perfil Lipídico',
  thyroid: 'Função Tireoideana',
  hematologic: 'Hemograma',
  iron: 'Metabolismo do Ferro',
  liver: 'Função Hepática',
  kidney: 'Função Renal',
  electrolytes: 'Eletrólitos',
  inflammatory: 'Marcadores Inflamatórios',
  vitamins: 'Vitaminas',
  hormonal: 'Hormônios',
  cardiac: 'Marcadores Cardíacos',
  bone: 'Metabolismo Ósseo',
} as const;

/**
 * Complete functional ranges database.
 * Key is the biomarker ID, value is the full definition.
 */
export const FUNCTIONAL_RANGES: Record<string, BiomarkerDefinition> = {
  ...METABOLIC_BIOMARKERS,
  ...LIPID_BIOMARKERS,
  ...THYROID_BIOMARKERS,
  ...HEMATOLOGIC_BIOMARKERS,
  ...IRON_BIOMARKERS,
  ...LIVER_BIOMARKERS,
  ...KIDNEY_BIOMARKERS,
  ...ELECTROLYTE_BIOMARKERS,
  ...INFLAMMATORY_BIOMARKERS,
  ...VITAMIN_BIOMARKERS,
  ...HORMONAL_BIOMARKERS,
  ...CARDIAC_BIOMARKERS,
  ...BONE_BIOMARKERS,
};

/**
 * Get biomarker definition by ID or alias.
 *
 * @param nameOrAlias - Biomarker name or alias to search
 * @returns BiomarkerDefinition or undefined if not found
 */
export function findBiomarker(nameOrAlias: string): BiomarkerDefinition | undefined {
  const normalized = nameOrAlias.toLowerCase().trim();

  // Direct ID match
  if (FUNCTIONAL_RANGES[normalized]) {
    return FUNCTIONAL_RANGES[normalized];
  }

  // Search by alias
  for (const biomarker of Object.values(FUNCTIONAL_RANGES)) {
    if (biomarker.aliases?.some(alias => alias.toLowerCase() === normalized)) {
      return biomarker;
    }
  }

  // Partial match (for OCR where names may be slightly different)
  for (const biomarker of Object.values(FUNCTIONAL_RANGES)) {
    if (biomarker.name.toLowerCase().includes(normalized) ||
        normalized.includes(biomarker.name.toLowerCase())) {
      return biomarker;
    }
    if (biomarker.aliases?.some(alias =>
      alias.toLowerCase().includes(normalized) ||
      normalized.includes(alias.toLowerCase())
    )) {
      return biomarker;
    }
  }

  return undefined;
}

/**
 * Get biomarkers by category.
 *
 * @param category - Category to filter by
 * @returns Array of biomarker definitions
 */
export function getBiomarkersByCategory(category: string): BiomarkerDefinition[] {
  return Object.values(FUNCTIONAL_RANGES).filter(b => b.category === category);
}

/**
 * Get all biomarker categories.
 *
 * @returns Array of category keys
 */
export function getAllCategories(): string[] {
  return Object.keys(BIOMARKER_CATEGORIES);
}

/**
 * Total count of biomarkers in database.
 */
export const BIOMARKER_COUNT = Object.keys(FUNCTIONAL_RANGES).length;

// Re-export category-specific biomarkers for granular imports
export {
  METABOLIC_BIOMARKERS,
  LIPID_BIOMARKERS,
  THYROID_BIOMARKERS,
  HEMATOLOGIC_BIOMARKERS,
  IRON_BIOMARKERS,
  LIVER_BIOMARKERS,
  KIDNEY_BIOMARKERS,
  ELECTROLYTE_BIOMARKERS,
  INFLAMMATORY_BIOMARKERS,
  VITAMIN_BIOMARKERS,
  HORMONAL_BIOMARKERS,
  CARDIAC_BIOMARKERS,
  BONE_BIOMARKERS,
};
