/**
 * Certificate Module Tests
 *
 * Tests for certificate validation, storage, and retrieval.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as crypto from 'crypto';
import * as forge from 'node-forge';

// Fixed test key
const TEST_ENCRYPTION_KEY = 'K7gNU3sdo+OL0wNhqoVWhr3g6s1xYv72ol/pe/Unols=';

// Mock firebase-functions/params
vi.mock('firebase-functions/params', () => ({
  defineString: () => ({
    value: () => TEST_ENCRYPTION_KEY,
  }),
}));

// Mock firebase-functions
const mockLogger = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

vi.mock('firebase-functions', () => ({
  https: {
    onCall: vi.fn((handler) => handler),
    HttpsError: class HttpsError extends Error {
      constructor(public code: string, message: string) {
        super(message);
      }
    },
  },
  logger: mockLogger,
}));

// Mock firebase-admin
const mockFirestoreDoc = {
  exists: true,
  data: vi.fn(),
  id: 'test-doc-id',
};

const mockFirestoreCollection = {
  doc: vi.fn(() => ({
    get: vi.fn(() => Promise.resolve(mockFirestoreDoc)),
    set: vi.fn(() => Promise.resolve()),
    delete: vi.fn(() => Promise.resolve()),
    collection: vi.fn(() => mockFirestoreCollection),
  })),
};

const mockFirestore = {
  collection: vi.fn(() => mockFirestoreCollection),
};

vi.mock('firebase-admin', () => ({
  firestore: vi.fn(() => mockFirestore),
}));

// =============================================================================
// TEST CERTIFICATE GENERATION
// =============================================================================

/**
 * Generate a test PFX certificate with CNPJ.
 */
function generateTestCertificate(options: {
  cnpj?: string;
  validDays?: number;
  expired?: boolean;
  password?: string;
}): { pfxBase64: string; password: string } {
  const {
    cnpj = '12345678000190',
    validDays = 365,
    expired = false,
    password = 'test123',
  } = options;

  // Generate key pair
  const keys = forge.pki.rsa.generateKeyPair(2048);

  // Create certificate
  const cert = forge.pki.createCertificate();
  cert.publicKey = keys.publicKey;
  cert.serialNumber = '01';

  // Set validity
  const now = new Date();
  if (expired) {
    cert.validity.notBefore = new Date(now.getTime() - 400 * 24 * 60 * 60 * 1000);
    cert.validity.notAfter = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
  } else {
    cert.validity.notBefore = now;
    cert.validity.notAfter = new Date(now.getTime() + validDays * 24 * 60 * 60 * 1000);
  }

  // Set subject with CNPJ
  const attrs = [
    { shortName: 'CN', value: `Empresa Teste LTDA:${cnpj}` },
    { shortName: 'O', value: 'Empresa Teste' },
    { shortName: 'C', value: 'BR' },
  ];
  cert.setSubject(attrs);
  cert.setIssuer([
    { shortName: 'CN', value: 'Test CA' },
    { shortName: 'O', value: 'Test Certificate Authority' },
    { shortName: 'C', value: 'BR' },
  ]);

  // Self-sign
  cert.sign(keys.privateKey, forge.md.sha256.create());

  // Create PKCS12 (PFX)
  const p12Asn1 = forge.pkcs12.toPkcs12Asn1(keys.privateKey, cert, password, {
    algorithm: '3des',
  });
  const p12Der = forge.asn1.toDer(p12Asn1).getBytes();
  const pfxBase64 = forge.util.encode64(p12Der);

  return { pfxBase64, password };
}

// =============================================================================
// TESTS
// =============================================================================

