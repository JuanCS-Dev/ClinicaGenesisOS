import type React from 'react';

// Clinical Reasoning Engine Types (3.3)
export * from './clinical-reasoning';

// Finance Types (4.1)
export * from './finance';

// Telemedicine Types (Phase 6)
export * from './telemedicine';

// TISS Billing Types (Phase 7)
export * from './tiss';

export enum Status {
  CONFIRMED = 'Confirmado',
  PENDING = 'Pendente',
  ARRIVED = 'Chegou',
  IN_PROGRESS = 'Atendendo',
  FINISHED = 'Finalizado',
  CANCELED = 'Cancelado',
  NO_SHOW = 'Faltou'
}

export type SpecialtyType = 'medicina' | 'nutricao' | 'psicologia';

export interface Patient {
  id: string;
  name: string;
  birthDate: string; // ISO Date
  age: number; // Calculated
  phone: string;
  email: string;
  avatar?: string;
  gender: string;
  address?: string;
  insurance?: string;
  insuranceNumber?: string;
  tags: string[];
  createdAt: string;
  nextAppointment?: string;
}

/** Recurrence frequency options. */
export type RecurrenceFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly';

/** Recurrence pattern for appointments. */
export interface RecurrencePattern {
  /** Frequency of recurrence */
  frequency: RecurrenceFrequency;
  /** End date for recurrence (ISO date) - null means no end */
  endDate: string | null;
  /** Days of week for weekly recurrence (0=Sunday, 1=Monday, etc.) */
  daysOfWeek?: number[];
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string; // Denormalized for performance
  patientPhone?: string; // For WhatsApp reminders
  date: string; // ISO Date
  durationMin: number;
  procedure: string;
  status: Status;
  professional: string;
  specialty: SpecialtyType;
  notes?: string;
  /** Recurrence pattern (if recurring) */
  recurrence?: RecurrencePattern;
  /** Parent appointment ID (for expanded recurring instances) */
  recurrenceParentId?: string;
  /** WhatsApp reminder tracking */
  reminder?: {
    confirmation?: {
      status: ReminderStatus;
      sentAt?: string;
      messageId?: string;
    };
    reminder24h?: {
      status: ReminderStatus;
      sentAt?: string;
      messageId?: string;
    };
    reminder2h?: {
      status: ReminderStatus;
      sentAt?: string;
      messageId?: string;
      usedTemplate?: boolean;
    };
    lastInteraction?: string;
    patientResponse?: {
      confirmed?: boolean;
      respondedAt: string;
      message?: string;
      needsReschedule?: boolean;
    };
  };
}

// --- TIMELINE TYPES ---

export enum TimelineEventType {
  CONSULTATION = 'Consulta',
  EXAM = 'Exame',
  PRESCRIPTION = 'Prescrição',
  PHOTO = 'Foto',
  PAYMENT = 'Pagamento'
}

export interface TimelineEvent {
  id: string;
  date: Date;
  type: TimelineEventType;
  title: string;
  description: string;
  details?: string;
}

export interface AnthropometryData {
  date: string;
  weight: number;
  height: number;
  imc: number;
  waist: number;
  hip: number;
  bodyFat: number;
}

// --- PLUGIN SYSTEM TYPES ---

export enum RecordType {
  NOTE = 'note',
  SOAP = 'soap', // Added explicit SOAP type
  PRESCRIPTION = 'prescription',
  EXAM_REQUEST = 'exam_request', // Renamed for clarity
  ANTHROPOMETRY = 'anthropometry',
  DIET_PLAN = 'diet_plan',
  PSYCHO_SESSION = 'psycho_session'
}

// --- VERSIONING TYPES ---

/**
 * Attachment metadata for record files.
 */
export interface RecordAttachment {
  id: string;
  name: string;
  url: string;
  type: 'pdf' | 'image';
  size: number; // bytes
  uploadedAt: string;
  uploadedBy: string;
}

/**
 * Version snapshot of a record.
 * Stored in subcollection: /clinics/{clinicId}/records/{recordId}/versions/{versionId}
 */
export interface RecordVersion {
  id: string;
  version: number;
  data: Omit<MedicalRecord, 'id'>; // Snapshot of record at this version
  savedAt: string;
  savedBy: string;
  changeReason?: string; // Optional reason for the change
}

