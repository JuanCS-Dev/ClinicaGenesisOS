/**
 * XML Signer Module Tests
 *
 * Tests for XML digital signing functionality.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as forge from 'node-forge';
import * as crypto from 'crypto';

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

// Mock getCertificateForSigning
const mockCertData = {
  pfxBase64: '',
  password: 'test123',
  info: {
    subject: 'Test Company',
    cnpj: '12.345.678/0001-90',
    issuer: 'Test CA',
    serialNumber: '01',
    validFrom: new Date().toISOString(),
    validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'A1' as const,
    daysUntilExpiry: 365,
  },
};

vi.mock('../certificate', () => ({
  getCertificateForSigning: vi.fn(() => Promise.resolve(mockCertData)),
}));

// =============================================================================
// TEST CERTIFICATE GENERATION
// =============================================================================

function generateTestCertificate(): { pfxBase64: string; password: string } {
  const keys = forge.pki.rsa.generateKeyPair(2048);
  const cert = forge.pki.createCertificate();
  cert.publicKey = keys.publicKey;
  cert.serialNumber = '01';

  const now = new Date();
  cert.validity.notBefore = now;
  cert.validity.notAfter = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

  const attrs = [
    { shortName: 'CN', value: 'Test Company:12345678000190' },
    { shortName: 'O', value: 'Test Company' },
    { shortName: 'C', value: 'BR' },
  ];
  cert.setSubject(attrs);
  cert.setIssuer(attrs);
  cert.sign(keys.privateKey, forge.md.sha256.create());

  const password = 'test123';
  const p12Asn1 = forge.pkcs12.toPkcs12Asn1(keys.privateKey, cert, password, {
    algorithm: '3des',
  });
  const p12Der = forge.asn1.toDer(p12Asn1).getBytes();
  const pfxBase64 = forge.util.encode64(p12Der);

  return { pfxBase64, password };
}

// Generate test certificate once
const testCert = generateTestCertificate();
mockCertData.pfxBase64 = testCert.pfxBase64;

// =============================================================================
// TESTS
// =============================================================================

describe('xml-signer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('signXmlDocument', () => {
    it('should sign XML document successfully', async () => {
      const { signXmlDocument } = await import('../xml-signer');

      const xml = `<?xml version="1.0"?>
<mensagemTISS>
  <cabecalho>
    <versao>4.02.00</versao>
  </cabecalho>
  <corpo>
    <loteGuias>Test content</loteGuias>
  </corpo>
</mensagemTISS>`;

      const signedXml = signXmlDocument(xml, testCert.pfxBase64, testCert.password);

      expect(signedXml).toContain('<Signature');
      expect(signedXml).toContain('<SignedInfo>');
      expect(signedXml).toContain('<SignatureValue>');
      expect(signedXml).toContain('<X509Certificate>');
      expect(signedXml).toContain('<DigestValue>');
    });

    it('should preserve original XML content', async () => {
      const { signXmlDocument } = await import('../xml-signer');

      const xml = `<?xml version="1.0"?>
<mensagemTISS>
  <corpo>Test content</corpo>
</mensagemTISS>`;

      const signedXml = signXmlDocument(xml, testCert.pfxBase64, testCert.password);

      expect(signedXml).toContain('<corpo>Test content</corpo>');
    });

    it('should handle XML with ans: namespace', async () => {
      const { signXmlDocument } = await import('../xml-signer');

      const xml = `<?xml version="1.0"?>
<ans:mensagemTISS xmlns:ans="http://www.ans.gov.br/padroes/tiss/schemas">
  <ans:cabecalho>
    <ans:versao>4.02.00</ans:versao>
  </ans:cabecalho>
</ans:mensagemTISS>`;

      const signedXml = signXmlDocument(xml, testCert.pfxBase64, testCert.password);

      expect(signedXml).toContain('<Signature');
      expect(signedXml).toContain('ans:mensagemTISS');
    });

    it('should handle XML with tiss: namespace', async () => {
      const { signXmlDocument } = await import('../xml-signer');

      const xml = `<?xml version="1.0"?>
<tiss:mensagemTISS xmlns:tiss="http://www.ans.gov.br/padroes/tiss/schemas">
  <tiss:cabecalho>Test</tiss:cabecalho>
</tiss:mensagemTISS>`;

      const signedXml = signXmlDocument(xml, testCert.pfxBase64, testCert.password);

      expect(signedXml).toContain('<Signature');
    });

    it('should handle simple XML without TISS elements', async () => {
      const { signXmlDocument } = await import('../xml-signer');

      const xml = `<?xml version="1.0"?>
<root>
  <element>content</element>
</root>`;

      const signedXml = signXmlDocument(xml, testCert.pfxBase64, testCert.password);

      expect(signedXml).toContain('<Signature');
    });

    it('should throw on invalid PFX', async () => {
      const { signXmlDocument } = await import('../xml-signer');

      const xml = '<root>test</root>';

      expect(() => {
        signXmlDocument(xml, 'invalid-base64', 'password');
      }).toThrow();
    });

    it('should throw on wrong password', async () => {
      const { signXmlDocument } = await import('../xml-signer');

      const xml = '<root>test</root>';

      expect(() => {
        signXmlDocument(xml, testCert.pfxBase64, 'wrong-password');
      }).toThrow();
    });
  });

  describe('hashXml', () => {
    it('should return SHA-256 hash of XML', async () => {
      const { hashXml } = await import('../xml-signer');

      const xml = '<root>test content</root>';
      const hash = hashXml(xml);

      expect(hash).toHaveLength(64); // SHA-256 = 32 bytes = 64 hex chars
      expect(hash).toMatch(/^[0-9a-f]+$/);
    });

    it('should produce same hash for same content', async () => {
      const { hashXml } = await import('../xml-signer');

      const xml = '<root>test</root>';
      const hash1 = hashXml(xml);
      const hash2 = hashXml(xml);

      expect(hash1).toBe(hash2);
    });

    it('should produce different hash for different content', async () => {
      const { hashXml } = await import('../xml-signer');

      const hash1 = hashXml('<root>test1</root>');
      const hash2 = hashXml('<root>test2</root>');

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('signXml Cloud Function', () => {
    it('should require authentication', async () => {
      const { signXml } = await import('../xml-signer');

      await expect(
        signXml(
          { clinicId: 'test', xml: '<root/>' },
          { auth: null } as any
        )
      ).rejects.toThrow('Must be authenticated');
    });

    it('should reject missing fields', async () => {
      const { signXml } = await import('../xml-signer');

      const result = await signXml(
        { clinicId: '', xml: '' },
        { auth: { uid: 'user-1' } } as any
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Missing required fields');
    });

    it('should sign XML with clinic certificate', async () => {
      const { signXml } = await import('../xml-signer');
      const { getCertificateForSigning } = await import('../certificate');

      const xml = `<?xml version="1.0"?>
<mensagemTISS>
  <corpo>Test</corpo>
</mensagemTISS>`;

      const result = await signXml(
        { clinicId: 'test-clinic', xml },
        { auth: { uid: 'user-1' } } as any
      );

      expect(result.success).toBe(true);
      expect(result.signedXml).toContain('<Signature');
      expect(getCertificateForSigning).toHaveBeenCalledWith('test-clinic');
      expect(mockLogger.info).toHaveBeenCalledWith(
        'XML signed successfully',
        expect.any(Object)
      );
    });

    it('should handle certificate not configured error', async () => {
      const { signXml } = await import('../xml-signer');
      const { getCertificateForSigning } = await import('../certificate');

      vi.mocked(getCertificateForSigning).mockRejectedValueOnce(
        new Error('No certificate configured for this clinic')
      );

      const result = await signXml(
        { clinicId: 'test', xml: '<root/>' },
        { auth: { uid: 'user-1' } } as any
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Certificado digital não configurado');
    });

    it('should handle expired certificate error', async () => {
      const { signXml } = await import('../xml-signer');
      const { getCertificateForSigning } = await import('../certificate');

      vi.mocked(getCertificateForSigning).mockRejectedValueOnce(
        new Error('Certificate has expired')
      );

      const result = await signXml(
        { clinicId: 'test', xml: '<root/>' },
        { auth: { uid: 'user-1' } } as any
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('expirado');
    });

    it('should log signing attempt', async () => {
      const { signXml } = await import('../xml-signer');

      const xml = '<mensagemTISS><corpo>Test</corpo></mensagemTISS>';
      await signXml(
        { clinicId: 'test-clinic', xml },
        { auth: { uid: 'user-1' } } as any
      );

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Signing XML',
        expect.objectContaining({
          clinicId: 'test-clinic',
          xmlLength: xml.length,
        })
      );
    });
  });

  describe('signature structure', () => {
    it('should include correct algorithm references', async () => {
      const { signXmlDocument } = await import('../xml-signer');

      const xml = '<mensagemTISS><corpo>Test</corpo></mensagemTISS>';
      const signedXml = signXmlDocument(xml, testCert.pfxBase64, testCert.password);

      // Check canonicalization algorithm
      expect(signedXml).toContain('http://www.w3.org/TR/2001/REC-xml-c14n-20010315');

      // Check signature method (RSA-SHA256)
      expect(signedXml).toContain('http://www.w3.org/2001/04/xmldsig-more#rsa-sha256');

      // Check digest method
      expect(signedXml).toContain('http://www.w3.org/2001/04/xmlenc#sha256');
    });

    it('should include enveloped signature transform', async () => {
      const { signXmlDocument } = await import('../xml-signer');

      const xml = '<mensagemTISS><corpo>Test</corpo></mensagemTISS>';
      const signedXml = signXmlDocument(xml, testCert.pfxBase64, testCert.password);

      expect(signedXml).toContain(
        'http://www.w3.org/2000/09/xmldsig#enveloped-signature'
      );
    });
  });
});
