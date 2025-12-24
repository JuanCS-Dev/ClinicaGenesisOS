/**
 * FinanceCard Component
 *
 * KPI display card for financial metrics.
 */

import React from 'react';
import { Wallet, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';

export interface FinanceCardProps {
  title: string;
  value: string;
  trend?: string;
  trendValue?: string;
  type: 'positive' | 'neutral' | 'negative';
  loading?: boolean;
}

export function FinanceCard({
  title,
  value,
  trend,
  trendValue,
  type,
  loading,
}: FinanceCardProps) {
  const isPositive = type === 'positive';
  const isNeutral = type === 'neutral';

  const gradientColor = isPositive
    ? 'rgba(34, 197, 94, 0.10)'
    : isNeutral
    ? 'rgba(59, 130, 246, 0.10)'
    : 'rgba(239, 68, 68, 0.10)';

  const badgeClass = isPositive
    ? 'bg-[#F0FDF4] text-[#15803D]'
    : isNeutral
    ? 'bg-[#EFF6FF] text-[#1D4ED8]'
    : 'bg-[#FEF2F2] text-[#B91C1C]';

  return (
    <div className="group bg-genesis-surface p-6 rounded-2xl border border-genesis-border-subtle shadow-md hover:shadow-lg transition-all duration-300 relative overflow-hidden">
      <div
        className="absolute top-0 right-0 w-24 h-24 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"
        style={{ background: `linear-gradient(to bottom right, ${gradientColor}, transparent)` }}
      />

      <div className="relative">
        <p className="text-[13px] font-medium text-genesis-medium mb-1">{title}</p>
        {loading ? (
          <div className="h-9 flex items-center">
            <Loader2 className="w-6 h-6 animate-spin text-genesis-subtle" />
          </div>
        ) : (
          <h3 className="text-3xl font-bold text-genesis-dark tracking-tight mb-4">
            {value}
          </h3>
        )}

        {trendValue && (
          <div className="flex items-center gap-2">
            <div
              className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 ${badgeClass}`}
            >
              {isPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : isNeutral ? (
                <Wallet className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {trendValue}
            </div>
            {trend && <span className="text-[11px] text-genesis-medium/80">{trend}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

export default FinanceCard;
