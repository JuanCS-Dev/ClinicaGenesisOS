/**
 * useReports Hook Tests - Clinical reports and analytics.
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useReports } from '../../hooks/useReports';
import { patientService } from '../../services/firestore/patient.service';
import { appointmentService } from '../../services/firestore/appointment.service';
import type { Patient, Appointment } from '../../types';

// Mock dependencies
vi.mock('../../contexts/ClinicContext', () => ({
  useClinicContext: vi.fn(() => ({
    clinicId: 'clinic-123',
  })),
}));

vi.mock('../../services/firestore/patient.service', () => ({
  patientService: {
    getAll: vi.fn(),
  },
}));

vi.mock('../../services/firestore/appointment.service', () => ({
  appointmentService: {
    getAll: vi.fn(),
  },
}));

import { useClinicContext } from '../../contexts/ClinicContext';

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

const createMockAppointment = (overrides: Partial<Appointment> = {}): Appointment => ({
  id: `apt-${Math.random().toString(36).substr(2, 9)}`,
  clinicId: 'clinic-123',
  patientId: 'patient-123',
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
  ...overrides,
});

/** Helper: Wait for hook to finish loading */
const waitForLoaded = async (result: { current: { loading: boolean } }) => {
  await waitFor(() => expect(result.current.loading).toBe(false), { timeout: 3000 });
};

