/**
 * FHIR R4 REST API Endpoints
 *
 * Provides FHIR-compliant REST endpoints for interoperability.
 * Supports Patient, Appointment, and Observation resources.
 *
 * @module functions/fhir
 */

import { onRequest } from 'firebase-functions/v2/https'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'
import {
  toFHIRPatient,
  fromFHIRPatient,
  toFHIRAppointment,
  toFHIRObservations,
} from './converters.js'
import type { PatientData, AppointmentData, AnthropometryData } from './types.js'

const REGION = 'southamerica-east1'

// FHIR OperationOutcome helper
function operationOutcome(
  severity: 'error' | 'warning' | 'information',
  code: string,
  message: string
) {
  return {
    resourceType: 'OperationOutcome',
    issue: [
      {
        severity,
        code,
        diagnostics: message,
      },
    ],
  }
}

// Verify Firebase token and extract claims
async function verifyToken(authHeader?: string): Promise<{
  uid: string
  clinicId: string
} | null> {
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }

  try {
    const token = authHeader.slice(7)
    const decoded = await getAuth().verifyIdToken(token)
    const clinicId = decoded.clinicId as string | undefined

    if (!clinicId) {
      return null
    }

    return { uid: decoded.uid, clinicId }
  } catch {
    return null
  }
}

/**
 * FHIR Patient Endpoint
 *
 * GET /fhir/Patient/:id - Read patient
 * GET /fhir/Patient - Search patients
 * POST /fhir/Patient - Create patient
 * PUT /fhir/Patient/:id - Update patient
 */
export const fhirPatient = onRequest(
  {
    region: REGION,
    cors: true,
    maxInstances: 10,
  },
  async (req, res) => {
    // Verify authentication
    const auth = await verifyToken(req.headers.authorization)
    if (!auth) {
      res.status(401).json(operationOutcome('error', 'security', 'Unauthorized'))
      return
    }

    const db = getFirestore()
    const { clinicId } = auth

    // Parse path to get resource ID
    const pathParts = req.path.split('/').filter(Boolean)
    const resourceId = pathParts.length > 1 ? pathParts[pathParts.length - 1] : null

    try {
      switch (req.method) {
        case 'GET': {
          if (resourceId && resourceId !== 'Patient') {
            // Read single patient
            const doc = await db.doc(`clinics/${clinicId}/patients/${resourceId}`).get()

            if (!doc.exists) {
              res.status(404).json(operationOutcome('error', 'not-found', 'Patient not found'))
              return
            }

            const patient = { id: doc.id, ...doc.data() } as PatientData
            res.json(toFHIRPatient(patient, clinicId))
          } else {
            // Search patients (return Bundle)
            const snapshot = await db
              .collection(`clinics/${clinicId}/patients`)
              .orderBy('name')
              .limit(100)
              .get()

            const entries = snapshot.docs.map(doc => {
              const patient = { id: doc.id, ...doc.data() } as PatientData
              return {
                fullUrl: `Patient/${doc.id}`,
                resource: toFHIRPatient(patient, clinicId),
              }
            })

            res.json({
              resourceType: 'Bundle',
              type: 'searchset',
              total: entries.length,
              entry: entries,
            })
          }
          break
        }

        case 'POST': {
          // Create new patient
          const fhirPatient = req.body
          if (fhirPatient.resourceType !== 'Patient') {
            res.status(400).json(operationOutcome('error', 'invalid', 'Expected Patient resource'))
            return
          }

          const patientData = fromFHIRPatient(fhirPatient, clinicId)
          const docRef = await db.collection(`clinics/${clinicId}/patients`).add({
            ...patientData,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
          })

          const created = { ...patientData, id: docRef.id }
          res.status(201).json(toFHIRPatient(created, clinicId))
          break
        }

        case 'PUT': {
          // Update patient
          if (!resourceId || resourceId === 'Patient') {
            res.status(400).json(operationOutcome('error', 'invalid', 'Patient ID required'))
            return
          }

          const fhirPatient = req.body
          if (fhirPatient.resourceType !== 'Patient') {
            res.status(400).json(operationOutcome('error', 'invalid', 'Expected Patient resource'))
            return
          }

          const patientData = fromFHIRPatient(fhirPatient, clinicId)
          await db.doc(`clinics/${clinicId}/patients/${resourceId}`).update({
            ...patientData,
            updatedAt: FieldValue.serverTimestamp(),
          })

          const updated = { ...patientData, id: resourceId }
          res.json(toFHIRPatient(updated, clinicId))
          break
        }

        default:
          res.status(405).json(operationOutcome('error', 'not-supported', 'Method not allowed'))
      }
    } catch (error) {
      console.error('FHIR Patient error:', error)
      res
        .status(500)
        .json(
          operationOutcome(
            'error',
            'exception',
            error instanceof Error ? error.message : 'Internal error'
          )
        )
    }
  }
)

/**
 * FHIR Appointment Endpoint
 *
 * GET /fhir/Appointment/:id - Read appointment
 * GET /fhir/Appointment - Search appointments
 */
