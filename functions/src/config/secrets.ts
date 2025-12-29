/**
 * Centralized Secrets Management
 *
 * All secrets are managed via Firebase Secret Manager (Google Cloud Secret Manager).
 * Secrets are injected at runtime, never stored in code or .env files.
 *
 * SECURITY: Never log secret values. Use hashForLog() for debugging.
 *
 * @module functions/config/secrets
 */

import { defineSecret } from 'firebase-functions/params'
import * as crypto from 'crypto'

// =============================================================================
// SECRET DEFINITIONS
// =============================================================================

/**
 * Stripe API secret key for payment processing.
 * Required for: PIX payments, Boleto payments
 * Set via: firebase functions:secrets:set STRIPE_SECRET_KEY
 */
export const STRIPE_SECRET_KEY = defineSecret('STRIPE_SECRET_KEY')

/**
 * Stripe webhook signing secret for verifying webhook payloads.
 * Required for: Payment status webhooks
 * Set via: firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
 */
export const STRIPE_WEBHOOK_SECRET = defineSecret('STRIPE_WEBHOOK_SECRET')

/**
 * AES-256 encryption key for TISS certificate storage.
 * Must be 32 bytes (base64 encoded = 44 chars).
 * Generate: openssl rand -base64 32
 * Set via: firebase functions:secrets:set TISS_ENCRYPTION_KEY
 */
export const TISS_ENCRYPTION_KEY = defineSecret('TISS_ENCRYPTION_KEY')

/**
 * WhatsApp Cloud API access token.
 * Required for: Appointment reminders, patient communication
 * Set via: firebase functions:secrets:set WHATSAPP_ACCESS_TOKEN
 */
export const WHATSAPP_ACCESS_TOKEN = defineSecret('WHATSAPP_ACCESS_TOKEN')

/**
 * WhatsApp Phone Number ID.
 * Required for: Sending WhatsApp messages
 * Set via: firebase functions:secrets:set WHATSAPP_PHONE_ID
 */
export const WHATSAPP_PHONE_ID = defineSecret('WHATSAPP_PHONE_ID')

/**
 * WhatsApp webhook verification token.
 * Required for: Meta webhook verification handshake
 * Set via: firebase functions:secrets:set WHATSAPP_VERIFY_TOKEN
 */
export const WHATSAPP_VERIFY_TOKEN = defineSecret('WHATSAPP_VERIFY_TOKEN')

/**
 * Google Service Account JSON credentials.
 * Required for: Google Meet/Calendar API integration
 * Set via: firebase functions:secrets:set GOOGLE_SERVICE_ACCOUNT_JSON
 */
export const GOOGLE_SERVICE_ACCOUNT_JSON = defineSecret('GOOGLE_SERVICE_ACCOUNT_JSON')

/**
 * Azure OpenAI API key for GPT-4o-mini (Multi-LLM consensus).
 * Optional: Used as "Challenger" in diagnostic pipeline
 * Set via: firebase functions:secrets:set AZURE_OPENAI_KEY
 */
export const AZURE_OPENAI_KEY = defineSecret('AZURE_OPENAI_KEY')

// =============================================================================
// SECRET VALIDATION
// =============================================================================

/**
 * Error thrown when a required secret is not configured.
 */
export class SecretNotConfiguredError extends Error {
  constructor(
    public readonly secretName: string,
    public readonly setupCommand: string
  ) {
    super(`Secret '${secretName}' is not configured. ` + `Run: ${setupCommand}`)
    this.name = 'SecretNotConfiguredError'
  }
}

/**
 * Validates that a secret has a non-empty value.
 * Throws SecretNotConfiguredError if not configured.
 */
export function validateSecret(
  secret: ReturnType<typeof defineSecret>,
  secretName: string
): string {
  const value = secret.value()

  if (!value || value.trim() === '') {
    throw new SecretNotConfiguredError(secretName, `firebase functions:secrets:set ${secretName}`)
  }

  return value
}

/**
 * Safely gets a secret value, returning undefined if not configured.
 * Use when secret is optional.
 */
export function getSecretOrUndefined(secret: ReturnType<typeof defineSecret>): string | undefined {
  try {
    const value = secret.value()
    return value && value.trim() !== '' ? value : undefined
  } catch {
    return undefined
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Hash a secret value for safe logging.
 * Returns first 8 chars of SHA-256 hash with 'hash:' prefix.
 *
 * @example
 * console.log(`Using API key: ${hashForLog(apiKey)}`);
 * // Output: "Using API key: hash:a1b2c3d4"
 */
export function hashForLog(secret: string): string {
  const hash = crypto.createHash('sha256').update(secret).digest('hex')
  return `hash:${hash.substring(0, 8)}`
}

/**
 * Checks if a secret appears to be a valid base64-encoded 32-byte key.
 * Used for validating encryption keys.
 */
export function isValidBase64Key(value: string): boolean {
  if (value.length !== 44 || !value.endsWith('=')) {
    return false
  }

  try {
    const buffer = Buffer.from(value, 'base64')
    return buffer.length === 32
  } catch {
    return false
  }
}

// =============================================================================
// AGGREGATED EXPORTS FOR FUNCTION DECLARATIONS
// =============================================================================

/**
 * All secrets required for Stripe payment functions.
 * Use in function definition: { secrets: STRIPE_SECRETS }
 */
export const STRIPE_SECRETS = [STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET] as const

/**
 * All secrets required for TISS billing functions.
 * Use in function definition: { secrets: TISS_SECRETS }
 */
export const TISS_SECRETS = [TISS_ENCRYPTION_KEY] as const

/**
 * All secrets required for WhatsApp functions.
 * Use in function definition: { secrets: WHATSAPP_SECRETS }
 */
export const WHATSAPP_SECRETS = [
  WHATSAPP_ACCESS_TOKEN,
  WHATSAPP_PHONE_ID,
  WHATSAPP_VERIFY_TOKEN,
] as const

/**
 * All secrets required for Google Calendar/Meet functions.
 * Use in function definition: { secrets: GOOGLE_CALENDAR_SECRETS }
 */
export const GOOGLE_CALENDAR_SECRETS = [GOOGLE_SERVICE_ACCOUNT_JSON] as const

/**
 * All secrets required for Azure OpenAI functions.
 * Use in function definition: { secrets: AZURE_OPENAI_SECRETS }
 */
export const AZURE_OPENAI_SECRETS = [AZURE_OPENAI_KEY] as const

/**
 * All secrets used in the application.
 * Use in function definition for full access.
 */
export const ALL_SECRETS = [
  STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET,
  TISS_ENCRYPTION_KEY,
  WHATSAPP_ACCESS_TOKEN,
  WHATSAPP_PHONE_ID,
  WHATSAPP_VERIFY_TOKEN,
  GOOGLE_SERVICE_ACCOUNT_JSON,
  AZURE_OPENAI_KEY,
] as const
