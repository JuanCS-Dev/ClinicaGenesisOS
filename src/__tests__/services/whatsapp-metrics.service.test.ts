/**
 * WhatsApp Metrics Service Tests
 */
import { describe, it, expect } from 'vitest';
import {
  calculateWhatsAppMetrics,
  formatPercent,
  getStatusColor,
  type WhatsAppMetrics,
} from '../../services/whatsapp-metrics.service';
import { Status, type Appointment, type ReminderStatus } from '../../types';

// Helper to create test appointment
function createAppointment(overrides: Partial<Appointment> = {}): Appointment {
  return {
    id: `apt-${Math.random()}`,
    clinicId: 'clinic-1',
    patientId: 'patient-1',
    patientName: 'Test Patient',
    date: '2025-01-15',
    startTime: '09:00',
    endTime: '09:30',
    status: Status.CONFIRMED,
    professionalId: 'prof-1',
    professionalName: 'Dr. Test',
    procedure: 'Consulta',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  } as Appointment;
}

describe('whatsapp-metrics.service', () => {
  describe('calculateWhatsAppMetrics', () => {
    it('returns zero metrics for empty appointments', () => {
      const metrics = calculateWhatsAppMetrics([]);

      expect(metrics.totalSent).toBe(0);
      expect(metrics.totalDelivered).toBe(0);
      expect(metrics.totalRead).toBe(0);
      expect(metrics.totalFailed).toBe(0);
      expect(metrics.deliveryRate).toBe(0);
      expect(metrics.readRate).toBe(0);
    });

    it('returns zero metrics for appointments without reminders', () => {
      const appointments = [
        createAppointment(),
        createAppointment(),
      ];
      const metrics = calculateWhatsAppMetrics(appointments);

      expect(metrics.totalSent).toBe(0);
      expect(metrics.confirmation.total).toBe(0);
      expect(metrics.reminder24h.total).toBe(0);
    });

    it('counts confirmation status correctly', () => {
      const appointments = [
        createAppointment({
          reminder: {
            confirmation: { status: 'sent' as ReminderStatus, sentAt: new Date().toISOString() },
          },
        }),
        createAppointment({
          reminder: {
            confirmation: { status: 'delivered' as ReminderStatus, sentAt: new Date().toISOString() },
          },
        }),
        createAppointment({
          reminder: {
            confirmation: { status: 'read' as ReminderStatus, sentAt: new Date().toISOString() },
          },
        }),
      ];
      const metrics = calculateWhatsAppMetrics(appointments);

      expect(metrics.confirmation.sent).toBe(1);
      expect(metrics.confirmation.delivered).toBe(1);
      expect(metrics.confirmation.read).toBe(1);
      expect(metrics.confirmation.total).toBe(3);
    });

    it('counts 24h reminder status correctly', () => {
      const appointments = [
        createAppointment({
          reminder: {
            reminder24h: { status: 'sent' as ReminderStatus, sentAt: new Date().toISOString() },
          },
        }),
        createAppointment({
          reminder: {
            reminder24h: { status: 'failed' as ReminderStatus, sentAt: new Date().toISOString() },
          },
        }),
      ];
      const metrics = calculateWhatsAppMetrics(appointments);

      expect(metrics.reminder24h.sent).toBe(1);
      expect(metrics.reminder24h.failed).toBe(1);
      expect(metrics.reminder24h.total).toBe(2);
    });

    it('counts patient confirmations', () => {
      const appointments = [
        createAppointment({
          reminder: {
            patientResponse: { confirmed: true },
          },
        }),
        createAppointment({
          reminder: {
            patientResponse: { confirmed: true },
          },
        }),
      ];
      const metrics = calculateWhatsAppMetrics(appointments);

      expect(metrics.totalConfirmed).toBe(2);
    });

    it('counts reschedule requests', () => {
      const appointments = [
        createAppointment({
          reminder: {
            patientResponse: { needsReschedule: true },
          },
        }),
      ];
      const metrics = calculateWhatsAppMetrics(appointments);

      expect(metrics.totalNeedReschedule).toBe(1);
    });

    it('tracks no-shows with and without reminders', () => {
      const appointments = [
        createAppointment({ status: Status.NO_SHOW }), // No reminder
        createAppointment({
          status: Status.NO_SHOW,
          reminder: { confirmation: { status: 'sent' as ReminderStatus, sentAt: new Date().toISOString() } },
        }), // With reminder
      ];
      const metrics = calculateWhatsAppMetrics(appointments);

      expect(metrics.noShowsWithoutReminder).toBe(1);
      expect(metrics.noShowsWithReminder).toBe(1);
    });

    it('calculates delivery rate correctly', () => {
      const appointments = [
        createAppointment({
          reminder: {
            reminder24h: { status: 'sent' as ReminderStatus, sentAt: new Date().toISOString() },
          },
        }),
        createAppointment({
          reminder: {
            reminder24h: { status: 'delivered' as ReminderStatus, sentAt: new Date().toISOString() },
          },
        }),
      ];
      const metrics = calculateWhatsAppMetrics(appointments);

      // 1 sent + 1 delivered = 2 total sent, 1 delivered
      expect(metrics.deliveryRate).toBe(50);
    });

    it('generates daily stats', () => {
      const appointments = [
        createAppointment({
          date: '2025-01-15',
          reminder: {
            reminder24h: { status: 'delivered' as ReminderStatus, sentAt: new Date().toISOString() },
            patientResponse: { confirmed: true },
          },
        }),
        createAppointment({
          date: '2025-01-16',
          reminder: {
            reminder24h: { status: 'sent' as ReminderStatus, sentAt: new Date().toISOString() },
          },
        }),
      ];
      const metrics = calculateWhatsAppMetrics(appointments);

      expect(metrics.dailyStats.length).toBe(2);
      expect(metrics.dailyStats[0].date).toBe('2025-01-15');
      expect(metrics.dailyStats[0].confirmed).toBe(1);
      expect(metrics.dailyStats[1].date).toBe('2025-01-16');
    });

    it('handles failed reminders', () => {
      const appointments = [
        createAppointment({
          reminder: {
            confirmation: { status: 'failed' as ReminderStatus, sentAt: new Date().toISOString() },
          },
        }),
      ];
      const metrics = calculateWhatsAppMetrics(appointments);

      expect(metrics.totalFailed).toBe(1);
      expect(metrics.confirmation.failed).toBe(1);
    });

    it('handles pending reminders', () => {
      const appointments = [
        createAppointment({
          reminder: {
            confirmation: { status: 'pending' as ReminderStatus, sentAt: new Date().toISOString() },
          },
        }),
      ];
      const metrics = calculateWhatsAppMetrics(appointments);

      expect(metrics.confirmation.pending).toBe(1);
      expect(metrics.confirmation.total).toBe(1);
    });
  });

  describe('formatPercent', () => {
    it('formats integer percentage', () => {
      expect(formatPercent(50)).toBe('50.0%');
    });

    it('formats decimal percentage', () => {
      expect(formatPercent(75.5)).toBe('75.5%');
    });

    it('formats zero', () => {
      expect(formatPercent(0)).toBe('0.0%');
    });

    it('formats 100%', () => {
      expect(formatPercent(100)).toBe('100.0%');
    });

    it('rounds to 1 decimal place', () => {
      expect(formatPercent(33.333)).toBe('33.3%');
    });
  });

  describe('getStatusColor', () => {
    it('returns blue for read status', () => {
      const color = getStatusColor('read');
      expect(color).toContain('text-blue-600');
      expect(color).toContain('bg-blue-50');
    });

    it('returns green for delivered status', () => {
      const color = getStatusColor('delivered');
      expect(color).toContain('text-green-600');
      expect(color).toContain('bg-green-50');
    });

    it('returns amber for sent status', () => {
      const color = getStatusColor('sent');
      expect(color).toContain('text-amber-600');
      expect(color).toContain('bg-amber-50');
    });

    it('returns red for failed status', () => {
      const color = getStatusColor('failed');
      expect(color).toContain('text-red-600');
      expect(color).toContain('bg-red-50');
    });

    it('returns muted for pending status', () => {
      const color = getStatusColor('pending');
      expect(color).toContain('text-genesis-muted');
      expect(color).toContain('bg-genesis-soft');
    });
  });
});
