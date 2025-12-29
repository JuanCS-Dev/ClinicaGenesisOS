/**
 * FHIR Appointment Converter
 *
 * Converts between internal Appointment type and FHIR R4 Appointment resource.
 * Compliant with HL7 FHIR R4 (https://hl7.org/fhir/R4/appointment.html)
 *
 * @module services/fhir/appointment-converter
 */

import type { Appointment as FHIRAppointment } from 'fhir/r4'
import type { Appointment } from '@/types/appointment/appointment'
import { Status } from '@/types/appointment/status'

// Genesis namespace for identifiers
const GENESIS_SYSTEM = 'https://clinicagenesis.com/appointment-id'

/**
 * Convert internal Appointment to FHIR R4 Appointment resource.
 */
export function toFHIRAppointment(appointment: Appointment, clinicId: string): FHIRAppointment {
  const startDate = new Date(appointment.date)
  const endDate = new Date(startDate.getTime() + appointment.durationMin * 60 * 1000)

  return {
    resourceType: 'Appointment',
    id: appointment.id,
    meta: {
      versionId: '1',
      lastUpdated: new Date().toISOString(),
      source: `urn:genesis:clinic:${clinicId}`,
      profile: ['http://hl7.org/fhir/StructureDefinition/Appointment'],
    },
    identifier: [
      {
        system: GENESIS_SYSTEM,
        value: appointment.id,
      },
    ],
    status: mapStatus(appointment.status),
    serviceType: [
      {
        coding: [
          {
            system: 'https://clinicagenesis.com/service-type',
            code: appointment.procedure,
            display: appointment.procedure,
          },
        ],
        text: appointment.procedure,
      },
    ],
    specialty: [
      {
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: mapSpecialtyToSNOMED(appointment.specialty),
            display: formatSpecialty(appointment.specialty),
          },
        ],
        text: formatSpecialty(appointment.specialty),
      },
    ],
    start: startDate.toISOString(),
    end: endDate.toISOString(),
    minutesDuration: appointment.durationMin,
    participant: [
      {
        actor: {
          reference: `Patient/${appointment.patientId}`,
          display: appointment.patientName,
        },
        status: mapParticipantStatus(appointment.status),
        required: 'required',
      },
      {
        actor: {
          display: appointment.professional,
        },
        status: 'accepted',
        required: 'required',
      },
    ],
    comment: appointment.notes,
    extension: buildExtensions(appointment),
  }
}

/**
 * Convert FHIR R4 Appointment to internal Appointment type.
 */
export function fromFHIRAppointment(fhirAppointment: FHIRAppointment): Partial<Appointment> {
  const patientParticipant = fhirAppointment.participant?.find(p =>
    p.actor?.reference?.startsWith('Patient/')
  )
  const professionalParticipant = fhirAppointment.participant?.find(
    p => !p.actor?.reference?.startsWith('Patient/')
  )

  const startDate = fhirAppointment.start ? new Date(fhirAppointment.start) : new Date()
  const endDate = fhirAppointment.end ? new Date(fhirAppointment.end) : undefined
  const durationMin = endDate
    ? Math.round((endDate.getTime() - startDate.getTime()) / 60000)
    : fhirAppointment.minutesDuration || 30

  return {
    id: fhirAppointment.id || '',
    patientId: patientParticipant?.actor?.reference?.replace('Patient/', '') || '',
    patientName: patientParticipant?.actor?.display || '',
    date: startDate.toISOString(),
    durationMin,
    procedure: fhirAppointment.serviceType?.[0]?.text || '',
    status: reverseMapStatus(fhirAppointment.status),
    professional: professionalParticipant?.actor?.display || '',
    specialty: reverseMapSpecialty(fhirAppointment.specialty?.[0]?.coding?.[0]?.code),
    notes: fhirAppointment.comment,
  }
}

// --- Helper Functions ---

