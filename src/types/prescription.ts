/**
 * Digital Prescription Module Types
 * =================================
 *
 * Type definitions for the Memed digital prescription integration.
 * Supports e-CPF digital signing per CFM/CFF/ITI regulations.
 *
 * @module types/prescription
 */

// =============================================================================
// ENUMS & CONSTANTS
// =============================================================================

/**
 * Status of a digital prescription.
 */
export type PrescriptionStatus =
  | 'draft'
  | 'pending_signature'
  | 'signed'
  | 'sent'
  | 'viewed'
  | 'filled'
  | 'expired'
  | 'canceled';

/**
 * Type of prescription based on medication control.
 */
export type PrescriptionType =
  | 'common'         // Receita simples (branca)
  | 'special_white'  // Receita especial (branca carbonada - C1/C5)
  | 'blue'           // Receita azul (B1/B2 - controlados)
  | 'yellow'         // Receita amarela (A1/A2/A3 - entorpecentes)
  | 'antimicrobial'; // Receita antimicrobiano (RDC 20/2011)

/**
 * Certificate type for digital signature.
 */
export type CertificateType = 'A1' | 'A3';

/**
 * SNCR (Sistema Nacional de Controle de Receituário) status.
 */
export type SNcRStatus = 'pending' | 'validated' | 'rejected' | 'not_applicable';

// =============================================================================
// MEDICATION TYPES
// =============================================================================

/**
 * Medication unit of measurement.
 */
export type MedicationUnit =
  | 'comprimido'
  | 'cápsula'
  | 'ml'
  | 'mg'
  | 'gota'
  | 'ampola'
  | 'sachê'
  | 'envelope'
  | 'adesivo'
  | 'aplicação'
  | 'unidade';

/**
 * Administration route for medication.
 */
export type AdministrationRoute =
  | 'oral'
  | 'sublingual'
  | 'topical'
  | 'intravenous'
  | 'intramuscular'
  | 'subcutaneous'
  | 'inhalation'
  | 'rectal'
  | 'vaginal'
  | 'ophthalmic'
  | 'nasal'
  | 'auricular'
  | 'transdermal';

/**
 * Medication item in a prescription.
 */
export interface PrescriptionMedication {
  /** Internal ID */
  id: string;
  /** Memed medication ID (if from Memed database) */
  memedId?: string;
  /** Commercial name */
  name: string;
  /** Active principle(s) */
  activePrinciple?: string;
  /** Presentation (e.g., "500mg, caixa com 20 comprimidos") */
  presentation?: string;
  /** Dosage per administration */
  dosage: string;
  /** Unit of measurement */
  unit: MedicationUnit;
  /** Administration route */
  route: AdministrationRoute;
  /** Frequency (e.g., "8 em 8 horas") */
  frequency: string;
  /** Duration (e.g., "7 dias") */
  duration: string;
  /** Quantity to dispense */
  quantity: number;
  /** Additional instructions */
  instructions?: string;
  /** Whether it's a controlled substance */
  isControlled: boolean;
  /** Control type (B1, B2, C1, A1, etc.) */
  controlType?: string;
  /** Whether continuous use */
  continuousUse: boolean;
}

// =============================================================================
// DIGITAL CERTIFICATE TYPES
// =============================================================================

/**
 * Digital certificate configuration for e-CPF.
 */
export interface DigitalCertificate {
  /** Certificate ID */
  id: string;
  /** Certificate type (A1 = file, A3 = token/smartcard) */
  type: CertificateType;
  /** Certificate subject (CN) */
  subjectName: string;
  /** Issuing authority */
  issuer: string;
  /** Serial number */
  serialNumber: string;
  /** Expiration date */
  expiresAt: string;
  /** Whether certificate is currently valid */
  isValid: boolean;
  /** CPF from certificate */
  cpf: string;
  /** CRM/CRN/CRP number extracted */
  professionalRegistration?: string;
  /** Last used timestamp */
  lastUsedAt?: string;
  /** Certificate file path (A1 only) */
  filePath?: string;
}

/**
 * Input for configuring a new certificate.
 */
