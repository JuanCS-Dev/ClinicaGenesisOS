/**
 * Patient Schema Tests
 */

import { describe, it, expect } from 'vitest'
import {
  validateCreatePatient,
  validateUpdatePatient,
  CreatePatientSchema,
} from '../../schemas/patient'

describe('Patient Schema', () => {
  const validPatientData = {
    name: 'Maria Santos',
    birthDate: '1990-05-15T00:00:00.000Z',
    phone: '11999999999',
    email: 'maria@email.com',
    gender: 'Feminino' as const,
    tags: ['vip'],
  }

  describe('validateCreatePatient', () => {
    it('accepts valid patient data', () => {
      const result = validateCreatePatient(validPatientData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe('Maria Santos')
        expect(result.data.email).toBe('maria@email.com')
      }
    })

    it('trims whitespace from name', () => {
      const result = validateCreatePatient({
        ...validPatientData,
        name: '  Maria Santos  ',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe('Maria Santos')
      }
    })

    it('lowercases email', () => {
      const result = validateCreatePatient({
        ...validPatientData,
        email: 'MARIA@EMAIL.COM',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.email).toBe('maria@email.com')
      }
    })

    it('rejects short name', () => {
      const result = validateCreatePatient({
        ...validPatientData,
        name: 'A',
      })
      expect(result.success).toBe(false)
    })

    it('rejects invalid email', () => {
      const result = validateCreatePatient({
        ...validPatientData,
        email: 'not-an-email',
      })
      expect(result.success).toBe(false)
    })

    it('rejects invalid phone format', () => {
      const result = validateCreatePatient({
        ...validPatientData,
        phone: '123', // Too short
      })
      expect(result.success).toBe(false)
    })

    it('accepts 10 digit phone', () => {
      const result = validateCreatePatient({
        ...validPatientData,
        phone: '1199999999',
      })
      expect(result.success).toBe(true)
    })

    it('accepts 11 digit phone', () => {
      const result = validateCreatePatient({
        ...validPatientData,
        phone: '11999999999',
      })
      expect(result.success).toBe(true)
    })

    it('rejects future birth date', () => {
      const futureDate = new Date()
      futureDate.setFullYear(futureDate.getFullYear() + 1)
      const result = validateCreatePatient({
        ...validPatientData,
        birthDate: futureDate.toISOString(),
      })
      expect(result.success).toBe(false)
    })

    it('rejects invalid gender', () => {
      const result = validateCreatePatient({
        ...validPatientData,
        gender: 'invalid',
      })
      expect(result.success).toBe(false)
    })

    it('accepts all valid genders', () => {
      const genders = ['Masculino', 'Feminino', 'Outro', 'Prefiro não informar'] as const
      for (const gender of genders) {
        const result = validateCreatePatient({
          ...validPatientData,
          gender,
        })
        expect(result.success).toBe(true)
      }
    })

    it('accepts optional CPF with 11 digits', () => {
      const result = validateCreatePatient({
        ...validPatientData,
        cpf: '12345678901',
      })
      expect(result.success).toBe(true)
    })

    it('rejects CPF with wrong length', () => {
      const result = validateCreatePatient({
        ...validPatientData,
        cpf: '123456789', // 9 digits
      })
      expect(result.success).toBe(false)
    })

    it('defaults tags to empty array', () => {
      const { tags, ...dataWithoutTags } = validPatientData
      const result = validateCreatePatient(dataWithoutTags)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.tags).toEqual([])
      }
    })

    it('rejects more than 20 tags', () => {
      const result = validateCreatePatient({
        ...validPatientData,
        tags: Array(21).fill('tag'),
      })
      expect(result.success).toBe(false)
    })
  })

  describe('validateUpdatePatient', () => {
    it('accepts partial data', () => {
      const result = validateUpdatePatient({ name: 'New Name' })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe('New Name')
        expect(result.data.email).toBeUndefined()
      }
    })

    it('accepts empty object', () => {
      const result = validateUpdatePatient({})
      expect(result.success).toBe(true)
    })

    it('still validates provided fields', () => {
      const result = validateUpdatePatient({ email: 'invalid' })
      expect(result.success).toBe(false)
    })
  })

  describe('schema type inference', () => {
    it('correctly infers types from schema', () => {
      type InferredType = typeof CreatePatientSchema._output

      // This test is compile-time only - if it compiles, types are correct
      const _check: InferredType = {
        name: 'Test',
        birthDate: '2000-01-01T00:00:00.000Z',
        phone: '11999999999',
        email: 'test@test.com',
        gender: 'Masculino',
        tags: [],
      }
      expect(_check).toBeDefined()
    })
  })
})
