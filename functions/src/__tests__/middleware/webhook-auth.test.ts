/**
 * Webhook Authentication Middleware Tests
 *
 * Tests for HMAC-SHA256 signature verification.
 */

import { describe, it, expect } from 'vitest'
import {
  verifyWebhookSignature,
  validateWebhookRequest,
  generateWebhookSignature,
} from '../../middleware/webhook-auth'

describe('webhook-auth middleware', () => {
  const TEST_SECRET = 'test-secret-key-12345'
  const TEST_PAYLOAD = JSON.stringify({ data: 'test-payload', timestamp: 1234567890 })

  describe('generateWebhookSignature', () => {
    it('generates sha256 prefixed signature by default', () => {
      const signature = generateWebhookSignature(TEST_PAYLOAD, TEST_SECRET)
      expect(signature).toMatch(/^sha256=[a-f0-9]{64}$/)
    })

    it('generates plain signature when format is plain', () => {
      const signature = generateWebhookSignature(TEST_PAYLOAD, TEST_SECRET, 'plain')
      expect(signature).toMatch(/^[a-f0-9]{64}$/)
    })

    it('generates consistent signatures for same input', () => {
      const sig1 = generateWebhookSignature(TEST_PAYLOAD, TEST_SECRET)
      const sig2 = generateWebhookSignature(TEST_PAYLOAD, TEST_SECRET)
      expect(sig1).toBe(sig2)
    })

    it('generates different signatures for different payloads', () => {
      const sig1 = generateWebhookSignature(TEST_PAYLOAD, TEST_SECRET)
      const sig2 = generateWebhookSignature('different-payload', TEST_SECRET)
      expect(sig1).not.toBe(sig2)
    })

    it('generates different signatures for different secrets', () => {
      const sig1 = generateWebhookSignature(TEST_PAYLOAD, TEST_SECRET)
      const sig2 = generateWebhookSignature(TEST_PAYLOAD, 'different-secret')
      expect(sig1).not.toBe(sig2)
    })
  })

  describe('verifyWebhookSignature', () => {
    it('validates correct sha256 prefixed signature', () => {
      const signature = generateWebhookSignature(TEST_PAYLOAD, TEST_SECRET, 'sha256')
      const isValid = verifyWebhookSignature(TEST_PAYLOAD, signature, TEST_SECRET)
      expect(isValid).toBe(true)
    })

    it('validates correct plain signature', () => {
      const signature = generateWebhookSignature(TEST_PAYLOAD, TEST_SECRET, 'plain')
      const isValid = verifyWebhookSignature(TEST_PAYLOAD, signature, TEST_SECRET)
      expect(isValid).toBe(true)
    })

    it('rejects invalid signature', () => {
      const isValid = verifyWebhookSignature(TEST_PAYLOAD, 'sha256=invalid', TEST_SECRET)
      expect(isValid).toBe(false)
    })

    it('rejects tampered payload', () => {
      const signature = generateWebhookSignature(TEST_PAYLOAD, TEST_SECRET)
      const isValid = verifyWebhookSignature('tampered-payload', signature, TEST_SECRET)
      expect(isValid).toBe(false)
    })

    it('rejects wrong secret', () => {
      const signature = generateWebhookSignature(TEST_PAYLOAD, TEST_SECRET)
      const isValid = verifyWebhookSignature(TEST_PAYLOAD, signature, 'wrong-secret')
      expect(isValid).toBe(false)
    })

    it('returns false for empty inputs', () => {
      expect(verifyWebhookSignature('', 'sig', TEST_SECRET)).toBe(false)
      expect(verifyWebhookSignature(TEST_PAYLOAD, '', TEST_SECRET)).toBe(false)
      expect(verifyWebhookSignature(TEST_PAYLOAD, 'sig', '')).toBe(false)
    })

    it('handles malformed hex in signature gracefully', () => {
      const isValid = verifyWebhookSignature(TEST_PAYLOAD, 'sha256=not-valid-hex', TEST_SECRET)
      expect(isValid).toBe(false)
    })
  })

  describe('validateWebhookRequest', () => {
    describe('when requireSignature is true', () => {
      it('rejects request when webhook secret is not configured', () => {
        const result = validateWebhookRequest(TEST_PAYLOAD, undefined, undefined, true)
        expect(result.isValid).toBe(false)
        expect(result.error).toContain('not configured')
      })

      it('rejects request when signature header is missing', () => {
        const result = validateWebhookRequest(TEST_PAYLOAD, undefined, TEST_SECRET, true)
        expect(result.isValid).toBe(false)
        expect(result.error).toContain('Missing X-Signature')
      })

      it('rejects request with invalid signature', () => {
        const result = validateWebhookRequest(TEST_PAYLOAD, 'sha256=invalid', TEST_SECRET, true)
        expect(result.isValid).toBe(false)
        expect(result.error).toContain('Invalid signature')
      })

      it('accepts request with valid signature', () => {
        const signature = generateWebhookSignature(TEST_PAYLOAD, TEST_SECRET)
        const result = validateWebhookRequest(TEST_PAYLOAD, signature, TEST_SECRET, true)
        expect(result.isValid).toBe(true)
        expect(result.error).toBeUndefined()
      })
    })

    describe('when requireSignature is false', () => {
      it('allows request when webhook secret is not configured', () => {
        const result = validateWebhookRequest(TEST_PAYLOAD, undefined, undefined, false)
        expect(result.isValid).toBe(true)
      })

      it('still validates signature if secret is configured', () => {
        const result = validateWebhookRequest(TEST_PAYLOAD, 'sha256=invalid', TEST_SECRET, false)
        expect(result.isValid).toBe(false)
      })

      it('accepts valid signature when secret is configured', () => {
        const signature = generateWebhookSignature(TEST_PAYLOAD, TEST_SECRET)
        const result = validateWebhookRequest(TEST_PAYLOAD, signature, TEST_SECRET, false)
        expect(result.isValid).toBe(true)
      })
    })

    describe('security edge cases', () => {
      it('prevents timing attacks with constant-time comparison', () => {
        // This test verifies the function handles different-length inputs
        // without throwing errors (timing-safe comparison)
        const shortSig = 'sha256=abc'
        const result = validateWebhookRequest(TEST_PAYLOAD, shortSig, TEST_SECRET, true)
        expect(result.isValid).toBe(false)
      })

      it('handles unicode payloads correctly', () => {
        const unicodePayload = JSON.stringify({ message: 'Olá, tudo bem? 你好' })
        const signature = generateWebhookSignature(unicodePayload, TEST_SECRET)
        const result = validateWebhookRequest(unicodePayload, signature, TEST_SECRET, true)
        expect(result.isValid).toBe(true)
      })

      it('handles large payloads', () => {
        const largePayload = JSON.stringify({ data: 'x'.repeat(100000) })
        const signature = generateWebhookSignature(largePayload, TEST_SECRET)
        const result = validateWebhookRequest(largePayload, signature, TEST_SECRET, true)
        expect(result.isValid).toBe(true)
      })
    })
  })
})
