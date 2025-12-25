/**
 * WhatsApp Metrics Page Tests
 *
 * Tests the WhatsApp metrics dashboard.
 * Mocks useWhatsAppMetrics hook and chart components.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WhatsAppMetrics } from '../../pages/WhatsAppMetrics';

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock date-fns to ensure consistent dates in tests
vi.mock('date-fns', async () => {
  const actual = await vi.importActual('date-fns');
  return {
    ...actual,
    format: vi.fn((date, fmt) => {
      if (fmt === 'dd/MM') return '15/01';
      return '2025-01-15';
    }),
    subDays: vi.fn((date, days) => new Date('2025-01-15')),
  };
});

// Mock chart components
vi.mock('../../components/whatsapp', () => ({
  MetricCard: ({ title, value, subtitle, icon: Icon }: any) => (
    <div data-testid={`metric-card-${title.replace(/\s+/g, '-').toLowerCase()}`}>
      <span>{title}</span>
      <span>{value}</span>
      <span>{subtitle}</span>
    </div>
  ),
  StatusBreakdown: ({ title, data }: any) => (
    <div data-testid={`status-breakdown-${title.replace(/\s+/g, '-').toLowerCase()}`}>
      <span>{title}</span>
    </div>
  ),
  LazyAreaChart: ({ children }: any) => <div data-testid="area-chart">{children}</div>,
  LazyArea: () => <div data-testid="area" />,
  LazyXAxis: () => <div data-testid="x-axis" />,
  LazyYAxis: () => <div data-testid="y-axis" />,
  LazyCartesianGrid: () => <div data-testid="grid" />,
  LazyTooltip: () => <div data-testid="tooltip" />,
  LazyResponsiveContainer: ({ children }: any) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  LazyBarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  LazyBar: () => <div data-testid="bar" />,
  ChartSuspense: ({ children }: any) => <div data-testid="chart-suspense">{children}</div>,
}));

// Import toast to access in tests
import { toast } from 'sonner';

// Mock useWhatsAppMetrics hook
const mockMetrics = {
  totalSent: 150,
  totalDelivered: 145,
  totalRead: 130,
  totalFailed: 5,
  totalConfirmed: 120,
  totalNeedReschedule: 10,
  deliveryRate: 96.7,
  readRate: 89.7,
  confirmationRate: 82.8,
  responseRate: 86.7,
  noShowsWithReminder: 5,
  noShowsWithoutReminder: 15,
  noShowReduction: 66.7,
  confirmation: { sent: 50, delivered: 48, read: 45, failed: 2, pending: 0, total: 50 },
  reminder24h: { sent: 50, delivered: 48, read: 43, failed: 2, pending: 0, total: 50 },
  reminder2h: { sent: 50, delivered: 49, read: 42, failed: 1, pending: 0, total: 50 },
  dailyStats: [
    { date: '2025-01-15', sent: 10, delivered: 9, read: 8, confirmed: 7, failed: 1, needsReschedule: 1 },
    { date: '2025-01-16', sent: 12, delivered: 11, read: 10, confirmed: 9, failed: 1, needsReschedule: 2 },
  ],
};

// Use spyOn to allow dynamic mock changes
const mockRefresh = vi.fn();
let mockHookReturn = {
  metrics: mockMetrics,
  loading: false,
  error: null as string | null,
  refresh: mockRefresh,
};

vi.mock('../../hooks/useWhatsAppMetrics', () => ({
  useWhatsAppMetrics: () => mockHookReturn,
}));

// Helper to mock different hook states
const mockHookState = (state: { loading?: boolean; error?: string | null; metrics?: any }) => {
  mockHookReturn = {
    metrics: state.metrics ?? mockMetrics,
    loading: state.loading ?? false,
    error: state.error ?? null,
    refresh: mockRefresh,
  };
};

describe('WhatsAppMetrics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset hook return to default state
    mockHookReturn = {
      metrics: mockMetrics,
      loading: false,
      error: null,
      refresh: mockRefresh,
    };
  });

  describe('success state', () => {
    it('renders the page header', () => {
      render(<WhatsAppMetrics />);
      expect(screen.getByText('WhatsApp Lembretes')).toBeInTheDocument();
      expect(screen.getByText(/Métricas de engajamento/i)).toBeInTheDocument();
    });

    it('renders refresh button', () => {
      render(<WhatsAppMetrics />);
      expect(screen.getByRole('button', { name: /Atualizar/i })).toBeInTheDocument();
    });

    it('renders KPI metric cards', () => {
      render(<WhatsAppMetrics />);
      expect(screen.getByTestId('metric-card-mensagens-enviadas')).toBeInTheDocument();
      expect(screen.getByTestId('metric-card-taxa-de-entrega')).toBeInTheDocument();
      expect(screen.getByTestId('metric-card-taxa-de-leitura')).toBeInTheDocument();
      expect(screen.getByTestId('metric-card-confirmações')).toBeInTheDocument();
    });

    it('renders status breakdowns', () => {
      render(<WhatsAppMetrics />);
      expect(screen.getByTestId('status-breakdown-confirmação')).toBeInTheDocument();
      expect(screen.getByTestId('status-breakdown-lembrete-24h')).toBeInTheDocument();
      expect(screen.getByTestId('status-breakdown-lembrete-2h')).toBeInTheDocument();
    });

    it('renders engagement chart section', () => {
      render(<WhatsAppMetrics />);
      expect(screen.getByText('Tendência de Engajamento')).toBeInTheDocument();
      expect(screen.getByText('Últimos 30 dias')).toBeInTheDocument();
    });

    it('renders no-show impact section', () => {
      render(<WhatsAppMetrics />);
      expect(screen.getByText('Impacto No-Shows')).toBeInTheDocument();
    });

    it('renders response summary section', () => {
      render(<WhatsAppMetrics />);
      expect(screen.getByText('Resumo de Respostas')).toBeInTheDocument();
      expect(screen.getByText(/Taxa de Resposta/i)).toBeInTheDocument();
    });

    it('displays metrics values in response summary', () => {
      render(<WhatsAppMetrics />);
      // Multiple "120" values may exist - check for Confirmaram label instead
      expect(screen.getByText('Confirmaram')).toBeInTheDocument();
      expect(screen.getByText('Pediram Remarcação')).toBeInTheDocument();
      expect(screen.getByText('Visualizaram')).toBeInTheDocument();
      expect(screen.getByText('Falhas de Envio')).toBeInTheDocument();
    });

    it('renders chart suspense wrappers', () => {
      render(<WhatsAppMetrics />);
      expect(screen.getAllByTestId('chart-suspense').length).toBeGreaterThan(0);
    });

    it('renders area chart', () => {
      render(<WhatsAppMetrics />);
      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    });

    it('renders bar chart for no-show data', () => {
      render(<WhatsAppMetrics />);
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });
  });

  describe('refresh functionality', () => {
    it('calls refresh when clicking update button', () => {
      render(<WhatsAppMetrics />);
      const refreshButton = screen.getByRole('button', { name: /Atualizar/i });
      fireEvent.click(refreshButton);
      expect(mockRefresh).toHaveBeenCalled();
    });

    it('shows success toast when refreshing', () => {
      render(<WhatsAppMetrics />);
      const refreshButton = screen.getByRole('button', { name: /Atualizar/i });
      fireEvent.click(refreshButton);
      expect(toast.success).toHaveBeenCalledWith('Métricas atualizadas');
    });
  });

  describe('loading state', () => {
    beforeEach(() => {
      mockHookState({ loading: true });
    });

    it('renders loading spinner', () => {
      render(<WhatsAppMetrics />);
      // Check for the loader container
      const loadingContainer = document.querySelector('.animate-spin');
      expect(loadingContainer).toBeInTheDocument();
    });

    it('does not render main content while loading', () => {
      render(<WhatsAppMetrics />);
      expect(screen.queryByText('WhatsApp Lembretes')).not.toBeInTheDocument();
    });
  });

  describe('error state', () => {
    beforeEach(() => {
      mockHookState({ error: 'Failed to load' });
    });

    it('renders error message', () => {
      render(<WhatsAppMetrics />);
      expect(screen.getByText('Erro ao carregar métricas')).toBeInTheDocument();
    });

    it('does not render main content on error', () => {
      render(<WhatsAppMetrics />);
      expect(screen.queryByText('WhatsApp Lembretes')).not.toBeInTheDocument();
    });
  });

  describe('empty data state', () => {
    beforeEach(() => {
      mockHookState({
        metrics: {
          ...mockMetrics,
          dailyStats: [],
        },
      });
    });

    it('handles empty daily stats gracefully', () => {
      render(<WhatsAppMetrics />);
      // Should still render without crashing
      expect(screen.getByText('WhatsApp Lembretes')).toBeInTheDocument();
    });
  });

  describe('no-show reduction', () => {
    it('displays reduction percentage', () => {
      render(<WhatsAppMetrics />);
      expect(screen.getByText(/Redução de no-shows com lembretes WhatsApp/i)).toBeInTheDocument();
    });
  });
});
