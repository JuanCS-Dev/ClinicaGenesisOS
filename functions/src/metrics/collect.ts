/**
 * Metrics Collection Endpoint
 *
 * Receives telemetry data from the frontend and stores it in Firestore.
 * Includes Web Vitals (LCP, INP, CLS, FCP, TTFB) and custom traces.
 *
 * @module functions/metrics/collect
 */

import { onRequest } from 'firebase-functions/v2/https'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { z } from 'zod'

// =============================================================================
// SCHEMAS
// =============================================================================

const SpanSchema = z.object({
  name: z.string().min(1).max(100),
  startTime: z.number(),
  endTime: z.number().optional(),
  status: z.enum(['ok', 'error']),
  attributes: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
  error: z.string().max(500).optional(),
})

const MetricsPayloadSchema = z.object({
  traces: z.array(SpanSchema).min(1).max(50),
  clinicId: z.string().optional(),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  userAgent: z.string().max(500).optional(),
  url: z.string().max(500).optional(),
})

type MetricsPayload = z.infer<typeof MetricsPayloadSchema>

// =============================================================================
// ENDPOINT
// =============================================================================

/**
 * HTTP endpoint to collect telemetry metrics.
 *
 * POST /api/metrics
 * Body: { traces: Span[], clinicId?, userId?, sessionId? }
 */
export const collectMetrics = onRequest(
  {
    cors: true,
    maxInstances: 10,
    memory: '256MiB',
    timeoutSeconds: 30,
  },
  async (req, res) => {
    // Only allow POST
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' })
      return
    }

    // Validate payload
    const parseResult = MetricsPayloadSchema.safeParse(req.body)
    if (!parseResult.success) {
      res.status(400).json({
        error: 'Invalid payload',
        details: parseResult.error.issues,
      })
      return
    }

    const payload: MetricsPayload = parseResult.data
    const db = getFirestore()

    try {
      // Separate Web Vitals from custom traces
      const webVitals: Record<string, unknown>[] = []
      const traces: Record<string, unknown>[] = []

      for (const span of payload.traces) {
        const baseData = {
          ...span,
          timestamp: FieldValue.serverTimestamp(),
          clinicId: payload.clinicId || 'anonymous',
          userId: payload.userId || 'anonymous',
          sessionId: payload.sessionId || 'unknown',
          userAgent: payload.userAgent || req.headers['user-agent'] || 'unknown',
          url: payload.url || req.headers.referer || 'unknown',
        }

        if (span.name.startsWith('webvital:')) {
          webVitals.push({
            ...baseData,
            metric: span.name.replace('webvital:', ''),
            value: span.attributes?.value || 0,
            rating: span.attributes?.rating || 'unknown',
            delta: span.attributes?.delta || 0,
          })
        } else {
          traces.push(baseData)
        }
      }

      // Batch write to Firestore
      const batch = db.batch()

      // Store Web Vitals in dedicated collection for analytics
      for (const vital of webVitals) {
        const ref = db.collection('metrics').doc('webvitals').collection('entries').doc()
        batch.set(ref, vital)
      }

      // Store traces in traces collection
      for (const trace of traces) {
        const ref = db.collection('metrics').doc('traces').collection('entries').doc()
        batch.set(ref, trace)
      }

      // Update daily aggregates for Web Vitals
      if (webVitals.length > 0) {
        const today = new Date().toISOString().split('T')[0]
        const aggregateRef = db
          .collection('metrics')
          .doc('aggregates')
          .collection('daily')
          .doc(today)

        const updates: Record<string, FieldValue> = {}
        for (const vital of webVitals) {
          const metric = vital.metric as string
          const rating = vital.rating as string
          updates[`${metric}.count`] = FieldValue.increment(1)
          updates[`${metric}.sum`] = FieldValue.increment(vital.value as number)
          updates[`${metric}.${rating}`] = FieldValue.increment(1)
        }

        batch.set(aggregateRef, updates, { merge: true })
      }

      await batch.commit()

      res.status(200).json({
        success: true,
        processed: {
          webVitals: webVitals.length,
          traces: traces.length,
        },
      })
    } catch (error) {
      console.error('Error storing metrics:', error)
      res.status(500).json({ error: 'Failed to store metrics' })
    }
  }
)

/**
 * Get Web Vitals summary for a date range.
 *
 * GET /api/metrics/summary?start=2025-01-01&end=2025-01-31
 */
export const getMetricsSummary = onRequest(
  {
    cors: true,
    maxInstances: 5,
    memory: '256MiB',
    timeoutSeconds: 30,
  },
  async (req, res) => {
    if (req.method !== 'GET') {
      res.status(405).json({ error: 'Method not allowed' })
      return
    }

    const startDate = req.query.start as string
    const endDate = req.query.end as string

    if (!startDate || !endDate) {
      res.status(400).json({ error: 'Missing start or end date' })
      return
    }

    const db = getFirestore()

    try {
      const snapshot = await db
        .collection('metrics')
        .doc('aggregates')
        .collection('daily')
        .where('__name__', '>=', startDate)
        .where('__name__', '<=', endDate)
        .get()

      const summary: Record<string, { count: number; avg: number; good: number; poor: number }> = {
        LCP: { count: 0, avg: 0, good: 0, poor: 0 },
        INP: { count: 0, avg: 0, good: 0, poor: 0 },
        CLS: { count: 0, avg: 0, good: 0, poor: 0 },
        FCP: { count: 0, avg: 0, good: 0, poor: 0 },
        TTFB: { count: 0, avg: 0, good: 0, poor: 0 },
      }

      for (const doc of snapshot.docs) {
        const data = doc.data()
        for (const metric of Object.keys(summary)) {
          if (data[metric]) {
            summary[metric].count += data[metric].count || 0
            summary[metric].avg += data[metric].sum || 0
            summary[metric].good += data[metric].good || 0
            summary[metric].poor += data[metric].poor || 0
          }
        }
      }

      // Calculate averages
      for (const metric of Object.keys(summary)) {
        if (summary[metric].count > 0) {
          summary[metric].avg = summary[metric].avg / summary[metric].count
        }
      }

      res.status(200).json({
        period: { start: startDate, end: endDate },
        summary,
      })
    } catch (error) {
      console.error('Error fetching metrics summary:', error)
      res.status(500).json({ error: 'Failed to fetch metrics' })
    }
  }
)
