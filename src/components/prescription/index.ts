/**
 * Prescription Components
 *
 * Components for digital prescription management with Memed integration.
 *
 * @module components/prescription
 */

export { MedicationSearch } from './MedicationSearch';
export { MedicationForm } from './MedicationForm';
export { PrescriptionPreview } from './PrescriptionPreview';
export { PrescriptionModal } from './PrescriptionModal';
export { CertificateSetup } from './CertificateSetup';

// Re-export types for convenience
export type {
  PrescriptionModalProps,
  PrescriptionPreviewProps,
  CertificateSetupProps,
  MedicationSearchProps,
} from '@/types';
