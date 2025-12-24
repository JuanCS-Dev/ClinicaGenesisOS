/**
 * Operadora Form Types
 *
 * @module components/settings/operadora-form/types
 */

import type React from 'react'
import type { OperadoraFirestore, CreateOperadoraInput, TipoTabela, TipoIntegracao } from '@/types'

/**
 * Form step identifier.
 */
export type Step = 'basic' | 'config' | 'contact'

/**
 * Step definition for wizard navigation.
 */
export interface StepDefinition {
  id: Step
  label: string
  icon: React.ReactNode
}

/**
 * Props for OperadoraForm component.
 */
export interface OperadoraFormProps {
  operadora?: OperadoraFirestore
  onSubmit: (data: CreateOperadoraInput) => Promise<void>
  onCancel: () => void
}

/**
 * Basic step form data.
 */
export interface BasicFormData {
  registroANS: string
  nomeFantasia: string
  razaoSocial: string
  cnpj: string
  codigoPrestador: string
  tabelaPrecos: TipoTabela
}

/**
 * Config step form data.
 */
export interface ConfigFormData {
  prazoEnvioDias: number
  exigeAutorizacao: boolean
  permiteLote: boolean
  aceitaRecursoOnline: boolean
  diasPrazoRecurso: number
  tipoIntegracao: TipoIntegracao
}

/**
 * Contact step form data.
 */
export interface ContactFormData {
  emailFaturamento: string
  telefoneFaturamento: string
  portalUrl: string
  observacoes: string
}
