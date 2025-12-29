/**
 * Payment Schema
 *
 * Zod validation schema for payment data (PIX, Boleto).
 *
 * @module schemas/payment
 */

import { z } from 'zod'

// =============================================================================
// PAYMENT ENUMS
// =============================================================================

export const PaymentMethodSchema = z.enum(['pix', 'boleto'])

export const PaymentDisplayStatusSchema = z.enum([
  'awaiting_payment',
  'processing',
  'paid',
  'expired',
  'failed',
  'refunded',
])

export const PixKeyTypeSchema = z.enum(['cpf', 'cnpj', 'email', 'phone', 'random'])

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

/**
 * Brazilian CPF/CNPJ validation regex.
 * CPF: 11 digits, CNPJ: 14 digits
 */
const taxIdRegex = /^\d{11}$|^\d{14}$/

/**
 * Brazilian postal code regex (CEP).
 */
const postalCodeRegex = /^\d{8}$/

// =============================================================================
// ADDRESS SCHEMA
// =============================================================================

export const CustomerAddressSchema = z.object({
  line1: z.string().min(5, 'Endereço deve ter pelo menos 5 caracteres').max(200),
  city: z.string().min(2, 'Cidade é obrigatória').max(100),
  state: z.string().length(2, 'Estado deve ter 2 caracteres (UF)'),
  postalCode: z
    .string()
    .regex(postalCodeRegex, 'CEP deve ter 8 dígitos')
    .transform(cep => cep.replace(/\D/g, '')),
  country: z.string().default('BR'),
})

// =============================================================================
// PAYMENT INPUT SCHEMAS
// =============================================================================

/**
 * Schema for creating a PIX payment.
 * Minimum amount: R$ 5.00 (500 cents)
 * Maximum amount: R$ 1,000,000 (100M cents)
 */
export const CreatePaymentInputSchema = z.object({
  method: PaymentMethodSchema,

  amount: z
    .number()
    .int('Valor deve ser inteiro (em centavos)')
    .min(500, 'Valor mínimo é R$ 5,00')
    .max(100000000, 'Valor máximo é R$ 1.000.000,00'),

  description: z
    .string()
    .min(1, 'Descrição é obrigatória')
    .max(500, 'Descrição deve ter no máximo 500 caracteres'),

  patientId: z.string().optional(),
  patientName: z.string().max(255).optional(),
  appointmentId: z.string().optional(),
  transactionId: z.string().optional(),

  customerEmail: z.string().email('Email inválido').optional(),

  customerTaxId: z
    .string()
    .regex(taxIdRegex, 'CPF (11 dígitos) ou CNPJ (14 dígitos) inválido')
    .transform(id => id.replace(/\D/g, ''))
    .optional(),

  customerName: z.string().min(2).max(255).optional(),

  customerAddress: CustomerAddressSchema.optional(),

  expirationMinutes: z
    .number()
    .int()
    .min(1, 'Expiração mínima é 1 minuto')
    .max(43200, 'Expiração máxima é 30 dias')
    .optional(),
})

/**
 * Schema for Boleto payments (requires more customer info).
 */
export const CreateBoletoPaymentSchema = CreatePaymentInputSchema.extend({
  method: z.literal('boleto'),
  customerTaxId: z
    .string()
    .regex(taxIdRegex, 'CPF ou CNPJ é obrigatório para Boleto')
    .transform(id => id.replace(/\D/g, '')),
  customerName: z.string().min(2, 'Nome é obrigatório para Boleto').max(255),
  customerAddress: CustomerAddressSchema.refine(() => true, {
    message: 'Endereço é obrigatório para Boleto',
  }),
})

// =============================================================================
// PIX CONFIG SCHEMA
// =============================================================================

export const ClinicPixConfigSchema = z.object({
  pixKey: z.string().min(1, 'Chave PIX é obrigatória').max(100),
  pixKeyType: PixKeyTypeSchema,
  receiverName: z
    .string()
    .min(1, 'Nome do recebedor é obrigatório')
    .max(25, 'Nome deve ter no máximo 25 caracteres'),
  receiverCity: z
    .string()
    .min(1, 'Cidade é obrigatória')
    .max(15, 'Cidade deve ter no máximo 15 caracteres'),
  enabled: z.boolean(),
})

// =============================================================================
// PAYMENT RECORD SCHEMA
// =============================================================================

export const PaymentRecordSchema = z.object({
  id: z.string().min(1),
  stripePaymentIntentId: z.string().min(1),
  clinicId: z.string().min(1),
  amount: z.number().int().min(0),
  currency: z.string().default('brl'),
  status: PaymentDisplayStatusSchema,
  method: PaymentMethodSchema,
  customerEmail: z.string().email().optional(),
  patientId: z.string().optional(),
  patientName: z.string().optional(),
  appointmentId: z.string().optional(),
  transactionId: z.string().optional(),
  description: z.string(),
  receiptUrl: z.string().url().optional(),
  refundAmount: z.number().int().min(0).optional(),
  failureReason: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  paidAt: z.string().datetime().optional(),
  createdBy: z.string().min(1),
})

// =============================================================================
// TYPE INFERENCE
// =============================================================================

export type PaymentMethod = z.infer<typeof PaymentMethodSchema>
export type PaymentDisplayStatus = z.infer<typeof PaymentDisplayStatusSchema>
export type PixKeyType = z.infer<typeof PixKeyTypeSchema>
export type CustomerAddress = z.infer<typeof CustomerAddressSchema>
export type CreatePaymentInput = z.infer<typeof CreatePaymentInputSchema>
export type CreateBoletoPayment = z.infer<typeof CreateBoletoPaymentSchema>
export type ClinicPixConfig = z.infer<typeof ClinicPixConfigSchema>
export type PaymentRecord = z.infer<typeof PaymentRecordSchema>

// =============================================================================
// VALIDATION UTILITIES
// =============================================================================

export function validateCreatePayment(data: unknown) {
  return CreatePaymentInputSchema.safeParse(data)
}

export function validateBoletoPayment(data: unknown) {
  return CreateBoletoPaymentSchema.safeParse(data)
}

export function validatePixConfig(data: unknown) {
  return ClinicPixConfigSchema.safeParse(data)
}

export function validatePaymentRecord(data: unknown) {
  return PaymentRecordSchema.safeParse(data)
}
