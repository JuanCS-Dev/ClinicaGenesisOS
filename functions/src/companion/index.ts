/**
 * Patient Health Companion Module
 * ================================
 *
 * WhatsApp AI health companion for Genesis Clinic OS.
 * Provides contextual health guidance with safety guardrails.
 *
 * @module companion
 */

// Main message handler
export { handleCompanionMessage } from './message-handler.js'

// Session management
export {
  getActiveSession,
  getSessionById,
  createSession,
  updateSessionState,
  addMessage,
  getRecentMessages,
  closeSession,
  findPatientByPhone,
  updatePhoneIndex,
  normalizePhone,
} from './session-manager.js'

// Context building
export { buildPatientContext, buildMinimalContext } from './context-builder.js'

// AI services
export { generateCompanionResponse, performSymptomTriage } from './ai-service.js'

// Guardrails
export {
  checkGuardrails,
  sanitizeResponse,
  buildEmergencyResponse,
  buildHandoffResponse,
  detectLoop,
} from './guardrails.js'

// Handoff management
export {
  createHandoff,
  getPendingHandoffs,
  assignHandoff,
  resolveHandoff,
  getHandoffById,
} from './handoff.js'

// Scheduled cleanup functions
export { cleanupExpiredSessions, cleanupOldHandoffs } from './cleanup.js'

// Types
export type {
  ConversationState,
  MessageRole,
  ConversationMessage,
  PatientCompanionContext,
  ConversationSession,
  UrgencyLevel,
  SymptomTriageResult,
  HandoffPriority,
  HandoffReason,
  HandoffRecord,
  PhoneIndexEntry,
  CompanionAIInput,
  CompanionAIOutput,
  GuardrailsCheckResult,
  SanitizedResponse,
} from './types.js'

// Constants
export {
  SESSION_TTL_HOURS,
  MAX_CONTEXT_MESSAGES,
  MIN_CONFIDENCE_THRESHOLD,
  MAX_LOOPS_BEFORE_HANDOFF,
  SAMU_NUMBER,
  AI_DISCLAIMER,
} from './types.js'

// Prompts
export {
  COMPANION_PROMPT_VERSION,
  COMPANION_SYSTEM_PROMPT,
  generateCompanionUserPrompt,
  TRIAGE_PROMPT_VERSION,
  TRIAGE_SYSTEM_PROMPT,
  generateTriageUserPrompt,
  COMPANION_PROMPT_VERSIONS,
  getCombinedPromptVersion,
} from './prompts/index.js'
