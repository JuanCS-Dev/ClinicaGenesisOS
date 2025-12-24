/**
 * AI Configuration Types
 *
 * Types for AI integration configuration.
 */

import type { AIProvider } from './providers';
import type { WhatsAppConfig } from './whatsapp';

/**
 * AI integration config per clinic.
 * Stored in /clinics/{clinicId}/settings/integrations
 */
export interface AIConfig {
  enabled: boolean;
  provider: AIProvider;
  apiKey?: string; // Encrypted, only if client provides own key
  useSharedKey: boolean; // MVP: true (uses our key)
  features: {
    scribe: boolean;
    diagnosticHelper: boolean;
  };
}

/**
 * All integrations for a clinic.
 * Stored in /clinics/{clinicId}/settings/integrations
 */
export interface ClinicIntegrations {
  whatsapp?: WhatsAppConfig;
  ai?: AIConfig;
  updatedAt: string;
  updatedBy: string;
}
