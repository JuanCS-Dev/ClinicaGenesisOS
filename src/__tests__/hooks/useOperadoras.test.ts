/**
 * Tests for useOperadoras Hook
 *
 * Tests real-time operadora subscriptions and CRUD operations.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useOperadoras } from '@/hooks/useOperadoras';
import { operadoraService } from '@/services/firestore';
import type { OperadoraFirestore, CreateOperadoraInput } from '@/types';

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

// Mock the operadora service
vi.mock('@/services/firestore', () => ({
  operadoraService: {
    subscribe: vi.fn(),
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    toggleAtiva: vi.fn(),
    delete: vi.fn(),
  },
}));

// Import the mocked hooks to control them
import { useClinicContext } from '@/contexts/ClinicContext';
import { useAuth } from '@/hooks/useAuth';

/**
 * Create a mock operadora for testing.
 */
function createMockOperadora(overrides: Partial<OperadoraFirestore> = {}): OperadoraFirestore {
  return {
    id: 'operadora-1',
    clinicId: mockClinicId,
    registroANS: '123456',
    nomeFantasia: 'Test Operadora',
    razaoSocial: 'Test Operadora LTDA',
    cnpj: '12345678000190',
    codigoPrestador: 'PREST-001',
    tabelaPrecos: '22',
    ativa: true,
    configuracoes: {
      prazoEnvioDias: 30,
      exigeAutorizacao: false,
      permiteLote: true,
      aceitaRecursoOnline: false,
      diasPrazoRecurso: 30,
    },
    webservice: {
      tipoIntegracao: 'portal',
    },
    createdAt: { toDate: () => new Date() } as OperadoraFirestore['createdAt'],
    updatedAt: { toDate: () => new Date() } as OperadoraFirestore['updatedAt'],
    createdBy: mockUserId,
    updatedBy: mockUserId,
    ...overrides,
  };
}

