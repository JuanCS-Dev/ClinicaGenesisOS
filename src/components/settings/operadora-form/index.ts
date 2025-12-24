/**
 * Operadora Form Module
 *
 * Multi-step wizard for health insurance operator management.
 *
 * @module components/settings/operadora-form
 */

export { OperadoraForm, default } from './OperadoraForm'
export { OperadoraBasicStep } from './OperadoraBasicStep'
export { OperadoraConfigStep } from './OperadoraConfigStep'
export { OperadoraContactStep } from './OperadoraContactStep'

export type {
  OperadoraFormProps,
  Step,
  StepDefinition,
  BasicFormData,
  ConfigFormData,
  ContactFormData,
} from './types'

export { TABELA_OPTIONS, INTEGRACAO_OPTIONS } from './constants'
