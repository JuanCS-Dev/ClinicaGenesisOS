/**
 * OperadoraForm Component - Re-exports
 *
 * This file re-exports all operadora form components from the modular structure.
 * Maintained for backward compatibility with existing imports.
 *
 * @module components/settings/OperadoraForm
 * @deprecated Import directly from '@/components/settings/operadora-form' for new code.
 */

export {
  OperadoraForm,
  default,
  OperadoraBasicStep,
  OperadoraConfigStep,
  OperadoraContactStep,
  TABELA_OPTIONS,
  INTEGRACAO_OPTIONS,
} from './operadora-form'

export type {
  OperadoraFormProps,
  Step,
  StepDefinition,
  BasicFormData,
  ConfigFormData,
  ContactFormData,
} from './operadora-form'
