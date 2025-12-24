/**
 * Dashboard Page Tests
 *
 * Smoke tests + basic functionality verification.
 * Mocks based on REAL hook interfaces from useDashboardMetrics.ts
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock hooks BEFORE imports
vi.mock('../../contexts/ClinicContext', () => ({
  useClinicContext: vi.fn(() => ({
    clinicId: 'clinic-123',
    userProfile: { displayName: 'Dr. Silva' },
  })),
}));

vi.mock('../../hooks/useAppointments', () => ({
  useAppointments: vi.fn(() => ({
    appointments: [
      {
        id: 'apt-1',
        patientName: 'Maria Santos',
        date: new Date().toISOString(),
        startTime: '09:00',
        endTime: '09:30',
        status: 'Confirmado',
      },
    ],
    loading: false,
    setFilters: vi.fn(),
  })),
}));

// Mock based on REAL DashboardMetrics interface
vi.mock('../../hooks/useDashboardMetrics', () => ({
  useDashboardMetrics: vi.fn(() => ({
    loading: false,
    todayAppointments: {
      value: 12,
      previousValue: 10,
      changePercent: 20,
      trend: 'up',
      comparisonText: 'vs ontem',
    },
    activePatients: {
      value: 150,
      previousValue: 140,
      changePercent: 7,
      trend: 'up',
      comparisonText: 'vs mês anterior',
    },
    revenue: {
      value: 45000,
      previousValue: 40000,
      changePercent: 12.5,
      trend: 'up',
      comparisonText: 'vs mês anterior',
      averageTicket: 350,
      completedCount: 8,
    },
    occupancy: {
      rate: 75,
      target: 85,
      bookedSlots: 15,
      totalSlots: 20,
      status: 'good',
    },
    breakdown: {
      confirmed: 8,
      pending: 3,
      cancelled: 1,
      total: 12,
    },
  })),
}));

import { Dashboard } from '../../pages/Dashboard';

const renderDashboard = () => {
  return render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  );
};

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('smoke tests', () => {
    it('should render without crashing', () => {
      const { container } = renderDashboard();
      expect(container).toBeDefined();
    });

    it('should have main content area', () => {
      const { container } = renderDashboard();
      expect(container.querySelector('.animate-enter')).toBeTruthy();
    });
  });

  describe('KPI cards', () => {
    it('should display today appointments value', () => {
      renderDashboard();
      expect(screen.getByText('12')).toBeInTheDocument();
    });

    it('should display active patients value', () => {
      renderDashboard();
      expect(screen.getByText('150')).toBeInTheDocument();
    });

    it('should display occupancy rate', () => {
      renderDashboard();
      expect(screen.getByText('75%')).toBeInTheDocument();
    });
  });

  describe('appointments section', () => {
    it('should display patient name', () => {
      renderDashboard();
      expect(screen.getByText('Maria Santos')).toBeInTheDocument();
    });
  });

  describe('loading state', () => {
    it('should show loader when loading', async () => {
      const { useDashboardMetrics } = await import('../../hooks/useDashboardMetrics');
      vi.mocked(useDashboardMetrics).mockReturnValue({
        loading: true,
        todayAppointments: { value: 0, previousValue: 0, changePercent: 0, trend: 'stable', comparisonText: '' },
        activePatients: { value: 0, previousValue: 0, changePercent: 0, trend: 'stable', comparisonText: '' },
        revenue: { value: 0, previousValue: 0, changePercent: 0, trend: 'stable', comparisonText: '', averageTicket: 0, completedCount: 0 },
        occupancy: { rate: 0, target: 85, bookedSlots: 0, totalSlots: 0, status: 'needs-attention' },
        breakdown: { confirmed: 0, pending: 0, cancelled: 0, total: 0 },
      });

      renderDashboard();
      expect(document.querySelector('.animate-spin')).toBeTruthy();
    });
  });
});
