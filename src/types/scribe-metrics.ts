/**
 * Scribe Metrics Types
 * ====================
 *
 * Types for AI Scribe validation and metrics.
 * Fase 12: AI Scribe Enhancement
 *
 * Based on SCRIBE Framework (Nature Digital Medicine 2025):
 * - Simulation: Test with simulated cases
 * - Computational: BLEU, ROUGE, F1 metrics
 * - Reviewer: Physician assessment
 * - Intelligent: AI-to-AI evaluation
 * - Best practice: Guidelines conformance
 */

/**
 * Feedback rating scale.
 */
export type FeedbackRating = 1 | 2 | 3 | 4 | 5;

/**
 * Feedback type - positive or negative.
 */
export type FeedbackType = 'positive' | 'negative';

/**
 * Specific feedback category.
 */
export type FeedbackCategory =
  | 'accuracy'           // Content accuracy
  | 'completeness'       // All info captured
  | 'relevance'          // Relevant to context
  | 'formatting'         // Structure and style
  | 'clinical_accuracy'  // Medical correctness
  | 'time_saved'         // Efficiency
  | 'hallucination'      // Made-up information
  | 'missing_info'       // Important info omitted
  | 'other';             // Other feedback

/**
 * SOAP field identifier.
 */
export type SOAPField = 'subjective' | 'objective' | 'assessment' | 'plan';

/**
 * Field-level edit tracking.
 */
export interface FieldEdit {
  /** SOAP field edited */
  field: SOAPField;
  /** Original AI-generated content */
  original: string;
  /** Final edited content */
  edited: string;
  /** Character-level edit distance */
  editDistance: number;
  /** Percentage changed */
  changePercentage: number;
}

/**
 * Feedback submission from physician.
 */
export interface ScribeFeedback {
  /** Unique identifier */
  id: string;
  /** Clinic ID */
  clinicId: string;
  /** User who submitted feedback */
  userId: string;
  /** Related SOAP record ID */
  soapRecordId?: string;
  /** Appointment ID */
  appointmentId?: string;
  /** Overall rating (1-5) */
  rating: FeedbackRating;
  /** Feedback type */
  type: FeedbackType;
  /** Feedback categories */
  categories: FeedbackCategory[];
  /** Freeform comment */
  comment?: string;
  /** Field edits made */
  fieldEdits: FieldEdit[];
  /** Total edit percentage across all fields */
  totalEditPercentage: number;
  /** Time spent reviewing (seconds) */
  reviewTimeSeconds: number;
  /** Generation time (seconds) */
  generationTimeSeconds: number;
  /** Audio duration (seconds) */
  audioDurationSeconds?: number;
  /** Model used */
  model?: string;
  /** Created timestamp */
  createdAt: string;
}

/**
 * Input for creating feedback.
 */
export interface CreateFeedbackInput {
  soapRecordId?: string;
  appointmentId?: string;
  rating: FeedbackRating;
  type: FeedbackType;
  categories: FeedbackCategory[];
  comment?: string;
  fieldEdits: FieldEdit[];
  totalEditPercentage: number;
  reviewTimeSeconds: number;
  generationTimeSeconds: number;
  audioDurationSeconds?: number;
  model?: string;
}

/**
 * Aggregated metrics for a time period.
 */
export interface ScribeMetricsAggregate {
  /** Time period start */
  periodStart: string;
  /** Time period end */
  periodEnd: string;
  /** Total generations */
  totalGenerations: number;
  /** Average rating */
  averageRating: number;
  /** Positive feedback count */
  positiveCount: number;
  /** Negative feedback count */
  negativeCount: number;
  /** Average edit percentage */
  averageEditPercentage: number;
  /** Average review time (seconds) */
  averageReviewTime: number;
  /** Average generation time (seconds) */
  averageGenerationTime: number;
  /** Fields most edited */
  mostEditedFields: Record<SOAPField, number>;
  /** Most common feedback categories */
  topCategories: Record<FeedbackCategory, number>;
}

/**
 * Daily metrics snapshot.
 */
export interface DailyMetrics {
  /** Date (YYYY-MM-DD) */
  date: string;
  /** Clinic ID */
  clinicId: string;
  /** Number of generations */
  generations: number;
  /** Average rating */
  averageRating: number;
  /** Average generation time (ms) */
  avgGenerationTimeMs: number;
  /** Average edit percentage */
  avgEditPercentage: number;
  /** Thumbs up count */
  thumbsUp: number;
  /** Thumbs down count */
  thumbsDown: number;
}

/**
 * Confidence score for AI output.
 */
export interface ConfidenceScore {
  /** Overall confidence (0-1) */
  overall: number;
  /** Per-field confidence */
  fields: Record<SOAPField, number>;
  /** Factors affecting confidence */
  factors: ConfidenceFactor[];
}

/**
 * Factor affecting confidence score.
 */
export interface ConfidenceFactor {
  /** Factor name */
  name: string;
  /** Factor value (-1 to 1, negative = decreases confidence) */
  value: number;
  /** Description */
  description: string;
}

/**
 * Feedback category labels in Portuguese.
 */
export const FEEDBACK_CATEGORY_LABELS: Record<FeedbackCategory, string> = {
  accuracy: 'Precisão',
  completeness: 'Completude',
  relevance: 'Relevância',
  formatting: 'Formatação',
  clinical_accuracy: 'Acurácia Clínica',
  time_saved: 'Economia de Tempo',
  hallucination: 'Informação Inventada',
  missing_info: 'Informação Faltante',
  other: 'Outro',
};

/**
 * SOAP field labels in Portuguese.
 */
export const SOAP_FIELD_LABELS: Record<SOAPField, string> = {
  subjective: 'Subjetivo',
  objective: 'Objetivo',
  assessment: 'Avaliação',
  plan: 'Plano',
};

/**
 * Calculate edit distance between two strings (Levenshtein).
 */
export function calculateEditDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Calculate change percentage between original and edited text.
 */
export function calculateChangePercentage(
  original: string,
  edited: string
): number {
  if (original === edited) return 0;
  if (original.length === 0 && edited.length === 0) return 0;
  if (original.length === 0) return 100;

  const editDist = calculateEditDistance(original, edited);
  const maxLen = Math.max(original.length, edited.length);
  return Math.min(100, (editDist / maxLen) * 100);
}

/**
 * Create field edit object from original and edited content.
 */
export function createFieldEdit(
  field: SOAPField,
  original: string,
  edited: string
): FieldEdit {
  const editDistance = calculateEditDistance(original, edited);
  const changePercentage = calculateChangePercentage(original, edited);

  return {
    field,
    original,
    edited,
    editDistance,
    changePercentage,
  };
}

