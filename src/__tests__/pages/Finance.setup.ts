/**
 * Finance Test Setup
 * Shared mocks, fixtures, and utilities for Finance tests.
 * @module __tests__/pages/Finance.setup
 */

import { vi } from 'vitest'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import React from 'react'

// =============================================================================
// MOCK FUNCTIONS
// =============================================================================

export const mockAddTransaction = vi.fn().mockResolvedValue('txn-new')
export const mockUpdateTransaction = vi.fn()
export const mockDeleteTransaction = vi.fn()

// =============================================================================
// FIXTURES
// =============================================================================

export const mockDefaultTransactions = [
  {
    id: 'txn-1',
    type: 'income',
    amount: 35000,
    description: 'Consulta - Maria Santos',
    patientName: 'Maria Santos',
    date: new Date().toISOString(),
    status: 'paid',
    paymentMethod: 'pix',
    categoryId: 'consultation',
  },
  {
    id: 'txn-2',
    type: 'expense',
    amount: 15000,
    description: 'Material de escritório',
    date: new Date().toISOString(),
    status: 'paid',
    paymentMethod: 'cartao',
    categoryId: 'office',
  },
  {
    id: 'txn-3',
    type: 'income',
    amount: 50000,
    description: 'Exame - João Silva',
    patientName: 'João Silva',
    date: new Date().toISOString(),
    status: 'paid',
    paymentMethod: 'pix',
    categoryId: 'exam',
  },
]

export const mockDefaultSummary = {
  totalIncome: 350000,
  totalExpenses: 150000,
  netBalance: 200000,
  pendingCount: 2,
  pendingAmount: 50000,
  incomeTrend: 15,
  expensesTrend: -5,
}

export const mockDefaultMonthlyData = [
  { month: 'Jan', income: 300000, expenses: 120000 },
  { month: 'Fev', income: 350000, expenses: 150000 },
  { month: 'Mar', income: 400000, expenses: 160000 },
]

/** Default hook return for useFinance */
export const defaultFinanceHook = {
  transactions: mockDefaultTransactions,
  loading: false,
  summary: mockDefaultSummary,
  monthlyData: mockDefaultMonthlyData,
  addTransaction: mockAddTransaction,
  updateTransaction: mockUpdateTransaction,
  deleteTransaction: mockDeleteTransaction,
}

/** Loading state hook return */
export const loadingFinanceHook = {
  ...defaultFinanceHook,
  transactions: [],
  loading: true,
  summary: null,
  monthlyData: [],
}

/** Empty state hook return */
export const emptyFinanceHook = {
  ...defaultFinanceHook,
  transactions: [],
  loading: false,
  monthlyData: [],
}

// =============================================================================
// MOCK COMPONENTS
// =============================================================================

export const MockTransactionForm = ({
  onClose,
  onSubmit,
  onGeneratePix,
}: {
  onClose: () => void
  onSubmit: (data: unknown) => Promise<string>
  onGeneratePix?: (id: string, amount: number, desc: string) => void
}) =>
  React.createElement(
    'div',
    { 'data-testid': 'transaction-form' },
    React.createElement('button', { onClick: onClose }, 'Fechar'),
    React.createElement(
      'button',
      {
        onClick: async () => {
          const id = await onSubmit({
            description: 'Test',
            amount: 10000,
            type: 'income',
            categoryId: 'consultation',
          })
          if (onGeneratePix) onGeneratePix(id, 10000, 'Test')
        },
      },
      'Salvar com PIX'
    ),
    React.createElement(
      'button',
      {
        onClick: () =>
          onSubmit({
            description: 'Test',
            amount: 10000,
            type: 'income',
            categoryId: 'consultation',
          }),
      },
      'Salvar'
    )
  )

export const MockDirectPixModal = ({
  onClose,
  onConfirmPayment,
  amountInCents,
  description,
}: {
  onClose: () => void
  onConfirmPayment: () => void
  amountInCents: number
  description: string
}) =>
  React.createElement(
    'div',
    { 'data-testid': 'pix-modal' },
    React.createElement('span', { 'data-testid': 'pix-amount' }, amountInCents),
    React.createElement('span', { 'data-testid': 'pix-description' }, description),
    React.createElement('button', { onClick: onClose }, 'Fechar PIX'),
    React.createElement('button', { onClick: onConfirmPayment }, 'Confirmar PIX')
  )

// =============================================================================
// RENDER HELPER
// =============================================================================

import { Finance } from '../../pages/Finance'

export const renderFinance = () => {
  return render(React.createElement(MemoryRouter, null, React.createElement(Finance)))
}
