/**
 * Certificate utilities for TISS billing
 *
 * Helper functions for certificate validation and status display.
 * Connects to Cloud Functions for secure certificate handling.
 *
 * @module components/billing/certificate-utils
 */

import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '@/services/firebase';

// Initialize Firebase Functions
// TISS functions are deployed to us-central1
const functions = getFunctions(app, 'us-central1');

/**
 * Certificate status type
 */
export type CertificateStatus = 'not_configured' | 'valid' | 'expiring_soon' | 'expired';

/**
 * Certificate info stored for the clinic
 */
export interface CertificadoInfo {
  configurado: boolean;
  tipo: 'A1' | 'A3';
  nomeArquivo?: string;
  razaoSocial?: string;
  cnpj?: string;
  emissor?: string;
  validoAte?: string;
  status: CertificateStatus;
}

/**
 * Status display configuration
 */
export interface StatusDisplay {
  color: string;
  bgColor: string;
  label: string;
}

/**
 * Calculate certificate status based on expiry date.
 */
export function getCertificateStatus(validoAte?: string): CertificateStatus {
  if (!validoAte) return 'not_configured';

  const expiryDate = new Date(validoAte);
  const now = new Date();
  const daysUntilExpiry = Math.floor(
    (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysUntilExpiry < 0) return 'expired';
  if (daysUntilExpiry < 30) return 'expiring_soon';
  return 'valid';
}

/**
 * Get status color and label.
 */
export function getStatusDisplay(status: CertificateStatus): StatusDisplay {
  switch (status) {
    case 'valid':
      return {
        color: 'text-success',
        bgColor: 'bg-success-soft border-success/30',
        label: 'Válido',
      };
    case 'expiring_soon':
      return {
        color: 'text-warning',
        bgColor: 'bg-warning-soft border-warning/30',
        label: 'Expirando em breve',
      };
    case 'expired':
      return {
        color: 'text-danger',
        bgColor: 'bg-danger-soft border-danger/30',
        label: 'Expirado',
      };
    default:
      return {
        color: 'text-genesis-muted',
        bgColor: 'bg-genesis-soft border-genesis-border',
        label: 'Não configurado',
      };
  }
}

/**
 * Response from Cloud Function
 */
interface CloudFunctionResponse {
  valid: boolean;
  error?: string;
  info?: {
    subject: string;
    cnpj: string;
    issuer: string;
    serialNumber: string;
    validFrom: string;
    validUntil: string;
    type: 'A1' | 'A3';
    daysUntilExpiry: number;
  };
}

/**
 * Convert file to Base64.
 */
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix (data:application/x-pkcs12;base64,)
      const base64 = result.split(',')[1] || result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Validate a certificate using Cloud Function.
 * Checks if the certificate is valid, extracts info, but does NOT store it.
 *
 * @param file - The .pfx or .p12 file
 * @param password - Certificate password
 * @param clinicId - The clinic ID
 * @returns Certificate info if valid
 * @throws Error if validation fails
 */
export async function validateCertificate(
  file: File,
  password: string,
  clinicId: string
): Promise<CertificadoInfo> {
  const certificateBase64 = await fileToBase64(file);

  const validateFn = httpsCallable<
    { certificateBase64: string; password: string; clinicId: string },
    CloudFunctionResponse
  >(functions, 'validateCertificate');

  const result = await validateFn({
    certificateBase64,
    password,
    clinicId,
  });

  if (!result.data.valid || !result.data.info) {
    throw new Error(result.data.error || 'Certificado inválido');
  }

  const { info } = result.data;

  return {
    configurado: true,
    tipo: info.type,
    nomeArquivo: file.name,
    razaoSocial: info.subject,
    cnpj: info.cnpj,
    emissor: info.issuer,
    validoAte: info.validUntil,
    status: getCertificateStatus(info.validUntil),
  };
}

/**
 * Store a certificate securely using Cloud Function.
 * Validates, encrypts, and stores the certificate in Firestore.
 *
 * @param file - The .pfx or .p12 file
 * @param password - Certificate password
 * @param clinicId - The clinic ID
 * @returns Certificate info
 * @throws Error if storage fails
 */
export async function storeCertificate(
  file: File,
  password: string,
  clinicId: string
): Promise<CertificadoInfo> {
  const certificateBase64 = await fileToBase64(file);

  const storeFn = httpsCallable<
    { certificateBase64: string; password: string; clinicId: string },
    CloudFunctionResponse
  >(functions, 'storeCertificate');

  const result = await storeFn({
    certificateBase64,
    password,
    clinicId,
  });

  if (!result.data.valid || !result.data.info) {
    throw new Error(result.data.error || 'Erro ao armazenar certificado');
  }

  const { info } = result.data;

  return {
    configurado: true,
    tipo: info.type,
    nomeArquivo: file.name,
    razaoSocial: info.subject,
    cnpj: info.cnpj,
    emissor: info.issuer,
    validoAte: info.validUntil,
    status: getCertificateStatus(info.validUntil),
  };
}

/**
 * Delete a certificate using Cloud Function.
 *
 * @param clinicId - The clinic ID
 * @throws Error if deletion fails
 */
export async function deleteCertificate(clinicId: string): Promise<void> {
  const deleteFn = httpsCallable<
    { clinicId: string },
    { success: boolean; error?: string }
  >(functions, 'deleteCertificate');

  const result = await deleteFn({ clinicId });

  if (!result.data.success) {
    throw new Error(result.data.error || 'Erro ao remover certificado');
  }
}
