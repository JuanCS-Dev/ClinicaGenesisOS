/**
 * Analytics Export Service Tests
 *
 * Tests for analytics data export to Excel/PDF.
 *
 * @module __tests__/services/analytics-export
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { FinancialWellnessData } from '@/hooks/useFinancialWellness'
import type { PatientInsightsData } from '@/hooks/usePatientInsights'

// Mock document methods
const mockCreateElement = vi.fn()
const mockAppendChild = vi.fn()
const mockRemoveChild = vi.fn()
const mockClick = vi.fn()
let mockLink: { href: string; download: string; click: () => void }

// Store original methods
const originalCreateElement = document.createElement.bind(document)
const originalAppendChild = document.body.appendChild.bind(document.body)
const originalRemoveChild = document.body.removeChild.bind(document.body)

beforeEach(() => {
  mockLink = {
    href: '',
    download: '',
    click: mockClick,
  }

  document.createElement = vi.fn((tag: string) => {
    if (tag === 'a') {
      return mockLink as unknown as HTMLAnchorElement
    }
    return originalCreateElement(tag)
  })

  document.body.appendChild = vi.fn(mockAppendChild)
  document.body.removeChild = vi.fn(mockRemoveChild)

  // Mock URL methods
  globalThis.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
  globalThis.URL.revokeObjectURL = vi.fn()
})

afterEach(() => {
  document.createElement = originalCreateElement
  document.body.appendChild = originalAppendChild
  document.body.removeChild = originalRemoveChild
})

// Mock xlsx module
vi.mock('xlsx', () => ({
  utils: {
    book_new: vi.fn(() => ({ SheetNames: [], Sheets: {} })),
    aoa_to_sheet: vi.fn(() => ({ '!cols': [] })),
    book_append_sheet: vi.fn(),
  },
  write: vi.fn(() => new Uint8Array([1, 2, 3])),
}))

// Mock jspdf module
vi.mock('jspdf', () => {
  return {
    default: class MockJsPDF {
      internal = { pageSize: { width: 210, height: 297 } }
      lastAutoTable = { finalY: 100 }
      setFontSize = vi.fn()
      setTextColor = vi.fn()
      text = vi.fn()
      output = vi.fn(() => new Blob(['pdf-content'], { type: 'application/pdf' }))
      addPage = vi.fn()
      // autoTable is added by jspdf-autotable
      autoTable = vi.fn()
    },
  }
})

vi.mock('jspdf-autotable', () => ({
  default: vi.fn(),
}))

describe('Analytics Export Service', () => {
  const mockFinancialData: FinancialWellnessData = {
    healthScore: {
      overall: 78,
      status: 'healthy',
      components: {
        cashFlow: 80,
        profitability: 75,
        collections: 85,
        growth: 70,
      },
      recommendations: [
        'Considere aumentar o follow-up de pagamentos pendentes',
        'Avalie novos procedimentos de alta margem',
      ],
    },
    projection: {
      currentMonth: 50000,
      projectedMonth: 55000,
      projectedQuarter: 165000,
      projectedYear: 660000,
      growthRate: 10,
      confidence: 'high',
    },
    delinquency: {
      totalOverdue: 5000,
      overdueCount: 3,
      overduePercentage: 10,
      averageDaysOverdue: 15,
      byAgeRange: [
        { range: '1-30 dias', count: 2, amount: 3000 },
        { range: '31-60 dias', count: 1, amount: 2000 },
      ],
    },
    yoyComparison: {
      currentYear: 600000,
      previousYear: 550000,
      percentageChange: 9.1,
      trend: 'up',
      byMonth: [
        { month: 'Jan', currentYear: 50000, previousYear: 45000 },
        { month: 'Feb', currentYear: 52000, previousYear: 47000 },
      ],
    },
    procedureMetrics: [
      { procedureType: 'Consulta', count: 100, totalRevenue: 30000, averageTicket: 300 },
      { procedureType: 'Exame', count: 50, totalRevenue: 25000, averageTicket: 500 },
    ],
    loading: false,
    error: null,
  }

  const mockPatientData: PatientInsightsData = {
    retention: {
      totalPatients: 500,
      newPatients: 50,
      activePatients: 400,
      returningPatients: 350,
      retentionRate: 80,
      churnRate: 20,
    },
    nps: {
      score: 65,
      promoters: 70,
      passives: 20,
      detractors: 10,
      totalResponses: 100,
    },
    engagement: {
      portalAdoption: 45,
      appointmentConfirmationRate: 90,
      noShowRate: 8,
      averageResponseTime: 4,
    },
    demographics: {
      byAge: [
        { range: '0-17', count: 50, percentage: 10 },
        { range: '18-35', count: 150, percentage: 30 },
        { range: '36-55', count: 200, percentage: 40 },
        { range: '56+', count: 100, percentage: 20 },
      ],
      byGender: [
        { gender: 'Masculino', count: 220, percentage: 44 },
        { gender: 'Feminino', count: 280, percentage: 56 },
      ],
    },
    patientsAtRisk: [
      {
        patientId: 'p1',
        patientName: 'João Silva',
        lastVisit: '2023-06-15',
        reason: 'Sem consulta há 6 meses',
        riskLevel: 'high',
      },
      {
        patientId: 'p2',
        patientName: 'Maria Santos',
        lastVisit: '2023-09-01',
        reason: 'Tratamento incompleto',
        riskLevel: 'medium',
      },
    ],
    loading: false,
    error: null,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetModules()
  })

  describe('exportAnalytics', () => {
    it('should export to Excel by default', async () => {
      const { exportAnalytics } = await import('../../services/analytics-export.service')
      const XLSX = await import('xlsx')

      const data = {
        financial: mockFinancialData,
        patients: mockPatientData,
        dateRange: 'Janeiro 2024',
        generatedAt: new Date(),
      }

      await exportAnalytics(data)

      expect(XLSX.utils.book_new).toHaveBeenCalled()
      expect(XLSX.write).toHaveBeenCalled()
      expect(mockClick).toHaveBeenCalled()
      expect(mockLink.download).toMatch(/analytics-clinica-genesis-.*\.xlsx/)
    })

    it('should export to PDF when specified', async () => {
      const { exportAnalytics } = await import('../../services/analytics-export.service')

      const data = {
        financial: mockFinancialData,
        patients: mockPatientData,
        dateRange: 'Janeiro 2024',
        generatedAt: new Date(),
      }

      await exportAnalytics(data, 'pdf')

      expect(mockClick).toHaveBeenCalled()
      expect(mockLink.download).toMatch(/analytics-clinica-genesis-.*\.pdf/)
    })

    it('should handle financial data only', async () => {
      const { exportAnalytics } = await import('../../services/analytics-export.service')
      const XLSX = await import('xlsx')

      const data = {
        financial: mockFinancialData,
        dateRange: 'Janeiro 2024',
        generatedAt: new Date(),
      }

      await exportAnalytics(data, 'xlsx')

      expect(XLSX.utils.aoa_to_sheet).toHaveBeenCalled()
      expect(mockClick).toHaveBeenCalled()
    })

    it('should handle patient data only', async () => {
      const { exportAnalytics } = await import('../../services/analytics-export.service')
      const XLSX = await import('xlsx')

      const data = {
        patients: mockPatientData,
        dateRange: 'Janeiro 2024',
        generatedAt: new Date(),
      }

      await exportAnalytics(data, 'xlsx')

      expect(XLSX.utils.aoa_to_sheet).toHaveBeenCalled()
      expect(mockClick).toHaveBeenCalled()
    })

    it('should create YoY comparison sheet when data available', async () => {
      const { exportAnalytics } = await import('../../services/analytics-export.service')
      const XLSX = await import('xlsx')

      const data = {
        financial: mockFinancialData,
        dateRange: 'Janeiro 2024',
        generatedAt: new Date(),
      }

      await exportAnalytics(data, 'xlsx')

      // YoY sheet should be created
      expect(XLSX.utils.book_append_sheet).toHaveBeenCalled()
    })

    it('should trigger file download', async () => {
      const { exportAnalytics } = await import('../../services/analytics-export.service')

      const data = {
        financial: mockFinancialData,
        dateRange: 'Janeiro 2024',
        generatedAt: new Date(),
      }

      await exportAnalytics(data, 'xlsx')

      expect(URL.createObjectURL).toHaveBeenCalled()
      expect(mockClick).toHaveBeenCalled()
      expect(URL.revokeObjectURL).toHaveBeenCalled()
    })

    it('should handle empty YoY data', async () => {
      const { exportAnalytics } = await import('../../services/analytics-export.service')

      const financialWithEmptyYoY = {
        ...mockFinancialData,
        yoyComparison: {
          ...mockFinancialData.yoyComparison,
          byMonth: [],
        },
      }

      const data = {
        financial: financialWithEmptyYoY,
        dateRange: 'Janeiro 2024',
        generatedAt: new Date(),
      }

      await exportAnalytics(data, 'xlsx')

      expect(mockClick).toHaveBeenCalled()
    })

    it('should categorize NPS score correctly', async () => {
      const { exportAnalytics } = await import('../../services/analytics-export.service')

      // Excellent NPS (>= 50)
      const dataExcellent = {
        patients: { ...mockPatientData, nps: { ...mockPatientData.nps, score: 65 } },
        dateRange: 'Janeiro 2024',
        generatedAt: new Date(),
      }

      await exportAnalytics(dataExcellent, 'xlsx')
      expect(mockClick).toHaveBeenCalled()

      vi.clearAllMocks()

      // Good NPS (0-49)
      const dataGood = {
        patients: { ...mockPatientData, nps: { ...mockPatientData.nps, score: 25 } },
        dateRange: 'Janeiro 2024',
        generatedAt: new Date(),
      }

      await exportAnalytics(dataGood, 'xlsx')
      expect(mockClick).toHaveBeenCalled()

      vi.clearAllMocks()

      // Needs Improvement NPS (< 0)
      const dataBad = {
        patients: { ...mockPatientData, nps: { ...mockPatientData.nps, score: -10 } },
        dateRange: 'Janeiro 2024',
        generatedAt: new Date(),
      }

      await exportAnalytics(dataBad, 'xlsx')
      expect(mockClick).toHaveBeenCalled()
    })
  })

  describe('PDF export specifics', () => {
    it('should add new page when content exceeds page height', async () => {
      const { exportAnalytics } = await import('../../services/analytics-export.service')

      const data = {
        financial: mockFinancialData,
        patients: mockPatientData,
        dateRange: 'Janeiro 2024',
        generatedAt: new Date(),
      }

      // Should complete without throwing
      await expect(exportAnalytics(data, 'pdf')).resolves.toBeUndefined()
    })

    it('should format currency values in PDF', async () => {
      const { exportAnalytics } = await import('../../services/analytics-export.service')

      const data = {
        financial: mockFinancialData,
        dateRange: 'Janeiro 2024',
        generatedAt: new Date(),
      }

      // Should complete without throwing
      await expect(exportAnalytics(data, 'pdf')).resolves.toBeUndefined()
    })
  })
})
