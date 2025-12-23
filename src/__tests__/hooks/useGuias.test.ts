/**
 * Tests for useGuias Hook
 *
 * Tests real-time TISS guide subscriptions and CRUD operations.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useGuias } from '@/hooks/useGuias';
import { guiaService } from '@/services/firestore';
import type { GuiaFirestore, StatusGuia, TipoGuia } from '@/types';

// Mock the ClinicContext
const mockClinicId = 'test-clinic-123';
vi.mock('@/contexts/ClinicContext', () => ({
  useClinicContext: vi.fn(() => ({ clinicId: mockClinicId })),
}));

// Mock useAuth
const mockUserId = 'test-user-456';
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({ user: { uid: mockUserId } })),
}));

// Mock the guia service
vi.mock('@/services/firestore', () => ({
  guiaService: {
    subscribe: vi.fn(),
    getAll: vi.fn(),
    create: vi.fn(),
    updateStatus: vi.fn(),
  },
}));

// Import the mocked hooks to control them
import { useClinicContext } from '@/contexts/ClinicContext';
import { useAuth } from '@/hooks/useAuth';

/**
 * Create a mock guia for testing.
 */
function createMockGuia(overrides: Partial<GuiaFirestore> = {}): GuiaFirestore {
  return {
    id: 'guia-1',
    clinicId: mockClinicId,
    tipo: 'consulta',
    status: 'rascunho',
    registroANS: '123456',
    numeroGuiaPrestador: 'GUIA-2024-001',
    patientId: 'patient-001',
    dataExecucao: '2024-12-20',
    procedimentos: [
      {
        codigo: '10101012',
        descricao: 'Consulta',
        quantidade: 1,
        valorUnitario: 150,
        valorTotal: 150,
      },
    ],
    valorTotal: 150,
    valorGlosado: 0,
    valorPago: 0,
    dadosBeneficiario: {
      numeroCarteira: 'CART-123',
      validadeCarteira: '2025-12-31',
      nome: 'Test Patient',
      cpf: '12345678900',
      dataNascimento: '1990-05-15',
    },
    dadosContratado: {
      cnpj: '12345678000190',
      nome: 'Test Clinic',
      cnes: '1234567',
    },
    createdAt: { toDate: () => new Date() } as GuiaFirestore['createdAt'],
    updatedAt: { toDate: () => new Date() } as GuiaFirestore['updatedAt'],
    createdBy: mockUserId,
    updatedBy: mockUserId,
    ...overrides,
  };
}

