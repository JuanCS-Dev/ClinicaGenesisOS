/**
 * Metrics Collection Endpoint Tests
 *
 * @module functions/__tests__/metrics/collect
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Firebase Admin
const mockSet = vi.fn().mockResolvedValue(undefined)
const mockDoc = vi.fn(() => ({
  collection: vi.fn(() => ({
    doc: vi.fn(() => ({ set: mockSet })),
  })),
}))
const mockBatch = {
  set: vi.fn(),
  commit: vi.fn().mockResolvedValue(undefined),
}

vi.mock('firebase-admin/firestore', () => ({
  getFirestore: vi.fn(() => ({
    collection: vi.fn(() => ({
      doc: mockDoc,
    })),
    batch: vi.fn(() => mockBatch),
  })),
  FieldValue: {
    serverTimestamp: vi.fn(() => 'server-timestamp'),
    increment: vi.fn((n: number) => ({ _increment: n })),
  },
}))

// Mock request/response
function createMockRequest(method: string, body?: unknown) {
  return {
    method,
    body,
    headers: {
      'user-agent': 'test-agent',
      referer: 'https://test.com',
    },
    query: {},
  }
}

function createMockResponse() {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  }
  return res
}

describe('collectMetrics', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('input validation', () => {
    it('rejects non-POST requests', async () => {
      const { collectMetrics } = await import('../../metrics/collect.js')
      const req = createMockRequest('GET')
      const res = createMockResponse()

      await (collectMetrics as any).run(req, res)

      expect(res.status).toHaveBeenCalledWith(405)
      expect(res.json).toHaveBeenCalledWith({ error: 'Method not allowed' })
    })

    it('rejects invalid payload - missing traces', async () => {
      const { collectMetrics } = await import('../../metrics/collect.js')
      const req = createMockRequest('POST', {})
      const res = createMockResponse()

      await (collectMetrics as any).run(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Invalid payload' }))
    })

    it('rejects invalid payload - empty traces', async () => {
      const { collectMetrics } = await import('../../metrics/collect.js')
      const req = createMockRequest('POST', { traces: [] })
      const res = createMockResponse()

      await (collectMetrics as any).run(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
    })

    it('rejects invalid payload - too many traces', async () => {
      const { collectMetrics } = await import('../../metrics/collect.js')
      const traces = Array(51).fill({
        name: 'test',
        startTime: 0,
        status: 'ok',
      })
      const req = createMockRequest('POST', { traces })
      const res = createMockResponse()

      await (collectMetrics as any).run(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
    })

    it('rejects invalid span data', async () => {
      const { collectMetrics } = await import('../../metrics/collect.js')
      const req = createMockRequest('POST', {
        traces: [{ name: '', startTime: 0, status: 'invalid' }],
      })
      const res = createMockResponse()

      await (collectMetrics as any).run(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
    })
  })

  describe('successful processing', () => {
    it('processes valid traces', async () => {
      const { collectMetrics } = await import('../../metrics/collect.js')
      const req = createMockRequest('POST', {
        traces: [
          {
            name: 'loadPatients',
            startTime: 100,
            endTime: 200,
            status: 'ok',
            attributes: { clinicId: 'clinic-123' },
          },
        ],
        clinicId: 'clinic-123',
        userId: 'user-456',
      })
      const res = createMockResponse()

      await (collectMetrics as any).run(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        processed: { webVitals: 0, traces: 1 },
      })
    })

    it('separates Web Vitals from regular traces', async () => {
      const { collectMetrics } = await import('../../metrics/collect.js')
      const req = createMockRequest('POST', {
        traces: [
          {
            name: 'webvital:LCP',
            startTime: 100,
            status: 'ok',
            attributes: { value: 2500, rating: 'good', delta: 100 },
          },
          {
            name: 'loadPatients',
            startTime: 100,
            endTime: 200,
            status: 'ok',
          },
        ],
      })
      const res = createMockResponse()

      await (collectMetrics as any).run(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        processed: { webVitals: 1, traces: 1 },
      })
    })

    it('handles errors gracefully', async () => {
      const { collectMetrics } = await import('../../metrics/collect.js')
      const req = createMockRequest('POST', {
        traces: [
          {
            name: 'error',
            startTime: 100,
            status: 'error',
            error: 'Something went wrong',
          },
        ],
      })
      const res = createMockResponse()

      await (collectMetrics as any).run(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
    })

    it('includes optional metadata', async () => {
      const { collectMetrics } = await import('../../metrics/collect.js')
      const req = createMockRequest('POST', {
        traces: [{ name: 'test', startTime: 0, status: 'ok' }],
        clinicId: 'clinic-123',
        userId: 'user-456',
        sessionId: 'session-789',
        userAgent: 'Custom Agent',
        url: 'https://custom.url',
      })
      const res = createMockResponse()

      await (collectMetrics as any).run(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
    })
  })
})

describe('getMetricsSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejects non-GET requests', async () => {
    const { getMetricsSummary } = await import('../../metrics/collect.js')
    const req = createMockRequest('POST')
    const res = createMockResponse()

    await (getMetricsSummary as any).run(req, res)

    expect(res.status).toHaveBeenCalledWith(405)
  })

  it('requires start and end dates', async () => {
    const { getMetricsSummary } = await import('../../metrics/collect.js')
    const req = { ...createMockRequest('GET'), query: {} }
    const res = createMockResponse()

    await (getMetricsSummary as any).run(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing start or end date' })
  })
})
