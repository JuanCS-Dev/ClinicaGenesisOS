/**
 * Multi-LLM Aggregator - 1/r Weighted Consensus
 *
 * Fase 3.3.8: Multi-LLM Consensus Engine
 *
 * Based on NEJM AI 2024 research:
 * "Good answers are common to many LLMs, bad answers are local to a specific LLM"
 *
 * Algorithm:
 * 1. Each diagnosis at rank r gets score = 1/r
 * 2. Aggregate scores across all models
 * 3. Rank by total score
 * 4. Calibrate confidence based on consensus level
 *
 * @see https://ai.nejm.org/doi/full/10.1056/AIcs2400502
 */

import type {
  DifferentialDiagnosis,
  ConsensusDiagnosis,
  ConsensusLevel,
  ConsensusMetrics,
} from './types';

/**
 * Input format for diagnosis from a single model.
 */
export interface ModelDiagnosisInput {
  name: string;
  rank: number; // 1-5
  confidence: number; // 0-100
  icd10?: string;
  supportingEvidence: string[];
  contradictingEvidence?: string[];
  suggestedTests?: string[];
  reasoning?: string;
}

/**
 * Internal structure for aggregation.
 */
interface DiagnosisScore {
  name: string;
  displayName: string;
  icd10: string | undefined;
  score: number;
  sources: Map<
    'gemini' | 'gpt4o',
    { rank: number; confidence: number; reasoning?: string }
  >;
  supportingEvidence: string[];
  contradictingEvidence: string[];
  suggestedTests: string[];
}

/**
 * Configuration for confidence calibration.
 */
const CONFIDENCE_MULTIPLIERS: Record<ConsensusLevel, number> = {
  strong: 1.1, // Boost for strong agreement
  moderate: 1.0, // No change
  weak: 0.9, // Slight penalty for weak agreement
  single: 0.8, // Penalty for only one model
  divergent: 0.7, // Significant penalty for divergence
};

/**
 * Maximum confidence after calibration.
 */
const MAX_CONFIDENCE = 99;

/**
 * Normalize diagnosis name for matching.
 *
 * Handles variations like:
 * - "Hipotiroidismo" vs "Hipotireoidismo"
 * - "Síndrome de X" vs "X"
 * - "Diabetes Mellitus tipo 2" vs "DM2"
 */
export function normalizeDiagnosisName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    // Remove common prefixes
    .replace(/^síndrome de\s+/i, '')
    .replace(/^doença de\s+/i, '')
    .replace(/^transtorno de\s+/i, '')
    // Normalize diabetes variations
    .replace(/diabetes mellitus tipo 2/i, 'diabetes tipo 2')
    .replace(/dm2/i, 'diabetes tipo 2')
    .replace(/dm tipo 2/i, 'diabetes tipo 2')
    // Normalize thyroid variations
    .replace(/hipotiroidismo/i, 'hipotireoidismo')
    .replace(/hipertiroidismo/i, 'hipertireoidismo')
    // Remove extra spaces
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Calculate 1/r score for a given rank.
 *
 * rank 1 = 1.00
 * rank 2 = 0.50
 * rank 3 = 0.33
 * rank 4 = 0.25
 * rank 5 = 0.20
 */
export function calculateScore(rank: number): number {
  if (rank <= 0 || rank > 10) return 0;
  return 1 / rank;
}

/**
 * Determine consensus level based on rank difference.
 */
export function determineConsensusLevel(
  geminiRank: number | undefined,
  gptRank: number | undefined
): ConsensusLevel {
  if (geminiRank === undefined && gptRank === undefined) {
    return 'single'; // Shouldn't happen, but handle gracefully
  }

  if (geminiRank === undefined || gptRank === undefined) {
    return 'single';
  }

  const rankDiff = Math.abs(geminiRank - gptRank);

  if (rankDiff === 0) {
    return 'strong';
  } else if (rankDiff === 1) {
    return 'moderate';
  } else if (rankDiff <= 2) {
    return 'weak';
  } else {
    return 'divergent';
  }
}

/**
 * Calibrate confidence based on consensus level.
 */
