/**
 * useFinancialWellness Hook Tests - Advanced financial metrics.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useFinancialWellness } from '../../hooks/useFinancialWellness';
import type { Transaction, FinancialSummary, MonthlyFinancialData } from '../../types';

// Mock dependencies
vi.mock('../../contexts/ClinicContext', () => ({
  useClinicContext: vi.fn(() => ({
    clinicId: 'clinic-123',
  })),
}));

const mockTransactions: Transaction[] = [
  {
    id: 'txn-1',
    clinicId: 'clinic-123',
    type: 'income',
    amount: 35000,
    description: 'Consulta',
    date: new Date().toISOString(),
    categoryId: 'consulta',
    paymentMethod: 'pix',
    status: 'paid',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'user-123',
  },
  {
    id: 'txn-2',
    clinicId: 'clinic-123',
    type: 'income',
    amount: 50000,
    description: 'Procedimento',
    date: new Date().toISOString(),
    categoryId: 'procedimento',
    paymentMethod: 'cartao',
    status: 'paid',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'user-123',
  },
  {
    id: 'txn-3',
    clinicId: 'clinic-123',
    type: 'income',
    amount: 20000,
    description: 'Consulta atrasada',
    date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days ago
    dueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days overdue
    categoryId: 'consulta',
    paymentMethod: 'boleto',
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'user-123',
  },
];

const mockSummary: FinancialSummary = {
  totalIncome: 105000,
  totalExpenses: 30000,
  netBalance: 75000,
  transactionCount: 3,
  pendingCount: 1,
  pendingAmount: 20000,
};

const mockMonthlyData: MonthlyFinancialData[] = [
  { month: 'Out', income: 80000, expenses: 25000 },
  { month: 'Nov', income: 90000, expenses: 28000 },
  { month: 'Dez', income: 105000, expenses: 30000 },
];

vi.mock('../../hooks/useFinance', () => ({
  useFinance: vi.fn(() => ({
    transactions: mockTransactions,
    summary: mockSummary,
    monthlyData: mockMonthlyData,
    loading: false,
  })),
}));

vi.mock('../../hooks/useAppointments', () => ({
  useAppointments: vi.fn(() => ({
    appointments: [],
    loading: false,
  })),
}));

describe('useFinancialWellness', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loading state', () => {
    it('should reflect finance loading state', async () => {
      const { result } = renderHook(() => useFinancialWellness());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe('procedureMetrics', () => {
    it('should calculate procedure metrics from transactions', async () => {
      const { result } = renderHook(() => useFinancialWellness());

      await waitFor(() => {
        expect(result.current.procedureMetrics.length).toBeGreaterThan(0);
      });

      // Should be sorted by revenue (procedimento first with 50000)
      const topProcedure = result.current.procedureMetrics[0];
      expect(topProcedure.procedureType).toBe('procedimento');
      expect(topProcedure.totalRevenue).toBe(50000);
      expect(topProcedure.count).toBe(1);
      expect(topProcedure.averageTicket).toBe(50000);
    });

    it('should calculate average ticket correctly', async () => {
      const { result } = renderHook(() => useFinancialWellness());

      await waitFor(() => {
        expect(result.current.procedureMetrics.length).toBeGreaterThan(0);
      });

      // Consulta has 1 paid transaction of 35000
      const consulta = result.current.procedureMetrics.find(
        (p) => p.procedureType === 'consulta'
      );
      expect(consulta?.averageTicket).toBe(35000);
    });
  });

  describe('delinquency', () => {
    it('should calculate overdue transactions', async () => {
      const { result } = renderHook(() => useFinancialWellness());

      await waitFor(() => {
        expect(result.current.delinquency).toBeDefined();
      });

      expect(result.current.delinquency.overdueCount).toBe(1);
      expect(result.current.delinquency.totalOverdue).toBe(20000);
    });

    it('should calculate overdue percentage', async () => {
      const { result } = renderHook(() => useFinancialWellness());

      await waitFor(() => {
        expect(result.current.delinquency).toBeDefined();
      });

      // 20000 / 105000 * 100 = ~19%
      expect(result.current.delinquency.overduePercentage).toBeGreaterThan(0);
    });

    it('should group by age range', async () => {
      const { result } = renderHook(() => useFinancialWellness());

      await waitFor(() => {
        expect(result.current.delinquency.byAgeRange.length).toBe(4);
      });

      // Check age ranges exist
      const ranges = result.current.delinquency.byAgeRange.map((r) => r.range);
      expect(ranges).toContain('1-30 dias');
      expect(ranges).toContain('31-60 dias');
      expect(ranges).toContain('61-90 dias');
      expect(ranges).toContain('90+ dias');
    });
  });

  describe('projection', () => {
    it('should calculate revenue projections', async () => {
      const { result } = renderHook(() => useFinancialWellness());

      await waitFor(() => {
        expect(result.current.projection).toBeDefined();
      });

      expect(result.current.projection.currentMonth).toBe(105000);
      expect(result.current.projection.projectedMonth).toBeGreaterThan(0);
      expect(result.current.projection.projectedQuarter).toBeGreaterThan(0);
      expect(result.current.projection.projectedYear).toBeGreaterThan(0);
    });

    it('should calculate growth rate', async () => {
      const { result } = renderHook(() => useFinancialWellness());

      await waitFor(() => {
        expect(result.current.projection.growthRate).toBeDefined();
      });

      // Growth from 80000 -> 90000 -> 105000 should show positive growth
      expect(result.current.projection.growthRate).toBeGreaterThanOrEqual(0);
    });

    it('should have confidence level based on data points', async () => {
      const { result } = renderHook(() => useFinancialWellness());

      await waitFor(() => {
        expect(result.current.projection.confidence).toBeDefined();
      });

      // With 3 months of data, should be low confidence
      expect(['low', 'medium', 'high']).toContain(
        result.current.projection.confidence
      );
    });
  });

  describe('yoyComparison', () => {
    it('should calculate year over year comparison', async () => {
      const { result } = renderHook(() => useFinancialWellness());

      await waitFor(() => {
        expect(result.current.yoyComparison).toBeDefined();
      });

      expect(result.current.yoyComparison.currentYear).toBeGreaterThan(0);
      expect(result.current.yoyComparison.previousYear).toBeGreaterThan(0);
      expect(result.current.yoyComparison.percentageChange).toBeDefined();
    });

    it('should determine trend direction', async () => {
      const { result } = renderHook(() => useFinancialWellness());

      await waitFor(() => {
        expect(result.current.yoyComparison.trend).toBeDefined();
      });

      expect(['up', 'down', 'stable']).toContain(
        result.current.yoyComparison.trend
      );
    });

    it('should have monthly breakdown', async () => {
      const { result } = renderHook(() => useFinancialWellness());

      await waitFor(() => {
        expect(result.current.yoyComparison.byMonth.length).toBe(3);
      });
    });
  });

  describe('healthScore', () => {
    it('should calculate overall health score', async () => {
      const { result } = renderHook(() => useFinancialWellness());

      await waitFor(() => {
        expect(result.current.healthScore.overall).toBeDefined();
      });

      expect(result.current.healthScore.overall).toBeGreaterThanOrEqual(0);
      expect(result.current.healthScore.overall).toBeLessThanOrEqual(100);
    });

    it('should have component scores', async () => {
      const { result } = renderHook(() => useFinancialWellness());

      await waitFor(() => {
        expect(result.current.healthScore.components).toBeDefined();
      });

      const { components } = result.current.healthScore;
      expect(components.cashFlow).toBeDefined();
      expect(components.profitability).toBeDefined();
      expect(components.collections).toBeDefined();
      expect(components.growth).toBeDefined();
    });

    it('should determine status based on score', async () => {
      const { result } = renderHook(() => useFinancialWellness());

      await waitFor(() => {
        expect(result.current.healthScore.status).toBeDefined();
      });

      expect(['excellent', 'good', 'attention', 'critical']).toContain(
        result.current.healthScore.status
      );
    });

    it('should generate recommendations', async () => {
      const { result } = renderHook(() => useFinancialWellness());

      await waitFor(() => {
        expect(result.current.healthScore.recommendations).toBeDefined();
      });

      expect(Array.isArray(result.current.healthScore.recommendations)).toBe(
        true
      );
    });
  });
});