export const fhirAppointment = onRequest(
  {
    region: REGION,
    cors: true,
    maxInstances: 10,
  },
  async (req, res) => {
    // Verify authentication
    const auth = await verifyToken(req.headers.authorization)
    if (!auth) {
      res.status(401).json(operationOutcome('error', 'security', 'Unauthorized'))
      return
    }

    const db = getFirestore()
    const { clinicId } = auth

    // Parse path
    const pathParts = req.path.split('/').filter(Boolean)
    const resourceId = pathParts.length > 1 ? pathParts[pathParts.length - 1] : null

    try {
      switch (req.method) {
        case 'GET': {
          if (resourceId && resourceId !== 'Appointment') {
            // Read single appointment
            const doc = await db.doc(`clinics/${clinicId}/appointments/${resourceId}`).get()

            if (!doc.exists) {
              res.status(404).json(operationOutcome('error', 'not-found', 'Appointment not found'))
              return
            }

            const appt = { id: doc.id, ...doc.data() } as AppointmentData
            res.json(toFHIRAppointment(appt, clinicId))
          } else {
            // Search appointments
            const { date, patient } = req.query
            let query = db.collection(`clinics/${clinicId}/appointments`) as FirebaseFirestore.Query

            if (date) {
              // Filter by date (YYYY-MM-DD)
              const startOfDay = `${date}T00:00:00.000Z`
              const endOfDay = `${date}T23:59:59.999Z`
              query = query.where('date', '>=', startOfDay).where('date', '<=', endOfDay)
            }

            if (patient) {
              query = query.where('patientId', '==', patient)
            }

            const snapshot = await query.limit(100).get()

            const entries = snapshot.docs.map(doc => {
              const appt = { id: doc.id, ...doc.data() } as AppointmentData
              return {
                fullUrl: `Appointment/${doc.id}`,
                resource: toFHIRAppointment(appt, clinicId),
              }
            })

            res.json({
              resourceType: 'Bundle',
              type: 'searchset',
              total: entries.length,
              entry: entries,
            })
          }
          break
        }

        default:
          res.status(405).json(operationOutcome('error', 'not-supported', 'Method not allowed'))
      }
    } catch (error) {
      console.error('FHIR Appointment error:', error)
      res
        .status(500)
        .json(
          operationOutcome(
            'error',
            'exception',
            error instanceof Error ? error.message : 'Internal error'
          )
        )
    }
  }
)

/**
 * FHIR Observation Endpoint
 *
 * GET /fhir/Observation - Search observations (from anthropometry records)
 */
export const fhirObservation = onRequest(
  {
    region: REGION,
    cors: true,
    maxInstances: 10,
  },
  async (req, res) => {
    // Verify authentication
    const auth = await verifyToken(req.headers.authorization)
    if (!auth) {
      res.status(401).json(operationOutcome('error', 'security', 'Unauthorized'))
      return
    }

    const db = getFirestore()
    const { clinicId } = auth

    try {
      if (req.method !== 'GET') {
        res.status(405).json(operationOutcome('error', 'not-supported', 'Method not allowed'))
        return
      }

      const { patient, category } = req.query
      let query = db
        .collection(`clinics/${clinicId}/records`)
        .where('type', '==', 'anthropometry') as FirebaseFirestore.Query

      if (patient) {
        query = query.where('patientId', '==', patient)
      }

      const snapshot = await query.limit(50).get()

      const entries: Array<{ fullUrl: string; resource: unknown }> = []

      for (const doc of snapshot.docs) {
        const data = { id: doc.id, ...doc.data() } as AnthropometryData
        const observations = toFHIRObservations(data, clinicId)

        // Filter by category if specified
        if (category === 'vital-signs' || !category) {
          for (const obs of observations) {
            entries.push({
              fullUrl: `Observation/${obs.id}`,
              resource: obs,
            })
          }
        }
      }

      res.json({
        resourceType: 'Bundle',
        type: 'searchset',
        total: entries.length,
        entry: entries,
      })
    } catch (error) {
      console.error('FHIR Observation error:', error)
      res
        .status(500)
        .json(
          operationOutcome(
            'error',
            'exception',
            error instanceof Error ? error.message : 'Internal error'
          )
        )
    }
  }
)

/**
 * FHIR CapabilityStatement
 *
 * Returns server capabilities (required for SMART on FHIR)
 */
export const fhirMetadata = onRequest(
  {
    region: REGION,
    cors: true,
    maxInstances: 5,
  },
  async (_req, res) => {
    res.json({
      resourceType: 'CapabilityStatement',
      status: 'active',
      date: new Date().toISOString(),
      kind: 'instance',
      software: {
        name: 'Clinica Genesis OS',
        version: '1.0.0',
      },
      implementation: {
        description: 'Clinica Genesis FHIR R4 Server',
      },
      fhirVersion: '4.0.1',
      format: ['application/fhir+json', 'application/json'],
      rest: [
        {
          mode: 'server',
          resource: [
            {
              type: 'Patient',
              interaction: [
                { code: 'read' },
                { code: 'search-type' },
                { code: 'create' },
                { code: 'update' },
              ],
              searchParam: [
                { name: 'name', type: 'string' },
                { name: 'identifier', type: 'token' },
              ],
            },
            {
              type: 'Appointment',
              interaction: [{ code: 'read' }, { code: 'search-type' }],
              searchParam: [
                { name: 'date', type: 'date' },
                { name: 'patient', type: 'reference' },
              ],
            },
            {
              type: 'Observation',
              interaction: [{ code: 'search-type' }],
              searchParam: [
                { name: 'patient', type: 'reference' },
                { name: 'category', type: 'token' },
              ],
            },
          ],
          security: {
            cors: true,
            service: [
              {
                coding: [
                  {
                    system: 'http://terminology.hl7.org/CodeSystem/restful-security-service',
                    code: 'SMART-on-FHIR',
                  },
                ],
              },
            ],
          },
        },
      ],
    })
  }
)
