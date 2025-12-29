/**
 * FHIR Appointment Converter Tests
 */

import { describe, it, expect } from 'vitest'
import { toFHIRAppointment, fromFHIRAppointment } from '@/services/fhir/appointment-converter'
import type { Appointment } from '@/types/appointment/appointment'
import { Status } from '@/types/appointment/status'

describe('FHIR Appointment Converter', () => {
  const mockAppointment: Appointment = {
    id: 'appt-123',
    patientId: 'patient-456',
    patientName: 'Maria Silva',
    patientPhone: '+5511999887766',
    date: '2024-12-15T14:30:00.000Z',
    durationMin: 30,
    procedure: 'Consulta de Rotina',
    status: Status.PENDING,
    professional: 'Dr. João Santos',
    specialty: 'medicina',
    notes: 'Primeira consulta',
  }

  describe('toFHIRAppointment', () => {
    it('converts internal appointment to FHIR Appointment resource', () => {
      const fhir = toFHIRAppointment(mockAppointment, 'clinic-abc')

      expect(fhir.resourceType).toBe('Appointment')
      expect(fhir.id).toBe('appt-123')
    })

    it('correctly calculates start and end times', () => {
      const fhir = toFHIRAppointment(mockAppointment, 'clinic-abc')

      expect(fhir.start).toBe('2024-12-15T14:30:00.000Z')
      // End should be 30 minutes after start
      const endDate = new Date(fhir.end!)
      const startDate = new Date(fhir.start!)
      const diffMinutes = (endDate.getTime() - startDate.getTime()) / 60000
      expect(diffMinutes).toBe(30)
      expect(fhir.minutesDuration).toBe(30)
    })

    it('maps status correctly', () => {
      const pending = toFHIRAppointment(
        { ...mockAppointment, status: Status.PENDING },
        'clinic-abc'
      )
      expect(pending.status).toBe('booked')

      const confirmed = toFHIRAppointment(
        { ...mockAppointment, status: Status.CONFIRMED },
        'clinic-abc'
      )
      expect(confirmed.status).toBe('booked')

      const arrived = toFHIRAppointment(
        { ...mockAppointment, status: Status.ARRIVED },
        'clinic-abc'
      )
      expect(arrived.status).toBe('arrived')

      const finished = toFHIRAppointment(
        { ...mockAppointment, status: Status.FINISHED },
        'clinic-abc'
      )
      expect(finished.status).toBe('fulfilled')

      const cancelled = toFHIRAppointment(
        { ...mockAppointment, status: Status.CANCELED },
        'clinic-abc'
      )
      expect(cancelled.status).toBe('cancelled')

      const noShow = toFHIRAppointment({ ...mockAppointment, status: Status.NO_SHOW }, 'clinic-abc')
      expect(noShow.status).toBe('noshow')
    })

    it('includes service type', () => {
      const fhir = toFHIRAppointment(mockAppointment, 'clinic-abc')

      expect(fhir.serviceType).toHaveLength(1)
      expect(fhir.serviceType?.[0].text).toBe('Consulta de Rotina')
    })

    it('includes specialty with SNOMED code', () => {
      const fhir = toFHIRAppointment(mockAppointment, 'clinic-abc')

      expect(fhir.specialty).toHaveLength(1)
      expect(fhir.specialty?.[0].coding?.[0].system).toBe('http://snomed.info/sct')
      expect(fhir.specialty?.[0].coding?.[0].code).toBe('394802001') // General medicine
      expect(fhir.specialty?.[0].text).toBe('Medicina Geral')
    })

    it('includes participants (patient and professional)', () => {
      const fhir = toFHIRAppointment(mockAppointment, 'clinic-abc')

      expect(fhir.participant).toHaveLength(2)

      const patientParticipant = fhir.participant?.find(p =>
        p.actor?.reference?.startsWith('Patient/')
      )
      expect(patientParticipant?.actor?.reference).toBe('Patient/patient-456')
      expect(patientParticipant?.actor?.display).toBe('Maria Silva')

      const professionalParticipant = fhir.participant?.find(
        p => !p.actor?.reference?.startsWith('Patient/')
      )
      expect(professionalParticipant?.actor?.display).toBe('Dr. João Santos')
    })

    it('includes notes as comment', () => {
      const fhir = toFHIRAppointment(mockAppointment, 'clinic-abc')
      expect(fhir.comment).toBe('Primeira consulta')
    })

    it('includes recurrence as extension', () => {
      const recurringAppointment: Appointment = {
        ...mockAppointment,
        recurrence: {
          frequency: 'weekly',
          endDate: '2025-03-15',
          daysOfWeek: [1, 3], // Monday and Wednesday
        },
      }

      const fhir = toFHIRAppointment(recurringAppointment, 'clinic-abc')

      const recurrenceExt = fhir.extension?.find(e => e.url.includes('appointment-recurrence'))
      expect(recurrenceExt).toBeDefined()
      expect(recurrenceExt?.extension).toBeDefined()
    })
  })

  describe('fromFHIRAppointment', () => {
    it('converts FHIR Appointment to internal format', () => {
      const fhir = toFHIRAppointment(mockAppointment, 'clinic-abc')
      const converted = fromFHIRAppointment(fhir)

      expect(converted.patientId).toBe('patient-456')
      expect(converted.patientName).toBe('Maria Silva')
      expect(converted.procedure).toBe('Consulta de Rotina')
      expect(converted.professional).toBe('Dr. João Santos')
      expect(converted.durationMin).toBe(30)
    })

    it('reverses status mapping', () => {
      const fhir = toFHIRAppointment(mockAppointment, 'clinic-abc')
      const converted = fromFHIRAppointment(fhir)

      expect(converted.status).toBe(Status.CONFIRMED)
    })

    it('reverses specialty mapping', () => {
      const fhir = toFHIRAppointment(mockAppointment, 'clinic-abc')
      const converted = fromFHIRAppointment(fhir)

      expect(converted.specialty).toBe('medicina')
    })

    it('preserves notes', () => {
      const fhir = toFHIRAppointment(mockAppointment, 'clinic-abc')
      const converted = fromFHIRAppointment(fhir)

      expect(converted.notes).toBe('Primeira consulta')
    })
  })

  describe('specialty mapping', () => {
    it('maps nutricao to correct SNOMED code', () => {
      const nutritionAppt = { ...mockAppointment, specialty: 'nutricao' as const }
      const fhir = toFHIRAppointment(nutritionAppt, 'clinic-abc')

      expect(fhir.specialty?.[0].coding?.[0].code).toBe('722165004')
      expect(fhir.specialty?.[0].text).toBe('Nutrição')
    })

    it('maps psicologia to correct SNOMED code', () => {
      const psychAppt = { ...mockAppointment, specialty: 'psicologia' as const }
      const fhir = toFHIRAppointment(psychAppt, 'clinic-abc')

      expect(fhir.specialty?.[0].coding?.[0].code).toBe('394913002')
      expect(fhir.specialty?.[0].text).toBe('Psicologia')
    })
  })
})
