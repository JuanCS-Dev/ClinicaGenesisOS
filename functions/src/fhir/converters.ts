/**
 * FHIR R4 Converters for Cloud Functions
 *
 * Server-side converters for FHIR interoperability.
 */

import type { PatientData, AppointmentData, AnthropometryData } from './types.js'

// Simplified FHIR types (we don't import full fhir types in functions)
interface FHIRPatient {
  resourceType: 'Patient'
  id?: string
  meta?: {
    versionId?: string
    lastUpdated?: string
    source?: string
    profile?: string[]
  }
  identifier?: Array<{
    system?: string
    value?: string
  }>
  active?: boolean
  name?: Array<{
    use?: string
    text?: string
    family?: string
    given?: string[]
  }>
  telecom?: Array<{
    system?: string
    value?: string
    use?: string
  }>
  gender?: string
  birthDate?: string
  address?: Array<{
    use?: string
    type?: string
    text?: string
    line?: string[]
    city?: string
    state?: string
    postalCode?: string
    country?: string
  }>
  extension?: Array<{
    url: string
    valueString?: string
    valueUrl?: string
  }>
  generalPractitioner?: Array<{
    display?: string
    identifier?: { value?: string }
  }>
}

interface FHIRAppointment {
  resourceType: 'Appointment'
  id?: string
  meta?: {
    versionId?: string
    lastUpdated?: string
    source?: string
  }
  identifier?: Array<{
    system?: string
    value?: string
  }>
  status?: string
  serviceType?: Array<{
    coding?: Array<{
      system?: string
      code?: string
      display?: string
    }>
    text?: string
  }>
  specialty?: Array<{
    coding?: Array<{
      system?: string
      code?: string
      display?: string
    }>
    text?: string
  }>
  start?: string
  end?: string
  minutesDuration?: number
  participant?: Array<{
    actor?: {
      reference?: string
      display?: string
    }
    status?: string
    required?: string
  }>
  comment?: string
}

interface FHIRObservation {
  resourceType: 'Observation'
  id?: string
  meta?: {
    versionId?: string
    lastUpdated?: string
    source?: string
  }
  identifier?: Array<{
    system?: string
    value?: string
  }>
  status: string
  category?: Array<{
    coding?: Array<{
      system?: string
      code?: string
      display?: string
    }>
  }>
  code: {
    coding?: Array<{
      system?: string
      code?: string
      display?: string
    }>
    text?: string
  }
  subject?: {
    reference?: string
  }
  effectiveDateTime?: string
  valueQuantity?: {
    value?: number
    unit?: string
    system?: string
    code?: string
  }
}

// Genesis namespaces
const GENESIS_SYSTEM = 'https://clinicagenesis.com'

// LOINC codes
const LOINC = {
  bodyWeight: '29463-7',
  bodyHeight: '8302-2',
  bmi: '39156-5',
  waistCircumference: '8280-0',
  hipCircumference: '62409-8',
}

/**
 * Convert internal Patient to FHIR Patient
 */
export function toFHIRPatient(patient: PatientData, clinicId: string): FHIRPatient {
  const nameParts = patient.name?.trim().split(/\s+/) || []

  return {
    resourceType: 'Patient',
    id: patient.id,
    meta: {
      versionId: '1',
      lastUpdated: patient.updatedAt || patient.createdAt || new Date().toISOString(),
      source: `urn:genesis:clinic:${clinicId}`,
      profile: ['http://hl7.org/fhir/StructureDefinition/Patient'],
    },
    identifier: [
      {
        system: `${GENESIS_SYSTEM}/patient-id`,
        value: patient.id,
      },
    ],
    active: true,
    name: [
      {
        use: 'official',
        text: patient.name,
        family: nameParts.length > 1 ? nameParts[nameParts.length - 1] : nameParts[0],
        given: nameParts.length > 1 ? nameParts.slice(0, -1) : [],
      },
    ],
    telecom: [
      ...(patient.phone ? [{ system: 'phone', value: patient.phone, use: 'mobile' }] : []),
      ...(patient.email ? [{ system: 'email', value: patient.email, use: 'home' }] : []),
    ],
    gender: mapGender(patient.gender),
    birthDate: patient.birthDate?.split('T')[0],
    address: patient.address
      ? [
          {
            use: 'home',
            type: 'physical',
            text: patient.address,
            country: 'BR',
          },
        ]
      : undefined,
    generalPractitioner: patient.insurance
      ? [
          {
            display: patient.insurance,
            identifier: patient.insuranceNumber ? { value: patient.insuranceNumber } : undefined,
          },
        ]
      : undefined,
    extension: patient.tags?.length
      ? [
          {
            url: `${GENESIS_SYSTEM}/fhir/StructureDefinition/patient-tags`,
            valueString: patient.tags.join(','),
          },
        ]
      : undefined,
  }
}

/**
 * Convert FHIR Patient to internal Patient
 */
export function fromFHIRPatient(fhir: FHIRPatient, clinicId: string): PatientData {
  const name = fhir.name?.[0]
  const phone = fhir.telecom?.find(t => t.system === 'phone')?.value
  const email = fhir.telecom?.find(t => t.system === 'email')?.value
  const tags = fhir.extension
    ?.find(e => e.url.includes('patient-tags'))
    ?.valueString?.split(',')
    .filter(Boolean)

  return {
    id: fhir.id || '',
    name: name?.text || [name?.given?.join(' '), name?.family].filter(Boolean).join(' '),
    birthDate: fhir.birthDate,
    gender: reverseMapGender(fhir.gender),
    phone: phone || '',
    email: email || '',
    address: fhir.address?.[0]?.text,
    insurance: fhir.generalPractitioner?.[0]?.display,
    insuranceNumber: fhir.generalPractitioner?.[0]?.identifier?.value,
    tags: tags || [],
  }
}

