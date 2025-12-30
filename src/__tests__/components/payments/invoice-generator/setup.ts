/**
 * InvoiceGenerator Test Setup
 *
 * Shared fixtures and utilities for InvoiceGenerator tests.
 * Note: ClinicContext mock must be defined in each test file before component import.
 */
import { vi } from 'vitest'
import type { InvoiceItem } from '@/types'

// Mock ClinicContext data - to be used by each test file's mock
export const mockClinicContext = {
  clinicId: 'clinic-123',
  clinic: {
    name: 'Clinica Genesis',
    cnpj: '12.345.678/0001-90',
    address: 'Rua Exemplo, 123',
    phone: '11999999999',
    email: 'contato@clinica.com',
  },
}

// Default patient fixture
export const defaultPatient = {
  name: 'Maria Santos',
  cpf: '123.456.789-00',
  email: 'maria@email.com',
  phone: '11999998888',
}

// Default items fixture
export const defaultItems: InvoiceItem[] = [
  { description: 'Consulta', quantity: 1, unitPrice: 25000, total: 25000 },
]

// Multiple items fixture
export const multipleItems: InvoiceItem[] = [
  { description: 'Item 1', quantity: 2, unitPrice: 5000, total: 10000 },
  { description: 'Item 2', quantity: 1, unitPrice: 15000, total: 15000 },
]

// Mock functions
export const createMockHandlers = () => ({
  mockOnGenerate: vi.fn(),
  mockOnSend: vi.fn().mockResolvedValue(undefined),
  mockOnClose: vi.fn(),
})
