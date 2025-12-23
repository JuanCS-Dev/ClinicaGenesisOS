/**
 * Certificate Management Module
 *
 * Handles validation, extraction, and secure storage of digital certificates
 * (e-CNPJ) used for signing TISS XML documents.
 *
 * @module functions/tiss/certificate
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as forge from 'node-forge';
import { encryptCertificate, decryptCertificate, hashForLog } from './encryption';
import type {
  ValidateCertificateRequest,
  ValidateCertificateResponse,
  CertificateInfo,
  StoredCertificate,
  DecryptionRequest,
} from './types';

// =============================================================================
// CONSTANTS
// =============================================================================

const CERTIFICATE_COLLECTION = 'certificates';
const DAYS_EXPIRY_WARNING = 30;

// =============================================================================
// CERTIFICATE PARSING
// =============================================================================

/**
 * Extract CNPJ from certificate subject or extension.
 * Brazilian e-CNPJ certificates contain CNPJ in specific OIDs.
 */
function extractCnpj(cert: forge.pki.Certificate): string | null {
  // Try to find CNPJ in subject attributes
  const subject = cert.subject.attributes;

  for (const attr of subject) {
    // OID 2.16.76.1.3.3 = CNPJ in ICP-Brasil
    if (attr.type === '2.16.76.1.3.3') {
      return formatCnpj(attr.value as string);
    }
    // Sometimes CNPJ is in serialNumber
    if (attr.shortName === 'serialName' || attr.shortName === 'SN') {
      const value = attr.value as string;
      if (value && value.length >= 14) {
        const cnpjMatch = value.match(/\d{14}/);
        if (cnpjMatch) {
          return formatCnpj(cnpjMatch[0]);
        }
      }
    }
  }

  // Try CN (Common Name) - often contains "CNPJ:XX.XXX.XXX/XXXX-XX"
  const cn = cert.subject.getField('CN');
  if (cn && cn.value) {
    const cnpjMatch = (cn.value as string).match(/\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}/);
    if (cnpjMatch) {
      return formatCnpj(cnpjMatch[0].replace(/\D/g, ''));
    }
  }

  return null;
}

/**
 * Format CNPJ with mask.
 */
