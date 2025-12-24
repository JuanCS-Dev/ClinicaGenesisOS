/**
 * LotesTab Test Setup
 *
 * Shared mock data factories for billing lotes tests.
 */

import type { LoteGuias, GuiaFirestore } from '@/types';

/**
 * Create a mock lote.
 */
export function createMockLote(overrides: Partial<LoteGuias> = {}): LoteGuias {
  return {
    id: 'lote-1',
    clinicId: 'clinic-1',
    registroANS: '123456',
    nomeOperadora: 'Unimed',
    guiaIds: ['guia-1', 'guia-2'],
    quantidadeGuias: 2,
    valorTotal: 1500,
    status: 'rascunho',
    numeroLote: 'L-2024-001',
    dataGeracao: '2024-01-15T10:00:00Z',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    createdBy: 'user-1',
    ...overrides,
  };
}

/**
 * Create a mock guia.
 */
export function createMockGuia(overrides: Partial<GuiaFirestore> = {}): GuiaFirestore {
  return {
    id: 'guia-1',
    clinicId: 'clinic-1',
    patientId: 'patient-1',
    appointmentId: 'apt-1',
    tipo: 'consulta',
    registroANS: '123456',
    nomeOperadora: 'Unimed',
    numeroGuiaPrestador: 'GP-001',
    dataAtendimento: '2024-01-15',
    status: 'rascunho',
    valorTotal: 500,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    dadosGuia: {
      dadosBeneficiario: {
        numeroCarteira: '123456789',
        nomeBeneficiario: 'João Silva',
      },
    },
    ...overrides,
  } as GuiaFirestore;
}
