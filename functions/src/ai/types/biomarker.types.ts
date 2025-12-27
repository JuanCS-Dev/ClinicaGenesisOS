/**
 * Biomarker Types
 *
 * Type definitions for biomarker values and definitions.
 * Uses traffic-light system for quick visual assessment.
 *
 * @module ai/types/biomarker
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
 * Complete biomarker definition with lab and functional ranges.
 * Functional ranges represent optimal health, not just statistical normal.
 */
export interface BiomarkerDefinition {
  /** Unique identifier (e.g., 'glucose', 'hba1c', 'tsh') */
  id: string;
  /** Display name in Portuguese */
  name: string;
  /** Measurement unit */
  unit: string;
  /** Standard laboratory reference range (95% population) */
  labRange: NumericRange;
  /** Optimal functional range (based on functional medicine research) */
  functionalRange: NumericRange;
  /** Critical low threshold - urgent alert */
  criticalLow?: number;
  /** Critical high threshold - urgent alert */
  criticalHigh?: number;
  /** Category for grouping (e.g., 'metabolic', 'thyroid', 'hematologic') */
  category: string;
  /** Common aliases for OCR matching */
  aliases?: string[];
  /** Age/sex specific adjustments */
  adjustments?: {
    male?: Partial<NumericRange>;
    female?: Partial<NumericRange>;
    pediatric?: Partial<NumericRange>;
    geriatric?: Partial<NumericRange>;
  };
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
