/**
 * Multi-tenant configuration utilities
 *
 * IMPORTANTE: Usamos SOMENTE Vertex AI para inferência Gemini.
 * Não usamos Google AI Studio nem API keys separadas.
 * O Vertex AI usa ADC (Application Default Credentials) automaticamente.
 */

import { getFirestore } from 'firebase-admin/firestore';

const MVP_MODE = process.env.MVP_MODE === 'true';
const SHARED_WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const SHARED_WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID;

// Vertex AI configuration
const VERTEX_PROJECT = process.env.GOOGLE_CLOUD_PROJECT || 'clinica-genesis-os-e689e';
// Gemini 2.5 Flash only available in us-central1 (not southamerica-east1)
const VERTEX_LOCATION = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';

interface AIConfig {
  enabled: boolean;
  features?: {
    scribe: boolean;
    diagnosticHelper: boolean;
  };
}

interface WhatsAppConfig {
  enabled: boolean;
  phoneNumberId: string;
  accessToken: string;
  businessAccountId: string;
}

interface ClinicIntegrations {
  ai?: AIConfig;
  whatsapp?: WhatsAppConfig;
}

/**
 * Get clinic integrations config from Firestore.
 */
async function getClinicIntegrations(
  clinicId: string
): Promise<ClinicIntegrations | null> {
  const db = getFirestore();
  const doc = await db
    .collection('clinics')
    .doc(clinicId)
    .collection('settings')
    .doc('integrations')
    .get();

  return doc.exists ? (doc.data() as ClinicIntegrations) : null;
}

// Lazy-loaded Vertex AI client
let vertexAIClient: import('@google/genai').GoogleGenAI | null = null;

/**
 * Get Vertex AI client (lazy initialization).
 *
 * Usa ADC (Application Default Credentials) - não precisa de API key.
 * No Cloud Functions, as credenciais são automáticas.
 */
export async function getVertexAIClient(): Promise<import('@google/genai').GoogleGenAI> {
  if (!vertexAIClient) {
    const { GoogleGenAI } = await import('@google/genai');
    vertexAIClient = new GoogleGenAI({
      vertexai: true,
      project: VERTEX_PROJECT,
      location: VERTEX_LOCATION,
    });
  }
  return vertexAIClient;
}

/**
 * Get WhatsApp config for a clinic.
 * MVP: Uses shared credentials
 * Production: Uses clinic's own WhatsApp Business account
 */
export async function getWhatsAppConfig(clinicId?: string): Promise<{
  token: string;
  phoneNumberId: string;
}> {
  // MVP: Always use shared credentials
  if (MVP_MODE || !clinicId) {
    if (!SHARED_WHATSAPP_TOKEN || !SHARED_WHATSAPP_PHONE_ID) {
      throw new Error('WhatsApp credentials not configured');
    }
    return {
      token: SHARED_WHATSAPP_TOKEN,
      phoneNumberId: SHARED_WHATSAPP_PHONE_ID,
    };
  }

  // Production: Check clinic config
  const integrations = await getClinicIntegrations(clinicId);

  if (!integrations?.whatsapp?.enabled) {
    throw new Error(`WhatsApp not enabled for clinic ${clinicId}`);
  }

  return {
    token: integrations.whatsapp.accessToken,
    phoneNumberId: integrations.whatsapp.phoneNumberId,
  };
}

/**
 * Check if a feature is available for a clinic.
 */
export async function isFeatureEnabled(
  clinicId: string,
  feature: 'whatsapp' | 'ai-scribe' | 'ai-diagnostic'
): Promise<boolean> {
  // MVP: All AI features enabled (Vertex AI usa ADC, sempre disponível)
  if (MVP_MODE) {
    switch (feature) {
      case 'whatsapp':
        return !!SHARED_WHATSAPP_TOKEN;
      case 'ai-scribe':
      case 'ai-diagnostic':
        return true; // Vertex AI sempre disponível via ADC
    }
  }

  // Production: Check clinic config
  const integrations = await getClinicIntegrations(clinicId);

  switch (feature) {
    case 'whatsapp':
      return integrations?.whatsapp?.enabled ?? false;
    case 'ai-scribe':
      return integrations?.ai?.features?.scribe ?? false;
    case 'ai-diagnostic':
      return integrations?.ai?.features?.diagnosticHelper ?? false;
    default:
      return false;
  }
}
