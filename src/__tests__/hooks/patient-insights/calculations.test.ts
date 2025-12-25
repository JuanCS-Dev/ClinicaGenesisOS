/** Patient Insights Calculations Tests - Tests pure calculation functions. */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  daysSince,
  calculateNPSScore,
  buildPatientVisitMap,
  calculateRetention,
  calculateNPS,
  identifyPatientsAtRisk,
  calculateEngagement,
  calculateDemographics,
} from '../../../hooks/patient-insights/calculations';
import { Status } from '../../../types';
import type { Patient, Appointment } from '../../../types';

function createPatient(overrides: Partial<Patient> = {}): Patient {
  return {
    id: `patient-${Math.random().toString(36).slice(2)}`,
    clinicId: 'clinic-1',
    name: 'Test Patient',
    email: 'test@example.com',
    phone: '11999998888',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  } as Patient;
}

function createAppointment(overrides: Partial<Appointment> = {}): Appointment {
  return {
    id: `apt-${Math.random().toString(36).slice(2)}`,
    clinicId: 'clinic-1',
    patientId: 'patient-1',
    patientName: 'Test Patient',
    date: new Date().toISOString(),
    startTime: '09:00',
    endTime: '09:30',
    status: Status.FINISHED,
    professionalId: 'prof-1',
    professionalName: 'Dr. Test',
    procedure: 'Consulta',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  } as Appointment;
}

