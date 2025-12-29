/**
 * useFinance Hook Tests
 *
 * Tests for the financial transactions hook.
 *
 * @module __tests__/hooks/useFinance
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import React from 'react'
import { useFinance } from '../../hooks/useFinance'
import { transactionService } from '../../services/firestore'
import { useClinicContext } from '../../contexts/ClinicContext'
import type { Transaction, FinancialSummary, MonthlyFinancialData } from '@/types'

vi.mock('../../contexts/ClinicContext', () => ({
  useClinicContext: vi.fn(),
}))

vi.mock('../../services/firestore', () => ({
  transactionService: {
    subscribe: vi.fn(),
    getSummary: vi.fn(),
    getMonthlyData: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    markAsPaid: vi.fn(),
    getAll: vi.fn(),
  },
}))

describe('useFinance', () => {
  const mockClinicId = 'clinic-123'
  const mockUserProfile = { id: 'user-123', name: 'Test User' }

  const mockTransactions: Transaction[] = [
    {
      id: 'tx-1',
      clinicId: mockClinicId,
      type: 'income',
      description: 'Consulta',
      amount: 15000,
      date: new Date().toISOString(),
      status: 'paid',
      categoryId: 'cat-1',
      patientName: 'John Doe',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'user-1',
    },
    {
      id: 'tx-2',
      clinicId: mockClinicId,
      type: 'expense',
      description: 'Material',
      amount: 5000,
      date: new Date().toISOString(),
      status: 'pending',
      categoryId: 'cat-2',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'user-1',
    },
  ]

  const mockSummary: FinancialSummary = {
    totalIncome: 15000,
    totalExpense: 5000,
    balance: 10000,
    pendingIncome: 0,
    pendingExpense: 0,
  }

  const mockMonthlyData: MonthlyFinancialData[] = [
    { month: 'Jan', income: 10000, expense: 3000 },
    { month: 'Feb', income: 15000, expense: 5000 },
  ]

  let mockUnsubscribe: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
    mockUnsubscribe = vi.fn()

    vi.mocked(useClinicContext).mockReturnValue({
      clinicId: mockClinicId,
      userProfile: mockUserProfile,
    } as ReturnType<typeof useClinicContext>)

    vi.mocked(transactionService.subscribe).mockImplementation((_, onData) => {
      // Simulate async data
      setTimeout(() => onData(mockTransactions), 0)
      return mockUnsubscribe
    })

    vi.mocked(transactionService.getSummary).mockResolvedValue(mockSummary)
    vi.mocked(transactionService.getMonthlyData).mockResolvedValue(mockMonthlyData)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('initialization', () => {
    it('should initialize with empty transactions', () => {
      vi.mocked(transactionService.subscribe).mockReturnValue(mockUnsubscribe)

      const { result } = renderHook(() => useFinance())

      expect(result.current.transactions).toEqual([])
      expect(result.current.loading).toBe(true)
    })

    it('should have default date filters for current month', () => {
      const { result } = renderHook(() => useFinance())

      expect(result.current.filters.dateRange).toBeDefined()
      expect(result.current.filters.dateRange?.startDate).toBeDefined()
      expect(result.current.filters.dateRange?.endDate).toBeDefined()
    })
  })

  describe('subscription', () => {
    it('should subscribe to transactions when clinicId exists', () => {
      renderHook(() => useFinance())

      expect(transactionService.subscribe).toHaveBeenCalledWith(
        mockClinicId,
        expect.any(Function),
        expect.any(Function)
      )
    })

    it('should not subscribe when clinicId is null', () => {
      vi.mocked(useClinicContext).mockReturnValue({
        clinicId: null,
        userProfile: null,
      } as unknown as ReturnType<typeof useClinicContext>)

      renderHook(() => useFinance())

      expect(transactionService.subscribe).not.toHaveBeenCalled()
    })

    it('should unsubscribe on unmount', () => {
      const { unmount } = renderHook(() => useFinance())

      unmount()

      expect(mockUnsubscribe).toHaveBeenCalled()
    })

    it('should receive transactions from subscription', async () => {
      vi.useFakeTimers()

      const { result } = renderHook(() => useFinance())

      await act(async () => {
        vi.runAllTimers()
      })

      expect(result.current.transactions.length).toBeGreaterThan(0)
      expect(result.current.loading).toBe(false)
    })

    it('should handle subscription errors', async () => {
      vi.mocked(transactionService.subscribe).mockImplementation((_, __, onError) => {
        setTimeout(() => onError(new Error('Subscription failed')), 0)
        return mockUnsubscribe
      })

      vi.useFakeTimers()

      const { result } = renderHook(() => useFinance())

      await act(async () => {
        vi.runAllTimers()
      })

      expect(result.current.error).toBeDefined()
    })
  })

  describe('summary and monthly data', () => {
    it('should load summary data', async () => {
      vi.useFakeTimers()

      const { result } = renderHook(() => useFinance())

      await act(async () => {
        vi.runAllTimers()
        await Promise.resolve()
      })

      // Summary is loaded asynchronously
      expect(transactionService.getSummary).toHaveBeenCalled()
    })

    it('should load monthly chart data', async () => {
      vi.useFakeTimers()

      const { result } = renderHook(() => useFinance())

      await act(async () => {
        vi.runAllTimers()
        await Promise.resolve()
      })

      // Monthly data is loaded asynchronously
      expect(transactionService.getMonthlyData).toHaveBeenCalledWith(mockClinicId, 6)
    })
  })

  describe('filtering', () => {
    it('should filter by type', async () => {
      vi.useFakeTimers()

      const { result } = renderHook(() => useFinance())

      await act(async () => {
        vi.runAllTimers()
      })

      act(() => {
        result.current.setFilters({ ...result.current.filters, type: 'income' })
      })

      expect(result.current.transactions.every(t => t.type === 'income')).toBe(true)
    })

    it('should filter by status', async () => {
      vi.useFakeTimers()

      const { result } = renderHook(() => useFinance())

      await act(async () => {
        vi.runAllTimers()
      })

      act(() => {
        result.current.setFilters({ ...result.current.filters, status: 'pending' })
      })

      expect(result.current.transactions.every(t => t.status === 'pending')).toBe(true)
    })

    it('should filter by search term', async () => {
      vi.useFakeTimers()

      const { result } = renderHook(() => useFinance())

      await act(async () => {
        vi.runAllTimers()
      })

      act(() => {
        result.current.setFilters({ ...result.current.filters, searchTerm: 'Consulta' })
      })

      expect(
        result.current.transactions.every(t => t.description.toLowerCase().includes('consulta'))
      ).toBe(true)
    })

    it('should filter by patient name', async () => {
      vi.useFakeTimers()

      const { result } = renderHook(() => useFinance())

      await act(async () => {
        vi.runAllTimers()
      })

      act(() => {
        result.current.setFilters({ ...result.current.filters, searchTerm: 'john' })
      })

      expect(result.current.transactions.length).toBe(1)
      expect(result.current.transactions[0].patientName).toBe('John Doe')
    })

    it('should filter by category', async () => {
      vi.useFakeTimers()

      const { result } = renderHook(() => useFinance())

      await act(async () => {
        vi.runAllTimers()
      })

      act(() => {
        result.current.setFilters({ ...result.current.filters, categoryId: 'cat-1' })
      })

      expect(result.current.transactions.every(t => t.categoryId === 'cat-1')).toBe(true)
    })
  })

  describe('CRUD operations', () => {
    it('should add transaction', async () => {
      vi.mocked(transactionService.create).mockResolvedValue('new-tx-id')

      const { result } = renderHook(() => useFinance())

      const newTransaction = {
        type: 'income' as const,
        description: 'New consultation',
        amount: 20000,
        date: new Date().toISOString(),
        categoryId: 'cat-1',
      }

      await act(async () => {
        const id = await result.current.addTransaction(newTransaction)
        expect(id).toBe('new-tx-id')
      })

      expect(transactionService.create).toHaveBeenCalledWith(
        mockClinicId,
        newTransaction,
        mockUserProfile.id
      )
    })

    it('should throw error when adding without clinic', async () => {
      vi.mocked(useClinicContext).mockReturnValue({
        clinicId: null,
        userProfile: null,
      } as unknown as ReturnType<typeof useClinicContext>)

      const { result } = renderHook(() => useFinance())

      await expect(
        result.current.addTransaction({
          type: 'income',
          description: 'Test',
          amount: 1000,
          date: new Date().toISOString(),
          categoryId: 'cat-1',
        })
      ).rejects.toThrow('No clinic or user selected')
    })

    it('should update transaction', async () => {
      vi.mocked(transactionService.update).mockResolvedValue()

      const { result } = renderHook(() => useFinance())

      await act(async () => {
        await result.current.updateTransaction('tx-1', { description: 'Updated' })
      })

      expect(transactionService.update).toHaveBeenCalledWith(mockClinicId, 'tx-1', {
        description: 'Updated',
      })
    })

    it('should delete transaction', async () => {
      vi.mocked(transactionService.delete).mockResolvedValue()

      const { result } = renderHook(() => useFinance())

      await act(async () => {
        await result.current.deleteTransaction('tx-1')
      })

      expect(transactionService.delete).toHaveBeenCalledWith(mockClinicId, 'tx-1')
    })

    it('should mark transaction as paid', async () => {
      vi.mocked(transactionService.markAsPaid).mockResolvedValue()

      const { result } = renderHook(() => useFinance())

      await act(async () => {
        await result.current.markAsPaid('tx-2')
      })

      expect(transactionService.markAsPaid).toHaveBeenCalledWith(mockClinicId, 'tx-2')
    })
  })

  describe('refresh', () => {
    it('should refresh data', async () => {
      vi.mocked(transactionService.getAll).mockResolvedValue(mockTransactions)

      const { result } = renderHook(() => useFinance())

      await act(async () => {
        await result.current.refresh()
      })

      expect(transactionService.getAll).toHaveBeenCalledWith(mockClinicId, result.current.filters)
    })

    it('should not refresh without clinicId', async () => {
      vi.mocked(useClinicContext).mockReturnValue({
        clinicId: null,
        userProfile: null,
      } as unknown as ReturnType<typeof useClinicContext>)

      const { result } = renderHook(() => useFinance())

      await act(async () => {
        await result.current.refresh()
      })

      expect(transactionService.getAll).not.toHaveBeenCalled()
    })
  })
})
