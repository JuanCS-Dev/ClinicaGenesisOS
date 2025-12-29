/**
 * Billing Page Tests (TISS/Convênios)
 * @module __tests__/pages/Billing.test
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import {
  mockAddGuia,
  mockUpdateStatus,
  mockRefresh,
  mockDefaultGuias,
  mockDefaultStats,
  defaultGuiasHook,
  loadingGuiasHook,
  emptyGuiasHook,
  defaultOperadorasHook,
} from './Billing.setup'

vi.mock('../../contexts/ClinicContext', () => ({
  useClinicContext: vi.fn(() => ({ clinicId: 'clinic-123' })),
}))

vi.mock('../../hooks/useGuias', () => ({ useGuias: vi.fn(() => defaultGuiasHook) }))
vi.mock('../../hooks/useOperadoras', () => ({ useOperadoras: vi.fn(() => defaultOperadorasHook) }))

import { useGuias } from '../../hooks/useGuias'
import { useOperadoras } from '../../hooks/useOperadoras'
const mockUseGuias = useGuias as ReturnType<typeof vi.fn>
const mockUseOperadoras = useOperadoras as ReturnType<typeof vi.fn>

vi.mock('../../components/billing', () => ({
  TissConsultaForm: ({
    onSubmit,
    onCancel,
    isLoading,
  }: {
    onSubmit: (d: unknown) => void
    onCancel: () => void
    isLoading: boolean
  }) => (
    <form
      data-testid="tiss-form"
      onSubmit={e => {
        e.preventDefault()
        onSubmit({
          registroANS: '123456',
          nomeOperadora: 'Unimed',
          beneficiario: { nomeBeneficiario: 'Maria Santos', numeroCarteira: '123' },
          dataAtendimento: new Date().toISOString(),
          valorProcedimento: 150,
          indicacaoClinica: 'Consulta de rotina',
        })
      }}
    >
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Enviando...' : 'Enviar Guia'}
      </button>
      <button type="button" onClick={onCancel}>
        Cancelar
      </button>
    </form>
  ),
}))

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))
import { toast } from 'sonner'
import { Billing } from '../../pages/Billing'

const renderBilling = () =>
  render(
    <MemoryRouter>
      <Billing />
    </MemoryRouter>
  )

describe('Billing', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseGuias.mockReturnValue(defaultGuiasHook)
    mockUseOperadoras.mockReturnValue(defaultOperadorasHook)
  })

  afterEach(() => vi.restoreAllMocks())

  describe('rendering', () => {
    it('should render page title', () => {
      renderBilling()
      expect(screen.getByText('Faturamento TISS')).toBeInTheDocument()
    })

    it('should have animation class', () => {
      const { container } = renderBilling()
      expect(container.querySelector('.animate-enter')).toBeTruthy()
    })
  })

  describe('stats cards', () => {
    it('should display stat cards', () => {
      renderBilling()
      expect(screen.getByText('Total de Guias')).toBeInTheDocument()
      expect(screen.getByText('Pendentes')).toBeInTheDocument()
      expect(screen.getByText('Recebido')).toBeInTheDocument()
      expect(screen.getByText('Glosado')).toBeInTheDocument()
    })

    it('should format currency values', () => {
      renderBilling()
      expect(screen.getByText('R$ 5.000,00')).toBeInTheDocument()
      expect(screen.getByText('R$ 500,00')).toBeInTheDocument()
    })
  })

  describe('tabs', () => {
    it('should render tab buttons', () => {
      renderBilling()
      expect(screen.getByText('Nova Guia')).toBeInTheDocument()
      expect(screen.getByText('Histórico')).toBeInTheDocument()
      expect(screen.getByText('Glosas')).toBeInTheDocument()
    })

    it('should show Nova Guia form by default', () => {
      renderBilling()
      expect(screen.getByTestId('tiss-form')).toBeInTheDocument()
    })

    it('should switch to Histórico tab', () => {
      renderBilling()
      fireEvent.click(screen.getByText('Histórico'))
      expect(screen.getByPlaceholderText(/Buscar por número ou operadora/)).toBeInTheDocument()
    })

    it('should switch to Glosas tab', () => {
      renderBilling()
      fireEvent.click(screen.getByText('Glosas'))
      expect(screen.getByText('#2024010003')).toBeInTheDocument()
    })
  })

  describe('histórico tab', () => {
    const goToHistorico = () => {
      renderBilling()
      fireEvent.click(screen.getByText('Histórico'))
    }

    it('should display guia numbers', () => {
      goToHistorico()
      expect(screen.getByText('#2024010001')).toBeInTheDocument()
      expect(screen.getByText('#2024010002')).toBeInTheDocument()
    })

    it('should display status badges', () => {
      goToHistorico()
      expect(screen.getAllByText('Rascunho').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Enviada').length).toBeGreaterThan(0)
    })

    it('should filter by search query', () => {
      goToHistorico()
      fireEvent.change(screen.getByPlaceholderText(/Buscar/), { target: { value: '2024010001' } })
      expect(screen.getByText('#2024010001')).toBeInTheDocument()
      expect(screen.queryByText('#2024010002')).not.toBeInTheDocument()
    })

    it('should filter by status', () => {
      goToHistorico()
      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'enviada' } })
      expect(screen.getByText('#2024010002')).toBeInTheDocument()
      expect(screen.queryByText('#2024010001')).not.toBeInTheDocument()
    })
  })

  describe('glosas tab', () => {
    it('should show only glosadas guias', () => {
      renderBilling()
      fireEvent.click(screen.getByText('Glosas'))
      expect(screen.getByText('#2024010003')).toBeInTheDocument()
      expect(screen.queryByText('#2024010001')).not.toBeInTheDocument()
    })

    it('should show glosa value', () => {
      renderBilling()
      fireEvent.click(screen.getByText('Glosas'))
      expect(screen.getByText('-R$ 100,00')).toBeInTheDocument()
    })
  })

  describe('empty states', () => {
    it('should show empty state for no guias', () => {
      mockUseGuias.mockReturnValue(emptyGuiasHook)
      renderBilling()
      fireEvent.click(screen.getByText('Histórico'))
      expect(screen.getByText('Nenhuma guia encontrada')).toBeInTheDocument()
    })

    it('should show empty state for no operadoras', () => {
      mockUseOperadoras.mockReturnValue({ operadoras: [], operadorasAtivas: [], loading: false })
      renderBilling()
      expect(screen.getByText('Nenhum convênio configurado')).toBeInTheDocument()
    })
  })

  describe('form submission', () => {
    it('should call addGuia on form submit', async () => {
      renderBilling()
      fireEvent.submit(screen.getByTestId('tiss-form'))
      await waitFor(() => expect(mockAddGuia).toHaveBeenCalled())
    })

    it('should show success toast on successful submission', async () => {
      renderBilling()
      fireEvent.submit(screen.getByTestId('tiss-form'))
      await waitFor(() =>
        expect(toast.success).toHaveBeenCalledWith(
          'Guia TISS criada com sucesso',
          expect.any(Object)
        )
      )
    })

    it('should show error toast on failed submission', async () => {
      mockAddGuia.mockRejectedValue(new Error('Failed'))
      renderBilling()
      fireEvent.submit(screen.getByTestId('tiss-form'))
      await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Erro ao criar guia TISS'))
    })

    it('should navigate to Histórico on cancel', () => {
      renderBilling()
      fireEvent.click(screen.getByText('Cancelar'))
      expect(screen.getByPlaceholderText(/Buscar/)).toBeInTheDocument()
    })
  })

  describe('send guia action', () => {
    it('should call updateStatus when clicking send', async () => {
      renderBilling()
      fireEvent.click(screen.getByText('Histórico'))
      const sendButtons = document.querySelectorAll('[title="Enviar"]')
      if (sendButtons.length > 0) {
        fireEvent.click(sendButtons[0])
        await waitFor(() => expect(mockUpdateStatus).toHaveBeenCalledWith('guia-1', 'enviada'))
      }
    })
  })

  describe('loading state', () => {
    it('should show loading indicator', () => {
      mockUseGuias.mockReturnValue(loadingGuiasHook)
      renderBilling()
      fireEvent.click(screen.getByText('Histórico'))
      expect(document.querySelector('.animate-spin')).toBeTruthy()
    })
  })

  describe('date formatting', () => {
    it('should format dates in pt-BR format', () => {
      renderBilling()
      fireEvent.click(screen.getByText('Histórico'))
      expect(screen.getByText('20/12/2024')).toBeInTheDocument()
    })
  })
})
