/**
 * Telemetry Module
 * ================
 *
 * Lightweight telemetry for performance monitoring and tracing.
 * Uses browser Performance API for non-intrusive observability.
 *
 * Features:
 * - Custom span tracing for async operations
 * - Performance marks and measures
 * - Error tracking
 * - Integration with Firebase Performance Monitoring
 *
 * @module lib/telemetry
 */

// =============================================================================
// TYPES
// =============================================================================

/**
 * Span status codes.
 */
export enum SpanStatus {
  OK = 'ok',
  ERROR = 'error',
}

/**
 * Trace span data.
 */
export interface Span {
  name: string
  startTime: number
  endTime?: number
  status: SpanStatus
  attributes?: Record<string, string | number | boolean>
  error?: string
}

/**
 * Telemetry configuration.
 */
export interface TelemetryConfig {
  /** Enable console logging in development */
  enableDevLogs: boolean
  /** Enable sending traces to backend */
  enableRemoteTracing: boolean
  /** Backend endpoint for traces */
  traceEndpoint?: string
  /** Sample rate (0-1) */
  sampleRate: number
}

// =============================================================================
// STATE
// =============================================================================

const config: TelemetryConfig = {
  enableDevLogs: import.meta.env.DEV,
  enableRemoteTracing: false, // Enable when backend is ready
  sampleRate: 1.0,
}

const activeSpans = new Map<string, Span>()
const completedSpans: Span[] = []
const BATCH_SIZE = 10

// =============================================================================
// CORE FUNCTIONS
// =============================================================================

/**
 * Generate unique span ID.
 */
function generateSpanId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

/**
 * Should this trace be sampled?
 */
function shouldSample(): boolean {
  return Math.random() < config.sampleRate
}

/**
 * Log span to console in development.
 */
function logSpan(span: Span): void {
  if (!config.enableDevLogs) return

  const duration = span.endTime ? span.endTime - span.startTime : 0
  const statusIcon = span.status === SpanStatus.OK ? '✓' : '✗'

  // eslint-disable-next-line no-console
  console.info(
    `[Telemetry] ${statusIcon} ${span.name} (${duration.toFixed(2)}ms)`,
    span.attributes || {}
  )

  if (span.error) {
    console.error(`[Telemetry] Error: ${span.error}`)
  }
}

/**
 * Send traces to backend (when enabled).
 */
async function flushTraces(): Promise<void> {
  if (!config.enableRemoteTracing || completedSpans.length === 0) return
  if (!config.traceEndpoint) return

  const batch = completedSpans.splice(0, BATCH_SIZE)

  try {
    await fetch(config.traceEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ traces: batch }),
    })
  } catch (error) {
    // Re-add to queue on failure
    completedSpans.unshift(...batch)
    console.warn('[Telemetry] Failed to send traces:', error)
  }
}

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Start a new trace span.
 *
 * @param name - Span name (e.g., "loadPatients", "saveRecord")
 * @param attributes - Optional attributes to attach
 * @returns Span ID for ending the span
 *
 * @example
 * ```ts
 * const spanId = startSpan('loadPatients', { clinicId: '123' });
 * try {
 *   await loadPatients();
 *   endSpan(spanId, SpanStatus.OK);
 * } catch (error) {
 *   endSpan(spanId, SpanStatus.ERROR, error.message);
 * }
 * ```
 */
export function startSpan(
  name: string,
  attributes?: Record<string, string | number | boolean>
): string {
  if (!shouldSample()) return ''

  const spanId = generateSpanId()
  const span: Span = {
    name,
    startTime: performance.now(),
    status: SpanStatus.OK,
    attributes,
  }

  activeSpans.set(spanId, span)

  // Also create a performance mark
  try {
    performance.mark(`${name}-start`)
  } catch {
    // Ignore if marks aren't supported
  }

  return spanId
}

/**
 * End a trace span.
 *
 * @param spanId - Span ID from startSpan
 * @param status - Final status
 * @param errorMessage - Error message if status is ERROR
 */
