/**
 * Clinical Reasoning - UI Helper Types
 *
 * Type definitions for UI components and views.
 *
 * @module types/clinical-reasoning/ui
 */

import type { ExtractedBiomarker, BiomarkerStatus } from './biomarkers';

/**
 * Display configuration for a biomarker card.
 */
export interface BiomarkerCardConfig {
  marker: ExtractedBiomarker;
  showFunctionalRange: boolean;
  showInterpretation: boolean;
  showDeviation: boolean;
}

/**
 * Filter options for lab results view.
 */
export interface LabResultsFilter {
  status?: BiomarkerStatus | 'all';
  category?: string | 'all';
  searchTerm?: string;
}

/**
 * View mode for lab analysis results.
 */
export type LabResultsViewMode = 'summary' | 'detailed' | 'clinical';

/**
 * Tab options for clinical analysis panel.
 */
export type ClinicalAnalysisTab =
  | 'overview'
  | 'biomarkers'
  | 'correlations'
  | 'differential'
  | 'suggestions';