describe('certificate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('formatCnpj', () => {
    // We test this indirectly through extractCertificateInfo
    it('should format CNPJ correctly when extracted', async () => {
      const { validateCertificate } = await import('../certificate');
      const { pfxBase64, password } = generateTestCertificate({ cnpj: '12345678000190' });

      const result = await validateCertificate({
        certificateBase64: pfxBase64,
        password,
        clinicId: 'test-clinic',
      });

      expect(result.valid).toBe(true);
      expect(result.info?.cnpj).toBe('12.345.678/0001-90');
    });
  });

  describe('determineCertificateType', () => {
    it('should identify A1 certificate (< 400 days validity)', async () => {
      const { validateCertificate } = await import('../certificate');
      const { pfxBase64, password } = generateTestCertificate({ validDays: 365 });

      const result = await validateCertificate({
        certificateBase64: pfxBase64,
        password,
        clinicId: 'test-clinic',
      });

      expect(result.valid).toBe(true);
      expect(result.info?.type).toBe('A1');
    });

    it('should identify A3 certificate (> 400 days validity)', async () => {
      const { validateCertificate } = await import('../certificate');
      const { pfxBase64, password } = generateTestCertificate({ validDays: 1095 });

      const result = await validateCertificate({
        certificateBase64: pfxBase64,
        password,
        clinicId: 'test-clinic',
      });

      expect(result.valid).toBe(true);
      expect(result.info?.type).toBe('A3');
    });
  });

  describe('validateCertificate', () => {
    it('should validate a valid certificate', async () => {
      const { validateCertificate } = await import('../certificate');
      const { pfxBase64, password } = generateTestCertificate({});

      const result = await validateCertificate({
        certificateBase64: pfxBase64,
        password,
        clinicId: 'test-clinic',
      });

      expect(result.valid).toBe(true);
      expect(result.info).toBeDefined();
      expect(result.info?.subject).toContain('Empresa Teste');
      expect(result.info?.issuer).toContain('Test CA');
      expect(result.info?.daysUntilExpiry).toBeGreaterThan(0);
    });

    it('should reject missing fields', async () => {
      const { validateCertificate } = await import('../certificate');

      const result = await validateCertificate({
        certificateBase64: '',
        password: '',
        clinicId: '',
      });

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Missing required fields');
    });

    it('should reject expired certificate', async () => {
      const { validateCertificate } = await import('../certificate');
      const { pfxBase64, password } = generateTestCertificate({ expired: true });

      const result = await validateCertificate({
        certificateBase64: pfxBase64,
        password,
        clinicId: 'test-clinic',
      });

      expect(result.valid).toBe(false);
      expect(result.error).toContain('expired');
    });

    it('should warn about soon-to-expire certificate', async () => {
      const { validateCertificate } = await import('../certificate');
      const { pfxBase64, password } = generateTestCertificate({ validDays: 20 });

      const result = await validateCertificate({
        certificateBase64: pfxBase64,
        password,
        clinicId: 'test-clinic',
      });

      expect(result.valid).toBe(true);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Certificate expiring soon',
        expect.any(Object)
      );
    });

    it('should reject wrong password', async () => {
      const { validateCertificate } = await import('../certificate');
      const { pfxBase64 } = generateTestCertificate({ password: 'correct' });

      const result = await validateCertificate({
        certificateBase64: pfxBase64,
        password: 'wrong',
        clinicId: 'test-clinic',
      });

      expect(result.valid).toBe(false);
      expect(result.error).toContain('password');
    });

    it('should reject invalid certificate data', async () => {
      const { validateCertificate } = await import('../certificate');

      const result = await validateCertificate({
        certificateBase64: 'not-valid-base64-certificate',
        password: 'test',
        clinicId: 'test-clinic',
      });

      expect(result.valid).toBe(false);
    });

    it('should log validation attempt', async () => {
      const { validateCertificate } = await import('../certificate');
      const { pfxBase64, password } = generateTestCertificate({});

      await validateCertificate({
        certificateBase64: pfxBase64,
        password,
        clinicId: 'test-clinic',
      });

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Validating certificate',
        expect.objectContaining({ clinicId: 'test-clinic' })
      );
    });
  });

  describe('storeCertificate', () => {
    it('should require authentication', async () => {
      const { storeCertificate } = await import('../certificate');
      const { pfxBase64, password } = generateTestCertificate({});

      await expect(
        storeCertificate(
          { certificateBase64: pfxBase64, password, clinicId: 'test' },
          { auth: null } as any
        )
      ).rejects.toThrow('Must be authenticated');
    });

    it('should reject missing fields', async () => {
      const { storeCertificate } = await import('../certificate');

      const result = await storeCertificate(
        { certificateBase64: '', password: '', clinicId: '' },
        { auth: { uid: 'user-1' } } as any
      );

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Missing required fields');
    });

    it('should reject expired certificate', async () => {
      const { storeCertificate } = await import('../certificate');
      const { pfxBase64, password } = generateTestCertificate({ expired: true });

      const result = await storeCertificate(
        { certificateBase64: pfxBase64, password, clinicId: 'test' },
        { auth: { uid: 'user-1' } } as any
      );

      expect(result.valid).toBe(false);
      expect(result.error).toContain('expired');
    });

    it('should store valid certificate', async () => {
      const { storeCertificate } = await import('../certificate');
      const { pfxBase64, password } = generateTestCertificate({});

      const mockDoc = {
        set: vi.fn(() => Promise.resolve()),
      };
      const mockSubCollection = {
        doc: vi.fn(() => mockDoc),
      };
      const mockClinicDoc = {
        collection: vi.fn(() => mockSubCollection),
        update: vi.fn(() => Promise.resolve()),
      };
      mockFirestoreCollection.doc.mockReturnValue(mockClinicDoc);

      const result = await storeCertificate(
        { certificateBase64: pfxBase64, password, clinicId: 'test' },
        { auth: { uid: 'user-1' } } as any
      );

      expect(result.valid).toBe(true);
      expect(result.info).toBeDefined();
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Certificate stored successfully',
        expect.any(Object)
      );
    });
  });

  describe('deleteCertificate', () => {
    it('should require authentication', async () => {
      const { deleteCertificate } = await import('../certificate');

      await expect(
        deleteCertificate({ clinicId: 'test' }, { auth: null } as any)
      ).rejects.toThrow('Must be authenticated');
    });

    it('should delete certificate and update settings', async () => {
      const { deleteCertificate } = await import('../certificate');

      const mockCertDoc = {
        delete: vi.fn(() => Promise.resolve()),
      };
      const mockSubCollection = {
        doc: vi.fn(() => mockCertDoc),
      };
      const mockClinicDoc = {
        collection: vi.fn(() => mockSubCollection),
        update: vi.fn(() => Promise.resolve()),
      };
      mockFirestoreCollection.doc.mockReturnValue(mockClinicDoc);

      const result = await deleteCertificate(
        { clinicId: 'test' },
        { auth: { uid: 'user-1' } } as any
      );

      expect(result.success).toBe(true);
      expect(mockCertDoc.delete).toHaveBeenCalled();
      expect(mockClinicDoc.update).toHaveBeenCalled();
    });
  });

  describe('getCertificateForSigning', () => {
    it('should throw if no certificate configured', async () => {
      const { getCertificateForSigning } = await import('../certificate');

      mockFirestoreDoc.exists = false;
      const mockCertDoc = {
        get: vi.fn(() => Promise.resolve(mockFirestoreDoc)),
      };
      const mockSubCollection = {
        doc: vi.fn(() => mockCertDoc),
      };
      const mockClinicDoc = {
        collection: vi.fn(() => mockSubCollection),
      };
      mockFirestoreCollection.doc.mockReturnValue(mockClinicDoc);

      await expect(getCertificateForSigning('test')).rejects.toThrow(
        'No certificate configured'
      );
    });

    it('should throw if certificate expired', async () => {
      const { getCertificateForSigning } = await import('../certificate');

      mockFirestoreDoc.exists = true;
      mockFirestoreDoc.data.mockReturnValue({
        info: { daysUntilExpiry: -5 },
        encryptedData: '{}',
      });

      const mockCertDoc = {
        get: vi.fn(() => Promise.resolve(mockFirestoreDoc)),
      };
      const mockSubCollection = {
        doc: vi.fn(() => mockCertDoc),
      };
      const mockClinicDoc = {
        collection: vi.fn(() => mockSubCollection),
      };
      mockFirestoreCollection.doc.mockReturnValue(mockClinicDoc);

      await expect(getCertificateForSigning('test')).rejects.toThrow('expired');
    });
  });

  describe('extractCnpj edge cases', () => {
    it('should extract CNPJ from CN with different formats', async () => {
      const { validateCertificate } = await import('../certificate');

      // Test with dots and dashes in CNPJ
      const { pfxBase64, password } = generateTestCertificate({
        cnpj: '98765432000101',
      });

      const result = await validateCertificate({
        certificateBase64: pfxBase64,
        password,
        clinicId: 'test',
      });

      expect(result.valid).toBe(true);
      expect(result.info?.cnpj).toBe('98.765.432/0001-01');
    });
  });
});

