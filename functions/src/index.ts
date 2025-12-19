/**
 * Cloud Functions for ClinicaGenesisOS
 *
 * MVP: Uses free tier services
 * - Google AI Studio (Gemini free tier)
 * - WhatsApp Cloud API (templates only)
 * - Cloud Functions (2M invocations free)
 */

import { initializeApp } from 'firebase-admin/app';

// Initialize Firebase Admin
initializeApp();

// ============================================
// WhatsApp Reminders (3.1)
// ============================================
export { whatsappWebhook } from './whatsapp/webhook.js';
export { sendReminders24h, sendReminders2h } from './scheduler/reminders.js';
export { onAppointmentCreated, onAppointmentUpdated } from './scheduler/triggers.js';

// ============================================
// AI Scribe (3.2) - Coming soon
// ============================================
// export { processConsultationAudio } from './ai/scribe.js';

// ============================================
// AI Diagnostic Helper (3.3) - Coming soon
// ============================================
// export { analyzeExam } from './ai/diagnostic.js';
