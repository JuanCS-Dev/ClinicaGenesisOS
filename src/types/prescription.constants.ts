/**
 * Prescription Constants
 *
 * Labels, default values, and constants for the prescription module.
 * Separated for code organization and file size compliance.
 */

import type {
  PrescriptionType,
  PrescriptionStatus,
  AdministrationRoute,
  MedicationUnit,
} from './prescription';

/**
 * Default validity periods by prescription type (in days).
 */
export const DEFAULT_VALIDITY_DAYS: Record<PrescriptionType, number> = {
  common: 60,
  special_white: 30,
  blue: 30,
  yellow: 30,
  antimicrobial: 10,
};

/**
 * Prescription type labels in Portuguese.
 */
export const PRESCRIPTION_TYPE_LABELS: Record<PrescriptionType, string> = {
  common: 'Receita Simples',
  special_white: 'Receita Especial (Branca Carbonada)',
  blue: 'Receita Azul (B1/B2)',
  yellow: 'Receita Amarela (A1/A2/A3)',
  antimicrobial: 'Receita Antimicrobiano',
};

/**
 * Prescription status labels in Portuguese.
 */
export const PRESCRIPTION_STATUS_LABELS: Record<PrescriptionStatus, string> = {
  draft: 'Rascunho',
  pending_signature: 'Aguardando Assinatura',
  signed: 'Assinada',
  sent: 'Enviada',
  viewed: 'Visualizada',
  filled: 'Dispensada',
  expired: 'Expirada',
  canceled: 'Cancelada',
};

/**
 * Administration route labels in Portuguese.
 */
export const ADMINISTRATION_ROUTE_LABELS: Record<AdministrationRoute, string> = {
  oral: 'Via Oral',
  sublingual: 'Sublingual',
  topical: 'Tópico',
  intravenous: 'Intravenoso',
  intramuscular: 'Intramuscular',
  subcutaneous: 'Subcutâneo',
  inhalation: 'Inalatório',
  rectal: 'Retal',
  vaginal: 'Vaginal',
  ophthalmic: 'Oftálmico',
  nasal: 'Nasal',
  auricular: 'Auricular',
  transdermal: 'Transdérmico',
};

/**
 * Medication unit labels in Portuguese.
 */
export const MEDICATION_UNIT_LABELS: Record<MedicationUnit, string> = {
  comprimido: 'Comprimido(s)',
  cápsula: 'Cápsula(s)',
  ml: 'mL',
  mg: 'mg',
  gota: 'Gota(s)',
  ampola: 'Ampola(s)',
  sachê: 'Sachê(s)',
  envelope: 'Envelope(s)',
  adesivo: 'Adesivo(s)',
  aplicação: 'Aplicação(ões)',
  unidade: 'Unidade(s)',
};

/**
 * All available medication units.
 */
export const MEDICATION_UNITS: MedicationUnit[] = [
  'comprimido',
  'cápsula',
  'ml',
  'mg',
  'gota',
  'ampola',
  'sachê',
  'envelope',
  'adesivo',
  'aplicação',
  'unidade',
];

/**
 * All available administration routes.
 */
export const ADMINISTRATION_ROUTES: AdministrationRoute[] = [
  'oral',
  'sublingual',
  'topical',
  'intravenous',
  'intramuscular',
  'subcutaneous',
  'inhalation',
  'rectal',
  'vaginal',
  'ophthalmic',
  'nasal',
  'auricular',
  'transdermal',
];

/**
 * Control types that require yellow prescription.
 */
export const YELLOW_CONTROL_TYPES = ['A1', 'A2', 'A3'];

/**
 * Control types that require blue prescription.
 */
export const BLUE_CONTROL_TYPES = ['B1', 'B2'];

/**
 * Control types that require special white prescription.
 */
export const SPECIAL_WHITE_CONTROL_TYPES = ['C1', 'C2', 'C3', 'C4', 'C5'];
