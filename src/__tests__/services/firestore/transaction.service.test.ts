/**
 * Transaction Service Tests
 *
 * Tests for financial transaction CRUD operations.
 * Fase 4: Financeiro & Relatórios
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { CreateTransactionInput } from '@/types';

// Mock Firebase
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  getDocs: vi.fn(),
  getDoc: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn(),
  orderBy: vi.fn(),
  where: vi.fn(),
  onSnapshot: vi.fn(),
  serverTimestamp: vi.fn(() => ({ _serverTimestamp: true })),
  // Provide a Timestamp class that works with instanceof
  Timestamp: class MockTimestamp {
    seconds: number;
    nanoseconds: number;
    constructor(seconds: number, nanoseconds: number) {
      this.seconds = seconds;
      this.nanoseconds = nanoseconds;
    }
    toDate() {
      return new Date(this.seconds * 1000);
    }
    static fromDate(date: Date) {
      return new MockTimestamp(Math.floor(date.getTime() / 1000), 0);
    }
  },
}));

vi.mock('../../../services/firebase', () => ({
  db: {},
}));

// Import after mocks
import { transactionService } from '../../../services/firestore/transaction.service';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';

describe('transactionService', () => {
  const mockClinicId = 'clinic-123';
  const mockTransactionId = 'txn-456';
  const mockUserId = 'user-789';


  // Helper to create Timestamp instances
  const createTimestamp = (isoString: string) => {
    return Timestamp.fromDate(new Date(isoString));
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getAll', () => {
    it('should return all transactions for a clinic', async () => {
      const mockDocs = [
        {
          id: mockTransactionId,
          data: () => ({
            description: 'Consulta Nutricional',
            amount: 35000,
            type: 'income',
            categoryId: 'consultation',
            paymentMethod: 'pix',
            status: 'paid',
            date: createTimestamp('2024-01-15T10:00:00.000Z'),
            createdAt: createTimestamp('2024-01-15T09:00:00.000Z'),
            createdBy: mockUserId,
          }),
        },
      ];

      vi.mocked(getDocs).mockResolvedValue({
        docs: mockDocs,
      } as never);

      vi.mocked(query).mockReturnValue({} as never);
      vi.mocked(collection).mockReturnValue({} as never);
      vi.mocked(orderBy).mockReturnValue({} as never);

      const result = await transactionService.getAll(mockClinicId);

      expect(result).toHaveLength(1);
      expect(result[0].description).toBe('Consulta Nutricional');
      expect(result[0].amount).toBe(35000);
    });

    it('should filter transactions by type', async () => {
      const mockDocs = [
        {
          id: 'txn-1',
          data: () => ({
            description: 'Consulta',
            amount: 35000,
            type: 'income',
            categoryId: 'consultation',
            paymentMethod: 'pix',
            status: 'paid',
            date: createTimestamp('2024-01-15T10:00:00.000Z'),
            createdAt: createTimestamp('2024-01-15T09:00:00.000Z'),
            createdBy: mockUserId,
          }),
        },
      ];

      vi.mocked(getDocs).mockResolvedValue({ docs: mockDocs } as never);
      vi.mocked(query).mockReturnValue({} as never);
      vi.mocked(collection).mockReturnValue({} as never);
      vi.mocked(orderBy).mockReturnValue({} as never);
      vi.mocked(where).mockReturnValue({} as never);

      const result = await transactionService.getAll(mockClinicId, {
        type: 'income',
      });

      expect(where).toHaveBeenCalledWith('type', '==', 'income');
      expect(result).toHaveLength(1);
    });

    it('should filter transactions by date range', async () => {
      const mockDocs = [
        {
          id: 'txn-1',
          data: () => ({
            description: 'Consulta Janeiro',
            amount: 35000,
            type: 'income',
            categoryId: 'consultation',
            paymentMethod: 'pix',
            status: 'paid',
            date: createTimestamp('2024-01-15T10:00:00.000Z'),
            createdAt: createTimestamp('2024-01-15T09:00:00.000Z'),
            createdBy: mockUserId,
          }),
        },
        {
          id: 'txn-2',
          data: () => ({
            description: 'Consulta Fevereiro',
            amount: 40000,
            type: 'income',
            categoryId: 'consultation',
            paymentMethod: 'pix',
            status: 'paid',
            date: createTimestamp('2024-02-15T10:00:00.000Z'),
            createdAt: createTimestamp('2024-02-15T09:00:00.000Z'),
            createdBy: mockUserId,
          }),
        },
      ];

      vi.mocked(getDocs).mockResolvedValue({ docs: mockDocs } as never);
      vi.mocked(query).mockReturnValue({} as never);
      vi.mocked(collection).mockReturnValue({} as never);
      vi.mocked(orderBy).mockReturnValue({} as never);

      const result = await transactionService.getAll(mockClinicId, {
        dateRange: {
          startDate: '2024-01-01T00:00:00.000Z',
          endDate: '2024-01-31T23:59:59.000Z',
        },
      });

      expect(result).toHaveLength(1);
      expect(result[0].description).toBe('Consulta Janeiro');
    });

    it('should filter transactions by search term', async () => {
      const mockDocs = [
        {
          id: 'txn-1',
          data: () => ({
            description: 'Consulta Maria Silva',
            amount: 35000,
            type: 'income',
            categoryId: 'consultation',
            paymentMethod: 'pix',
            status: 'paid',
            date: createTimestamp('2024-01-15T10:00:00.000Z'),
            createdAt: createTimestamp('2024-01-15T09:00:00.000Z'),
            createdBy: mockUserId,
            patientName: 'Maria Silva',
          }),
        },
        {
          id: 'txn-2',
          data: () => ({
            description: 'Consulta João Santos',
            amount: 40000,
            type: 'income',
            categoryId: 'consultation',
            paymentMethod: 'pix',
            status: 'paid',
            date: createTimestamp('2024-01-16T10:00:00.000Z'),
            createdAt: createTimestamp('2024-01-16T09:00:00.000Z'),
            createdBy: mockUserId,
            patientName: 'João Santos',
          }),
        },
      ];

      vi.mocked(getDocs).mockResolvedValue({ docs: mockDocs } as never);
      vi.mocked(query).mockReturnValue({} as never);
      vi.mocked(collection).mockReturnValue({} as never);
      vi.mocked(orderBy).mockReturnValue({} as never);

      const result = await transactionService.getAll(mockClinicId, {
        searchTerm: 'maria',
      });

      expect(result).toHaveLength(1);
      expect(result[0].patientName).toBe('Maria Silva');
    });
  });

  describe('getById', () => {
    it('should return a transaction by ID', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        id: mockTransactionId,
        data: () => ({
          description: 'Consulta Nutricional',
          amount: 35000,
          type: 'income',
          categoryId: 'consultation',
          paymentMethod: 'pix',
          status: 'paid',
          date: createTimestamp('2024-01-15T10:00:00.000Z'),
          createdAt: createTimestamp('2024-01-15T09:00:00.000Z'),
          createdBy: mockUserId,
        }),
      } as never);

      vi.mocked(doc).mockReturnValue({} as never);
      vi.mocked(collection).mockReturnValue({} as never);

      const result = await transactionService.getById(
        mockClinicId,
        mockTransactionId
      );

      expect(result).not.toBeNull();
      expect(result?.id).toBe(mockTransactionId);
      expect(result?.description).toBe('Consulta Nutricional');
    });

    it('should return null for non-existent transaction', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
      } as never);

      vi.mocked(doc).mockReturnValue({} as never);
      vi.mocked(collection).mockReturnValue({} as never);

      const result = await transactionService.getById(
        mockClinicId,
        'non-existent'
      );

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new transaction', async () => {
      const input: CreateTransactionInput = {
        description: 'Consulta Nutricional',
        amount: 35000,
        type: 'income',
        categoryId: 'consultation',
        paymentMethod: 'pix',
        status: 'paid',
        date: '2024-01-15T10:00:00.000Z',
      };

      vi.mocked(addDoc).mockResolvedValue({
        id: 'new-txn-123',
      } as never);

      vi.mocked(collection).mockReturnValue({} as never);

      const result = await transactionService.create(
        mockClinicId,
        input,
        mockUserId
      );

      expect(result).toBe('new-txn-123');
      expect(addDoc).toHaveBeenCalledTimes(1);
    });

    it('should use serverTimestamp for createdAt', async () => {
      const input: CreateTransactionInput = {
        description: 'Consulta',
        amount: 35000,
        type: 'income',
        categoryId: 'consultation',
        paymentMethod: 'pix',
        status: 'paid',
        date: '2024-01-15T10:00:00.000Z',
      };

      vi.mocked(addDoc).mockResolvedValue({ id: 'new-txn' } as never);
      vi.mocked(collection).mockReturnValue({} as never);

      await transactionService.create(mockClinicId, input, mockUserId);

      expect(serverTimestamp).toHaveBeenCalled();
      expect(addDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          createdBy: mockUserId,
        })
      );
    });
  });

  describe('update', () => {
    it('should update a transaction', async () => {
      vi.mocked(updateDoc).mockResolvedValue(undefined);
      vi.mocked(doc).mockReturnValue({} as never);
      vi.mocked(collection).mockReturnValue({} as never);

      await transactionService.update(mockClinicId, mockTransactionId, {
        description: 'Updated Description',
        amount: 40000,
      });

      expect(updateDoc).toHaveBeenCalledTimes(1);
      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          description: 'Updated Description',
          amount: 40000,
          updatedAt: expect.anything(),
        })
      );
    });

    it('should use serverTimestamp for updatedAt', async () => {
      vi.mocked(updateDoc).mockResolvedValue(undefined);
      vi.mocked(doc).mockReturnValue({} as never);
      vi.mocked(collection).mockReturnValue({} as never);

      await transactionService.update(mockClinicId, mockTransactionId, {
        status: 'paid',
      });

      expect(serverTimestamp).toHaveBeenCalled();
      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          status: 'paid',
        })
      );
    });
  });

  describe('delete', () => {
    it('should delete a transaction', async () => {
      vi.mocked(deleteDoc).mockResolvedValue(undefined);
      vi.mocked(doc).mockReturnValue({} as never);
      vi.mocked(collection).mockReturnValue({} as never);

      await transactionService.delete(mockClinicId, mockTransactionId);

      expect(deleteDoc).toHaveBeenCalledTimes(1);
    });
  });

  describe('subscribe', () => {
    it('should subscribe to real-time updates', async () => {
      const mockDocs = [
        {
          id: 'txn-1',
          data: () => ({
            description: 'Consulta',
            amount: 35000,
            type: 'income',
            categoryId: 'consultation',
            paymentMethod: 'pix',
            status: 'paid',
            date: createTimestamp('2024-01-15T10:00:00.000Z'),
            createdAt: createTimestamp('2024-01-15T09:00:00.000Z'),
            createdBy: mockUserId,
          }),
        },
      ];

      const mockSnapshot = { docs: mockDocs };
      const mockUnsubscribe = vi.fn();

      vi.mocked(onSnapshot).mockImplementation(
        ((_query: unknown, callback: unknown) => {
          (callback as (snapshot: typeof mockSnapshot) => void)(mockSnapshot);
          return mockUnsubscribe;
        }) as never
      );

      vi.mocked(query).mockReturnValue({} as never);
      vi.mocked(collection).mockReturnValue({} as never);
      vi.mocked(orderBy).mockReturnValue({} as never);

      const onData = vi.fn();
      const unsubscribe = transactionService.subscribe(mockClinicId, onData);

      expect(onSnapshot).toHaveBeenCalled();
      expect(onData).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ description: 'Consulta' }),
        ])
      );

      unsubscribe();
      expect(mockUnsubscribe).toHaveBeenCalled();
    });
  });

  describe('getSummary', () => {
    it('should calculate financial summary', async () => {
      const mockDocs = [
        {
          id: 'txn-1',
          data: () => ({
            description: 'Consulta',
            amount: 35000,
            type: 'income',
            categoryId: 'consultation',
            paymentMethod: 'pix',
            status: 'paid',
            date: createTimestamp('2024-01-15T10:00:00.000Z'),
            createdAt: createTimestamp('2024-01-15T09:00:00.000Z'),
            createdBy: mockUserId,
          }),
        },
        {
          id: 'txn-2',
          data: () => ({
            description: 'Aluguel',
            amount: 50000,
            type: 'expense',
            categoryId: 'rent',
            paymentMethod: 'bank_transfer',
            status: 'paid',
            date: createTimestamp('2024-01-10T10:00:00.000Z'),
            createdAt: createTimestamp('2024-01-10T09:00:00.000Z'),
            createdBy: mockUserId,
          }),
        },
      ];

      vi.mocked(getDocs).mockResolvedValue({ docs: mockDocs } as never);
      vi.mocked(query).mockReturnValue({} as never);
      vi.mocked(collection).mockReturnValue({} as never);
      vi.mocked(orderBy).mockReturnValue({} as never);

      const result = await transactionService.getSummary(
        mockClinicId,
        '2024-01-01T00:00:00.000Z',
        '2024-01-31T23:59:59.000Z'
      );

      expect(result.totalIncome).toBe(35000);
      expect(result.totalExpenses).toBe(50000);
      expect(result.netBalance).toBe(-15000);
      expect(result.transactionCount).toBe(2);
    });

    it('should exclude cancelled transactions', async () => {
      const mockDocs = [
        {
          id: 'txn-1',
          data: () => ({
            description: 'Consulta Válida',
            amount: 35000,
            type: 'income',
            categoryId: 'consultation',
            paymentMethod: 'pix',
            status: 'paid',
            date: createTimestamp('2024-01-15T10:00:00.000Z'),
            createdAt: createTimestamp('2024-01-15T09:00:00.000Z'),
            createdBy: mockUserId,
          }),
        },
        {
          id: 'txn-2',
          data: () => ({
            description: 'Consulta Cancelada',
            amount: 40000,
            type: 'income',
            categoryId: 'consultation',
            paymentMethod: 'pix',
            status: 'cancelled',
            date: createTimestamp('2024-01-16T10:00:00.000Z'),
            createdAt: createTimestamp('2024-01-16T09:00:00.000Z'),
            createdBy: mockUserId,
          }),
        },
      ];

      vi.mocked(getDocs).mockResolvedValue({ docs: mockDocs } as never);
      vi.mocked(query).mockReturnValue({} as never);
      vi.mocked(collection).mockReturnValue({} as never);
      vi.mocked(orderBy).mockReturnValue({} as never);

      const result = await transactionService.getSummary(
        mockClinicId,
        '2024-01-01T00:00:00.000Z',
        '2024-01-31T23:59:59.000Z'
      );

      // transactionCount includes all transactions fetched, not just non-cancelled
      expect(result.totalIncome).toBe(35000);
      // But netBalance should only count non-cancelled
      expect(result.netBalance).toBe(35000);
    });
  });

  describe('getMonthlyData', () => {
    it('should return monthly aggregated data', async () => {
      const mockDocs = [
        {
          id: 'txn-1',
          data: () => ({
            description: 'Consulta Janeiro 1',
            amount: 35000,
            type: 'income',
            categoryId: 'consultation',
            paymentMethod: 'pix',
            status: 'paid',
            date: createTimestamp('2024-01-15T10:00:00.000Z'),
            createdAt: createTimestamp('2024-01-15T09:00:00.000Z'),
            createdBy: mockUserId,
          }),
        },
        {
          id: 'txn-2',
          data: () => ({
            description: 'Consulta Janeiro 2',
            amount: 40000,
            type: 'income',
            categoryId: 'consultation',
            paymentMethod: 'pix',
            status: 'paid',
            date: createTimestamp('2024-01-20T10:00:00.000Z'),
            createdAt: createTimestamp('2024-01-20T09:00:00.000Z'),
            createdBy: mockUserId,
          }),
        },
        {
          id: 'txn-3',
          data: () => ({
            description: 'Despesa Janeiro',
            amount: 20000,
            type: 'expense',
            categoryId: 'supplies',
            paymentMethod: 'pix',
            status: 'paid',
            date: createTimestamp('2024-01-25T10:00:00.000Z'),
            createdAt: createTimestamp('2024-01-25T09:00:00.000Z'),
            createdBy: mockUserId,
          }),
        },
      ];

      vi.mocked(getDocs).mockResolvedValue({ docs: mockDocs } as never);
      vi.mocked(query).mockReturnValue({} as never);
      vi.mocked(collection).mockReturnValue({} as never);
      vi.mocked(orderBy).mockReturnValue({} as never);

      const result = await transactionService.getMonthlyData(mockClinicId, 6);

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);

      const janData = result.find((m) => m.month.includes('jan'));
      if (janData) {
        expect(janData.income).toBe(75000);
        expect(janData.expenses).toBe(20000);
      }
    });
  });
});
