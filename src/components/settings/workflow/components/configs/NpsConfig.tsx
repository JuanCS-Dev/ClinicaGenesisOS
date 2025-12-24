/**
 * NPS Config
 * ==========
 *
 * Configuration UI for NPS survey workflow.
 *
 * @module components/settings/workflow/components/configs/NpsConfig
 */

import React from 'react';
import type { NpsConfig as NpsConfigType } from '../../types';
import { InfoBox } from '../InfoBox';

interface NpsConfigProps {
  config: NpsConfigType;
  onUpdate: (field: string, value: unknown) => void;
}

/**
 * NPS survey workflow configuration form.
 */
export function NpsConfig({
  config,
  onUpdate,
}: NpsConfigProps): React.ReactElement {
  return (
    <>
      <div>
        <label
          htmlFor="nps-delay"
          className="block text-sm font-medium text-genesis-text mb-1"
        >
          Delay (horas apos consulta)
        </label>
        <input
          id="nps-delay"
          type="number"
          min={1}
          max={24}
          value={config.delayHours}
          onChange={(e) => onUpdate('delayHours', parseInt(e.target.value))}
          className="w-32 px-3 py-2 border border-genesis-border rounded-lg bg-genesis-surface text-genesis-text"
        />
      </div>
      <InfoBox>
        Pesquisa de satisfacao (0-10) enviada para pacientes apos consultas.
        Detractors (0-6) geram alerta.
      </InfoBox>
    </>
  );
}

export default NpsConfig;
