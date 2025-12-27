/**
 * Literature Cache Layer
 *
 * Caches literature search results in Firestore to reduce API calls.
 * Cache key: ICD-10 + specialty
 * TTL: 30 days (medical literature doesn't change frequently)
 */

import { logger } from 'firebase-functions';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import type { ScientificArticle, LiteratureCacheEntry } from './types.js';

const COLLECTION = 'literatureCache';
const DEFAULT_TTL_DAYS = 30;

/**
 * Get cached literature results.
 *
 * @param cacheKey - Cache key (ICD-10_specialty)
 * @returns Cached articles or null if not found/expired
 */
export async function getCachedResults(
  cacheKey: string
): Promise<ScientificArticle[] | null> {
  try {
    const db = getFirestore();
    const docRef = db.collection(COLLECTION).doc(cacheKey);
    const doc = await docRef.get();

    if (!doc.exists) {
      return null;
    }

    const data = doc.data() as LiteratureCacheEntry;
    const cachedAt = data.cachedAt instanceof Timestamp
      ? data.cachedAt.toDate()
      : new Date(data.cachedAt);

    // Check if cache is expired
    const ttlMs = (data.ttlDays || DEFAULT_TTL_DAYS) * 24 * 60 * 60 * 1000;
    const isExpired = Date.now() - cachedAt.getTime() > ttlMs;

    if (isExpired) {
      // Cache entry has expired
      return null;
    }

    // Increment hit count (fire and forget)
    docRef.update({ hitCount: (data.hitCount || 0) + 1 }).catch(() => {
      // Ignore update errors
    });

    // Cache hit
    return data.articles;
  } catch (error) {
    logger.error('[LiteratureCache] Get error:', { error });
    return null;
  }
}

/**
 * Store literature results in cache.
 *
 * @param cacheKey - Cache key (ICD-10_specialty)
 * @param articles - Articles to cache
 * @param ttlDays - TTL in days (default 30)
 */
export async function setCachedResults(
  cacheKey: string,
  articles: ScientificArticle[],
  ttlDays = DEFAULT_TTL_DAYS
): Promise<void> {
  try {
    const db = getFirestore();
    const entry: LiteratureCacheEntry = {
      cacheKey,
      articles,
      cachedAt: new Date(),
      ttlDays,
      hitCount: 0,
    };

    await db.collection(COLLECTION).doc(cacheKey).set(entry);
    // Articles cached successfully
  } catch (error) {
    logger.error('[LiteratureCache] Set error:', { error });
    // Non-fatal: continue without caching
  }
}

/**
 * Invalidate cache for a specific key.
 */
export async function invalidateCache(cacheKey: string): Promise<void> {
  try {
    const db = getFirestore();
    await db.collection(COLLECTION).doc(cacheKey).delete();
    // Cache invalidated
  } catch (error) {
    logger.error('[LiteratureCache] Invalidate error:', { error });
  }
}

/**
 * Get cache statistics.
 */
export async function getCacheStats(): Promise<{
  totalEntries: number;
  totalHits: number;
}> {
  try {
    const db = getFirestore();
    const snapshot = await db.collection(COLLECTION).get();

    let totalHits = 0;
    for (const doc of snapshot.docs) {
      const data = doc.data() as LiteratureCacheEntry;
      totalHits += data.hitCount || 0;
    }

    return {
      totalEntries: snapshot.size,
      totalHits,
    };
  } catch {
    return { totalEntries: 0, totalHits: 0 };
  }
}

export default {
  getCachedResults,
  setCachedResults,
  invalidateCache,
  getCacheStats,
};
