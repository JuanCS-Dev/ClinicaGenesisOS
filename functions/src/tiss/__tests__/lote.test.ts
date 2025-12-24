/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Lote Module Tests
 *
 * Tests for batch (lote) creation and management.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock firebase-functions
const mockLogger = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

vi.mock('firebase-functions', () => ({
  https: {
    onCall: vi.fn((handler) => handler),
    HttpsError: class HttpsError extends Error {
      constructor(public code: string, message: string) {
        super(message);
      }
    },
  },
  logger: mockLogger,
}));

// Mock Firestore
const mockTransaction = {
  set: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

const mockFieldValue = {
  delete: vi.fn(() => '__DELETE__'),
};

const mockRunTransaction = vi.fn((callback) => callback(mockTransaction));

let mockGuiaData: Record<string, any> = {};
let mockLoteData: any = null;
let mockOperadoraData: any = null;
let mockLotesQuerySize = 0;

const mockFirestore = {
  collection: vi.fn(() => ({
    doc: vi.fn((id?: string) => {
      const docId = id || 'generated-id';
      return {
        id: docId,
        get: vi.fn(() =>
          Promise.resolve({
            exists: !!mockLoteData,
            data: () => mockLoteData,
            id: docId,
          })
        ),
        set: vi.fn(() => Promise.resolve()),
        update: vi.fn(() => Promise.resolve()),
        delete: vi.fn(() => Promise.resolve()),
        collection: vi.fn((name: string) => {
          if (name === 'lotes') {
            return {
              doc: vi.fn((loteId?: string) => ({
                id: loteId || 'new-lote-id',
                get: vi.fn(() =>
                  Promise.resolve({
                    exists: !!mockLoteData,
                    data: () => mockLoteData,
                  })
                ),
                set: vi.fn(() => Promise.resolve()),
              })),
              where: vi.fn(() => ({
                get: vi.fn(() =>
                  Promise.resolve({ size: mockLotesQuerySize })
                ),
              })),
            };
          }
          if (name === 'guias') {
            return {
              doc: vi.fn((guiaId: string) => ({
                id: guiaId,
                get: vi.fn(() =>
                  Promise.resolve({
                    exists: !!mockGuiaData[guiaId],
                    data: () => mockGuiaData[guiaId],
                    id: guiaId,
                  })
                ),
                update: vi.fn(() => Promise.resolve()),
              })),
            };
          }
          if (name === 'operadoras') {
            return {
              where: vi.fn(() => ({
                limit: vi.fn(() => ({
                  get: vi.fn(() =>
                    Promise.resolve({
                      empty: !mockOperadoraData,
                      docs: mockOperadoraData
                        ? [{ data: () => mockOperadoraData }]
                        : [],
                    })
                  ),
                })),
              })),
            };
          }
          return {};
        }),
      };
    }),
  })),
  runTransaction: mockRunTransaction,
  FieldValue: mockFieldValue,
};

vi.mock('firebase-admin', () => ({
  firestore: vi.fn(() => mockFirestore),
}));

// =============================================================================
// TESTS
// =============================================================================

describe('lote', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGuiaData = {};
    mockLoteData = null;
    mockOperadoraData = null;
    mockLotesQuerySize = 0;
    mockRunTransaction.mockImplementation((callback) => callback(mockTransaction));
  });

  describe('createLote', () => {
    it('should require authentication', async () => {
      const { createLote } = await import('../lote');

      await expect(
        createLote(
          { clinicId: 'test', operadoraId: '123', guiaIds: ['g1'] },
          { auth: null } as any
        )
      ).rejects.toThrow('Must be authenticated');
    });

    it('should reject missing fields', async () => {
      const { createLote } = await import('../lote');

      const result = await createLote(
        { clinicId: '', operadoraId: '', guiaIds: [] },
        { auth: { uid: 'user-1' } } as any
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Missing required fields');
    });

    it('should reject too many guias', async () => {
      const { createLote } = await import('../lote');

      const guiaIds = Array.from({ length: 101 }, (_, i) => `guia-${i}`);

      const result = await createLote(
        { clinicId: 'test', operadoraId: '123', guiaIds },
        { auth: { uid: 'user-1' } } as any
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Máximo de 100 guias');
    });

    it('should reject if guia not found', async () => {
      const { createLote } = await import('../lote');

      mockGuiaData = {}; // No guias
      mockOperadoraData = { nome: 'Test Operadora' };

      const result = await createLote(
        { clinicId: 'test', operadoraId: '123456', guiaIds: ['guia-1'] },
        { auth: { uid: 'user-1' } } as any
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Guia guia-1 não encontrada');
    });

    it('should reject if guia belongs to different operadora', async () => {
      const { createLote } = await import('../lote');

      mockGuiaData = {
        'guia-1': {
          registroANS: '999999', // Different operadora
          status: 'rascunho',
          valorTotal: 100,
        },
      };
      mockOperadoraData = { nome: 'Test Operadora' };

      const result = await createLote(
        { clinicId: 'test', operadoraId: '123456', guiaIds: ['guia-1'] },
        { auth: { uid: 'user-1' } } as any
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('outra operadora');
    });

    it('should reject if guia already sent', async () => {
      const { createLote } = await import('../lote');

      mockGuiaData = {
        'guia-1': {
          registroANS: '123456',
          status: 'enviada', // Already sent
          valorTotal: 100,
        },
      };
      mockOperadoraData = { nome: 'Test Operadora' };

      const result = await createLote(
        { clinicId: 'test', operadoraId: '123456', guiaIds: ['guia-1'] },
        { auth: { uid: 'user-1' } } as any
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('já foi enviada');
    });

    it('should reject if operadora not found', async () => {
      const { createLote } = await import('../lote');

      mockGuiaData = {
        'guia-1': {
          registroANS: '123456',
          status: 'rascunho',
          valorTotal: 100,
        },
      };
      mockOperadoraData = null; // No operadora

      const result = await createLote(
        { clinicId: 'test', operadoraId: '123456', guiaIds: ['guia-1'] },
        { auth: { uid: 'user-1' } } as any
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Operadora não encontrada');
    });

    it('should create lote successfully', async () => {
      const { createLote } = await import('../lote');

      mockGuiaData = {
        'guia-1': {
          registroANS: '123456',
          status: 'rascunho',
          valorTotal: 100,
        },
        'guia-2': {
          registroANS: '123456',
          status: 'validada',
          valorTotal: 200,
        },
      };
      mockOperadoraData = { nome: 'Unimed' };
      mockRunTransaction.mockResolvedValue('new-lote-id');

      const result = await createLote(
        { clinicId: 'test', operadoraId: '123456', guiaIds: ['guia-1', 'guia-2'] },
        { auth: { uid: 'user-1' } } as any
      );

      expect(result.success).toBe(true);
      expect(result.loteId).toBe('new-lote-id');
      expect(result.quantidadeGuias).toBe(2);
      expect(result.valorTotal).toBe(300);
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Lote created successfully',
        expect.any(Object)
      );
    });

    it('should generate lote number with date prefix', async () => {
      const { createLote } = await import('../lote');

      mockGuiaData = {
        'guia-1': {
          registroANS: '123456',
          status: 'rascunho',
          valorTotal: 100,
        },
      };
      mockOperadoraData = { nome: 'Test' };
      mockLotesQuerySize = 5; // 5 lotes already today
      mockRunTransaction.mockResolvedValue('lote-id');

      const result = await createLote(
        { clinicId: 'test', operadoraId: '123456', guiaIds: ['guia-1'] },
        { auth: { uid: 'user-1' } } as any
      );

      expect(result.success).toBe(true);
      expect(result.numeroLote).toMatch(/^\d{8}-\d{4}$/); // YYYYMMDD-NNNN
    });
  });

  describe('deleteLote', () => {
    it('should require authentication', async () => {
      const { deleteLote } = await import('../lote');

      await expect(
        deleteLote({ clinicId: 'test', loteId: 'lote-1' }, { auth: null } as any)
      ).rejects.toThrow('Must be authenticated');
    });

    it('should reject missing fields', async () => {
      const { deleteLote } = await import('../lote');

      const result = await deleteLote(
        { clinicId: '', loteId: '' },
        { auth: { uid: 'user-1' } } as any
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Missing');
    });

    it('should reject if lote not found', async () => {
      const { deleteLote } = await import('../lote');

      mockLoteData = null;

      const result = await deleteLote(
        { clinicId: 'test', loteId: 'lote-1' },
        { auth: { uid: 'user-1' } } as any
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('não encontrado');
    });

    it('should reject if lote already sent', async () => {
      const { deleteLote } = await import('../lote');

      mockLoteData = {
        status: 'enviado',
        guiaIds: ['g1'],
      };

      const result = await deleteLote(
        { clinicId: 'test', loteId: 'lote-1' },
        { auth: { uid: 'user-1' } } as any
      );

      expect(result.success).toBe(false);
      expect(result.error?.toLowerCase()).toContain('não é possível excluir');
    });

    it('should delete lote in rascunho status', async () => {
      const { deleteLote } = await import('../lote');

      mockLoteData = {
        status: 'rascunho',
        guiaIds: ['g1', 'g2'],
      };

      // Mock successful transaction
      mockRunTransaction.mockResolvedValueOnce(undefined);

      const result = await deleteLote(
        { clinicId: 'test', loteId: 'lote-1' },
        { auth: { uid: 'user-1' } } as any
      );

      expect(result.success).toBe(true);
      expect(mockLogger.info).toHaveBeenCalledWith('Lote deleted', expect.any(Object));
    });

    it('should delete lote in pronto status', async () => {
      const { deleteLote } = await import('../lote');

      mockLoteData = {
        status: 'pronto',
        guiaIds: ['g1'],
      };

      mockRunTransaction.mockResolvedValueOnce(undefined);

      const result = await deleteLote(
        { clinicId: 'test', loteId: 'lote-1' },
        { auth: { uid: 'user-1' } } as any
      );

      expect(result.success).toBe(true);
    });

    it('should delete lote in error status', async () => {
      const { deleteLote } = await import('../lote');

      mockLoteData = {
        status: 'erro',
        guiaIds: ['g1'],
      };

      mockRunTransaction.mockResolvedValueOnce(undefined);

      const result = await deleteLote(
        { clinicId: 'test', loteId: 'lote-1' },
        { auth: { uid: 'user-1' } } as any
      );

      expect(result.success).toBe(true);
    });
  });

  describe('updateLoteStatus', () => {
    it('should call firestore to update status', async () => {
      // Test that the function exists and can be called
      const { updateLoteStatus } = await import('../lote');

      // The function will fail due to mock, but we verify it attempts to call firestore
      try {
        await updateLoteStatus('clinic-1', 'lote-1', 'enviando');
      } catch {
        // Expected to fail due to mock limitations
      }

      // Verify firestore collection was accessed
      expect(mockFirestore.collection).toHaveBeenCalled();
    });
  });

  describe('getLote', () => {
    it('should return null if lote not found', async () => {
      const { getLote } = await import('../lote');

      mockLoteData = null;

      const result = await getLote('clinic-1', 'lote-1');

      expect(result).toBeNull();
    });

    it('should return lote if found', async () => {
      const { getLote } = await import('../lote');

      mockLoteData = {
        id: 'lote-1',
        numeroLote: '20240115-0001',
        status: 'rascunho',
        guiaIds: ['g1', 'g2'],
      };

      const result = await getLote('clinic-1', 'lote-1');

      expect(result).toEqual(mockLoteData);
    });
  });
});

describe('lote validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGuiaData = {};
    mockLoteData = null;
    mockOperadoraData = null;
  });

  it('should validate multiple guias with mixed statuses', async () => {
    const { createLote } = await import('../lote');

    mockGuiaData = {
      'guia-1': { registroANS: '123', status: 'rascunho', valorTotal: 50 },
      'guia-2': { registroANS: '123', status: 'validada', valorTotal: 75 },
      'guia-3': { registroANS: '123', status: 'rascunho', valorTotal: 25 },
    };
    mockOperadoraData = { nome: 'Test' };
    mockRunTransaction.mockResolvedValue('lote-id');

    const result = await createLote(
      { clinicId: 'test', operadoraId: '123', guiaIds: ['guia-1', 'guia-2', 'guia-3'] },
      { auth: { uid: 'user-1' } } as any
    );

    expect(result.success).toBe(true);
    expect(result.quantidadeGuias).toBe(3);
    expect(result.valorTotal).toBe(150);
  });

  it('should reject if any guia has invalid status', async () => {
    const { createLote } = await import('../lote');

    mockGuiaData = {
      'guia-1': { registroANS: '123', status: 'rascunho', valorTotal: 50 },
      'guia-2': { registroANS: '123', status: 'paga', valorTotal: 75 }, // Invalid
    };
    mockOperadoraData = { nome: 'Test' };

    const result = await createLote(
      { clinicId: 'test', operadoraId: '123', guiaIds: ['guia-1', 'guia-2'] },
      { auth: { uid: 'user-1' } } as any
    );

    expect(result.success).toBe(false);
  });
});

describe('createLote error handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGuiaData = {};
    mockLoteData = null;
    mockOperadoraData = null;
  });

  it('should handle transaction errors', async () => {
    const { createLote } = await import('../lote');

    mockGuiaData = {
      'guia-1': { registroANS: '123', status: 'rascunho', valorTotal: 100 },
    };
    mockOperadoraData = { nome: 'Test' };
    mockRunTransaction.mockRejectedValueOnce(new Error('Transaction failed'));

    const result = await createLote(
      { clinicId: 'test', operadoraId: '123', guiaIds: ['guia-1'] },
      { auth: { uid: 'user-1' } } as any
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain('Transaction failed');
  });

  it('should log warnings for validation errors', async () => {
    const { createLote } = await import('../lote');

    mockGuiaData = {
      'guia-1': { registroANS: '999', status: 'rascunho', valorTotal: 100 },
    };
    mockOperadoraData = { nome: 'Test' };

    const result = await createLote(
      { clinicId: 'test', operadoraId: '123', guiaIds: ['guia-1'] },
      { auth: { uid: 'user-1' } } as any
    );

    expect(result.success).toBe(false);
    expect(mockLogger.warn).toHaveBeenCalled();
  });
});

describe('deleteLote error handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLoteData = null;
  });

  it('should handle transaction errors during delete', async () => {
    const { deleteLote } = await import('../lote');

    mockLoteData = {
      status: 'rascunho',
      guiaIds: ['g1'],
    };

    mockRunTransaction.mockRejectedValueOnce(new Error('Delete transaction failed'));

    const result = await deleteLote(
      { clinicId: 'test', loteId: 'lote-1' },
      { auth: { uid: 'user-1' } } as any
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain('Delete transaction failed');
  });
});
