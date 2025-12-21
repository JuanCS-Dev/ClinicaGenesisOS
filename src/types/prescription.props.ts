/**
 * Prescription Component Props
 *
 * Type definitions for prescription component props.
 * Separated for code organization and file size compliance.
 */

import type {
  Prescription,
  DigitalCertificate,
  MemedMedication,
} from './prescription';

/**
 * Props for MemedPrescription component.
 */
export interface MemedPrescriptionProps {
  /** Patient ID */
  patientId: string;
  /** Patient name */
  patientName: string;
  /** Patient CPF (optional, for SNCR) */
  patientCpf?: string;
  /** Callback when prescription is created */
  onPrescriptionCreated: (prescription: Prescription) => void;
  /** Callback when component closes */
  onClose: () => void;
  /** Whether to show in modal */
  isModal?: boolean;
}

/**
 * Props for PrescriptionModal component.
 */
export interface PrescriptionModalProps {
  /** Whether modal is open */
  isOpen: boolean;
  /** Close modal callback */
  onClose: () => void;
  /** Patient ID */
  patientId: string;
  /** Patient name */
  patientName: string;
  /** Patient CPF */
  patientCpf?: string;
  /** Existing prescription to edit (optional) */
  existingPrescription?: Prescription;
  /** Callback when prescription is saved */
  onSave: (prescription: Prescription) => void;
}

/**
 * Props for PrescriptionPreview component.
 */
export interface PrescriptionPreviewProps {
  /** Prescription to preview */
  prescription: Prescription;
  /** Whether to show in compact mode */
  compact?: boolean;
  /** Whether to show actions */
  showActions?: boolean;
  /** Callback to sign prescription */
  onSign?: () => void;
  /** Callback to send to patient */
  onSend?: () => void;
  /** Callback to cancel prescription */
  onCancel?: () => void;
  /** Callback to print */
  onPrint?: () => void;
}

/**
 * Props for CertificateSetup component.
 */
export interface CertificateSetupProps {
  /** Current certificate (if configured) */
  certificate?: DigitalCertificate;
  /** Callback when certificate is configured */
  onCertificateConfigured: (certificate: DigitalCertificate) => void;
  /** Callback to close/cancel */
  onClose: () => void;
}

/**
 * Props for MedicationSearch component.
 */
export interface MedicationSearchProps {
  /** Callback when medication is selected */
  onSelect: (medication: MemedMedication) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Whether the input is disabled */
  disabled?: boolean;
}
