/**
 * Firestore Services
 *
 * Re-exports all Firestore service modules for convenient importing.
 *
 * @example
 * import { userService, clinicService, patientService } from '@/services/firestore';
 */

export { userService } from './user.service'
export type { CreateUserProfileInput, UpdateUserProfileInput } from './user.service'

export { clinicService } from './clinic.service'

export { patientService } from './patient.service'

export { appointmentService } from './appointment.service'

export { recordService } from './record.service'
export { recordVersionService } from './record-version.service'

export { transactionService } from './transaction.service'

export { telemedicineService } from './telemedicine.service'

export { prescriptionService } from './prescription.service'
export { prescriptionWorkflowService } from './prescription-workflow.service'

export { seedClinicData, removeDemoData } from './seed.service'

export { operadoraService } from './operadora.service'

export { guiaService } from './guia.service'

export { taskService } from './task.service'

export { labResultService } from './lab-result.service'

export { messageService } from './message.service'
