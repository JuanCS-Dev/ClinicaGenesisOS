/**
 * Clinical Reasoning Engine Types (Frontend)
 * ==========================================
 *
 * Type definitions for the 4-layer clinical reasoning pipeline.
 * Mirrors backend types for consistent data handling.
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

// ============================================================================
// SESSION TYPES
// ============================================================================

/**
 * Status of a lab analysis session.
 */
export type LabAnalysisStatus =
  | 'idle'
  | 'uploading'
  | 'extracting'
  | 'processing'
  | 'ready'
  | 'error';

/**
 * Lab analysis session tracking.
 */
export interface LabAnalysisSession {
  id: string;
  clinicId: string;
  patientId: string;
  physicianId: string;
  status: LabAnalysisStatus;
  patientContext: PatientContext;
  labResults: RawLabResult[];
  source: 'ocr' | 'manual' | 'hl7';
  documentUrl?: string;
  result?: LabAnalysisResult;
  validated?: boolean;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

/**
 * Input for creating a new lab analysis session.
 */
export interface CreateLabAnalysisInput {
  patientId: string;
  patientContext: PatientContext;
  labResults: RawLabResult[];
  source: 'ocr' | 'manual' | 'hl7';
  documentUrl?: string;
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
// UI HELPER TYPES
// ============================================================================

/**
 * Display configuration for a biomarker card.
 */
export interface BiomarkerCardConfig {
  marker: ExtractedBiomarker;
  showFunctionalRange: boolean;
  showInterpretation: boolean;
  showDeviation: boolean;
}

/**
 * Filter options for lab results view.
 */
export interface LabResultsFilter {
  status?: BiomarkerStatus | 'all';
  category?: string | 'all';
  searchTerm?: string;
}

/**
 * View mode for lab analysis results.
 */
export type LabResultsViewMode = 'summary' | 'detailed' | 'clinical';

/**
 * Tab options for clinical analysis panel.
 */
export type ClinicalAnalysisTab =
  | 'overview'
  | 'biomarkers'
  | 'correlations'
  | 'differential'
  | 'suggestions';