export type ConfigureCertificateInput = Pick<
  DigitalCertificate,
  'type' | 'filePath'
> & {
  /** Certificate password (A1 only) */
  password?: string;
};

// =============================================================================
// PRESCRIPTION TYPES
// =============================================================================

/**
 * Digital prescription stored in Firestore.
 * Path: /clinics/{clinicId}/prescriptions/{prescriptionId}
 */
export interface Prescription {
  /** Prescription ID */
  id: string;
  /** Clinic ID */
  clinicId: string;
  /** Patient ID */
  patientId: string;
  /** Patient name (denormalized) */
  patientName: string;
  /** Patient CPF */
  patientCpf?: string;
  /** Professional user ID */
  professionalId: string;
  /** Professional name (denormalized) */
  professionalName: string;
  /** Professional CRM */
  professionalCrm: string;
  /** Professional CRM state */
  professionalCrmState: string;
  /** Prescription type */
  type: PrescriptionType;
  /** Current status */
  status: PrescriptionStatus;
  /** List of medications */
  medications: PrescriptionMedication[];
  /** General observations */
  observations?: string;
  /** Validity period in days */
  validityDays: number;
  /** Prescription date */
  prescribedAt: string;
  /** Expiration date */
  expiresAt: string;
  /** Digital signature data */
  signature?: {
    /** Signed by (certificate subject) */
    signedBy: string;
    /** Signature timestamp */
    signedAt: string;
    /** Certificate serial */
    certificateSerial: string;
    /** Signature hash */
    signatureHash: string;
  };
  /** Memed prescription ID (if generated via Memed) */
  memedPrescriptionId?: string;
  /** Memed access token for patient */
  memedAccessToken?: string;
  /** Unique code for pharmacy validation */
  validationCode?: string;
  /** SNCR (controlled substances) data */
  sncr?: {
    status: SNcRStatus;
    submittedAt?: string;
    validatedAt?: string;
    rejectionReason?: string;
  };
  /** When prescription was sent to patient */
  sentAt?: string;
  /** When patient viewed the prescription */
  viewedAt?: string;
  /** When prescription was filled at pharmacy */
  filledAt?: string;
  /** Pharmacy that filled the prescription */
  filledByPharmacy?: string;
  /** Created timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
}

/**
 * Input for creating a new prescription.
 */
export type CreatePrescriptionInput = Pick<
  Prescription,
  | 'patientId'
  | 'patientName'
  | 'patientCpf'
  | 'type'
  | 'medications'
  | 'observations'
  | 'validityDays'
>;

/**
 * Input for updating a prescription.
 */
export type UpdatePrescriptionInput = Partial<
  Pick<
    Prescription,
    | 'medications'
    | 'observations'
    | 'validityDays'
    | 'status'
  >
>;

// =============================================================================
// MEMED INTEGRATION TYPES
// =============================================================================

/**
 * Memed SDK configuration.
 */
export interface MemedConfig {
  /** Memed API token */
  token: string;
  /** Environment (sandbox or production) */
  environment: 'sandbox' | 'production';
  /** Professional Memed ID */
  professionalId?: string;
  /** Whether to use external prescription (Memed PDF) */
  useExternalPrescription: boolean;
}

/**
 * Memed SDK initialization status.
 */
export type MemedSDKStatus =
  | 'not_initialized'
  | 'initializing'
  | 'ready'
  | 'error';

/**
 * Memed prescription callback data.
 */
export interface MemedPrescriptionData {
  /** Memed prescription ID */
  prescriptionId: string;
  /** Patient token for access */
  patientToken: string;
  /** PDF URL */
  pdfUrl: string;
  /** List of prescribed medications */
  medications: Array<{
    id: string;
    name: string;
    posology: string;
    quantity: number;
  }>;
}

/**
 * Memed medication search result.
 */
export interface MemedMedication {
  /** Memed medication ID */
  id: string;
  /** Commercial name */
  name: string;
  /** Active principle */
  activePrinciple: string;
  /** Presentation */
  presentation: string;
  /** Manufacturer */
  manufacturer: string;
  /** Whether it's a controlled substance */
  isControlled: boolean;
  /** Control type */
  controlType?: string;
  /** Whether it requires special prescription */
  requiresSpecialPrescription: boolean;
}

// =============================================================================
// COMPONENT PROPS - Re-exported from prescription.props.ts
// =============================================================================

export type {
  MemedPrescriptionProps,
  PrescriptionModalProps,
  PrescriptionPreviewProps,
  CertificateSetupProps,
  MedicationSearchProps,
} from './prescription.props';

// =============================================================================
// HOOK RETURN TYPES
// =============================================================================

/**
 * Return type for usePrescription hook.
 */
export interface UsePrescriptionReturn {
  /** Current prescription (if loaded) */
  prescription: Prescription | null;
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: Error | null;
  /** Create a new prescription */
  createPrescription: (input: CreatePrescriptionInput) => Promise<string>;
  /** Update an existing prescription */
  updatePrescription: (id: string, input: UpdatePrescriptionInput) => Promise<void>;
  /** Sign a prescription */
  signPrescription: (id: string) => Promise<void>;
  /** Send prescription to patient */
  sendToPatient: (id: string, method: 'email' | 'sms' | 'whatsapp') => Promise<void>;
  /** Cancel a prescription */
  cancelPrescription: (id: string, reason: string) => Promise<void>;
  /** Get prescription by ID */
  getPrescription: (id: string) => Promise<Prescription | null>;
}

/**
 * Return type for usePrescriptionHistory hook.
 */
export interface UsePrescriptionHistoryReturn {
  /** List of prescriptions for patient */
  prescriptions: Prescription[];
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: Error | null;
  /** Refresh the list */
  refresh: () => Promise<void>;
}

/**
 * Return type for useMemed hook.
 */
export interface UseMemedReturn {
  /** SDK initialization status */
  status: MemedSDKStatus;
  /** Error message if status is 'error' */
  errorMessage?: string;
  /** Whether SDK is ready */
  isReady: boolean;
  /** Initialize the SDK */
  initialize: () => Promise<void>;
  /** Search medications */
  searchMedications: (query: string) => Promise<MemedMedication[]>;
  /** Create prescription via Memed */
  createMemedPrescription: (
    patientId: string,
    medications: PrescriptionMedication[]
  ) => Promise<MemedPrescriptionData>;
}

/**
 * Return type for useDigitalCertificate hook.
 */
export interface UseDigitalCertificateReturn {
  /** Current certificate */
  certificate: DigitalCertificate | null;
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: Error | null;
  /** Whether certificate is configured */
  isConfigured: boolean;
  /** Whether certificate is valid */
  isValid: boolean;
  /** Configure a new certificate */
  configureCertificate: (input: ConfigureCertificateInput) => Promise<void>;
  /** Remove current certificate */
  removeCertificate: () => Promise<void>;
  /** Sign data with certificate */
  signData: (data: string) => Promise<string>;
}

// =============================================================================
// AUDIT TYPES
// =============================================================================

/**
 * Prescription audit log entry.
 */
export interface PrescriptionLogEntry {
  /** Log entry ID */
  id: string;
  /** Prescription ID */
  prescriptionId: string;
  /** Event type */
  eventType:
    | 'created'
    | 'updated'
    | 'signed'
    | 'sent'
    | 'viewed'
    | 'filled'
    | 'canceled'
    | 'expired';
  /** User who triggered the event */
  userId: string;
  /** User name */
  userName: string;
  /** Event details */
  details?: Record<string, unknown>;
  /** Timestamp */
  timestamp: string;
}

// =============================================================================
// CONSTANTS - Re-exported from prescription.constants.ts
// =============================================================================

export {
  DEFAULT_VALIDITY_DAYS,
  PRESCRIPTION_TYPE_LABELS,
  PRESCRIPTION_STATUS_LABELS,
  ADMINISTRATION_ROUTE_LABELS,
  MEDICATION_UNIT_LABELS,
  MEDICATION_UNITS,
  ADMINISTRATION_ROUTES,
  YELLOW_CONTROL_TYPES,
  BLUE_CONTROL_TYPES,
  SPECIAL_WHITE_CONTROL_TYPES,
} from './prescription.constants';
