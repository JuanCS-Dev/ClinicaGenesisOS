/**
 * OccupancyGauge Component
 *
 * Visual gauge showing clinic occupancy rate with target line.
 * Inspired by Healthie's wellness dashboard and Linear's minimalism.
 *
 * Features:
 * - Animated circular progress
 * - Target indicator line
 * - Status-based colors
 * - Hover details
 */

import React from 'react';
import type { OccupancyMetrics } from '@/hooks/useDashboardMetrics';

interface OccupancyGaugeProps {
  /** Occupancy metrics from useDashboardMetrics */
  metrics: OccupancyMetrics;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Show detailed breakdown on hover */
  showDetails?: boolean;
}

/**
 * Get status color configuration.
 */
function getStatusColors(status: OccupancyMetrics['status']) {
  switch (status) {
    case 'excellent':
      return {
        stroke: 'stroke-emerald-500',
        text: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-50 dark:bg-emerald-900/30',
        label: 'Excelente',
      };
    case 'good':
      return {
        stroke: 'stroke-amber-500',
        text: 'text-amber-600 dark:text-amber-400',
        bg: 'bg-amber-50 dark:bg-amber-900/30',
        label: 'Bom',
      };
    case 'needs-attention':
    default:
      return {
        stroke: 'stroke-red-500',
        text: 'text-red-600 dark:text-red-400',
        bg: 'bg-red-50 dark:bg-red-900/30',
        label: 'Atenção',
      };
  }
}

/**
 * Size configurations.
 */
const SIZE_CONFIG = {
  sm: { size: 80, strokeWidth: 6, textClass: 'text-lg' },
  md: { size: 120, strokeWidth: 8, textClass: 'text-2xl' },
  lg: { size: 160, strokeWidth: 10, textClass: 'text-3xl' },
};

/**
 * Circular progress gauge for occupancy visualization.
 *
 * @example
 * <OccupancyGauge
 *   metrics={{
 *     rate: 78,
 *     target: 85,
 *     bookedSlots: 62,
 *     totalSlots: 80,
 *     status: 'good'
 *   }}
 *   size="md"
 * />
 */
export function OccupancyGauge({
  metrics,
  size = 'md',
  showDetails = true,
}: OccupancyGaugeProps): React.ReactElement {
  const { rate, target, bookedSlots, totalSlots, status } = metrics;
  const config = SIZE_CONFIG[size];
  const colors = getStatusColors(status);

  // SVG calculations
  const radius = (config.size - config.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const fillPercent = Math.min(rate, 100);
  const strokeDashoffset = circumference - (fillPercent / 100) * circumference;
  const targetAngle = (target / 100) * 360 - 90; // -90 to start from top

  // Calculate target line position
  const targetX = config.size / 2 + radius * Math.cos((targetAngle * Math.PI) / 180);
  const targetY = config.size / 2 + radius * Math.sin((targetAngle * Math.PI) / 180);

  return (
    <div className="group relative inline-flex flex-col items-center">
      {/* SVG Gauge */}
      <div className="relative">
        <svg
          width={config.size}
          height={config.size}
          className="transform -rotate-90"
          role="img"
          aria-label={`Ocupação: ${rate}%`}
        >
          {/* Background circle */}
          <circle
            cx={config.size / 2}
            cy={config.size / 2}
            r={radius}
            fill="none"
            className="stroke-genesis-soft dark:stroke-genesis-border"
            strokeWidth={config.strokeWidth}
          />

          {/* Progress circle */}
          <circle
            cx={config.size / 2}
            cy={config.size / 2}
            r={radius}
            fill="none"
            className={`${colors.stroke} transition-all duration-700 ease-out`}
            strokeWidth={config.strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 0.7s ease-out',
            }}
          />

          {/* Target indicator (small dot) */}
          <circle
            cx={targetX}
            cy={targetY}
            r={4}
            className="fill-genesis-dark dark:fill-genesis-light"
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-bold ${config.textClass} text-genesis-dark`}>{rate}%</span>
          <span className="text-[10px] font-medium text-genesis-muted uppercase tracking-wider">
            Ocupação
          </span>
        </div>
      </div>

      {/* Status Badge */}
      <div
        className={`
          mt-3 px-3 py-1 rounded-full text-[11px] font-semibold
          ${colors.bg} ${colors.text}
          flex items-center gap-1.5
        `}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${colors.stroke.replace('stroke-', 'bg-')}`}
        />
        {colors.label}
      </div>

      {/* Details Tooltip */}
      {showDetails && (
        <div
          className="
            absolute -bottom-16 left-1/2 -translate-x-1/2
            opacity-0 group-hover:opacity-100
            transition-opacity duration-200
            pointer-events-none
            z-10
          "
        >
          <div
            className="
              bg-genesis-dark dark:bg-genesis-surface
              text-genesis-light dark:text-genesis-dark
              px-3 py-2 rounded-lg shadow-lg
              text-[10px] font-medium
              whitespace-nowrap
            "
          >
            <div className="flex items-center gap-4">
              <span>
                <strong>{bookedSlots}</strong>/{totalSlots} slots
              </span>
              <span className="text-genesis-subtle">|</span>
              <span>Meta: {target}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Compact occupancy bar for use in KPI cards.
 */
export function OccupancyBar({ metrics }: { metrics: OccupancyMetrics }): React.ReactElement {
  const { rate, target, status } = metrics;
  const colors = getStatusColors(status);

  return (
    <div className="w-full">
      {/* Progress bar container */}
      <div className="relative h-2 bg-genesis-soft dark:bg-genesis-border rounded-full overflow-hidden">
        {/* Progress fill */}
        <div
          className={`
            absolute top-0 left-0 h-full rounded-full
            ${colors.stroke.replace('stroke-', 'bg-')}
            transition-all duration-500 ease-out
          `}
          style={{ width: `${Math.min(rate, 100)}%` }}
        />

        {/* Target line */}
        <div
          className="absolute top-0 w-0.5 h-full bg-genesis-dark dark:bg-genesis-light"
          style={{ left: `${target}%` }}
        />
      </div>

      {/* Labels */}
      <div className="flex justify-between items-center mt-1.5">
        <span className={`text-[11px] font-semibold ${colors.text}`}>
          {rate}% ocupado
        </span>
        <span className="text-[10px] text-genesis-muted">
          Meta: {target}%
        </span>
      </div>
    </div>
  );
}

export default OccupancyGauge;
