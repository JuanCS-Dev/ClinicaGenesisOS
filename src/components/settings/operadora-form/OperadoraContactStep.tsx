/**
 * OperadoraContactStep Component
 *
 * Third step of the operadora form wizard.
 * Collects contact information.
 *
 * @module components/settings/operadora-form/OperadoraContactStep
 */

import React from 'react'
import { Info, Mail, Phone, Globe } from 'lucide-react'
import type { ContactFormData } from './types'

interface OperadoraContactStepProps {
  data: ContactFormData
  onChange: (updates: Partial<ContactFormData>) => void
}

export function OperadoraContactStep({
  data,
  onChange,
}: OperadoraContactStepProps): React.ReactElement {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
      <div className="flex items-start gap-3 p-4 bg-info-soft rounded-xl">
        <Info className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
        <p className="text-sm text-genesis-text">
          Informações de contato ajudam a agilizar o faturamento e resolução de glosas.
        </p>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-genesis-text flex items-center gap-2">
          <Mail className="w-4 h-4 text-genesis-muted" />
          E-mail de Faturamento
        </label>
        <input
          type="email"
          value={data.emailFaturamento}
          onChange={e => onChange({ emailFaturamento: e.target.value })}
          placeholder="faturamento@operadora.com.br"
          className="w-full px-4 py-2.5 border border-genesis-border rounded-xl bg-genesis-soft text-genesis-text focus:ring-2 focus:ring-genesis-primary/20 focus:border-genesis-primary transition-all"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-genesis-text flex items-center gap-2">
          <Phone className="w-4 h-4 text-genesis-muted" />
          Telefone de Faturamento
        </label>
        <input
          type="tel"
          value={data.telefoneFaturamento}
          onChange={e => onChange({ telefoneFaturamento: e.target.value })}
          placeholder="(00) 0000-0000"
          className="w-full px-4 py-2.5 border border-genesis-border rounded-xl bg-genesis-soft text-genesis-text focus:ring-2 focus:ring-genesis-primary/20 focus:border-genesis-primary transition-all"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-genesis-text flex items-center gap-2">
          <Globe className="w-4 h-4 text-genesis-muted" />
          URL do Portal
        </label>
        <input
          type="url"
          value={data.portalUrl}
          onChange={e => onChange({ portalUrl: e.target.value })}
          placeholder="https://portal.operadora.com.br"
          className="w-full px-4 py-2.5 border border-genesis-border rounded-xl bg-genesis-soft text-genesis-text focus:ring-2 focus:ring-genesis-primary/20 focus:border-genesis-primary transition-all"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-genesis-text">Observações</label>
        <textarea
          value={data.observacoes}
          onChange={e => onChange({ observacoes: e.target.value })}
          placeholder="Anotações sobre este convênio..."
          rows={3}
          className="w-full px-4 py-2.5 border border-genesis-border rounded-xl bg-genesis-soft text-genesis-text focus:ring-2 focus:ring-genesis-primary/20 focus:border-genesis-primary transition-all resize-none"
        />
      </div>
    </div>
  )
}

export default OperadoraContactStep
