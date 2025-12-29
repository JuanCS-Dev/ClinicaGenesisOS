/**
 * Stripe Configuration
 *
 * Stripe client initialization with Secret Manager integration.
 * All secrets are injected at runtime via Firebase Secret Manager.
 *
 * @module functions/stripe/config
 */

import Stripe from 'stripe'
import {
  STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET,
  validateSecret,
  getSecretOrUndefined,
  hashForLog,
} from '../config/secrets.js'

// =============================================================================
// CONSTANTS
// =============================================================================

/**
 * Default PIX expiration time in minutes.
 */
export const DEFAULT_PIX_EXPIRATION_MINUTES = 60

/**
 * Minimum amount for PIX payment in cents (R$ 1,00).
 */
export const MIN_PIX_AMOUNT = 100

/**
 * Maximum amount for PIX payment in cents (R$ 100.000,00).
 */
export const MAX_PIX_AMOUNT = 10_000_000

/**
 * Default Boleto expiration time in days.
 */
export const DEFAULT_BOLETO_EXPIRATION_DAYS = 3

/**
 * Minimum amount for Boleto payment in cents (R$ 5,00).
 */
export const MIN_BOLETO_AMOUNT = 500

/**
 * Maximum amount for Boleto payment in cents (R$ 100.000,00).
 */
export const MAX_BOLETO_AMOUNT = 10_000_000

// =============================================================================
// STRIPE CLIENT
// =============================================================================

/**
 * Lazy-loaded Stripe client instance.
 * Initialized on first access to avoid startup errors.
 */
let stripeClient: Stripe | null = null

/**
 * Get the Stripe client instance.
 *
 * IMPORTANT: Only call this inside a Cloud Function that has
 * STRIPE_SECRET_KEY declared in its secrets array.
 *
 * @throws {SecretNotConfiguredError} If STRIPE_SECRET_KEY is not set
 *
 * @example
 * ```typescript
 * export const createPayment = onCall(
 *   { secrets: [STRIPE_SECRET_KEY] },
 *   async (request) => {
 *     const stripe = getStripeClient();
 *     // ...
 *   }
 * );
 * ```
 */
export function getStripeClient(): Stripe {
  if (!stripeClient) {
    const secretKey = validateSecret(STRIPE_SECRET_KEY, 'STRIPE_SECRET_KEY')

    stripeClient = new Stripe(secretKey, {
      apiVersion: '2025-12-15.clover',
      typescript: true,
    })

    // Log initialization with hashed key for debugging
    console.info(`Stripe client initialized (key: ${hashForLog(secretKey)})`)
  }

  return stripeClient
}

/**
 * Get the webhook signing secret.
 *
 * IMPORTANT: Only call this inside a Cloud Function that has
 * STRIPE_WEBHOOK_SECRET declared in its secrets array.
 *
 * @throws {SecretNotConfiguredError} If STRIPE_WEBHOOK_SECRET is not set
 */
export function getWebhookSecret(): string {
  return validateSecret(STRIPE_WEBHOOK_SECRET, 'STRIPE_WEBHOOK_SECRET')
}

/**
 * Check if Stripe is configured (secret key is available).
 *
 * @returns true if STRIPE_SECRET_KEY is set
 */
export function isStripeConfigured(): boolean {
  const secretKey = getSecretOrUndefined(STRIPE_SECRET_KEY)
  return !!secretKey
}

// =============================================================================
// VALIDATION
// =============================================================================

/**
 * Validates PIX payment amount.
 *
 * @param amount - Amount in cents
 * @throws {Error} If amount is outside allowed range
 */
export function validatePixAmount(amount: number): void {
  if (!Number.isInteger(amount)) {
    throw new Error('Amount must be an integer (cents)')
  }

  if (amount < MIN_PIX_AMOUNT) {
    throw new Error(`PIX amount must be at least R$ ${(MIN_PIX_AMOUNT / 100).toFixed(2)}`)
  }

  if (amount > MAX_PIX_AMOUNT) {
    throw new Error(`PIX amount cannot exceed R$ ${(MAX_PIX_AMOUNT / 100).toFixed(2)}`)
  }
}

/**
 * Validates Boleto payment amount.
 *
 * @param amount - Amount in cents
 * @throws {Error} If amount is outside allowed range
 */
export function validateBoletoAmount(amount: number): void {
  if (!Number.isInteger(amount)) {
    throw new Error('Amount must be an integer (cents)')
  }

  if (amount < MIN_BOLETO_AMOUNT) {
    throw new Error(`Boleto amount must be at least R$ ${(MIN_BOLETO_AMOUNT / 100).toFixed(2)}`)
  }

  if (amount > MAX_BOLETO_AMOUNT) {
    throw new Error(`Boleto amount cannot exceed R$ ${(MAX_BOLETO_AMOUNT / 100).toFixed(2)}`)
  }
}

/**
 * Validates CPF format (11 digits, no punctuation).
 *
 * @param cpf - CPF string
 * @throws {Error} If CPF format is invalid
 */
export function validateCPF(cpf: string): void {
  const cleanCPF = cpf.replace(/\D/g, '')

  if (cleanCPF.length !== 11) {
    throw new Error('CPF must have exactly 11 digits')
  }

  // Check for known invalid patterns
  if (/^(\d)\1+$/.test(cleanCPF)) {
    throw new Error('Invalid CPF')
  }
}