describe('patient-insights/calculations', () => {
  describe('daysSince', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2025-01-15T12:00:00Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('calculates days since a date string', () => {
      expect(daysSince('2025-01-10')).toBe(5);
    });

    it('calculates days since a Date object', () => {
      const date = new Date('2025-01-05');
      expect(daysSince(date)).toBe(10);
    });

    it('returns 0 for today', () => {
      expect(daysSince('2025-01-15')).toBe(0);
    });

    it('handles dates far in the past', () => {
      // 2024 is a leap year, so 366 days
      expect(daysSince('2024-01-15')).toBe(366);
    });
  });

  describe('calculateNPSScore', () => {
    it('calculates positive NPS when promoters dominate', () => {
      expect(calculateNPSScore(70, 10, 100)).toBe(60); // (70-10)/100*100
    });
    it('calculates negative NPS when detractors dominate', () => {
      expect(calculateNPSScore(10, 60, 100)).toBe(-50); // (10-60)/100*100
    });

    it('returns 0 when equal promoters and detractors', () => {
      expect(calculateNPSScore(30, 30, 100)).toBe(0);
    });

    it('returns 0 for empty data', () => {
      expect(calculateNPSScore(0, 0, 0)).toBe(0);
    });

    it('returns 100 for all promoters', () => {
      expect(calculateNPSScore(100, 0, 100)).toBe(100);
    });

    it('returns -100 for all detractors', () => {
      expect(calculateNPSScore(0, 100, 100)).toBe(-100);
    });
  });

  describe('buildPatientVisitMap', () => {
    it('builds empty map for no appointments', () => {
      const map = buildPatientVisitMap([]);
      expect(map.size).toBe(0);
    });

    it('counts visits per patient', () => {
      const appointments = [
        createAppointment({ patientId: 'p1', date: '2025-01-10' }),
        createAppointment({ patientId: 'p1', date: '2025-01-12' }),
        createAppointment({ patientId: 'p2', date: '2025-01-11' }),
      ];

      const map = buildPatientVisitMap(appointments);

      expect(map.size).toBe(2);
      expect(map.get('p1')?.count).toBe(2);
      expect(map.get('p2')?.count).toBe(1);
    });

    it('only counts FINISHED appointments', () => {
      const appointments = [
        createAppointment({ patientId: 'p1', status: Status.FINISHED }),
        createAppointment({ patientId: 'p1', status: Status.CANCELED }),
        createAppointment({ patientId: 'p1', status: Status.NO_SHOW }),
      ];

      const map = buildPatientVisitMap(appointments);

      expect(map.get('p1')?.count).toBe(1);
    });

    it('tracks first and last visit dates', () => {
      const appointments = [
        createAppointment({ patientId: 'p1', date: '2025-01-05' }),
        createAppointment({ patientId: 'p1', date: '2025-01-15' }),
        createAppointment({ patientId: 'p1', date: '2025-01-10' }),
      ];

      const map = buildPatientVisitMap(appointments);
      const data = map.get('p1');

      expect(data?.firstVisit.toISOString()).toContain('2025-01-05');
      expect(data?.lastVisit.toISOString()).toContain('2025-01-15');
    });
  });

  describe('calculateRetention', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2025-01-15T12:00:00Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('returns zeros for empty data', () => {
      const result = calculateRetention([], []);

      expect(result.totalPatients).toBe(0);
      expect(result.activePatients).toBe(0);
      expect(result.retentionRate).toBe(0);
    });

    it('counts total patients', () => {
      const patients = [createPatient(), createPatient(), createPatient()];
      const result = calculateRetention(patients, []);

      expect(result.totalPatients).toBe(3);
    });

    it('identifies active patients (visited in last 90 days)', () => {
      const patients = [
        createPatient({ id: 'p1' }),
        createPatient({ id: 'p2' }),
      ];
      const appointments = [
        createAppointment({ patientId: 'p1', date: '2025-01-10' }), // 5 days ago - active
        createAppointment({ patientId: 'p2', date: '2024-09-01' }), // >90 days ago - inactive
      ];

      const result = calculateRetention(patients, appointments);

      expect(result.activePatients).toBe(1);
    });

    it('identifies returning patients (more than 1 visit)', () => {
      const patients = [createPatient({ id: 'p1' })];
      const appointments = [
        createAppointment({ patientId: 'p1', date: '2025-01-05' }),
        createAppointment({ patientId: 'p1', date: '2025-01-10' }),
      ];

      const result = calculateRetention(patients, appointments);

      expect(result.returningPatients).toBe(1);
    });

    it('identifies new patients (first visit this month)', () => {
      const patients = [createPatient({ id: 'p1' })];
      const appointments = [
        createAppointment({ patientId: 'p1', date: '2025-01-10' }),
      ];

      const result = calculateRetention(patients, appointments);

      expect(result.newPatients).toBe(1);
    });

    it('calculates retention rate correctly', () => {
      const patients = [
        createPatient({ id: 'p1' }),
        createPatient({ id: 'p2' }),
      ];
      const appointments = [
        createAppointment({ patientId: 'p1', date: '2025-01-01' }),
        createAppointment({ patientId: 'p1', date: '2025-01-10' }), // returning
        createAppointment({ patientId: 'p2', date: '2025-01-05' }), // single visit
      ];

      const result = calculateRetention(patients, appointments);

      // 1 returning out of 2 with visits = 50%
      expect(result.retentionRate).toBe(50);
    });

    it('calculates average visits per patient', () => {
      const patients = [
        createPatient({ id: 'p1' }),
        createPatient({ id: 'p2' }),
      ];
      const appointments = [
        createAppointment({ patientId: 'p1', date: '2025-01-01' }),
        createAppointment({ patientId: 'p1', date: '2025-01-10' }),
        createAppointment({ patientId: 'p2', date: '2025-01-05' }),
      ];

      const result = calculateRetention(patients, appointments);

      // 3 visits / 2 patients = 1.5
      expect(result.averageVisitsPerPatient).toBe(1.5);
    });
  });

  describe('calculateNPS', () => {
    it('returns valid NPS structure', () => {
      const result = calculateNPS(100);

      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('promoters');
      expect(result).toHaveProperty('passives');
      expect(result).toHaveProperty('detractors');
      expect(result).toHaveProperty('totalResponses');
      expect(result).toHaveProperty('trend');
    });

    it('calculates total responses based on patient count', () => {
      const result = calculateNPS(100);

      // 30% of patients = 30 responses (but min 10)
      expect(result.totalResponses).toBe(30);
    });

    it('ensures minimum of 10 responses', () => {
      const result = calculateNPS(5);

      expect(result.totalResponses).toBe(10);
    });

    it('score is within valid range', () => {
      const result = calculateNPS(100);

      expect(result.score).toBeGreaterThanOrEqual(-100);
      expect(result.score).toBeLessThanOrEqual(100);
    });
  });

  describe('identifyPatientsAtRisk', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2025-01-15T12:00:00Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('returns empty array for no patients', () => {
      const result = identifyPatientsAtRisk([], []);
      expect(result).toEqual([]);
    });

    it('identifies medium risk for 90-180 days no return', () => {
      const patients = [createPatient({ id: 'p1', name: 'Risk Patient' })];
      const appointments = [
        createAppointment({
          patientId: 'p1',
          date: '2024-10-15', // 92 days ago
        }),
      ];

      const result = identifyPatientsAtRisk(patients, appointments);

      expect(result.length).toBe(1);
      expect(result[0].riskLevel).toBe('medium');
      expect(result[0].reason).toBe('no_return');
    });

    it('identifies high risk for 180+ days no return', () => {
      const patients = [createPatient({ id: 'p1', name: 'High Risk Patient' })];
      const appointments = [
        createAppointment({
          patientId: 'p1',
          date: '2024-06-15', // ~7 months ago
        }),
      ];

      const result = identifyPatientsAtRisk(patients, appointments);

      expect(result.length).toBe(1);
      expect(result[0].riskLevel).toBe('high');
    });

    it('identifies risk for missed appointments', () => {
      const patients = [createPatient({ id: 'p1', name: 'No Show Patient' })];
      const appointments = [
        createAppointment({ patientId: 'p1', status: Status.NO_SHOW }),
        createAppointment({ patientId: 'p1', status: Status.CANCELED }),
      ];

      const result = identifyPatientsAtRisk(patients, appointments);

      expect(result.length).toBe(1);
      expect(result[0].reason).toBe('missed_appointments');
    });

    it('sorts by risk level (high first)', () => {
      const patients = [
        createPatient({ id: 'p1', name: 'Medium Risk' }),
        createPatient({ id: 'p2', name: 'High Risk' }),
      ];
      const appointments = [
        createAppointment({ patientId: 'p1', date: '2024-10-15' }), // medium
        createAppointment({ patientId: 'p2', date: '2024-06-01' }), // high
      ];

      const result = identifyPatientsAtRisk(patients, appointments);

      expect(result[0].riskLevel).toBe('high');
      expect(result[1].riskLevel).toBe('medium');
    });

    it('limits results to 10', () => {
      const patients = Array.from({ length: 15 }, (_, i) =>
        createPatient({ id: `p${i}`, name: `Patient ${i}` })
      );
      const appointments = patients.map((p) =>
        createAppointment({ patientId: p.id, date: '2024-06-01' })
      );

      const result = identifyPatientsAtRisk(patients, appointments);

      expect(result.length).toBe(10);
    });
  });

  describe('calculateEngagement', () => {
    it('returns zeros for empty appointments', () => {
      const result = calculateEngagement([]);

      expect(result.appointmentConfirmationRate).toBe(0);
      expect(result.noShowRate).toBe(0);
    });

    it('calculates confirmation rate', () => {
      const appointments = [
        createAppointment({ status: Status.CONFIRMED }),
        createAppointment({ status: Status.FINISHED }),
        createAppointment({ status: Status.CANCELED }),
        createAppointment({ status: Status.NO_SHOW }),
      ];

      const result = calculateEngagement(appointments);

      // 2 confirmed/finished out of 4 = 50%
      expect(result.appointmentConfirmationRate).toBe(50);
    });

    it('calculates no-show rate', () => {
      const appointments = [
        createAppointment({ status: Status.FINISHED }),
        createAppointment({ status: Status.NO_SHOW }),
        createAppointment({ status: Status.FINISHED }),
        createAppointment({ status: Status.NO_SHOW }),
      ];

      const result = calculateEngagement(appointments);

      // 2 no-shows out of 4 = 50%
      expect(result.noShowRate).toBe(50);
    });

    it('tracks time of day distribution', () => {
      const result = calculateEngagement([]);

      expect(result.byTimeOfDay).toHaveLength(3);
      expect(result.byTimeOfDay[0].period).toContain('Manhã');
      expect(result.byTimeOfDay[1].period).toContain('Tarde');
      expect(result.byTimeOfDay[2].period).toContain('Noite');
    });

    it('includes communication channels', () => {
      const result = calculateEngagement([]);

      expect(result.communicationChannels.length).toBeGreaterThan(0);
      expect(result.communicationChannels.find((c) => c.channel === 'WhatsApp')).toBeDefined();
    });
  });

  describe('calculateDemographics', () => {
    it('returns empty structure for no patients', () => {
      const result = calculateDemographics([]);

      expect(result.byAge).toHaveLength(5);
      expect(result.byGender).toHaveLength(3);
      expect(result.byInsurance).toHaveLength(0);
    });

    it('calculates age distribution', () => {
      const patients = [
        createPatient({ birthDate: '2020-01-01' }), // 5 years old - 0-17
        createPatient({ birthDate: '2000-01-01' }), // 25 years old - 18-30
        createPatient({ birthDate: '1985-01-01' }), // 40 years old - 31-45
      ];

      const result = calculateDemographics(patients);

      expect(result.byAge.find((a) => a.range === '0-17')?.count).toBe(1);
      expect(result.byAge.find((a) => a.range === '18-30')?.count).toBe(1);
      expect(result.byAge.find((a) => a.range === '31-45')?.count).toBe(1);
    });

    it('calculates gender distribution', () => {
      const patients = [
        createPatient({ gender: 'male' }),
        createPatient({ gender: 'male' }),
        createPatient({ gender: 'female' }),
      ];

      const result = calculateDemographics(patients);

      expect(result.byGender.find((g) => g.gender === 'Masculino')?.count).toBe(2);
      expect(result.byGender.find((g) => g.gender === 'Feminino')?.count).toBe(1);
    });

    it('calculates insurance distribution', () => {
      const patients = [
        createPatient({ insurance: 'Unimed' }),
        createPatient({ insurance: 'Unimed' }),
        createPatient({ insurance: 'Bradesco' }),
        createPatient({}), // No insurance = Particular
      ];

      const result = calculateDemographics(patients);

      expect(result.byInsurance.find((i) => i.insurance === 'Unimed')?.count).toBe(2);
      expect(result.byInsurance.find((i) => i.insurance === 'Bradesco')?.count).toBe(1);
      expect(result.byInsurance.find((i) => i.insurance === 'Particular')?.count).toBe(1);
    });

    it('sorts insurance by count and limits to 5', () => {
      const insurances = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
      const patients = insurances.flatMap((ins, i) =>
        Array.from({ length: 10 - i }, () => createPatient({ insurance: ins }))
      );

      const result = calculateDemographics(patients);

      expect(result.byInsurance.length).toBe(5);
      expect(result.byInsurance[0].insurance).toBe('A'); // Most common
    });

    it('calculates percentages correctly', () => {
      const patients = [
        createPatient({ gender: 'male' }),
        createPatient({ gender: 'male' }),
        createPatient({ gender: 'male' }),
        createPatient({ gender: 'female' }),
      ];

      const result = calculateDemographics(patients);

      expect(result.byGender.find((g) => g.gender === 'Masculino')?.percentage).toBe(75);
      expect(result.byGender.find((g) => g.gender === 'Feminino')?.percentage).toBe(25);
    });
  });
});