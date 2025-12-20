/**
 * Clinical Reasoning Engine Types
 * ================================
 *
 * Type definitions for the 4-layer clinical reasoning pipeline.
 * Based on Med-Gemini architecture + MCAT patterns.
 *
 * @see docs/PLANO_MVP.md - Fase 3.3 for architecture details
 */

// ============================================================================
// BIOMARKER TYPES
// ============================================================================

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

// ============================================================================
// CORRELATION TYPES
// ============================================================================

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

// ============================================================================
// DIAGNOSTIC TYPES
// ============================================================================

/**
 * Urgency classification for clinical triage.
 */
export type UrgencyLevel = 'critical' | 'high' | 'routine';

/**
 * Workflow recommendation based on triage.
 */
export type RecommendedWorkflow = 'emergency' | 'specialist' | 'primary';

/**
 * Red flag alert for critical conditions.
 */
export interface RedFlag {
  /** Description of the red flag */
  description: string;
  /** Related biomarkers or symptoms */
  relatedMarkers: string[];
  /** Suggested immediate action */
  action: string;
}

/**
 * Triage result from Layer 1.
 */
export interface TriageResult {
  /** Urgency classification */
  urgency: UrgencyLevel;
  /** Identified red flags */
  redFlags: RedFlag[];
  /** Recommended clinical workflow */
  recommendedWorkflow: RecommendedWorkflow;
  /** Confidence in triage decision */
  confidence: number;
}

/**
 * Differential diagnosis entry.
 */
export interface DifferentialDiagnosis {
  /** ICD-10 code if applicable */
  icd10?: string;
  /** Diagnosis name */
  name: string;
  /** Confidence percentage (0-100) */
  confidence: number;
  /** Supporting evidence */
  supportingEvidence: string[];
  /** Contradicting evidence */
  contradictingEvidence: string[];
  /** Suggested additional tests */
  suggestedTests: string[];
}

// ============================================================================
// INVESTIGATIVE TYPES
// ============================================================================

/**
 * Investigative question to deepen anamnesis.
 */
export interface InvestigativeQuestion {
  /** The question text */
  question: string;
  /** Why this question is relevant */
  rationale: string;
  /** Related biomarkers or findings */
  relatedTo: string[];
}

/**
 * Suggested additional test/exam.
 */
export interface SuggestedTest {
  /** Test name */
  name: string;
  /** Why this test is recommended */
  rationale: string;
  /** Urgency of the test */
  urgency: 'urgent' | 'routine' | 'follow-up';
  /** Related condition being investigated */
  investigates: string;
}

// ============================================================================
// ANALYSIS RESULT TYPES
// ============================================================================

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

// ============================================================================
// INPUT TYPES
// ============================================================================

/**
 * Patient context for analysis.
 */
export interface PatientContext {
  /** Patient age in years */
  age: number;
  /** Biological sex */
  sex: 'male' | 'female';
  /** Chief complaint (if available) */
  chiefComplaint?: string;
  /** Relevant medical history */
  relevantHistory?: string[];
  /** Current medications */
  currentMedications?: string[];
  /** Known allergies */
  allergies?: string[];
  /** SOAP notes (if available) */
  soapNotes?: {
    subjective?: string;
    objective?: string;
    assessment?: string;
    plan?: string;
  };
}

/**
 * Raw lab result for processing.
 */
export interface RawLabResult {
  /** Biomarker name (as printed) */
  name: string;
  /** Value (as string, may include units) */
  value: string;
  /** Unit (if separate from value) */
  unit?: string;
  /** Reference range (as printed) */
  referenceRange?: string;
}

/**
 * Input for lab analysis function.
 */
export interface LabAnalysisInput {
  /** Clinic ID for multi-tenancy */
  clinicId: string;
  /** Patient ID */
  patientId: string;
  /** Requesting physician ID */
  physicianId: string;
  /** Patient context */
  patientContext: PatientContext;
  /** Lab results (structured or from OCR) */
  labResults: RawLabResult[];
  /** Source of lab results */
  source: 'ocr' | 'manual' | 'hl7';
  /** Optional: URL of uploaded lab document */
  documentUrl?: string;
}