/**
 * Convert internal Appointment to FHIR Appointment
 */
export function toFHIRAppointment(appt: AppointmentData, clinicId: string): FHIRAppointment {
  const startDate = new Date(appt.date)
  const endDate = new Date(startDate.getTime() + appt.durationMin * 60 * 1000)

  return {
    resourceType: 'Appointment',
    id: appt.id,
    meta: {
      versionId: '1',
      lastUpdated: new Date().toISOString(),
      source: `urn:genesis:clinic:${clinicId}`,
    },
    identifier: [
      {
        system: `${GENESIS_SYSTEM}/appointment-id`,
        value: appt.id,
      },
    ],
    status: mapAppointmentStatus(appt.status),
    serviceType: [
      {
        coding: [
          {
            system: `${GENESIS_SYSTEM}/service-type`,
            code: appt.procedure,
            display: appt.procedure,
          },
        ],
        text: appt.procedure,
      },
    ],
    specialty: [
      {
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: mapSpecialtyToSNOMED(appt.specialty),
            display: formatSpecialty(appt.specialty),
          },
        ],
        text: formatSpecialty(appt.specialty),
      },
    ],
    start: startDate.toISOString(),
    end: endDate.toISOString(),
    minutesDuration: appt.durationMin,
    participant: [
      {
        actor: {
          reference: `Patient/${appt.patientId}`,
          display: appt.patientName,
        },
        status: 'accepted',
        required: 'required',
      },
      {
        actor: {
          display: appt.professional,
        },
        status: 'accepted',
        required: 'required',
      },
    ],
    comment: appt.notes,
  }
}

/**
 * Convert Anthropometry to FHIR Observations
 */
export function toFHIRObservations(data: AnthropometryData, clinicId: string): FHIRObservation[] {
  const observations: FHIRObservation[] = []
  const base = {
    meta: {
      versionId: '1',
      lastUpdated: data.date,
      source: `urn:genesis:clinic:${clinicId}`,
    },
    status: 'final' as const,
    category: [
      {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/observation-category',
            code: 'vital-signs',
            display: 'Vital Signs',
          },
        ],
      },
    ],
    subject: { reference: `Patient/${data.patientId}` },
    effectiveDateTime: data.date,
  }

  if (data.weight) {
    observations.push({
      resourceType: 'Observation',
      id: `${data.id}-weight`,
      ...base,
      identifier: [{ system: `${GENESIS_SYSTEM}/observation-id`, value: `${data.id}-weight` }],
      code: {
        coding: [{ system: 'http://loinc.org', code: LOINC.bodyWeight, display: 'Body weight' }],
        text: 'Body weight',
      },
      valueQuantity: {
        value: data.weight,
        unit: 'kg',
        system: 'http://unitsofmeasure.org',
        code: 'kg',
      },
    })
  }

  if (data.height) {
    observations.push({
      resourceType: 'Observation',
      id: `${data.id}-height`,
      ...base,
      identifier: [{ system: `${GENESIS_SYSTEM}/observation-id`, value: `${data.id}-height` }],
      code: {
        coding: [{ system: 'http://loinc.org', code: LOINC.bodyHeight, display: 'Body height' }],
        text: 'Body height',
      },
      valueQuantity: {
        value: data.height,
        unit: 'cm',
        system: 'http://unitsofmeasure.org',
        code: 'cm',
      },
    })
  }

  if (data.imc) {
    observations.push({
      resourceType: 'Observation',
      id: `${data.id}-bmi`,
      ...base,
      identifier: [{ system: `${GENESIS_SYSTEM}/observation-id`, value: `${data.id}-bmi` }],
      code: {
        coding: [{ system: 'http://loinc.org', code: LOINC.bmi, display: 'Body mass index' }],
        text: 'Body mass index (BMI)',
      },
      valueQuantity: {
        value: data.imc,
        unit: 'kg/m2',
        system: 'http://unitsofmeasure.org',
        code: 'kg/m2',
      },
    })
  }

  return observations
}

// --- Helper Functions ---

function mapGender(gender?: string): string {
  const map: Record<string, string> = {
    M: 'male',
    masculino: 'male',
    F: 'female',
    feminino: 'female',
    O: 'other',
    outro: 'other',
  }
  return gender ? map[gender.toLowerCase()] || 'unknown' : 'unknown'
}

function reverseMapGender(gender?: string): string {
  const map: Record<string, string> = {
    male: 'M',
    female: 'F',
    other: 'O',
    unknown: 'N',
  }
  return gender ? map[gender] || 'N' : 'N'
}

function mapAppointmentStatus(status: string): string {
  const map: Record<string, string> = {
    scheduled: 'booked',
    confirmed: 'booked',
    'checked-in': 'arrived',
    'in-progress': 'fulfilled',
    completed: 'fulfilled',
    cancelled: 'cancelled',
    'no-show': 'noshow',
  }
  return map[status] || 'proposed'
}

function mapSpecialtyToSNOMED(specialty: string): string {
  const map: Record<string, string> = {
    medicina: '394802001',
    nutricao: '722165004',
    psicologia: '394913002',
  }
  return map[specialty?.toLowerCase()] || '394802001'
}

function formatSpecialty(specialty: string): string {
  const map: Record<string, string> = {
    medicina: 'Medicina Geral',
    nutricao: 'Nutrição',
    psicologia: 'Psicologia',
  }
  return map[specialty?.toLowerCase()] || specialty
}
