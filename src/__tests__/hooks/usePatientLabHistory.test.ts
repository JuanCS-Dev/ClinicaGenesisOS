/**
 * usePatientLabHistory Hook Tests - Patient lab analysis history.
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { usePatientLabHistory } from '../../hooks/usePatientLabHistory';
import { clinicalReasoningService } from '../../services/clinical-reasoning.service';
import type { LabAnalysisSession } from '../../types';

// Mock dependencies
vi.mock('../../contexts/ClinicContext', () => ({
  useClinicContext: vi.fn(() => ({
    clinicId: 'clinic-123',
  })),
}));

vi.mock('../../services/clinical-reasoning.service', () => ({
  clinicalReasoningService: {
    getByPatient: vi.fn(),
    subscribeByPatient: vi.fn(),
  },
}));

import { useClinicContext } from '../../contexts/ClinicContext';

const mockSessions: LabAnalysisSession[] = [
  {
    id: 'session-1',
    clinicId: 'clinic-123',
    patientId: 'patient-123',
    userId: 'user-123',
    status: 'ready',
    source: 'upload',
    result: {
      biomarkers: [
        {
          name: 'Hemoglobina',
          value: 14.5,
          unit: 'g/dL',
          referenceRange: { min: 12, max: 16 },
          status: 'normal',
        },
      ],
      correlations: [],
      summary: {
        overview: 'Exames dentro da normalidade',
        keyFindings: ['Hemograma normal'],
        recommendations: ['Manter acompanhamento'],
      },
      confidence: 0.95,
      aiModel: 'gemini-2.0',
      processedAt: new Date().toISOString(),
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'session-2',
    clinicId: 'clinic-123',
    patientId: 'patient-123',
    userId: 'user-123',
    status: 'processing',
    source: 'manual',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'session-3',
    clinicId: 'clinic-123',
    patientId: 'patient-123',
    userId: 'user-123',
    status: 'error',
    source: 'upload',
    error: 'Failed to process',
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  },
];

describe('usePatientLabHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useClinicContext).mockReturnValue({
      clinicId: 'clinic-123',
    } as unknown as ReturnType<typeof useClinicContext>);

    vi.mocked(clinicalReasoningService.getByPatient).mockResolvedValue(mockSessions);
    vi.mocked(clinicalReasoningService.subscribeByPatient).mockReturnValue(vi.fn());
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initial state', () => {
    it('should start with loading true and empty sessions', () => {
      vi.mocked(clinicalReasoningService.getByPatient).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      const { result } = renderHook(() =>
        usePatientLabHistory({ patientId: 'patient-123' })
      );

      expect(result.current.isLoading).toBe(true);
      expect(result.current.sessions).toEqual([]);
      expect(result.current.error).toBe(null);
      expect(result.current.latestAnalysis).toBe(null);
    });
  });

  describe('one-time fetch (non-realtime)', () => {
    it('should fetch sessions on mount', async () => {
      const { result } = renderHook(() =>
        usePatientLabHistory({ patientId: 'patient-123' })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(clinicalReasoningService.getByPatient).toHaveBeenCalledWith(
        'clinic-123',
        'patient-123'
      );
      expect(result.current.sessions).toEqual(mockSessions);
    });

    it('should handle fetch error', async () => {
      vi.mocked(clinicalReasoningService.getByPatient).mockRejectedValue(
        new Error('Network error')
      );

      const { result } = renderHook(() =>
        usePatientLabHistory({ patientId: 'patient-123' })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Network error');
      expect(result.current.sessions).toEqual([]);
    });

    it('should handle non-Error throws', async () => {
      vi.mocked(clinicalReasoningService.getByPatient).mockRejectedValue(
        'Unknown error'
      );

      const { result } = renderHook(() =>
        usePatientLabHistory({ patientId: 'patient-123' })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Failed to fetch history');
    });
  });

  describe('real-time subscription', () => {
    it('should subscribe when realtime is true', async () => {
      vi.mocked(clinicalReasoningService.subscribeByPatient).mockImplementation(
        (_clinicId, _patientId, callback) => {
          setTimeout(() => callback(mockSessions), 0);
          return vi.fn();
        }
      );

      const { result } = renderHook(() =>
        usePatientLabHistory({ patientId: 'patient-123', realtime: true })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(clinicalReasoningService.subscribeByPatient).toHaveBeenCalledWith(
        'clinic-123',
        'patient-123',
        expect.any(Function)
      );
      expect(result.current.sessions).toEqual(mockSessions);
    });

    it('should unsubscribe on unmount', () => {
      const unsubscribeMock = vi.fn();
      vi.mocked(clinicalReasoningService.subscribeByPatient).mockReturnValue(
        unsubscribeMock
      );

      const { unmount } = renderHook(() =>
        usePatientLabHistory({ patientId: 'patient-123', realtime: true })
      );

      unmount();

      expect(unsubscribeMock).toHaveBeenCalled();
    });

    it('should update sessions when subscription emits new data', async () => {
      let subscriptionCallback: ((sessions: LabAnalysisSession[]) => void) | null = null;

      vi.mocked(clinicalReasoningService.subscribeByPatient).mockImplementation(
        (_clinicId, _patientId, callback) => {
          subscriptionCallback = callback;
          return vi.fn();
        }
      );

      const { result } = renderHook(() =>
        usePatientLabHistory({ patientId: 'patient-123', realtime: true })
      );

      // Initially loading
      expect(result.current.isLoading).toBe(true);

      // Emit data
      act(() => {
        subscriptionCallback?.(mockSessions);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.sessions).toEqual(mockSessions);

      // Emit updated data
      const newSession: LabAnalysisSession = {
        id: 'session-new',
        clinicId: 'clinic-123',
        patientId: 'patient-123',
        userId: 'user-123',
        status: 'ready',
        source: 'upload',
        result: {
          biomarkers: [],
          correlations: [],
          summary: {
            overview: 'New analysis',
            keyFindings: [],
            recommendations: [],
          },
          confidence: 0.9,
          aiModel: 'gemini-2.0',
          processedAt: new Date().toISOString(),
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      act(() => {
        subscriptionCallback?.([newSession, ...mockSessions]);
      });

      expect(result.current.sessions.length).toBe(4);
    });
  });

  describe('latestAnalysis', () => {
    it('should return the first ready session with result', async () => {
      const { result } = renderHook(() =>
        usePatientLabHistory({ patientId: 'patient-123' })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.latestAnalysis).not.toBe(null);
      expect(result.current.latestAnalysis?.id).toBe('session-1');
      expect(result.current.latestAnalysis?.status).toBe('ready');
    });

    it('should return null if no ready sessions', async () => {
      vi.mocked(clinicalReasoningService.getByPatient).mockResolvedValue([
        {
          id: 'session-processing',
          clinicId: 'clinic-123',
          patientId: 'patient-123',
          userId: 'user-123',
          status: 'processing',
          source: 'upload',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);

      const { result } = renderHook(() =>
        usePatientLabHistory({ patientId: 'patient-123' })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.latestAnalysis).toBe(null);
    });
  });

  describe('refresh', () => {
    it('should refetch data when refresh is called', async () => {
      const { result } = renderHook(() =>
        usePatientLabHistory({ patientId: 'patient-123' })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(clinicalReasoningService.getByPatient).toHaveBeenCalledTimes(1);

      // Clear previous data and mock new data
      vi.mocked(clinicalReasoningService.getByPatient).mockResolvedValue([
        mockSessions[0],
      ]);

      await act(async () => {
        await result.current.refresh();
      });

      expect(clinicalReasoningService.getByPatient).toHaveBeenCalledTimes(2);
      expect(result.current.sessions.length).toBe(1);
    });

    it('should clear error on successful refresh', async () => {
      vi.mocked(clinicalReasoningService.getByPatient).mockRejectedValueOnce(
        new Error('Initial error')
      );

      const { result } = renderHook(() =>
        usePatientLabHistory({ patientId: 'patient-123' })
      );

      await waitFor(() => {
        expect(result.current.error).toBe('Initial error');
      });

      // Mock successful fetch on refresh
      vi.mocked(clinicalReasoningService.getByPatient).mockResolvedValue(
        mockSessions
      );

      await act(async () => {
        await result.current.refresh();
      });

      expect(result.current.error).toBe(null);
      expect(result.current.sessions).toEqual(mockSessions);
    });
  });

  describe('when clinic is not set', () => {
    it('should not fetch if clinicId is null', async () => {
      vi.mocked(useClinicContext).mockReturnValue({
        clinicId: null,
      } as unknown as ReturnType<typeof useClinicContext>);

      renderHook(() => usePatientLabHistory({ patientId: 'patient-123' }));

      // Should not call fetch
      expect(clinicalReasoningService.getByPatient).not.toHaveBeenCalled();
    });

    it('should not subscribe if clinicId is null', () => {
      vi.mocked(useClinicContext).mockReturnValue({
        clinicId: null,
      } as unknown as ReturnType<typeof useClinicContext>);

      renderHook(() =>
        usePatientLabHistory({ patientId: 'patient-123', realtime: true })
      );

      expect(clinicalReasoningService.subscribeByPatient).not.toHaveBeenCalled();
    });
  });

  describe('patientId changes', () => {
    it('should refetch when patientId changes', async () => {
      const { result, rerender } = renderHook(
        ({ patientId }) => usePatientLabHistory({ patientId }),
        { initialProps: { patientId: 'patient-123' } }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(clinicalReasoningService.getByPatient).toHaveBeenCalledWith(
        'clinic-123',
        'patient-123'
      );

      // Change patientId
      rerender({ patientId: 'patient-456' });

      await waitFor(() => {
        expect(clinicalReasoningService.getByPatient).toHaveBeenCalledWith(
          'clinic-123',
          'patient-456'
        );
      });
    });
  });
});
