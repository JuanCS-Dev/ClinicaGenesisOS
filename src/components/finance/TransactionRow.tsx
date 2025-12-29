/**
 * TransactionRow Component
 *
 * List item for displaying individual transactions.
 *
 * OPTIMIZED: Wrapped with React.memo to prevent unnecessary re-renders in lists.
 */

import React, { memo } from 'react'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import {
  formatCurrency,
  DEFAULT_CATEGORIES,
  PAYMENT_METHOD_LABELS,
  TRANSACTION_STATUS_LABELS,
  type Transaction,
} from '../../types'

export interface TransactionRowProps {
  transaction: Transaction
}

export const TransactionRow = memo(function TransactionRow({ transaction }: TransactionRowProps) {
  const category = DEFAULT_CATEGORIES.find(c => c.id === transaction.categoryId)
  const isIncome = transaction.type === 'income'

  const formattedDate = new Date(transaction.date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  })

  return (
    <div className="p-4 hover:bg-genesis-soft rounded-2xl transition-colors cursor-pointer group flex items-center justify-between mb-1">
      <div className="flex items-center gap-4">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${
            isIncome ? 'bg-[#F0FDF4] text-[#22C55E]' : 'bg-[#FEF2F2] text-[#EF4444]'
          }`}
        >
          {isIncome ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
        </div>
        <div>
          <p className="text-sm font-semibold text-genesis-dark">{transaction.description}</p>
          <p className="text-[11px] text-genesis-medium flex items-center gap-2">
            {formattedDate} • {PAYMENT_METHOD_LABELS[transaction.paymentMethod]}
            {category && (
              <>
                {' '}
                •{' '}
                <span
                  className="px-1.5 py-0.5 rounded text-[10px]"
                  style={{ backgroundColor: `${category.color}20`, color: category.color }}
                >
                  {category.name}
                </span>
              </>
            )}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold text-genesis-dark">
          {isIncome ? '+' : '-'} {formatCurrency(transaction.amount)}
        </p>
        <span
          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
            transaction.status === 'paid'
              ? 'bg-genesis-hover text-genesis-muted'
              : transaction.status === 'pending'
                ? 'bg-[#FEF3C7] text-[#B45309]'
                : 'bg-[#FEE2E2] text-[#B91C1C]'
          }`}
        >
          {TRANSACTION_STATUS_LABELS[transaction.status]}
        </span>
      </div>
    </div>
  )
})

export default TransactionRow
