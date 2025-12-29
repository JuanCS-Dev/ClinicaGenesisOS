/**
 * Cloud Functions for ClinicaGenesisOS
 *
 * MVP: Uses free tier services
 * - Google AI Studio (Gemini free tier)
 * - WhatsApp Cloud API (templates only)
 * - Cloud Functions (2M invocations free)
 */

import { initializeApp } from 'firebase-admin/app'

// Initialize Firebase Admin
initializeApp()

// ============================================
// WhatsApp Reminders (3.1)
// ============================================
export { whatsappWebhook } from './whatsapp/webhook.js'
export { sendReminders24h, sendReminders2h } from './scheduler/reminders.js'
export { onAppointmentCreated, onAppointmentUpdated } from './scheduler/triggers.js'

// ============================================
// AI Scribe (3.2)
// ============================================
export { processAudioScribe } from './ai/process-audio-scribe.js'

// ============================================
// Clinical Reasoning Engine (3.3)
// ============================================
export { analyzeLabResults } from './ai/analyze-lab-results.js'

// ============================================
// Stripe Payments - PIX & Boleto (10.1)
// ============================================
export {
  // PIX (requires capability - may not be available yet)
  createPixPayment,
  cancelPixPayment,
  refundPixPayment,
  // Boleto (active and available)
  createBoletoPayment,
  cancelBoletoPayment,
  refundBoletoPayment,
  // Webhook
  stripeWebhook,
} from './stripe/index.js'

// ============================================
// TISS - Convênios & Billing (8b)
// ============================================
export {
  // Certificate management
  validateCertificate,
  storeCertificate,
  deleteCertificate,
  // Lote (batch) management
  createLote,
  deleteLote,
  // XML signing
  signXml,
  // Sending to operadoras
  sendLote,
  retrySendLote,
} from './tiss/index.js'

// ============================================
// Workflows - Automation (9)
// ============================================
export {
  // Follow-up after appointments
  sendFollowUpMessages,
  // NPS surveys
  sendNPSSurveys,
  npsResponseWebhook,
  // Patient return reminders
  sendPatientReturnReminders,
  // Labs integration
  labsResultWebhook,
} from './workflows/index.js'

// ============================================
// Patient Health Companion (Moonshot #4)
// ============================================
export {
  // Scheduled cleanup functions
  cleanupExpiredSessions,
  cleanupOldHandoffs,
} from './companion/index.js'

// ============================================
// Google Calendar + Meet (Teleconsultation)
// ============================================
export { createMeetSession, cancelMeetSession, updateMeetSession } from './calendar/index.js'

// ============================================
// RBAC - Custom Claims Management (1.2)
// ============================================
export { setUserClaims, revokeUserClaims, refreshClaims, onClinicCreated } from './auth/index.js'

// ============================================
// SSO/SAML Configuration (5.2)
// ============================================
export {
  getClinicSSOConfig,
  getSSOConfigByDomain,
  configureSAMLProvider,
  disableSSO,
} from './auth/index.js'

// ============================================
// Rate Limiting Cleanup (2.3)
// ============================================
export { cleanupRateLimits } from './middleware/index.js'

// ============================================
// FHIR R4 REST API (5.1)
// ============================================
export { fhirPatient, fhirAppointment, fhirObservation, fhirMetadata } from './fhir/index.js'
