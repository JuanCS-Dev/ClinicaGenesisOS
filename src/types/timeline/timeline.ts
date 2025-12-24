/**
 * Timeline Types
 *
 * Types for patient timeline events and anthropometry data.
 */

export enum TimelineEventType {
  CONSULTATION = 'Consulta',
  EXAM = 'Exame',
  PRESCRIPTION = 'Prescrição',
  PHOTO = 'Foto',
  PAYMENT = 'Pagamento'
}

export interface TimelineEvent {
  id: string;
  date: Date;
  type: TimelineEventType;
  title: string;
  description: string;
  details?: string;
}

export interface AnthropometryData {
  date: string;
  weight: number;
  height: number;
  imc: number;
  waist: number;
  hip: number;
  bodyFat: number;
}
