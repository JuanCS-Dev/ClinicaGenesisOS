/**
 * useGlosas Hook Tests - Billing denials management.
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useGlosas } from '../../hooks/useGlosas';
import {
  getGlosas,
  getGlosaById,
  subscribeToGlosas,
  updateGlosaStatus,
  calculateGlosaStats,
} from '../../services/firestore/glosa.service';
import type { GlosaFirestore } from '../../services/firestore/glosa.service';

// Mock dependencies
vi.mock('../../contexts/ClinicContext', () => ({
  useClinicContext: vi.fn(() => ({
    clinic: { id: 'clinic-123' },
  })),
}));

vi.mock('../../services/firestore/glosa.service', () => ({
  getGlosas: vi.fn(),
  getGlosaById: vi.fn(),
  subscribeToGlosas: vi.fn(),
  updateGlosaStatus: vi.fn(),
  calculateGlosaStats: vi.fn(),
}));

import { useClinicContext } from '../../contexts/ClinicContext';

const mockGlosa: GlosaFirestore = {
  id: 'glosa-123',
  clinicId: 'clinic-123',
  guiaId: 'guia-123',
  loteId: 'lote-123',
  operadoraId: 'operadora-123',
  status: 'pendente',
  motivo: 'Procedimento não autorizado',
  valor: 500,
  codigo: 'M001',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockStats = {
  total: 10,
  pendentes: 5,
  contestadas: 3,
  aceitas: 1,
  rejeitadas: 1,
  valorTotal: 5000,
  valorPendente: 2500,
};

/** Helper: Wait for hook to finish loading */
const waitForLoaded = async (result: { current: { loading: boolean } }) => {
  await waitFor(() => expect(result.current.loading).toBe(false));
};

