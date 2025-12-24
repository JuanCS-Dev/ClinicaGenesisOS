/**
 * Clinical Reasoning Engine Types
 *
 * Type definitions for the 4-layer clinical reasoning pipeline.
 * Mirrors backend types for consistent data handling.
 *
 * @module types/clinical-reasoning
 */

// Biomarker types
export type { BiomarkerStatus, NumericRange, ExtractedBiomarker } from './biomarkers';

// Correlation types
export type {
  ConfidenceLevel,
  PatternType,
  ClinicalCorrelation,
} from './correlations';

// Diagnostic types
export type {
  UrgencyLevel,
  RecommendedWorkflow,
  RedFlag,
  TriageResult,
  DifferentialDiagnosis,
  InvestigativeQuestion,
  SuggestedTest,
} from './diagnostics';

// Consensus types
export type {
  ConsensusLevel,
  ConsensusDiagnosis,
  ConsensusMetrics,
  ConsensusIndicator,
} from './consensus';
export { CONSENSUS_INDICATORS } from './consensus';

// Analysis types
export type { AnalysisSummary, LabAnalysisResult } from './analysis';

// Input types
export type {
  PatientContext,
  RawLabResult,
  LabAnalysisStatus,
  LabAnalysisSession,
  CreateLabAnalysisInput,
} from './input';

// Literature types
export type { ScientificReference, DiagnosisLiterature } from './literature';

// UI types
export type {
  BiomarkerCardConfig,
  LabResultsFilter,
  LabResultsViewMode,
  ClinicalAnalysisTab,
} from './ui';
