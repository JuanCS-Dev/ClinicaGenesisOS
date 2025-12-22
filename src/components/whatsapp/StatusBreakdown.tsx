/**
 * StatusBreakdown Component
 *
 * Displays reminder status breakdown with progress bars.
 * Memoized for performance.
 */

import React, { memo } from 'react';
import { StatusCounts } from '../../services/whatsapp-metrics.service';

export interface StatusBreakdownProps {
  title: string;
  data: StatusCounts;
  icon: React.ElementType;
  accentColor: string;
}

const STATUSES = [
  { key: 'sent', label: 'Enviados', color: 'bg-amber-500' },
  { key: 'delivered', label: 'Entregues', color: 'bg-green-500' },
  { key: 'read', label: 'Lidos', color: 'bg-blue-500' },
  { key: 'failed', label: 'Falhas', color: 'bg-red-500' },
] as const;

export const StatusBreakdown = memo(function StatusBreakdown({
  title,
  data,
  icon: Icon,
  accentColor,
}: StatusBreakdownProps) {
  return (
    <div className="bg-genesis-surface rounded-2xl border border-white shadow-soft p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg ${accentColor}`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <h4 className="font-semibold text-genesis-dark text-sm">{title}</h4>
        <span className="ml-auto text-xs text-genesis-medium bg-genesis-hover px-2 py-1 rounded-full">
          {data.total} total
        </span>
      </div>

      <div className="space-y-3">
        {STATUSES.map(({ key, label, color }) => {
          const count = data[key];
          const percent = data.total > 0 ? (count / data.total) * 100 : 0;

          return (
            <div key={key} className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${color}`} />
              <span className="text-xs text-genesis-medium w-20">{label}</span>
              <div className="flex-1 h-2 bg-genesis-hover rounded-full overflow-hidden">
                <div
                  className={`h-full ${color} rounded-full transition-all duration-500`}
                  style={{ width: `${percent}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-genesis-dark w-8 text-right">
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
});
