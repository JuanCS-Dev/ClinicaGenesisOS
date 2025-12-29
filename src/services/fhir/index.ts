/**
 * FHIR Services
 *
 * HL7 FHIR R4 converters for interoperability with RNDS and other health systems.
 *
 * @module services/fhir
 */

// Patient converter
export { toFHIRPatient, fromFHIRPatient } from './patient-converter'

// Appointment converter
export { toFHIRAppointment, fromFHIRAppointment } from './appointment-converter'

// Observation converter
export {
  anthropometryToFHIRObservations,
  soapToFHIRObservation,
  recordToFHIRObservations,
} from './observation-converter'
