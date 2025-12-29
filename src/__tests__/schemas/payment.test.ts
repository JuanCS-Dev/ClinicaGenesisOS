/**
 * Payment Schema Tests
 */

import { describe, it, expect } from 'vitest'
import {
  validateCreatePayment,
  validateBoletoPayment,
  validatePixConfig,
} from '../../schemas/payment'

describe('Payment Schema', () => {
  describe('validateCreatePayment', () => {
    const validPixPayment = {
      method: 'pix' as const,
      amount: 5000, // R$ 50.00
      description: 'Consulta médica',
    }

    it('accepts valid PIX payment', () => {
      const result = validateCreatePayment(validPixPayment)
      expect(result.success).toBe(true)
    })

    it('rejects amount below minimum (R$ 5.00)', () => {
      const result = validateCreatePayment({
        ...validPixPayment,
        amount: 499, // R$ 4.99
      })
      expect(result.success).toBe(false)
    })

    it('accepts minimum amount (R$ 5.00)', () => {
      const result = validateCreatePayment({
        ...validPixPayment,
        amount: 500,
      })
      expect(result.success).toBe(true)
    })

    it('rejects amount above maximum (R$ 1M)', () => {
      const result = validateCreatePayment({
        ...validPixPayment,
        amount: 100000001, // R$ 1,000,000.01
      })
      expect(result.success).toBe(false)
    })

    it('rejects invalid payment method', () => {
      const result = validateCreatePayment({
        ...validPixPayment,
        method: 'credit_card',
      })
      expect(result.success).toBe(false)
    })

    it('accepts valid CPF as tax ID', () => {
      const result = validateCreatePayment({
        ...validPixPayment,
        customerTaxId: '12345678901',
      })
      expect(result.success).toBe(true)
    })

    it('accepts valid CNPJ as tax ID', () => {
      const result = validateCreatePayment({
        ...validPixPayment,
        customerTaxId: '12345678901234',
      })
      expect(result.success).toBe(true)
    })

    it('rejects invalid tax ID length', () => {
      const result = validateCreatePayment({
        ...validPixPayment,
        customerTaxId: '12345678',
      })
      expect(result.success).toBe(false)
    })

    it('accepts optional customer email', () => {
      const result = validateCreatePayment({
        ...validPixPayment,
        customerEmail: 'customer@email.com',
      })
      expect(result.success).toBe(true)
    })

    it('rejects invalid customer email', () => {
      const result = validateCreatePayment({
        ...validPixPayment,
        customerEmail: 'not-an-email',
      })
      expect(result.success).toBe(false)
    })

    it('accepts expiration minutes within range', () => {
      const result = validateCreatePayment({
        ...validPixPayment,
        expirationMinutes: 60,
      })
      expect(result.success).toBe(true)
    })

    it('rejects expiration minutes over 30 days', () => {
      const result = validateCreatePayment({
        ...validPixPayment,
        expirationMinutes: 50000, // > 30 days
      })
      expect(result.success).toBe(false)
    })
  })

  describe('validateBoletoPayment', () => {
    const validBoletoPayment = {
      method: 'boleto' as const,
      amount: 10000,
      description: 'Procedimento cirúrgico',
      customerTaxId: '12345678901',
      customerName: 'João Silva',
      customerAddress: {
        line1: 'Rua das Flores, 123',
        city: 'São Paulo',
        state: 'SP',
        postalCode: '01234567',
      },
    }

    it('accepts valid Boleto payment', () => {
      const result = validateBoletoPayment(validBoletoPayment)
      expect(result.success).toBe(true)
    })

    it('requires customer tax ID for Boleto', () => {
      const { customerTaxId, ...withoutTaxId } = validBoletoPayment
      const result = validateBoletoPayment(withoutTaxId)
      expect(result.success).toBe(false)
    })

    it('requires customer name for Boleto', () => {
      const { customerName, ...withoutName } = validBoletoPayment
      const result = validateBoletoPayment(withoutName)
      expect(result.success).toBe(false)
    })

    it('validates CEP format (8 digits)', () => {
      const result = validateBoletoPayment({
        ...validBoletoPayment,
        customerAddress: {
          ...validBoletoPayment.customerAddress,
          postalCode: '1234567', // 7 digits
        },
      })
      expect(result.success).toBe(false)
    })

    it('validates state format (2 chars)', () => {
      const result = validateBoletoPayment({
        ...validBoletoPayment,
        customerAddress: {
          ...validBoletoPayment.customerAddress,
          state: 'São Paulo', // Should be SP
        },
      })
      expect(result.success).toBe(false)
    })
  })

  describe('validatePixConfig', () => {
    const validConfig = {
      pixKey: 'clinica@email.com',
      pixKeyType: 'email' as const,
      receiverName: 'CLINICA GENESIS',
      receiverCity: 'SAO PAULO',
      enabled: true,
    }

    it('accepts valid PIX config', () => {
      const result = validatePixConfig(validConfig)
      expect(result.success).toBe(true)
    })

    it('rejects receiverName over 25 chars', () => {
      const result = validatePixConfig({
        ...validConfig,
        receiverName: 'A'.repeat(26),
      })
      expect(result.success).toBe(false)
    })

    it('rejects receiverCity over 15 chars', () => {
      const result = validatePixConfig({
        ...validConfig,
        receiverCity: 'A'.repeat(16),
      })
      expect(result.success).toBe(false)
    })

    it('accepts all valid PIX key types', () => {
      const keyTypes = ['cpf', 'cnpj', 'email', 'phone', 'random'] as const
      for (const pixKeyType of keyTypes) {
        const result = validatePixConfig({
          ...validConfig,
          pixKeyType,
        })
        expect(result.success).toBe(true)
      }
    })
  })
})
