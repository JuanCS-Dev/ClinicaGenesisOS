/**
 * Scribe Metrics Service
 * ======================
 *
 * Service for collecting and analyzing AI Scribe feedback and metrics.
 * Fase 12: AI Scribe Enhancement
 *
 * SCRIBE Framework compliance (Nature Digital Medicine 2025):
 * - Reviewer assessment: Physician feedback collection
 * - Computational metrics: Edit distance, change percentage
 */

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from '@/services/firebase';
import type {
  ScribeFeedback,
  CreateFeedbackInput,
  DailyMetrics,
  ScribeMetricsAggregate,
  SOAPField,
  FeedbackCategory,
} from '@/types/scribe-metrics';

// ============================================
// Collection References
// ============================================

/**
 * Get scribe feedback collection reference.
 */
function getFeedbackRef(clinicId: string) {
  return collection(db, 'clinics', clinicId, 'scribeFeedback');
}

/**
 * Get daily metrics collection reference.
 */
function getDailyMetricsRef(clinicId: string) {
  return collection(db, 'clinics', clinicId, 'scribeDailyMetrics');
}

// ============================================
// Converters
// ============================================

/**
 * Convert Firestore doc to ScribeFeedback.
 */
function feedbackConverter(
  docSnap: QueryDocumentSnapshot<DocumentData>
): ScribeFeedback {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    clinicId: data.clinicId,
    userId: data.userId,
    soapRecordId: data.soapRecordId,
    appointmentId: data.appointmentId,
    rating: data.rating,
    type: data.type,
    categories: data.categories || [],
    comment: data.comment,
    fieldEdits: data.fieldEdits || [],
    totalEditPercentage: data.totalEditPercentage || 0,
    reviewTimeSeconds: data.reviewTimeSeconds || 0,
    generationTimeSeconds: data.generationTimeSeconds || 0,
    audioDurationSeconds: data.audioDurationSeconds,
    model: data.model,
    createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
  };
}

/**
 * Convert Firestore doc to DailyMetrics.
 */
function dailyMetricsConverter(
  docSnap: QueryDocumentSnapshot<DocumentData>
): DailyMetrics {
  const data = docSnap.data();
  return {
    date: data.date,
    clinicId: data.clinicId,
    generations: data.generations || 0,
    averageRating: data.averageRating || 0,
    avgGenerationTimeMs: data.avgGenerationTimeMs || 0,
    avgEditPercentage: data.avgEditPercentage || 0,
    thumbsUp: data.thumbsUp || 0,
    thumbsDown: data.thumbsDown || 0,
  };
}

// ============================================
// Feedback Operations
// ============================================

/**
 * Submit feedback for AI Scribe output.
 *
 * @param clinicId - Clinic ID
 * @param userId - User submitting feedback
 * @param input - Feedback input
 * @returns Created feedback ID
 */
