/**
 * Templates List
 * ==============
 *
 * WhatsApp message templates with approval status.
 *
 * @module components/settings/whatsapp/components/TemplatesList
 */

import React from 'react';
import {
  MessageCircle,
  ExternalLink,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';
import type { WhatsAppTemplate, TemplateApprovalStatus } from '../types';

interface TemplatesListProps {
  /** List of templates to display */
  templates: WhatsAppTemplate[];
}

/**
 * Default templates for appointment reminders.
 * Used when no templates are fetched from the API.
 */
export const DEFAULT_TEMPLATES: WhatsAppTemplate[] = [
  {
    name: 'consulta_confirmacao',
    status: 'pending',
    category: 'UTILITY',
    language: 'pt_BR',
  },
  {
    name: 'consulta_lembrete_24h',
    status: 'pending',
    category: 'UTILITY',
    language: 'pt_BR',
  },
  {
    name: 'consulta_lembrete_2h',
    status: 'pending',
    category: 'UTILITY',
    language: 'pt_BR',
  },
];

/**
 * Status configuration for visual display.
 */
const STATUS_CONFIG: Record<
  TemplateApprovalStatus,
  { icon: React.ElementType; label: string; color: string }
> = {
  approved: {
    icon: CheckCircle2,
    label: 'Aprovado',
    color: 'text-green-600',
  },
  pending: {
    icon: Clock,
    label: 'Pendente',
    color: 'text-amber-600',
  },
  rejected: {
    icon: XCircle,
    label: 'Rejeitado',
    color: 'text-red-600',
  },
};

/**
 * Displays WhatsApp message templates with their approval status.
 */
export function TemplatesList({
  templates,
}: TemplatesListProps): React.ReactElement {
  return (
    <div className="bg-genesis-surface rounded-2xl border border-genesis-border-subtle p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold text-genesis-dark">
              Templates de Mensagem
            </h3>
            <p className="text-sm text-genesis-muted">
              Status de aprovação no Meta Business
            </p>
          </div>
        </div>

        <a
          href="https://business.facebook.com/wa/manage/message-templates/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-genesis-primary hover:underline inline-flex items-center gap-1"
        >
          Gerenciar no Meta
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Template Cards */}
      <div className="space-y-3">
        {templates.map((template) => (
          <TemplateCard key={template.name} template={template} />
        ))}
      </div>

      {/* Template Info */}
      <TemplateInfo />
    </div>
  );
}

/**
 * Individual template card.
 */
const TemplateCard: React.FC<{
  template: WhatsAppTemplate;
}> = ({ template }) => {
  const config = STATUS_CONFIG[template.status];
  const StatusIcon = config.icon;

  return (
    <div className="flex items-center justify-between p-4 bg-genesis-soft rounded-xl">
      <div>
        <p className="font-medium text-genesis-dark font-mono text-sm">
          {template.name}
        </p>
        <p className="text-xs text-genesis-muted mt-0.5">
          {template.category} &bull; {template.language}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <StatusIcon className={`w-4 h-4 ${config.color}`} />
        <span className={`text-sm font-medium ${config.color}`}>
          {config.label}
        </span>
      </div>
    </div>
  );
}

/**
 * Info box explaining template purposes.
 */
function TemplateInfo(): React.ReactElement {
  return (
    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
      <p className="text-sm text-blue-800 dark:text-blue-200">
        <strong>Conteúdo dos Templates:</strong>
      </p>
      <ul className="text-xs text-blue-700 dark:text-blue-300 mt-2 space-y-1">
        <li>
          &bull; <code>consulta_confirmacao</code>: Confirmação ao agendar
        </li>
        <li>
          &bull; <code>consulta_lembrete_24h</code>: Lembrete 24h antes
        </li>
        <li>
          &bull; <code>consulta_lembrete_2h</code>: Lembrete 2h antes
        </li>
      </ul>
    </div>
  );
}

export default TemplatesList;