// Base interface for all records (Polymorphic)
export interface BaseRecord {
  id: string;
  patientId: string;
  date: string;
  professional: string;
  type: RecordType;
  specialty: SpecialtyType;
  // Versioning fields (optional for backwards compatibility with existing records)
  version?: number;
  updatedAt?: string;
  updatedBy?: string;
  // Attachments
  attachments?: RecordAttachment[];
}

export interface SoapRecord extends BaseRecord {
  type: RecordType.SOAP;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

export interface TextRecord extends BaseRecord {
  type: RecordType.NOTE;
  title: string;
  content: string;
}

export interface PrescriptionRecord extends BaseRecord {
  type: RecordType.PRESCRIPTION;
  medications: Array<{
    name: string;
    dosage: string;
    instructions: string;
  }>;
}

export interface ExamRequestRecord extends BaseRecord {
  type: RecordType.EXAM_REQUEST;
  exams: string[];
  justification: string;
}

export interface PsychoSessionRecord extends BaseRecord {
  type: RecordType.PSYCHO_SESSION;
  mood: 'happy' | 'neutral' | 'sad' | 'anxious' | 'angry';
  summary: string;
  privateNotes: string;
}

export interface AnthropometryRecord extends BaseRecord {
  type: RecordType.ANTHROPOMETRY;
  weight: number;
  height: number;
  imc: number;
  waist: number;
  hip: number;
}

export type MedicalRecord = 
  | SoapRecord
  | TextRecord 
  | PrescriptionRecord 
  | ExamRequestRecord
  | PsychoSessionRecord 
  | AnthropometryRecord;

export interface PluginDefinition {
  id: SpecialtyType;
  name: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
  features: string[];
}

// --- CLINIC & USER TYPES (Multi-tenancy) ---

/**
 * Pricing plan types for clinics.
 */
export type ClinicPlan = 'solo' | 'clinica' | 'black';

/**
 * User roles within a clinic.
 */
export type UserRole = 'owner' | 'admin' | 'professional' | 'receptionist';

/**
 * Clinic settings configuration.
 */
export interface ClinicSettings {
  workingHours: {
    start: string; // HH:mm format
    end: string;
  };
  defaultAppointmentDuration: number; // in minutes
  specialties: SpecialtyType[];
  timezone: string;
}

/**
 * Clinic entity representing a medical practice.
 * Root document in Firestore: /clinics/{clinicId}
 */
export interface Clinic {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  logo?: string;
  ownerId: string;
  plan: ClinicPlan;
  settings: ClinicSettings;
  createdAt: string;
  updatedAt: string;
}

/**
 * User profile stored in Firestore: /users/{userId}
 * Links Firebase Auth user to a clinic.
 */
export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  clinicId: string | null; // null if not yet associated with a clinic
  role: UserRole;
  specialty: SpecialtyType;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Input type for creating a new clinic (without auto-generated fields).
 * plan and settings are optional as the service provides defaults.
 */
export type CreateClinicInput = Pick<Clinic, 'name'> &
  Partial<Omit<Clinic, 'id' | 'createdAt' | 'updatedAt' | 'ownerId' | 'name'>>;

/**
 * Input type for creating a new patient (without auto-generated fields).
 */
export type CreatePatientInput = Omit<Patient, 'id' | 'createdAt' | 'age'>;

/**
 * Input type for creating a new appointment (without auto-generated fields).
 */
export type CreateAppointmentInput = Omit<Appointment, 'id'>;

/**
 * Fields that are auto-generated by the service and should not be provided on create.
 */
type RecordAutoFields = 'id' | 'date' | 'professional' | 'version' | 'updatedAt' | 'updatedBy' | 'attachments';

/**
 * Input type for creating a new medical record (without auto-generated fields).
 */
export type CreateRecordInput = Omit<MedicalRecord, RecordAutoFields>;

/**
 * Specific input types for each record type (for better type inference).
 */
export type CreateSoapRecordInput = Omit<SoapRecord, RecordAutoFields>;
export type CreateTextRecordInput = Omit<TextRecord, RecordAutoFields>;
export type CreatePrescriptionRecordInput = Omit<PrescriptionRecord, RecordAutoFields>;
export type CreateExamRequestRecordInput = Omit<ExamRequestRecord, RecordAutoFields>;
export type CreatePsychoSessionRecordInput = Omit<PsychoSessionRecord, RecordAutoFields>;
export type CreateAnthropometryRecordInput = Omit<AnthropometryRecord, RecordAutoFields>;

/**
 * Data returned by record editors.
 * Does not include patientId/specialty (added by context).
 */
export type EditorRecordData =
  | Omit<CreateSoapRecordInput, 'patientId' | 'specialty'>
  | Omit<CreatePrescriptionRecordInput, 'patientId' | 'specialty'>
  | Omit<CreateExamRequestRecordInput, 'patientId' | 'specialty'>
  | Omit<CreateAnthropometryRecordInput, 'patientId' | 'specialty'>
  | Omit<CreatePsychoSessionRecordInput, 'patientId' | 'specialty'>;

// --- AI & INTEGRATIONS TYPES (Multi-tenant ready) ---

/**
 * AI provider options.
 * MVP uses google-ai-studio (free), production uses client's vertex-ai.
 */
export type AIProvider = 'google-ai-studio' | 'vertex-ai';

/**
 * WhatsApp reminder status for appointments.
 */
export type ReminderStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed';

/**
 * WhatsApp integration config per clinic.
 * Stored in /clinics/{clinicId}/settings/integrations
 */
export interface WhatsAppConfig {
  enabled: boolean;
  phoneNumberId: string;
  accessToken: string; // Encrypted in Firestore
  businessAccountId: string;
  verifyToken: string; // For webhook verification
}

/**
 * AI integration config per clinic.
 * Stored in /clinics/{clinicId}/settings/integrations
 */
export interface AIConfig {
  enabled: boolean;
  provider: AIProvider;
  apiKey?: string; // Encrypted, only if client provides own key
  useSharedKey: boolean; // MVP: true (uses our key)
  features: {
    scribe: boolean;
    diagnosticHelper: boolean;
  };
}

/**
 * All integrations for a clinic.
 * Stored in /clinics/{clinicId}/settings/integrations
 */
export interface ClinicIntegrations {
  whatsapp?: WhatsAppConfig;
  ai?: AIConfig;
  updatedAt: string;
  updatedBy: string;
}

/**
 * AI-generated content metadata for audit trail.
 */
export interface AIMetadata {
  generated: boolean;
  provider: AIProvider;
  model: string;
  promptVersion: string;
  generatedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

/**
 * Extended SOAP record with AI generation support.
 */
export interface AISoapRecord extends SoapRecord {
  aiMetadata?: AIMetadata;
  transcription?: string; // Original audio transcription
}

/**
 * WhatsApp reminder tracking for appointments.
 */
export interface AppointmentReminder {
  appointmentId: string;
  patientPhone: string;
  reminder24h: {
    status: ReminderStatus;
    sentAt?: string;
    messageId?: string;
  };
  reminder2h: {
    status: ReminderStatus;
    sentAt?: string;
    messageId?: string;
  };
  patientResponse?: {
    confirmed: boolean;
    respondedAt: string;
    message?: string;
  };
}

/**
 * Exam analysis result from AI Diagnostic Helper.
 */
export interface ExamAnalysis {
  id: string;
  patientId: string;
  examType: string;
  analyzedAt: string;
  analyzedBy: string; // userId who requested
  aiMetadata: AIMetadata;
  values: Array<{
    name: string;
    value: string;
    unit: string;
    referenceRange: string;
    status: 'normal' | 'altered' | 'critical';
    note?: string;
  }>;
  summary: string;
  attentionPoints: string[];
  suggestedQuestions: string[];
  attachmentId?: string; // Reference to uploaded exam image/PDF
}

// --- AI SCRIBE TYPES ---

/**
 * Status of an AI Scribe recording/processing session.
 */
export type AIScribeStatus =
  | 'idle'
  | 'recording'
  | 'paused'
  | 'uploading'
  | 'processing'
  | 'ready'
  | 'error';

/**
 * Extracted data from audio transcription.
 */
export interface AIScribeExtractedData {
  chiefComplaint?: string;
  symptoms?: string[];
  medications?: string[];
  allergies?: string[];
  vitalSigns?: {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    weight?: number;
    height?: number;
  };
}

/**
 * Result from AI Scribe processing.
 */
export interface AIScribeResult {
  transcription: string;
  soap: {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
  };
  extractedData?: AIScribeExtractedData;
  confidence?: number;
  processingTimeMs?: number;
}

/**
 * AI Scribe session tracking.
 */
export interface AIScribeSession {
  id: string;
  patientId: string;
  clinicId: string;
  status: AIScribeStatus;
  audioUrl?: string;
  audioDurationSec?: number;
  result?: AIScribeResult;
  error?: string;
  aiMetadata?: AIMetadata;
  createdAt: string;
  completedAt?: string;
}