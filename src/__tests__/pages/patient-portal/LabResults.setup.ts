/**
 * LabResults Test Setup
 * Shared mocks, fixtures, and utilities for LabResults tests.
 * @module __tests__/pages/patient-portal/LabResults.setup
 */

import { vi } from 'vitest'

export const mockResults = [
  {
    id: 'lab-1',
    patientId: 'patient-123',
    examType: 'hemograma' as const,
    examName: 'Hemograma Completo',
    status: 'ready' as const,
    requestedAt: new Date().toISOString(),
    requestedByName: 'Dr. João Silva',
    fileUrl: 'https://example.com/results/lab-1.pdf',
    fileName: 'hemograma.pdf',
  },
  {
    id: 'lab-2',
    patientId: 'patient-123',
    examType: 'bioquimica' as const,
    examName: 'Glicemia em Jejum',
    status: 'pending' as const,
    requestedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    requestedByName: 'Dra. Ana Costa',
  },
  {
    id: 'lab-3',
    patientId: 'patient-123',
    examType: 'hormonal' as const,
    examName: 'TSH',
    status: 'viewed' as const,
    requestedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    requestedByName: 'Dr. Carlos Lima',
    fileUrl: 'https://example.com/results/lab-3.pdf',
  },
]

export const defaultLabResultsHook = {
  results: mockResults,
  readyResults: mockResults.filter(r => r.status === 'ready'),
  pendingResults: mockResults.filter(r => r.status === 'pending'),
  loading: false,
  error: null,
  refresh: vi.fn(),
  markAsViewed: vi.fn().mockResolvedValue(undefined),
}

export const loadingLabResultsHook = {
  results: [],
  readyResults: [],
  pendingResults: [],
  loading: true,
  error: null,
  refresh: vi.fn(),
  markAsViewed: vi.fn(),
}

export const emptyLabResultsHook = {
  results: [],
  readyResults: [],
  pendingResults: [],
  loading: false,
  error: null,
  refresh: vi.fn(),
  markAsViewed: vi.fn(),
}
