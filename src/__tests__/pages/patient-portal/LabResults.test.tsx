/**
 * Patient Portal Lab Results Tests
 * @module __tests__/pages/patient-portal/LabResults.test
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { resetPatientPortalMocks } from './setup'
import { useLabResults } from '../../../hooks/useLabResults'
import {
  mockResults,
  defaultLabResultsHook,
  loadingLabResultsHook,
  emptyLabResultsHook,
} from './LabResults.setup'

const mockUseLabResults = useLabResults as ReturnType<typeof vi.fn>

import { PatientLabResults } from '../../../pages/patient-portal/LabResults'

const renderLabResults = () =>
  render(
    <MemoryRouter>
      <PatientLabResults />
    </MemoryRouter>
  )

describe('PatientLabResults', () => {
  beforeEach(() => {
    resetPatientPortalMocks()
    mockUseLabResults.mockReturnValue(defaultLabResultsHook)
  })

  afterEach(() => vi.restoreAllMocks())

  describe('rendering', () => {
    it('should render without crashing', () => {
      const { container } = renderLabResults()
      expect(container).toBeDefined()
    })

    it('should have animation class', () => {
      const { container } = renderLabResults()
      expect(container.querySelector('.animate-enter')).toBeTruthy()
    })
  })

  describe('header', () => {
    it('should render page title', () => {
      renderLabResults()
      expect(screen.getByText('Meus Exames')).toBeInTheDocument()
    })

    it('should show ready results count', () => {
      renderLabResults()
      expect(screen.getByText(/1 resultado disponível/)).toBeInTheDocument()
    })

    it('should show pending results count', () => {
      renderLabResults()
      expect(screen.getByText(/1 pendente/)).toBeInTheDocument()
    })

    it('should handle plural for multiple ready results', () => {
      mockUseLabResults.mockReturnValue({
        ...defaultLabResultsHook,
        readyResults: [mockResults[0], mockResults[2]],
      })
      renderLabResults()
      expect(screen.getByText(/2 resultados disponíveis/)).toBeInTheDocument()
    })
  })

  describe('loading state', () => {
    beforeEach(() => mockUseLabResults.mockReturnValue(loadingLabResultsHook))

    it('should show skeleton loading state', () => {
      const { container } = renderLabResults()
      expect(container.querySelector('.animate-enter')).toBeTruthy()
    })
  })

  describe('search', () => {
    it('should render search input', () => {
      renderLabResults()
      expect(screen.getByPlaceholderText('Buscar exame...')).toBeInTheDocument()
    })

    it('should filter results by exam name', () => {
      renderLabResults()
      fireEvent.change(screen.getByPlaceholderText('Buscar exame...'), {
        target: { value: 'Hemograma' },
      })
      expect(screen.getByText('Hemograma Completo')).toBeInTheDocument()
      expect(screen.queryByText('Glicemia em Jejum')).not.toBeInTheDocument()
    })

    it('should filter results by doctor name', () => {
      renderLabResults()
      fireEvent.change(screen.getByPlaceholderText('Buscar exame...'), {
        target: { value: 'Ana Costa' },
      })
      expect(screen.getByText('Glicemia em Jejum')).toBeInTheDocument()
      expect(screen.queryByText('Hemograma Completo')).not.toBeInTheDocument()
    })

    it('should show empty state when no results match search', () => {
      renderLabResults()
      fireEvent.change(screen.getByPlaceholderText('Buscar exame...'), {
        target: { value: 'xyz não existe' },
      })
      expect(screen.getByText('Nenhum exame encontrado')).toBeInTheDocument()
    })
  })

  describe('filter tabs', () => {
    it('should render filter buttons', () => {
      renderLabResults()
      expect(screen.getByText('Todos')).toBeInTheDocument()
      expect(screen.getByText('Disponíveis')).toBeInTheDocument()
      expect(screen.getByText('Pendentes')).toBeInTheDocument()
    })

    it('should filter by disponíveis (ready/viewed)', () => {
      renderLabResults()
      fireEvent.click(screen.getByText('Disponíveis'))
      expect(screen.getByText('Hemograma Completo')).toBeInTheDocument()
      expect(screen.getByText('TSH')).toBeInTheDocument()
      expect(screen.queryByText('Glicemia em Jejum')).not.toBeInTheDocument()
    })

    it('should filter by pendentes', () => {
      renderLabResults()
      fireEvent.click(screen.getByText('Pendentes'))
      expect(screen.getByText('Glicemia em Jejum')).toBeInTheDocument()
      expect(screen.queryByText('Hemograma Completo')).not.toBeInTheDocument()
    })

    it('should show all results by default', () => {
      renderLabResults()
      expect(screen.getByText('Hemograma Completo')).toBeInTheDocument()
      expect(screen.getByText('Glicemia em Jejum')).toBeInTheDocument()
      expect(screen.getByText('TSH')).toBeInTheDocument()
    })
  })

  describe('result cards', () => {
    it('should show exam name', () => {
      renderLabResults()
      expect(screen.getByText('Hemograma Completo')).toBeInTheDocument()
    })

    it('should show exam type label', () => {
      renderLabResults()
      expect(screen.getByText('Hematologia')).toBeInTheDocument()
      expect(screen.getByText('Bioquímica')).toBeInTheDocument()
      expect(screen.getByText('Hormônios')).toBeInTheDocument()
    })

    it('should show status badges', () => {
      renderLabResults()
      expect(screen.getByText('Disponível')).toBeInTheDocument()
      expect(screen.getByText('Aguardando')).toBeInTheDocument()
      expect(screen.getByText('Visualizado')).toBeInTheDocument()
    })

    it('should show doctor name', () => {
      renderLabResults()
      expect(screen.getByText(/Dr\. João Silva/)).toBeInTheDocument()
    })

    it('should show Médico fallback when no doctor name', () => {
      mockUseLabResults.mockReturnValue({
        ...defaultLabResultsHook,
        results: [{ ...mockResults[0], requestedByName: undefined }],
      })
      renderLabResults()
      expect(screen.getByText(/Solicitado por: Médico/)).toBeInTheDocument()
    })
  })

  describe('view action', () => {
    it('should show view button for ready results', () => {
      renderLabResults()
      expect(screen.getAllByText('Visualizar').length).toBeGreaterThan(0)
    })

    it('should not show view button for pending results', () => {
      mockUseLabResults.mockReturnValue({
        ...defaultLabResultsHook,
        results: [mockResults[1]],
        readyResults: [],
        pendingResults: [mockResults[1]],
      })
      renderLabResults()
      expect(screen.queryByText('Visualizar')).not.toBeInTheDocument()
      expect(screen.getByText('Resultado em processamento')).toBeInTheDocument()
    })

    it('should call markAsViewed when viewing ready result', async () => {
      const mockMarkAsViewed = vi.fn().mockResolvedValue(undefined)
      mockUseLabResults.mockReturnValue({
        ...defaultLabResultsHook,
        results: [mockResults[0]],
        readyResults: [mockResults[0]],
        markAsViewed: mockMarkAsViewed,
      })
      vi.spyOn(window, 'open').mockImplementation(() => null)

      renderLabResults()
      fireEvent.click(screen.getByText('Visualizar'))

      await waitFor(() => expect(mockMarkAsViewed).toHaveBeenCalledWith('lab-1'))
    })

    it('should not call markAsViewed for already viewed result', async () => {
      const mockMarkAsViewed = vi.fn()
      mockUseLabResults.mockReturnValue({
        ...defaultLabResultsHook,
        results: [mockResults[2]],
        markAsViewed: mockMarkAsViewed,
      })
      vi.spyOn(window, 'open').mockImplementation(() => null)

      renderLabResults()
      fireEvent.click(screen.getByText('Visualizar'))

      expect(mockMarkAsViewed).not.toHaveBeenCalled()
    })

    it('should handle markAsViewed error gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockUseLabResults.mockReturnValue({
        ...defaultLabResultsHook,
        results: [mockResults[0]],
        readyResults: [mockResults[0]],
        markAsViewed: vi.fn().mockRejectedValue(new Error('API Error')),
      })
      vi.spyOn(window, 'open').mockImplementation(() => null)

      renderLabResults()
      fireEvent.click(screen.getByText('Visualizar'))

      await waitFor(() => expect(consoleSpy).toHaveBeenCalled())
      consoleSpy.mockRestore()
    })
  })

  describe('download action', () => {
    it('should show Baixar Resumo button when no fileUrl', () => {
      mockUseLabResults.mockReturnValue({
        ...defaultLabResultsHook,
        results: [{ ...mockResults[0], fileUrl: undefined }],
        readyResults: [{ ...mockResults[0], fileUrl: undefined }],
      })
      renderLabResults()
      expect(screen.getByText('Baixar Resumo')).toBeInTheDocument()
      expect(screen.queryByText('Visualizar')).not.toBeInTheDocument()
    })
  })

  describe('empty state', () => {
    beforeEach(() => mockUseLabResults.mockReturnValue(emptyLabResultsHook))

    it('should show empty state message', () => {
      renderLabResults()
      expect(screen.getByText('Nenhum exame encontrado')).toBeInTheDocument()
    })

    it('should show empty state description', () => {
      renderLabResults()
      expect(screen.getByText('Nenhum resultado de exame disponível')).toBeInTheDocument()
    })
  })

  describe('info card', () => {
    it('should show info card', () => {
      renderLabResults()
      expect(screen.getByText('Sobre seus resultados')).toBeInTheDocument()
    })

    it('should show info description', () => {
      renderLabResults()
      expect(screen.getByText(/Os resultados ficam disponíveis para download/)).toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('should not show Visualizar button when no fileUrl', () => {
      mockUseLabResults.mockReturnValue({
        ...defaultLabResultsHook,
        results: [{ ...mockResults[0], fileUrl: undefined }],
        readyResults: [{ ...mockResults[0], fileUrl: undefined }],
      })
      renderLabResults()
      expect(screen.queryByText('Visualizar')).not.toBeInTheDocument()
    })
  })
})
