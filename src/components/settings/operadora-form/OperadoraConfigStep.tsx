/**
 * OperadoraConfigStep Component
 *
 * Second step of the operadora form wizard.
 * Collects configuration settings.
 *
 * @module components/settings/operadora-form/OperadoraConfigStep
 */

import React from 'react'
import type { ConfigFormData } from './types'
import type { TipoIntegracao } from '@/types'
import { INTEGRACAO_OPTIONS } from './constants'

interface OperadoraConfigStepProps {
  data: ConfigFormData
  onChange: (updates: Partial<ConfigFormData>) => void
}

export function OperadoraConfigStep({
  data,
  onChange,
}: OperadoraConfigStepProps): React.ReactElement {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-genesis-text">Prazo de Envio (dias)</label>
          <input
            type="number"
            value={data.prazoEnvioDias}
            onChange={e => onChange({ prazoEnvioDias: parseInt(e.target.value) || 30 })}
            min={1}
            max={365}
            className="w-full px-4 py-2.5 border border-genesis-border rounded-xl bg-genesis-soft text-genesis-text focus:ring-2 focus:ring-genesis-primary/20 focus:border-genesis-primary transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-genesis-text">Prazo para Recurso (dias)</label>
          <input
            type="number"
            value={data.diasPrazoRecurso}
            onChange={e => onChange({ diasPrazoRecurso: parseInt(e.target.value) || 30 })}
            min={1}
            max={365}
            className="w-full px-4 py-2.5 border border-genesis-border rounded-xl bg-genesis-soft text-genesis-text focus:ring-2 focus:ring-genesis-primary/20 focus:border-genesis-primary transition-all"
          />
        </div>
      </div>

      <div className="space-y-3">
        <label className="flex items-center gap-3 p-4 rounded-xl border border-genesis-border-subtle hover:bg-genesis-hover cursor-pointer transition-colors">
          <input
            type="checkbox"
            checked={data.exigeAutorizacao}
            onChange={e => onChange({ exigeAutorizacao: e.target.checked })}
            className="w-5 h-5 rounded border-genesis-border text-genesis-primary focus:ring-genesis-primary"
          />
          <div>
            <span className="font-medium text-genesis-text">Exige autorização prévia</span>
            <p className="text-sm text-genesis-muted">Procedimentos precisam de senha</p>
          </div>
        </label>

        <label className="flex items-center gap-3 p-4 rounded-xl border border-genesis-border-subtle hover:bg-genesis-hover cursor-pointer transition-colors">
          <input
            type="checkbox"
            checked={data.permiteLote}
            onChange={e => onChange({ permiteLote: e.target.checked })}
            className="w-5 h-5 rounded border-genesis-border text-genesis-primary focus:ring-genesis-primary"
          />
          <div>
            <span className="font-medium text-genesis-text">Permite envio em lote</span>
            <p className="text-sm text-genesis-muted">Várias guias em um único envio</p>
          </div>
        </label>

        <label className="flex items-center gap-3 p-4 rounded-xl border border-genesis-border-subtle hover:bg-genesis-hover cursor-pointer transition-colors">
          <input
            type="checkbox"
            checked={data.aceitaRecursoOnline}
            onChange={e => onChange({ aceitaRecursoOnline: e.target.checked })}
            className="w-5 h-5 rounded border-genesis-border text-genesis-primary focus:ring-genesis-primary"
          />
          <div>
            <span className="font-medium text-genesis-text">Aceita recurso online</span>
            <p className="text-sm text-genesis-muted">Contestação de glosas via sistema</p>
          </div>
        </label>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-genesis-text">Tipo de Integração</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {INTEGRACAO_OPTIONS.map(opt => (
            <label
              key={opt.value}
              className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                data.tipoIntegracao === opt.value
                  ? 'border-genesis-primary bg-genesis-primary/5'
                  : 'border-genesis-border-subtle hover:bg-genesis-hover'
              }`}
            >
              <input
                type="radio"
                name="tipoIntegracao"
                value={opt.value}
                checked={data.tipoIntegracao === opt.value}
                onChange={e => onChange({ tipoIntegracao: e.target.value as TipoIntegracao })}
                className="mt-0.5 w-4 h-4 border-genesis-border text-genesis-primary focus:ring-genesis-primary"
              />
              <div>
                <span className="font-medium text-genesis-text">{opt.label}</span>
                <p className="text-sm text-genesis-muted">{opt.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}

export default OperadoraConfigStep
