/**
 * FHIR Observation Converter
 *
 * Converts internal MedicalRecord types to FHIR R4 Observation resources.
 * Used for anthropometry, vital signs, and clinical observations.
 * Compliant with HL7 FHIR R4 (https://hl7.org/fhir/R4/observation.html)
 *
 * @module services/fhir/observation-converter
 */

import type { Observation } from 'fhir/r4'
import type { MedicalRecord, AnthropometryRecord, SoapRecord } from '@/types/records/medical'

// LOINC codes for common observations
const LOINC_CODES = {
  bodyWeight: '29463-7',
  bodyHeight: '8302-2',
  bmi: '39156-5',
  waistCircumference: '8280-0',
  hipCircumference: '62409-8',
  vitalSigns: '85353-1', // Vital signs panel
} as const

// Genesis namespace
const GENESIS_SYSTEM = 'https://clinicagenesis.com/observation-id'

/**
 * Convert AnthropometryRecord to FHIR Observation resources.
 * Returns multiple observations (one per measurement).
 */
export function anthropometryToFHIRObservations(
  record: AnthropometryRecord,
  clinicId: string
): Observation[] {
  const observations: Observation[] = []
  const baseDate = record.date

  // Weight observation
  if (record.weight) {
    observations.push(
      createObservation({
        id: `${record.id}-weight`,
        patientId: record.patientId,
        date: baseDate,
        clinicId,
        code: LOINC_CODES.bodyWeight,
        display: 'Body weight',
        value: record.weight,
        unit: 'kg',
        unitCode: 'kg',
      })
    )
  }

  // Height observation
  if (record.height) {
    observations.push(
      createObservation({
        id: `${record.id}-height`,
        patientId: record.patientId,
        date: baseDate,
        clinicId,
        code: LOINC_CODES.bodyHeight,
        display: 'Body height',
        value: record.height,
        unit: 'cm',
        unitCode: 'cm',
      })
    )
  }

  // BMI observation
  if (record.imc) {
    observations.push(
      createObservation({
        id: `${record.id}-bmi`,
        patientId: record.patientId,
        date: baseDate,
        clinicId,
        code: LOINC_CODES.bmi,
        display: 'Body mass index (BMI)',
        value: record.imc,
        unit: 'kg/m2',
        unitCode: 'kg/m2',
      })
    )
  }

  // Waist circumference
  if (record.waist) {
    observations.push(
      createObservation({
        id: `${record.id}-waist`,
        patientId: record.patientId,
        date: baseDate,
        clinicId,
        code: LOINC_CODES.waistCircumference,
        display: 'Waist circumference',
        value: record.waist,
        unit: 'cm',
        unitCode: 'cm',
      })
    )
  }

  // Hip circumference
  if (record.hip) {
    observations.push(
      createObservation({
        id: `${record.id}-hip`,
        patientId: record.patientId,
        date: baseDate,
        clinicId,
        code: LOINC_CODES.hipCircumference,
        display: 'Hip circumference',
        value: record.hip,
        unit: 'cm',
        unitCode: 'cm',
      })
    )
  }

  return observations
}

/**
 * Convert SOAP record assessment to FHIR Observation (clinical note).
 */
export function soapToFHIRObservation(record: SoapRecord, clinicId: string): Observation {
  return {
    resourceType: 'Observation',
    id: record.id,
    meta: {
      versionId: String(record.version || 1),
      lastUpdated: record.updatedAt || record.date,
      source: `urn:genesis:clinic:${clinicId}`,
    },
    identifier: [
      {
        system: GENESIS_SYSTEM,
        value: record.id,
      },
    ],
    status: 'final',
    category: [
      {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/observation-category',
            code: 'exam',
            display: 'Exam',
          },
        ],
      },
    ],
    code: {
      coding: [
        {
          system: 'http://loinc.org',
          code: '51847-2', // Evaluation + plan note
          display: 'Evaluation + plan note',
        },
      ],
      text: 'SOAP Note',
    },
    subject: {
      reference: `Patient/${record.patientId}`,
    },
    effectiveDateTime: record.date,
    performer: [
      {
        display: record.professional,
      },
    ],
    component: [
      {
        code: {
          text: 'Subjective',
        },
        valueString: record.subjective,
      },
      {
        code: {
          text: 'Objective',
        },
        valueString: record.objective,
      },
      {
        code: {
          text: 'Assessment',
        },
        valueString: record.assessment,
      },
      {
        code: {
          text: 'Plan',
        },
        valueString: record.plan,
      },
    ],
  }
}

/**
 * Convert any MedicalRecord to appropriate FHIR resources.
 */
export function recordToFHIRObservations(record: MedicalRecord, clinicId: string): Observation[] {
  switch (record.type) {
    case 'anthropometry':
      return anthropometryToFHIRObservations(record as AnthropometryRecord, clinicId)
    case 'soap':
      return [soapToFHIRObservation(record as SoapRecord, clinicId)]
    default:
      // For other record types, create a generic observation
      return [createGenericObservation(record, clinicId)]
  }
}

// --- Helper Functions ---

interface ObservationParams {
  id: string
  patientId: string
  date: string
  clinicId: string
  code: string
  display: string
  value: number
  unit: string
  unitCode: string
}

function createObservation(params: ObservationParams): Observation {
  return {
    resourceType: 'Observation',
    id: params.id,
    meta: {
      versionId: '1',
      lastUpdated: params.date,
      source: `urn:genesis:clinic:${params.clinicId}`,
    },
    identifier: [
      {
        system: GENESIS_SYSTEM,
        value: params.id,
      },
    ],
    status: 'final',
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
    code: {
      coding: [
        {
          system: 'http://loinc.org',
          code: params.code,
          display: params.display,
        },
      ],
      text: params.display,
    },
    subject: {
      reference: `Patient/${params.patientId}`,
    },
    effectiveDateTime: params.date,
    valueQuantity: {
      value: params.value,
      unit: params.unit,
      system: 'http://unitsofmeasure.org',
      code: params.unitCode,
    },
  }
}

function createGenericObservation(record: MedicalRecord, clinicId: string): Observation {
  return {
    resourceType: 'Observation',
    id: record.id,
    meta: {
      versionId: String(record.version || 1),
      lastUpdated: record.updatedAt || record.date,
      source: `urn:genesis:clinic:${clinicId}`,
    },
    identifier: [
      {
        system: GENESIS_SYSTEM,
        value: record.id,
      },
    ],
    status: 'final',
    category: [
      {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/observation-category',
            code: 'exam',
            display: 'Exam',
          },
        ],
      },
    ],
    code: {
      coding: [
        {
          system: 'https://clinicagenesis.com/record-type',
          code: record.type,
          display: record.type,
        },
      ],
      text: `Clinical Record - ${record.type}`,
    },
    subject: {
      reference: `Patient/${record.patientId}`,
    },
    effectiveDateTime: record.date,
    performer: [
      {
        display: record.professional,
      },
    ],
    note: [
      {
        text: `Record type: ${record.type}, Specialty: ${record.specialty}`,
      },
    ],
  }
}
