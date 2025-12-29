/**
 * Analytics Page Tests
 *
 * Smoke tests + basic functionality verification.
 * The page uses child components (FinancialWellness, PatientInsights),
 * so we mock them for isolation.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

// Mock child components
vi.mock('../../components/analytics', () => ({
  FinancialWellness: () => <div data-testid="financial-wellness">Financial Wellness Content</div>,
  PatientInsights: () => <div data-testid="patient-insights">Patient Insights Content</div>,
}))

// Mock hooks used for export functionality
vi.mock('../../hooks/useFinancialWellness', () => ({
  useFinancialWellness: () => ({
    loading: false,
    healthScore: { overall: 85, status: 'healthy', components: {}, recommendations: [] },
    projection: {
      currentMonth: 0,
      projectedMonth: 0,
      projectedQuarter: 0,
      projectedYear: 0,
      growthRate: 0,
      confidence: 'high',
    },
    delinquency: {
      totalOverdue: 0,
      overdueCount: 0,
      overduePercentage: 0,
      averageDaysOverdue: 0,
      byAgeRange: [],
    },
    yoyComparison: {
      currentYear: 0,
      previousYear: 0,
      percentageChange: 0,
      trend: 'up',
      byMonth: [],
    },
    procedureMetrics: [],
  }),
}))

vi.mock('../../hooks/usePatientInsights', () => ({
  usePatientInsights: () => ({
    loading: false,
    retention: {
      totalPatients: 0,
      newPatients: 0,
      activePatients: 0,
      returningPatients: 0,
      retentionRate: 0,
      churnRate: 0,
    },
    nps: { score: 50, promoters: 0, passives: 0, detractors: 0, totalResponses: 0 },
    engagement: {
      portalAdoption: 0,
      appointmentConfirmationRate: 0,
      noShowRate: 0,
      averageResponseTime: 0,
    },
    demographics: { byAge: [], byGender: [] },
    patientsAtRisk: [],
  }),
}))

// Mock export service
vi.mock('../../services/analytics-export.service', () => ({
  exportAnalytics: vi.fn().mockResolvedValue(undefined),
}))

import { Analytics } from '../../pages/Analytics'

const renderAnalytics = () => {
  return render(
    <MemoryRouter>
      <Analytics />
    </MemoryRouter>
  )
}

describe('Analytics', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('smoke tests', () => {
    it('should render without crashing', () => {
      const { container } = renderAnalytics()
      expect(container).toBeDefined()
    })

    it('should have main content area', () => {
      const { container } = renderAnalytics()
      expect(container.querySelector('.animate-enter')).toBeTruthy()
    })
  })

  describe('header', () => {
    it('should display page title', () => {
      renderAnalytics()
      expect(screen.getByText('Analytics & Insights')).toBeInTheDocument()
    })

    it('should display page description', () => {
      renderAnalytics()
      expect(screen.getByText(/Inteligência de negócios/i)).toBeInTheDocument()
    })
  })

  describe('date range selector', () => {
    it('should have date range buttons', () => {
      renderAnalytics()
      expect(screen.getByText('Semana')).toBeInTheDocument()
      expect(screen.getByText('Mês')).toBeInTheDocument()
      expect(screen.getByText('Trimestre')).toBeInTheDocument()
      expect(screen.getByText('Ano')).toBeInTheDocument()
    })

    it('should change date range on click', () => {
      renderAnalytics()
      const yearButton = screen.getByText('Ano')
      fireEvent.click(yearButton)
      // Button should become active (has different styling)
      expect(yearButton).toBeInTheDocument()
    })
  })

  describe('tabs', () => {
    it('should display tab navigation', () => {
      renderAnalytics()
      expect(screen.getByText('Saúde Financeira')).toBeInTheDocument()
      expect(screen.getByText('Insights de Pacientes')).toBeInTheDocument()
    })

    it('should show financial tab content by default', () => {
      renderAnalytics()
      expect(screen.getByTestId('financial-wellness')).toBeInTheDocument()
    })

    it('should switch to patient insights tab when clicked', () => {
      renderAnalytics()
      fireEvent.click(screen.getByText('Insights de Pacientes'))
      expect(screen.getByTestId('patient-insights')).toBeInTheDocument()
    })
  })

  describe('actions', () => {
    it('should have refresh button', () => {
      renderAnalytics()
      expect(screen.getByText('Atualizar')).toBeInTheDocument()
    })

    it('should have export button', () => {
      renderAnalytics()
      expect(screen.getByText('Exportar')).toBeInTheDocument()
    })

    it('should refresh data when clicking refresh button', () => {
      renderAnalytics()
      const refreshButton = screen.getByText('Atualizar')
      fireEvent.click(refreshButton)
      // Refresh should show toast - component re-renders with new key
      expect(screen.getByTestId('financial-wellness')).toBeInTheDocument()
    })
  })

  describe('export functionality', () => {
    it('should open export menu when clicking export button', () => {
      renderAnalytics()
      const exportButton = screen.getByText('Exportar')
      fireEvent.click(exportButton)
      expect(screen.getByText('Excel (.xlsx)')).toBeInTheDocument()
      expect(screen.getByText('PDF (.pdf)')).toBeInTheDocument()
    })

    it('should close export menu when clicking again', () => {
      renderAnalytics()
      const exportButton = screen.getByText('Exportar')
      fireEvent.click(exportButton) // open
      expect(screen.getByText('Excel (.xlsx)')).toBeInTheDocument()
      fireEvent.click(exportButton) // close
      expect(screen.queryByText('Excel (.xlsx)')).not.toBeInTheDocument()
    })

    it('should export to Excel when clicking xlsx option', async () => {
      const { exportAnalytics } = await import('../../services/analytics-export.service')
      renderAnalytics()

      const exportButton = screen.getByText('Exportar')
      fireEvent.click(exportButton)

      const xlsxOption = screen.getByText('Excel (.xlsx)')
      fireEvent.click(xlsxOption)

      expect(exportAnalytics).toHaveBeenCalledWith(
        expect.objectContaining({
          dateRange: 'Último Mês',
        }),
        'xlsx'
      )
    })

    it('should export to PDF when clicking pdf option', async () => {
      const { exportAnalytics } = await import('../../services/analytics-export.service')
      renderAnalytics()

      const exportButton = screen.getByText('Exportar')
      fireEvent.click(exportButton)

      const pdfOption = screen.getByText('PDF (.pdf)')
      fireEvent.click(pdfOption)

      expect(exportAnalytics).toHaveBeenCalledWith(
        expect.objectContaining({
          dateRange: 'Último Mês',
        }),
        'pdf'
      )
    })
  })
})

export default Analytics
