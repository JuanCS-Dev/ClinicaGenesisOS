/**
 * useWhatsAppMetrics Hook Tests - WhatsApp reminder metrics.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import {
  useWhatsAppMetrics,
  useWhatsAppMetricsFiltered,
} from '../../hooks/useWhatsAppMetrics';
import { calculateWhatsAppMetrics } from '../../services/whatsapp-metrics.service';
import type { Appointment } from '../../types';

// Mock dependencies
vi.mock('../../hooks/useAppointments', () => ({
  useAppointments: vi.fn(() => ({
    appointments: [],
    loading: false,
    error: null,
  })),
}));

vi.mock('../../services/whatsapp-metrics.service', () => ({
  calculateWhatsAppMetrics: vi.fn(),
}));

import { useAppointments } from '../../hooks/useAppointments';

const mockAppointments: Appointment[] = [
  {
    id: 'apt-1',
    clinicId: 'clinic-123',
    patientId: 'patient-1',
    patientName: 'João Silva',
    date: new Date().toISOString(),
    startTime: '09:00',
    endTime: '09:30',
    durationMin: 30,
    status: 'Confirmado',
    specialty: 'Clínico Geral',
    procedure: 'Consulta',
    professional: 'Dr. Silva',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'user-123',
    reminderSent: true,
  },
  {
    id: 'apt-2',
    clinicId: 'clinic-123',
    patientId: 'patient-2',
    patientName: 'Maria Santos',
    date: new Date().toISOString(),
    startTime: '10:00',
    endTime: '10:30',
    durationMin: 30,
    status: 'Pendente',
    specialty: 'Clínico Geral',
    procedure: 'Consulta',
    professional: 'Dr. Silva',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'user-123',
    reminderSent: false,
  },
];

const mockMetrics = {
  total: 100,
  sent: 80,
  delivered: 75,
  read: 60,
  failed: 5,
  deliveryRate: 93.75,
  readRate: 80,
  confirmationRate: 70,
};

describe('useWhatsAppMetrics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAppointments).mockReturnValue({
      appointments: mockAppointments,
      loading: false,
      error: null,
    } as ReturnType<typeof useAppointments>);

    vi.mocked(calculateWhatsAppMetrics).mockReturnValue(mockMetrics);
  });

  describe('initial state', () => {
    it('should return metrics from service', () => {
      const { result } = renderHook(() => useWhatsAppMetrics());

      expect(result.current.metrics).toEqual(mockMetrics);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
    });
  });

  describe('loading state', () => {
    it('should reflect appointments loading state', () => {
      vi.mocked(useAppointments).mockReturnValue({
        appointments: [],
        loading: true,
        error: null,
      } as ReturnType<typeof useAppointments>);

      const { result } = renderHook(() => useWhatsAppMetrics());

      expect(result.current.loading).toBe(true);
    });
  });

  describe('error state', () => {
    it('should reflect appointments error state', () => {
      const mockError = new Error('Failed to load');
      vi.mocked(useAppointments).mockReturnValue({
        appointments: [],
        loading: false,
        error: mockError,
      } as ReturnType<typeof useAppointments>);

      const { result } = renderHook(() => useWhatsAppMetrics());

      expect(result.current.error).toBe(mockError);
    });
  });

  describe('memoization', () => {
    it('should call calculateWhatsAppMetrics with appointments', () => {
      renderHook(() => useWhatsAppMetrics());

      expect(calculateWhatsAppMetrics).toHaveBeenCalledWith(mockAppointments);
    });

    it('should recalculate when appointments change', () => {
      const { rerender } = renderHook(() => useWhatsAppMetrics());

      expect(calculateWhatsAppMetrics).toHaveBeenCalledTimes(1);

      // Simulate appointments change
      vi.mocked(useAppointments).mockReturnValue({
        appointments: [...mockAppointments, { ...mockAppointments[0], id: 'apt-3' }],
        loading: false,
        error: null,
      } as ReturnType<typeof useAppointments>);

      rerender();

      expect(calculateWhatsAppMetrics).toHaveBeenCalledTimes(2);
    });
  });
});

describe('useWhatsAppMetricsFiltered', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAppointments).mockReturnValue({
      appointments: mockAppointments,
      loading: false,
      error: null,
    } as ReturnType<typeof useAppointments>);

    vi.mocked(calculateWhatsAppMetrics).mockReturnValue(mockMetrics);
  });

  describe('without filters', () => {
    it('should return unfiltered metrics', () => {
      const { result } = renderHook(() => useWhatsAppMetricsFiltered());

      expect(calculateWhatsAppMetrics).toHaveBeenCalledWith(mockAppointments);
      expect(result.current.metrics).toEqual(mockMetrics);
    });
  });

  describe('with date filters', () => {
    it('should filter by start date', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const futureAppointments = [
        {
          ...mockAppointments[0],
          date: tomorrow.toISOString(),
        },
      ];

      vi.mocked(useAppointments).mockReturnValue({
        appointments: [...mockAppointments, ...futureAppointments],
        loading: false,
        error: null,
      } as ReturnType<typeof useAppointments>);

      const startDate = new Date();
      startDate.setHours(23, 59, 59);

      renderHook(() => useWhatsAppMetricsFiltered(startDate));

      // Should filter out appointments before startDate
      expect(calculateWhatsAppMetrics).toHaveBeenCalled();
    });

    it('should filter by end date', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      renderHook(() => useWhatsAppMetricsFiltered(undefined, yesterday));

      // Should filter appointments after endDate
      expect(calculateWhatsAppMetrics).toHaveBeenCalled();
    });

    it('should filter by date range', () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);

      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);

      renderHook(() => useWhatsAppMetricsFiltered(startDate, endDate));

      expect(calculateWhatsAppMetrics).toHaveBeenCalled();
    });
  });

  describe('memoization', () => {
    it('should recalculate when dates change', () => {
      const { rerender } = renderHook(
        ({ start, end }) => useWhatsAppMetricsFiltered(start, end),
        { initialProps: { start: undefined, end: undefined } }
      );

      expect(calculateWhatsAppMetrics).toHaveBeenCalledTimes(1);

      const startDate = new Date();
      rerender({ start: startDate, end: undefined });

      expect(calculateWhatsAppMetrics).toHaveBeenCalledTimes(2);
    });
  });
});
