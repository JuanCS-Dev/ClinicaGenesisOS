/**
 * PIX Configuration
 * =================
 *
 * Reads PIX settings from environment variables.
 *
 * Add these to your .env file:
 *
 * VITE_PIX_KEY=sua_chave_pix
 * VITE_PIX_KEY_TYPE=cpf
 * VITE_PIX_RECEIVER_NAME=CLINICA GENESIS
 * VITE_PIX_RECEIVER_CITY=SAO PAULO
 * VITE_PIX_ENABLED=true
 */

import type { PixKeyType } from '@/types/payment';

/**
 * PIX configuration from environment.
 */
export const PIX_CONFIG = {
  /** PIX key (CPF, CNPJ, email, phone, or random key) */
  pixKey: import.meta.env.VITE_PIX_KEY || '',

  /** Key type */
  pixKeyType: (import.meta.env.VITE_PIX_KEY_TYPE || 'cpf') as PixKeyType,

  /** Receiver name (shown in payer's app) */
  receiverName: import.meta.env.VITE_PIX_RECEIVER_NAME || 'CLINICA GENESIS',

  /** Receiver city */
  receiverCity: import.meta.env.VITE_PIX_RECEIVER_CITY || 'SAO PAULO',

  /** Whether PIX is enabled */
  enabled: import.meta.env.VITE_PIX_ENABLED === 'true',
} as const;

/**
 * Check if PIX is properly configured.
 */
export function isPixConfigured(): boolean {
  return PIX_CONFIG.enabled && PIX_CONFIG.pixKey.length > 0;
}

