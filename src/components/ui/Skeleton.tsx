/**
 * Skeleton Loading Component
 * ==========================
 *
 * Premium skeleton loading with shimmer effect.
 * Use instead of spinners for a more polished loading experience.
 *
 * @example
 * ```tsx
 * <Skeleton className="h-4 w-32" />
 * <Skeleton variant="circle" className="w-10 h-10" />
 * <Skeleton variant="card" />
 * ```
 */

import React from 'react';

export interface SkeletonProps {
  /** Shape variant */
  variant?: 'text' | 'circle' | 'rect' | 'card';
  /** Additional CSS classes */
  className?: string;
  /** Width (for text variant) */
  width?: string | number;
  /** Height (for text variant) */
  height?: string | number;
  /** Number of lines (for text variant) */
  lines?: number;
}

/**
 * Skeleton component for loading states.
 * Uses CSS shimmer animation defined in index.css.
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  className = '',
  width,
  height,
  lines = 1,
}) => {
  // Uses the .skeleton class from index.css with shimmer animation
  const baseClasses = 'skeleton';

  const style: React.CSSProperties = {
    width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined,
    height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined,
  };

  if (variant === 'circle') {
    return (
      <div
        className={`${baseClasses} rounded-full ${className}`}
        style={style}
        aria-hidden="true"
      />
    );
  }

  if (variant === 'card') {
    return (
      <div
        className={`bg-genesis-surface rounded-xl p-4 space-y-3 border border-genesis-border-subtle ${className}`}
        aria-hidden="true"
      >
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-4 w-1/2 rounded" />
        <div className="skeleton h-20 w-full rounded-lg mt-4" />
      </div>
    );
  }

  if (variant === 'rect') {
    return (
      <div
        className={`${baseClasses} rounded-lg ${className}`}
        style={style}
        aria-hidden="true"
      />
    );
  }

  // Text variant - can render multiple lines
  if (lines > 1) {
    return (
      <div className={`space-y-2 ${className}`} aria-hidden="true">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`${baseClasses} h-4 rounded`}
            style={{
              width: i === lines - 1 ? '75%' : '100%', // Last line shorter
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} h-4 rounded ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
};

/**
 * Skeleton group for common loading patterns
 */
export const SkeletonGroup = {
  /** Avatar with text */
  Avatar: () => (
    <div className="flex items-center gap-3">
      <Skeleton variant="circle" className="w-10 h-10" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  ),

  /** Table row */
  TableRow: () => (
    <div className="flex items-center gap-4 py-3 border-b border-genesis-border-subtle">
      <Skeleton variant="circle" className="w-8 h-8" />
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-20" />
    </div>
  ),

  /** Stats card */
  StatCard: () => (
    <div className="bg-genesis-surface p-6 rounded-xl border border-genesis-border-subtle">
      <div className="flex items-center gap-3 mb-4">
        <Skeleton variant="circle" className="w-10 h-10" />
        <Skeleton className="h-4 w-20" />
      </div>
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-3 w-24 mt-2" />
    </div>
  ),
};

// Keep backward compatibility with the simple function export
export function SkeletonSimple({ className = '' }: { className?: string }) {
  return <Skeleton className={className} />;
}

export default Skeleton;
