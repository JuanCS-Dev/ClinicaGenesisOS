/**
 * Clinical Reasoning Engine Types - Re-export
 *
 * This file re-exports from the modular clinical-reasoning/ directory.
 * Maintains backward compatibility with existing imports.
 *
 * @module types/clinical-reasoning
 * @see types/clinical-reasoning/
 */

export type {
  // Biomarker types
  BiomarkerStatus,
  NumericRange,
  ExtractedBiomarker,
  // Correlation types
  ConfidenceLevel,
  PatternType,
  ClinicalCorrelation,
  // Diagnostic types
  UrgencyLevel,
  RecommendedWorkflow,
  RedFlag,
  TriageResult,
  DifferentialDiagnosis,
  InvestigativeQuestion,
  SuggestedTest,
  // Consensus types
  ConsensusLevel,
  ConsensusDiagnosis,
  ConsensusMetrics,
  ConsensusIndicator,
  // Analysis types
  AnalysisSummary,
  LabAnalysisResult,
  // Input types
  PatientContext,
  RawLabResult,
  LabAnalysisStatus,
  LabAnalysisSession,
  CreateLabAnalysisInput,
  // Literature types
  ScientificReference,
  DiagnosisLiterature,
  // UI types
  BiomarkerCardConfig,
  LabResultsFilter,
  LabResultsViewMode,
  ClinicalAnalysisTab,
} from './clinical-reasoning/index';

export { CONSENSUS_INDICATORS } from './clinical-reasoning/index';
