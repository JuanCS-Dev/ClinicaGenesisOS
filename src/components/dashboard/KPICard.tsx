/**
 * KPICard Component
 *
 * Premium KPI card with trend indicators and temporal comparison.
 * Inspired by athenahealth Executive Summary and Linear's design philosophy.
 *
 * Features:
 * - Animated trend indicators (up/down/stable)
 * - Temporal comparison text
 * - Hover micro-interactions
 * - Dark mode support
 */

import React from 'react';
import { TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react';
import type { TrendDirection } from '@/hooks/useDashboardMetrics';

interface KPICardProps {
  /** Card title (metric name) */
  title: string;
  /** Primary value to display */
  value: string | number;
  /** Icon component */
  icon: React.ElementType;
  /** Icon color class (e.g., "text-genesis-primary") */
  iconColor?: string;
  /** Icon background color class */
  iconBg?: string;
  /** Trend direction */
  trend?: TrendDirection;
  /** Comparison text (e.g., "+12% vs ontem") */
  comparison?: string;
  /** Sub-label below comparison */
  subLabel?: string;
  /** Click handler */
  onClick?: () => void;
  /** Loading state */
  loading?: boolean;
}

/**
 * Get trend icon and colors based on direction.
 */
function getTrendConfig(trend: TrendDirection) {
  switch (trend) {
    case 'up':
      return {
        Icon: TrendingUp,
        bgColor: 'bg-emerald-50 dark:bg-emerald-900/30',
        textColor: 'text-emerald-600 dark:text-emerald-400',
        borderColor: 'border-emerald-100 dark:border-emerald-800',
      };
    case 'down':
      return {
        Icon: TrendingDown,
        bgColor: 'bg-red-50 dark:bg-red-900/30',
        textColor: 'text-red-600 dark:text-red-400',
        borderColor: 'border-red-100 dark:border-red-800',
      };
    case 'stable':
    default:
      return {
        Icon: Minus,
        bgColor: 'bg-genesis-soft dark:bg-genesis-border',
        textColor: 'text-genesis-medium',
        borderColor: 'border-genesis-border-subtle',
      };
  }
}

/**
 * Skeleton loading state for KPI card.
 */
function KPICardSkeleton() {
  return (
    <div className="bg-genesis-surface p-6 rounded-2xl border border-genesis-border-subtle shadow-soft animate-pulse">
      <div className="flex justify-between items-start mb-5">
        <div className="w-12 h-12 bg-genesis-soft rounded-xl" />
        <div className="w-16 h-6 bg-genesis-soft rounded-full" />
      </div>
      <div className="space-y-2">
        <div className="w-24 h-9 bg-genesis-soft rounded-lg" />
        <div className="w-32 h-4 bg-genesis-soft rounded" />
      </div>
      <div className="mt-4 pt-3 border-t border-genesis-border-subtle">
        <div className="w-28 h-3 bg-genesis-soft rounded" />
      </div>
    </div>
  );
}

/**
 * Premium KPI Card with trend indicators.
 *
 * @example
 * <KPICard
 *   title="Consultas Hoje"
 *   value={8}
 *   icon={Calendar}
 *   trend="up"
 *   comparison="+2 vs ontem"
 *   iconColor="text-genesis-primary"
 *   iconBg="bg-genesis-primary/10"
 * />
 */
export function KPICard({
  title,
  value,
  icon: Icon,
  iconColor = 'text-genesis-primary',
  iconBg = 'bg-genesis-primary/10',
  trend = 'stable',
  comparison,
  subLabel,
  onClick,
  loading = false,
}: KPICardProps): React.ReactElement {
  if (loading) {
    return <KPICardSkeleton />;
  }

  const trendConfig = getTrendConfig(trend);
  const TrendIcon = trendConfig.Icon;

  const isClickable = !!onClick;

  return (
    <div
      className={`
        group bg-genesis-surface p-6 rounded-2xl border border-genesis-border-subtle
        shadow-soft hover:shadow-float hover:-translate-y-1
        transition-all duration-300 ease-out
        ${isClickable ? 'cursor-pointer' : ''}
      `}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
    >
      {/* Header: Icon + Trend Badge */}
      <div className="flex justify-between items-start mb-5">
        <div
          className={`
            p-3 rounded-xl ${iconBg}
            transition-transform duration-300
            group-hover:scale-110
          `}
        >
          <Icon className={`w-5 h-5 ${iconColor}`} strokeWidth={2.5} />
        </div>

        {/* Trend Badge */}
        {comparison && (
          <span
            className={`
              text-[11px] font-semibold px-2 py-1 rounded-full
              flex items-center gap-1 border
              ${trendConfig.bgColor} ${trendConfig.textColor} ${trendConfig.borderColor}
              transition-transform duration-300
              group-hover:scale-105
            `}
          >
            <TrendIcon className="w-3 h-3" />
            {trend !== 'stable' && (
              <span className="hidden sm:inline">{comparison.split(' ')[0]}</span>
            )}
          </span>
        )}
      </div>

      {/* Value + Title */}
      <div className="space-y-1">
        <h3 className="text-3xl font-bold text-genesis-dark tracking-tight">{value}</h3>
        <p className="text-[13px] font-medium text-genesis-muted">{title}</p>
      </div>

      {/* Footer: Comparison + Arrow */}
      <div
        className={`
          mt-4 pt-3 border-t border-genesis-border-subtle
          flex items-center justify-between
          opacity-0 group-hover:opacity-100
          transition-opacity duration-300
        `}
      >
        <span className="text-[10px] text-genesis-muted">{subLabel || comparison}</span>
        {isClickable && <ArrowRight className="w-3 h-3 text-genesis-primary" />}
      </div>
    </div>
  );
}

export default KPICard;