function formatCnpj(cnpj: string): string {
  const clean = cnpj.replace(/\D/g, '');
  if (clean.length !== 14) return clean;
  return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5, 8)}/${clean.slice(8, 12)}-${clean.slice(12)}`;
}

/**
 * Determine certificate type (A1 or A3).
 * A1 certificates are stored in files, A3 in hardware tokens.
 */
function determineCertificateType(cert: forge.pki.Certificate): 'A1' | 'A3' {
  // A1 certificates typically have shorter validity (1 year)
  // A3 certificates typically have longer validity (3 years)
  const validFrom = cert.validity.notBefore;
  const validTo = cert.validity.notAfter;
  const validityDays = Math.floor(
    (validTo.getTime() - validFrom.getTime()) / (1000 * 60 * 60 * 24)
  );

  // If validity > 400 days, likely A3; otherwise A1
  return validityDays > 400 ? 'A3' : 'A1';
}

/**
 * Extract information from a PFX certificate.
 */
function extractCertificateInfo(
  pfxBase64: string,
  password: string
): CertificateInfo {
  const pfxBuffer = Buffer.from(pfxBase64, 'base64');
  const pfxAsn1 = forge.asn1.fromDer(pfxBuffer.toString('binary'));
  const pfx = forge.pkcs12.pkcs12FromAsn1(pfxAsn1, password);

  // Get certificate bags
  const certBags = pfx.getBags({ bagType: forge.pki.oids.certBag });
  const certBag = certBags[forge.pki.oids.certBag];

  if (!certBag || certBag.length === 0) {
    throw new Error('No certificate found in PFX file');
  }

  const cert = certBag[0].cert;
  if (!cert) {
    throw new Error('Invalid certificate in PFX file');
  }

  // Extract subject name
  const cn = cert.subject.getField('CN');
  const o = cert.subject.getField('O');
  const subject = (cn?.value as string) || (o?.value as string) || 'Unknown';

  // Extract issuer
  const issuerCn = cert.issuer.getField('CN');
  const issuerO = cert.issuer.getField('O');
  const issuer = (issuerCn?.value as string) || (issuerO?.value as string) || 'Unknown';

  // Extract CNPJ
  const cnpj = extractCnpj(cert);
  if (!cnpj) {
    throw new Error('CNPJ not found in certificate. Is this an e-CNPJ certificate?');
  }

  // Calculate days until expiry
  const now = new Date();
  const validUntil = cert.validity.notAfter;
  const daysUntilExpiry = Math.floor(
    (validUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  return {
    subject: subject.substring(0, 200), // Limit length
    cnpj,
    issuer: issuer.substring(0, 100),
    serialNumber: cert.serialNumber,
    validFrom: cert.validity.notBefore.toISOString(),
    validUntil: cert.validity.notAfter.toISOString(),
    type: determineCertificateType(cert),
    daysUntilExpiry,
  };
}

// =============================================================================
// CLOUD FUNCTIONS
// =============================================================================

/**
 * Validate a certificate without storing it.
 * Use this to check if a certificate is valid before upload.
 */
export const validateCertificate = functions.https.onCall(
  async (request: ValidateCertificateRequest): Promise<ValidateCertificateResponse> => {
    const { certificateBase64, password, clinicId } = request;

    // Validate input
    if (!certificateBase64 || !password || !clinicId) {
      return {
        valid: false,
        error: 'Missing required fields: certificateBase64, password, clinicId',
      };
    }

    functions.logger.info('Validating certificate', {
      clinicId,
      certHash: hashForLog(certificateBase64),
    });

    try {
      const info = extractCertificateInfo(certificateBase64, password);

      // Check expiration
      if (info.daysUntilExpiry < 0) {
        return {
          valid: false,
          info,
          error: `Certificate expired ${Math.abs(info.daysUntilExpiry)} days ago`,
        };
      }

      // Warn if expiring soon
      if (info.daysUntilExpiry < DAYS_EXPIRY_WARNING) {
        functions.logger.warn('Certificate expiring soon', {
          clinicId,
          daysUntilExpiry: info.daysUntilExpiry,
        });
      }

      return {
        valid: true,
        info,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      functions.logger.error('Certificate validation failed', {
        clinicId,
        error: message,
      });

      // Provide user-friendly error messages
      if (message.includes('Invalid password') || message.includes('MAC')) {
        return {
          valid: false,
          error: 'Incorrect certificate password',
        };
      }

      if (message.includes('Invalid PFX') || message.includes('asn1')) {
        return {
          valid: false,
          error: 'Invalid certificate file. Please upload a valid .pfx or .p12 file.',
        };
      }

      return {
        valid: false,
        error: message,
      };
    }
  }
);

/**
 * Store a certificate securely for a clinic.
 * The certificate is encrypted before storage.
 */
export const storeCertificate = functions.https.onCall(
  async (
    request: ValidateCertificateRequest,
    context: functions.https.CallableContext
  ): Promise<ValidateCertificateResponse> => {
    const { certificateBase64, password, clinicId } = request;

    // Verify authentication
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
    }

    // Validate input
    if (!certificateBase64 || !password || !clinicId) {
      return {
        valid: false,
        error: 'Missing required fields',
      };
    }

    functions.logger.info('Storing certificate', {
      clinicId,
      userId: context.auth.uid,
    });

    try {
      // First validate the certificate
      const info = extractCertificateInfo(certificateBase64, password);

      if (info.daysUntilExpiry < 0) {
        return {
          valid: false,
          info,
          error: 'Cannot store expired certificate',
        };
      }

      // Encrypt certificate and password
      const encrypted = encryptCertificate(certificateBase64, password);

      // Prepare storage document
      const storedCert: StoredCertificate = {
        encryptedData: JSON.stringify({
          certificate: encrypted.certificate,
          password: encrypted.password,
        }),
        iv: encrypted.certificate.iv, // For reference
        info,
        uploadedAt: new Date().toISOString(),
        uploadedBy: context.auth.uid,
      };

      // Store in Firestore under clinic's settings
      const db = admin.firestore();
      await db
        .collection('clinics')
        .doc(clinicId)
        .collection(CERTIFICATE_COLLECTION)
        .doc('current')
        .set(storedCert);

      // Update clinic settings
      await db
        .collection('clinics')
        .doc(clinicId)
        .update({
          'settings.convenios.certificadoDigital': {
            configurado: true,
            tipo: info.type,
            cnpj: info.cnpj,
            razaoSocial: info.subject,
            emissor: info.issuer,
            validoAte: info.validUntil,
            daysUntilExpiry: info.daysUntilExpiry,
            updatedAt: new Date().toISOString(),
          },
        });

      functions.logger.info('Certificate stored successfully', {
        clinicId,
        cnpj: info.cnpj,
        validUntil: info.validUntil,
      });

      return {
        valid: true,
        info,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      functions.logger.error('Failed to store certificate', {
        clinicId,
        error: message,
      });

      return {
        valid: false,
        error: message,
      };
    }
  }
);

/**
 * Get certificate for signing (internal use only).
 * Returns decrypted certificate data.
 */
export async function getCertificateForSigning(
  clinicId: string
): Promise<{ pfxBase64: string; password: string; info: CertificateInfo }> {
  const db = admin.firestore();
  const doc = await db
    .collection('clinics')
    .doc(clinicId)
    .collection(CERTIFICATE_COLLECTION)
    .doc('current')
    .get();

  if (!doc.exists) {
    throw new Error('No certificate configured for this clinic');
  }

  const stored = doc.data() as StoredCertificate;

  // Check expiration
  if (stored.info.daysUntilExpiry < 0) {
    throw new Error('Certificate has expired. Please upload a new certificate.');
  }

  // Decrypt
  const encryptedData = JSON.parse(stored.encryptedData);
  const decrypted = decryptCertificate(
    encryptedData.certificate as DecryptionRequest,
    encryptedData.password as DecryptionRequest
  );

  return {
    ...decrypted,
    info: stored.info,
  };
}

/**
 * Delete certificate (for removal or replacement).
 */
export const deleteCertificate = functions.https.onCall(
  async (
    request: { clinicId: string },
    context: functions.https.CallableContext
  ): Promise<{ success: boolean; error?: string }> => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
    }

    const { clinicId } = request;

    try {
      const db = admin.firestore();

      // Delete certificate document
      await db
        .collection('clinics')
        .doc(clinicId)
        .collection(CERTIFICATE_COLLECTION)
        .doc('current')
        .delete();

      // Update clinic settings
      await db
        .collection('clinics')
        .doc(clinicId)
        .update({
          'settings.convenios.certificadoDigital': {
            configurado: false,
            updatedAt: new Date().toISOString(),
          },
        });

      functions.logger.info('Certificate deleted', { clinicId });

      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: message };
    }
  }
);
