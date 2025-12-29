/**
 * Billing Test Setup
 * @module __tests__/pages/Billing.setup
 */

import { vi } from 'vitest'

export const mockAddGuia = vi.fn()
export const mockUpdateStatus = vi.fn()
export const mockRefresh = vi.fn()

export const mockDefaultGuias = [
  {
    id: 'guia-1',
    numeroGuiaPrestador: '2024010001',
    patientId: 'p1',
    tipo: 'consulta',
    status: 'rascunho',
    registroANS: '123456',
    nomeOperadora: 'Unimed',
    dataAtendimento: '2024-12-20',
    valorTotal: 250,
    createdAt: { toDate: () => new Date() },
  },
  {
    id: 'guia-2',
    numeroGuiaPrestador: '2024010002',
    patientId: 'p2',
    tipo: 'consulta',
    status: 'enviada',
    registroANS: '789012',
    nomeOperadora: 'SulAmérica',
    dataAtendimento: '2024-12-21',
    valorTotal: 300,
    createdAt: { toDate: () => new Date() },
  },
  {
    id: 'guia-3',
    numeroGuiaPrestador: '2024010003',
    patientId: 'p3',
    tipo: 'consulta',
    status: 'glosada_parcial',
    registroANS: '123456',
    nomeOperadora: 'Unimed',
    dataAtendimento: '2024-12-22',
    valorTotal: 400,
    valorGlosado: 100,
    createdAt: { toDate: () => new Date() },
  },
]

export const mockDefaultStats = {
  total: 10,
  pendentes: 3,
  valorRecebido: 5000,
  valorGlosado: 500,
  glosadas: 2,
}

export const defaultGuiasHook = {
  guias: mockDefaultGuias,
  stats: mockDefaultStats,
  loading: false,
  error: null,
  addGuia: mockAddGuia.mockResolvedValue({ id: 'new-guia' }),
  updateStatus: mockUpdateStatus.mockResolvedValue(undefined),
  refresh: mockRefresh,
}

export const loadingGuiasHook = {
  ...defaultGuiasHook,
  guias: [],
  loading: true,
}

export const emptyGuiasHook = {
  ...defaultGuiasHook,
  guias: [],
  stats: { total: 0, pendentes: 0, valorRecebido: 0, valorGlosado: 0, glosadas: 0 },
}

export const defaultOperadorasHook = {
  operadoras: [
    { id: 'op-1', nomeFantasia: 'Unimed', registroANS: '123456', codigoPrestador: 'PREST1' },
  ],
  operadorasAtivas: [
    { id: 'op-1', nomeFantasia: 'Unimed', registroANS: '123456', codigoPrestador: 'PREST1' },
  ],
  loading: false,
}
