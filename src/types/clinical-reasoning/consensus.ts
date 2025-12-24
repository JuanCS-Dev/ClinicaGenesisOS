/**
 * Clinical Reasoning - Multi-LLM Consensus Types
 *
 * Type definitions for multi-model ensemble consensus (Fase 3.3.8).
 * Based on NEJM AI 2024 research on multi-model ensemble.
 *
 * @module types/clinical-reasoning/consensus
 */

import type { DifferentialDiagnosis } from './diagnostics';

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
 * Visual indicator configuration for consensus badges.
 */
export interface ConsensusIndicator {
  level: ConsensusLevel;
  label: string;
  color: 'emerald' | 'blue' | 'amber' | 'red' | 'gray';
  icon: 'check-double' | 'check' | 'alert' | 'x' | 'question';
  description: string;
}

/**
 * Mapping of consensus levels to visual indicators.
 */
export const CONSENSUS_INDICATORS: Record<ConsensusLevel, ConsensusIndicator> = {
  strong: {
    level: 'strong',
    label: 'Consenso Forte',
    color: 'emerald',
    icon: 'check-double',
    description: 'Ambos os modelos concordam na posição do diagnóstico',
  },
  moderate: {
    level: 'moderate',
    label: 'Consenso',
    color: 'blue',
    icon: 'check',
    description: 'Ambos os modelos identificaram, com pequena variação',
  },
  weak: {
    level: 'weak',
    label: 'Consenso Fraco',
    color: 'amber',
    icon: 'alert',
    description: 'Ambos identificaram, mas com diferença significativa',
  },
  single: {
    level: 'single',
    label: 'Modelo Único',
    color: 'gray',
    icon: 'question',
    description: 'Apenas um modelo sugeriu este diagnóstico',
  },
  divergent: {
    level: 'divergent',
    label: 'Divergência',
    color: 'red',
    icon: 'x',
    description: 'Modelos discordam - requer atenção especial',
  },
};
