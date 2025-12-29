/**
 * Encryption Module for TISS
 *
 * Provides secure encryption/decryption for sensitive data like certificates.
 * Uses AES-256-GCM with Firebase Secret Manager for key storage.
 *
 * SECURITY:
 * - Keys are stored in Secret Manager, not .env files
 * - IV is randomly generated for each encryption
 * - AuthTag ensures data integrity
 * - Never log plaintext values
 *
 * @module functions/tiss/encryption
 */

import * as crypto from 'crypto'
import {
  TISS_ENCRYPTION_KEY,
  validateSecret,
  isValidBase64Key,
  hashForLog,
} from '../config/secrets'
import type { EncryptionResult, DecryptionRequest } from './types'

// =============================================================================
// CONSTANTS
// =============================================================================

const ALGORITHM = 'aes-256-gcm' as const
const IV_LENGTH = 16 // 128 bits
const AUTH_TAG_LENGTH = 16 // 128 bits

// =============================================================================
// KEY MANAGEMENT
// =============================================================================

/**
 * Error thrown for encryption-related failures.
 */
export class EncryptionError extends Error {
  constructor(
    message: string,
    public readonly code:
      | 'KEY_NOT_CONFIGURED'
      | 'INVALID_KEY_FORMAT'
      | 'ENCRYPTION_FAILED'
      | 'DECRYPTION_FAILED'
      | 'INTEGRITY_CHECK_FAILED'
  ) {
    super(message)
    this.name = 'EncryptionError'
  }
}

/**
 * Get the encryption key buffer from Secret Manager.
 *
 * Supports two key formats:
 * 1. Base64-encoded 32-byte key (preferred)
 * 2. Arbitrary string (derives 32 bytes via SHA-256)
 *
 * @returns 32-byte key buffer
 * @throws {EncryptionError} If key is not configured or invalid
 */
function getKeyBuffer(): Buffer {
  const keyString = validateSecret(TISS_ENCRYPTION_KEY, 'TISS_ENCRYPTION_KEY')

  // Prefer base64-encoded 32-byte key
  if (isValidBase64Key(keyString)) {
    return Buffer.from(keyString, 'base64')
  }

  // Fallback: derive 32 bytes using SHA-256
  console.warn(
    'TISS_ENCRYPTION_KEY is not in base64 format. ' +
      'Consider regenerating with: openssl rand -base64 32'
  )

  return crypto.createHash('sha256').update(keyString).digest()
}

// =============================================================================
// ENCRYPTION FUNCTIONS
// =============================================================================

/**
 * Encrypt sensitive data using AES-256-GCM.
 *
 * @param plaintext - Data to encrypt (string or buffer)
 * @returns Encrypted data with IV and auth tag
 *
 * @example
 * ```typescript
 * const result = encrypt(certificateBuffer.toString('base64'));
 * // Store: result.encryptedData, result.iv, result.authTag
 * ```
 */
export function encrypt(plaintext: string | Buffer): EncryptionResult {
  try {
    const key = getKeyBuffer()
    const iv = crypto.randomBytes(IV_LENGTH)
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

    const data = typeof plaintext === 'string' ? plaintext : plaintext.toString('base64')

    let encrypted = cipher.update(data, 'utf8', 'base64')
    encrypted += cipher.final('base64')

    const authTag = cipher.getAuthTag()

    return {
      encryptedData: encrypted,
      iv: iv.toString('base64'),
      authTag: authTag.toString('base64'),
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    throw new EncryptionError(`Encryption failed: ${message}`, 'ENCRYPTION_FAILED')
  }
}

/**
 * Decrypt data encrypted with encrypt().
 *
 * @param request - Encrypted data, IV, and auth tag
 * @returns Decrypted plaintext
 *
 * @throws {EncryptionError} If decryption fails or integrity check fails
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
  try {
    const key = getKeyBuffer()
    const iv = Buffer.from(request.iv, 'base64')
    const authTag = Buffer.from(request.authTag, 'base64')

    // Validate IV and authTag lengths
    if (iv.length !== IV_LENGTH) {
      throw new EncryptionError(
        `Invalid IV length: expected ${IV_LENGTH}, got ${iv.length}`,
        'DECRYPTION_FAILED'
      )
    }

    if (authTag.length !== AUTH_TAG_LENGTH) {
      throw new EncryptionError(
        `Invalid authTag length: expected ${AUTH_TAG_LENGTH}, got ${authTag.length}`,
        'DECRYPTION_FAILED'
      )
    }

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(authTag)

    let decrypted = decipher.update(request.encryptedData, 'base64', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  } catch (error) {
    if (error instanceof EncryptionError) {
      throw error
    }

    const message = error instanceof Error ? error.message : 'Unknown error'

    // GCM auth tag verification failure
    if (message.includes('Unsupported state') || message.includes('auth')) {
      throw new EncryptionError(
        'Data integrity check failed. Data may have been tampered with.',
        'INTEGRITY_CHECK_FAILED'
      )
    }

    throw new EncryptionError(`Decryption failed: ${message}`, 'DECRYPTION_FAILED')
  }
}

// =============================================================================
// CERTIFICATE ENCRYPTION
// =============================================================================

/**
 * Encrypt a certificate PFX file for secure storage.
 *
 * @param pfxBase64 - Base64-encoded PFX file
 * @param password - Certificate password
 * @returns Encrypted certificate and password
 */
export function encryptCertificate(
  pfxBase64: string,
  password: string
): { certificate: EncryptionResult; password: EncryptionResult } {
  return {
    certificate: encrypt(pfxBase64),
    password: encrypt(password),
  }
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
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Generate a secure random encryption key.
 * Use this to generate the TISS_ENCRYPTION_KEY secret.
 *
 * @returns Base64-encoded 32-byte key (44 characters)
 *
 * @example
 * ```bash
 * # Generate key via CLI
 * openssl rand -base64 32
 *
 * # Or use this function and set via Firebase
 * firebase functions:secrets:set TISS_ENCRYPTION_KEY
 * ```
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('base64')
}

/**
 * Hash sensitive data for safe logging.
 *
 * @param data - Data to hash
 * @returns SHA-256 hash (first 16 chars)
 */
export function hashDataForLog(data: string): string {
  return hashForLog(data)
}

// Re-export hashForLog for backwards compatibility
export { hashForLog } from '../config/secrets.js'
