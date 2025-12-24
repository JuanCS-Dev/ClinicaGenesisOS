/**
 * Clinical Reasoning - Biomarker Types
 *
 * Type definitions for biomarker extraction and classification.
 *
 * @module types/clinical-reasoning/biomarkers
 */

/**
 * Status classification for biomarker values.
 * Uses traffic-light system for quick visual assessment.
 */
export type BiomarkerStatus = 'critical' | 'attention' | 'normal';

/**
 * Numeric range definition for lab and functional values.
 */
export interface NumericRange {
  min: number;
  max: number;
}

/**
 * Extracted biomarker value from lab result.
 */
export interface ExtractedBiomarker {
  /** Biomarker identifier */
  id: string;
  /** Display name */
  name: string;
  /** Numeric value */
  value: number;
  /** Unit of measurement */
  unit: string;
  /** Lab reference range (as printed on exam) */
  labRange: NumericRange;
  /** Optimal functional range */
  functionalRange: NumericRange;
  /** Status classification */
  status: BiomarkerStatus;
  /** Clinical interpretation */
  interpretation: string;
  /** Distance from optimal (0 = optimal, higher = worse) */
  deviationScore?: number;
}
