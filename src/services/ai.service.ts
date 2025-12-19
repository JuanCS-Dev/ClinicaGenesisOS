/**
 * AI Service - Multi-tenant ready
 *
 * MVP: Uses shared Google AI Studio key (free tier)
 * Production: Each clinic can use their own Vertex AI key
 */

import type { AIConfig, AIProvider, AIMetadata } from '../types';

// MVP: Shared key from environment
const SHARED_AI_KEY = import.meta.env.VITE_GOOGLE_AI_API_KEY;
const MVP_MODE = import.meta.env.VITE_MVP_MODE === 'true';

/**
 * Get AI configuration for a clinic.
 * In MVP mode, always uses shared key.
 * In production, checks clinic settings for custom key.
 */
export function getAIConfig(clinicConfig?: AIConfig): {
  provider: AIProvider;
  apiKey: string;
  isShared: boolean;
} {
  // MVP: Always use shared key
  if (MVP_MODE || !clinicConfig || clinicConfig.useSharedKey) {
    return {
      provider: 'google-ai-studio',
      apiKey: SHARED_AI_KEY || '',
      isShared: true,
    };
  }

  // Production: Use clinic's own key
  return {
    provider: clinicConfig.provider,
    apiKey: clinicConfig.apiKey || '',
    isShared: false,
  };
}

/**
 * Create AI metadata for audit trail.
 */
export function createAIMetadata(
  model: string,
  promptVersion: string
): AIMetadata {
  return {
    generated: true,
    provider: MVP_MODE ? 'google-ai-studio' : 'vertex-ai',
    model,
    promptVersion,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Check if AI features are available for a clinic.
 */
export function isAIAvailable(clinicConfig?: AIConfig): boolean {
  // MVP: Always available if we have shared key
  if (MVP_MODE) {
    return !!SHARED_AI_KEY;
  }

  // Production: Check clinic config
  return clinicConfig?.enabled ?? false;
}

/**
 * Check if specific AI feature is enabled.
 */
export function isFeatureEnabled(
  feature: 'scribe' | 'diagnosticHelper',
  clinicConfig?: AIConfig
): boolean {
  if (!isAIAvailable(clinicConfig)) return false;

  // MVP: All features enabled
  if (MVP_MODE) return true;

  // Production: Check clinic config
  return clinicConfig?.features?.[feature] ?? false;
}

// Prompt versions for audit trail
export const PROMPT_VERSIONS = {
  SOAP_GENERATOR: 'v1.0.0',
  INFO_EXTRACTOR: 'v1.0.0',
  EXAM_ANALYZER: 'v1.0.0',
} as const;

// Model identifiers
export const AI_MODELS = {
  // Free tier model for MVP
  GEMINI_FLASH: 'gemini-2.5-flash-preview-05-20',
  // Native audio model
  GEMINI_FLASH_AUDIO: 'gemini-2.5-flash-native-audio-preview-12-2025',
} as const;
