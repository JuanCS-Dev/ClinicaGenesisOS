/**
 * Reports Page Tests
 *
 * Comprehensive tests for the reports dashboard.
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { toast } from 'sonner';

// Mock export service
vi.mock('../../services/export.service', () => ({
  exportReportToPDF: vi.fn().mockResolvedValue(undefined),
}));

import { exportReportToPDF } from '../../services/export.service';

vi.mock('../../contexts/ClinicContext', () => ({
  useClinicContext: vi.fn(() => ({
    clinicId: 'clinic-123',
  })),
}));

const mockSetFilters = vi.fn();
const mockRefresh = vi.fn();

const mockDefaultMetrics = {
  totalPatients: 250,
  activePatients: 180,
  appointmentsCount: 120,
  completionRate: 85,
  noShowRate: 8,
};

const mockDefaultDemographics = {
  gender: [
    { name: 'Feminino', value: 60, color: '#EC4899' },
    { name: 'Masculino', value: 40, color: '#3B82F6' },
  ],
  ageGroups: [
    { name: '0-18', value: 10 },
    { name: '19-30', value: 25 },
    { name: '31-50', value: 40 },
    { name: '51+', value: 25 },
  ],
};

const mockDefaultProcedureStats = [
  { name: 'Consulta', value: 150 },
  { name: 'Retorno', value: 80 },
  { name: 'Exame', value: 45 },
];

vi.mock('../../hooks/useReports', () => ({
  useReports: vi.fn(() => ({
    loading: false,
    error: null,
    demographics: mockDefaultDemographics,
    procedureStats: mockDefaultProcedureStats,
    metrics: mockDefaultMetrics,
    filters: {
      dateRange: { start: new Date(), end: new Date() },
      specialty: undefined,
      professional: undefined,
    },
    setFilters: mockSetFilters,
    refresh: mockRefresh,
  })),
}));

// Get the mock function
import { useReports } from '../../hooks/useReports';
const mockUseReports = useReports as ReturnType<typeof vi.fn>;

// Mock recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Pie: () => <div data-testid="pie" />,
  Cell: () => null,
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Bar: () => <div data-testid="bar" />,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
}));

import Reports from '../../pages/Reports';

const renderReports = () => {
  return render(
    <MemoryRouter>
      <Reports />
    </MemoryRouter>
  );
};

describe('Reports', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset to default mock
    mockUseReports.mockReturnValue({
      loading: false,
      error: null,
      demographics: mockDefaultDemographics,
      procedureStats: mockDefaultProcedureStats,
      metrics: mockDefaultMetrics,
      filters: {
        dateRange: { start: new Date(), end: new Date() },
        specialty: undefined,
        professional: undefined,
      },
      setFilters: mockSetFilters,
      refresh: mockRefresh,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('rendering', () => {
    it('should render page title', () => {
      renderReports();
      expect(screen.getByText('Relatórios Clínicos')).toBeInTheDocument();
    });

    it('should render subtitle', () => {
      renderReports();
      expect(
        screen.getByText('Análise demográfica e desempenho de procedimentos')
      ).toBeInTheDocument();
    });

    it('should render charts', () => {
      renderReports();
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });
  });

  describe('KPI cards', () => {
    it('should display total patients', () => {
      renderReports();
      expect(screen.getByText('250')).toBeInTheDocument();
      expect(screen.getByText('Total de Pacientes')).toBeInTheDocument();
    });

    it('should display active patients', () => {
      renderReports();
      expect(screen.getByText('180')).toBeInTheDocument();
      expect(screen.getByText('Pacientes Ativos')).toBeInTheDocument();
    });

    it('should display appointments count', () => {
      renderReports();
      expect(screen.getByText('120')).toBeInTheDocument();
      expect(screen.getByText('Agendamentos')).toBeInTheDocument();
    });

    it('should display completion rate', () => {
      renderReports();
      expect(screen.getByText('85%')).toBeInTheDocument();
      expect(screen.getByText('Taxa de Conclusão')).toBeInTheDocument();
    });

    it('should show footers for KPI cards', () => {
      renderReports();
      expect(screen.getByText('Base cadastrada')).toBeInTheDocument();
      expect(screen.getByText('Últimos 6 meses')).toBeInTheDocument();
      expect(screen.getByText('Período selecionado')).toBeInTheDocument();
      expect(screen.getByText('Consultas finalizadas')).toBeInTheDocument();
    });
  });

  describe('demographics section', () => {
    it('should show gender distribution', () => {
      renderReports();
      expect(screen.getByText(/Feminino/i)).toBeInTheDocument();
      expect(screen.getByText(/Masculino/i)).toBeInTheDocument();
    });

    it('should show gender percentages', () => {
      renderReports();
      expect(screen.getByText(/60%/)).toBeInTheDocument();
      expect(screen.getByText(/40%/)).toBeInTheDocument();
    });

    it('should show age groups', () => {
      renderReports();
      expect(screen.getByText('Faixa Etária Predominante')).toBeInTheDocument();
      expect(screen.getByText('0-18')).toBeInTheDocument();
      expect(screen.getByText('19-30')).toBeInTheDocument();
      expect(screen.getByText('31-50')).toBeInTheDocument();
      expect(screen.getByText('51+')).toBeInTheDocument();
    });
  });

  describe('procedures section', () => {
    it('should show procedures title', () => {
      renderReports();
      expect(screen.getByText('Procedimentos Populares')).toBeInTheDocument();
    });

    it('should render bar chart', () => {
      renderReports();
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });
  });

  describe('filters', () => {
    it('should render specialty filter', () => {
      renderReports();
      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
    });

    it('should have specialty options', () => {
      renderReports();
      expect(screen.getByText('Todas Especialidades')).toBeInTheDocument();
    });

    it('should call setFilters on specialty change', () => {
      renderReports();
      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: 'medicina' } });
      expect(mockSetFilters).toHaveBeenCalled();
    });

    it('should render date filter button', () => {
      renderReports();
      expect(screen.getByText('Este Mês')).toBeInTheDocument();
    });
  });

  describe('export functionality', () => {
    it('should render export button', () => {
      renderReports();
      expect(screen.getByRole('button', { name: /Exportar PDF/i })).toBeInTheDocument();
    });

    it('should call exportReportToPDF on click', async () => {
      renderReports();
      const exportButton = screen.getByRole('button', { name: /Exportar PDF/i });
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(exportReportToPDF).toHaveBeenCalled();
      });
    });

    it('should disable button during export', async () => {
      // Make export take some time
      vi.mocked(exportReportToPDF).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      renderReports();
      const exportButton = screen.getByRole('button', { name: /Exportar PDF/i });
      fireEvent.click(exportButton);

      // Button should be disabled during export
      await waitFor(() => {
        expect(exportButton).toBeDisabled();
      });
    });
  });

  describe('share functionality', () => {
    it('should render share button', () => {
      renderReports();
      const shareButton = screen.getByTitle('Compartilhar relatório');
      expect(shareButton).toBeInTheDocument();
    });

    it('should copy to clipboard when Web Share not available', async () => {
      // Mock clipboard
      const mockWriteText = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: { writeText: mockWriteText },
        share: undefined,
        canShare: undefined,
      });

      renderReports();
      const shareButton = screen.getByTitle('Compartilhar relatório');
      fireEvent.click(shareButton);

      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalledWith('Link copiado para a área de transferência');
      });
    });

    it('should use Web Share API when available', async () => {
      const mockShare = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        share: mockShare,
        canShare: () => true,
      });

      renderReports();
      const shareButton = screen.getByTitle('Compartilhar relatório');
      fireEvent.click(shareButton);

      await waitFor(() => {
        expect(mockShare).toHaveBeenCalled();
      });
    });

    it('should handle share error gracefully', async () => {
      const mockShare = vi.fn().mockRejectedValue(new Error('Share failed'));
      Object.assign(navigator, {
        share: mockShare,
        canShare: () => true,
      });

      renderReports();
      const shareButton = screen.getByTitle('Compartilhar relatório');
      fireEvent.click(shareButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Erro ao compartilhar');
      });
    });

    it('should not show error for abort', async () => {
      const abortError = new Error('User aborted');
      abortError.name = 'AbortError';
      const mockShare = vi.fn().mockRejectedValue(abortError);
      Object.assign(navigator, {
        share: mockShare,
        canShare: () => true,
      });

      renderReports();
      const shareButton = screen.getByTitle('Compartilhar relatório');
      fireEvent.click(shareButton);

      await waitFor(() => {
        expect(toast.error).not.toHaveBeenCalled();
      });
    });

    it('should handle clipboard error', async () => {
      const mockWriteText = vi.fn().mockRejectedValue(new Error('Clipboard failed'));
      Object.assign(navigator, {
        clipboard: { writeText: mockWriteText },
        share: undefined,
        canShare: undefined,
      });

      renderReports();
      const shareButton = screen.getByTitle('Compartilhar relatório');
      fireEvent.click(shareButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Erro ao copiar link');
      });
    });
  });

  describe('loading state', () => {
    beforeEach(() => {
      mockUseReports.mockReturnValue({
        loading: true,
        error: null,
        demographics: null,
        procedureStats: [],
        metrics: null,
        filters: { dateRange: { start: new Date(), end: new Date() } },
        setFilters: mockSetFilters,
        refresh: mockRefresh,
      });
    });

    it('should show loading spinners in KPI cards', () => {
      renderReports();
      const spinners = document.querySelectorAll('.animate-spin');
      expect(spinners.length).toBeGreaterThan(0);
    });

    it('should show loading in procedures chart', () => {
      renderReports();
      // No bar chart content when loading
      expect(screen.queryByTestId('bar')).not.toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    beforeEach(() => {
      mockUseReports.mockReturnValue({
        loading: false,
        error: null,
        demographics: { gender: [], ageGroups: [] },
        procedureStats: [],
        metrics: { totalPatients: 0, activePatients: 0, appointmentsCount: 0, completionRate: 0 },
        filters: { dateRange: { start: new Date(), end: new Date() } },
        setFilters: mockSetFilters,
        refresh: mockRefresh,
      });
    });

    it('should show empty state for procedures', () => {
      renderReports();
      expect(screen.getByText('Nenhum procedimento registrado')).toBeInTheDocument();
    });

    it('should show "Sem dados" for empty gender', () => {
      renderReports();
      expect(screen.getByText('Sem dados')).toBeInTheDocument();
    });

    it('should show empty state for age groups', () => {
      renderReports();
      expect(screen.getByText('Sem dados de idade')).toBeInTheDocument();
    });

    it('should show 0 for metrics', () => {
      renderReports();
      const zeros = screen.getAllByText('0');
      expect(zeros.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('null metrics handling', () => {
    beforeEach(() => {
      mockUseReports.mockReturnValue({
        loading: false,
        error: null,
        demographics: mockDefaultDemographics,
        procedureStats: mockDefaultProcedureStats,
        metrics: null,
        filters: { dateRange: { start: new Date(), end: new Date() } },
        setFilters: mockSetFilters,
        refresh: mockRefresh,
      });
    });

    it('should handle null metrics gracefully', () => {
      renderReports();
      // Should show 0 when metrics is null
      const zeros = screen.getAllByText('0');
      expect(zeros.length).toBeGreaterThan(0);
    });
  });
});
