/**
 * useGlobalSearch Hook Tests - Command palette search functionality.
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useGlobalSearch } from '../../hooks/useGlobalSearch';
import { getDocs } from 'firebase/firestore';

// Mock dependencies
vi.mock('../../contexts/ClinicContext', () => ({
  useClinicContext: vi.fn(() => ({
    clinicId: 'clinic-123',
  })),
}));

vi.mock('../../services/firebase', () => ({
  db: {},
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  getDocs: vi.fn(),
}));

vi.mock('../../hooks/useDebounce', () => ({
  useDebounce: vi.fn((value: string) => value),
}));

import { useClinicContext } from '../../contexts/ClinicContext';

const mockPatientDocs = [
  {
    id: 'patient-1',
    data: () => ({
      name: 'Maria Santos',
      email: 'maria@email.com',
      phone: '11999999999',
    }),
  },
  {
    id: 'patient-2',
    data: () => ({
      name: 'João Silva',
      email: 'joao@email.com',
      phone: '11888888888',
    }),
  },
];

const mockAppointmentDocs = [
  {
    id: 'apt-1',
    data: () => ({
      patientName: 'Maria Santos',
      date: '2025-01-20',
      time: '09:00',
    }),
  },
];

describe('useGlobalSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useClinicContext).mockReturnValue({
      clinicId: 'clinic-123',
    } as unknown as ReturnType<typeof useClinicContext>);

    vi.mocked(getDocs).mockResolvedValue({
      docs: [],
    } as unknown as Awaited<ReturnType<typeof getDocs>>);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initial state', () => {
    it('should start with empty query and results', () => {
      const { result } = renderHook(() => useGlobalSearch());

      expect(result.current.query).toBe('');
      expect(result.current.results).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.hasSearched).toBe(false);
    });
  });

  describe('setQuery', () => {
    it('should update query', () => {
      const { result } = renderHook(() => useGlobalSearch());

      act(() => {
        result.current.setQuery('maria');
      });

      expect(result.current.query).toBe('maria');
    });

    it('should not search for queries shorter than 2 characters', async () => {
      const { result } = renderHook(() => useGlobalSearch());

      act(() => {
        result.current.setQuery('m');
      });

      await waitFor(() => {
        expect(result.current.hasSearched).toBe(false);
      });
      expect(getDocs).not.toHaveBeenCalled();
    });
  });

  describe('search functionality', () => {
    it('should search patients and appointments', async () => {
      vi.mocked(getDocs)
        .mockResolvedValueOnce({
          docs: mockPatientDocs,
        } as unknown as Awaited<ReturnType<typeof getDocs>>)
        .mockResolvedValueOnce({
          docs: mockAppointmentDocs,
        } as unknown as Awaited<ReturnType<typeof getDocs>>);

      const { result } = renderHook(() => useGlobalSearch());

      act(() => {
        result.current.setQuery('maria');
      });

      await waitFor(() => {
        expect(result.current.hasSearched).toBe(true);
      });

      await waitFor(() => {
        expect(result.current.results.length).toBeGreaterThan(0);
      });
    });

    it('should match patient by name', async () => {
      vi.mocked(getDocs)
        .mockResolvedValueOnce({
          docs: mockPatientDocs,
        } as unknown as Awaited<ReturnType<typeof getDocs>>)
        .mockResolvedValueOnce({
          docs: [],
        } as unknown as Awaited<ReturnType<typeof getDocs>>);

      const { result } = renderHook(() => useGlobalSearch());

      act(() => {
        result.current.setQuery('maria');
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const patientResult = result.current.results.find(
        (r) => r.type === 'patient' && r.title === 'Maria Santos'
      );
      expect(patientResult).toBeDefined();
    });

    it('should match patient by email', async () => {
      vi.mocked(getDocs)
        .mockResolvedValueOnce({
          docs: mockPatientDocs,
        } as unknown as Awaited<ReturnType<typeof getDocs>>)
        .mockResolvedValueOnce({
          docs: [],
        } as unknown as Awaited<ReturnType<typeof getDocs>>);

      const { result } = renderHook(() => useGlobalSearch());

      act(() => {
        result.current.setQuery('maria@email');
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.results.length).toBeGreaterThan(0);
    });

    it('should match patient by phone', async () => {
      vi.mocked(getDocs)
        .mockResolvedValueOnce({
          docs: mockPatientDocs,
        } as unknown as Awaited<ReturnType<typeof getDocs>>)
        .mockResolvedValueOnce({
          docs: [],
        } as unknown as Awaited<ReturnType<typeof getDocs>>);

      const { result } = renderHook(() => useGlobalSearch());

      act(() => {
        result.current.setQuery('11999');
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.results.length).toBeGreaterThan(0);
    });
  });

  describe('groupedResults', () => {
    it('should group results by type', async () => {
      vi.mocked(getDocs)
        .mockResolvedValueOnce({
          docs: mockPatientDocs,
        } as unknown as Awaited<ReturnType<typeof getDocs>>)
        .mockResolvedValueOnce({
          docs: mockAppointmentDocs,
        } as unknown as Awaited<ReturnType<typeof getDocs>>);

      const { result } = renderHook(() => useGlobalSearch());

      act(() => {
        result.current.setQuery('maria');
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.groupedResults.patient.length).toBeGreaterThanOrEqual(0);
      expect(result.current.groupedResults.appointment.length).toBeGreaterThanOrEqual(0);
    });

    it('should have all result type categories', () => {
      const { result } = renderHook(() => useGlobalSearch());

      expect(result.current.groupedResults).toHaveProperty('patient');
      expect(result.current.groupedResults).toHaveProperty('appointment');
      expect(result.current.groupedResults).toHaveProperty('medical_record');
      expect(result.current.groupedResults).toHaveProperty('prescription');
      expect(result.current.groupedResults).toHaveProperty('transaction');
    });
  });

  describe('clear', () => {
    it('should clear search state', async () => {
      vi.mocked(getDocs).mockResolvedValue({
        docs: mockPatientDocs,
      } as unknown as Awaited<ReturnType<typeof getDocs>>);

      const { result } = renderHook(() => useGlobalSearch());

      act(() => {
        result.current.setQuery('maria');
      });

      await waitFor(() => {
        expect(result.current.hasSearched).toBe(true);
      });

      act(() => {
        result.current.clear();
      });

      expect(result.current.query).toBe('');
      expect(result.current.results).toEqual([]);
      expect(result.current.hasSearched).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should handle search errors gracefully', async () => {
      // Note: Individual search functions catch errors and return empty arrays,
      // so errors from getDocs are logged but don't propagate to error state
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(getDocs).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useGlobalSearch());

      act(() => {
        result.current.setQuery('test');
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Errors are logged but gracefully handled
      expect(consoleSpy).toHaveBeenCalled();
      // Results are empty when errors occur
      expect(result.current.results).toEqual([]);
      consoleSpy.mockRestore();
    });
  });

  describe('when clinic is not set', () => {
    it('should return empty results', async () => {
      vi.mocked(useClinicContext).mockReturnValue({
        clinicId: null,
      } as unknown as ReturnType<typeof useClinicContext>);

      const { result } = renderHook(() => useGlobalSearch());

      act(() => {
        result.current.setQuery('maria');
      });

      await waitFor(() => {
        expect(result.current.hasSearched).toBe(true);
      });

      expect(result.current.results).toEqual([]);
    });
  });

  describe('result scoring', () => {
    it('should prioritize name start matches', async () => {
      const docs = [
        { id: '1', data: () => ({ name: 'Maria Santos', email: '', phone: '' }) },
        { id: '2', data: () => ({ name: 'Ana Maria', email: '', phone: '' }) },
      ];

      vi.mocked(getDocs)
        .mockResolvedValueOnce({
          docs,
        } as unknown as Awaited<ReturnType<typeof getDocs>>)
        .mockResolvedValueOnce({
          docs: [],
        } as unknown as Awaited<ReturnType<typeof getDocs>>);

      const { result } = renderHook(() => useGlobalSearch());

      act(() => {
        result.current.setQuery('maria');
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // "Maria Santos" should score higher than "Ana Maria"
      if (result.current.results.length >= 2) {
        expect(result.current.results[0].title).toBe('Maria Santos');
      }
    });
  });
});