describe('useGlosas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useClinicContext).mockReturnValue({
      clinic: { id: 'clinic-123' },
    } as unknown as ReturnType<typeof useClinicContext>);

    vi.mocked(subscribeToGlosas).mockImplementation(
      (_clinicId, callback, _filters) => {
        setTimeout(() => callback([mockGlosa]), 0);
        return vi.fn();
      }
    );

    vi.mocked(calculateGlosaStats).mockReturnValue(mockStats);
    vi.mocked(getGlosas).mockResolvedValue([mockGlosa]);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initial state', () => {
    it('should start with loading true', () => {
      const { result } = renderHook(() => useGlosas());
      expect(result.current.loading).toBe(true);
      expect(result.current.glosas).toEqual([]);
    });
  });

  describe('realtime mode (default)', () => {
    it('should subscribe to glosas updates', async () => {
      const { result } = renderHook(() => useGlosas());

      await waitForLoaded(result);

      expect(subscribeToGlosas).toHaveBeenCalledWith(
        'clinic-123',
        expect.any(Function),
        undefined
      );
      expect(result.current.glosas).toHaveLength(1);
    });

    it('should calculate stats from glosas', async () => {
      const { result } = renderHook(() => useGlosas());

      await waitForLoaded(result);

      expect(calculateGlosaStats).toHaveBeenCalledWith([mockGlosa]);
      expect(result.current.stats).toEqual(mockStats);
    });
  });

  describe('non-realtime mode', () => {
    it('should fetch glosas once', async () => {
      const { result } = renderHook(() =>
        useGlosas({ realtime: false })
      );

      await waitForLoaded(result);

      expect(getGlosas).toHaveBeenCalledWith('clinic-123', undefined);
      expect(subscribeToGlosas).not.toHaveBeenCalled();
      expect(result.current.glosas).toHaveLength(1);
    });
  });

  describe('with filters', () => {
    it('should pass filters to subscription', async () => {
      const filters = { status: 'pendente' as const };

      renderHook(() => useGlosas({ filters }));

      await waitFor(() => {
        expect(subscribeToGlosas).toHaveBeenCalledWith(
          'clinic-123',
          expect.any(Function),
          filters
        );
      });
    });

    it('should pass filters to fetch', async () => {
      const filters = { status: 'pendente' as const };

      const { result } = renderHook(() =>
        useGlosas({ realtime: false, filters })
      );

      await waitForLoaded(result);

      expect(getGlosas).toHaveBeenCalledWith('clinic-123', filters);
    });
  });

  describe('disabled state', () => {
    it('should not fetch when disabled', async () => {
      const { result } = renderHook(() =>
        useGlosas({ enabled: false })
      );

      await waitForLoaded(result);

      expect(subscribeToGlosas).not.toHaveBeenCalled();
      expect(getGlosas).not.toHaveBeenCalled();
      expect(result.current.glosas).toEqual([]);
    });
  });

  describe('when clinic is not set', () => {
    it('should return empty glosas', async () => {
      vi.mocked(useClinicContext).mockReturnValue({
        clinic: null,
      } as unknown as ReturnType<typeof useClinicContext>);

      const { result } = renderHook(() => useGlosas());

      await waitForLoaded(result);

      expect(result.current.glosas).toEqual([]);
    });
  });

  describe('refresh', () => {
    it('should refresh glosas', async () => {
      const { result } = renderHook(() =>
        useGlosas({ realtime: false })
      );

      await waitForLoaded(result);

      vi.mocked(getGlosas).mockClear();

      await act(async () => {
        await result.current.refresh();
      });

      expect(getGlosas).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateStatus', () => {
    it('should update glosa status', async () => {
      vi.mocked(updateGlosaStatus).mockResolvedValue(undefined);

      const { result } = renderHook(() => useGlosas());

      await waitForLoaded(result);

      await act(async () => {
        await result.current.updateStatus('glosa-123', 'contestada', 'recurso-123');
      });

      expect(updateGlosaStatus).toHaveBeenCalledWith(
        'clinic-123',
        'glosa-123',
        'contestada',
        'recurso-123'
      );
    });

    it('should throw error when clinic not selected', async () => {
      vi.mocked(useClinicContext).mockReturnValue({
        clinic: null,
      } as unknown as ReturnType<typeof useClinicContext>);

      const { result } = renderHook(() => useGlosas());

      await waitForLoaded(result);

      await expect(
        act(async () => {
          await result.current.updateStatus('glosa-123', 'contestada');
        })
      ).rejects.toThrow('Clinic not selected');
    });
  });

  describe('getById', () => {
    it('should get glosa by ID', async () => {
      vi.mocked(getGlosaById).mockResolvedValue(mockGlosa);

      const { result } = renderHook(() => useGlosas());

      await waitForLoaded(result);

      let glosa: GlosaFirestore | null = null;
      await act(async () => {
        glosa = await result.current.getById('glosa-123');
      });

      expect(getGlosaById).toHaveBeenCalledWith('clinic-123', 'glosa-123');
      expect(glosa?.id).toBe('glosa-123');
    });

    it('should return null when clinic not set', async () => {
      vi.mocked(useClinicContext).mockReturnValue({
        clinic: null,
      } as unknown as ReturnType<typeof useClinicContext>);

      const { result } = renderHook(() => useGlosas());

      await waitForLoaded(result);

      let glosa: GlosaFirestore | null = mockGlosa;
      await act(async () => {
        glosa = await result.current.getById('glosa-123');
      });

      expect(glosa).toBe(null);
    });
  });

  describe('error handling', () => {
    it('should handle fetch errors', async () => {
      vi.mocked(getGlosas).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() =>
        useGlosas({ realtime: false })
      );

      await waitForLoaded(result);

      expect(result.current.error?.message).toBe('Network error');
    });
  });

  describe('cleanup', () => {
    it('should unsubscribe on unmount', async () => {
      const unsubscribeMock = vi.fn();
      vi.mocked(subscribeToGlosas).mockImplementation(
        (_clinicId, callback, _filters) => {
          setTimeout(() => callback([mockGlosa]), 0);
          return unsubscribeMock;
        }
      );

      const { unmount } = renderHook(() => useGlosas());

      await waitFor(() => {
        expect(subscribeToGlosas).toHaveBeenCalled();
      });

      unmount();

      expect(unsubscribeMock).toHaveBeenCalled();
    });
  });
});
