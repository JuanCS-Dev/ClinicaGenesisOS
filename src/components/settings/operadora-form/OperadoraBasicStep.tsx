/**
 * OperadoraBasicStep Component
 *
 * First step of the operadora form wizard.
 * Collects basic registration data.
 *
 * @module components/settings/operadora-form/OperadoraBasicStep
 */

import React from 'react'
import type { BasicFormData } from './types'
import type { TipoTabela } from '@/types'
import { TABELA_OPTIONS } from './constants'

interface OperadoraBasicStepProps {
  data: BasicFormData
  onChange: (updates: Partial<BasicFormData>) => void
}

export function OperadoraBasicStep({
  data,
  onChange,
}: OperadoraBasicStepProps): React.ReactElement {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-genesis-text">
            Registro ANS <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            value={data.registroANS}
            onChange={e => onChange({ registroANS: e.target.value.replace(/\D/g, '').slice(0, 6) })}
            placeholder="000000"
            maxLength={6}
            className="w-full px-4 py-2.5 border border-genesis-border rounded-xl bg-genesis-soft text-genesis-text focus:ring-2 focus:ring-genesis-primary/20 focus:border-genesis-primary transition-all"
          />
          <p className="text-xs text-genesis-subtle">6 dígitos do registro ANS</p>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-genesis-text">
            Código do Prestador <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            value={data.codigoPrestador}
            onChange={e => onChange({ codigoPrestador: e.target.value })}
            placeholder="Seu código nesta operadora"
            className="w-full px-4 py-2.5 border border-genesis-border rounded-xl bg-genesis-soft text-genesis-text focus:ring-2 focus:ring-genesis-primary/20 focus:border-genesis-primary transition-all"
          />
          <p className="text-xs text-genesis-subtle">Código fornecido pela operadora</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-genesis-text">
          Nome Fantasia <span className="text-danger">*</span>
        </label>
        <input
          type="text"
          value={data.nomeFantasia}
          onChange={e => onChange({ nomeFantasia: e.target.value })}
          placeholder="Ex: UNIMED, Bradesco Saúde..."
          className="w-full px-4 py-2.5 border border-genesis-border rounded-xl bg-genesis-soft text-genesis-text focus:ring-2 focus:ring-genesis-primary/20 focus:border-genesis-primary transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-genesis-text">Razão Social</label>
          <input
            type="text"
            value={data.razaoSocial}
            onChange={e => onChange({ razaoSocial: e.target.value })}
            placeholder="Opcional"
            className="w-full px-4 py-2.5 border border-genesis-border rounded-xl bg-genesis-soft text-genesis-text focus:ring-2 focus:ring-genesis-primary/20 focus:border-genesis-primary transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-genesis-text">CNPJ</label>
          <input
            type="text"
            value={data.cnpj}
            onChange={e => onChange({ cnpj: e.target.value.replace(/\D/g, '').slice(0, 14) })}
            placeholder="Opcional"
            maxLength={14}
            className="w-full px-4 py-2.5 border border-genesis-border rounded-xl bg-genesis-soft text-genesis-text focus:ring-2 focus:ring-genesis-primary/20 focus:border-genesis-primary transition-all"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-genesis-text">Tabela de Preços</label>
        <select
          value={data.tabelaPrecos}
          onChange={e => onChange({ tabelaPrecos: e.target.value as TipoTabela })}
          className="w-full px-4 py-2.5 border border-genesis-border rounded-xl bg-genesis-soft text-genesis-text focus:ring-2 focus:ring-genesis-primary/20 focus:border-genesis-primary transition-all"
        >
          {TABELA_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

export default OperadoraBasicStep
