/**
 * Transaction Service
 *
 * Handles CRUD operations for financial transactions in Firestore.
 * Transactions are stored as subcollections under clinics for multi-tenancy.
 *
 * Collection: /clinics/{clinicId}/transactions/{transactionId}
 */

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
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../firebase';
import type {
  Transaction,
  CreateTransactionInput,
  TransactionFilters,
  FinancialSummary,
  MonthlyFinancialData,
} from '@/types';

/**
 * Get the transactions collection reference for a clinic.
 */
function getTransactionsCollection(clinicId: string) {
  return collection(db, 'clinics', clinicId, 'transactions');
}

/**
 * Converts Firestore document data to Transaction type.
 */
function toTransaction(id: string, data: Record<string, unknown>): Transaction {
  return {
    id,
    description: data.description as string,
    amount: data.amount as number,
    type: data.type as Transaction['type'],
    categoryId: data.categoryId as string,
    paymentMethod: data.paymentMethod as Transaction['paymentMethod'],
    status: data.status as Transaction['status'],
    date:
      data.date instanceof Timestamp
        ? data.date.toDate().toISOString()
        : (data.date as string),
    dueDate: data.dueDate as string | undefined,
    paidAt: data.paidAt as string | undefined,
    patientId: data.patientId as string | undefined,
    patientName: data.patientName as string | undefined,
    appointmentId: data.appointmentId as string | undefined,
    notes: data.notes as string | undefined,
    createdAt:
      data.createdAt instanceof Timestamp
        ? data.createdAt.toDate().toISOString()
        : (data.createdAt as string),
    updatedAt:
      data.updatedAt instanceof Timestamp
        ? data.updatedAt.toDate().toISOString()
        : (data.updatedAt as string | undefined),
    createdBy: data.createdBy as string,
  };
}

/**
 * Transaction service for Firestore operations.
 */
export const transactionService = {
  /**
   * Get all transactions for a clinic.
   */
  async getAll(clinicId: string, filters?: TransactionFilters): Promise<Transaction[]> {
    const transactionsRef = getTransactionsCollection(clinicId);
    let q = query(transactionsRef, orderBy('date', 'desc'));

    // Apply filters if provided
    if (filters?.type) {
      q = query(transactionsRef, where('type', '==', filters.type), orderBy('date', 'desc'));
    }

    const querySnapshot = await getDocs(q);
    let transactions = querySnapshot.docs.map((docSnap) =>
      toTransaction(docSnap.id, docSnap.data())
    );

    // Apply client-side filters that Firestore can't handle
    if (filters?.dateRange) {
      transactions = transactions.filter((t) => {
        const date = new Date(t.date);
        const start = new Date(filters.dateRange!.startDate);
        const end = new Date(filters.dateRange!.endDate);
        return date >= start && date <= end;
      });
    }

    if (filters?.categoryId) {
      transactions = transactions.filter((t) => t.categoryId === filters.categoryId);
    }

    if (filters?.status) {
      transactions = transactions.filter((t) => t.status === filters.status);
    }

    if (filters?.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      transactions = transactions.filter(
        (t) =>
          t.description.toLowerCase().includes(term) ||
          t.patientName?.toLowerCase().includes(term)
      );
    }

    return transactions;
  },

  /**
   * Get a transaction by ID.
   */
  async getById(clinicId: string, transactionId: string): Promise<Transaction | null> {
    const docRef = doc(db, 'clinics', clinicId, 'transactions', transactionId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return toTransaction(docSnap.id, docSnap.data());
  },

  /**
   * Create a new transaction.
   */
  async create(
    clinicId: string,
    data: CreateTransactionInput,
    userId: string
  ): Promise<string> {
    const transactionsRef = getTransactionsCollection(clinicId);

    const docData = {
      ...data,
      status: data.status || 'pending',
      createdAt: serverTimestamp(),
      createdBy: userId,
    };

    const docRef = await addDoc(transactionsRef, docData);
    return docRef.id;
  },

  /**
   * Update a transaction.
   */
  async update(
    clinicId: string,
    transactionId: string,
    data: Partial<Transaction>
  ): Promise<void> {
    const docRef = doc(db, 'clinics', clinicId, 'transactions', transactionId);

    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  },

  /**
   * Delete a transaction.
   */
  async delete(clinicId: string, transactionId: string): Promise<void> {
    const docRef = doc(db, 'clinics', clinicId, 'transactions', transactionId);
    await deleteDoc(docRef);
  },

  /**
   * Subscribe to real-time updates.
   */
  subscribe(
    clinicId: string,
    onData: (transactions: Transaction[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe {
    const transactionsRef = getTransactionsCollection(clinicId);
    const q = query(transactionsRef, orderBy('date', 'desc'));

    return onSnapshot(
      q,
      (snapshot) => {
        const transactions = snapshot.docs.map((docSnap) =>
          toTransaction(docSnap.id, docSnap.data())
        );
        onData(transactions);
      },
      (error) => {
        console.error('Transaction subscription error:', error);
        onError?.(error);
      }
    );
  },

  /**
   * Calculate financial summary for a period.
   */
  async getSummary(
    clinicId: string,
    startDate: string,
    endDate: string
  ): Promise<FinancialSummary> {
    const transactions = await this.getAll(clinicId, {
      dateRange: { startDate, endDate },
    });

    let totalIncome = 0;
    let totalExpenses = 0;
    const incomeByCategory: Record<string, number> = {};
    const expensesByCategory: Record<string, number> = {};

    for (const t of transactions) {
      if (t.status === 'cancelled' || t.status === 'refunded') continue;

      if (t.type === 'income') {
        totalIncome += t.amount;
        incomeByCategory[t.categoryId] = (incomeByCategory[t.categoryId] || 0) + t.amount;
      } else {
        totalExpenses += t.amount;
        expensesByCategory[t.categoryId] =
          (expensesByCategory[t.categoryId] || 0) + t.amount;
      }
    }

    return {
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
      transactionCount: transactions.length,
      incomeByCategory,
      expensesByCategory,
    };
  },

  /**
   * Get monthly financial data for charts.
   */
  async getMonthlyData(
    clinicId: string,
    months: number = 6
  ): Promise<MonthlyFinancialData[]> {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const transactions = await this.getAll(clinicId, {
      dateRange: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    });

    // Group by month
    const monthlyMap = new Map<string, MonthlyFinancialData>();

    // Initialize all months
    for (let i = 0; i < months; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - months + 1 + i, 1);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const monthName = date.toLocaleDateString('pt-BR', { month: 'short' });

      monthlyMap.set(key, {
        month: monthName.charAt(0).toUpperCase() + monthName.slice(1, 3),
        year: date.getFullYear(),
        income: 0,
        expenses: 0,
      });
    }

    // Aggregate transactions
    for (const t of transactions) {
      if (t.status === 'cancelled' || t.status === 'refunded') continue;

      const date = new Date(t.date);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const monthData = monthlyMap.get(key);

      if (monthData) {
        if (t.type === 'income') {
          monthData.income += t.amount;
        } else {
          monthData.expenses += t.amount;
        }
      }
    }

    return Array.from(monthlyMap.values());
  },

  /**
   * Mark a transaction as paid.
   */
  async markAsPaid(clinicId: string, transactionId: string): Promise<void> {
    await this.update(clinicId, transactionId, {
      status: 'paid',
      paidAt: new Date().toISOString(),
    });
  },
};

export default transactionService;
