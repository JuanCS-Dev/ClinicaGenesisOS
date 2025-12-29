/**
 * Patient Schema
 *
 * Zod validation schema for patient data.
 * Use safeParse() for validation, z.infer for type inference.
 *
 * @module schemas/patient
 */

import { z } from 'zod'

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

/**
 * Brazilian CPF validation regex (11 digits).
 * Note: This validates format only, not the check digits.
 * For full validation, use a dedicated CPF library.
 */
const cpfRegex = /^\d{11}$/

/**
 * Brazilian phone regex (10-11 digits).
 * Accepts: 11999999999 or 1199999999
 */
const brazilianPhoneRegex = /^\d{10,11}$/

// =============================================================================
// PATIENT SCHEMAS
// =============================================================================

/**
 * Schema for creating a new patient.
 * Does not include auto-generated fields (id, createdAt, age).
 */
export const CreatePatientSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(255, 'Nome deve ter no máximo 255 caracteres')
    .transform(name => name.trim()),

  birthDate: z
    .string()
    .datetime({ message: 'Data de nascimento inválida' })
    .refine(date => new Date(date) <= new Date(), {
      message: 'Data de nascimento não pode ser no futuro',
    }),

  phone: z
    .string()
    .regex(brazilianPhoneRegex, 'Telefone deve ter 10 ou 11 dígitos')
    .transform(phone => phone.replace(/\D/g, '')),

  email: z
    .string()
    .email('Email inválido')
    .max(255)
    .transform(email => email.toLowerCase().trim()),

  gender: z.enum(['Masculino', 'Feminino', 'Outro', 'Prefiro não informar'], {
    error: 'Gênero inválido',
  }),

  avatar: z.string().url('URL do avatar inválida').optional(),

  address: z.string().max(500, 'Endereço deve ter no máximo 500 caracteres').optional(),

  insurance: z.string().max(100).optional(),

  insuranceNumber: z.string().max(50).optional(),

  tags: z.array(z.string().max(50)).max(20, 'Máximo de 20 tags').default([]),

  cpf: z
    .string()
    .regex(cpfRegex, 'CPF deve ter 11 dígitos')
    .transform(cpf => cpf.replace(/\D/g, ''))
    .optional(),

  nextAppointment: z.string().datetime().optional(),
})

/**
 * Schema for a full patient record (including auto-generated fields).
 */
export const PatientSchema = CreatePatientSchema.extend({
  id: z.string().min(1, 'ID é obrigatório'),
  age: z.number().int().min(0).max(150),
  createdAt: z.string().datetime(),
})

/**
 * Schema for updating a patient (all fields optional).
 */
export const UpdatePatientSchema = CreatePatientSchema.partial()

// =============================================================================
// TYPE INFERENCE
// =============================================================================

export type CreatePatientInput = z.infer<typeof CreatePatientSchema>
export type Patient = z.infer<typeof PatientSchema>
export type UpdatePatientInput = z.infer<typeof UpdatePatientSchema>

// =============================================================================
// VALIDATION UTILITIES
// =============================================================================

/**
 * Validate patient creation data.
 * Returns either validated data or error details.
 */
export function validateCreatePatient(data: unknown) {
  return CreatePatientSchema.safeParse(data)
}

/**
 * Validate patient update data.
 */
export function validateUpdatePatient(data: unknown) {
  return UpdatePatientSchema.safeParse(data)
}

/**
 * Validate a full patient record.
 */
export function validatePatient(data: unknown) {
  return PatientSchema.safeParse(data)
}
