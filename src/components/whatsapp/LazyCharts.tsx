/**
 * Lazy-loaded Recharts Components
 *
 * Code-split chart components for better initial load performance.
 */
/* eslint-disable react-refresh/only-export-components */

import React, { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// Lazy load Recharts components
export const LazyAreaChart = lazy(() =>
  import('recharts').then((m) => ({ default: m.AreaChart }))
);
export const LazyArea = lazy(() =>
  import('recharts').then((m) => ({ default: m.Area }))
);
export const LazyXAxis = lazy(() =>
  import('recharts').then((m) => ({ default: m.XAxis }))
);
export const LazyYAxis = lazy(() =>
  import('recharts').then((m) => ({ default: m.YAxis }))
);
export const LazyCartesianGrid = lazy(() =>
  import('recharts').then((m) => ({ default: m.CartesianGrid }))
);
export const LazyTooltip = lazy(() =>
  import('recharts').then((m) => ({ default: m.Tooltip }))
);
export const LazyResponsiveContainer = lazy(() =>
  import('recharts').then((m) => ({ default: m.ResponsiveContainer }))
);
export const LazyBarChart = lazy(() =>
  import('recharts').then((m) => ({ default: m.BarChart }))
);
export const LazyBar = lazy(() =>
  import('recharts').then((m) => ({ default: m.Bar }))
);

/**
 * Loading fallback for charts.
 */
export function ChartLoader() {
  return (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="w-6 h-6 text-genesis-blue animate-spin" />
    </div>
  );
}

/**
 * Wrapper for chart suspense.
 */
export function ChartSuspense({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<ChartLoader />}>{children}</Suspense>;
}
