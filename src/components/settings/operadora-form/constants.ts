/**
 * Operadora Form Constants
 *
 * @module components/settings/operadora-form/constants
 */

import type { TipoTabela, TipoIntegracao } from '@/types'

/**
 * Table type options for TISS.
 */
export const TABELA_OPTIONS: { value: TipoTabela; label: string }[] = [
  { value: '22', label: 'TUSS (Tabela Única)' },
  { value: '18', label: 'Tabela própria do prestador' },
  { value: '19', label: 'Tabela própria da operadora' },
  { value: '20', label: 'Tabela própria pacote' },
  { value: '90', label: 'Tabela própria de taxas' },
  { value: '98', label: 'Tabela própria de medicamentos' },
]

/**
 * Integration type options.
 */
export const INTEGRACAO_OPTIONS: { value: TipoIntegracao; label: string; desc: string }[] = [
  { value: 'portal', label: 'Portal Web', desc: 'Envio manual pelo portal da operadora' },
  { value: 'email', label: 'E-mail', desc: 'Envio de XML por e-mail' },
  { value: 'webservice', label: 'WebService', desc: 'Integração automática via API' },
  { value: 'manual', label: 'Manual', desc: 'Entrega física ou outro meio' },
]
