/**
 * MetricCard Component
 *
 * Reusable KPI card for WhatsApp metrics dashboard.
 * Memoized for performance.
 */

import React, { memo } from 'react';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';

export interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ElementType;
  colorClass: string;
  bgClass: string;
  trend?: number;
  trendLabel?: string;
}

export const MetricCard = memo(function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  colorClass,
  bgClass,
  trend,
  trendLabel,
}: MetricCardProps) {
  const isPositive = trend !== undefined && trend >= 0;

  return (
    <div className="group bg-genesis-surface p-6 rounded-2xl border border-genesis-border-subtle shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 ease-out relative overflow-hidden">
      {/* Background gradient */}
      <div
        className={`absolute top-0 right-0 w-24 h-24 ${bgClass} opacity-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110`}
      />

      <div className="relative">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-xl ${bgClass}`}>
            <Icon className={`w-5 h-5 ${colorClass}`} strokeWidth={2.5} />
          </div>
          {trend !== undefined && (
            <span
              className={`text-[11px] font-semibold px-2 py-1 rounded-full flex items-center gap-1 border ${
                isPositive
                  ? 'text-emerald-600 bg-emerald-50 border-emerald-100'
                  : 'text-red-600 bg-red-50 border-red-100'
              }`}
            >
              {isPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {trend > 0 ? '+' : ''}
              {trend.toFixed(0)}%
            </span>
          )}
        </div>

        <div className="space-y-1">
          <h3 className="text-3xl font-bold text-genesis-dark tracking-tight">
            {value}
          </h3>
          <p className="text-[13px] font-medium text-genesis-medium">{title}</p>
        </div>

        <div className="mt-4 pt-3 border-t border-genesis-border-subtle flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="text-[10px] text-genesis-medium">
            {trendLabel || subtitle}
          </span>
          <ArrowRight className="w-3 h-3 text-genesis-primary" />
        </div>
      </div>
    </div>
  );
});
