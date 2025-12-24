/**
 * Clinical Reasoning - Analysis Result Types
 *
 * Type definitions for analysis results and summaries.
 *
 * @module types/clinical-reasoning/analysis
 */

import type { ExtractedBiomarker } from './biomarkers';
import type { ClinicalCorrelation } from './correlations';
import type {
  TriageResult,
  DifferentialDiagnosis,
  InvestigativeQuestion,
  SuggestedTest,
} from './diagnostics';
import type { ConsensusDiagnosis, ConsensusMetrics } from './consensus';
import type { DiagnosisLiterature } from './literature';

/**
 * Summary statistics for analysis.
 */
export interface AnalysisSummary {
  /** Count of critical markers */
  critical: number;
  /** Count of attention-needed markers */
  attention: number;
  /** Count of normal markers */
  normal: number;
  /** Overall risk score (0-100) */
  overallRiskScore?: number;
}

/**
 * Complete lab analysis result from Clinical Reasoning Engine.
 */
export interface LabAnalysisResult {
  /** Summary statistics */
  summary: AnalysisSummary;
  /** Triage result (Layer 1) */
  triage: TriageResult;
  /** Individual biomarker results */
  markers: ExtractedBiomarker[];
  /** Clinical correlations identified */
  correlations: ClinicalCorrelation[];
  /** Differential diagnoses (ranked) - may include consensus info (Fase 3.3.8) */
  differentialDiagnosis: DifferentialDiagnosis[] | ConsensusDiagnosis[];
  /** Investigative questions */
  investigativeQuestions: InvestigativeQuestion[];
  /** Suggested additional tests */
  suggestedTests: SuggestedTest[];
  /** Chain of thought reasoning (expandable) */
  chainOfThought: string[];
  /** Scientific literature backing (async, may arrive after main result) */
  scientificReferences?: DiagnosisLiterature[];
  /** Mandatory disclaimer */
  disclaimer: string;
  /** Processing metadata */
  metadata: {
    processingTimeMs: number;
    model: string;
    promptVersion: string;
    inputTokens: number;
    outputTokens: number;
  };
  /** Multi-LLM consensus metrics (Fase 3.3.8) */
  consensusMetrics?: ConsensusMetrics;
}
