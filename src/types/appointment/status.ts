/**
 * Appointment Status Types
 *
 * Status enums and reminder types for appointment scheduling.
 */

export enum Status {
  CONFIRMED = 'Confirmado',
  PENDING = 'Pendente',
  ARRIVED = 'Chegou',
  IN_PROGRESS = 'Atendendo',
  FINISHED = 'Finalizado',
  CANCELED = 'Cancelado',
  NO_SHOW = 'Faltou'
}

/**
 * WhatsApp reminder status for appointments.
 */
export type ReminderStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
