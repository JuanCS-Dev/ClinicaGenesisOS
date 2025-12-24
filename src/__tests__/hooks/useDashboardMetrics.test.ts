/**
 * useDashboardMetrics Hook Tests - Dashboard KPI calculations.
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useDashboardMetrics } from '../../hooks/useDashboardMetrics';
import { Status } from '../../types';
import type { Appointment, Patient } from '../../types';

// Mock dependencies
vi.mock('../../hooks/useAppointments', () => ({
  useAppointments: vi.fn(() => ({
    appointments: [],
    loading: false,
  })),
}));

vi.mock('../../hooks/usePatients', () => ({
  usePatients: vi.fn(() => ({
    patients: [],
    loading: false,
  })),
}));

import { useAppointments } from '../../hooks/useAppointments';
import { usePatients } from '../../hooks/usePatients';

const createMockAppointment = (overrides: Partial<Appointment> = {}): Appointment => ({
  id: `apt-${Math.random().toString(36).substr(2, 9)}`,
  clinicId: 'clinic-123',
  patientId: 'patient-123',
  patientName: 'João Silva',
  date: new Date().toISOString(),
  startTime: '09:00',
  endTime: '09:30',
  durationMin: 30,
  status: Status.CONFIRMED,
  specialty: 'Clínico Geral',
  procedure: 'Consulta',
  professional: 'Dr. Silva',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  createdBy: 'user-123',
  ...overrides,
});

const createMockPatient = (overrides: Partial<Patient> = {}): Patient => ({
  id: `patient-${Math.random().toString(36).substr(2, 9)}`,
  clinicId: 'clinic-123',
  name: 'Maria Santos',
  email: 'maria@email.com',
  phone: '11999999999',
  cpf: '12345678901',
  birthDate: '1990-01-15',
  gender: 'feminino',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

describe('useDashboardMetrics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    // Set to a Wednesday (work day)
    vi.setSystemTime(new Date('2025-01-15T10:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('loading state', () => {
    it('should reflect loading from appointments and patients', () => {
      vi.mocked(useAppointments).mockReturnValue({
        appointments: [],
        loading: true,
      } as ReturnType<typeof useAppointments>);

      vi.mocked(usePatients).mockReturnValue({
        patients: [],
        loading: false,
      } as ReturnType<typeof usePatients>);

      const { result } = renderHook(() => useDashboardMetrics());

      expect(result.current.loading).toBe(true);
    });

    it('should be false when both are loaded', () => {
      vi.mocked(useAppointments).mockReturnValue({
        appointments: [],
        loading: false,
      } as ReturnType<typeof useAppointments>);

      vi.mocked(usePatients).mockReturnValue({
        patients: [],
        loading: false,
      } as ReturnType<typeof usePatients>);

      const { result } = renderHook(() => useDashboardMetrics());

      expect(result.current.loading).toBe(false);
    });
  });

  describe('todayAppointments', () => {
    it('should count today appointments', () => {
      const today = new Date('2025-01-15T09:00:00').toISOString();
      const appointments = [
        createMockAppointment({ date: today }),
        createMockAppointment({ date: today }),
        createMockAppointment({ date: today }),
      ];

      vi.mocked(useAppointments).mockReturnValue({
        appointments,
        loading: false,
      } as ReturnType<typeof useAppointments>);

      vi.mocked(usePatients).mockReturnValue({
        patients: [],
        loading: false,
      } as ReturnType<typeof usePatients>);

      const { result } = renderHook(() => useDashboardMetrics());

      expect(result.current.todayAppointments.value).toBe(3);
    });

    it('should compare with yesterday', () => {
      const today = new Date('2025-01-15T09:00:00').toISOString();
      const yesterday = new Date('2025-01-14T09:00:00').toISOString();

      const appointments = [
        createMockAppointment({ date: today }),
        createMockAppointment({ date: today }),
        createMockAppointment({ date: yesterday }),
      ];

      vi.mocked(useAppointments).mockReturnValue({
        appointments,
        loading: false,
      } as ReturnType<typeof useAppointments>);

      vi.mocked(usePatients).mockReturnValue({
        patients: [],
        loading: false,
      } as ReturnType<typeof usePatients>);

      const { result } = renderHook(() => useDashboardMetrics());

      expect(result.current.todayAppointments.value).toBe(2);
      expect(result.current.todayAppointments.previousValue).toBe(1);
      expect(result.current.todayAppointments.changePercent).toBe(100);
      expect(result.current.todayAppointments.trend).toBe('up');
    });
  });

  describe('activePatients', () => {
    it('should count total patients', () => {
      const patients = [
        createMockPatient(),
        createMockPatient(),
        createMockPatient(),
      ];

      vi.mocked(useAppointments).mockReturnValue({
        appointments: [],
        loading: false,
      } as ReturnType<typeof useAppointments>);

      vi.mocked(usePatients).mockReturnValue({
        patients,
        loading: false,
      } as ReturnType<typeof usePatients>);

      const { result } = renderHook(() => useDashboardMetrics());

      expect(result.current.activePatients.value).toBe(3);
    });
  });

  describe('revenue', () => {
    it('should calculate revenue from completed appointments', () => {
      const thisMonth = new Date('2025-01-10T09:00:00').toISOString();

      const appointments = [
        createMockAppointment({ date: thisMonth, status: Status.FINISHED }),
        createMockAppointment({ date: thisMonth, status: Status.FINISHED }),
        createMockAppointment({ date: thisMonth, status: Status.CONFIRMED }),
      ];

      vi.mocked(useAppointments).mockReturnValue({
        appointments,
        loading: false,
      } as ReturnType<typeof useAppointments>);

      vi.mocked(usePatients).mockReturnValue({
        patients: [],
        loading: false,
      } as ReturnType<typeof usePatients>);

      const { result } = renderHook(() => useDashboardMetrics());

      // 2 completed * 350 average ticket = 700
      expect(result.current.revenue.value).toBe(700);
      expect(result.current.revenue.completedCount).toBe(2);
    });

    it('should compare with last month', () => {
      const thisMonth = new Date('2025-01-10T09:00:00').toISOString();
      const lastMonth = new Date('2024-12-15T09:00:00').toISOString();

      const appointments = [
        createMockAppointment({ date: thisMonth, status: Status.FINISHED }),
        createMockAppointment({ date: lastMonth, status: Status.FINISHED }),
        createMockAppointment({ date: lastMonth, status: Status.FINISHED }),
      ];

      vi.mocked(useAppointments).mockReturnValue({
        appointments,
        loading: false,
      } as ReturnType<typeof useAppointments>);

      vi.mocked(usePatients).mockReturnValue({
        patients: [],
        loading: false,
      } as ReturnType<typeof usePatients>);

      const { result } = renderHook(() => useDashboardMetrics());

      // This month: 1 * 350 = 350
      // Last month: 2 * 350 = 700
      expect(result.current.revenue.value).toBe(350);
      expect(result.current.revenue.previousValue).toBe(700);
      expect(result.current.revenue.changePercent).toBe(-50);
      expect(result.current.revenue.trend).toBe('down');
    });
  });

  describe('occupancy', () => {
    it('should calculate week occupancy rate', () => {
      // Wednesday appointments
      const appointments = [
        createMockAppointment({ durationMin: 30 }),
        createMockAppointment({ durationMin: 30 }),
        createMockAppointment({ durationMin: 30 }),
        createMockAppointment({ durationMin: 30 }),
      ];

      vi.mocked(useAppointments).mockReturnValue({
        appointments,
        loading: false,
      } as ReturnType<typeof useAppointments>);

      vi.mocked(usePatients).mockReturnValue({
        patients: [],
        loading: false,
      } as ReturnType<typeof usePatients>);

      const { result } = renderHook(() => useDashboardMetrics());

      expect(result.current.occupancy.rate).toBeGreaterThanOrEqual(0);
      expect(result.current.occupancy.target).toBe(85);
      expect(['excellent', 'good', 'needs-attention']).toContain(
        result.current.occupancy.status
      );
    });
  });

  describe('breakdown', () => {
    it('should count appointments by status', () => {
      const today = new Date('2025-01-15T09:00:00').toISOString();

      const appointments = [
        createMockAppointment({ date: today, status: Status.CONFIRMED }),
        createMockAppointment({ date: today, status: Status.CONFIRMED }),
        createMockAppointment({ date: today, status: Status.PENDING }),
        createMockAppointment({ date: today, status: Status.FINISHED }),
        createMockAppointment({ date: today, status: Status.NO_SHOW }),
        createMockAppointment({ date: today, status: Status.CANCELED }),
      ];

      vi.mocked(useAppointments).mockReturnValue({
        appointments,
        loading: false,
      } as ReturnType<typeof useAppointments>);

      vi.mocked(usePatients).mockReturnValue({
        patients: [],
        loading: false,
      } as ReturnType<typeof usePatients>);

      const { result } = renderHook(() => useDashboardMetrics());

      expect(result.current.breakdown.confirmed).toBe(2);
      expect(result.current.breakdown.pending).toBe(1);
      expect(result.current.breakdown.completed).toBe(1);
      expect(result.current.breakdown.noShow).toBe(1);
      expect(result.current.breakdown.canceled).toBe(1);
    });
  });

  describe('trend calculation', () => {
    it('should return up for positive change > 2%', () => {
      const today = new Date('2025-01-15T09:00:00').toISOString();
      const yesterday = new Date('2025-01-14T09:00:00').toISOString();

      const appointments = [
        createMockAppointment({ date: today }),
        createMockAppointment({ date: today }),
        createMockAppointment({ date: today }),
        createMockAppointment({ date: yesterday }),
      ];

      vi.mocked(useAppointments).mockReturnValue({
        appointments,
        loading: false,
      } as ReturnType<typeof useAppointments>);

      vi.mocked(usePatients).mockReturnValue({
        patients: [],
        loading: false,
      } as ReturnType<typeof usePatients>);

      const { result } = renderHook(() => useDashboardMetrics());

      expect(result.current.todayAppointments.trend).toBe('up');
    });

    it('should return down for negative change < -2%', () => {
      const today = new Date('2025-01-15T09:00:00').toISOString();
      const yesterday = new Date('2025-01-14T09:00:00').toISOString();

      const appointments = [
        createMockAppointment({ date: today }),
        createMockAppointment({ date: yesterday }),
        createMockAppointment({ date: yesterday }),
        createMockAppointment({ date: yesterday }),
      ];

      vi.mocked(useAppointments).mockReturnValue({
        appointments,
        loading: false,
      } as ReturnType<typeof useAppointments>);

      vi.mocked(usePatients).mockReturnValue({
        patients: [],
        loading: false,
      } as ReturnType<typeof usePatients>);

      const { result } = renderHook(() => useDashboardMetrics());

      expect(result.current.todayAppointments.trend).toBe('down');
    });

    it('should return stable for change within -2% to 2%', () => {
      const today = new Date('2025-01-15T09:00:00').toISOString();
      const yesterday = new Date('2025-01-14T09:00:00').toISOString();

      // 100 today, 100 yesterday = 0% change
      const todayAppointments = Array(100)
        .fill(null)
        .map(() => createMockAppointment({ date: today }));
      const yesterdayAppointments = Array(100)
        .fill(null)
        .map(() => createMockAppointment({ date: yesterday }));

      vi.mocked(useAppointments).mockReturnValue({
        appointments: [...todayAppointments, ...yesterdayAppointments],
        loading: false,
      } as ReturnType<typeof useAppointments>);

      vi.mocked(usePatients).mockReturnValue({
        patients: [],
        loading: false,
      } as ReturnType<typeof usePatients>);

      const { result } = renderHook(() => useDashboardMetrics());

      expect(result.current.todayAppointments.trend).toBe('stable');
    });
  });

  describe('empty data', () => {
    it('should handle empty appointments', () => {
      vi.mocked(useAppointments).mockReturnValue({
        appointments: [],
        loading: false,
      } as ReturnType<typeof useAppointments>);

      vi.mocked(usePatients).mockReturnValue({
        patients: [],
        loading: false,
      } as ReturnType<typeof usePatients>);

      const { result } = renderHook(() => useDashboardMetrics());

      expect(result.current.todayAppointments.value).toBe(0);
      expect(result.current.revenue.value).toBe(0);
      expect(result.current.occupancy.rate).toBe(0);
    });
  });
});
