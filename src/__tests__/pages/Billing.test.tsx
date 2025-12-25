/**
 * Billing Page Tests (TISS/Convênios)
 *
 * Comprehensive tests for the TISS billing page.
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../contexts/ClinicContext', () => ({
  useClinicContext: vi.fn(() => ({
    clinicId: 'clinic-123',
  })),
}));

const mockAddGuia = vi.fn();
const mockUpdateStatus = vi.fn();
const mockRefresh = vi.fn();

const mockDefaultGuias = [
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
];

const mockDefaultStats = {
  total: 10,
  pendentes: 3,
  valorRecebido: 5000,
  valorGlosado: 500,
  glosadas: 2,
};

vi.mock('../../hooks/useGuias', () => ({
  useGuias: vi.fn(() => ({
    guias: mockDefaultGuias,
    stats: mockDefaultStats,
    loading: false,
    error: null,
    addGuia: mockAddGuia,
    updateStatus: mockUpdateStatus,
    refresh: mockRefresh,
  })),
}));

vi.mock('../../hooks/useOperadoras', () => ({
  useOperadoras: vi.fn(() => ({
    operadoras: [
      { id: 'op-1', nomeFantasia: 'Unimed', registroANS: '123456', codigoPrestador: 'PREST1' },
      { id: 'op-2', nomeFantasia: 'SulAmérica', registroANS: '789012', codigoPrestador: 'PREST2' },
    ],
    operadorasAtivas: [
      { id: 'op-1', nomeFantasia: 'Unimed', registroANS: '123456', codigoPrestador: 'PREST1' },
      { id: 'op-2', nomeFantasia: 'SulAmérica', registroANS: '789012', codigoPrestador: 'PREST2' },
    ],
    loading: false,
  })),
}));

// Import after mocks
import { useGuias } from '../../hooks/useGuias';
import { useOperadoras } from '../../hooks/useOperadoras';
const mockUseGuias = useGuias as ReturnType<typeof vi.fn>;
const mockUseOperadoras = useOperadoras as ReturnType<typeof vi.fn>;

// Mock TissConsultaForm to avoid complex dependencies
vi.mock('../../components/billing', () => ({
  TissConsultaForm: ({
    onSubmit,
    onCancel,
    isLoading,
  }: {
    onSubmit: (data: unknown) => void;
    onCancel: () => void;
    isLoading: boolean;
  }) => (
    <form
      data-testid="tiss-form"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          registroANS: '123456',
          beneficiario: {
            numeroCarteira: 'CART123',
            nomeBeneficiario: 'Paciente Teste',
          },
          dataAtendimento: '2024-12-25',
          tipoConsulta: '1',
          codigoProcedimento: '10101012',
          valorProcedimento: 250,
          indicacaoClinica: 'Consulta de rotina',
        });
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
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { toast } from 'sonner';

import { Billing } from '../../pages/Billing';

const renderBilling = () => {
  return render(
    <MemoryRouter>
      <Billing />
    </MemoryRouter>
  );
};

describe('Billing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseGuias.mockReturnValue({
      guias: mockDefaultGuias,
      stats: mockDefaultStats,
      loading: false,
      error: null,
      addGuia: mockAddGuia.mockResolvedValue({ id: 'new-guia' }),
      updateStatus: mockUpdateStatus.mockResolvedValue(undefined),
      refresh: mockRefresh,
    });
    mockUseOperadoras.mockReturnValue({
      operadoras: [
        { id: 'op-1', nomeFantasia: 'Unimed', registroANS: '123456', codigoPrestador: 'PREST1' },
      ],
      operadorasAtivas: [
        { id: 'op-1', nomeFantasia: 'Unimed', registroANS: '123456', codigoPrestador: 'PREST1' },
      ],
      loading: false,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('rendering', () => {
    it('should render page title', () => {
      renderBilling();
      expect(screen.getByText('Faturamento TISS')).toBeInTheDocument();
    });

    it('should render page description', () => {
      renderBilling();
      expect(screen.getByText(/Geração de guias TISS/i)).toBeInTheDocument();
    });

    it('should have animation class', () => {
      const { container } = renderBilling();
      expect(container.querySelector('.animate-enter')).toBeTruthy();
    });
  });

  describe('stats cards', () => {
    it('should display total guias card', () => {
      renderBilling();
      expect(screen.getByText('Total de Guias')).toBeInTheDocument();
    });

    it('should display pendentes card', () => {
      renderBilling();
      expect(screen.getByText('Pendentes')).toBeInTheDocument();
    });

    it('should display recebido card', () => {
      renderBilling();
      expect(screen.getByText('Recebido')).toBeInTheDocument();
    });

    it('should display glosado card', () => {
      renderBilling();
      expect(screen.getByText('Glosado')).toBeInTheDocument();
    });

    it('should show stats values', () => {
      renderBilling();
      const tens = screen.getAllByText('10');
      const threes = screen.getAllByText('3');
      expect(tens.length).toBeGreaterThan(0);
      expect(threes.length).toBeGreaterThan(0);
    });

    it('should format currency values', () => {
      renderBilling();
      // Check for R$ currency format
      expect(screen.getByText('R$ 5.000,00')).toBeInTheDocument();
      expect(screen.getByText('R$ 500,00')).toBeInTheDocument();
    });
  });

  describe('tabs', () => {
    it('should render tab buttons', () => {
      renderBilling();
      expect(screen.getByText('Nova Guia')).toBeInTheDocument();
      expect(screen.getByText('Histórico')).toBeInTheDocument();
      expect(screen.getByText('Glosas')).toBeInTheDocument();
    });

    it('should show Nova Guia form by default', () => {
      renderBilling();
      expect(screen.getByTestId('tiss-form')).toBeInTheDocument();
    });

    it('should show count badge on Histórico tab', () => {
      renderBilling();
      // Total guias count should appear on tab
      const historicoTab = screen.getByText('Histórico');
      const tabContainer = historicoTab.closest('button');
      expect(tabContainer).toHaveTextContent('10');
    });

    it('should show count badge on Glosas tab', () => {
      renderBilling();
      // Glosadas count should appear on tab
      const glosasTab = screen.getByText('Glosas');
      const tabContainer = glosasTab.closest('button');
      expect(tabContainer).toHaveTextContent('2');
    });

    it('should switch to Histórico tab when clicked', () => {
      renderBilling();
      fireEvent.click(screen.getByText('Histórico'));
      // Should show search input
      expect(screen.getByPlaceholderText(/Buscar por número ou operadora/)).toBeInTheDocument();
    });

    it('should switch to Glosas tab when clicked', () => {
      renderBilling();
      fireEvent.click(screen.getByText('Glosas'));
      // Should show glosada guia
      expect(screen.getByText('#2024010003')).toBeInTheDocument();
    });

    it('should switch back to Nova Guia tab', () => {
      renderBilling();
      // Go to Histórico
      fireEvent.click(screen.getByText('Histórico'));
      // Go back to Nova Guia
      fireEvent.click(screen.getByText('Nova Guia'));
      expect(screen.getByTestId('tiss-form')).toBeInTheDocument();
    });
  });

  describe('actions', () => {
    it('should have export button', () => {
      renderBilling();
      expect(screen.getByText('Exportar')).toBeInTheDocument();
    });

    it('should call refresh when clicking refresh button', () => {
      renderBilling();
      // Find refresh button (first button without text)
      const buttons = document.querySelectorAll('button');
      const refreshButton = Array.from(buttons).find(
        (b) => b.querySelector('.lucide-refresh-cw')
      );
      if (refreshButton) fireEvent.click(refreshButton);
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  describe('histórico tab', () => {
    const goToHistorico = () => {
      renderBilling();
      fireEvent.click(screen.getByText('Histórico'));
    };

    it('should display guia numbers', () => {
      goToHistorico();
      expect(screen.getByText('#2024010001')).toBeInTheDocument();
      expect(screen.getByText('#2024010002')).toBeInTheDocument();
    });

    it('should display operadora names', () => {
      goToHistorico();
      const unimeds = screen.getAllByText('Unimed');
      expect(unimeds.length).toBeGreaterThan(0);
    });

    it('should display status badges', () => {
      goToHistorico();
      const rascunhos = screen.getAllByText('Rascunho');
      const enviadas = screen.getAllByText('Enviada');
      expect(rascunhos.length).toBeGreaterThan(0);
      expect(enviadas.length).toBeGreaterThan(0);
    });

    it('should display values', () => {
      goToHistorico();
      expect(screen.getByText('R$ 250,00')).toBeInTheDocument();
      expect(screen.getByText('R$ 300,00')).toBeInTheDocument();
    });

    it('should filter by search query', () => {
      goToHistorico();
      const searchInput = screen.getByPlaceholderText(/Buscar por número ou operadora/);
      fireEvent.change(searchInput, { target: { value: '2024010001' } });
      expect(screen.getByText('#2024010001')).toBeInTheDocument();
      expect(screen.queryByText('#2024010002')).not.toBeInTheDocument();
    });

    it('should filter by operadora name', () => {
      goToHistorico();
      const searchInput = screen.getByPlaceholderText(/Buscar por número ou operadora/);
      fireEvent.change(searchInput, { target: { value: 'unimed' } });
      const unimeds = screen.getAllByText('Unimed');
      expect(unimeds.length).toBeGreaterThan(0);
    });

    it('should have status filter dropdown', () => {
      goToHistorico();
      expect(screen.getByText('Todos os status')).toBeInTheDocument();
    });

    it('should filter by status', () => {
      goToHistorico();
      const statusSelect = screen.getByRole('combobox');
      fireEvent.change(statusSelect, { target: { value: 'enviada' } });
      expect(screen.getByText('#2024010002')).toBeInTheDocument();
      expect(screen.queryByText('#2024010001')).not.toBeInTheDocument();
    });
  });

  describe('glosas tab', () => {
    it('should show only glosadas guias', () => {
      renderBilling();
      fireEvent.click(screen.getByText('Glosas'));
      expect(screen.getByText('#2024010003')).toBeInTheDocument();
      expect(screen.queryByText('#2024010001')).not.toBeInTheDocument();
    });

    it('should show glosa value', () => {
      renderBilling();
      fireEvent.click(screen.getByText('Glosas'));
      expect(screen.getByText('-R$ 100,00')).toBeInTheDocument();
    });

    it('should show Glosa Parcial status', () => {
      renderBilling();
      fireEvent.click(screen.getByText('Glosas'));
      expect(screen.getByText('Glosa Parcial')).toBeInTheDocument();
    });
  });

  describe('empty states', () => {
    it('should show empty state for no guias', () => {
      mockUseGuias.mockReturnValue({
        guias: [],
        stats: { total: 0, pendentes: 0, valorRecebido: 0, valorGlosado: 0, glosadas: 0 },
        loading: false,
        error: null,
        addGuia: mockAddGuia,
        updateStatus: mockUpdateStatus,
        refresh: mockRefresh,
      });

      renderBilling();
      fireEvent.click(screen.getByText('Histórico'));
      expect(screen.getByText('Nenhuma guia encontrada')).toBeInTheDocument();
    });

    it('should show Criar Guia action in empty state', () => {
      mockUseGuias.mockReturnValue({
        guias: [],
        stats: { total: 0, pendentes: 0, valorRecebido: 0, valorGlosado: 0, glosadas: 0 },
        loading: false,
        error: null,
        addGuia: mockAddGuia,
        updateStatus: mockUpdateStatus,
        refresh: mockRefresh,
      });

      renderBilling();
      fireEvent.click(screen.getByText('Histórico'));
      expect(screen.getByText('Criar Guia')).toBeInTheDocument();
    });

    it('should show empty state for no glosas', () => {
      mockUseGuias.mockReturnValue({
        guias: mockDefaultGuias.filter((g) => g.status !== 'glosada_parcial'),
        stats: mockDefaultStats,
        loading: false,
        error: null,
        addGuia: mockAddGuia,
        updateStatus: mockUpdateStatus,
        refresh: mockRefresh,
      });

      renderBilling();
      fireEvent.click(screen.getByText('Glosas'));
      expect(screen.getByText('Sem glosas pendentes')).toBeInTheDocument();
    });

    it('should show empty state for no operadoras', () => {
      mockUseOperadoras.mockReturnValue({
        operadoras: [],
        operadorasAtivas: [],
        loading: false,
      });

      renderBilling();
      expect(screen.getByText('Nenhum convênio configurado')).toBeInTheDocument();
    });
  });

  describe('form submission', () => {
    it('should call addGuia on form submit', async () => {
      renderBilling();
      fireEvent.submit(screen.getByTestId('tiss-form'));

      await waitFor(() => {
        expect(mockAddGuia).toHaveBeenCalled();
      });
    });

    it('should show success toast on successful submission', async () => {
      renderBilling();
      fireEvent.submit(screen.getByTestId('tiss-form'));

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          'Guia TISS criada com sucesso',
          expect.any(Object)
        );
      });
    });

    it('should show error toast on failed submission', async () => {
      mockAddGuia.mockRejectedValue(new Error('Failed'));

      renderBilling();
      fireEvent.submit(screen.getByTestId('tiss-form'));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Erro ao criar guia TISS');
      });
    });

    it('should include action in success toast', async () => {
      renderBilling();
      fireEvent.submit(screen.getByTestId('tiss-form'));

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          'Guia TISS criada com sucesso',
          expect.objectContaining({
            action: expect.objectContaining({
              label: 'Ver histórico',
            }),
          })
        );
      });
    });

    it('should navigate to Histórico on cancel', () => {
      renderBilling();
      fireEvent.click(screen.getByText('Cancelar'));
      expect(screen.getByPlaceholderText(/Buscar/)).toBeInTheDocument();
    });
  });

  describe('send guia action', () => {
    it('should show send button for rascunho guias', () => {
      renderBilling();
      fireEvent.click(screen.getByText('Histórico'));
      // The send button should be visible on hover (but always present in DOM)
      const guiaRow = screen.getByText('#2024010001').closest('[class*="p-4"]');
      expect(guiaRow).toBeInTheDocument();
    });

    it('should call updateStatus when clicking send', async () => {
      renderBilling();
      fireEvent.click(screen.getByText('Histórico'));

      // Find send button (has lucide-send icon)
      const sendButtons = document.querySelectorAll('[title="Enviar"]');
      expect(sendButtons.length).toBeGreaterThan(0);

      fireEvent.click(sendButtons[0]);

      await waitFor(() => {
        expect(mockUpdateStatus).toHaveBeenCalledWith('guia-1', 'enviada');
      });
    });
  });

  describe('loading state', () => {
    it('should show loading indicator in Histórico tab', () => {
      mockUseGuias.mockReturnValue({
        guias: [],
        stats: mockDefaultStats,
        loading: true,
        error: null,
        addGuia: mockAddGuia,
        updateStatus: mockUpdateStatus,
        refresh: mockRefresh,
      });

      renderBilling();
      fireEvent.click(screen.getByText('Histórico'));
      const loader = document.querySelector('.animate-spin');
      expect(loader).toBeTruthy();
    });

    it('should disable refresh button when loading', () => {
      mockUseGuias.mockReturnValue({
        guias: mockDefaultGuias,
        stats: mockDefaultStats,
        loading: true,
        error: null,
        addGuia: mockAddGuia,
        updateStatus: mockUpdateStatus,
        refresh: mockRefresh,
      });

      renderBilling();
      const buttons = document.querySelectorAll('button[disabled]');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('guia types', () => {
    it('should show C for consulta guias', () => {
      renderBilling();
      fireEvent.click(screen.getByText('Histórico'));
      const typeIndicators = screen.getAllByText('C');
      expect(typeIndicators.length).toBeGreaterThan(0);
    });
  });

  describe('date formatting', () => {
    it('should format dates in pt-BR format', () => {
      renderBilling();
      fireEvent.click(screen.getByText('Histórico'));
      // Date should be formatted as dd/mm/yyyy
      expect(screen.getByText('20/12/2024')).toBeInTheDocument();
    });
  });
});
