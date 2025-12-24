/**
 * Follow-Up Config
 * ================
 *
 * Configuration UI for follow-up workflow.
 *
 * @module components/settings/workflow/components/configs/FollowUpConfig
 */

import React from 'react';
import type { FollowUpConfig as FollowUpConfigType } from '../../types';
import { InfoBox } from '../InfoBox';

interface FollowUpConfigProps {
  config: FollowUpConfigType;
  onUpdate: (field: string, value: unknown) => void;
}

/**
 * Follow-up workflow configuration form.
 */
export function FollowUpConfig({
  config,
  onUpdate,
}: FollowUpConfigProps): React.ReactElement {
  return (
    <>
      <div>
        <label
          htmlFor="followup-delay"
          className="block text-sm font-medium text-genesis-text mb-1"
        >
          Delay (horas apos consulta)
        </label>
        <input
          id="followup-delay"
          type="number"
          min={1}
          max={72}
          value={config.delayHours}
          onChange={(e) => onUpdate('delayHours', parseInt(e.target.value))}
          className="w-32 px-3 py-2 border border-genesis-border rounded-lg bg-genesis-surface text-genesis-text"
        />
      </div>
      <InfoBox>
        Mensagem enviada automaticamente apos o tempo configurado quando a
        consulta e finalizada.
      </InfoBox>
    </>
  );
}

export default FollowUpConfig;
