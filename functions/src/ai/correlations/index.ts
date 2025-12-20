/**
 * Clinical Correlations Index
 * ===========================
 *
 * Central export for all pattern detection functions.
 */

import { ClinicalCorrelation, ExtractedBiomarker } from '../types.js';
import { checkMetabolicPatterns } from './metabolic-patterns.js';
import { checkHematologicPatterns } from './hematologic-patterns.js';
import { checkThyroidPatterns } from './thyroid-patterns.js';
import { checkLiverPatterns } from './liver-patterns.js';
import { checkKidneyPatterns } from './kidney-patterns.js';
import { checkInflammatoryPatterns } from './inflammatory-patterns.js';

/**
 * Context for pattern detection (optional clinical data).
 */
export interface PatternContext {
  waistCircumference?: number;
  bloodPressure?: { systolic: number; diastolic: number };
  baselineCreatinine?: number;
}

/**
 * Run all pattern detection across all categories.
 *
 * @param markers - Extracted biomarker values
 * @param context - Optional clinical context
 * @returns Array of identified clinical correlations
 */
export function detectAllPatterns(
  markers: ExtractedBiomarker[],
  context?: PatternContext
): ClinicalCorrelation[] {
  const allCorrelations: ClinicalCorrelation[] = [];

  // Run all pattern checks
  allCorrelations.push(...checkMetabolicPatterns(markers, context));
  allCorrelations.push(...checkHematologicPatterns(markers));
  allCorrelations.push(...checkThyroidPatterns(markers));
  allCorrelations.push(...checkLiverPatterns(markers));
  allCorrelations.push(...checkKidneyPatterns(markers, context));
  allCorrelations.push(...checkInflammatoryPatterns(markers));

  // Sort by confidence (high > medium > low)
  const confidenceOrder = { high: 0, medium: 1, low: 2 };
  allCorrelations.sort((a, b) =>
    confidenceOrder[a.confidence] - confidenceOrder[b.confidence]
  );

  return allCorrelations;
}

/**
 * Get correlations for specific pattern types.
 */
export function filterCorrelationsByType(
  correlations: ClinicalCorrelation[],
  types: string[]
): ClinicalCorrelation[] {
  return correlations.filter(c => types.includes(c.type));
}

/**
 * Get high-confidence correlations only.
 */
export function getHighConfidenceCorrelations(
  correlations: ClinicalCorrelation[]
): ClinicalCorrelation[] {
  return correlations.filter(c => c.confidence === 'high');
}

// Re-export individual pattern checkers
export { checkMetabolicPatterns } from './metabolic-patterns.js';
export { checkHematologicPatterns } from './hematologic-patterns.js';
export { checkThyroidPatterns } from './thyroid-patterns.js';
export { checkLiverPatterns } from './liver-patterns.js';
export { checkKidneyPatterns } from './kidney-patterns.js';
export { checkInflammatoryPatterns } from './inflammatory-patterns.js';
