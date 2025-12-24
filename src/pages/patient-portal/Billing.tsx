/**
 * Patient Portal - Billing
 * ========================
 *
 * View invoices, payments, and financial history.
 *
 * @module pages/patient-portal/Billing
 * @version 1.0.0
 */

import React from 'react'
import {
  CreditCard,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  FileText,
} from 'lucide-react'

// ============================================================================
// Mock Data
// ============================================================================

const MOCK_INVOICES = [
  {
    id: '1',
    date: '2024-12-15',
    description: 'Consulta - Dr. João Silva',
    amount: 250,
    status: 'paid',
    paymentMethod: 'PIX',
  },
  {
    id: '2',
    date: '2024-12-20',
    description: 'Exames Laboratoriais',
    amount: 180,
    status: 'pending',
    dueDate: '2024-12-30',
  },
  {
    id: '3',
    date: '2024-11-20',
    description: 'Consulta - Dra. Maria Santos',
    amount: 350,
    status: 'paid',
    paymentMethod: 'Cartão de Crédito',
  },
  {
    id: '4',
    date: '2024-10-01',
    description: 'Consulta - Dr. João Silva',
    amount: 250,
    status: 'paid',
    paymentMethod: 'PIX',
  },
]

// ============================================================================
// Helpers
// ============================================================================

const STATUS_CONFIG = {
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
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

// ============================================================================
// Main Component
// ============================================================================

export function PatientBilling(): React.ReactElement {
  const totalPaid = MOCK_INVOICES.filter(i => i.status === 'paid').reduce(
    (sum, i) => sum + i.amount,
    0
  )
  const totalPending = MOCK_INVOICES.filter(i => i.status === 'pending').reduce(
    (sum, i) => sum + i.amount,
    0
  )

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

        <div className="divide-y divide-genesis-border">
          {MOCK_INVOICES.map(invoice => {
            const statusConfig = STATUS_CONFIG[invoice.status as keyof typeof STATUS_CONFIG]
            const StatusIcon = statusConfig.icon

            return (
              <div key={invoice.id} className="p-4 hover:bg-genesis-hover transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-genesis-soft flex items-center justify-center">
                      <FileText className="w-5 h-5 text-genesis-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-genesis-dark">{invoice.description}</p>
                      <p className="text-sm text-genesis-muted flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(invoice.date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold text-genesis-dark">
                        {formatCurrency(invoice.amount)}
                      </p>
                      {invoice.status === 'paid' && invoice.paymentMethod && (
                        <p className="text-xs text-genesis-muted">{invoice.paymentMethod}</p>
                      )}
                    </div>

                    <div
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 ${statusConfig.color}`}
                    >
                      <StatusIcon className="w-3 h-3" />
                      {statusConfig.label}
                    </div>

                    {invoice.status === 'pending' && (
                      <button className="px-3 py-1.5 rounded-lg bg-genesis-primary text-white text-sm font-medium hover:bg-genesis-primary-dark hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                        Pagar
                      </button>
                    )}

                    {invoice.status === 'paid' && (
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
      </div>
    </div>
  )
}

export default PatientBilling