describe('useReports', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useClinicContext).mockReturnValue({
      clinicId: 'clinic-123',
    } as unknown as ReturnType<typeof useClinicContext>);

    vi.mocked(patientService.getAll).mockResolvedValue([]);
    vi.mocked(appointmentService.getAll).mockResolvedValue([]);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should start with loading true', () => {
      const { result } = renderHook(() => useReports());
      expect(result.current.loading).toBe(true);
    });

    it('should have default date range for current month', () => {
      const { result } = renderHook(() => useReports());
      expect(result.current.filters.dateRange).toBeDefined();
    });
  });

  describe('loading data', () => {
    it('should fetch patients and appointments', async () => {
      const { result } = renderHook(() => useReports());

      await waitForLoaded(result);

      expect(patientService.getAll).toHaveBeenCalledWith('clinic-123');
      expect(appointmentService.getAll).toHaveBeenCalledWith('clinic-123');
    });
  });

  describe('when clinic is not set', () => {
    it('should not fetch data', async () => {
      vi.mocked(useClinicContext).mockReturnValue({
        clinicId: null,
      } as unknown as ReturnType<typeof useClinicContext>);

      const { result } = renderHook(() => useReports());

      await waitForLoaded(result);

      expect(patientService.getAll).not.toHaveBeenCalled();
    });
  });

  describe('demographics calculation', () => {
    it('should calculate gender distribution', async () => {
      const patients = [
        createMockPatient({ gender: 'feminino' }),
        createMockPatient({ gender: 'feminino' }),
        createMockPatient({ gender: 'masculino' }),
        createMockPatient({ gender: 'm' }),
      ];

      vi.mocked(patientService.getAll).mockResolvedValue(patients);

      const { result } = renderHook(() => useReports());

      await waitForLoaded(result);

      expect(result.current.demographics?.gender).toBeDefined();
      const femaleData = result.current.demographics?.gender.find(
        (g) => g.name === 'Feminino'
      );
      expect(femaleData?.value).toBe(50); // 2 out of 4
    });

    it('should calculate age group distribution', async () => {
      const patients = [
        createMockPatient({ birthDate: '2010-01-01' }), // < 18
        createMockPatient({ birthDate: '2000-01-01' }), // 18-25
        createMockPatient({ birthDate: '1990-01-01' }), // 26-35
        createMockPatient({ birthDate: '1970-01-01' }), // 46-55
      ];

      vi.mocked(patientService.getAll).mockResolvedValue(patients);

      const { result } = renderHook(() => useReports());

      await waitForLoaded(result);

      expect(result.current.demographics?.ageGroups).toBeDefined();
      expect(result.current.demographics?.ageGroups.length).toBeGreaterThan(0);
    });

    it('should return null when no patients', async () => {
      vi.mocked(patientService.getAll).mockResolvedValue([]);

      const { result } = renderHook(() => useReports());

      await waitForLoaded(result);

      expect(result.current.demographics).toBe(null);
    });
  });

  describe('procedure stats calculation', () => {
    it('should calculate procedure counts', async () => {
      const appointments = [
        createMockAppointment({ procedure: 'Consulta' }),
        createMockAppointment({ procedure: 'Consulta' }),
        createMockAppointment({ procedure: 'Exame' }),
      ];

      vi.mocked(appointmentService.getAll).mockResolvedValue(appointments);

      const { result } = renderHook(() => useReports());

      await waitForLoaded(result);

      expect(result.current.procedureStats.length).toBeGreaterThan(0);
      const consultaStats = result.current.procedureStats.find(
        (p) => p.name === 'Consulta'
      );
      expect(consultaStats?.value).toBe(2);
    });

    it('should sort by count and limit to top 6', async () => {
      const procedures = [
        'Consulta',
        'Exame',
        'Retorno',
        'Vacina',
        'Cirurgia',
        'Preventivo',
        'Outros',
      ];
      const appointments = procedures.flatMap((procedure, i) =>
        Array(10 - i)
          .fill(null)
          .map(() => createMockAppointment({ procedure }))
      );

      vi.mocked(appointmentService.getAll).mockResolvedValue(appointments);

      const { result } = renderHook(() => useReports());

      await waitForLoaded(result);

      expect(result.current.procedureStats.length).toBeLessThanOrEqual(6);
      expect(result.current.procedureStats[0].value).toBeGreaterThanOrEqual(
        result.current.procedureStats[1].value
      );
    });

    it('should return empty when no appointments', async () => {
      vi.mocked(appointmentService.getAll).mockResolvedValue([]);

      const { result } = renderHook(() => useReports());

      await waitForLoaded(result);

      expect(result.current.procedureStats).toEqual([]);
    });
  });

  describe('metrics calculation', () => {
    it('should calculate total and active patients', async () => {
      const sixMonthsAgo = new Date('2024-08-01').toISOString();
      const now = new Date().toISOString();

      const patients = [
        createMockPatient({ id: 'p1' }),
        createMockPatient({ id: 'p2' }),
        createMockPatient({ id: 'p3' }),
      ];

      const appointments = [
        createMockAppointment({ patientId: 'p1', date: now }),
        createMockAppointment({ patientId: 'p2', date: sixMonthsAgo }),
      ];

      vi.mocked(patientService.getAll).mockResolvedValue(patients);
      vi.mocked(appointmentService.getAll).mockResolvedValue(appointments);

      const { result } = renderHook(() => useReports());

      await waitForLoaded(result);

      expect(result.current.metrics?.totalPatients).toBe(3);
      // Active = patients with appointments in last 6 months
      expect(result.current.metrics?.activePatients).toBeGreaterThanOrEqual(1);
    });

    it('should calculate completion rate', async () => {
      const patients = [createMockPatient()];
      const appointments = [
        createMockAppointment({ status: 'Finalizado' }),
        createMockAppointment({ status: 'Finalizado' }),
        createMockAppointment({ status: 'Confirmado' }),
        createMockAppointment({ status: 'Cancelado' }),
      ];

      vi.mocked(patientService.getAll).mockResolvedValue(patients);
      vi.mocked(appointmentService.getAll).mockResolvedValue(appointments);

      const { result } = renderHook(() => useReports());

      await waitForLoaded(result);

      // 2 completed out of 4 = 50%
      expect(result.current.metrics?.completionRate).toBe(50);
    });

    it('should return null when no patients', async () => {
      vi.mocked(patientService.getAll).mockResolvedValue([]);

      const { result } = renderHook(() => useReports());

      await waitForLoaded(result);

      expect(result.current.metrics).toBe(null);
    });
  });

  describe('filters', () => {
    it('should filter appointments by date range', async () => {
      const inRange = new Date('2025-01-10').toISOString();
      const outOfRange = new Date('2024-12-01').toISOString();

      const appointments = [
        createMockAppointment({ date: inRange, procedure: 'InRange' }),
        createMockAppointment({ date: outOfRange, procedure: 'OutOfRange' }),
      ];

      vi.mocked(appointmentService.getAll).mockResolvedValue(appointments);
      vi.mocked(patientService.getAll).mockResolvedValue([createMockPatient()]);

      const { result } = renderHook(() => useReports());

      await waitForLoaded(result);

      // Only in-range appointment should be in procedure stats
      expect(
        result.current.procedureStats.find((p) => p.name === 'OutOfRange')
      ).toBeUndefined();
    });

    it('should filter by specialty', async () => {
      const appointments = [
        createMockAppointment({ specialty: 'Cardiologia' }),
        createMockAppointment({ specialty: 'Ortopedia' }),
      ];

      vi.mocked(appointmentService.getAll).mockResolvedValue(appointments);
      vi.mocked(patientService.getAll).mockResolvedValue([createMockPatient()]);

      const { result } = renderHook(() => useReports());

      await waitForLoaded(result);

      act(() => {
        result.current.setFilters({
          ...result.current.filters,
          specialty: 'Cardiologia',
        });
      });

      // After filter, metrics should only count filtered appointments
      expect(result.current.filters.specialty).toBe('Cardiologia');
    });

    it('should filter by professional', async () => {
      const appointments = [
        createMockAppointment({ professional: 'Dr. Silva' }),
        createMockAppointment({ professional: 'Dra. Santos' }),
      ];

      vi.mocked(appointmentService.getAll).mockResolvedValue(appointments);
      vi.mocked(patientService.getAll).mockResolvedValue([createMockPatient()]);

      const { result } = renderHook(() => useReports());

      await waitForLoaded(result);

      act(() => {
        result.current.setFilters({
          ...result.current.filters,
          professional: 'Dr. Silva',
        });
      });

      expect(result.current.filters.professional).toBe('Dr. Silva');
    });
  });

  describe('refresh', () => {
    it('should refresh data', async () => {
      const { result } = renderHook(() => useReports());

      await waitForLoaded(result);

      vi.mocked(patientService.getAll).mockClear();
      vi.mocked(appointmentService.getAll).mockClear();

      await act(async () => {
        await result.current.refresh();
      });

      expect(patientService.getAll).toHaveBeenCalledTimes(1);
      expect(appointmentService.getAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('error handling', () => {
    it('should handle fetch errors', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(patientService.getAll).mockRejectedValue(
        new Error('Network error')
      );

      const { result } = renderHook(() => useReports());

      await waitForLoaded(result);

      expect(result.current.error?.message).toBe('Network error');
      consoleSpy.mockRestore();
    });
  });
});
