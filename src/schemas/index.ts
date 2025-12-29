/**
 * Schemas Index
 *
 * Central export for all Zod validation schemas.
 *
 * Usage:
 * ```typescript
 * import { validateCreatePatient, CreatePatientInput } from '@/schemas';
 *
 * const result = validateCreatePatient(formData);
 * if (!result.success) {
 *   console.error(result.error.format());
 * } else {
 *   const patient: CreatePatientInput = result.data;
 * }
 * ```
 *
 * @module schemas
 */

// Patient schemas and validators
export {
  // Schemas
  CreatePatientSchema,
  PatientSchema,
  UpdatePatientSchema,
  // Types
  type CreatePatientInput,
  type Patient as PatientValidated,
  type UpdatePatientInput,
  // Validators
  validateCreatePatient,
  validateUpdatePatient,
  validatePatient,
} from './patient'

// Appointment schemas and validators
export {
  // Schemas
  CreateAppointmentSchema,
  AppointmentSchema,
  UpdateAppointmentSchema,
  AppointmentStatusSchema,
  RecurrencePatternSchema,
  SpecialtySchema,
  // Types
  type CreateAppointmentInput,
  type Appointment as AppointmentValidated,
  type UpdateAppointmentInput,
  type AppointmentStatus,
  type RecurrenceFrequency,
  type RecurrencePattern,
  type Specialty,
  // Validators
  validateCreateAppointment,
  validateUpdateAppointment,
  validateAppointment,
} from './appointment'

// Payment schemas and validators
export {
  // Schemas
  CreatePaymentInputSchema,
  CreateBoletoPaymentSchema,
  ClinicPixConfigSchema,
  PaymentRecordSchema,
  PaymentMethodSchema,
  PaymentDisplayStatusSchema,
  CustomerAddressSchema,
  // Types
  type CreatePaymentInput,
  type CreateBoletoPayment,
  type ClinicPixConfig,
  type PaymentRecord,
  type PaymentMethod,
  type PaymentDisplayStatus,
  type CustomerAddress,
  // Validators
  validateCreatePayment,
  validateBoletoPayment,
  validatePixConfig,
  validatePaymentRecord,
} from './payment'
