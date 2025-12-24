/**
 * Schedule Summary
 * ================
 *
 * Summary of workflow execution schedules.
 *
 * @module components/settings/workflow/components/ScheduleSummary
 */

import React from 'react';
import { Clock, CheckCircle2 } from 'lucide-react';

/**
 * Schedule information for each workflow.
 */
const SCHEDULE_INFO = [
  { name: 'Follow-up', schedule: 'A cada 2 horas' },
  { name: 'NPS', schedule: 'A cada 1 hora' },
  { name: 'Retorno', schedule: 'Diario as 10:00' },
  { name: 'Labs', schedule: 'Tempo real (webhook)' },
];

/**
 * Displays schedule summary for all workflows.
 */
export function ScheduleSummary(): React.ReactElement {
  return (
    <div className="bg-genesis-surface rounded-xl border border-genesis-border-subtle p-4">
      <h4 className="text-sm font-medium text-genesis-dark mb-3 flex items-center gap-2">
        <Clock className="w-4 h-4 text-genesis-muted" />
        Agendamento dos Workflows
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        {SCHEDULE_INFO.map((item) => (
          <div
            key={item.name}
            className="flex items-center gap-2 text-genesis-muted"
          >
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            {item.name}: {item.schedule}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ScheduleSummary;
