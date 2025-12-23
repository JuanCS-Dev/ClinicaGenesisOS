/**
 * Certificate utilities for TISS billing
 *
 * Helper functions for certificate validation and status display.
 */

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
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50 border-emerald-200',
        label: 'Válido',
      };
    case 'expiring_soon':
      return {
        color: 'text-amber-600',
        bgColor: 'bg-amber-50 border-amber-200',
        label: 'Expirando em breve',
      };
    case 'expired':
      return {
        color: 'text-red-600',
        bgColor: 'bg-red-50 border-red-200',
        label: 'Expirado',
      };
    default:
      return {
        color: 'text-gray-500',
        bgColor: 'bg-gray-50 border-gray-200',
        label: 'Não configurado',
      };
  }
}

/**
 * Mock certificate validation - simulates reading certificate info.
 * In production, this would use a Cloud Function to securely parse the .pfx
 */
export async function mockValidateCertificate(
  file: File,
  _password: string
): Promise<CertificadoInfo> {
  // Simulate server validation delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Simulate 10% chance of wrong password
  if (Math.random() < 0.1) {
    throw new Error('Senha incorreta ou certificado inválido');
  }

  // Return mock certificate info
  const validoAte = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

  return {
    configurado: true,
    tipo: 'A1',
    nomeArquivo: file.name,
    razaoSocial: 'Clínica Exemplo LTDA',
    cnpj: '12.345.678/0001-90',
    emissor: 'AC SERASA RFB V5',
    validoAte,
    status: getCertificateStatus(validoAte),
  };
}
