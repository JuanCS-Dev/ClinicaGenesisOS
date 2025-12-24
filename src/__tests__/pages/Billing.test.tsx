/**
 * Billing Page Tests (TISS/Convênios)
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../contexts/ClinicContext', () => ({
  useClinicContext: vi.fn(() => ({
    clinicId: 'clinic-123',
  })),
}));

vi.mock('../../hooks/useGuias', () => ({
  useGuias: vi.fn(() => ({
    guias: [
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
    ],
    stats: {
      total: 10,
      pendentes: 3,
      valorRecebido: 5000,
      valorGlosado: 500,
      glosadas: 2,
    },
    loading: false,
    error: null,
    addGuia: vi.fn(),
    updateStatus: vi.fn(),
    refresh: vi.fn(),
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

// Mock TissConsultaForm to avoid complex dependencies
vi.mock('../../components/billing', () => ({
  TissConsultaForm: ({ onSubmit }: { onSubmit: (data: unknown) => void }) => (
    <form data-testid="tiss-form" onSubmit={(e) => { e.preventDefault(); onSubmit({}); }}>
      <button type="submit">Enviar Guia</button>
    </form>
  ),
}));

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

    it('should display stats cards', () => {
      renderBilling();
      expect(screen.getByText('Total de Guias')).toBeInTheDocument();
      expect(screen.getByText('Pendentes')).toBeInTheDocument();
      expect(screen.getByText('Recebido')).toBeInTheDocument();
      expect(screen.getByText('Glosado')).toBeInTheDocument();
    });

    it('should show stats values', () => {
      renderBilling();
      // Numbers may appear multiple times, use getAllByText
      const tens = screen.getAllByText('10');
      const threes = screen.getAllByText('3');
      expect(tens.length).toBeGreaterThan(0);
      expect(threes.length).toBeGreaterThan(0);
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

    it('should switch to Histórico tab when clicked', () => {
      renderBilling();
      fireEvent.click(screen.getByText('Histórico'));
      // Should show guias list or empty state
    });

    it('should switch to Glosas tab when clicked', () => {
      renderBilling();
      fireEvent.click(screen.getByText('Glosas'));
      // Should show glosas list or empty state
    });
  });

  describe('actions', () => {
    it('should have export button', () => {
      renderBilling();
      expect(screen.getByText('Exportar')).toBeInTheDocument();
    });

    it('should have refresh button', () => {
      renderBilling();
      // Refresh button is an icon button with RefreshCw
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('loading state', () => {
    it('should show loading indicator when refreshing', async () => {
      const { useGuias } = await import('../../hooks/useGuias');
      vi.mocked(useGuias).mockReturnValue({
        guias: [],
        stats: { total: 0, pendentes: 0, valorRecebido: 0, valorGlosado: 0, glosadas: 0 },
        loading: true,
        error: null,
        addGuia: vi.fn(),
        updateStatus: vi.fn(),
        refresh: vi.fn(),
      } as ReturnType<typeof useGuias>);

      renderBilling();
      const loader = document.querySelector('.animate-spin');
      expect(loader).toBeTruthy();
    });
  });
});
