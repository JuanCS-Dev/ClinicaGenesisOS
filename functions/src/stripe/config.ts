/**
 * Stripe Configuration
 * ====================
 *
 * Stripe client initialization and configuration.
 * Fase 10: Payment Integration (PIX + Boleto)
 *
 * Environment variables required:
 * - STRIPE_SECRET_KEY: Stripe secret API key
 * - STRIPE_WEBHOOK_SECRET: Webhook signing secret
 */

import Stripe from 'stripe';

// Environment variables
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

// ============ PIX Constants ============

/**
 * Default PIX expiration time in minutes.
 */
export const DEFAULT_PIX_EXPIRATION_MINUTES = 60;

/**
 * Minimum amount for PIX payment in cents (R$ 1,00).
 */
export const MIN_PIX_AMOUNT = 100;

/**
 * Maximum amount for PIX payment in cents (R$ 100.000,00).
 */
export const MAX_PIX_AMOUNT = 10000000;

// ============ Boleto Constants ============

/**
 * Default Boleto expiration time in days.
 */
export const DEFAULT_BOLETO_EXPIRATION_DAYS = 3;

/**
 * Minimum amount for Boleto payment in cents (R$ 5,00).
 */
export const MIN_BOLETO_AMOUNT = 500;

/**
 * Maximum amount for Boleto payment in cents (R$ 100.000,00).
 */
export const MAX_BOLETO_AMOUNT = 10000000;

/**
 * Validates that Stripe is configured.
 */
export function validateStripeConfig(): void {
  if (!STRIPE_SECRET_KEY) {
    throw new Error(
      'STRIPE_SECRET_KEY not configured. ' +
        'Set it via Firebase Functions config or environment variable.'
    );
  }
}

/**
 * Validates webhook secret is configured.
 */
export function validateWebhookConfig(): void {
  if (!STRIPE_WEBHOOK_SECRET) {
    throw new Error(
      'STRIPE_WEBHOOK_SECRET not configured. ' +
        'Set it via Firebase Functions config or environment variable.'
    );
  }
}

/**
 * Get Stripe client instance.
 * Lazy-loaded to avoid initialization errors when not configured.
 */
let stripeClient: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (!stripeClient) {
    validateStripeConfig();
    stripeClient = new Stripe(STRIPE_SECRET_KEY!);
  }
  return stripeClient;
}

/**
 * Get webhook signing secret.
 */
export function getWebhookSecret(): string {
  validateWebhookConfig();
  return STRIPE_WEBHOOK_SECRET!;
}

/**
 * Check if Stripe is configured (for feature flags).
 */
export function isStripeConfigured(): boolean {
  return !!STRIPE_SECRET_KEY;
}

