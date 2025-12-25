/**
 * Patient Portal - Billing
 * ========================
 *
 * View invoices, payments, and financial history.
 *
 * @module pages/patient-portal/Billing
 * @version 2.0.0
 */

import React, { useMemo } from 'react'
import {
  CreditCard,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  FileText,
} from 'lucide-react'
import { usePatientPortalBilling } from '../../hooks/usePatientPortal'
import { Skeleton } from '../../components/ui/Skeleton'
import type { Transaction } from '@/types'

// ============================================================================
// Helpers
// ============================================================================

type BillingStatus = 'paid' | 'pending' | 'overdue' | 'cancelled' | 'refunded'

const STATUS_CONFIG: Record<
  BillingStatus,
  { label: string; color: string; icon: React.ElementType }
> = {
  paid: {
    label: 'Pago',
    color: 'text-success bg-success-soft',
    icon: CheckCircle2,
  },
  pending: {
    label: 'Pendente',
    color: 'text-warning bg-warning-soft',
    icon: Clock,
  },
  overdue: {
    label: 'Vencido',
    color: 'text-danger bg-danger-soft',
    icon: AlertCircle,
  },
  cancelled: {
    label: 'Cancelado',
    color: 'text-genesis-muted bg-genesis-soft',
    icon: AlertCircle,
  },
  refunded: {
    label: 'Reembolsado',
    color: 'text-info bg-info-soft',
    icon: CheckCircle2,
  },
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

function getPaymentMethodLabel(method: Transaction['paymentMethod'] | undefined): string {
  const labels: Record<string, string> = {
    cash: 'Dinheiro',
    credit_card: 'Cartão de Crédito',
    debit_card: 'Cartão de Débito',
    pix: 'PIX',
    bank_transfer: 'Transferência',
    insurance: 'Convênio',
    other: 'Outro',
  }
  return method ? labels[method] || method : ''
}

// ============================================================================
// Components
// ============================================================================

function BillingSkeleton() {
  return (
    <div className="space-y-6 animate-enter pb-8">
      {/* Header Skeleton */}
      <div>
        <div className="flex items-center gap-3">
          <CreditCard className="w-7 h-7 text-emerald-600" />
          <Skeleton className="h-8 w-32" />
        </div>
        <Skeleton className="h-4 w-64 mt-2" />
      </div>

      {/* Summary Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
      </div>

      {/* List Skeleton */}
      <div className="bg-genesis-surface rounded-2xl border border-genesis-border overflow-hidden">
        <div className="p-4 border-b border-genesis-border">
          <Skeleton className="h-5 w-40" />
        </div>
        <div className="divide-y divide-genesis-border">
          {[1, 2, 3].map(i => (
            <div key={i} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Skeleton variant="rect" className="w-10 h-10 rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-6 w-16 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function PatientBilling(): React.ReactElement {
  const { transactions, totalPending, loading } = usePatientPortalBilling()

  // Calculate totals from real data
  const totalPaid = useMemo(() => {
    const paid = transactions.filter(t => t.status === 'paid' && t.type === 'income')
    return paid.reduce((sum, t) => sum + t.amount, 0)
  }, [transactions])

  // Filter only income transactions for billing view
  const billingTransactions = useMemo(() => {
    return transactions
      .filter(t => t.type === 'income')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [transactions])

  if (loading) {
    return <BillingSkeleton />
  }

  return (
    <div className="space-y-6 animate-enter pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-genesis-dark flex items-center gap-3">
          <CreditCard className="w-7 h-7 text-emerald-600" />
          Financeiro
        </h1>
        <p className="text-genesis-muted text-sm mt-1">
          Faturas, pagamentos e histórico financeiro
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-6 border border-green-100 dark:border-green-800">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-700 dark:text-green-300">
              Total Pago
            </span>
          </div>
          <p className="text-2xl font-bold text-green-800 dark:text-green-200">
            {formatCurrency(totalPaid)}
          </p>
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-6 border border-amber-100 dark:border-amber-800">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-amber-600" />
            <span className="text-sm font-medium text-amber-700 dark:text-amber-300">Pendente</span>
          </div>
          <p className="text-2xl font-bold text-amber-800 dark:text-amber-200">
            {formatCurrency(totalPending)}
          </p>
        </div>
      </div>

      {/* Invoices List */}
      <div className="bg-genesis-surface rounded-2xl border border-genesis-border overflow-hidden">
        <div className="p-4 border-b border-genesis-border">
          <h3 className="font-semibold text-genesis-dark">Histórico de Faturas</h3>
        </div>

        {billingTransactions.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="w-12 h-12 text-genesis-muted mx-auto mb-3" />
            <p className="font-medium text-genesis-dark">Nenhuma fatura encontrada</p>
            <p className="text-sm text-genesis-muted mt-1">
              Seu histórico financeiro aparecerá aqui
            </p>
          </div>
        ) : (
          <div className="divide-y divide-genesis-border">
            {billingTransactions.map(transaction => {
              const status = transaction.status as BillingStatus
              const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.pending
              const StatusIcon = statusConfig.icon

              return (
                <div key={transaction.id} className="p-4 hover:bg-genesis-hover transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-genesis-soft flex items-center justify-center">
                        <FileText className="w-5 h-5 text-genesis-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-genesis-dark">{transaction.description}</p>
                        <p className="text-sm text-genesis-muted flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(transaction.date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold text-genesis-dark">
                          {formatCurrency(transaction.amount)}
                        </p>
                        {transaction.status === 'paid' && transaction.paymentMethod && (
                          <p className="text-xs text-genesis-muted">
                            {getPaymentMethodLabel(transaction.paymentMethod)}
                          </p>
                        )}
                      </div>

                      <div
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 ${statusConfig.color}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig.label}
                      </div>

                      {(transaction.status === 'pending' || transaction.status === 'overdue') && (
                        <button className="px-3 py-1.5 rounded-lg bg-genesis-primary text-white text-sm font-medium hover:bg-genesis-primary-dark hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                          Pagar
                        </button>
                      )}

                      {transaction.status === 'paid' && (
                        <button className="p-2 rounded-lg text-genesis-muted hover:bg-genesis-hover hover:scale-[1.05] active:scale-[0.95] transition-all duration-200">
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default PatientBilling
