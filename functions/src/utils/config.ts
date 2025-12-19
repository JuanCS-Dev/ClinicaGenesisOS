/**
 * Multi-tenant configuration utilities
 *
 * MVP: Uses shared keys from environment
 * Production: Fetches clinic-specific keys from Firestore
 */

import { getFirestore } from 'firebase-admin/firestore';
import { GoogleGenerativeAI } from '@google/generative-ai';

const MVP_MODE = process.env.MVP_MODE === 'true';
const SHARED_AI_KEY = process.env.GOOGLE_AI_API_KEY;
const SHARED_WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const SHARED_WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID;

interface AIConfig {
  enabled: boolean;
  provider: 'google-ai-studio' | 'vertex-ai';
  apiKey?: string;
  useSharedKey: boolean;
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

/**
 * Get AI client for a clinic.
 * MVP: Uses shared key
 * Production: Uses clinic's own key if configured
 */
export async function getAIClient(
  clinicId?: string
): Promise<GoogleGenerativeAI> {
  // MVP: Always use shared key
  if (MVP_MODE || !clinicId) {
    if (!SHARED_AI_KEY) {
      throw new Error('GOOGLE_AI_API_KEY not configured');
    }
    return new GoogleGenerativeAI(SHARED_AI_KEY);
  }

  // Production: Check clinic config
  const integrations = await getClinicIntegrations(clinicId);

  if (!integrations?.ai?.enabled) {
    throw new Error(`AI not enabled for clinic ${clinicId}`);
  }

  if (integrations.ai.useSharedKey || !integrations.ai.apiKey) {
    if (!SHARED_AI_KEY) {
      throw new Error('GOOGLE_AI_API_KEY not configured');
    }
    return new GoogleGenerativeAI(SHARED_AI_KEY);
  }

  // Use clinic's own key
  return new GoogleGenerativeAI(integrations.ai.apiKey);
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
  // MVP: All features enabled if env vars are set
  if (MVP_MODE) {
    switch (feature) {
      case 'whatsapp':
        return !!SHARED_WHATSAPP_TOKEN;
      case 'ai-scribe':
      case 'ai-diagnostic':
        return !!SHARED_AI_KEY;
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