export async function submitFeedback(
  clinicId: string,
  userId: string,
  input: CreateFeedbackInput
): Promise<string> {
  const ref = getFeedbackRef(clinicId);

  const feedback = {
    clinicId,
    userId,
    soapRecordId: input.soapRecordId || null,
    appointmentId: input.appointmentId || null,
    rating: input.rating,
    type: input.type,
    categories: input.categories,
    comment: input.comment || null,
    fieldEdits: input.fieldEdits,
    totalEditPercentage: input.totalEditPercentage,
    reviewTimeSeconds: input.reviewTimeSeconds,
    generationTimeSeconds: input.generationTimeSeconds,
    audioDurationSeconds: input.audioDurationSeconds || null,
    model: input.model || null,
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(ref, feedback);

  // Update daily metrics
  await updateDailyMetrics(clinicId, input);

  return docRef.id;
}

/**
 * Get feedback by ID.
 *
 * @param clinicId - Clinic ID
 * @param feedbackId - Feedback ID
 * @returns Feedback or null
 */
export async function getFeedback(
  clinicId: string,
  feedbackId: string
): Promise<ScribeFeedback | null> {
  const ref = doc(db, 'clinics', clinicId, 'scribeFeedback', feedbackId);
  const docSnap = await getDoc(ref);

  if (!docSnap.exists()) {
    return null;
  }

  return feedbackConverter(docSnap as QueryDocumentSnapshot<DocumentData>);
}

/**
 * Get recent feedback for a clinic.
 *
 * @param clinicId - Clinic ID
 * @param maxResults - Maximum results (default 50)
 * @returns List of feedback entries
 */
export async function getRecentFeedback(
  clinicId: string,
  maxResults: number = 50
): Promise<ScribeFeedback[]> {
  const ref = getFeedbackRef(clinicId);
  const q = query(
    ref,
    orderBy('createdAt', 'desc'),
    limit(maxResults)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(feedbackConverter);
}

/**
 * Get feedback by type (positive/negative).
 *
 * @param clinicId - Clinic ID
 * @param type - Feedback type
 * @param maxResults - Maximum results (default 50)
 * @returns List of feedback entries
 */
export async function getFeedbackByType(
  clinicId: string,
  type: 'positive' | 'negative',
  maxResults: number = 50
): Promise<ScribeFeedback[]> {
  const ref = getFeedbackRef(clinicId);
  const q = query(
    ref,
    where('type', '==', type),
    orderBy('createdAt', 'desc'),
    limit(maxResults)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(feedbackConverter);
}

// ============================================
// Daily Metrics Operations
// ============================================

/**
 * Update daily metrics with new feedback.
 */
async function updateDailyMetrics(
  clinicId: string,
  input: CreateFeedbackInput
): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  const ref = getDailyMetricsRef(clinicId);

  // Query for today's metrics
  const q = query(ref, where('date', '==', today), limit(1));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    // Create new daily metrics doc
    await addDoc(ref, {
      date: today,
      clinicId,
      generations: 1,
      totalRating: input.rating,
      averageRating: input.rating,
      totalGenerationTimeMs: input.generationTimeSeconds * 1000,
      avgGenerationTimeMs: input.generationTimeSeconds * 1000,
      totalEditPercentage: input.totalEditPercentage,
      avgEditPercentage: input.totalEditPercentage,
      thumbsUp: input.type === 'positive' ? 1 : 0,
      thumbsDown: input.type === 'negative' ? 1 : 0,
      updatedAt: serverTimestamp(),
    });
  } else {
    // Update existing metrics
    const docRef = snapshot.docs[0].ref;
    const data = snapshot.docs[0].data();

    const newGenerations = (data.generations || 0) + 1;
    const newTotalRating = (data.totalRating || 0) + input.rating;
    const newTotalGenTime = (data.totalGenerationTimeMs || 0) + input.generationTimeSeconds * 1000;
    const newTotalEditPct = (data.totalEditPercentage || 0) + input.totalEditPercentage;

    await updateDoc(docRef, {
      generations: newGenerations,
      totalRating: newTotalRating,
      averageRating: newTotalRating / newGenerations,
      totalGenerationTimeMs: newTotalGenTime,
      avgGenerationTimeMs: newTotalGenTime / newGenerations,
      totalEditPercentage: newTotalEditPct,
      avgEditPercentage: newTotalEditPct / newGenerations,
      thumbsUp: (data.thumbsUp || 0) + (input.type === 'positive' ? 1 : 0),
      thumbsDown: (data.thumbsDown || 0) + (input.type === 'negative' ? 1 : 0),
      updatedAt: serverTimestamp(),
    });
  }
}

/**
 * Get daily metrics for a date range.
 *
 * @param clinicId - Clinic ID
 * @param startDate - Start date (YYYY-MM-DD)
 * @param endDate - End date (YYYY-MM-DD)
 * @returns List of daily metrics
 */
export async function getDailyMetricsRange(
  clinicId: string,
  startDate: string,
  endDate: string
): Promise<DailyMetrics[]> {
  const ref = getDailyMetricsRef(clinicId);
  const q = query(
    ref,
    where('date', '>=', startDate),
    where('date', '<=', endDate),
    orderBy('date', 'asc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(dailyMetricsConverter);
}

/**
 * Calculate aggregate metrics for a time period.
 *
 * @param feedbackList - List of feedback entries
 * @param periodStart - Period start date
 * @param periodEnd - Period end date
 * @returns Aggregated metrics
 */
export function calculateAggregateMetrics(
  feedbackList: ScribeFeedback[],
  periodStart: string,
  periodEnd: string
): ScribeMetricsAggregate {
  if (feedbackList.length === 0) {
    return {
      periodStart,
      periodEnd,
      totalGenerations: 0,
      averageRating: 0,
      positiveCount: 0,
      negativeCount: 0,
      averageEditPercentage: 0,
      averageReviewTime: 0,
      averageGenerationTime: 0,
      mostEditedFields: {
        subjective: 0,
        objective: 0,
        assessment: 0,
        plan: 0,
      },
      topCategories: {} as Record<FeedbackCategory, number>,
    };
  }

  const totalGenerations = feedbackList.length;
  const positiveCount = feedbackList.filter((f) => f.type === 'positive').length;
  const negativeCount = feedbackList.filter((f) => f.type === 'negative').length;

  const sumRating = feedbackList.reduce((acc, f) => acc + f.rating, 0);
  const sumEditPct = feedbackList.reduce((acc, f) => acc + f.totalEditPercentage, 0);
  const sumReviewTime = feedbackList.reduce((acc, f) => acc + f.reviewTimeSeconds, 0);
  const sumGenTime = feedbackList.reduce((acc, f) => acc + f.generationTimeSeconds, 0);

  // Count edits per field
  const fieldEdits: Record<SOAPField, number> = {
    subjective: 0,
    objective: 0,
    assessment: 0,
    plan: 0,
  };

  feedbackList.forEach((f) => {
    f.fieldEdits.forEach((edit) => {
      if (edit.changePercentage > 0) {
        fieldEdits[edit.field]++;
      }
    });
  });

  // Count categories
  const categoryCount: Record<string, number> = {};
  feedbackList.forEach((f) => {
    f.categories.forEach((cat) => {
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    });
  });

  return {
    periodStart,
    periodEnd,
    totalGenerations,
    averageRating: sumRating / totalGenerations,
    positiveCount,
    negativeCount,
    averageEditPercentage: sumEditPct / totalGenerations,
    averageReviewTime: sumReviewTime / totalGenerations,
    averageGenerationTime: sumGenTime / totalGenerations,
    mostEditedFields: fieldEdits,
    topCategories: categoryCount as Record<FeedbackCategory, number>,
  };
}

