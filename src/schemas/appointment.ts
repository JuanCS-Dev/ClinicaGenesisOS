/**
 * Appointment Schema
 *
 * Zod validation schema for appointment data.
 *
 * @module schemas/appointment
 */

import { z } from 'zod'

// =============================================================================
// APPOINTMENT STATUS
// =============================================================================

export const AppointmentStatusSchema = z.enum([
  'Confirmado',
  'Pendente',
  'Chegou',
  'Atendendo',
  'Finalizado',
  'Cancelado',
  'Faltou',
])

export const ReminderStatusSchema = z.enum(['pending', 'sent', 'delivered', 'read', 'failed'])

// =============================================================================
// RECURRENCE SCHEMAS
// =============================================================================

export const RecurrenceFrequencySchema = z.enum(['daily', 'weekly', 'biweekly', 'monthly'])

export const RecurrencePatternSchema = z.object({
  frequency: RecurrenceFrequencySchema,
  endDate: z.string().datetime().nullable(),
  daysOfWeek: z.array(z.number().int().min(0).max(6)).optional(),
})

// =============================================================================
// REMINDER SCHEMAS
// =============================================================================

const ReminderTrackingSchema = z.object({
  status: ReminderStatusSchema,
  sentAt: z.string().datetime().optional(),
  messageId: z.string().optional(),
  usedTemplate: z.boolean().optional(),
})

const PatientResponseSchema = z.object({
  confirmed: z.boolean().optional(),
  respondedAt: z.string().datetime(),
  message: z.string().max(1000).optional(),
  needsReschedule: z.boolean().optional(),
})

const AppointmentReminderSchema = z.object({
  confirmation: ReminderTrackingSchema.optional(),
  reminder24h: ReminderTrackingSchema.optional(),
  reminder2h: ReminderTrackingSchema.optional(),
  lastInteraction: z.string().datetime().optional(),
  patientResponse: PatientResponseSchema.optional(),
})

// =============================================================================
// SPECIALTY TYPES
// =============================================================================

export const SpecialtySchema = z.enum(['medicina', 'nutricao', 'psicologia'])

// =============================================================================
// APPOINTMENT SCHEMAS
// =============================================================================

/**
 * Schema for creating a new appointment.
 */
export const CreateAppointmentSchema = z.object({
  patientId: z.string().min(1, 'ID do paciente é obrigatório'),

  patientName: z.string().min(2, 'Nome do paciente deve ter pelo menos 2 caracteres').max(255),

  patientPhone: z
    .string()
    .regex(/^\d{10,11}$/, 'Telefone deve ter 10 ou 11 dígitos')
    .optional(),

  date: z
    .string()
    .datetime({ message: 'Data inválida' })
    .refine(date => new Date(date) > new Date(Date.now() - 24 * 60 * 60 * 1000), {
      message: 'Data do agendamento não pode ser no passado distante',
    }),

  durationMin: z
    .number()
    .int()
    .min(5, 'Duração mínima é 5 minutos')
    .max(480, 'Duração máxima é 8 horas'),

  procedure: z
    .string()
    .min(1, 'Procedimento é obrigatório')
    .max(200, 'Procedimento deve ter no máximo 200 caracteres'),

  status: AppointmentStatusSchema.default('Pendente'),

  professional: z.string().min(1, 'Profissional é obrigatório').max(255),

  specialty: SpecialtySchema,

  notes: z.string().max(2000, 'Notas devem ter no máximo 2000 caracteres').optional(),

  recurrence: RecurrencePatternSchema.optional(),

  recurrenceParentId: z.string().optional(),
})

/**
 * Full appointment record schema.
 */
export const AppointmentSchema = CreateAppointmentSchema.extend({
  id: z.string().min(1, 'ID é obrigatório'),
  reminder: AppointmentReminderSchema.optional(),
})

/**
 * Schema for updating an appointment.
 */
export const UpdateAppointmentSchema = CreateAppointmentSchema.partial()

// =============================================================================
// TYPE INFERENCE
// =============================================================================

export type AppointmentStatus = z.infer<typeof AppointmentStatusSchema>
export type ReminderStatus = z.infer<typeof ReminderStatusSchema>
export type RecurrenceFrequency = z.infer<typeof RecurrenceFrequencySchema>
export type RecurrencePattern = z.infer<typeof RecurrencePatternSchema>
export type Specialty = z.infer<typeof SpecialtySchema>
export type CreateAppointmentInput = z.infer<typeof CreateAppointmentSchema>
export type Appointment = z.infer<typeof AppointmentSchema>
export type UpdateAppointmentInput = z.infer<typeof UpdateAppointmentSchema>

// =============================================================================
// VALIDATION UTILITIES
// =============================================================================

export function validateCreateAppointment(data: unknown) {
  return CreateAppointmentSchema.safeParse(data)
}

export function validateUpdateAppointment(data: unknown) {
  return UpdateAppointmentSchema.safeParse(data)
}

export function validateAppointment(data: unknown) {
  return AppointmentSchema.safeParse(data)
}
