/**
 * Correlation Types
 *
 * Type definitions for clinical correlations between biomarkers.
 *
 * @module ai/types/correlation
 */

/**
 * Confidence level for clinical correlations.
 */
export type ConfidenceLevel = 'high' | 'medium' | 'low';

/**
 * Pattern type for clinical correlations.
 */
export type PatternType =
  | 'metabolic_syndrome'
  | 'insulin_resistance'
  | 'diabetes_type2'
  | 'hypothyroidism'
  | 'hyperthyroidism'
  | 'iron_deficiency_anemia'
  | 'b12_deficiency'
  | 'chronic_inflammation'
  | 'liver_dysfunction'
  | 'kidney_dysfunction'
  | 'cardiovascular_risk'
  | 'autoimmune_pattern'
  | 'infection_pattern'
  | 'custom';

/**
 * Clinical correlation between multiple biomarkers.
 */
export interface ClinicalCorrelation {
  /** Pattern type identifier */
  type: PatternType;
  /** Biomarkers involved in this correlation */
  markers: string[];
  /** Human-readable pattern description */
  pattern: string;
  /** Clinical implication/significance */
  clinicalImplication: string;
  /** Confidence level based on evidence strength */
  confidence: ConfidenceLevel;
  /** Criteria met (e.g., "3/5 ATP III criteria") */
  criteriaMet?: string;
  /** Evidence linking to specific patient data */
  evidence?: Array<{
    source: 'lab' | 'soap' | 'history';
    reference: string;
    value?: string;
  }>;
}
