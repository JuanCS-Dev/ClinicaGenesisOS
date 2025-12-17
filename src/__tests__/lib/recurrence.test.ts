/**
 * Tests for Recurrence Utility Functions
 *
 * Verifies the correct expansion of recurring appointments.
 */

import { describe, it, expect } from 'vitest';
import {
  expandRecurringAppointment,
  expandRecurringAppointments,
  isRecurringInstance,
  isRecurringParent,
  getParentId,
} from '@/lib/recurrence';
import { Status, type Appointment } from '@/types';

/**
 * Helper to create a UTC date string for testing.
 * Creates dates at noon UTC to avoid timezone boundary issues.
 */
function createUTCDate(dateStr: string, hour = 10, minute = 0): string {
  return `${dateStr}T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00.000Z`;
}

/**
 * Helper to create a test appointment.
 */
function createTestAppointment(overrides: Partial<Appointment> = {}): Appointment {
  return {
    id: 'apt-1',
    patientId: 'patient-1',
    patientName: 'Test Patient',
    date: createUTCDate('2024-01-15'),
    durationMin: 60,
    procedure: 'Consulta',
    status: Status.CONFIRMED,
    professional: 'Dr. Test',
    specialty: 'medicina',
    ...overrides,
  };
}

describe('recurrence utility', () => {
  describe('expandRecurringAppointment', () => {
    it('returns original appointment if no recurrence pattern', () => {
      const appointment = createTestAppointment();
      const rangeStart = new Date('2024-01-01');
      const rangeEnd = new Date('2024-01-31');

      const result = expandRecurringAppointment(appointment, rangeStart, rangeEnd);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(appointment);
    });

    it('returns empty array if appointment outside range and no recurrence', () => {
      const appointment = createTestAppointment({
        date: createUTCDate('2024-02-15'),
      });
      const rangeStart = new Date('2024-01-01T00:00:00Z');
      const rangeEnd = new Date('2024-01-31T23:59:59Z');

      const result = expandRecurringAppointment(appointment, rangeStart, rangeEnd);

      expect(result).toHaveLength(0);
    });

    it('expands daily recurrence correctly', () => {
      const appointment = createTestAppointment({
        date: createUTCDate('2024-01-15'),
        recurrence: {
          frequency: 'daily',
          endDate: null,
        },
      });
      const rangeStart = new Date('2024-01-15T00:00:00Z');
      const rangeEnd = new Date('2024-01-20T23:59:59Z');

      const result = expandRecurringAppointment(appointment, rangeStart, rangeEnd);

      expect(result).toHaveLength(6); // Jan 15-20 inclusive
      expect(result[0].date).toContain('2024-01-15');
      expect(result[5].date).toContain('2024-01-20');
    });

    it('expands weekly recurrence correctly', () => {
      const appointment = createTestAppointment({
        date: createUTCDate('2024-01-08'), // Monday
        recurrence: {
          frequency: 'weekly',
          endDate: null,
        },
      });
      const rangeStart = new Date('2024-01-01T00:00:00Z');
      const rangeEnd = new Date('2024-01-31T23:59:59Z');

      const result = expandRecurringAppointment(appointment, rangeStart, rangeEnd);

      // Should have 4 Mondays: Jan 8, 15, 22, 29
      expect(result).toHaveLength(4);
      expect(result[0].date).toContain('2024-01-08');
      expect(result[1].date).toContain('2024-01-15');
      expect(result[2].date).toContain('2024-01-22');
      expect(result[3].date).toContain('2024-01-29');
    });

    it('expands biweekly recurrence correctly', () => {
      const appointment = createTestAppointment({
        date: createUTCDate('2024-01-01'),
        recurrence: {
          frequency: 'biweekly',
          endDate: null,
        },
      });
      const rangeStart = new Date('2024-01-01T00:00:00Z');
      const rangeEnd = new Date('2024-01-31T23:59:59Z');

      const result = expandRecurringAppointment(appointment, rangeStart, rangeEnd);

      // Jan 1, Jan 15, Jan 29
      expect(result).toHaveLength(3);
      expect(result[0].date).toContain('2024-01-01');
      expect(result[1].date).toContain('2024-01-15');
      expect(result[2].date).toContain('2024-01-29');
    });

    it('expands monthly recurrence correctly', () => {
      const appointment = createTestAppointment({
        date: createUTCDate('2024-01-15'),
        recurrence: {
          frequency: 'monthly',
          endDate: null,
        },
      });
      const rangeStart = new Date('2024-01-01T00:00:00Z');
      const rangeEnd = new Date('2024-04-30T23:59:59Z');

      const result = expandRecurringAppointment(appointment, rangeStart, rangeEnd);

      // Jan 15, Feb 15, Mar 15, Apr 15
      expect(result).toHaveLength(4);
      expect(result[0].date).toContain('2024-01-15');
      expect(result[1].date).toContain('2024-02-15');
      expect(result[2].date).toContain('2024-03-15');
      expect(result[3].date).toContain('2024-04-15');
    });

    it('respects recurrence end date', () => {
      const appointment = createTestAppointment({
        date: createUTCDate('2024-01-15'),
        recurrence: {
          frequency: 'daily',
          endDate: '2024-01-18T23:59:59Z',
        },
      });
      const rangeStart = new Date('2024-01-15T00:00:00Z');
      const rangeEnd = new Date('2024-01-25T23:59:59Z');

      const result = expandRecurringAppointment(appointment, rangeStart, rangeEnd);

      // Should stop at Jan 18
      expect(result).toHaveLength(4); // Jan 15, 16, 17, 18
      expect(result[result.length - 1].date).toContain('2024-01-18');
    });

    it('preserves original time for all instances', () => {
      const appointment = createTestAppointment({
        date: createUTCDate('2024-01-15', 14, 30),
        recurrence: {
          frequency: 'daily',
          endDate: null,
        },
      });
      const rangeStart = new Date('2024-01-15T00:00:00Z');
      const rangeEnd = new Date('2024-01-17T23:59:59Z');

      const result = expandRecurringAppointment(appointment, rangeStart, rangeEnd);

      result.forEach((instance) => {
        const instanceDate = new Date(instance.date);
        expect(instanceDate.getUTCHours()).toBe(14);
        expect(instanceDate.getUTCMinutes()).toBe(30);
      });
    });

    it('generates unique IDs for each instance', () => {
      const appointment = createTestAppointment({
        date: createUTCDate('2024-01-15'),
        recurrence: {
          frequency: 'daily',
          endDate: null,
        },
      });
      const rangeStart = new Date('2024-01-15T00:00:00Z');
      const rangeEnd = new Date('2024-01-20T23:59:59Z');

      const result = expandRecurringAppointment(appointment, rangeStart, rangeEnd);
      const ids = result.map((r) => r.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(ids.length);
    });

    it('sets recurrenceParentId on all instances', () => {
      const appointment = createTestAppointment({
        id: 'parent-apt',
        date: createUTCDate('2024-01-08'),
        recurrence: {
          frequency: 'weekly',
          endDate: null,
        },
      });
      const rangeStart = new Date('2024-01-01T00:00:00Z');
      const rangeEnd = new Date('2024-01-31T23:59:59Z');

      const result = expandRecurringAppointment(appointment, rangeStart, rangeEnd);

      result.forEach((instance) => {
        expect(instance.recurrenceParentId).toBe('parent-apt');
      });
    });

    it('removes recurrence from instances to prevent infinite expansion', () => {
      const appointment = createTestAppointment({
        date: createUTCDate('2024-01-15'),
        recurrence: {
          frequency: 'daily',
          endDate: null,
        },
      });
      const rangeStart = new Date('2024-01-15T00:00:00Z');
      const rangeEnd = new Date('2024-01-17T23:59:59Z');

      const result = expandRecurringAppointment(appointment, rangeStart, rangeEnd);

      result.forEach((instance) => {
        expect(instance.recurrence).toBeUndefined();
      });
    });

    it('handles weekly recurrence with specific days of week', () => {
      // Weekly recurrence with daysOfWeek currently filters same-weekday occurrences
      // The appointment starts on Monday Jan 1st and repeats weekly (Jan 8, 15, 22, 29)
      // daysOfWeek filter means: only include if the occurrence is on one of those days
      const appointment = createTestAppointment({
        date: createUTCDate('2024-01-01'), // Monday (day 1)
        recurrence: {
          frequency: 'weekly',
          endDate: null,
          daysOfWeek: [1], // Only Mondays
        },
      });
      const rangeStart = new Date('2024-01-01T00:00:00Z');
      const rangeEnd = new Date('2024-01-31T23:59:59Z');

      const result = expandRecurringAppointment(appointment, rangeStart, rangeEnd);

      // Should have 5 Mondays: Jan 1, 8, 15, 22, 29
      expect(result).toHaveLength(5);
      // All should be on Monday
      result.forEach((instance) => {
        expect(new Date(instance.date).getUTCDay()).toBe(1);
      });
    });
  });

  describe('expandRecurringAppointments', () => {
    it('expands multiple recurring appointments', () => {
      const appointments = [
        createTestAppointment({
          id: 'apt-1',
          date: createUTCDate('2024-01-15'),
          recurrence: {
            frequency: 'daily',
            endDate: null,
          },
        }),
        createTestAppointment({
          id: 'apt-2',
          date: createUTCDate('2024-01-16', 11),
          recurrence: {
            frequency: 'daily',
            endDate: null,
          },
        }),
      ];
      const rangeStart = new Date('2024-01-15T00:00:00Z');
      const rangeEnd = new Date('2024-01-17T23:59:59Z');

      const result = expandRecurringAppointments(appointments, rangeStart, rangeEnd);

      // apt-1: Jan 15, 16, 17 = 3 instances
      // apt-2: Jan 16, 17 = 2 instances
      expect(result).toHaveLength(5); // 3 + 2
    });

    it('includes non-recurring appointments in range', () => {
      const appointments = [
        createTestAppointment({ id: 'apt-1', date: createUTCDate('2024-01-15') }),
        createTestAppointment({
          id: 'apt-2',
          date: createUTCDate('2024-02-01'),
        }),
      ];
      const rangeStart = new Date('2024-01-01T00:00:00Z');
      const rangeEnd = new Date('2024-01-31T23:59:59Z');

      const result = expandRecurringAppointments(appointments, rangeStart, rangeEnd);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('apt-1');
    });

    it('skips already-expanded instances', () => {
      const appointments = [
        createTestAppointment({
          id: 'apt-1_20240115',
          date: createUTCDate('2024-01-15'),
          recurrenceParentId: 'apt-1',
        }),
        createTestAppointment({
          id: 'apt-1',
          date: createUTCDate('2024-01-15'),
          recurrence: {
            frequency: 'daily',
            endDate: null,
          },
        }),
      ];
      const rangeStart = new Date('2024-01-15T00:00:00Z');
      const rangeEnd = new Date('2024-01-17T23:59:59Z');

      const result = expandRecurringAppointments(appointments, rangeStart, rangeEnd);

      // Should not include the already-expanded instance
      // Only the new expansion from the parent
      expect(result).toHaveLength(3);
      expect(result.every((r) => r.recurrenceParentId === 'apt-1')).toBe(true);
    });
  });

  describe('helper functions', () => {
    it('isRecurringInstance returns true for instances', () => {
      const instance = createTestAppointment({
        recurrenceParentId: 'parent-id',
      });

      expect(isRecurringInstance(instance)).toBe(true);
    });

    it('isRecurringInstance returns false for regular appointments', () => {
      const appointment = createTestAppointment();

      expect(isRecurringInstance(appointment)).toBe(false);
    });

    it('isRecurringParent returns true for recurring parents', () => {
      const parent = createTestAppointment({
        recurrence: {
          frequency: 'weekly',
          endDate: null,
        },
      });

      expect(isRecurringParent(parent)).toBe(true);
    });

    it('isRecurringParent returns false for regular appointments', () => {
      const appointment = createTestAppointment();

      expect(isRecurringParent(appointment)).toBe(false);
    });

    it('getParentId returns recurrenceParentId for instances', () => {
      const instance = createTestAppointment({
        id: 'instance-id',
        recurrenceParentId: 'parent-id',
      });

      expect(getParentId(instance)).toBe('parent-id');
    });

    it('getParentId returns own id for non-instances', () => {
      const appointment = createTestAppointment({
        id: 'my-id',
      });

      expect(getParentId(appointment)).toBe('my-id');
    });
  });

  describe('edge cases', () => {
    it('handles weekly recurrence without daysOfWeek specified', () => {
      const appointment = createTestAppointment({
        date: createUTCDate('2024-01-15'), // Monday
        recurrence: {
          frequency: 'weekly',
          endDate: null,
          // Note: no daysOfWeek specified
        },
      });
      const rangeStart = new Date('2024-01-15T00:00:00Z');
      const rangeEnd = new Date('2024-01-31T23:59:59Z');

      const result = expandRecurringAppointment(appointment, rangeStart, rangeEnd);

      // Without daysOfWeek, should create instances on all days of range (weekly step)
      // Jan 15, 22, 29 = 3 instances
      expect(result).toHaveLength(3);
    });

    it('handles weekly recurrence with empty daysOfWeek array', () => {
      const appointment = createTestAppointment({
        date: createUTCDate('2024-01-15'), // Monday
        recurrence: {
          frequency: 'weekly',
          endDate: null,
          daysOfWeek: [], // Empty array
        },
      });
      const rangeStart = new Date('2024-01-15T00:00:00Z');
      const rangeEnd = new Date('2024-01-31T23:59:59Z');

      const result = expandRecurringAppointment(appointment, rangeStart, rangeEnd);

      // With empty daysOfWeek, should still generate instances (all days allowed)
      expect(result).toHaveLength(3);
    });

    it('handles unknown frequency type gracefully', () => {
      const appointment = createTestAppointment({
        date: createUTCDate('2024-01-15'),
        recurrence: {
          frequency: 'unknown' as 'daily', // Cast to bypass TypeScript
          endDate: null,
        },
      });
      const rangeStart = new Date('2024-01-15T00:00:00Z');
      const rangeEnd = new Date('2024-01-17T23:59:59Z');

      const result = expandRecurringAppointment(appointment, rangeStart, rangeEnd);

      // Unknown frequency defaults to daily behavior
      expect(result).toHaveLength(3);
    });
  });
});
