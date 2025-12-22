/**
 * Global Search Hook
 * ==================
 *
 * Hook for searching across patients, appointments, and records.
 * Powers the Command Palette (Cmd+K).
 *
 * Fase 14: UX Enhancement
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  collection,
  query as firestoreQuery,
  where,
  orderBy,
  limit,
  getDocs,
} from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useClinicContext } from '@/contexts/ClinicContext';
import { useDebounce } from './useDebounce';

/**
 * Search result types.
 */
export type SearchResultType =
  | 'patient'
  | 'appointment'
  | 'medical_record'
  | 'prescription'
  | 'transaction';

/**
 * Individual search result.
 */
export interface SearchResult {
  /** Unique identifier */
  id: string;
  /** Result type */
  type: SearchResultType;
  /** Display title */
  title: string;
  /** Subtitle/description */
  subtitle?: string;
  /** Navigation path */
  path: string;
  /** Metadata for display */
  meta?: Record<string, string>;
  /** Match score (higher = better match) */
  score: number;
}

/**
 * Search state.
 */
export interface GlobalSearchState {
  /** Search query */
  query: string;
  /** Search results */
  results: SearchResult[];
  /** Loading state */
  loading: boolean;
  /** Error message */
  error: string | null;
  /** Whether search has been performed */
  hasSearched: boolean;
}

/**
 * Search hook return type.
 */
export interface UseGlobalSearchReturn extends GlobalSearchState {
  /** Set search query */
  setQuery: (query: string) => void;
  /** Clear search */
  clear: () => void;
  /** Grouped results by type */
  groupedResults: Record<SearchResultType, SearchResult[]>;
}

/**
 * Minimum query length to trigger search.
 */
const MIN_QUERY_LENGTH = 2;

/**
 * Maximum results per type.
 */
const MAX_RESULTS_PER_TYPE = 5;

/**
 * Global search hook.
 */
export function useGlobalSearch(): UseGlobalSearchReturn {
  const { clinicId } = useClinicContext();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Debounce query for performance
  const debouncedQuery = useDebounce(query, 300);

  // Search patients
  const searchPatients = useCallback(
    async (searchQuery: string): Promise<SearchResult[]> => {
      if (!clinicId) return [];

      try {
        const patientsRef = collection(db, 'clinics', clinicId, 'patients');
        const q = firestoreQuery(
          patientsRef,
          orderBy('name'),
          limit(MAX_RESULTS_PER_TYPE * 2) // Get more to filter client-side
        );

        const snapshot = await getDocs(q);
        const lowerQuery = searchQuery.toLowerCase();

        return snapshot.docs
          .map((doc) => {
            const data = doc.data();
            const name = (data.name as string) || '';
            const email = (data.email as string) || '';
            const phone = (data.phone as string) || '';

            // Calculate match score
            let score = 0;
            if (name.toLowerCase().includes(lowerQuery)) {
              score += name.toLowerCase().startsWith(lowerQuery) ? 100 : 50;
            }
            if (email.toLowerCase().includes(lowerQuery)) {
              score += 30;
            }
            if (phone.includes(searchQuery)) {
              score += 20;
            }

            if (score === 0) return null;

            return {
              id: doc.id,
              type: 'patient' as SearchResultType,
              title: name,
              subtitle: email || phone,
              path: `/patients/${doc.id}`,
              meta: { phone },
              score,
            };
          })
          .filter((r): r is NonNullable<typeof r> => r !== null)
          .sort((a, b) => b.score - a.score)
          .slice(0, MAX_RESULTS_PER_TYPE);
      } catch (err) {
        console.error('Error searching patients:', err);
        return [];
      }
    },
    [clinicId]
  );

  // Search appointments
  const searchAppointments = useCallback(
    async (searchQuery: string): Promise<SearchResult[]> => {
      if (!clinicId) return [];

      try {
        // Get today's date for context
        const today = new Date().toISOString().split('T')[0];

        const appointmentsRef = collection(db, 'clinics', clinicId, 'appointments');
        const q = firestoreQuery(
          appointmentsRef,
          where('date', '>=', today),
          orderBy('date'),
          orderBy('time'),
          limit(MAX_RESULTS_PER_TYPE * 2)
        );

        const snapshot = await getDocs(q);
        const lowerQuery = searchQuery.toLowerCase();

        return snapshot.docs
          .map((doc) => {
            const data = doc.data();
            const patientName = (data.patientName as string) || '';
            const date = data.date as string;
            const time = data.time as string;

            let score = 0;
            if (patientName.toLowerCase().includes(lowerQuery)) {
              score += patientName.toLowerCase().startsWith(lowerQuery) ? 100 : 50;
            }

            if (score === 0) return null;

            return {
              id: doc.id,
              type: 'appointment' as SearchResultType,
              title: patientName,
              subtitle: `${date} às ${time}`,
              path: `/agenda?date=${date}`,
              meta: { date, time },
              score,
            };
          })
          .filter((r): r is NonNullable<typeof r> => r !== null)
          .sort((a, b) => b.score - a.score)
          .slice(0, MAX_RESULTS_PER_TYPE);
      } catch (err) {
        console.error('Error searching appointments:', err);
        return [];
      }
    },
    [clinicId]
  );

  // Perform search
  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedQuery || debouncedQuery.length < MIN_QUERY_LENGTH) {
        setResults([]);
        setHasSearched(false);
        return;
      }

      setLoading(true);
      setError(null);
      setHasSearched(true);

      try {
        // Search in parallel
        const [patients, appointments] = await Promise.all([
          searchPatients(debouncedQuery),
          searchAppointments(debouncedQuery),
        ]);

        // Combine and sort by score
        const allResults = [...patients, ...appointments].sort(
          (a, b) => b.score - a.score
        );

        setResults(allResults);
      } catch (err) {
        console.error('Search error:', err);
        setError('Erro na busca');
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery, searchPatients, searchAppointments]);

  // Clear search
  const clear = useCallback(() => {
    setQuery('');
    setResults([]);
    setHasSearched(false);
    setError(null);
  }, []);

  // Group results by type
  const groupedResults = useMemo(() => {
    const groups: Record<SearchResultType, SearchResult[]> = {
      patient: [],
      appointment: [],
      medical_record: [],
      prescription: [],
      transaction: [],
    };

    results.forEach((result) => {
      groups[result.type].push(result);
    });

    return groups;
  }, [results]);

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    hasSearched,
    clear,
    groupedResults,
  };
}

export default useGlobalSearch;

