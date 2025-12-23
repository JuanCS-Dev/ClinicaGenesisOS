/**
 * Guia Service Tests
 *
 * Tests for Firestore TISS guides CRUD operations.
 */

import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { guiaService } from '../../../services/firestore/guia.service';
import type { GuiaFirestore, StatusGuia } from '@/types';

/**
 * Helper to create a mock Timestamp for tests.
 */
function createMockTimestamp(date: Date = new Date()): InstanceType<typeof Timestamp> {
  return Timestamp.fromDate(date);
}

describe('guiaService', () => {
  const mockClinicId = 'clinic-123';
  const mockGuiaId = 'guia-456';
  const mockUserId = 'user-789';
  const mockPatientId = 'patient-001';

  const mockGuiaData: Omit<GuiaFirestore, 'id' | 'clinicId' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'numeroGuiaPrestador'> = {
    tipo: 'consulta',
    status: 'rascunho',
    registroANS: '123456',
    patientId: mockPatientId,
    dataExecucao: '2024-12-20',
    procedimentos: [
      {
        codigo: '10101012',
        descricao: 'Consulta em consultório',
        quantidade: 1,
        valorUnitario: 150,
        valorTotal: 150,
      },
    ],
    valorTotal: 150,
    dadosBeneficiario: {
      numeroCarteira: 'CART-123',
      validadeCarteira: '2025-12-31',
      nome: 'Maria Silva',
      cpf: '12345678900',
      dataNascimento: '1990-05-15',
    },
    dadosContratado: {
      cnpj: '12345678000190',
      nome: 'Clínica Genesis',
      cnes: '1234567',
    },
  };

  const mockFullGuia: GuiaFirestore = {
    id: mockGuiaId,
    clinicId: mockClinicId,
    numeroGuiaPrestador: 'GUIA-2024-001',
    ...mockGuiaData,
    createdAt: createMockTimestamp(),
    updatedAt: createMockTimestamp(),
    createdBy: mockUserId,
    updatedBy: mockUserId,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all guias sorted by date descending', async () => {
      const mockDocs = [
        {
          id: 'guia-1',
          data: () => ({
            ...mockGuiaData,
            numeroGuiaPrestador: 'GUIA-001',
            createdAt: createMockTimestamp(new Date('2024-12-20')),
            updatedAt: createMockTimestamp(),
          }),
        },
        {
          id: 'guia-2',
          data: () => ({
            ...mockGuiaData,
            numeroGuiaPrestador: 'GUIA-002',
            createdAt: createMockTimestamp(new Date('2024-12-19')),
            updatedAt: createMockTimestamp(),
          }),
        },
      ];

      (getDocs as Mock).mockResolvedValue({ docs: mockDocs });
      (collection as Mock).mockReturnValue({});
      (query as Mock).mockReturnValue({});

      const guias = await guiaService.getAll(mockClinicId);

      expect(collection).toHaveBeenCalled();
      expect(getDocs).toHaveBeenCalled();
      expect(guias).toHaveLength(2);
    });

    it('should return empty array when no guias exist', async () => {
      (getDocs as Mock).mockResolvedValue({ docs: [] });
      (collection as Mock).mockReturnValue({});
      (query as Mock).mockReturnValue({});

      const guias = await guiaService.getAll(mockClinicId);

      expect(guias).toHaveLength(0);
    });
  });

  describe('getByStatus', () => {
    it('should return guias filtered by status', async () => {
      const mockDocs = [
        {
          id: 'guia-1',
          data: () => ({
            ...mockGuiaData,
            status: 'autorizada',
            numeroGuiaPrestador: 'GUIA-001',
            createdAt: createMockTimestamp(),
            updatedAt: createMockTimestamp(),
          }),
        },
      ];

      (getDocs as Mock).mockResolvedValue({ docs: mockDocs });
      (collection as Mock).mockReturnValue({});
      (query as Mock).mockReturnValue({});

      const guias = await guiaService.getByStatus(mockClinicId, 'autorizada');

      expect(guias).toHaveLength(1);
      expect(guias[0].status).toBe('autorizada');
    });
  });

  describe('getByPatient', () => {
    it('should return guias for a specific patient', async () => {
      const mockDocs = [
        {
          id: 'guia-1',
          data: () => ({
            ...mockGuiaData,
            patientId: mockPatientId,
            numeroGuiaPrestador: 'GUIA-001',
            createdAt: createMockTimestamp(),
            updatedAt: createMockTimestamp(),
          }),
        },
      ];

      (getDocs as Mock).mockResolvedValue({ docs: mockDocs });
      (collection as Mock).mockReturnValue({});
      (query as Mock).mockReturnValue({});

      const guias = await guiaService.getByPatient(mockClinicId, mockPatientId);

      expect(guias).toHaveLength(1);
      expect(guias[0].patientId).toBe(mockPatientId);
    });
  });

  describe('getByOperadora', () => {
    it('should return guias for a specific operadora', async () => {
      const mockDocs = [
        {
          id: 'guia-1',
          data: () => ({
            ...mockGuiaData,
            registroANS: '123456',
            numeroGuiaPrestador: 'GUIA-001',
            createdAt: createMockTimestamp(),
            updatedAt: createMockTimestamp(),
          }),
        },
      ];

      (getDocs as Mock).mockResolvedValue({ docs: mockDocs });
      (collection as Mock).mockReturnValue({});
      (query as Mock).mockReturnValue({});

      const guias = await guiaService.getByOperadora(mockClinicId, '123456');

      expect(guias).toHaveLength(1);
      expect(guias[0].registroANS).toBe('123456');
    });
  });

  describe('getById', () => {
    it('should return guia by id when exists', async () => {
      const mockDocSnapshot = {
        exists: () => true,
        id: mockGuiaId,
        data: () => ({
          ...mockGuiaData,
          numeroGuiaPrestador: 'GUIA-001',
          createdAt: createMockTimestamp(),
          updatedAt: createMockTimestamp(),
        }),
      };

      (getDoc as Mock).mockResolvedValue(mockDocSnapshot);
      (doc as Mock).mockReturnValue({});

      const guia = await guiaService.getById(mockClinicId, mockGuiaId);

      expect(doc).toHaveBeenCalled();
      expect(getDoc).toHaveBeenCalled();
      expect(guia).toBeDefined();
      expect(guia?.id).toBe(mockGuiaId);
    });

    it('should return null when guia does not exist', async () => {
      const mockDocSnapshot = {
        exists: () => false,
      };

      (getDoc as Mock).mockResolvedValue(mockDocSnapshot);
      (doc as Mock).mockReturnValue({});

      const guia = await guiaService.getById(mockClinicId, 'nonexistent');

      expect(guia).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new guia and return id', async () => {
      const mockDocRef = { id: 'new-guia-id' };
      (addDoc as Mock).mockResolvedValue(mockDocRef);
      (collection as Mock).mockReturnValue({});
      // Empty docs means first guia - should start at 0001
      (getDocs as Mock).mockResolvedValue({ docs: [], empty: true });
      (query as Mock).mockReturnValue({});

      const newId = await guiaService.create(mockClinicId, mockUserId, mockGuiaData);

      expect(collection).toHaveBeenCalled();
      expect(addDoc).toHaveBeenCalled();
      expect(newId).toBe('new-guia-id');
    });

    it('should generate sequential guia number', async () => {
      const mockDocRef = { id: 'new-guia-id' };
      (addDoc as Mock).mockResolvedValue(mockDocRef);
      (collection as Mock).mockReturnValue({});
      // Mock existing guia with number ending in 0005
      (getDocs as Mock).mockResolvedValue({
        docs: [{
          data: () => ({ numeroGuiaPrestador: `${new Date().getFullYear()}120005` }),
        }],
        empty: false,
      });
      (query as Mock).mockReturnValue({});

      await guiaService.create(mockClinicId, mockUserId, mockGuiaData);

      expect(addDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          numeroGuiaPrestador: expect.stringMatching(/^\d{4}\d{2}0006$/),
        })
      );
    });
  });

  describe('updateStatus', () => {
    it('should update guia status', async () => {
      (updateDoc as Mock).mockResolvedValue(undefined);
      (doc as Mock).mockReturnValue({});

      await guiaService.updateStatus(mockClinicId, mockGuiaId, mockUserId, 'enviada');

      expect(doc).toHaveBeenCalled();
      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ status: 'enviada' })
      );
    });
  });

  describe('getStats', () => {
    it('should return aggregated statistics', async () => {
      const mockDocs = [
        {
          id: 'guia-1',
          data: () => ({
            ...mockGuiaData,
            status: 'rascunho',
            valorTotal: 100,
            valorGlosado: 0,
            valorPago: 0,
            createdAt: createMockTimestamp(),
            updatedAt: createMockTimestamp(),
          }),
        },
        {
          id: 'guia-2',
          data: () => ({
            ...mockGuiaData,
            status: 'autorizada',
            valorTotal: 200,
            valorGlosado: 0,
            valorPago: 200,
            createdAt: createMockTimestamp(),
            updatedAt: createMockTimestamp(),
          }),
        },
        {
          id: 'guia-3',
          data: () => ({
            ...mockGuiaData,
            status: 'glosada_parcial',
            valorTotal: 300,
            valorGlosado: 50,
            valorPago: 250,
            createdAt: createMockTimestamp(),
            updatedAt: createMockTimestamp(),
          }),
        },
      ];

      (getDocs as Mock).mockResolvedValue({ docs: mockDocs });
      (collection as Mock).mockReturnValue({});
      (query as Mock).mockReturnValue({});

      const stats = await guiaService.getStats(mockClinicId);

      expect(stats.total).toBe(3);
      expect(stats.pendentes).toBe(1);
      expect(stats.aprovadas).toBe(1);
      expect(stats.glosadas).toBe(1);
      expect(stats.valorTotal).toBe(600);
      expect(stats.valorGlosado).toBe(50);
      expect(stats.valorRecebido).toBe(450);
    });

    it('should return zero stats when no guias exist', async () => {
      (getDocs as Mock).mockResolvedValue({ docs: [] });
      (collection as Mock).mockReturnValue({});
      (query as Mock).mockReturnValue({});

      const stats = await guiaService.getStats(mockClinicId);

      expect(stats.total).toBe(0);
      expect(stats.pendentes).toBe(0);
      expect(stats.valorTotal).toBe(0);
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
              id: mockGuiaId,
              data: () => ({
                ...mockGuiaData,
                numeroGuiaPrestador: 'GUIA-001',
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

      const unsubscribe = guiaService.subscribe(mockClinicId, mockCallback);

      expect(onSnapshot).toHaveBeenCalled();
      expect(mockCallback).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ id: mockGuiaId }),
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

      guiaService.subscribe(mockClinicId, mockCallback, mockErrorHandler);

      expect(mockErrorHandler).toHaveBeenCalledWith(mockError);
    });
  });
});
