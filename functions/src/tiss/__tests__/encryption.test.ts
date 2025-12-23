/**
 * Encryption Module Tests
 *
 * Tests for AES-256-GCM encryption/decryption of certificates.
 */

import { describe, it, expect, vi } from 'vitest';
import * as crypto from 'crypto';

// Fixed test key - 32 bytes base64 encoded (pre-generated)
const TEST_ENCRYPTION_KEY = 'K7gNU3sdo+OL0wNhqoVWhr3g6s1xYv72ol/pe/Unols=';

// Mock firebase-functions/params before importing module
vi.mock('firebase-functions/params', () => ({
  defineString: () => ({
    value: () => 'K7gNU3sdo+OL0wNhqoVWhr3g6s1xYv72ol/pe/Unols=',
  }),
}));

// Import after mocking
import {
  encrypt,
  decrypt,
  encryptCertificate,
  decryptCertificate,
  generateEncryptionKey,
  hashForLog,
} from '../encryption';

describe('encryption', () => {
  describe('encrypt', () => {
    it('should encrypt a string successfully', () => {
      const plaintext = 'Hello, World!';
      const result = encrypt(plaintext);

      expect(result).toHaveProperty('encryptedData');
      expect(result).toHaveProperty('iv');
      expect(result).toHaveProperty('authTag');
      expect(result.encryptedData).not.toBe(plaintext);
      expect(result.iv).toHaveLength(24); // 16 bytes base64
      expect(result.authTag).toHaveLength(24); // 16 bytes base64
    });

    it('should encrypt a buffer successfully', () => {
      const buffer = Buffer.from('Test data', 'utf8');
      const result = encrypt(buffer);

      expect(result).toHaveProperty('encryptedData');
      expect(result).toHaveProperty('iv');
      expect(result).toHaveProperty('authTag');
    });

    it('should produce different ciphertexts for same plaintext (different IVs)', () => {
      const plaintext = 'Same text';
      const result1 = encrypt(plaintext);
      const result2 = encrypt(plaintext);

      expect(result1.encryptedData).not.toBe(result2.encryptedData);
      expect(result1.iv).not.toBe(result2.iv);
    });

    it('should handle empty string', () => {
      const result = encrypt('');
      expect(result).toHaveProperty('encryptedData');
    });

    it('should handle large data', () => {
      const largeData = 'x'.repeat(100000);
      const result = encrypt(largeData);
      expect(result).toHaveProperty('encryptedData');
    });

    it('should handle special characters', () => {
      const special = '!@#$%^&*()_+-={}[]|\\:";\'<>?,./~`áéíóú中文日本語';
      const result = encrypt(special);
      expect(result).toHaveProperty('encryptedData');
    });
  });

  describe('decrypt', () => {
    it('should decrypt encrypted data correctly', () => {
      const plaintext = 'Hello, World!';
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('should handle empty string', () => {
      const encrypted = encrypt('');
      const decrypted = decrypt(encrypted);
      expect(decrypted).toBe('');
    });

    it('should handle large data', () => {
      const largeData = 'x'.repeat(100000);
      const encrypted = encrypt(largeData);
      const decrypted = decrypt(encrypted);
      expect(decrypted).toBe(largeData);
    });

    it('should handle special characters', () => {
      const special = '!@#$%^&*()_+-={}[]|\\:";\'<>?,./~`áéíóú中文日本語';
      const encrypted = encrypt(special);
      const decrypted = decrypt(encrypted);
      expect(decrypted).toBe(special);
    });

    it('should throw on tampered data', () => {
      const encrypted = encrypt('test');
      encrypted.encryptedData = 'tampered' + encrypted.encryptedData;

      expect(() => decrypt(encrypted)).toThrow();
    });

    it('should throw on invalid IV', () => {
      const encrypted = encrypt('test');
      encrypted.iv = 'invalid';

      expect(() => decrypt(encrypted)).toThrow();
    });

    it('should throw on invalid auth tag', () => {
      const encrypted = encrypt('test');
      encrypted.authTag = crypto.randomBytes(16).toString('base64');

      expect(() => decrypt(encrypted)).toThrow();
    });
  });

  describe('encryptCertificate', () => {
    it('should encrypt certificate and password separately', () => {
      const pfxBase64 = 'base64encodedcertificate';
      const password = 'certpassword123';

      const result = encryptCertificate(pfxBase64, password);

      expect(result).toHaveProperty('certificate');
      expect(result).toHaveProperty('password');
      expect(result.certificate).toHaveProperty('encryptedData');
      expect(result.certificate).toHaveProperty('iv');
      expect(result.certificate).toHaveProperty('authTag');
      expect(result.password).toHaveProperty('encryptedData');
      expect(result.password).toHaveProperty('iv');
      expect(result.password).toHaveProperty('authTag');
    });

    it('should use different IVs for certificate and password', () => {
      const result = encryptCertificate('cert', 'pass');
      expect(result.certificate.iv).not.toBe(result.password.iv);
    });
  });

  describe('decryptCertificate', () => {
    it('should decrypt certificate and password correctly', () => {
      const pfxBase64 = 'base64encodedcertificate';
      const password = 'certpassword123';

      const encrypted = encryptCertificate(pfxBase64, password);
      const decrypted = decryptCertificate(encrypted.certificate, encrypted.password);

      expect(decrypted.pfxBase64).toBe(pfxBase64);
      expect(decrypted.password).toBe(password);
    });

    it('should handle real-world certificate data', () => {
      // Simulate base64 certificate data
      const pfxBase64 = crypto.randomBytes(1000).toString('base64');
      const password = 'MySecureP@ssw0rd!';

      const encrypted = encryptCertificate(pfxBase64, password);
      const decrypted = decryptCertificate(encrypted.certificate, encrypted.password);

      expect(decrypted.pfxBase64).toBe(pfxBase64);
      expect(decrypted.password).toBe(password);
    });
  });

  describe('generateEncryptionKey', () => {
    it('should generate a 32-byte key encoded as base64', () => {
      const key = generateEncryptionKey();

      expect(key).toHaveLength(44); // 32 bytes = 44 chars in base64
      expect(key.endsWith('=')).toBe(true);

      // Verify it decodes to 32 bytes
      const decoded = Buffer.from(key, 'base64');
      expect(decoded.length).toBe(32);
    });

    it('should generate different keys each time', () => {
      const key1 = generateEncryptionKey();
      const key2 = generateEncryptionKey();

      expect(key1).not.toBe(key2);
    });

    it('should generate cryptographically random keys', () => {
      // Generate multiple keys and check uniqueness
      const keys = new Set<string>();
      for (let i = 0; i < 100; i++) {
        keys.add(generateEncryptionKey());
      }
      expect(keys.size).toBe(100);
    });
  });

  describe('hashForLog', () => {
    it('should return a 16-character hash', () => {
      const hash = hashForLog('test data');
      expect(hash).toHaveLength(16);
    });

    it('should return hex characters only', () => {
      const hash = hashForLog('test data');
      expect(hash).toMatch(/^[0-9a-f]+$/);
    });

    it('should produce same hash for same input', () => {
      const hash1 = hashForLog('test data');
      const hash2 = hashForLog('test data');
      expect(hash1).toBe(hash2);
    });

    it('should produce different hash for different input', () => {
      const hash1 = hashForLog('test data 1');
      const hash2 = hashForLog('test data 2');
      expect(hash1).not.toBe(hash2);
    });

    it('should handle empty string', () => {
      const hash = hashForLog('');
      expect(hash).toHaveLength(16);
    });

    it('should handle special characters', () => {
      const hash = hashForLog('!@#$%^&*()áéíóú中文');
      expect(hash).toHaveLength(16);
    });
  });
});

describe('encryption key handling', () => {
  it('should work with base64 encoded key', async () => {
    // This test verifies the key handling logic works
    const plaintext = 'test with base64 key';
    const encrypted = encrypt(plaintext);
    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(plaintext);
  });
});

describe('edge cases', () => {
  it('should handle unicode content', () => {
    const unicode = '你好世界 مرحبا العالم שלום עולם';
    const encrypted = encrypt(unicode);
    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(unicode);
  });

  it('should handle binary data as buffer', () => {
    const binaryData = Buffer.from([0x00, 0x01, 0x02, 0xff, 0xfe, 0xfd]);
    const encrypted = encrypt(binaryData);
    expect(encrypted.encryptedData).toBeDefined();
  });

  it('should handle JSON content', () => {
    const json = JSON.stringify({ key: 'value', nested: { array: [1, 2, 3] } });
    const encrypted = encrypt(json);
    const decrypted = decrypt(encrypted);
    expect(JSON.parse(decrypted)).toEqual({ key: 'value', nested: { array: [1, 2, 3] } });
  });
});
