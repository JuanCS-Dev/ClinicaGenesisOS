/**
 * Multi-tenant configuration utilities
 *
 * IMPORTANTE: Usamos SOMENTE Vertex AI para inferência Gemini.
 * Não usamos Google AI Studio nem API keys separadas.
 * O Vertex AI usa ADC (Application Default Credentials) automaticamente.
 *
 * @module functions/utils/config
 */

import { getFirestore } from 'firebase-admin/firestore'
import {
  WHATSAPP_ACCESS_TOKEN,
  WHATSAPP_PHONE_ID,
  getSecretOrUndefined,
} from '../config/secrets.js'

// =============================================================================
// ENVIRONMENT CONFIG (non-secrets)
// =============================================================================

/** MVP mode flag - enables shared credentials */
const MVP_MODE = process.env.MVP_MODE === 'true'

/** Vertex AI project ID (uses ADC, not a secret) */
const VERTEX_PROJECT = process.env.GOOGLE_CLOUD_PROJECT || 'clinica-genesis-os-e689e'

/** Vertex AI location - Gemini 2.5 Flash only available in us-central1 */
const VERTEX_LOCATION = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1'

interface AIConfig {
  enabled: boolean
  features?: {
    scribe: boolean
    diagnosticHelper: boolean
  }
}

interface WhatsAppConfig {
  enabled: boolean
  phoneNumberId: string
  accessToken: string
  businessAccountId: string
}

interface ClinicIntegrations {
  ai?: AIConfig
  whatsapp?: WhatsAppConfig
}

/**
 * Get clinic integrations config from Firestore.
 */
async function getClinicIntegrations(clinicId: string): Promise<ClinicIntegrations | null> {
  const db = getFirestore()
  const doc = await db
    .collection('clinics')
    .doc(clinicId)
    .collection('settings')
    .doc('integrations')
    .get()

  return doc.exists ? (doc.data() as ClinicIntegrations) : null
}

// Lazy-loaded Vertex AI client
let vertexAIClient: import('@google/genai').GoogleGenAI | null = null

/**
 * Get Vertex AI client (lazy initialization).
 *
 * Usa ADC (Application Default Credentials) - não precisa de API key.
 * No Cloud Functions, as credenciais são automáticas.
 */
export async function getVertexAIClient(): Promise<import('@google/genai').GoogleGenAI> {
  if (!vertexAIClient) {
    const { GoogleGenAI } = await import('@google/genai')
    vertexAIClient = new GoogleGenAI({
      vertexai: true,
      project: VERTEX_PROJECT,
      location: VERTEX_LOCATION,
    })
  }
  return vertexAIClient
}

/**
 * Get WhatsApp config for a clinic.
 *
 * MVP: Uses shared credentials from Secret Manager
 * Production: Uses clinic's own WhatsApp Business account from Firestore
 *
 * IMPORTANT: Only call this inside a Cloud Function that has
 * WHATSAPP_SECRETS declared in its secrets array.
 *
 * @throws {Error} If WhatsApp is not configured
 */
export async function getWhatsAppConfig(clinicId?: string): Promise<{
  token: string
  phoneNumberId: string
}> {
  // MVP: Always use shared credentials from Secret Manager
  if (MVP_MODE || !clinicId) {
    const token = getSecretOrUndefined(WHATSAPP_ACCESS_TOKEN)
    const phoneId = getSecretOrUndefined(WHATSAPP_PHONE_ID)

    if (!token || !phoneId) {
      throw new Error(
        'WhatsApp credentials not configured. ' +
          'Run: firebase functions:secrets:set WHATSAPP_ACCESS_TOKEN && ' +
          'firebase functions:secrets:set WHATSAPP_PHONE_ID'
      )
    }

    return {
      token,
      phoneNumberId: phoneId,
    }
  }

  // Production: Check clinic config in Firestore
  const integrations = await getClinicIntegrations(clinicId)

  if (!integrations?.whatsapp?.enabled) {
    throw new Error(`WhatsApp not enabled for clinic ${clinicId}`)
  }

  return {
    token: integrations.whatsapp.accessToken,
    phoneNumberId: integrations.whatsapp.phoneNumberId,
  }
}

/**
 * Check if a feature is available for a clinic.
 *
 * @param clinicId - Clinic ID
 * @param feature - Feature to check
 * @returns true if feature is enabled
 */
export async function isFeatureEnabled(
  clinicId: string,
  feature: 'whatsapp' | 'ai-scribe' | 'ai-diagnostic'
): Promise<boolean> {
  // MVP: All AI features enabled (Vertex AI usa ADC, sempre disponível)
  if (MVP_MODE) {
    switch (feature) {
      case 'whatsapp': {
        const token = getSecretOrUndefined(WHATSAPP_ACCESS_TOKEN)
        return !!token
      }
      case 'ai-scribe':
      case 'ai-diagnostic':
        return true // Vertex AI sempre disponível via ADC
    }
  }

  // Production: Check clinic config in Firestore
  const integrations = await getClinicIntegrations(clinicId)

  switch (feature) {
    case 'whatsapp':
      return integrations?.whatsapp?.enabled ?? false
    case 'ai-scribe':
      return integrations?.ai?.features?.scribe ?? false
    case 'ai-diagnostic':
      return integrations?.ai?.features?.diagnosticHelper ?? false
    default:
      return false
  }
}
