/**
 * FHIR Observation Converter Tests
 *
 * Tests for converting internal records to FHIR Observation resources.
 *
 * @module __tests__/services/fhir/observation-converter
 */

import { describe, it, expect } from 'vitest'
import {
  anthropometryToFHIRObservations,
  soapToFHIRObservation,
  recordToFHIRObservations,
} from '../../../services/fhir/observation-converter'
import type { AnthropometryRecord, SoapRecord, MedicalRecord } from '@/types/records/medical'

describe('FHIR Observation Converter', () => {
  const mockClinicId = 'clinic-123'

  describe('anthropometryToFHIRObservations', () => {
    const baseAnthropometry: AnthropometryRecord = {
      id: 'anthro-1',
      type: 'anthropometry',
      patientId: 'patient-123',
      date: '2024-01-15T10:00:00Z',
      professional: 'Dr. Silva',
      specialty: 'nutricao',
      version: 1,
    }

    it('should convert weight to FHIR Observation', () => {
      const record = { ...baseAnthropometry, weight: 75.5 }
      const observations = anthropometryToFHIRObservations(record, mockClinicId)

      expect(observations).toHaveLength(1)
      expect(observations[0].resourceType).toBe('Observation')
      expect(observations[0].valueQuantity?.value).toBe(75.5)
      expect(observations[0].valueQuantity?.unit).toBe('kg')
      expect(observations[0].code?.coding?.[0].code).toBe('29463-7') // LOINC for body weight
    })

    it('should convert height to FHIR Observation', () => {
      const record = { ...baseAnthropometry, height: 175 }
      const observations = anthropometryToFHIRObservations(record, mockClinicId)

      expect(observations).toHaveLength(1)
      expect(observations[0].valueQuantity?.value).toBe(175)
      expect(observations[0].valueQuantity?.unit).toBe('cm')
      expect(observations[0].code?.coding?.[0].code).toBe('8302-2') // LOINC for body height
    })

    it('should convert BMI to FHIR Observation', () => {
      const record = { ...baseAnthropometry, imc: 24.5 }
      const observations = anthropometryToFHIRObservations(record, mockClinicId)

      expect(observations).toHaveLength(1)
      expect(observations[0].valueQuantity?.value).toBe(24.5)
      expect(observations[0].valueQuantity?.unit).toBe('kg/m2')
      expect(observations[0].code?.coding?.[0].code).toBe('39156-5') // LOINC for BMI
    })

    it('should convert waist circumference to FHIR Observation', () => {
      const record = { ...baseAnthropometry, waist: 85 }
      const observations = anthropometryToFHIRObservations(record, mockClinicId)

      expect(observations).toHaveLength(1)
      expect(observations[0].valueQuantity?.value).toBe(85)
      expect(observations[0].code?.coding?.[0].code).toBe('8280-0') // LOINC for waist
    })

    it('should convert hip circumference to FHIR Observation', () => {
      const record = { ...baseAnthropometry, hip: 98 }
      const observations = anthropometryToFHIRObservations(record, mockClinicId)

      expect(observations).toHaveLength(1)
      expect(observations[0].valueQuantity?.value).toBe(98)
      expect(observations[0].code?.coding?.[0].code).toBe('62409-8') // LOINC for hip
    })

    it('should convert multiple measurements to multiple Observations', () => {
      const record = {
        ...baseAnthropometry,
        weight: 75,
        height: 175,
        imc: 24.49,
        waist: 85,
        hip: 98,
      }
      const observations = anthropometryToFHIRObservations(record, mockClinicId)

      expect(observations).toHaveLength(5)
    })

    it('should return empty array when no measurements', () => {
      const observations = anthropometryToFHIRObservations(baseAnthropometry, mockClinicId)

      expect(observations).toHaveLength(0)
    })

    it('should include Genesis identifier system', () => {
      const record = { ...baseAnthropometry, weight: 75 }
      const observations = anthropometryToFHIRObservations(record, mockClinicId)

      expect(observations[0].identifier?.[0].system).toBe(
        'https://clinicagenesis.com/observation-id'
      )
    })

    it('should include patient reference', () => {
      const record = { ...baseAnthropometry, weight: 75 }
      const observations = anthropometryToFHIRObservations(record, mockClinicId)

      expect(observations[0].subject?.reference).toBe('Patient/patient-123')
    })

    it('should include clinic source in meta', () => {
      const record = { ...baseAnthropometry, weight: 75 }
      const observations = anthropometryToFHIRObservations(record, mockClinicId)

      expect(observations[0].meta?.source).toBe(`urn:genesis:clinic:${mockClinicId}`)
    })
  })

  describe('soapToFHIRObservation', () => {
    const mockSoapRecord: SoapRecord = {
      id: 'soap-1',
      type: 'soap',
      patientId: 'patient-123',
      date: '2024-01-15T10:00:00Z',
      professional: 'Dr. Silva',
      specialty: 'medicina',
      version: 1,
      subjective: 'Patient reports headache for 2 days',
      objective: 'Vitals normal, no neurological deficits',
      assessment: 'Tension headache',
      plan: 'Acetaminophen 500mg PRN, rest, follow up in 1 week',
    }

    it('should convert SOAP record to FHIR Observation', () => {
      const observation = soapToFHIRObservation(mockSoapRecord, mockClinicId)

      expect(observation.resourceType).toBe('Observation')
      expect(observation.id).toBe('soap-1')
      expect(observation.status).toBe('final')
    })

    it('should include LOINC code for evaluation note', () => {
      const observation = soapToFHIRObservation(mockSoapRecord, mockClinicId)

      expect(observation.code?.coding?.[0].code).toBe('51847-2')
      expect(observation.code?.text).toBe('SOAP Note')
    })

    it('should include all SOAP components', () => {
      const observation = soapToFHIRObservation(mockSoapRecord, mockClinicId)

      expect(observation.component).toHaveLength(4)
      expect(observation.component?.[0].code?.text).toBe('Subjective')
      expect(observation.component?.[0].valueString).toBe(mockSoapRecord.subjective)
      expect(observation.component?.[1].code?.text).toBe('Objective')
      expect(observation.component?.[2].code?.text).toBe('Assessment')
      expect(observation.component?.[3].code?.text).toBe('Plan')
    })

    it('should include performer', () => {
      const observation = soapToFHIRObservation(mockSoapRecord, mockClinicId)

      expect(observation.performer?.[0].display).toBe('Dr. Silva')
    })

    it('should include version in meta', () => {
      const observation = soapToFHIRObservation(mockSoapRecord, mockClinicId)

      expect(observation.meta?.versionId).toBe('1')
    })

    it('should use updatedAt for lastUpdated when available', () => {
      const recordWithUpdate = {
        ...mockSoapRecord,
        updatedAt: '2024-01-16T15:00:00Z',
      }
      const observation = soapToFHIRObservation(recordWithUpdate, mockClinicId)

      expect(observation.meta?.lastUpdated).toBe('2024-01-16T15:00:00Z')
    })
  })

  describe('recordToFHIRObservations', () => {
    it('should route anthropometry records correctly', () => {
      const record: MedicalRecord = {
        id: 'anthro-1',
        type: 'anthropometry',
        patientId: 'patient-123',
        date: '2024-01-15T10:00:00Z',
        professional: 'Dr. Silva',
        specialty: 'nutricao',
        version: 1,
        weight: 75,
      } as AnthropometryRecord

      const observations = recordToFHIRObservations(record, mockClinicId)

      expect(observations).toHaveLength(1)
      expect(observations[0].valueQuantity).toBeDefined()
    })

    it('should route SOAP records correctly', () => {
      const record: MedicalRecord = {
        id: 'soap-1',
        type: 'soap',
        patientId: 'patient-123',
        date: '2024-01-15T10:00:00Z',
        professional: 'Dr. Silva',
        specialty: 'medicina',
        version: 1,
        subjective: 'S',
        objective: 'O',
        assessment: 'A',
        plan: 'P',
      } as SoapRecord

      const observations = recordToFHIRObservations(record, mockClinicId)

      expect(observations).toHaveLength(1)
      expect(observations[0].component).toHaveLength(4)
    })

    it('should create generic observation for other record types', () => {
      const record: MedicalRecord = {
        id: 'generic-1',
        type: 'consultation' as MedicalRecord['type'],
        patientId: 'patient-123',
        date: '2024-01-15T10:00:00Z',
        professional: 'Dr. Silva',
        specialty: 'medicina',
        version: 1,
      } as MedicalRecord

      const observations = recordToFHIRObservations(record, mockClinicId)

      expect(observations).toHaveLength(1)
      expect(observations[0].resourceType).toBe('Observation')
      expect(observations[0].code?.text).toContain('Clinical Record')
    })

    it('should include note with record type info for generic records', () => {
      const record: MedicalRecord = {
        id: 'generic-1',
        type: 'exam' as MedicalRecord['type'],
        patientId: 'patient-123',
        date: '2024-01-15T10:00:00Z',
        professional: 'Dr. Silva',
        specialty: 'medicina',
        version: 1,
      } as MedicalRecord

      const observations = recordToFHIRObservations(record, mockClinicId)

      expect(observations[0].note?.[0].text).toContain('exam')
    })
  })
})
