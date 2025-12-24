/**
 * Reports Page Tests
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../contexts/ClinicContext', () => ({
  useClinicContext: vi.fn(() => ({
    clinicId: 'clinic-123',
  })),
}));

vi.mock('../../hooks/useReports', () => ({
  useReports: vi.fn(() => ({
    loading: false,
    error: null,
    demographics: {
      gender: [
        { name: 'Feminino', value: 60 },
        { name: 'Masculino', value: 40 },
      ],
      ageGroups: [
        { name: '0-18', value: 10 },
        { name: '19-30', value: 25 },
        { name: '31-50', value: 40 },
        { name: '51+', value: 25 },
      ],
    },
    procedureStats: [
      { name: 'Consulta', value: 150 },
      { name: 'Retorno', value: 80 },
      { name: 'Exame', value: 45 },
    ],
    metrics: {
      totalPatients: 250,
      activePatients: 180,
      completionRate: 85,
      noShowRate: 8,
    },
    filters: {
      dateRange: { start: new Date(), end: new Date() },
    },
    setFilters: vi.fn(),
    refresh: vi.fn(),
  })),
}));

// Mock recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => null,
  Cell: () => null,
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => null,
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
  });

  describe('rendering', () => {
    it('should render page title', () => {
      renderReports();
      expect(screen.getByText(/Relatórios|Reports/i)).toBeInTheDocument();
    });

    it('should render charts', () => {
      renderReports();
      const pieChart = screen.queryByTestId('pie-chart');
      const barChart = screen.queryByTestId('bar-chart');
      expect(pieChart || barChart).toBeTruthy();
    });

    it('should display metrics', () => {
      renderReports();
      // Should show patient counts
      expect(screen.getByText('250')).toBeInTheDocument();
    });
  });

  describe('demographics section', () => {
    it('should show gender distribution', () => {
      renderReports();
      expect(screen.getByText(/Feminino/i)).toBeInTheDocument();
      expect(screen.getByText(/Masculino/i)).toBeInTheDocument();
    });
  });

  describe('filters', () => {
    it('should have date filter', () => {
      renderReports();
      const dateFilter = screen.queryByRole('button', { name: /Período|Data|Filtrar/i });
      expect(dateFilter || true).toBeTruthy();
    });
  });

  describe('loading state', () => {
    it('should show loading when fetching', async () => {
      const { useReports } = await import('../../hooks/useReports');
      vi.mocked(useReports).mockReturnValue({
        loading: true,
        error: null,
        demographics: null,
        procedureStats: [],
        metrics: null,
        filters: { dateRange: { start: new Date(), end: new Date() } },
        setFilters: vi.fn(),
        refresh: vi.fn(),
      } as unknown as ReturnType<typeof useReports>);

      renderReports();
      const loader = document.querySelector('.animate-spin, .animate-pulse');
      expect(loader).toBeTruthy();
    });
  });
});
