/**
 * Patient Return Config
 * =====================
 *
 * Configuration UI for patient return reminder workflow.
 *
 * @module components/settings/workflow/components/configs/PatientReturnConfig
 */

import React from 'react';
import type { PatientReturnConfig as PatientReturnConfigType } from '../../types';
import { InfoBox } from '../InfoBox';

interface PatientReturnConfigProps {
  config: PatientReturnConfigType;
  onUpdate: (field: string, value: unknown) => void;
}

/**
 * Patient return reminder workflow configuration form.
 */
export function PatientReturnConfig({
  config,
  onUpdate,
}: PatientReturnConfigProps): React.ReactElement {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="return-inactive-days"
            className="block text-sm font-medium text-genesis-text mb-1"
          >
            Dias de inatividade
          </label>
          <input
            id="return-inactive-days"
            type="number"
            min={30}
            max={365}
            value={config.inactiveDays}
            onChange={(e) => onUpdate('inactiveDays', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-genesis-border rounded-lg bg-genesis-surface text-genesis-text"
          />
        </div>
        <div>
          <label
            htmlFor="return-frequency"
            className="block text-sm font-medium text-genesis-text mb-1"
          >
            Frequencia de lembrete (dias)
          </label>
          <input
            id="return-frequency"
            type="number"
            min={7}
            max={90}
            value={config.reminderFrequencyDays}
            onChange={(e) =>
              onUpdate('reminderFrequencyDays', parseInt(e.target.value))
            }
            className="w-full px-3 py-2 border border-genesis-border rounded-lg bg-genesis-surface text-genesis-text"
          />
        </div>
      </div>
      <InfoBox>
        Envia lembretes para pacientes que nao consultam ha mais de{' '}
        {config.inactiveDays} dias. Limite: 50 lembretes/dia por clinica.
      </InfoBox>
    </>
  );
}

export default PatientReturnConfig;
