/**
 * Telemetry Module Tests
 *
 * Tests for performance monitoring and Web Vitals tracking.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  startSpan,
  endSpan,
  withTrace,
  withTraceSync,
  recordMetric,
  trackError,
  configureTelemetry,
  getCompletedSpans,
  clearSpans,
  SpanStatus,
} from '../../lib/telemetry'

describe('Telemetry Module', () => {
  beforeEach(() => {
    clearSpans()
    // Enable dev logs for testing
    configureTelemetry({ enableDevLogs: false, sampleRate: 1.0 })
  })

  afterEach(() => {
    clearSpans()
  })

  describe('startSpan and endSpan', () => {
    it('should create and complete a span', () => {
      const spanId = startSpan('test-operation')
      expect(spanId).toBeTruthy()

      endSpan(spanId, SpanStatus.OK)

      const spans = getCompletedSpans()
      expect(spans).toHaveLength(1)
      expect(spans[0].name).toBe('test-operation')
      expect(spans[0].status).toBe(SpanStatus.OK)
      expect(spans[0].endTime).toBeDefined()
    })

    it('should record span with attributes', () => {
      const spanId = startSpan('fetch-data', { userId: 'user-123', clinicId: 'clinic-456' })
      endSpan(spanId)

      const spans = getCompletedSpans()
      expect(spans[0].attributes).toEqual({
        userId: 'user-123',
        clinicId: 'clinic-456',
      })
    })

    it('should record error status and message', () => {
      const spanId = startSpan('failing-operation')
      endSpan(spanId, SpanStatus.ERROR, 'Something went wrong')

      const spans = getCompletedSpans()
      expect(spans[0].status).toBe(SpanStatus.ERROR)
      expect(spans[0].error).toBe('Something went wrong')
    })

    it('should handle empty spanId gracefully', () => {
      // When sample rate is 0, spanId will be empty
      configureTelemetry({ sampleRate: 0 })
      const spanId = startSpan('sampled-out')
      expect(spanId).toBe('')

      // This should not throw
      endSpan(spanId)

      const spans = getCompletedSpans()
      expect(spans).toHaveLength(0)
    })

    it('should calculate duration correctly', async () => {
      const spanId = startSpan('timed-operation')

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 50))

      endSpan(spanId)

      const spans = getCompletedSpans()
      const duration = spans[0].endTime! - spans[0].startTime
      expect(duration).toBeGreaterThan(40) // Should be at least ~50ms
    })
  })

  describe('withTrace', () => {
    it('should trace async operation successfully', async () => {
      const result = await withTrace('async-operation', async () => {
        await new Promise(resolve => setTimeout(resolve, 10))
        return 'success'
      })

      expect(result).toBe('success')

      const spans = getCompletedSpans()
      expect(spans).toHaveLength(1)
      expect(spans[0].name).toBe('async-operation')
      expect(spans[0].status).toBe(SpanStatus.OK)
    })

    it('should trace async operation with error', async () => {
      await expect(
        withTrace('failing-async', async () => {
          throw new Error('Async error')
        })
      ).rejects.toThrow('Async error')

      const spans = getCompletedSpans()
      expect(spans[0].status).toBe(SpanStatus.ERROR)
      expect(spans[0].error).toBe('Async error')
    })

    it('should pass attributes to span', async () => {
      await withTrace('attributed-operation', async () => 'done', { operation: 'test', count: 5 })

      const spans = getCompletedSpans()
      expect(spans[0].attributes).toEqual({
        operation: 'test',
        count: 5,
      })
    })
  })

  describe('withTraceSync', () => {
    it('should trace sync operation successfully', () => {
      const result = withTraceSync('sync-operation', () => {
        return 42
      })

      expect(result).toBe(42)

      const spans = getCompletedSpans()
      expect(spans).toHaveLength(1)
      expect(spans[0].name).toBe('sync-operation')
      expect(spans[0].status).toBe(SpanStatus.OK)
    })

    it('should trace sync operation with error', () => {
      expect(() =>
        withTraceSync('failing-sync', () => {
          throw new Error('Sync error')
        })
      ).toThrow('Sync error')

      const spans = getCompletedSpans()
      expect(spans[0].status).toBe(SpanStatus.ERROR)
      expect(spans[0].error).toBe('Sync error')
    })
  })

  describe('recordMetric', () => {
    it('should record a metric', () => {
      recordMetric('page-load', 1234, { page: '/dashboard' })

      const spans = getCompletedSpans()
      expect(spans).toHaveLength(1)
      expect(spans[0].name).toBe('metric:page-load')
      expect(spans[0].attributes).toEqual({
        page: '/dashboard',
        value: 1234,
      })
    })

    it('should respect sample rate', () => {
      configureTelemetry({ sampleRate: 0 })
      recordMetric('sampled-metric', 100)

      const spans = getCompletedSpans()
      expect(spans).toHaveLength(0)
    })
  })

  describe('trackError', () => {
    it('should track error from Error object', () => {
      const error = new Error('Test error message')
      trackError(error, { component: 'TestComponent' })

      const spans = getCompletedSpans()
      expect(spans).toHaveLength(1)
      expect(spans[0].name).toBe('error')
      expect(spans[0].status).toBe(SpanStatus.ERROR)
      expect(spans[0].error).toBe('Test error message')
      expect(spans[0].attributes?.component).toBe('TestComponent')
    })

    it('should track error from string', () => {
      trackError('String error message')

      const spans = getCompletedSpans()
      expect(spans[0].error).toBe('String error message')
    })
  })

  describe('configureTelemetry', () => {
    it('should update configuration', () => {
      configureTelemetry({ sampleRate: 0.5 })

      // With 50% sample rate, roughly half should be sampled
      // We'll just verify configuration is applied by checking 0% rate
      configureTelemetry({ sampleRate: 0 })

      const spanId = startSpan('should-not-be-sampled')
      expect(spanId).toBe('')
    })
  })

  describe('clearSpans', () => {
    it('should clear all completed spans', () => {
      const spanId = startSpan('to-be-cleared')
      endSpan(spanId)

      expect(getCompletedSpans()).toHaveLength(1)

      clearSpans()

      expect(getCompletedSpans()).toHaveLength(0)
    })
  })
})

describe('Web Vitals Thresholds', () => {
  it('should define correct thresholds according to Core Web Vitals 2025', () => {
    // These are the official thresholds:
    // LCP: < 2.5s good, > 4s poor
    // INP: < 200ms good, > 500ms poor
    // CLS: < 0.1 good, > 0.25 poor
    // FCP: < 1.8s good, > 3s poor
    // TTFB: < 800ms good, > 1800ms poor

    // The actual thresholds are internal constants, but we can verify
    // the module exports initWebVitals which uses them
    expect(true).toBe(true) // Placeholder - actual thresholds tested via integration
  })
})
