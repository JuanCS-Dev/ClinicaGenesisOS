/**
 * Patient Health Companion Types
 * ==============================
 *
 * Type definitions for the WhatsApp AI health companion.
 * Based on research from BMC Emergency Medicine 2025 (Gemini triage study)
 * and FDA AI Medical Devices Guidance 2025.
 *
 * @module companion/types
 */

// ============================================================================
// CONVERSATION TYPES
// ============================================================================

/**
 * Conversation state machine states.
 * Follows hybrid approach: AI for routine, human handoff for complex.
 */
export type ConversationState =
  | 'idle' // No active conversation
  | 'greeting' // Initial welcome
  | 'symptom_intake' // Collecting symptoms
  | 'triage' // Evaluating urgency
  | 'guidance' // Providing health guidance
  | 'scheduling' // Helping schedule appointment
  | 'handoff' // Escalated to human
  | 'closed' // Conversation ended

/**
 * Message role in conversation.
 */
export type MessageRole = 'patient' | 'assistant' | 'system'

/**
 * Single conversation message.
 */
export interface ConversationMessage {
  /** Unique message ID */
  id: string
  /** Message role */
  role: MessageRole
  /** Message content */
  content: string
  /** ISO timestamp */
  timestamp: string
  /** WhatsApp message ID (for patient messages) */
  whatsappMessageId?: string
}

/**
 * Patient context for personalized responses.
 * Loaded from patient record for contextual AI responses.
 */
export interface PatientCompanionContext {
  /** Patient's first name */
  name: string
  /** Patient age in years */
  age: number
  /** Biological sex */
  sex: 'male' | 'female'
  /** Known allergies */
  allergies: string[]
  /** Current medications */
  currentMedications: string[]
  /** Chronic conditions */
  chronicConditions: string[]
  /** Last appointment info */
  lastAppointment?: {
    date: string
    specialty: string
    physicianName?: string
  }
  /** Recent SOAP notes summary (anonymized) */
  recentSOAPSummary?: string
}

/**
 * Full conversation session stored in Firestore.
 */
export interface ConversationSession {
  /** Session ID (Firestore document ID) */
  id: string
  /** Clinic ID (multi-tenant) */
  clinicId: string
  /** Patient ID */
  patientId: string
  /** Patient phone number (normalized) */
  patientPhone: string
  /** Current conversation state */
  state: ConversationState
  /** Patient context for AI */
  context: PatientCompanionContext
  /** Triage result (if performed) */
  triageResult?: SymptomTriageResult
  /** Session creation timestamp */
  createdAt: string
  /** Session expiration (24h TTL) */
  expiresAt: string
  /** Last activity timestamp */
  lastActivityAt: string
  /** Message count (denormalized for quick checks) */
  messageCount: number
}

// ============================================================================
// TRIAGE TYPES
// ============================================================================

/**
 * Urgency classification for symptom triage.
 * Based on Mayo Clinic triage algorithms.
 */
export type UrgencyLevel = 'emergency' | 'urgent' | 'routine' | 'self_care'

/**
 * Symptom triage result from AI analysis.
 */
export interface SymptomTriageResult {
  /** Urgency classification */
  urgency: UrgencyLevel
  /** Symptoms identified */
  symptoms: string[]
  /** Red flags detected */
  redFlags: string[]
  /** Recommendations for patient */
  recommendations: string[]
  /** Whether to suggest scheduling */
  shouldSchedule: boolean
  /** Suggested specialty (if scheduling) */
  suggestedSpecialty?: string
  /** Confidence score (0-100) */
  confidence: number
}

// ============================================================================
// HANDOFF TYPES
// ============================================================================

/**
 * Priority level for human handoff.
 */
export type HandoffPriority = 'high' | 'medium' | 'low'

/**
 * Reason for human handoff.
 */
