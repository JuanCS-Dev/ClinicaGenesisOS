/**
 * Encryption Module for TISS
 *
 * Provides secure encryption/decryption for sensitive data like certificates.
 * Uses AES-256-GCM with Firebase-managed encryption keys.
 *
 * @module functions/tiss/encryption
 */

import * as crypto from 'crypto';
import { defineString } from 'firebase-functions/params';
import type { EncryptionResult, DecryptionRequest } from './types';

// =============================================================================
// CONFIGURATION
// =============================================================================

/**
 * Encryption key from Firebase secrets.
 * Must be 32 bytes (256 bits) for AES-256.
 * Generate with: openssl rand -base64 32
 */
const ENCRYPTION_KEY = defineString('TISS_ENCRYPTION_KEY', {
  description: 'AES-256 encryption key for TISS certificates (base64)',
});

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 128 bits

// =============================================================================
// ENCRYPTION FUNCTIONS
// =============================================================================

/**
 * Get the encryption key buffer.
 * Derives a 32-byte key from the configured secret.
 */
function getKeyBuffer(): Buffer {
  const keyString = ENCRYPTION_KEY.value();

  if (!keyString) {
    throw new Error(
      'TISS_ENCRYPTION_KEY not configured. ' +
        'Run: firebase functions:secrets:set TISS_ENCRYPTION_KEY'
    );
  }

  // If key is base64, decode it
  if (keyString.length === 44 && keyString.endsWith('=')) {
    return Buffer.from(keyString, 'base64');
  }

  // Otherwise, derive 32 bytes using SHA-256
  return crypto.createHash('sha256').update(keyString).digest();
}

/**
 * Encrypt sensitive data using AES-256-GCM.
 *
 * @param plaintext - Data to encrypt (string or buffer)
 * @returns Encrypted data with IV and auth tag
 *
 * @example
 * ```typescript
 * const result = encrypt(certificateBuffer.toString('base64'));
 * // Store result.encryptedData, result.iv, result.authTag
 * ```
 */
export function encrypt(plaintext: string | Buffer): EncryptionResult {
  const key = getKeyBuffer();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const data = typeof plaintext === 'string' ? plaintext : plaintext.toString('base64');

  let encrypted = cipher.update(data, 'utf8', 'base64');
  encrypted += cipher.final('base64');

  const authTag = cipher.getAuthTag();

  return {
    encryptedData: encrypted,
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64'),
  };
}

/**
 * Decrypt data encrypted with encrypt().
 *
 * @param request - Encrypted data, IV, and auth tag
 * @returns Decrypted plaintext
 *
 * @example
 * ```typescript
 * const plaintext = decrypt({
 *   encryptedData: stored.encryptedData,
 *   iv: stored.iv,
 *   authTag: stored.authTag,
 * });
 * ```
 */
export function decrypt(request: DecryptionRequest): string {
  const key = getKeyBuffer();
  const iv = Buffer.from(request.iv, 'base64');
  const authTag = Buffer.from(request.authTag, 'base64');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(request.encryptedData, 'base64', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Encrypt a certificate PFX file for storage.
 *
 * @param pfxBase64 - Base64-encoded PFX file
 * @param password - Certificate password
 * @returns Encrypted certificate data
 */
export function encryptCertificate(
  pfxBase64: string,
  password: string
): { certificate: EncryptionResult; password: EncryptionResult } {
  return {
    certificate: encrypt(pfxBase64),
    password: encrypt(password),
  };
}

/**
 * Decrypt a stored certificate.
 *
 * @param encryptedCert - Encrypted certificate data
 * @param encryptedPassword - Encrypted password data
 * @returns Decrypted certificate and password
 */
export function decryptCertificate(
  encryptedCert: DecryptionRequest,
  encryptedPassword: DecryptionRequest
): { pfxBase64: string; password: string } {
  return {
    pfxBase64: decrypt(encryptedCert),
    password: decrypt(encryptedPassword),
  };
}

/**
 * Generate a secure random encryption key.
 * Use this to generate the TISS_ENCRYPTION_KEY secret.
 *
 * @returns Base64-encoded 32-byte key
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('base64');
}

/**
 * Hash sensitive data for logging/comparison without exposing it.
 *
 * @param data - Data to hash
 * @returns SHA-256 hash (first 16 chars)
 */
export function hashForLog(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16);
}