describe('useGuias', () => {
  let mockUnsubscribe: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUnsubscribe = vi.fn();

    vi.mocked(useClinicContext).mockReturnValue({
      clinicId: mockClinicId,
    } as ReturnType<typeof useClinicContext>);

    vi.mocked(useAuth).mockReturnValue({
      user: { uid: mockUserId },
    } as ReturnType<typeof useAuth>);

    vi.mocked(guiaService.subscribe).mockReturnValue(mockUnsubscribe as () => void);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('returns empty guias initially', () => {
      const { result } = renderHook(() => useGuias());

      expect(result.current.guias).toEqual([]);
    });

    it('starts with loading true when clinicId exists', () => {
      const { result } = renderHook(() => useGuias());

      expect(result.current.loading).toBe(true);
    });

    it('starts with loading false when no clinicId', () => {
      vi.mocked(useClinicContext).mockReturnValue({
        clinicId: null,
      } as unknown as ReturnType<typeof useClinicContext>);

      const { result } = renderHook(() => useGuias());

      expect(result.current.loading).toBe(false);
      expect(result.current.guias).toEqual([]);
    });

    it('starts with no error', () => {
      const { result } = renderHook(() => useGuias());

      expect(result.current.error).toBeNull();
    });

    it('starts with zero stats', () => {
      const { result } = renderHook(() => useGuias());

      expect(result.current.stats.total).toBe(0);
      expect(result.current.stats.pendentes).toBe(0);
      expect(result.current.stats.valorTotal).toBe(0);
    });
  });

  describe('subscription', () => {
    it('subscribes to guias when clinicId exists', () => {
      renderHook(() => useGuias());

      expect(guiaService.subscribe).toHaveBeenCalledWith(
        mockClinicId,
        expect.any(Function),
        expect.any(Function)
      );
    });

    it('unsubscribes on unmount', () => {
      const { unmount } = renderHook(() => useGuias());

      unmount();

      expect(mockUnsubscribe).toHaveBeenCalled();
    });

    it('updates guias when subscription receives data', async () => {
      const mockGuias = [createMockGuia()];

      vi.mocked(guiaService.subscribe).mockImplementation((_, onData) => {
        onData(mockGuias);
        return mockUnsubscribe;
      });

      const { result } = renderHook(() => useGuias());

      await waitFor(() => {
        expect(result.current.guias).toHaveLength(1);
      });

      expect(result.current.guias[0].numeroGuiaPrestador).toBe('GUIA-2024-001');
      expect(result.current.loading).toBe(false);
    });

    it('sets error when subscription fails', async () => {
      const mockError = new Error('Subscription failed');

      vi.mocked(guiaService.subscribe).mockImplementation((_, __, onError) => {
        if (onError) onError(mockError);
        return mockUnsubscribe;
      });

      const { result } = renderHook(() => useGuias());

      await waitFor(() => {
        expect(result.current.error).toEqual(mockError);
      });
    });
  });

  describe('stats calculation', () => {
    it('calculates stats correctly from guias', async () => {
      const mockGuias = [
        createMockGuia({ id: 'g-1', status: 'rascunho', valorTotal: 100, valorGlosado: 0, valorPago: 0 }),
        createMockGuia({ id: 'g-2', status: 'enviada', valorTotal: 200, valorGlosado: 0, valorPago: 0 }),
        createMockGuia({ id: 'g-3', status: 'autorizada', valorTotal: 300, valorGlosado: 0, valorPago: 300 }),
        createMockGuia({ id: 'g-4', status: 'paga', valorTotal: 150, valorGlosado: 0, valorPago: 150 }),
        createMockGuia({ id: 'g-5', status: 'glosada_parcial', valorTotal: 250, valorGlosado: 50, valorPago: 200 }),
        createMockGuia({ id: 'g-6', status: 'glosada_total', valorTotal: 100, valorGlosado: 100, valorPago: 0 }),
      ];

      vi.mocked(guiaService.subscribe).mockImplementation((_, onData) => {
        onData(mockGuias);
        return mockUnsubscribe;
      });

      const { result } = renderHook(() => useGuias());

      await waitFor(() => {
        expect(result.current.stats.total).toBe(6);
      });

      expect(result.current.stats.pendentes).toBe(2); // rascunho, enviada
      expect(result.current.stats.aprovadas).toBe(2); // autorizada, paga
      expect(result.current.stats.glosadas).toBe(2); // glosada_parcial, glosada_total
      expect(result.current.stats.valorTotal).toBe(1100);
      expect(result.current.stats.valorGlosado).toBe(150);
      expect(result.current.stats.valorRecebido).toBe(650);
    });

    it('includes em_analise in pendentes', async () => {
      const mockGuias = [
        createMockGuia({ id: 'g-1', status: 'em_analise', valorTotal: 100 }),
      ];

      vi.mocked(guiaService.subscribe).mockImplementation((_, onData) => {
        onData(mockGuias);
        return mockUnsubscribe;
      });

      const { result } = renderHook(() => useGuias());

      await waitFor(() => {
        expect(result.current.stats.pendentes).toBe(1);
      });
    });
  });

  describe('addGuia', () => {
    it('calls service create with correct parameters', async () => {
      const mockInput = {
        tipo: 'consulta' as TipoGuia,
        status: 'rascunho' as StatusGuia,
        registroANS: '123456',
        patientId: 'patient-001',
        dataExecucao: '2024-12-20',
        procedimentos: [],
        valorTotal: 150,
        dadosBeneficiario: {
          numeroCarteira: 'CART-123',
          validadeCarteira: '2025-12-31',
          nome: 'Test Patient',
          cpf: '12345678900',
          dataNascimento: '1990-05-15',
        },
        dadosContratado: {
          cnpj: '12345678000190',
          nome: 'Test Clinic',
          cnes: '1234567',
        },
      };

      vi.mocked(guiaService.create).mockResolvedValue('new-guia-id');

      const { result } = renderHook(() => useGuias());

      let newId: string;
      await act(async () => {
        newId = await result.current.addGuia(mockInput);
      });

      expect(guiaService.create).toHaveBeenCalledWith(mockClinicId, mockUserId, mockInput);
      expect(newId!).toBe('new-guia-id');
    });

    it('throws error when no clinic or user', async () => {
      vi.mocked(useClinicContext).mockReturnValue({
        clinicId: null,
      } as unknown as ReturnType<typeof useClinicContext>);

      const { result } = renderHook(() => useGuias());

      await expect(
        result.current.addGuia({} as Parameters<typeof result.current.addGuia>[0])
      ).rejects.toThrow('No clinic or user selected');
    });
  });

  describe('updateStatus', () => {
    it('calls service updateStatus with correct parameters', async () => {
      vi.mocked(guiaService.updateStatus).mockResolvedValue(undefined);

      const { result } = renderHook(() => useGuias());

      await act(async () => {
        await result.current.updateStatus('guia-1', 'enviada');
      });

      expect(guiaService.updateStatus).toHaveBeenCalledWith(
        mockClinicId,
        'guia-1',
        mockUserId,
        'enviada'
      );
    });

    it('throws error when no clinic or user', async () => {
      vi.mocked(useClinicContext).mockReturnValue({
        clinicId: null,
      } as unknown as ReturnType<typeof useClinicContext>);

      const { result } = renderHook(() => useGuias());

      await expect(
        result.current.updateStatus('guia-1', 'enviada')
      ).rejects.toThrow('No clinic or user selected');
    });
  });

  describe('filter methods', () => {
    const mockGuias = [
      createMockGuia({ id: 'g-1', status: 'rascunho', patientId: 'p-1', registroANS: 'ANS-1', tipo: 'consulta' }),
      createMockGuia({ id: 'g-2', status: 'autorizada', patientId: 'p-1', registroANS: 'ANS-2', tipo: 'sadt' }),
      createMockGuia({ id: 'g-3', status: 'rascunho', patientId: 'p-2', registroANS: 'ANS-1', tipo: 'consulta' }),
    ];

    beforeEach(() => {
      vi.mocked(guiaService.subscribe).mockImplementation((_, onData) => {
        onData(mockGuias);
        return mockUnsubscribe;
      });
    });

    it('getGuiasByStatus filters by status', async () => {
      const { result } = renderHook(() => useGuias());

      await waitFor(() => {
        expect(result.current.guias).toHaveLength(3);
      });

      const rascunhos = result.current.getGuiasByStatus('rascunho');
      expect(rascunhos).toHaveLength(2);
    });

    it('getGuiasByPatient filters by patient', async () => {
      const { result } = renderHook(() => useGuias());

      await waitFor(() => {
        expect(result.current.guias).toHaveLength(3);
      });

      const patientGuias = result.current.getGuiasByPatient('p-1');
      expect(patientGuias).toHaveLength(2);
    });

    it('getGuiasByOperadora filters by ANS registration', async () => {
      const { result } = renderHook(() => useGuias());

      await waitFor(() => {
        expect(result.current.guias).toHaveLength(3);
      });

      const operadoraGuias = result.current.getGuiasByOperadora('ANS-1');
      expect(operadoraGuias).toHaveLength(2);
    });

    it('getGuiasByTipo filters by guia type', async () => {
      const { result } = renderHook(() => useGuias());

      await waitFor(() => {
        expect(result.current.guias).toHaveLength(3);
      });

      const consultaGuias = result.current.getGuiasByTipo('consulta');
      expect(consultaGuias).toHaveLength(2);

      const sadtGuias = result.current.getGuiasByTipo('sadt');
      expect(sadtGuias).toHaveLength(1);
    });
  });

  describe('refresh', () => {
    it('calls service getAll and updates guias', async () => {
      const mockGuias = [createMockGuia()];
      vi.mocked(guiaService.getAll).mockResolvedValue(mockGuias);

      const { result } = renderHook(() => useGuias());

      await act(async () => {
        await result.current.refresh();
      });

      expect(guiaService.getAll).toHaveBeenCalledWith(mockClinicId);
    });

    it('does nothing when no clinicId', async () => {
      vi.mocked(useClinicContext).mockReturnValue({
        clinicId: null,
      } as unknown as ReturnType<typeof useClinicContext>);

      const { result } = renderHook(() => useGuias());

      await act(async () => {
        await result.current.refresh();
      });

      expect(guiaService.getAll).not.toHaveBeenCalled();
    });
  });
});
