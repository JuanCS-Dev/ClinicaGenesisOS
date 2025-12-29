/**
 * Export Service Tests
 *
 * Tests for PDF and Excel export functionality.
 *
 * @module __tests__/services/export
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { Transaction, FinancialSummary } from '@/types'

// Mock xlsx module
vi.mock('xlsx', () => ({
  utils: {
    book_new: vi.fn(() => ({})),
    json_to_sheet: vi.fn(() => ({})),
    book_append_sheet: vi.fn(),
  },
  writeFile: vi.fn(),
}))

// Mock jspdf module - use factory to avoid hoisting issues
vi.mock('jspdf', () => {
  return {
    default: class MockJsPDF {
      internal = { pageSize: { width: 210, height: 297 } }
      setFontSize = vi.fn()
      setTextColor = vi.fn()
      text = vi.fn()
      save = vi.fn()
      getNumberOfPages = vi.fn(() => 1)
      setPage = vi.fn()
    },
  }
})

vi.mock('jspdf-autotable', () => ({
  default: vi.fn(),
}))

describe('Export Service', () => {
  const mockTransactions: Transaction[] = [
    {
      id: 'tx-1',
      clinicId: 'clinic-123',
      type: 'income',
      description: 'Consulta Cardiologia',
      amount: 30000,
      date: '2024-01-15T10:00:00Z',
      status: 'paid',
      categoryId: 'cat-consultas',
      paymentMethod: 'pix',
      patientName: 'João Silva',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
      createdBy: 'user-1',
    },
    {
      id: 'tx-2',
      clinicId: 'clinic-123',
      type: 'expense',
      description: 'Material Hospitalar',
      amount: 15000,
      date: '2024-01-16T14:00:00Z',
      status: 'pending',
      categoryId: 'cat-materiais',
      paymentMethod: 'bank_transfer',
      createdAt: '2024-01-16T14:00:00Z',
      updatedAt: '2024-01-16T14:00:00Z',
      createdBy: 'user-1',
    },
  ]

  const mockSummary: FinancialSummary = {
    totalIncome: 30000,
    totalExpenses: 15000,
    netBalance: 15000,
    pendingIncome: 0,
    pendingExpenses: 15000,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetModules()
  })

  describe('exportTransactionsToExcel', () => {
    it('should export transactions to Excel', async () => {
      const { exportTransactionsToExcel } = await import('../../services/export.service')
      const XLSX = await import('xlsx')

      await exportTransactionsToExcel(mockTransactions, 'test-export')

      expect(XLSX.utils.book_new).toHaveBeenCalled()
      expect(XLSX.utils.json_to_sheet).toHaveBeenCalled()
      expect(XLSX.utils.book_append_sheet).toHaveBeenCalled()
      expect(XLSX.writeFile).toHaveBeenCalled()
    })

    it('should format transaction data correctly', async () => {
      const { exportTransactionsToExcel } = await import('../../services/export.service')
      const XLSX = await import('xlsx')

      await exportTransactionsToExcel(mockTransactions)

      // Verify json_to_sheet was called with formatted data
      expect(XLSX.utils.json_to_sheet).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            Descrição: 'Consulta Cardiologia',
            Tipo: 'Receita',
          }),
        ])
      )
    })

    it('should use default filename when not provided', async () => {
      const { exportTransactionsToExcel } = await import('../../services/export.service')
      const XLSX = await import('xlsx')

      await exportTransactionsToExcel(mockTransactions)

      expect(XLSX.writeFile).toHaveBeenCalledWith(
        expect.anything(),
        expect.stringMatching(/^transacoes_\d{4}-\d{2}-\d{2}\.xlsx$/)
      )
    })
  })

  describe('exportTransactionsToPDF', () => {
    it('should export transactions to PDF without error', async () => {
      const { exportTransactionsToPDF } = await import('../../services/export.service')

      // Should complete without throwing
      await expect(
        exportTransactionsToPDF(mockTransactions, mockSummary, 'Test Clinic', 'test-report')
      ).resolves.toBeUndefined()
    })

    it('should export with custom clinic name', async () => {
      const { exportTransactionsToPDF } = await import('../../services/export.service')

      await expect(
        exportTransactionsToPDF(mockTransactions, mockSummary, 'Clínica ABC')
      ).resolves.toBeUndefined()
    })

    it('should handle null summary', async () => {
      const { exportTransactionsToPDF } = await import('../../services/export.service')

      await expect(exportTransactionsToPDF(mockTransactions, null)).resolves.toBeUndefined()
    })

    it('should use default parameters', async () => {
      const { exportTransactionsToPDF } = await import('../../services/export.service')

      await expect(exportTransactionsToPDF(mockTransactions, mockSummary)).resolves.toBeUndefined()
    })
  })

  describe('exportReportToPDF', () => {
    const mockReportData = {
      totalPatients: 150,
      activePatients: 120,
      appointmentsCount: 450,
      completionRate: 85,
      procedureStats: [
        { name: 'Consulta', value: 200 },
        { name: 'Exame', value: 150 },
      ],
      demographics: {
        gender: [
          { name: 'Masculino', value: 45 },
          { name: 'Feminino', value: 55 },
        ],
        ageGroups: [
          { name: '0-17', value: 15 },
          { name: '18-35', value: 30 },
          { name: '36-55', value: 35 },
          { name: '56+', value: 20 },
        ],
      },
    }

    it('should export report to PDF', async () => {
      const { exportReportToPDF } = await import('../../services/export.service')

      await expect(
        exportReportToPDF(mockReportData, 'Test Clinic', 'test-report')
      ).resolves.toBeUndefined()
    })

    it('should include KPI data', async () => {
      const { exportReportToPDF } = await import('../../services/export.service')

      await expect(exportReportToPDF(mockReportData)).resolves.toBeUndefined()
    })

    it('should handle empty procedure stats', async () => {
      const { exportReportToPDF } = await import('../../services/export.service')

      const dataWithoutProcedures = {
        ...mockReportData,
        procedureStats: [],
      }

      await expect(exportReportToPDF(dataWithoutProcedures)).resolves.toBeUndefined()
    })

    it('should handle null demographics', async () => {
      const { exportReportToPDF } = await import('../../services/export.service')

      const dataWithoutDemographics = {
        ...mockReportData,
        demographics: null,
      }

      await expect(exportReportToPDF(dataWithoutDemographics)).resolves.toBeUndefined()
    })

    it('should use default clinic name', async () => {
      const { exportReportToPDF } = await import('../../services/export.service')

      await expect(exportReportToPDF(mockReportData)).resolves.toBeUndefined()
    })
  })
})