export type HandoffReason =
  | 'emergency' // Medical emergency detected
  | 'patient_request' // Patient asked for human
  | 'frustration' // Frustration detected
  | 'low_confidence' // AI confidence too low
  | 'loop_detected' // Repetitive questions
  | 'out_of_scope' // Question outside health scope

/**
 * Human handoff record.
 */
export interface HandoffRecord {
  /** Handoff ID (Firestore document ID) */
  id: string
  /** Clinic ID */
  clinicId: string
  /** Patient ID */
  patientId: string
  /** Session ID reference */
  sessionId: string
  /** Patient phone for contact */
  patientPhone: string
  /** Reason for handoff */
  reason: HandoffReason
  /** Detailed reason message */
  reasonDetails: string
  /** Priority level */
  priority: HandoffPriority
  /** Handoff status */
  status: 'pending' | 'assigned' | 'resolved'
  /** Assigned staff member (if any) */
  assignedTo?: string
  /** Creation timestamp */
  createdAt: string
  /** Resolution timestamp */
  resolvedAt?: string
  /** Resolution notes */
  resolutionNotes?: string
}

// ============================================================================
// PHONE INDEX TYPES
// ============================================================================

/**
 * Phone number to patient mapping for O(1) lookup.
 */
export interface PhoneIndexEntry {
  /** Clinic ID */
  clinicId: string
  /** Patient ID */
  patientId: string
  /** Last updated timestamp */
  updatedAt: string
}

// ============================================================================
// AI SERVICE TYPES
// ============================================================================

/**
 * Input for companion AI service.
 */
export interface CompanionAIInput {
  /** Patient's message */
  message: string
  /** Current conversation state */
  state: ConversationState
  /** Patient context */
  context: PatientCompanionContext
  /** Recent conversation history (last N messages) */
  conversationHistory: ConversationMessage[]
  /** Current triage result (if any) */
  triageResult?: SymptomTriageResult
}

/**
 * Output from companion AI service.
 */
export interface CompanionAIOutput {
  /** Response message to send */
  response: string
  /** New conversation state */
  newState: ConversationState
  /** Updated triage result (if any) */
  triageResult?: SymptomTriageResult
  /** Whether to trigger handoff */
  shouldHandoff: boolean
  /** Handoff details (if shouldHandoff) */
  handoffDetails?: {
    reason: HandoffReason
    priority: HandoffPriority
    reasonDetails: string
  }
  /** Confidence in response (0-100) */
  confidence: number
  /** Processing metadata */
  metadata: {
    model: string
    promptVersion: string
    processingTimeMs: number
  }
}

// ============================================================================
// GUARDRAILS TYPES
// ============================================================================

/**
 * Result of guardrails check.
 */
export interface GuardrailsCheckResult {
  /** Whether message passed guardrails */
  passed: boolean
  /** Emergency detected */
  isEmergency: boolean
  /** Matched emergency keywords */
  emergencyKeywords: string[]
  /** Whether to skip AI and go to handoff */
  skipToHandoff: boolean
  /** Handoff reason (if skipToHandoff) */
  handoffReason?: HandoffReason
}

/**
 * Result of response sanitization.
 */
export interface SanitizedResponse {
  /** Sanitized response text */
  text: string
  /** Whether response was modified */
  wasModified: boolean
  /** Patterns removed */
  removedPatterns: string[]
}

// ============================================================================
// CONSTANTS
// ============================================================================

/** Session TTL in hours */
export const SESSION_TTL_HOURS = 24

/** Maximum messages to keep in context window */
export const MAX_CONTEXT_MESSAGES = 10

/** Minimum confidence for AI response (below triggers handoff) */
export const MIN_CONFIDENCE_THRESHOLD = 40

/** Maximum loops before handoff */
export const MAX_LOOPS_BEFORE_HANDOFF = 3

/** Emergency SAMU number */
export const SAMU_NUMBER = '192'

/** AI disclaimer text */
export const AI_DISCLAIMER =
  '_Assistente de IA. Não substitui consulta médica. Emergências: ligue 192_'
