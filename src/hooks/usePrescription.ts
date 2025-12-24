/**
 * usePrescription Hooks - Re-exports
 *
 * This file re-exports all prescription hooks from the modular structure.
 * Maintained for backward compatibility with existing imports.
 *
 * @module hooks/usePrescription
 * @deprecated Import directly from '@/hooks/prescription' for new code.
 */

export {
  usePrescription,
  usePrescriptionHistory,
  usePrescriptionValidation,
  usePrescriptionStats,
} from './prescription'

export type {
  UsePrescriptionValidationReturn,
  PrescriptionStats,
  UsePrescriptionStatsReturn,
} from './prescription'
