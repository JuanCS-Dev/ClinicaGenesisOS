/**
 * Configuration Steps
 * ===================
 *
 * Step-by-step guide for setting up WhatsApp Business API.
 *
 * @module components/settings/whatsapp/components/ConfigurationSteps
 */

import React from 'react';
import { ExternalLink, Copy, Info } from 'lucide-react';

interface ConfigurationStepsProps {
  /** Callback when webhook URL is copied */
  onCopyWebhookUrl: () => void;
}

/**
 * Configuration steps data.
 * Structured for easy maintenance and i18n.
 */
const CONFIGURATION_STEPS = [
  {
    step: 1,
    title: 'Criar conta Meta Business',
    link: {
      url: 'https://business.facebook.com/',
      label: 'business.facebook.com',
    },
  },
  {
    step: 2,
    title: 'Configurar WhatsApp Business Platform',
    link: {
      url: 'https://developers.facebook.com/docs/whatsapp/cloud-api/get-started',
      label: 'Ver documentação',
    },
  },
  {
    step: 3,
    title: 'Submeter templates para aprovação',
    description: 'Use os nomes: consulta_confirmacao, consulta_lembrete_24h, consulta_lembrete_2h',
  },
  {
    step: 4,
    title: 'Configurar Webhook URL',
    webhookUrl: true,
  },
  {
    step: 5,
    title: 'Configurar secrets no Firebase',
    code: 'firebase functions:secrets:set WHATSAPP_TOKEN',
  },
] as const;

/**
 * Displays the 5-step configuration guide for WhatsApp setup.
 */
export function ConfigurationSteps({
  onCopyWebhookUrl,
}: ConfigurationStepsProps): React.ReactElement {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-genesis-dark flex items-center gap-2">
        <Info className="w-4 h-4 text-genesis-muted" />
        Passos para Configuração
      </h4>

      <ol className="space-y-3 text-sm">
        {CONFIGURATION_STEPS.map((stepData) => (
          <li key={stepData.step} className="flex gap-3">
            <StepNumber number={stepData.step} />
            <StepContent step={stepData} onCopyWebhookUrl={onCopyWebhookUrl} />
          </li>
        ))}
      </ol>
    </div>
  );
}

/**
 * Step number circle.
 */
function StepNumber({ number }: { number: number }): React.ReactElement {
  return (
    <span className="w-6 h-6 rounded-full bg-genesis-primary text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
      {number}
    </span>
  );
}

/**
 * Step content based on step type.
 */
function StepContent({
  step,
  onCopyWebhookUrl,
}: {
  step: (typeof CONFIGURATION_STEPS)[number];
  onCopyWebhookUrl: () => void;
}): React.ReactElement {
  return (
    <div>
      <p className="text-genesis-dark font-medium">{step.title}</p>

      {'link' in step && step.link && (
        <a
          href={step.link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-genesis-primary hover:underline inline-flex items-center gap-1"
        >
          {step.link.label}
          <ExternalLink className="w-3 h-3" />
        </a>
      )}

      {'description' in step && step.description && (
        <p className="text-genesis-muted text-xs mt-0.5">{step.description}</p>
      )}

      {'webhookUrl' in step && step.webhookUrl && (
        <div className="flex items-center gap-2 mt-1">
          <code className="text-xs bg-genesis-soft px-2 py-1 rounded text-genesis-dark font-mono">
            ...cloudfunctions.net/whatsappWebhook
          </code>
          <button
            onClick={onCopyWebhookUrl}
            className="p-1 hover:bg-genesis-hover rounded"
            title="Copiar URL"
            aria-label="Copiar URL do webhook"
          >
            <Copy className="w-3.5 h-3.5 text-genesis-muted" />
          </button>
        </div>
      )}

      {'code' in step && step.code && (
        <code className="text-xs bg-genesis-soft px-2 py-1 rounded text-genesis-dark font-mono block mt-1">
          {step.code}
        </code>
      )}
    </div>
  );
}

export default ConfigurationSteps;
