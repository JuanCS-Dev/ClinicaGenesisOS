/**
 * FHIR Patient Converter
 *
 * Converts between internal Patient type and FHIR R4 Patient resource.
 * Compliant with HL7 FHIR R4 (https://hl7.org/fhir/R4/patient.html)
 * and Brazilian RNDS requirements.
 *
 * @module services/fhir/patient-converter
 */

import type { Patient as FHIRPatient } from 'fhir/r4'
import type { Patient } from '@/types/appointment/patient'

// CPF OID (Brazilian Individual Taxpayer Registry)
const CPF_SYSTEM = 'urn:oid:2.16.840.1.113883.13.237'

// Genesis Clinic namespace
const GENESIS_SYSTEM = 'https://clinicagenesis.com/patient-id'

/**
 * Convert internal Patient to FHIR R4 Patient resource.
 */
export function toFHIRPatient(patient: Patient, clinicId: string): FHIRPatient {
  const names = parseName(patient.name)

  return {
    resourceType: 'Patient',
    id: patient.id,
    meta: {
      versionId: '1',
      lastUpdated: patient.createdAt || new Date().toISOString(),
      source: `urn:genesis:clinic:${clinicId}`,
      profile: ['http://hl7.org/fhir/StructureDefinition/Patient'],
    },
    identifier: [
      {
        system: GENESIS_SYSTEM,
        value: patient.id,
      },
    ],
    active: true,
    name: [
      {
        use: 'official',
        text: patient.name,
        family: names.family,
        given: names.given,
      },
    ],
    telecom: buildTelecom(patient),
    gender: mapGender(patient.gender),
    birthDate: formatBirthDate(patient.birthDate),
    address: patient.address ? [parseAddress(patient.address)] : undefined,
    generalPractitioner: patient.insurance
      ? [
          {
            display: patient.insurance,
            identifier: patient.insuranceNumber
              ? {
                  value: patient.insuranceNumber,
                }
              : undefined,
          },
        ]
      : undefined,
    extension: buildExtensions(patient),
  }
}

/**
 * Convert FHIR R4 Patient to internal Patient type.
 */
export function fromFHIRPatient(fhirPatient: FHIRPatient, clinicId: string): Partial<Patient> {
  const officialName = fhirPatient.name?.find(n => n.use === 'official') || fhirPatient.name?.[0]
  const phone = fhirPatient.telecom?.find(t => t.system === 'phone')?.value
  const email = fhirPatient.telecom?.find(t => t.system === 'email')?.value
  const address = fhirPatient.address?.[0]

  // Extract insurance from generalPractitioner
  const insurance = fhirPatient.generalPractitioner?.[0]?.display
  const insuranceNumber = fhirPatient.generalPractitioner?.[0]?.identifier?.value

  // Extract tags from extensions
  const tagsExtension = fhirPatient.extension?.find(
    e => e.url === 'https://clinicagenesis.com/fhir/StructureDefinition/patient-tags'
  )
  const tags = tagsExtension?.valueString?.split(',').filter(Boolean) || []

  return {
    id: fhirPatient.id || '',
    name: buildName(officialName),
    birthDate: fhirPatient.birthDate || '',
    age: fhirPatient.birthDate ? calculateAge(fhirPatient.birthDate) : 0,
    gender: reverseMapGender(fhirPatient.gender),
    phone: phone || '',
    email: email || '',
    address: address ? buildAddressString(address) : undefined,
    insurance: insurance || undefined,
    insuranceNumber: insuranceNumber || undefined,
    tags,
    createdAt: fhirPatient.meta?.lastUpdated || new Date().toISOString(),
  }
}

// --- Helper Functions ---

function parseName(fullName: string): { family: string; given: string[] } {
  const parts = fullName.trim().split(/\s+/)
  return {
    family: parts.length > 1 ? parts[parts.length - 1] : parts[0],
    given: parts.length > 1 ? parts.slice(0, -1) : [],
  }
}

function buildName(nameObj?: NonNullable<FHIRPatient['name']>[number]): string {
  if (!nameObj) return ''
  if (nameObj.text) return nameObj.text
  const given = nameObj.given?.join(' ') || ''
  const family = nameObj.family || ''
  return [given, family].filter(Boolean).join(' ')
}

function buildTelecom(patient: Patient): FHIRPatient['telecom'] {
  const telecom: NonNullable<FHIRPatient['telecom']> = []

  if (patient.phone) {
    telecom.push({
      system: 'phone',
      value: patient.phone,
      use: 'mobile',
    })
  }

  if (patient.email) {
    telecom.push({
      system: 'email',
      value: patient.email,
      use: 'home',
    })
  }

  return telecom.length > 0 ? telecom : undefined
}

function mapGender(gender: string): FHIRPatient['gender'] {
  const genderMap: Record<string, FHIRPatient['gender']> = {
    m: 'male',
    masculino: 'male',
    male: 'male',
    f: 'female',
    feminino: 'female',
    female: 'female',
    o: 'other',
    outro: 'other',
    other: 'other',
  }
  return genderMap[gender?.toLowerCase()] || 'unknown'
}

function reverseMapGender(gender?: string): string {
  const genderMap: Record<string, string> = {
    male: 'M',
    female: 'F',
    other: 'O',
    unknown: 'N',
  }
  return gender ? genderMap[gender] || 'N' : 'N'
}

function formatBirthDate(birthDate: string): string {
  if (!birthDate) return ''
  try {
    const date = new Date(birthDate)
    return date.toISOString().split('T')[0]
  } catch {
    return birthDate
  }
}

function calculateAge(birthDate: string): number {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

function parseAddress(addressStr: string): NonNullable<FHIRPatient['address']>[number] {
  // Simple parse - assumes format: "Street, Number, City - State, CEP"
  const parts = addressStr.split(',').map(p => p.trim())

  return {
    use: 'home',
    type: 'physical',
    text: addressStr,
    line: parts.slice(0, 2),
    city: parts[2]?.split('-')[0]?.trim(),
    state: parts[2]?.split('-')[1]?.trim(),
    postalCode: parts[3],
    country: 'BR',
  }
}

function buildAddressString(address: NonNullable<FHIRPatient['address']>[number]): string {
  if (address.text) return address.text
  const parts = [address.line?.join(', '), address.city, address.state, address.postalCode].filter(
    Boolean
  )
  return parts.join(', ')
}

function buildExtensions(patient: Patient): FHIRPatient['extension'] {
  const extensions: NonNullable<FHIRPatient['extension']> = []

  // Add tags as extension
  if (patient.tags?.length > 0) {
    extensions.push({
      url: 'https://clinicagenesis.com/fhir/StructureDefinition/patient-tags',
      valueString: patient.tags.join(','),
    })
  }

  // Add avatar as extension
  if (patient.avatar) {
    extensions.push({
      url: 'https://clinicagenesis.com/fhir/StructureDefinition/patient-avatar',
      valueUrl: patient.avatar,
    })
  }

  return extensions.length > 0 ? extensions : undefined
}