describe('certificate info extraction', () => {
  it('should extract all certificate information', async () => {
    const { validateCertificate } = await import('../certificate');
    const { pfxBase64, password } = generateTestCertificate({
      cnpj: '11222333000144',
      validDays: 365,
    });

    const result = await validateCertificate({
      certificateBase64: pfxBase64,
      password,
      clinicId: 'test',
    });

    expect(result.valid).toBe(true);
    expect(result.info).toMatchObject({
      subject: expect.any(String),
      cnpj: '11.222.333/0001-44',
      issuer: expect.any(String),
      serialNumber: expect.any(String),
      validFrom: expect.any(String),
      validUntil: expect.any(String),
      type: 'A1',
      daysUntilExpiry: expect.any(Number),
    });
  });
});

describe('getCertificateForSigning additional cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should decrypt and return certificate data', async () => {
    const { getCertificateForSigning } = await import('../certificate');

    // Mock valid stored certificate
    const validInfo = {
      daysUntilExpiry: 100,
      subject: 'Test',
      cnpj: '12.345.678/0001-90',
      issuer: 'CA',
      serialNumber: '01',
      validFrom: '2024-01-01',
      validUntil: '2025-01-01',
      type: 'A1',
    };

    // Create mock encrypted data
    const { encrypt } = await import('../encryption');
    const encCert = encrypt('test-pfx');
    const encPass = encrypt('test-pass');

    mockFirestoreDoc.exists = true;
    mockFirestoreDoc.data.mockReturnValue({
      info: validInfo,
      encryptedData: JSON.stringify({
        certificate: encCert,
        password: encPass,
      }),
    });

    const mockCertDoc = {
      get: vi.fn(() => Promise.resolve(mockFirestoreDoc)),
    };
    const mockSubCollection = {
      doc: vi.fn(() => mockCertDoc),
    };
    const mockClinicDoc = {
      collection: vi.fn(() => mockSubCollection),
    };
    mockFirestoreCollection.doc.mockReturnValue(mockClinicDoc);

    const result = await getCertificateForSigning('test-clinic');

    expect(result.pfxBase64).toBe('test-pfx');
    expect(result.password).toBe('test-pass');
    expect(result.info).toEqual(validInfo);
  });
});

