/**
 * PIX Configuration Tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// We need to test the isPixConfigured function
// Since PIX_CONFIG is a const object read at import time,
// we need to mock import.meta.env before importing

describe('config/pix', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  describe('isPixConfigured', () => {
    it('returns false when PIX is disabled', async () => {
      vi.stubEnv('VITE_PIX_ENABLED', 'false');
      vi.stubEnv('VITE_PIX_KEY', 'some-key');

      const { isPixConfigured } = await import('../../config/pix');

      expect(isPixConfigured()).toBe(false);
    });

    it('returns false when PIX key is empty', async () => {
      vi.stubEnv('VITE_PIX_ENABLED', 'true');
      vi.stubEnv('VITE_PIX_KEY', '');

      const { isPixConfigured } = await import('../../config/pix');

      expect(isPixConfigured()).toBe(false);
    });

    it('returns true when PIX is enabled and has key', async () => {
      vi.stubEnv('VITE_PIX_ENABLED', 'true');
      vi.stubEnv('VITE_PIX_KEY', '12345678901');

      const { isPixConfigured } = await import('../../config/pix');

      expect(isPixConfigured()).toBe(true);
    });
  });

  describe('PIX_CONFIG', () => {
    it('has default receiver name', async () => {
      vi.stubEnv('VITE_PIX_RECEIVER_NAME', '');

      const { PIX_CONFIG } = await import('../../config/pix');

      expect(PIX_CONFIG.receiverName).toBe('CLINICA GENESIS');
    });

    it('has default receiver city', async () => {
      vi.stubEnv('VITE_PIX_RECEIVER_CITY', '');

      const { PIX_CONFIG } = await import('../../config/pix');

      expect(PIX_CONFIG.receiverCity).toBe('SAO PAULO');
    });

    it('has default key type', async () => {
      vi.stubEnv('VITE_PIX_KEY_TYPE', '');

      const { PIX_CONFIG } = await import('../../config/pix');

      expect(PIX_CONFIG.pixKeyType).toBe('cpf');
    });

    it('reads custom values from env', async () => {
      vi.stubEnv('VITE_PIX_KEY', 'test@email.com');
      vi.stubEnv('VITE_PIX_KEY_TYPE', 'email');
      vi.stubEnv('VITE_PIX_RECEIVER_NAME', 'CUSTOM CLINIC');
      vi.stubEnv('VITE_PIX_RECEIVER_CITY', 'RIO DE JANEIRO');
      vi.stubEnv('VITE_PIX_ENABLED', 'true');

      const { PIX_CONFIG } = await import('../../config/pix');

      expect(PIX_CONFIG.pixKey).toBe('test@email.com');
      expect(PIX_CONFIG.pixKeyType).toBe('email');
      expect(PIX_CONFIG.receiverName).toBe('CUSTOM CLINIC');
      expect(PIX_CONFIG.receiverCity).toBe('RIO DE JANEIRO');
      expect(PIX_CONFIG.enabled).toBe(true);
    });

    it('enabled is false by default', async () => {
      vi.stubEnv('VITE_PIX_ENABLED', '');

      const { PIX_CONFIG } = await import('../../config/pix');

      expect(PIX_CONFIG.enabled).toBe(false);
    });
  });
});
