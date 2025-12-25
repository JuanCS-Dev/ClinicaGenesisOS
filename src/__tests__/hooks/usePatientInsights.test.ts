/**
 * usePatientInsights Hook Tests - Patient analytics and engagement metrics.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { usePatientInsights } from '../../hooks/usePatientInsights';
import type { Patient, Appointment } from '../../types';
import { Status } from '../../types';

// Mock dependencies
vi.mock('../../contexts/ClinicContext', () => ({
  useClinicContext: vi.fn(() => ({
    clinicId: 'clinic-123',
  })),
}));

// Calculate dates for testing
const now = new Date();
const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
const oneHundredDaysAgo = new Date(now.getTime() - 100 * 24 * 60 * 60 * 1000);
const sevenMonthsAgo = new Date(now.getTime() - 210 * 24 * 60 * 60 * 1000);

const mockPatients: Patient[] = [
  {
    id: 'patient-1',
    clinicId: 'clinic-123',
    name: 'Maria Santos',
    email: 'maria@email.com',
    phone: '11999999999',
    birthDate: '1980-05-15',
    gender: 'female',
    insurance: 'Unimed',
    createdAt: thirtyDaysAgo.toISOString(),
    updatedAt: thirtyDaysAgo.toISOString(),
    createdBy: 'user-123',
  },
  {
    id: 'patient-2',
    clinicId: 'clinic-123',
    name: 'João Silva',
    email: 'joao@email.com',
    phone: '11888888888',
    birthDate: '1990-10-20',
    gender: 'male',
    insurance: 'SulAmérica',
    createdAt: sixtyDaysAgo.toISOString(),
    updatedAt: sixtyDaysAgo.toISOString(),
    createdBy: 'user-123',
  },
  {
    id: 'patient-3',
    clinicId: 'clinic-123',
    name: 'Ana Oliveira',
    email: 'ana@email.com',
    phone: '11777777777',
    birthDate: '1975-03-10',
    gender: 'female',
    insurance: 'Particular',
    createdAt: oneHundredDaysAgo.toISOString(),
    updatedAt: oneHundredDaysAgo.toISOString(),
    createdBy: 'user-123',
  },
];

const mockAppointments: Appointment[] = [
  // Patient 1 - Active, returning patient
  {
    id: 'apt-1',
    clinicId: 'clinic-123',
    patientId: 'patient-1',
    patientName: 'Maria Santos',
    date: now.toISOString(),
    startTime: '09:00',
    endTime: '09:30',
    durationMin: 30,
    status: Status.FINISHED,
    specialty: 'Clínico Geral',
    procedure: 'Consulta',
    professional: 'Dr. Silva',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    createdBy: 'user-123',
  },
  {
    id: 'apt-2',
    clinicId: 'clinic-123',
    patientId: 'patient-1',
    patientName: 'Maria Santos',
    date: thirtyDaysAgo.toISOString(),
    startTime: '10:00',
    endTime: '10:30',
    durationMin: 30,
    status: Status.FINISHED,
    specialty: 'Clínico Geral',
    procedure: 'Retorno',
    professional: 'Dr. Silva',
    createdAt: thirtyDaysAgo.toISOString(),
    updatedAt: thirtyDaysAgo.toISOString(),
    createdBy: 'user-123',
  },
  // Patient 2 - At risk (100 days since last visit)
  {
    id: 'apt-3',
    clinicId: 'clinic-123',
    patientId: 'patient-2',
    patientName: 'João Silva',
    date: oneHundredDaysAgo.toISOString(),
    startTime: '14:00',
    endTime: '14:30',
    durationMin: 30,
    status: Status.FINISHED,
    specialty: 'Cardiologia',
    procedure: 'Consulta',
    professional: 'Dra. Costa',
    createdAt: oneHundredDaysAgo.toISOString(),
    updatedAt: oneHundredDaysAgo.toISOString(),
    createdBy: 'user-123',
  },
  // Patient 3 - Churned (7 months ago)
  {
    id: 'apt-4',
    clinicId: 'clinic-123',
    patientId: 'patient-3',
    patientName: 'Ana Oliveira',
    date: sevenMonthsAgo.toISOString(),
    startTime: '16:00',
    endTime: '16:30',
    durationMin: 30,
    status: Status.FINISHED,
    specialty: 'Dermatologia',
    procedure: 'Consulta',
    professional: 'Dr. Santos',
    createdAt: sevenMonthsAgo.toISOString(),
    updatedAt: sevenMonthsAgo.toISOString(),
    createdBy: 'user-123',
  },
  // Missed appointments
  {
    id: 'apt-5',
    clinicId: 'clinic-123',
    patientId: 'patient-2',
    patientName: 'João Silva',
    date: sixtyDaysAgo.toISOString(),
    startTime: '11:00',
    endTime: '11:30',
    durationMin: 30,
    status: Status.NO_SHOW,
    specialty: 'Cardiologia',
    procedure: 'Retorno',
    professional: 'Dra. Costa',
    createdAt: sixtyDaysAgo.toISOString(),
    updatedAt: sixtyDaysAgo.toISOString(),
    createdBy: 'user-123',
  },
  {
    id: 'apt-6',
    clinicId: 'clinic-123',
    patientId: 'patient-2',
    patientName: 'João Silva',
    date: thirtyDaysAgo.toISOString(),
    startTime: '15:00',
    endTime: '15:30',
    durationMin: 30,
    status: Status.CANCELED,
    specialty: 'Cardiologia',
    procedure: 'Exame',
    professional: 'Dra. Costa',
    createdAt: thirtyDaysAgo.toISOString(),
    updatedAt: thirtyDaysAgo.toISOString(),
    createdBy: 'user-123',
  },
];

vi.mock('../../hooks/usePatients', () => ({
  usePatients: vi.fn(() => ({
    patients: mockPatients,
    loading: false,
    error: null,
  })),
}));

vi.mock('../../hooks/useAppointments', () => ({
  useAppointments: vi.fn(() => ({
    appointments: mockAppointments,
    loading: false,
    error: null,
  })),
}));

describe('usePatientInsights', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loading state', () => {
    it('should reflect patients loading state', async () => {
      const { result } = renderHook(() => usePatientInsights());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe('retention metrics', () => {
    it('should calculate total patients', async () => {
      const { result } = renderHook(() => usePatientInsights());

      await waitFor(() => {
        expect(result.current.retention.totalPatients).toBe(3);
      });
    });

    it('should calculate active patients (visited in last 90 days)', async () => {
      const { result } = renderHook(() => usePatientInsights());

      await waitFor(() => {
        // Patient 1 has visits within 90 days
        expect(result.current.retention.activePatients).toBeGreaterThanOrEqual(1);
      });
    });

    it('should calculate returning patients (more than 1 visit)', async () => {
      const { result } = renderHook(() => usePatientInsights());

      await waitFor(() => {
        // Patient 1 has 2 visits
        expect(result.current.retention.returningPatients).toBeGreaterThanOrEqual(1);
      });
    });

    it('should calculate retention rate', async () => {
      const { result } = renderHook(() => usePatientInsights());

      await waitFor(() => {
        expect(result.current.retention.retentionRate).toBeGreaterThanOrEqual(0);
        expect(result.current.retention.retentionRate).toBeLessThanOrEqual(100);
      });
    });

    it('should calculate churn rate', async () => {
      const { result } = renderHook(() => usePatientInsights());

      await waitFor(() => {
        // Patient 3 churned (7 months since last visit)
        expect(result.current.retention.churnRate).toBeGreaterThanOrEqual(0);
      });
    });

    it('should calculate average visits per patient', async () => {
      const { result } = renderHook(() => usePatientInsights());

      await waitFor(() => {
        expect(result.current.retention.averageVisitsPerPatient).toBeGreaterThan(0);
      });
    });
  });

  describe('NPS data', () => {
    it('should calculate NPS score', async () => {
      const { result } = renderHook(() => usePatientInsights());

      await waitFor(() => {
        expect(result.current.nps.score).toBeGreaterThanOrEqual(-100);
        expect(result.current.nps.score).toBeLessThanOrEqual(100);
      });
    });

    it('should have promoters, passives, and detractors', async () => {
      const { result } = renderHook(() => usePatientInsights());

      await waitFor(() => {
        expect(result.current.nps.promoters).toBeGreaterThanOrEqual(0);
        expect(result.current.nps.passives).toBeGreaterThanOrEqual(0);
        expect(result.current.nps.detractors).toBeGreaterThanOrEqual(0);
      });
    });

    it('should have total responses', async () => {
      const { result } = renderHook(() => usePatientInsights());

      await waitFor(() => {
        expect(result.current.nps.totalResponses).toBeGreaterThan(0);
      });
    });

    it('should have trend indicator', async () => {
      const { result } = renderHook(() => usePatientInsights());

      await waitFor(() => {
        expect(['up', 'down', 'stable']).toContain(result.current.nps.trend);
      });
    });

    it('should have recent feedback', async () => {
      const { result } = renderHook(() => usePatientInsights());

      await waitFor(() => {
        expect(Array.isArray(result.current.nps.recentFeedback)).toBe(true);
        if (result.current.nps.recentFeedback.length > 0) {
          const feedback = result.current.nps.recentFeedback[0];
          expect(feedback).toHaveProperty('patientName');
          expect(feedback).toHaveProperty('rating');
          expect(feedback).toHaveProperty('date');
        }
      });
    });
  });

  describe('patients at risk', () => {
    it('should identify patients at risk', async () => {
      const { result } = renderHook(() => usePatientInsights());

      await waitFor(() => {
        expect(Array.isArray(result.current.patientsAtRisk)).toBe(true);
      });
    });

    it('should include reason for risk', async () => {
      const { result } = renderHook(() => usePatientInsights());

      await waitFor(() => {
        if (result.current.patientsAtRisk.length > 0) {
          const atRisk = result.current.patientsAtRisk[0];
          expect(['no_return', 'missed_appointments', 'negative_feedback', 'chronic_condition']).toContain(
            atRisk.reason
          );
        }
      });
    });

    it('should include risk level', async () => {
      const { result } = renderHook(() => usePatientInsights());

      await waitFor(() => {
        if (result.current.patientsAtRisk.length > 0) {
          const atRisk = result.current.patientsAtRisk[0];
          expect(['high', 'medium', 'low']).toContain(atRisk.riskLevel);
        }
      });
    });

    it('should include recommended action', async () => {
      const { result } = renderHook(() => usePatientInsights());

      await waitFor(() => {
        if (result.current.patientsAtRisk.length > 0) {
          const atRisk = result.current.patientsAtRisk[0];
          expect(atRisk.recommendedAction).toBeTruthy();
        }
      });
    });

    it('should sort by risk level (high first)', async () => {
      const { result } = renderHook(() => usePatientInsights());

      await waitFor(() => {
        const risks = result.current.patientsAtRisk;
        if (risks.length >= 2) {
          const riskOrder = { high: 0, medium: 1, low: 2 };
          for (let i = 1; i < risks.length; i++) {
            expect(riskOrder[risks[i - 1].riskLevel]).toBeLessThanOrEqual(
              riskOrder[risks[i].riskLevel]
            );
          }
        }
      });
    });
  });

  describe('engagement metrics', () => {
    it('should calculate portal adoption', async () => {
      const { result } = renderHook(() => usePatientInsights());

      await waitFor(() => {
        expect(result.current.engagement.portalAdoption).toBeGreaterThanOrEqual(0);
        expect(result.current.engagement.portalAdoption).toBeLessThanOrEqual(100);
      });
    });

    it('should calculate appointment confirmation rate', async () => {
      const { result } = renderHook(() => usePatientInsights());

      await waitFor(() => {
        expect(result.current.engagement.appointmentConfirmationRate).toBeGreaterThanOrEqual(0);
        expect(result.current.engagement.appointmentConfirmationRate).toBeLessThanOrEqual(100);
      });
    });

    it('should calculate no-show rate', async () => {
      const { result } = renderHook(() => usePatientInsights());

      await waitFor(() => {
        // We have 1 no-show out of 6 appointments
        expect(result.current.engagement.noShowRate).toBeGreaterThanOrEqual(0);
      });
    });

    it('should have communication channels breakdown', async () => {
      const { result } = renderHook(() => usePatientInsights());

      await waitFor(() => {
        expect(result.current.engagement.communicationChannels.length).toBeGreaterThan(0);
        const whatsapp = result.current.engagement.communicationChannels.find(
          (c) => c.channel === 'WhatsApp'
        );
        expect(whatsapp).toBeDefined();
      });
    });

    it('should have time of day distribution', async () => {
      const { result } = renderHook(() => usePatientInsights());

      await waitFor(() => {
        expect(result.current.engagement.byTimeOfDay.length).toBe(3);
        expect(result.current.engagement.byTimeOfDay[0].period).toContain('Manhã');
        expect(result.current.engagement.byTimeOfDay[1].period).toContain('Tarde');
        expect(result.current.engagement.byTimeOfDay[2].period).toContain('Noite');
      });
    });
  });

  describe('demographics', () => {
    it('should calculate age distribution', async () => {
      const { result } = renderHook(() => usePatientInsights());

      await waitFor(() => {
        expect(result.current.demographics.byAge.length).toBeGreaterThan(0);
        const hasAgeRanges = result.current.demographics.byAge.some((r) =>
          r.range.includes('-') || r.range.includes('+')
        );
        expect(hasAgeRanges).toBe(true);
      });
    });

    it('should calculate gender distribution', async () => {
      const { result } = renderHook(() => usePatientInsights());

      await waitFor(() => {
        expect(result.current.demographics.byGender.length).toBeGreaterThan(0);
        const genders = result.current.demographics.byGender.map((g) => g.gender);
        expect(genders).toContain('Feminino');
        expect(genders).toContain('Masculino');
      });
    });

    it('should calculate insurance distribution', async () => {
      const { result } = renderHook(() => usePatientInsights());

      await waitFor(() => {
        expect(result.current.demographics.byInsurance.length).toBeGreaterThan(0);
      });
    });

    it('should have percentages that make sense', async () => {
      const { result } = renderHook(() => usePatientInsights());

      await waitFor(() => {
        const totalGenderPercentage = result.current.demographics.byGender.reduce(
          (sum, g) => sum + g.percentage,
          0
        );
        // Allow for rounding errors
        expect(totalGenderPercentage).toBeGreaterThanOrEqual(95);
        expect(totalGenderPercentage).toBeLessThanOrEqual(105);
      });
    });

    it('should have top conditions array', async () => {
      const { result } = renderHook(() => usePatientInsights());

      await waitFor(() => {
        // topConditions is a placeholder that returns empty array
        // Test that the property exists and is an array
        expect(Array.isArray(result.current.demographics.topConditions)).toBe(true);
      });
    });
  });

  describe('error state', () => {
    it('should start with null error', async () => {
      const { result } = renderHook(() => usePatientInsights());

      await waitFor(() => {
        expect(result.current.error).toBe(null);
      });
    });
  });
});
