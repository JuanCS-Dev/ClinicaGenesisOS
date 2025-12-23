/**
 * Workflow Types
 *
 * Types for automated workflow Cloud Functions.
 *
 * @module functions/workflows/types
 */

// =============================================================================
// WORKFLOW CONFIGURATION
// =============================================================================

export interface WorkflowConfig {
  /** Whether workflow is enabled */
  enabled: boolean;
  /** WhatsApp template name (if applicable) */
  templateName?: string;
  /** Delay in hours before execution (for follow-up) */
  delayHours?: number;
  /** Custom message (for free-form messages) */
  customMessage?: string;
}

export interface ClinicWorkflowSettings {
  followUp: WorkflowConfig & {
    delayHours: number; // Default 24
  };
  nps: WorkflowConfig & {
    delayHours: number; // Default 2
  };
  patientReturn: WorkflowConfig & {
    inactiveDays: number; // Default 90
    reminderFrequencyDays: number; // Default 30
  };
  labsIntegration: WorkflowConfig & {
    webhookSecret?: string;
    notifyPatient: boolean;
    notifyDoctor: boolean;
  };
}

export const DEFAULT_WORKFLOW_SETTINGS: ClinicWorkflowSettings = {
  followUp: {
    enabled: false,
    delayHours: 24,
    templateName: 'consulta_followup',
  },
  nps: {
    enabled: false,
    delayHours: 2,
    templateName: 'nps_survey',
  },
  patientReturn: {
    enabled: false,
    inactiveDays: 90,
    reminderFrequencyDays: 30,
    templateName: 'retorno_lembrete',
  },
  labsIntegration: {
    enabled: false,
    notifyPatient: true,
    notifyDoctor: true,
  },
};

// =============================================================================
// APPOINTMENT TYPES
// =============================================================================

export interface AppointmentForWorkflow {
  id: string;
  clinicId: string;
  patientId: string;
  patientName: string;
  patientPhone?: string;
  patientEmail?: string;
  professionalId: string;
  professionalName: string;
  date: string;
  status: string;
  type?: string;
  notes?: string;
  completedAt?: string;
}

// =============================================================================
// NPS TYPES
// =============================================================================

export interface NPSResponse {
  id?: string;
  clinicId: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  professionalId: string;
  professionalName: string;
  score: number; // 0-10
  feedback?: string;
  category: 'promoter' | 'passive' | 'detractor';
  createdAt: string;
}

export function getNPSCategory(score: number): NPSResponse['category'] {
  if (score >= 9) return 'promoter';
  if (score >= 7) return 'passive';
  return 'detractor';
}

// =============================================================================
// LAB RESULTS TYPES
// =============================================================================

export interface LabResultWebhookPayload {
  /** External lab order ID */
  orderId: string;
  /** Patient identifier (CPF or internal ID) */
  patientIdentifier: string;
  /** Type of exam */
  examType: string;
  /** Lab name */
  laboratoryName: string;
  /** Result date */
  resultDate: string;
  /** Whether there are critical values */
  hasCriticalValues: boolean;
  /** URL to download PDF result */
  resultUrl?: string;
  /** Raw result data (if structured) */
  resultData?: Record<string, unknown>;
}

export interface LabResult {
  id?: string;
  clinicId: string;
  patientId: string;
  patientName: string;
  orderId: string;
  examType: string;
  laboratoryName: string;
  resultDate: string;
  hasCriticalValues: boolean;
  resultUrl?: string;
  resultData?: Record<string, unknown>;
  notifiedPatient: boolean;
  notifiedDoctor: boolean;
  createdAt: string;
}

// =============================================================================
// PATIENT RETURN TYPES
// =============================================================================

export interface PatientForReturn {
  id: string;
  clinicId: string;
  name: string;
  phone?: string;
  email?: string;
  lastVisit: string;
  daysSinceLastVisit: number;
  lastReminderSent?: string;
  conditions?: string[]; // Chronic conditions that require follow-up
}

// =============================================================================
// WORKFLOW EXECUTION LOG
// =============================================================================

export interface WorkflowExecutionLog {
  id?: string;
  clinicId: string;
  workflowType: 'follow_up' | 'nps' | 'patient_return' | 'lab_result';
  targetId: string; // appointmentId, patientId, or labResultId
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  channel: 'whatsapp' | 'email' | 'in_app';
  messageId?: string;
  error?: string;
  createdAt: string;
  processedAt?: string;
}
