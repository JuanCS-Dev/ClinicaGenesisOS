/**
 * FHIR Patient Converter Tests
 */

import { describe, it, expect } from 'vitest'
import { toFHIRPatient, fromFHIRPatient } from '@/services/fhir/patient-converter'
import type { Patient } from '@/types/appointment/patient'

describe('FHIR Patient Converter', () => {
  const mockPatient: Patient = {
    id: 'patient-123',
    name: 'Maria Silva Santos',
    birthDate: '1985-06-15',
    age: 39,
    phone: '+5511999887766',
    email: 'maria@email.com',
    gender: 'F',
    address: 'Rua das Flores, 123, São Paulo - SP, 01234-567',
    insurance: 'Unimed',
    insuranceNumber: '1234567890',
    tags: ['vip', 'diabetico'],
    createdAt: '2024-01-15T10:00:00.000Z',
  }

  describe('toFHIRPatient', () => {
    it('converts internal patient to FHIR Patient resource', () => {
      const fhir = toFHIRPatient(mockPatient, 'clinic-abc')

      expect(fhir.resourceType).toBe('Patient')
      expect(fhir.id).toBe('patient-123')
      expect(fhir.active).toBe(true)
    })

    it('correctly maps name components', () => {
      const fhir = toFHIRPatient(mockPatient, 'clinic-abc')

      expect(fhir.name).toHaveLength(1)
      expect(fhir.name?.[0].use).toBe('official')
      expect(fhir.name?.[0].text).toBe('Maria Silva Santos')
      expect(fhir.name?.[0].family).toBe('Santos')
      expect(fhir.name?.[0].given).toEqual(['Maria', 'Silva'])
    })

    it('correctly maps telecom (phone and email)', () => {
      const fhir = toFHIRPatient(mockPatient, 'clinic-abc')

      expect(fhir.telecom).toHaveLength(2)

      const phone = fhir.telecom?.find(t => t.system === 'phone')
      expect(phone?.value).toBe('+5511999887766')
      expect(phone?.use).toBe('mobile')

      const email = fhir.telecom?.find(t => t.system === 'email')
      expect(email?.value).toBe('maria@email.com')
    })

    it('maps gender correctly', () => {
      const fhir = toFHIRPatient(mockPatient, 'clinic-abc')
      expect(fhir.gender).toBe('female')

      const malePatient = { ...mockPatient, gender: 'M' }
      const fhirMale = toFHIRPatient(malePatient, 'clinic-abc')
      expect(fhirMale.gender).toBe('male')
    })

    it('includes meta with source clinic', () => {
      const fhir = toFHIRPatient(mockPatient, 'clinic-abc')

      expect(fhir.meta?.source).toBe('urn:genesis:clinic:clinic-abc')
      expect(fhir.meta?.profile).toContain('http://hl7.org/fhir/StructureDefinition/Patient')
    })

    it('includes insurance in generalPractitioner', () => {
      const fhir = toFHIRPatient(mockPatient, 'clinic-abc')

      expect(fhir.generalPractitioner).toHaveLength(1)
      expect(fhir.generalPractitioner?.[0].display).toBe('Unimed')
      expect(fhir.generalPractitioner?.[0].identifier?.value).toBe('1234567890')
    })

    it('includes tags as extension', () => {
      const fhir = toFHIRPatient(mockPatient, 'clinic-abc')

      const tagsExt = fhir.extension?.find(e => e.url.includes('patient-tags'))
      expect(tagsExt?.valueString).toBe('vip,diabetico')
    })

    it('handles patient without optional fields', () => {
      const minimalPatient: Patient = {
        id: 'min-123',
        name: 'João',
        birthDate: '1990-01-01',
        age: 34,
        phone: '',
        email: '',
        gender: 'M',
        tags: [],
        createdAt: '2024-01-01T00:00:00.000Z',
      }

      const fhir = toFHIRPatient(minimalPatient, 'clinic-xyz')

      expect(fhir.resourceType).toBe('Patient')
      expect(fhir.name?.[0].text).toBe('João')
      expect(fhir.telecom).toBeUndefined() // No phone/email = undefined
      expect(fhir.address).toBeUndefined()
      expect(fhir.generalPractitioner).toBeUndefined()
      expect(fhir.extension).toBeUndefined()
    })
  })

  describe('fromFHIRPatient', () => {
    it('converts FHIR Patient to internal format', () => {
      const fhir = toFHIRPatient(mockPatient, 'clinic-abc')
      const converted = fromFHIRPatient(fhir, 'clinic-abc')

      expect(converted.name).toBe('Maria Silva Santos')
      expect(converted.phone).toBe('+5511999887766')
      expect(converted.email).toBe('maria@email.com')
      expect(converted.gender).toBe('F')
    })

    it('extracts tags from extension', () => {
      const fhir = toFHIRPatient(mockPatient, 'clinic-abc')
      const converted = fromFHIRPatient(fhir, 'clinic-abc')

      expect(converted.tags).toEqual(['vip', 'diabetico'])
    })

    it('extracts insurance info', () => {
      const fhir = toFHIRPatient(mockPatient, 'clinic-abc')
      const converted = fromFHIRPatient(fhir, 'clinic-abc')

      expect(converted.insurance).toBe('Unimed')
      expect(converted.insuranceNumber).toBe('1234567890')
    })

    it('calculates age from birthDate', () => {
      const fhir = toFHIRPatient(mockPatient, 'clinic-abc')
      const converted = fromFHIRPatient(fhir, 'clinic-abc')

      // Age depends on current date, just check it's a reasonable number
      expect(converted.age).toBeGreaterThan(0)
      expect(converted.age).toBeLessThan(150)
    })
  })

  describe('roundtrip conversion', () => {
    it('preserves data through toFHIR -> fromFHIR conversion', () => {
      const fhir = toFHIRPatient(mockPatient, 'clinic-abc')
      const roundtrip = fromFHIRPatient(fhir, 'clinic-abc')

      expect(roundtrip.name).toBe(mockPatient.name)
      expect(roundtrip.phone).toBe(mockPatient.phone)
      expect(roundtrip.email).toBe(mockPatient.email)
      expect(roundtrip.insurance).toBe(mockPatient.insurance)
      expect(roundtrip.insuranceNumber).toBe(mockPatient.insuranceNumber)
      expect(roundtrip.tags).toEqual(mockPatient.tags)
    })
  })
})