// ============================================================================
// OCR TYPES
// ============================================================================

/**
 * OCR extraction result.
 */
export interface OCRExtractionResult {
  /** Whether extraction was successful */
  success: boolean;
  /** Extracted lab results */
  labResults: RawLabResult[];
  /** Lab name (if detected) */
  laboratoryName?: string;
  /** Collection date (if detected) */
  collectionDate?: string;
  /** Patient name (if detected) */
  patientName?: string;
  /** Raw text (for debugging) */
  rawText?: string;
  /** Confidence score */
  confidence: number;
  /** Errors encountered */
  errors?: string[];
}

// ============================================================================
// SCIENTIFIC LITERATURE TYPES
// ============================================================================

/**
 * Scientific article reference for diagnostic backing.
 */
export interface ScientificReference {
  /** Article title */
  title: string;
  /** Authors (first author et al.) */
  authors: string;
  /** Journal name */
  journal: string;
  /** Publication year */
  year: number;
  /** DOI or PubMed URL */
  url: string;
  /** Abstract excerpt (first 300 chars) */
  excerpt: string | null;
  /** Relevance score (0-100) */
  relevance: number;
}

/**
 * Literature backing for a diagnosis.
 */
export interface DiagnosisLiterature {
  /** ICD-10 code */
  icd10: string;
  /** Diagnosis name */
  diagnosisName: string;
  /** Supporting articles (minimum 2 for medium/high complexity) */
  articles: ScientificReference[];
  /** Status of literature search */
  status: 'pending' | 'ready' | 'not_available';
  /** Search latency in ms */
  searchLatencyMs?: number;
}

// ============================================================================
// MULTI-LLM CONSENSUS TYPES (Fase 3.3.8)
// ============================================================================

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

// ============================================================================
// AUDIT TYPES
// ============================================================================

/**
 * Feedback options for analysis quality.
 */
export type AnalysisFeedback = 'helpful' | 'not_helpful' | 'incorrect';

/**
 * Audit log entry for compliance.
 */
export interface AIAnalysisLog {
  /** Unique ID */
  id: string;
  /** Clinic ID */
  clinicId: string;
  /** Patient ID */
  patientId: string;
  /** Record ID (if linked to a record) */
  recordId?: string;
  /** Physician who requested */
  physicianId: string;
  /** Timestamp */
  timestamp: string;
  /** Type of analysis */
  type: 'lab_analysis' | 'scribe' | 'diagnostic_helper';
  /** SHA-256 hash of input (for privacy) */
  inputHash: string;
  /** SHA-256 hash of output */
  outputHash: string;
  /** Model used */
  model: string;
  /** Prompt version */
  promptVersion: string;
  /** Whether physician accepted the suggestion */
  accepted: boolean;
  /** Physician feedback */
  feedback?: AnalysisFeedback;
  /** Additional feedback notes */
  feedbackNotes?: string;
  /** Processing time in ms */
  processingTimeMs: number;
}

// ============================================================================
// SPECIALTY TEMPLATES
// ============================================================================

/**
 * Specialty-specific analysis configuration.
 */
export type ClinicalSpecialty =
  | 'general_practice'
  | 'cardiology'
  | 'endocrinology'
  | 'neurology'
  | 'functional_medicine'
  | 'nephrology'
  | 'hematology'
  | 'hepatology';

/**
 * Specialty template for chain-of-thought prompting.
 */
export interface SpecialtyTemplate {
  /** Specialty identifier */
  specialty: ClinicalSpecialty;
  /** Ordered reasoning steps */
  reasoningSteps: string[];
  /** Key biomarkers for this specialty */
  keyBiomarkers: string[];
  /** Common patterns to look for */
  commonPatterns: PatternType[];
  /** Red flags specific to specialty */
  redFlags: string[];
}
