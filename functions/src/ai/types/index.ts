/**
 * Clinical Reasoning Engine Types
 * ================================
 *
 * Type definitions for the 4-layer clinical reasoning pipeline.
 * Based on Med-Gemini architecture + MCAT patterns.
 *
 * This module re-exports all types for backward compatibility.
 *
 * @see docs/PLANO_MVP.md - Fase 3.3 for architecture details
 * @module ai/types
 */

// Biomarker types
export type { BiomarkerStatus, NumericRange, BiomarkerDefinition, ExtractedBiomarker } from './biomarker.types.js';

// Correlation types
export type { ConfidenceLevel, PatternType, ClinicalCorrelation } from './correlation.types.js';

// Diagnostic types
export type {
  UrgencyLevel,
  RecommendedWorkflow,
  RedFlag,
  TriageResult,
  DifferentialDiagnosis,
} from './diagnostic.types.js';

// Investigative types
export type { InvestigativeQuestion, SuggestedTest } from './investigative.types.js';

// Input types
export type { PatientContext, RawLabResult, LabAnalysisInput } from './input.types.js';

// OCR types
export type { OCRExtractionResult } from './ocr.types.js';

// Literature types
export type { ScientificReference, DiagnosisLiterature } from './literature.types.js';

// Consensus types
export type {
  ConsensusLevel,
  ConsensusDiagnosis,
  ConsensusMetrics,
  ModelDiagnosisResult,
} from './consensus.types.js';

// Audit types
export type { AnalysisFeedback, AIAnalysisLog } from './audit.types.js';

// Specialty types
export type { ClinicalSpecialty, SpecialtyTemplate } from './specialty.types.js';

// Analysis types
export type { AnalysisSummary, LabAnalysisResult } from './analysis.types.js';