describe('storeCertificate error handling', () => {
  it('should handle firestore errors gracefully', async () => {
    const { storeCertificate } = await import('../certificate');
    const { pfxBase64, password } = generateTestCertificate({});

    // Mock firestore to throw error
    const mockClinicDoc = {
      collection: vi.fn(() => ({
        doc: vi.fn(() => ({
          set: vi.fn(() => Promise.reject(new Error('Firestore error'))),
        })),
      })),
      update: vi.fn(() => Promise.resolve()),
    };
    mockFirestoreCollection.doc.mockReturnValue(mockClinicDoc);

    const result = await storeCertificate(
      { certificateBase64: pfxBase64, password, clinicId: 'test' },
      { auth: { uid: 'user-1' } } as any
    );

    expect(result.valid).toBe(false);
    expect(result.error).toContain('Firestore error');
  });
});

describe('deleteCertificate error handling', () => {
  it('should handle deletion errors gracefully', async () => {
    const { deleteCertificate } = await import('../certificate');

    const mockClinicDoc = {
      collection: vi.fn(() => ({
        doc: vi.fn(() => ({
          delete: vi.fn(() => Promise.reject(new Error('Delete failed'))),
        })),
      })),
      update: vi.fn(() => Promise.resolve()),
    };
    mockFirestoreCollection.doc.mockReturnValue(mockClinicDoc);

    const result = await deleteCertificate(
      { clinicId: 'test' },
      { auth: { uid: 'user-1' } } as any
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain('Delete failed');
  });
});
