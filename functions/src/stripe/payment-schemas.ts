/**
 * Payment Validation Schemas
 * ==========================
 *
 * Zod schemas for runtime validation of payment inputs.
 * Provides type-safe validation with detailed error messages.
 *
 * @module functions/stripe/payment-schemas
 */

import { z } from 'zod'
import { MIN_PIX_AMOUNT, MAX_PIX_AMOUNT, MIN_BOLETO_AMOUNT, MAX_BOLETO_AMOUNT } from './config.js'

/**
 * Brazilian address schema for Boleto.
 */
export const CustomerAddressSchema = z.object({
  line1: z.string().min(1, 'Endereço é obrigatório'),
  city: z.string().min(1, 'Cidade é obrigatória'),
  state: z.string().length(2, 'Estado deve ter 2 caracteres (UF)'),
  postalCode: z.string().regex(/^\d{8}$/, 'CEP deve ter 8 dígitos'),
  country: z.string().default('BR'),
})

/**
 * Base payment input schema with common fields.
 */
const BasePaymentInputSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória').max(500),
  patientId: z.string().optional(),
  patientName: z.string().max(255).optional(),
  appointmentId: z.string().optional(),
  transactionId: z.string().optional(),
  customerEmail: z.string().email('Email inválido').optional(),
  expirationMinutes: z.number().int().positive().optional(),
})

/**
 * PIX payment input schema.
 */
export const CreatePixPaymentInputSchema = BasePaymentInputSchema.extend({
  amount: z
    .number()
    .int('Valor deve ser em centavos (inteiro)')
    .min(MIN_PIX_AMOUNT, `Valor mínimo: R$ ${(MIN_PIX_AMOUNT / 100).toFixed(2)}`)
    .max(MAX_PIX_AMOUNT, `Valor máximo: R$ ${(MAX_PIX_AMOUNT / 100).toFixed(2)}`),
})

/**
 * Boleto payment input schema with required customer info.
 */
export const CreateBoletoPaymentInputSchema = BasePaymentInputSchema.extend({
  amount: z
    .number()
    .int('Valor deve ser em centavos (inteiro)')
    .min(MIN_BOLETO_AMOUNT, `Valor mínimo: R$ ${(MIN_BOLETO_AMOUNT / 100).toFixed(2)}`)
    .max(MAX_BOLETO_AMOUNT, `Valor máximo: R$ ${(MAX_BOLETO_AMOUNT / 100).toFixed(2)}`),
  customerEmail: z.string().email('Email é obrigatório para Boleto'),
  customerName: z.string().min(1, 'Nome do cliente é obrigatório para Boleto').max(255),
  customerTaxId: z
    .string()
    .regex(/^\d{11}$|^\d{14}$/, 'CPF deve ter 11 dígitos ou CNPJ 14 dígitos'),
  customerAddress: CustomerAddressSchema,
})

/**
 * Request schema for createPixPayment.
 */
export const CreatePixPaymentRequestSchema = z.object({
  clinicId: z.string().min(1, 'clinicId é obrigatório'),
  input: CreatePixPaymentInputSchema,
})

/**
 * Request schema for createBoletoPayment.
 */
export const CreateBoletoPaymentRequestSchema = z.object({
  clinicId: z.string().min(1, 'clinicId é obrigatório'),
  input: CreateBoletoPaymentInputSchema,
})

/**
 * Request schema for cancel payment operations.
 */
export const CancelPaymentRequestSchema = z.object({
  clinicId: z.string().min(1, 'clinicId é obrigatório'),
  paymentId: z.string().min(1, 'paymentId é obrigatório'),
})

/**
 * Request schema for refund operations.
 */
export const RefundPaymentRequestSchema = z.object({
  clinicId: z.string().min(1, 'clinicId é obrigatório'),
  paymentId: z.string().min(1, 'paymentId é obrigatório'),
  amount: z.number().int().positive().optional(),
})

/**
 * Type inference from schemas.
 */
export type CreatePixPaymentInput = z.infer<typeof CreatePixPaymentInputSchema>
export type CreateBoletoPaymentInput = z.infer<typeof CreateBoletoPaymentInputSchema>
export type CreatePixPaymentRequest = z.infer<typeof CreatePixPaymentRequestSchema>
export type CreateBoletoPaymentRequest = z.infer<typeof CreateBoletoPaymentRequestSchema>
export type CancelPaymentRequest = z.infer<typeof CancelPaymentRequestSchema>
export type RefundPaymentRequest = z.infer<typeof RefundPaymentRequestSchema>

/**
 * Helper to format Zod errors for HttpsError.
 */
export function formatZodError(error: z.ZodError): string {
  return error.issues.map((e: z.ZodIssue) => `${e.path.join('.')}: ${e.message}`).join('; ')
}
