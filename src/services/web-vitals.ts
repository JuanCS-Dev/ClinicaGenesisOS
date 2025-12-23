/**
 * Web Vitals Tracking Service
 *
 * Collects Core Web Vitals metrics and reports them for performance monitoring.
 * Metrics are logged in development and can be sent to analytics in production.
 *
 * Core Web Vitals measured:
 * - LCP (Largest Contentful Paint): Loading performance
 * - INP (Interaction to Next Paint): Responsiveness (replaced FID in 2024)
 * - CLS (Cumulative Layout Shift): Visual stability
 * - FCP (First Contentful Paint): Perceived load speed
 * - TTFB (Time to First Byte): Server response time
 *
 * @see https://web.dev/vitals/
 */

import { onCLS, onFCP, onLCP, onTTFB, onINP, type Metric } from 'web-vitals';

/**
 * Performance thresholds based on Google's recommendations.
 * Green: Good | Yellow: Needs Improvement | Red: Poor
 */
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 },
  INP: { good: 200, poor: 500 },
} as const;

/**
 * Get rating for a metric based on thresholds.
 */
function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS];
  if (!threshold) return 'good';

  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

/**
 * Report metric to console in development.
 */
function logMetric(metric: Metric): void {
  const rating = getRating(metric.name, metric.value);
  const emoji = rating === 'good' ? '✅' : rating === 'needs-improvement' ? '⚠️' : '❌';
  const color = rating === 'good' ? '#10b981' : rating === 'needs-improvement' ? '#f59e0b' : '#ef4444';

  if (import.meta.env.DEV) {
    console.log(
      `%c${emoji} ${metric.name}: ${metric.value.toFixed(2)}ms (${rating})`,
      `color: ${color}; font-weight: bold;`
    );
  }
}

/**
 * Send metric to analytics (Firebase Analytics, Google Analytics, etc.)
 * This is a placeholder - implement based on your analytics provider.
 */
function sendToAnalytics(metric: Metric): void {
  // In production, send to analytics
  if (import.meta.env.PROD) {
    // Example: Send to Firebase Analytics
    // gtag('event', metric.name, {
    //   value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    //   event_category: 'Web Vitals',
    //   event_label: metric.id,
    //   non_interaction: true,
    // });

    // For now, just log to console in production for debugging
    console.debug(`[Web Vitals] ${metric.name}: ${metric.value}`);
  }
}

/**
 * Handle incoming metric.
 */
function handleMetric(metric: Metric): void {
  logMetric(metric);
  sendToAnalytics(metric);
}

/**
 * Initialize Web Vitals tracking.
 *
 * Call this once in your app entry point (main.tsx or App.tsx).
 *
 * @example
 * ```tsx
 * import { initWebVitals } from '@/services/web-vitals';
 *
 * // In main.tsx or App.tsx
 * initWebVitals();
 * ```
 */
export function initWebVitals(): void {
  // Core Web Vitals (2024 standard)
  onLCP(handleMetric);
  onINP(handleMetric); // Replaced FID as of March 2024
  onCLS(handleMetric);

  // Additional metrics
  onFCP(handleMetric);
  onTTFB(handleMetric);

  if (import.meta.env.DEV) {
    console.log('%c🔍 Web Vitals tracking initialized', 'color: #8b5cf6; font-weight: bold;');
  }
}

/**
 * Get current performance summary.
 * Useful for debugging or displaying in a dev panel.
 */
export function getPerformanceSummary(): Record<string, number> {
  const entries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
  const nav = entries[0];

  if (!nav) return {};

  return {
    dns: nav.domainLookupEnd - nav.domainLookupStart,
    tcp: nav.connectEnd - nav.connectStart,
    ttfb: nav.responseStart - nav.requestStart,
    download: nav.responseEnd - nav.responseStart,
    domParsing: nav.domInteractive - nav.responseEnd,
    domContentLoaded: nav.domContentLoadedEventEnd - nav.startTime,
    load: nav.loadEventEnd - nav.startTime,
  };
}

export default initWebVitals;