describe('useOperadoras', () => {
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

    vi.mocked(operadoraService.subscribe).mockReturnValue(mockUnsubscribe as () => void);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('returns empty operadoras initially', () => {
      const { result } = renderHook(() => useOperadoras());

      expect(result.current.operadoras).toEqual([]);
    });

    it('starts with loading true when clinicId exists', () => {
      const { result } = renderHook(() => useOperadoras());

      expect(result.current.loading).toBe(true);
    });

    it('starts with loading false when no clinicId', () => {
      vi.mocked(useClinicContext).mockReturnValue({
        clinicId: null,
      } as unknown as ReturnType<typeof useClinicContext>);

      const { result } = renderHook(() => useOperadoras());

      expect(result.current.loading).toBe(false);
      expect(result.current.operadoras).toEqual([]);
    });

    it('starts with no error', () => {
      const { result } = renderHook(() => useOperadoras());

      expect(result.current.error).toBeNull();
    });
  });

  describe('subscription', () => {
    it('subscribes to operadoras when clinicId exists', () => {
      renderHook(() => useOperadoras());

      expect(operadoraService.subscribe).toHaveBeenCalledWith(
        mockClinicId,
        expect.any(Function),
        expect.any(Function)
      );
    });

    it('unsubscribes on unmount', () => {
      const { unmount } = renderHook(() => useOperadoras());

      unmount();

      expect(mockUnsubscribe).toHaveBeenCalled();
    });

    it('updates operadoras when subscription receives data', async () => {
      const mockOperadoras = [createMockOperadora()];

      vi.mocked(operadoraService.subscribe).mockImplementation((_, onData) => {
        onData(mockOperadoras);
        return mockUnsubscribe;
      });

      const { result } = renderHook(() => useOperadoras());

      await waitFor(() => {
        expect(result.current.operadoras).toHaveLength(1);
      });

      expect(result.current.operadoras[0].nomeFantasia).toBe('Test Operadora');
      expect(result.current.loading).toBe(false);
    });

    it('sets error when subscription fails', async () => {
      const mockError = new Error('Subscription failed');

      vi.mocked(operadoraService.subscribe).mockImplementation((_, __, onError) => {
        if (onError) onError(mockError);
        return mockUnsubscribe;
      });

      const { result } = renderHook(() => useOperadoras());

      await waitFor(() => {
        expect(result.current.error).toEqual(mockError);
      });
    });
  });

  describe('operadorasAtivas', () => {
    it('returns only active operadoras', async () => {
      const mockOperadoras = [
        createMockOperadora({ id: 'op-1', ativa: true }),
        createMockOperadora({ id: 'op-2', ativa: false }),
        createMockOperadora({ id: 'op-3', ativa: true }),
      ];

      vi.mocked(operadoraService.subscribe).mockImplementation((_, onData) => {
        onData(mockOperadoras);
        return mockUnsubscribe;
      });

      const { result } = renderHook(() => useOperadoras());

      await waitFor(() => {
        expect(result.current.operadorasAtivas).toHaveLength(2);
      });
    });
  });

  describe('addOperadora', () => {
    it('calls service create with correct parameters', async () => {
      const mockInput: CreateOperadoraInput = {
        registroANS: '654321',
        nomeFantasia: 'New Operadora',
        razaoSocial: 'New Operadora LTDA',
        cnpj: '98765432000110',
        codigoPrestador: 'PREST-002',
        tabelaPrecos: '22',
        ativa: true,
        configuracoes: {
          prazoEnvioDias: 30,
          exigeAutorizacao: false,
          permiteLote: true,
          aceitaRecursoOnline: false,
          diasPrazoRecurso: 30,
        },
        webservice: {
          tipoIntegracao: 'portal',
        },
      };

      vi.mocked(operadoraService.create).mockResolvedValue('new-operadora-id');

      const { result } = renderHook(() => useOperadoras());

      let newId: string;
      await act(async () => {
        newId = await result.current.addOperadora(mockInput);
      });

      expect(operadoraService.create).toHaveBeenCalledWith(mockClinicId, mockUserId, mockInput);
      expect(newId!).toBe('new-operadora-id');
    });

    it('throws error when no clinic or user', async () => {
      vi.mocked(useClinicContext).mockReturnValue({
        clinicId: null,
      } as unknown as ReturnType<typeof useClinicContext>);

      const { result } = renderHook(() => useOperadoras());

      await expect(
        result.current.addOperadora({} as CreateOperadoraInput)
      ).rejects.toThrow('No clinic or user selected');
    });
  });

  describe('updateOperadora', () => {
    it('calls service update with correct parameters', async () => {
      vi.mocked(operadoraService.update).mockResolvedValue(undefined);

      const { result } = renderHook(() => useOperadoras());

      await act(async () => {
        await result.current.updateOperadora('operadora-1', { nomeFantasia: 'Updated Name' });
      });

      expect(operadoraService.update).toHaveBeenCalledWith(
        mockClinicId,
        'operadora-1',
        mockUserId,
        { nomeFantasia: 'Updated Name' }
      );
    });
  });

  describe('toggleAtiva', () => {
    it('calls service toggleAtiva with correct parameters', async () => {
      vi.mocked(operadoraService.toggleAtiva).mockResolvedValue(undefined);

      const { result } = renderHook(() => useOperadoras());

      await act(async () => {
        await result.current.toggleAtiva('operadora-1', false);
      });

      expect(operadoraService.toggleAtiva).toHaveBeenCalledWith(
        mockClinicId,
        'operadora-1',
        mockUserId,
        false
      );
    });
  });

  describe('deleteOperadora', () => {
    it('calls service delete with correct parameters', async () => {
      vi.mocked(operadoraService.delete).mockResolvedValue(undefined);

      const { result } = renderHook(() => useOperadoras());

      await act(async () => {
        await result.current.deleteOperadora('operadora-1');
      });

      expect(operadoraService.delete).toHaveBeenCalledWith(mockClinicId, 'operadora-1');
    });
  });

  describe('getOperadoraByANS', () => {
    it('returns operadora matching ANS registration', async () => {
      const mockOperadoras = [
        createMockOperadora({ id: 'op-1', registroANS: '123456' }),
        createMockOperadora({ id: 'op-2', registroANS: '654321' }),
      ];

      vi.mocked(operadoraService.subscribe).mockImplementation((_, onData) => {
        onData(mockOperadoras);
        return mockUnsubscribe;
      });

      const { result } = renderHook(() => useOperadoras());

      await waitFor(() => {
        expect(result.current.operadoras).toHaveLength(2);
      });

      const operadora = result.current.getOperadoraByANS('654321');
      expect(operadora?.id).toBe('op-2');
    });

    it('returns undefined when ANS not found', async () => {
      const mockOperadoras = [createMockOperadora({ registroANS: '123456' })];

      vi.mocked(operadoraService.subscribe).mockImplementation((_, onData) => {
        onData(mockOperadoras);
        return mockUnsubscribe;
      });

      const { result } = renderHook(() => useOperadoras());

      await waitFor(() => {
        expect(result.current.operadoras).toHaveLength(1);
      });

      const operadora = result.current.getOperadoraByANS('nonexistent');
      expect(operadora).toBeUndefined();
    });
  });

  describe('refresh', () => {
    it('calls service getAll and updates operadoras', async () => {
      const mockOperadoras = [createMockOperadora()];
      vi.mocked(operadoraService.getAll).mockResolvedValue(mockOperadoras);

      const { result } = renderHook(() => useOperadoras());

      await act(async () => {
        await result.current.refresh();
      });

      expect(operadoraService.getAll).toHaveBeenCalledWith(mockClinicId);
    });
  });
});
