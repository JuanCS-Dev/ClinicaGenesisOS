/**
 * Scribe Metrics Service Tests
 * ============================
 *
 * Unit tests for scribe metrics service.
 * Fase 12: AI Scribe Enhancement
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';

// Mock Firebase
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  addDoc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  updateDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  Timestamp: {
    fromDate: vi.fn((date: Date) => ({ toDate: () => date })),
  },
  serverTimestamp: vi.fn(() => ({ _serverTimestamp: true })),
}));

vi.mock('@/services/firebase', () => ({
  db: {},
}));

import {
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
} from 'firebase/firestore';
import {
  submitFeedback,
  getFeedback,
  getRecentFeedback,
  getFeedbackByType,
  getDailyMetricsRange,
  calculateAggregateMetrics,
} from '../../../services/firestore/scribe-metrics.service';
import type { ScribeFeedback } from '@/types/scribe-metrics';

describe('Scribe Metrics Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('submitFeedback', () => {
    it('creates feedback entry', async () => {
      const mockDocRef = { id: 'feedback-123' };
      vi.mocked(addDoc).mockResolvedValue(mockDocRef as never);
      vi.mocked(getDocs).mockResolvedValue({ empty: true, docs: [] } as never);

      const result = await submitFeedback('clinic-1', 'user-1', {
        rating: 5,
        type: 'positive',
        categories: ['accuracy', 'time_saved'],
        comment: 'Great!',
        fieldEdits: [],
        totalEditPercentage: 5,
        reviewTimeSeconds: 30,
        generationTimeSeconds: 8,
      });

      expect(result).toBe('feedback-123');
      expect(addDoc).toHaveBeenCalled();
    });

    it('includes all input fields', async () => {
      const mockDocRef = { id: 'feedback-123' };
      vi.mocked(addDoc).mockResolvedValue(mockDocRef as never);
      vi.mocked(getDocs).mockResolvedValue({ empty: true, docs: [] } as never);

      await submitFeedback('clinic-1', 'user-1', {
        soapRecordId: 'soap-1',
        appointmentId: 'appt-1',
        rating: 4,
        type: 'positive',
        categories: ['completeness'],
        fieldEdits: [
          { field: 'subjective', original: 'a', edited: 'b', editDistance: 1, changePercentage: 50 },
        ],
        totalEditPercentage: 10,
        reviewTimeSeconds: 45,
        generationTimeSeconds: 7,
        audioDurationSeconds: 120,
        model: 'gpt-4o-mini',
      });

      const callArgs = vi.mocked(addDoc).mock.calls[0][1];
      expect(callArgs).toMatchObject({
        clinicId: 'clinic-1',
        userId: 'user-1',
        rating: 4,
        type: 'positive',
        categories: ['completeness'],
        soapRecordId: 'soap-1',
        appointmentId: 'appt-1',
      });
    });

    it('updates daily metrics', async () => {
      const mockDocRef = { id: 'feedback-123' };
      vi.mocked(addDoc).mockResolvedValue(mockDocRef as never);
      vi.mocked(getDocs).mockResolvedValue({ empty: true, docs: [] } as never);

      await submitFeedback('clinic-1', 'user-1', {
        rating: 3,
        type: 'negative',
        categories: ['hallucination'],
        fieldEdits: [],
        totalEditPercentage: 25,
        reviewTimeSeconds: 60,
        generationTimeSeconds: 10,
      });

      // Should call addDoc twice: feedback + daily metrics
      expect(addDoc).toHaveBeenCalledTimes(2);
    });
  });

  describe('getFeedback', () => {
    it('returns feedback when found', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        id: 'feedback-1',
        data: () => ({
          clinicId: 'clinic-1',
          userId: 'user-1',
          rating: 5,
          type: 'positive',
          categories: [],
          fieldEdits: [],
          totalEditPercentage: 0,
          reviewTimeSeconds: 20,
          generationTimeSeconds: 5,
          createdAt: { toDate: () => new Date() },
        }),
      } as never);

      const feedback = await getFeedback('clinic-1', 'feedback-1');

      expect(feedback).not.toBeNull();
      expect(feedback?.rating).toBe(5);
    });

    it('returns null when not found', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
      } as never);

      const feedback = await getFeedback('clinic-1', 'nonexistent');

      expect(feedback).toBeNull();
    });
  });

  describe('getRecentFeedback', () => {
    it('returns list of feedback', async () => {
      const mockDocs = [
        createMockDoc('fb-1', {
          clinicId: 'clinic-1',
          userId: 'user-1',
          rating: 5,
          type: 'positive',
          categories: [],
          fieldEdits: [],
          totalEditPercentage: 5,
          reviewTimeSeconds: 30,
          generationTimeSeconds: 8,
          createdAt: { toDate: () => new Date() },
        }),
      ];
      vi.mocked(getDocs).mockResolvedValue({ docs: mockDocs } as never);

      const feedback = await getRecentFeedback('clinic-1');

      expect(feedback).toHaveLength(1);
      expect(feedback[0].rating).toBe(5);
    });
  });

  describe('getFeedbackByType', () => {
    it('queries by positive type', async () => {
      vi.mocked(getDocs).mockResolvedValue({ docs: [] } as never);

      await getFeedbackByType('clinic-1', 'positive');

      expect(query).toHaveBeenCalled();
    });

    it('queries by negative type', async () => {
      vi.mocked(getDocs).mockResolvedValue({ docs: [] } as never);

      await getFeedbackByType('clinic-1', 'negative');

      expect(query).toHaveBeenCalled();
    });
  });

  describe('getDailyMetricsRange', () => {
    it('returns metrics for date range', async () => {
      const mockDocs = [
        createMockDoc('day-1', {
          date: '2025-12-20',
          clinicId: 'clinic-1',
          generations: 10,
          averageRating: 4.5,
          avgGenerationTimeMs: 8000,
          avgEditPercentage: 12,
          thumbsUp: 8,
          thumbsDown: 2,
        }),
      ];
      vi.mocked(getDocs).mockResolvedValue({ docs: mockDocs } as never);

      const metrics = await getDailyMetricsRange('clinic-1', '2025-12-01', '2025-12-31');

      expect(metrics).toHaveLength(1);
      expect(metrics[0].generations).toBe(10);
    });
  });

  describe('calculateAggregateMetrics', () => {
    it('returns empty aggregate for empty list', () => {
      const aggregate = calculateAggregateMetrics([], '2025-12-01', '2025-12-31');

      expect(aggregate.totalGenerations).toBe(0);
      expect(aggregate.averageRating).toBe(0);
      expect(aggregate.positiveCount).toBe(0);
      expect(aggregate.negativeCount).toBe(0);
    });

    it('calculates totals correctly', () => {
      const feedback: ScribeFeedback[] = [
        createFeedback('1', 5, 'positive', 10, 30, 8),
        createFeedback('2', 4, 'positive', 15, 45, 7),
        createFeedback('3', 2, 'negative', 50, 60, 10),
      ];

      const aggregate = calculateAggregateMetrics(feedback, '2025-12-01', '2025-12-31');

      expect(aggregate.totalGenerations).toBe(3);
      expect(aggregate.positiveCount).toBe(2);
      expect(aggregate.negativeCount).toBe(1);
    });

    it('calculates averages correctly', () => {
      const feedback: ScribeFeedback[] = [
        createFeedback('1', 4, 'positive', 10, 30, 6),
        createFeedback('2', 5, 'positive', 20, 60, 8),
      ];

      const aggregate = calculateAggregateMetrics(feedback, '2025-12-01', '2025-12-31');

      expect(aggregate.averageRating).toBe(4.5);
      expect(aggregate.averageEditPercentage).toBe(15);
      expect(aggregate.averageReviewTime).toBe(45);
      expect(aggregate.averageGenerationTime).toBe(7);
    });

    it('counts field edits', () => {
      const feedback: ScribeFeedback[] = [
        {
          ...createFeedback('1', 4, 'positive', 10, 30, 6),
          fieldEdits: [
            { field: 'subjective', original: 'a', edited: 'b', editDistance: 1, changePercentage: 10 },
            { field: 'assessment', original: 'c', edited: 'd', editDistance: 1, changePercentage: 5 },
          ],
        },
        {
          ...createFeedback('2', 5, 'positive', 5, 20, 5),
          fieldEdits: [
            { field: 'subjective', original: 'e', edited: 'f', editDistance: 1, changePercentage: 8 },
          ],
        },
      ];

      const aggregate = calculateAggregateMetrics(feedback, '2025-12-01', '2025-12-31');

      expect(aggregate.mostEditedFields.subjective).toBe(2);
      expect(aggregate.mostEditedFields.assessment).toBe(1);
      expect(aggregate.mostEditedFields.objective).toBe(0);
      expect(aggregate.mostEditedFields.plan).toBe(0);
    });

    it('counts categories', () => {
      const feedback: ScribeFeedback[] = [
        { ...createFeedback('1', 5, 'positive', 5, 30, 6), categories: ['accuracy', 'time_saved'] },
        { ...createFeedback('2', 4, 'positive', 10, 40, 7), categories: ['accuracy'] },
        { ...createFeedback('3', 2, 'negative', 40, 60, 10), categories: ['hallucination'] },
      ];

      const aggregate = calculateAggregateMetrics(feedback, '2025-12-01', '2025-12-31');

      expect(aggregate.topCategories.accuracy).toBe(2);
      expect(aggregate.topCategories.time_saved).toBe(1);
      expect(aggregate.topCategories.hallucination).toBe(1);
    });
  });
});

// Helper to create mock Firestore documents
function createMockDoc(
  id: string,
  data: DocumentData
): QueryDocumentSnapshot<DocumentData> {
  return {
    id,
    data: () => data,
    exists: () => true,
  } as QueryDocumentSnapshot<DocumentData>;
}

// Helper to create feedback
function createFeedback(
  id: string,
  rating: number,
  type: 'positive' | 'negative',
  editPct: number,
  reviewTime: number,
  genTime: number
): ScribeFeedback {
  return {
    id,
    clinicId: 'clinic-1',
    userId: 'user-1',
    rating: rating as 1 | 2 | 3 | 4 | 5,
    type,
    categories: [],
    fieldEdits: [],
    totalEditPercentage: editPct,
    reviewTimeSeconds: reviewTime,
    generationTimeSeconds: genTime,
    createdAt: new Date().toISOString(),
  };
}

