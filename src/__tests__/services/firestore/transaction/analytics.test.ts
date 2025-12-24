/**
 * Transaction Service Analytics Tests
 *
 * Tests for getSummary, getMonthlyData.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

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

vi.mock('@/services/firebase', () => ({
  db: {},
}));

// Import after mocks
import { transactionService } from '@/services/firestore/transaction.service';
import {
  collection,
  getDocs,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { mockClinicId, mockUserId } from './setup';

// Helper to create Timestamp instances
const createTimestamp = (isoString: string) => {
  return Timestamp.fromDate(new Date(isoString));
};

describe('transactionService - Analytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
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
