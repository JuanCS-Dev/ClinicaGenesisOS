/**
 * Webhook Authentication Middleware
 *
 * Provides HMAC-SHA256 signature verification for incoming webhooks.
 * Ensures webhook payloads are authentic and haven't been tampered with.
 *
 * @module functions/middleware/webhook-auth
 */

import { createHmac, timingSafeEqual } from 'crypto'
import { logger } from 'firebase-functions'

// =============================================================================
// TYPES
// =============================================================================

export interface WebhookValidationResult {
  isValid: boolean
  error?: string
}

// =============================================================================
// SIGNATURE VERIFICATION
// =============================================================================

/**
 * Verify webhook signature using HMAC-SHA256.
 *
 * Supports two signature formats:
 * - `sha256=<hex>` (GitHub style)
 * - `<hex>` (plain hex)
 *
 * Uses timing-safe comparison to prevent timing attacks.
 *
 * @param payload - Raw request body as string
 * @param signature - Signature from X-Signature header
 * @param secret - Webhook secret for HMAC
 * @returns True if signature is valid
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  if (!payload || !signature || !secret) {
    return false
  }

  const expectedSignature = createHmac('sha256', secret).update(payload).digest('hex')

  // Support both formats: "sha256=<hex>" and plain "<hex>"
  const providedHex = signature.startsWith('sha256=') ? signature.slice(7) : signature

  // Use timing-safe comparison to prevent timing attacks
  try {
    return timingSafeEqual(Buffer.from(providedHex, 'hex'), Buffer.from(expectedSignature, 'hex'))
  } catch {
    // Buffer lengths don't match or invalid hex
    return false
  }
}

/**
 * Validate an incoming webhook request.
 *
 * Checks:
 * 1. Webhook secret is configured for the clinic
 * 2. X-Signature header is present
 * 3. Signature matches payload
 *
 * @param payload - Raw request body
 * @param signatureHeader - Value of X-Signature header
 * @param webhookSecret - Secret from clinic settings (optional = not configured)
 * @param requireSignature - If true, reject requests when no secret is configured
 * @returns Validation result with error message if invalid
 */
export function validateWebhookRequest(
  payload: string,
  signatureHeader: string | undefined,
  webhookSecret: string | undefined,
  requireSignature: boolean = true
): WebhookValidationResult {
  // If no secret is configured
  if (!webhookSecret) {
    if (requireSignature) {
      logger.warn('Webhook secret not configured, rejecting request')
      return {
        isValid: false,
        error: 'Webhook signature verification not configured. Contact administrator.',
      }
    }
    // Allow request but log warning
    logger.warn('Webhook secret not configured, allowing request (not recommended)')
    return { isValid: true }
  }

  // Secret configured but no signature provided
  if (!signatureHeader) {
    logger.warn('Missing X-Signature header for authenticated webhook')
    return {
      isValid: false,
      error: 'Missing X-Signature header',
    }
  }

  // Verify signature
  const isValid = verifyWebhookSignature(payload, signatureHeader, webhookSecret)

  if (!isValid) {
    logger.warn('Invalid webhook signature')
    return {
      isValid: false,
      error: 'Invalid signature',
    }
  }

  return { isValid: true }
}

/**
 * Generate a webhook signature for testing or outgoing webhooks.
 *
 * @param payload - Request body
 * @param secret - Webhook secret
 * @param format - Signature format ('sha256' prefix or 'plain')
 * @returns Signature string
 */
export function generateWebhookSignature(
  payload: string,
  secret: string,
  format: 'sha256' | 'plain' = 'sha256'
): string {
  const signature = createHmac('sha256', secret).update(payload).digest('hex')
  return format === 'sha256' ? `sha256=${signature}` : signature
}