function mapStatus(status: Status): FHIRAppointment['status'] {
  const statusMap: Record<Status, FHIRAppointment['status']> = {
    [Status.PENDING]: 'booked',
    [Status.CONFIRMED]: 'booked',
    [Status.ARRIVED]: 'arrived',
    [Status.IN_PROGRESS]: 'fulfilled',
    [Status.FINISHED]: 'fulfilled',
    [Status.CANCELED]: 'cancelled',
    [Status.NO_SHOW]: 'noshow',
  }
  return statusMap[status] || 'proposed'
}

function reverseMapStatus(status?: FHIRAppointment['status']): Status {
  const statusMap: Record<NonNullable<FHIRAppointment['status']>, Status> = {
    proposed: Status.PENDING,
    pending: Status.PENDING,
    booked: Status.CONFIRMED,
    arrived: Status.ARRIVED,
    fulfilled: Status.FINISHED,
    cancelled: Status.CANCELED,
    noshow: Status.NO_SHOW,
    'entered-in-error': Status.CANCELED,
    'checked-in': Status.ARRIVED,
    waitlist: Status.PENDING,
  }
  return status ? statusMap[status] || Status.PENDING : Status.PENDING
}

function mapParticipantStatus(
  status: Status
): 'accepted' | 'declined' | 'tentative' | 'needs-action' {
  if (status === Status.CANCELED || status === Status.NO_SHOW) return 'declined'
  if (status === Status.CONFIRMED || status === Status.FINISHED || status === Status.IN_PROGRESS)
    return 'accepted'
  return 'tentative'
}

function mapSpecialtyToSNOMED(specialty: string): string {
  // SNOMED CT codes for specialties
  const specialtyMap: Record<string, string> = {
    medicina: '394802001', // General medicine
    nutricao: '722165004', // Dietetics and nutrition
    psicologia: '394913002', // Psychotherapy
  }
  return specialtyMap[specialty?.toLowerCase()] || '394802001'
}

function formatSpecialty(specialty: string): string {
  const specialtyMap: Record<string, string> = {
    medicina: 'Medicina Geral',
    nutricao: 'Nutrição',
    psicologia: 'Psicologia',
  }
  return specialtyMap[specialty?.toLowerCase()] || specialty
}

function reverseMapSpecialty(snomedCode?: string): 'medicina' | 'nutricao' | 'psicologia' {
  const codeMap: Record<string, 'medicina' | 'nutricao' | 'psicologia'> = {
    '394802001': 'medicina',
    '722165004': 'nutricao',
    '394913002': 'psicologia',
  }
  return snomedCode ? codeMap[snomedCode] || 'medicina' : 'medicina'
}

function buildExtensions(appointment: Appointment): FHIRAppointment['extension'] {
  const extensions: NonNullable<FHIRAppointment['extension']> = []

  // Add recurrence info as extension
  if (appointment.recurrence) {
    extensions.push({
      url: 'https://clinicagenesis.com/fhir/StructureDefinition/appointment-recurrence',
      extension: [
        {
          url: 'frequency',
          valueCode: appointment.recurrence.frequency,
        },
        ...(appointment.recurrence.endDate
          ? [
              {
                url: 'endDate',
                valueDate: appointment.recurrence.endDate,
              },
            ]
          : []),
        ...(appointment.recurrence.daysOfWeek
          ? appointment.recurrence.daysOfWeek.map(day => ({
              url: 'dayOfWeek',
              valueInteger: day,
            }))
          : []),
      ],
    })
  }

  // Add recurrence parent reference
  if (appointment.recurrenceParentId) {
    extensions.push({
      url: 'https://clinicagenesis.com/fhir/StructureDefinition/recurrence-parent',
      valueReference: {
        reference: `Appointment/${appointment.recurrenceParentId}`,
      },
    })
  }

  // Add reminder status
  if (appointment.reminder) {
    extensions.push({
      url: 'https://clinicagenesis.com/fhir/StructureDefinition/reminder-status',
      valueString: JSON.stringify(appointment.reminder),
    })
  }

  return extensions.length > 0 ? extensions : undefined
}
