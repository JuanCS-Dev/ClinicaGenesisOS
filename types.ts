export enum Status {
  CONFIRMED = 'Confirmado',
  PENDING = 'Pendente',
  ARRIVED = 'Chegou',
  IN_PROGRESS = 'Atendendo',
  FINISHED = 'Finalizado',
  CANCELED = 'Cancelado'
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

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string; // Denormalized for performance
  date: string; // ISO Date
  durationMin: number;
  procedure: string;
  status: Status;
  professional: string;
  specialty: SpecialtyType;
  notes?: string;
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

// Base interface for all records (Polymorphic)
export interface BaseRecord {
  id: string;
  patientId: string;
  date: string;
  professional: string;
  type: RecordType;
  specialty: SpecialtyType;
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
  icon: any; // Lucide Icon
  features: string[];
}