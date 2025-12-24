/**
 * Labs Integration Config
 * =======================
 *
 * Configuration UI for labs integration workflow.
 *
 * @module components/settings/workflow/components/configs/LabsConfig
 */

import React from 'react';
import { Copy } from 'lucide-react';
import type { LabsIntegrationConfig } from '../../types';
import { InfoBox } from '../InfoBox';

interface LabsConfigProps {
  config: LabsIntegrationConfig;
  clinicId: string | undefined;
  onUpdate: (field: string, value: unknown) => void;
  onCopyWebhookUrl: () => void;
}

/**
 * Labs integration workflow configuration form.
 */
export function LabsConfig({
  config,
  clinicId,
  onUpdate,
  onCopyWebhookUrl,
}: LabsConfigProps): React.ReactElement {
  return (
    <>
      <div className="space-y-4">
        {/* Webhook URL */}
        <div>
          <label
            htmlFor="labs-webhook"
            className="block text-sm font-medium text-genesis-text mb-1"
          >
            Webhook URL
          </label>
          <div className="flex items-center gap-2">
            <code
              id="labs-webhook"
              className="flex-1 px-3 py-2 bg-genesis-surface border border-genesis-border rounded-lg text-sm font-mono text-genesis-text truncate"
            >
              https://...cloudfunctions.net/labsResultWebhook
            </code>
            <button
              onClick={onCopyWebhookUrl}
              className="p-2 hover:bg-genesis-hover rounded-lg"
              title="Copiar URL"
              aria-label="Copiar URL do webhook"
            >
              <Copy className="w-4 h-4 text-genesis-muted" />
            </button>
          </div>
        </div>

        {/* Notification Options */}
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={config.notifyPatient}
              onChange={(e) => onUpdate('notifyPatient', e.target.checked)}
              className="w-4 h-4 rounded border-genesis-border text-genesis-primary focus:ring-genesis-primary"
            />
            <span className="text-sm text-genesis-text">Notificar paciente</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={config.notifyDoctor}
              onChange={(e) => onUpdate('notifyDoctor', e.target.checked)}
              className="w-4 h-4 rounded border-genesis-border text-genesis-primary focus:ring-genesis-primary"
            />
            <span className="text-sm text-genesis-text">
              Notificar medico (valores criticos)
            </span>
          </label>
        </div>
      </div>

      <InfoBox>
        Configure o laboratorio para enviar resultados via POST para o webhook.
        Inclua o header{' '}
        <code className="px-1 bg-genesis-soft rounded">
          X-Clinic-Id: {clinicId}
        </code>
      </InfoBox>
    </>
  );
}

export default LabsConfig;
