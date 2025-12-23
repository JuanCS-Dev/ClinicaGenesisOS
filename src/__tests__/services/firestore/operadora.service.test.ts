/**
 * Operadora Service Tests
 *
 * Tests for Firestore health insurance operator CRUD operations.
 */

import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { operadoraService } from '../../../services/firestore/operadora.service';
import type { OperadoraFirestore } from '@/types';

/**
 * Helper to create a mock Timestamp for tests.
 */
function createMockTimestamp(date: Date = new Date()): InstanceType<typeof Timestamp> {
  return Timestamp.fromDate(date);
}

describe('operadoraService', () => {
  const mockClinicId = 'clinic-123';
  const mockOperadoraId = 'operadora-456';
  const mockUserId = 'user-789';

  const mockOperadoraData: Omit<OperadoraFirestore, 'id' | 'clinicId' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'> = {
    registroANS: '123456',
    nomeFantasia: 'UNIMED',
    razaoSocial: 'UNIMED Central RS',
    cnpj: '12345678000190',
    codigoPrestador: 'PREST-001',
    tabelaPrecos: '22',
    ativa: true,
    configuracoes: {
      prazoEnvioDias: 30,
      exigeAutorizacao: true,
      permiteLote: true,
      aceitaRecursoOnline: false,
      diasPrazoRecurso: 30,
    },
    webservice: {
      tipoIntegracao: 'portal',
    },
  };

  const mockFullOperadora: OperadoraFirestore = {
    id: mockOperadoraId,
    clinicId: mockClinicId,
    ...mockOperadoraData,
    createdAt: createMockTimestamp(),
    updatedAt: createMockTimestamp(),
    createdBy: mockUserId,
    updatedBy: mockUserId,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all operadoras sorted by name', async () => {
      const mockDocs = [
        {
          id: 'op-1',
          data: () => ({
            ...mockOperadoraData,
            nomeFantasia: 'Amil',
            createdAt: createMockTimestamp(),
            updatedAt: createMockTimestamp(),
          }),
        },
        {
          id: 'op-2',
          data: () => ({
            ...mockOperadoraData,
            nomeFantasia: 'Bradesco Saúde',
            createdAt: createMockTimestamp(),
            updatedAt: createMockTimestamp(),
          }),
        },
      ];

      (getDocs as Mock).mockResolvedValue({ docs: mockDocs });
      (collection as Mock).mockReturnValue({});
      (query as Mock).mockReturnValue({});

      const operadoras = await operadoraService.getAll(mockClinicId);

      expect(collection).toHaveBeenCalled();
      expect(getDocs).toHaveBeenCalled();
      expect(operadoras).toHaveLength(2);
      expect(operadoras[0].nomeFantasia).toBe('Amil');
      expect(operadoras[1].nomeFantasia).toBe('Bradesco Saúde');
    });

    it('should return empty array when no operadoras exist', async () => {
      (getDocs as Mock).mockResolvedValue({ docs: [] });
      (collection as Mock).mockReturnValue({});
      (query as Mock).mockReturnValue({});

      const operadoras = await operadoraService.getAll(mockClinicId);

      expect(operadoras).toHaveLength(0);
    });
  });

  describe('getAtivas', () => {
    it('should return only active operadoras', async () => {
      const mockDocs = [
        {
          id: 'op-1',
          data: () => ({
            ...mockOperadoraData,
            ativa: true,
            createdAt: createMockTimestamp(),
            updatedAt: createMockTimestamp(),
          }),
        },
      ];

      (getDocs as Mock).mockResolvedValue({ docs: mockDocs });
      (collection as Mock).mockReturnValue({});
      (query as Mock).mockReturnValue({});

      const operadoras = await operadoraService.getAtivas(mockClinicId);

      expect(operadoras).toHaveLength(1);
      expect(operadoras[0].ativa).toBe(true);
    });
  });

  describe('getById', () => {
    it('should return operadora by id when exists', async () => {
      const mockDocSnapshot = {
        exists: () => true,
        id: mockOperadoraId,
        data: () => ({
          ...mockOperadoraData,
          createdAt: createMockTimestamp(),
          updatedAt: createMockTimestamp(),
        }),
      };

      (getDoc as Mock).mockResolvedValue(mockDocSnapshot);
      (doc as Mock).mockReturnValue({});

      const operadora = await operadoraService.getById(mockClinicId, mockOperadoraId);

      expect(doc).toHaveBeenCalled();
      expect(getDoc).toHaveBeenCalled();
      expect(operadora).toBeDefined();
      expect(operadora?.id).toBe(mockOperadoraId);
      expect(operadora?.registroANS).toBe('123456');
    });

    it('should return null when operadora does not exist', async () => {
      const mockDocSnapshot = {
        exists: () => false,
      };

      (getDoc as Mock).mockResolvedValue(mockDocSnapshot);
      (doc as Mock).mockReturnValue({});

      const operadora = await operadoraService.getById(mockClinicId, 'nonexistent');

      expect(operadora).toBeNull();
    });
  });

  describe('getByRegistroANS', () => {
    it('should return operadora by ANS registration', async () => {
      const mockDocs = [
        {
          id: mockOperadoraId,
          data: () => ({
            ...mockOperadoraData,
            createdAt: createMockTimestamp(),
            updatedAt: createMockTimestamp(),
          }),
        },
      ];

      (getDocs as Mock).mockResolvedValue({ docs: mockDocs, empty: false });
      (collection as Mock).mockReturnValue({});
      (query as Mock).mockReturnValue({});

      const operadora = await operadoraService.getByRegistroANS(mockClinicId, '123456');

      expect(operadora).toBeDefined();
      expect(operadora?.registroANS).toBe('123456');
    });

    it('should return null when operadora with ANS not found', async () => {
      (getDocs as Mock).mockResolvedValue({ docs: [], empty: true });
      (collection as Mock).mockReturnValue({});
      (query as Mock).mockReturnValue({});

      const operadora = await operadoraService.getByRegistroANS(mockClinicId, 'nonexistent');

      expect(operadora).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new operadora and return id', async () => {
      const mockDocRef = { id: 'new-operadora-id' };
      (addDoc as Mock).mockResolvedValue(mockDocRef);
      (collection as Mock).mockReturnValue({});

      const newId = await operadoraService.create(mockClinicId, mockUserId, mockOperadoraData);

      expect(collection).toHaveBeenCalled();
      expect(addDoc).toHaveBeenCalled();
      expect(newId).toBe('new-operadora-id');
    });
  });

  describe('update', () => {
    it('should update an existing operadora', async () => {
      (updateDoc as Mock).mockResolvedValue(undefined);
      (doc as Mock).mockReturnValue({});

      await operadoraService.update(mockClinicId, mockOperadoraId, mockUserId, {
        nomeFantasia: 'UNIMED Updated',
      });

      expect(doc).toHaveBeenCalled();
      expect(updateDoc).toHaveBeenCalled();
    });
  });

  describe('toggleAtiva', () => {
    it('should toggle operadora active status', async () => {
      (updateDoc as Mock).mockResolvedValue(undefined);
      (doc as Mock).mockReturnValue({});

      await operadoraService.toggleAtiva(mockClinicId, mockOperadoraId, mockUserId, false);

      expect(doc).toHaveBeenCalled();
      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ ativa: false })
      );
    });
  });

  describe('delete', () => {
    it('should delete an operadora', async () => {
      (deleteDoc as Mock).mockResolvedValue(undefined);
      (doc as Mock).mockReturnValue({});

      await operadoraService.delete(mockClinicId, mockOperadoraId);

      expect(doc).toHaveBeenCalled();
      expect(deleteDoc).toHaveBeenCalled();
    });
  });

  describe('subscribe', () => {
    it('should set up real-time listener', () => {
      const mockUnsubscribe = vi.fn();
      const mockCallback = vi.fn();

      (onSnapshot as Mock).mockImplementation((_, callback) => {
        callback({
          docs: [
            {
              id: mockOperadoraId,
              data: () => ({
                ...mockOperadoraData,
                createdAt: createMockTimestamp(),
                updatedAt: createMockTimestamp(),
              }),
            },
          ],
        });
        return mockUnsubscribe;
      });
      (collection as Mock).mockReturnValue({});
      (query as Mock).mockReturnValue({});

      const unsubscribe = operadoraService.subscribe(mockClinicId, mockCallback);

      expect(onSnapshot).toHaveBeenCalled();
      expect(mockCallback).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ id: mockOperadoraId }),
        ])
      );
      expect(typeof unsubscribe).toBe('function');
    });

    it('should call error handler on snapshot error', () => {
      const mockUnsubscribe = vi.fn();
      const mockCallback = vi.fn();
      const mockErrorHandler = vi.fn();
      const mockError = new Error('Snapshot failed');

      (onSnapshot as Mock).mockImplementation((_, __, errorHandler) => {
        errorHandler(mockError);
        return mockUnsubscribe;
      });
      (collection as Mock).mockReturnValue({});
      (query as Mock).mockReturnValue({});

      operadoraService.subscribe(mockClinicId, mockCallback, mockErrorHandler);

      expect(mockErrorHandler).toHaveBeenCalledWith(mockError);
    });
  });

  describe('subscribeAtivas', () => {
    it('should subscribe to only active operadoras', () => {
      const mockUnsubscribe = vi.fn();
      const mockCallback = vi.fn();

      (onSnapshot as Mock).mockImplementation((_, callback) => {
        callback({
          docs: [
            {
              id: mockOperadoraId,
              data: () => ({
                ...mockOperadoraData,
                ativa: true,
                createdAt: createMockTimestamp(),
                updatedAt: createMockTimestamp(),
              }),
            },
          ],
        });
        return mockUnsubscribe;
      });
      (collection as Mock).mockReturnValue({});
      (query as Mock).mockReturnValue({});

      const unsubscribe = operadoraService.subscribeAtivas(mockClinicId, mockCallback);

      expect(onSnapshot).toHaveBeenCalled();
      expect(mockCallback).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ ativa: true }),
        ])
      );
      expect(typeof unsubscribe).toBe('function');
    });

    it('should call error handler on snapshot error for active subscription', () => {
      const mockUnsubscribe = vi.fn();
      const mockCallback = vi.fn();
      const mockErrorHandler = vi.fn();
      const mockError = new Error('Active subscription failed');

      (onSnapshot as Mock).mockImplementation((_, __, errorHandler) => {
        errorHandler(mockError);
        return mockUnsubscribe;
      });
      (collection as Mock).mockReturnValue({});
      (query as Mock).mockReturnValue({});

      operadoraService.subscribeAtivas(mockClinicId, mockCallback, mockErrorHandler);

      expect(mockErrorHandler).toHaveBeenCalledWith(mockError);
    });
  });
});