export function endSpan(
  spanId: string,
  status: SpanStatus = SpanStatus.OK,
  errorMessage?: string
): void {
  if (!spanId) return

  const span = activeSpans.get(spanId)
  if (!span) return

  span.endTime = performance.now()
  span.status = status
  if (errorMessage) span.error = errorMessage

  activeSpans.delete(spanId)
  completedSpans.push(span)

  // Create performance measure
  try {
    performance.mark(`${span.name}-end`)
    performance.measure(span.name, `${span.name}-start`, `${span.name}-end`)
  } catch {
    // Ignore if measures aren't supported
  }

  logSpan(span)

  // Flush if batch is full
  if (completedSpans.length >= BATCH_SIZE) {
    flushTraces()
  }
}

/**
 * Wrapper for tracing async operations.
 *
 * @param name - Operation name
 * @param fn - Async function to trace
 * @param attributes - Optional attributes
 * @returns Result of the function
 *
 * @example
 * ```ts
 * const patients = await withTrace('loadPatients', () => getPatients(clinicId), { clinicId });
 * ```
 */
export async function withTrace<T>(
  name: string,
  fn: () => Promise<T>,
  attributes?: Record<string, string | number | boolean>
): Promise<T> {
  const spanId = startSpan(name, attributes)

  try {
    const result = await fn()
    endSpan(spanId, SpanStatus.OK)
    return result
  } catch (error) {
    endSpan(spanId, SpanStatus.ERROR, error instanceof Error ? error.message : 'Unknown error')
    throw error
  }
}

/**
 * Wrapper for tracing sync operations.
 *
 * @param name - Operation name
 * @param fn - Sync function to trace
 * @param attributes - Optional attributes
 * @returns Result of the function
 */
export function withTraceSync<T>(
  name: string,
  fn: () => T,
  attributes?: Record<string, string | number | boolean>
): T {
  const spanId = startSpan(name, attributes)

  try {
    const result = fn()
    endSpan(spanId, SpanStatus.OK)
    return result
  } catch (error) {
    endSpan(spanId, SpanStatus.ERROR, error instanceof Error ? error.message : 'Unknown error')
    throw error
  }
}

/**
 * Record a custom metric/event.
 *
 * @param name - Metric name
 * @param value - Metric value
 * @param attributes - Optional attributes
 */
export function recordMetric(
  name: string,
  value: number,
  attributes?: Record<string, string | number | boolean>
): void {
  if (!shouldSample()) return

  const span: Span = {
    name: `metric:${name}`,
    startTime: performance.now(),
    endTime: performance.now(),
    status: SpanStatus.OK,
    attributes: { ...attributes, value },
  }

  completedSpans.push(span)
  logSpan(span)
}

/**
 * Track an error.
 *
 * @param error - Error object or message
 * @param context - Additional context
 */
export function trackError(
  error: Error | string,
  context?: Record<string, string | number | boolean>
): void {
  const message = error instanceof Error ? error.message : error
  const stack = error instanceof Error ? error.stack : undefined

  const span: Span = {
    name: 'error',
    startTime: performance.now(),
    endTime: performance.now(),
    status: SpanStatus.ERROR,
    error: message,
    attributes: {
      ...context,
      ...(stack && { stack: stack.slice(0, 500) }),
    },
  }

  completedSpans.push(span)
  logSpan(span)

  // Immediately flush errors
  flushTraces()
}

/**
 * Configure telemetry.
 *
 * @param newConfig - Partial configuration to merge
 */
export function configureTelemetry(newConfig: Partial<TelemetryConfig>): void {
  Object.assign(config, newConfig)
}

/**
 * Get all completed spans (for testing/debugging).
 */
export function getCompletedSpans(): readonly Span[] {
  return [...completedSpans]
}

/**
 * Clear all spans (for testing).
 */
export function clearSpans(): void {
  activeSpans.clear()
  completedSpans.length = 0
}

// =============================================================================
// AUTO-INSTRUMENTATION
// =============================================================================

/**
 * Track page navigation timing.
 */
export function trackNavigation(): void {
  if (typeof window === 'undefined') return

  // Track when the page becomes interactive
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming
            recordMetric('navigation', navEntry.loadEventEnd - navEntry.startTime, {
              type: navEntry.type,
              domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.startTime,
              domInteractive: navEntry.domInteractive - navEntry.startTime,
            })
          }
        }
      })

      observer.observe({ type: 'navigation', buffered: true })
    } catch {
      // PerformanceObserver not fully supported
    }
  }
}

// Auto-track navigation on load
if (typeof window !== 'undefined') {
  trackNavigation()
}