export function calibrateConfidence(
  avgConfidence: number,
  consensusLevel: ConsensusLevel
): number {
  const multiplier = CONFIDENCE_MULTIPLIERS[consensusLevel];
  const calibrated = Math.round(avgConfidence * multiplier);
  return Math.min(MAX_CONFIDENCE, Math.max(0, calibrated));
}

/**
 * Merge evidence arrays, removing duplicates.
 */
export function mergeEvidence(
  geminiEvidence: string[],
  gptEvidence: string[]
): string[] {
  const normalized = new Map<string, string>();

  for (const ev of [...geminiEvidence, ...gptEvidence]) {
    const key = ev.toLowerCase().trim();
    if (!normalized.has(key)) {
      normalized.set(key, ev);
    }
  }

  return Array.from(normalized.values());
}

/**
 * Aggregate diagnoses from multiple models using 1/r weighted method.
 *
 * This is the main function implementing the NEJM AI algorithm.
 *
 * @param geminiDiagnoses - Diagnoses from Gemini 2.5 Flash
 * @param gptDiagnoses - Diagnoses from GPT-4o-mini (may be empty if call failed)
 * @returns Aggregated diagnoses with consensus metrics
 */
export function aggregateDiagnoses(
  geminiDiagnoses: ModelDiagnosisInput[],
  gptDiagnoses: ModelDiagnosisInput[]
): { diagnoses: ConsensusDiagnosis[]; metrics: ConsensusMetrics } {
  const startTime = Date.now();
  const scoreMap = new Map<string, DiagnosisScore>();

  // Process Gemini diagnoses
  for (const dx of geminiDiagnoses) {
    const key = normalizeDiagnosisName(dx.name);
    const score = calculateScore(dx.rank);

    const existing: DiagnosisScore = scoreMap.get(key) || {
      name: key,
      displayName: dx.name,
      icd10: undefined,
      score: 0,
      sources: new Map(),
      supportingEvidence: [],
      contradictingEvidence: [],
      suggestedTests: [],
    };

    existing.score += score;
    existing.sources.set('gemini', {
      rank: dx.rank,
      confidence: dx.confidence,
      reasoning: dx.reasoning,
    });
    existing.icd10 = existing.icd10 || dx.icd10;
    existing.supportingEvidence.push(...dx.supportingEvidence);
    if (dx.contradictingEvidence) {
      existing.contradictingEvidence.push(...dx.contradictingEvidence);
    }
    if (dx.suggestedTests) {
      existing.suggestedTests.push(...dx.suggestedTests);
    }

    scoreMap.set(key, existing);
  }

  // Process GPT-4o diagnoses
  for (const dx of gptDiagnoses) {
    const key = normalizeDiagnosisName(dx.name);
    const score = calculateScore(dx.rank);

    const existing: DiagnosisScore = scoreMap.get(key) || {
      name: key,
      displayName: dx.name,
      icd10: undefined,
      score: 0,
      sources: new Map(),
      supportingEvidence: [],
      contradictingEvidence: [],
      suggestedTests: [],
    };

    existing.score += score;
    existing.sources.set('gpt4o', {
      rank: dx.rank,
      confidence: dx.confidence,
      reasoning: dx.reasoning,
    });
    existing.icd10 = existing.icd10 || dx.icd10;
    existing.supportingEvidence.push(...dx.supportingEvidence);
    if (dx.contradictingEvidence) {
      existing.contradictingEvidence.push(...dx.contradictingEvidence);
    }
    if (dx.suggestedTests) {
      existing.suggestedTests.push(...dx.suggestedTests);
    }

    scoreMap.set(key, existing);
  }

  // Sort by aggregate score and take top 5
  const sorted = Array.from(scoreMap.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  // Build consensus diagnoses
  let strongCount = 0;
  let moderateCount = 0;
  let divergentCount = 0;
  const divergentNames: string[] = [];

  const diagnoses: ConsensusDiagnosis[] = sorted.map((data, _idx) => {
    const gemini = data.sources.get('gemini');
    const gpt4o = data.sources.get('gpt4o');

    const consensusLevel = determineConsensusLevel(gemini?.rank, gpt4o?.rank);

    // Track consensus metrics
    if (consensusLevel === 'strong') strongCount++;
    if (consensusLevel === 'moderate') moderateCount++;
    if (consensusLevel === 'divergent') {
      divergentCount++;
      divergentNames.push(data.displayName);
    }

    // Calculate calibrated confidence
    let confidence: number;
    if (gemini && gpt4o) {
      const avgConfidence = (gemini.confidence + gpt4o.confidence) / 2;
      confidence = calibrateConfidence(avgConfidence, consensusLevel);
    } else {
      const singleConfidence = gemini?.confidence || gpt4o?.confidence || 50;
      confidence = calibrateConfidence(singleConfidence, 'single');
    }

    return {
      // Base DifferentialDiagnosis fields
      name: data.displayName,
      icd10: data.icd10,
      confidence,
      supportingEvidence: Array.from(new Set(data.supportingEvidence)),
      contradictingEvidence: Array.from(new Set(data.contradictingEvidence)),
      suggestedTests: Array.from(new Set(data.suggestedTests)),

      // Consensus-specific fields
      aggregateScore: data.score,
      consensusLevel,
      modelDetails: {
        gemini: gemini
          ? {
              rank: gemini.rank,
              confidence: gemini.confidence,
              reasoning: gemini.reasoning,
            }
          : undefined,
        gpt4o: gpt4o
          ? {
              rank: gpt4o.rank,
              confidence: gpt4o.confidence,
              reasoning: gpt4o.reasoning,
            }
          : undefined,
      },
    };
  });

  // Calculate metrics
  const totalDiagnoses = diagnoses.length;
  const metrics: ConsensusMetrics = {
    modelsUsed: [
      ...(geminiDiagnoses.length > 0 ? ['gemini-2.5-flash'] : []),
      ...(gptDiagnoses.length > 0 ? ['gpt-4o-mini'] : []),
    ],
    strongConsensusRate:
      totalDiagnoses > 0 ? Math.round((strongCount / totalDiagnoses) * 100) : 0,
    moderateConsensusCount: moderateCount,
    divergentCount,
    divergentDiagnoses: divergentNames.length > 0 ? divergentNames : undefined,
    totalProcessingTimeMs: Date.now() - startTime,
  };

  return { diagnoses, metrics };
}

/**
 * Convert DifferentialDiagnosis array to ModelDiagnosisInput format.
 *
 * Used to normalize the output from Gemini before aggregation.
 */
export function toDiagnosisInput(
  diagnoses: DifferentialDiagnosis[]
): ModelDiagnosisInput[] {
  return diagnoses.map((dx, idx) => ({
    name: dx.name,
    rank: idx + 1,
    confidence: dx.confidence,
    icd10: dx.icd10,
    supportingEvidence: dx.supportingEvidence,
    contradictingEvidence: dx.contradictingEvidence,
    suggestedTests: dx.suggestedTests,
  }));
}

/**
 * Handle fallback when GPT-4o is not available.
 *
 * Returns Gemini diagnoses with 'single' consensus level and penalized confidence.
 */
export function fallbackToSingleModel(
  geminiDiagnoses: DifferentialDiagnosis[]
): { diagnoses: ConsensusDiagnosis[]; metrics: ConsensusMetrics } {
  const diagnoses: ConsensusDiagnosis[] = geminiDiagnoses.map((dx, idx) => ({
    ...dx,
    aggregateScore: calculateScore(idx + 1),
    consensusLevel: 'single' as ConsensusLevel,
    modelDetails: {
      gemini: {
        rank: idx + 1,
        confidence: dx.confidence,
      },
    },
    // Penalize confidence for single model
    confidence: calibrateConfidence(dx.confidence, 'single'),
  }));

  const metrics: ConsensusMetrics = {
    modelsUsed: ['gemini-2.5-flash'],
    strongConsensusRate: 0,
    moderateConsensusCount: 0,
    divergentCount: 0,
    totalProcessingTimeMs: 0,
  };

  return { diagnoses, metrics };
}
