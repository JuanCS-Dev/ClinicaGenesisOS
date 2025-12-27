/**
 * Multi-LLM Consensus Types
 *
 * Type definitions for multi-model consensus in diagnosis.
 * Based on NEJM AI 2024 research on multi-model ensemble.
 *
 * @module ai/types/consensus
 */

import type { DifferentialDiagnosis } from './diagnostic.types.js';

/**
 * Consensus level between multiple LLMs.
 * Based on NEJM AI 2024 research on multi-model ensemble.
 */
export type ConsensusLevel =
  | 'strong' // Both models agree on same rank position
  | 'moderate' // Both models identified, rank difference ≤ 1
  | 'weak' // Both models identified, rank difference > 1
  | 'single' // Only one model suggested this diagnosis
  | 'divergent'; // Models disagree significantly

/**
 * Diagnosis with multi-model consensus information.
 * Extends base DifferentialDiagnosis with consensus metrics.
 */
export interface ConsensusDiagnosis extends DifferentialDiagnosis {
  /** Aggregate score using 1/r weighted method (NEJM AI) */
  aggregateScore: number;
  /** Consensus level between models */
  consensusLevel: ConsensusLevel;
  /** Details from each model */
  modelDetails: {
    gemini?: {
      rank: number;
      confidence: number;
      reasoning?: string;
    };
    gpt4o?: {
      rank: number;
      confidence: number;
      reasoning?: string;
    };
  };
}

/**
 * Metrics about the multi-LLM consensus process.
 */
export interface ConsensusMetrics {
  /** Models used in this analysis */
  modelsUsed: string[];
  /** Percentage of diagnoses with strong consensus */
  strongConsensusRate: number;
  /** Number of diagnoses with moderate consensus */
  moderateConsensusCount: number;
  /** Number of diagnoses flagged as divergent */
  divergentCount: number;
  /** Diagnoses where models diverged (for physician attention) */
  divergentDiagnoses?: string[];
  /** Total processing time across all models */
  totalProcessingTimeMs: number;
  /** Individual model timings */
  modelTimings?: {
    gemini?: number;
    gpt4o?: number;
  };
}

/**
 * Result from a single model's diagnosis generation.
 */
export interface ModelDiagnosisResult {
  /** Model identifier */
  model: 'gemini-2.5-flash' | 'gpt-4o-mini';
  /** Generated diagnoses */
  diagnoses: DifferentialDiagnosis[];
  /** Processing time in milliseconds */
  processingTimeMs: number;
  /** Token usage */
  tokensUsed: {
    input: number;
    output: number;
    total: number;
  };
  /** Whether this result is from a fallback/error state */
  isPartial?: boolean;
}
