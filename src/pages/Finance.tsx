/**
 * Finance Page
 * ============
 *
 * Financial management dashboard with real-time data.
 * Fase 4: Financeiro & Relatórios
 * Fase 10: PIX Integration
 *
 * Note: Uses explicit hex colors for Tailwind 4 compatibility.
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  Download,
  Filter,
  Plus,
  Loader2,
  Calendar,
  Search,
  QrCode,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useFinance } from '../hooks/useFinance';
import { formatCurrency, type Transaction } from '../types';
import {
  exportTransactionsToExcel,
  exportTransactionsToPDF,
} from '../services/export.service';
import { FinanceCard, TransactionForm, TransactionRow } from '../components/finance';
import { DirectPixModal } from '../components/payments';

/**
 * Main Finance page component.
 */
export const Finance: React.FC = () => {
  const { transactions, loading, summary, monthlyData, addTransaction } = useFinance();
  const [showForm, setShowForm] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // PIX Payment Modal state
  const [showPixModal, setShowPixModal] = useState(false);
  const [pixModalData, setPixModalData] = useState<{
    transactionId?: string;
    amount?: number;
    description?: string;
  }>({});

  // Handle export (async due to dynamic imports for bundle optimization)
  const handleExportPDF = async () => {
    setShowExportMenu(false);
    await exportTransactionsToPDF(transactions, summary, 'Clínica Genesis');
  };

  const handleExportExcel = async () => {
    setShowExportMenu(false);
    await exportTransactionsToExcel(transactions);
  };

  // Convert monthly data for chart (from cents to currency)
  const chartData = useMemo(() => {
    return monthlyData.map((d) => ({
      month: d.month,
      receita: d.income / 100,
      despesa: d.expenses / 100,
    }));
  }, [monthlyData]);

  // Filter transactions by search
  const filteredTransactions = useMemo((): Transaction[] => {
    if (!searchTerm) return transactions.slice(0, 10);
    const term = searchTerm.toLowerCase();
    return transactions
      .filter(
        (t) =>
          t.description.toLowerCase().includes(term) ||
          t.patientName?.toLowerCase().includes(term)
      )
      .slice(0, 10);
  }, [transactions, searchTerm]);

  // Calculate margin
  const margin =
    summary && summary.totalIncome > 0
      ? Math.round((summary.netBalance / summary.totalIncome) * 100)
      : 0;

  // Handle PIX generation from transaction form
  const handleGeneratePix = useCallback(
    (transactionId: string, amount: number, description: string) => {
      setPixModalData({ transactionId, amount, description });
      setShowPixModal(true);
    },
    []
  );

  // Handle standalone PIX payment
  const handleNewPix = useCallback(() => {
    setPixModalData({});
    setShowPixModal(true);
  }, []);

  return (
    <div className="space-y-8 animate-enter pb-10">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-genesis-dark tracking-tight">
            Gestão Financeira
          </h1>
          <p className="text-genesis-medium text-sm">
            Fluxo de caixa e demonstrações do mês atual.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-genesis-surface border border-genesis-border rounded-xl text-sm font-medium text-genesis-dark hover:bg-genesis-soft transition-colors shadow-sm">
            <Filter className="w-4 h-4 text-genesis-medium" /> Filtros
          </button>
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 px-4 py-2.5 bg-genesis-surface border border-genesis-border rounded-xl text-sm font-medium text-genesis-dark hover:bg-genesis-soft transition-colors shadow-sm"
            >
              <Download className="w-4 h-4 text-genesis-medium" /> Exportar
            </button>
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-genesis-surface rounded-xl shadow-lg border border-genesis-border-subtle py-2 z-20">
                <button
                  onClick={handleExportPDF}
                  className="w-full px-4 py-2 text-left text-sm text-genesis-dark hover:bg-genesis-soft flex items-center gap-2"
                >
                  <Download className="w-4 h-4 text-[#EF4444]" />
                  Exportar PDF
                </button>
                <button
                  onClick={handleExportExcel}
                  className="w-full px-4 py-2 text-left text-sm text-genesis-dark hover:bg-genesis-soft flex items-center gap-2"
                >
                  <Download className="w-4 h-4 text-[#22C55E]" />
                  Exportar Excel
                </button>
              </div>
            )}
          </div>
          <button
            onClick={handleNewPix}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#32D583] text-white rounded-xl text-sm font-medium hover:bg-[#2BBF76] transition-colors shadow-lg shadow-[#32D583]/20"
          >
            <QrCode className="w-4 h-4" /> PIX
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-genesis-dark text-white rounded-xl text-sm font-medium hover:bg-black transition-colors shadow-lg shadow-genesis-medium/20"
          >
            <Plus className="w-4 h-4" /> Nova Transação
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FinanceCard
          title="Receita Total"
          value={summary ? formatCurrency(summary.totalIncome) : 'R$ 0,00'}
          trend="vs. mês anterior"
          trendValue={
            summary?.incomeTrend
              ? `${summary.incomeTrend > 0 ? '+' : ''}${summary.incomeTrend}%`
              : undefined
          }
          type="positive"
          loading={loading}
        />
        <FinanceCard
          title="Despesas Operacionais"
          value={summary ? formatCurrency(summary.totalExpenses) : 'R$ 0,00'}
          trend="vs. mês anterior"
          trendValue={
            summary?.expensesTrend
              ? `${summary.expensesTrend > 0 ? '+' : ''}${summary.expensesTrend}%`
              : undefined
          }
          type="negative"
          loading={loading}
        />
        <FinanceCard
          title="Saldo Líquido"
          value={summary ? formatCurrency(summary.netBalance) : 'R$ 0,00'}
          trend={margin > 0 ? `Margem de ${margin}%` : undefined}
          trendValue={margin >= 50 ? 'Saudável' : margin >= 20 ? 'Atenção' : undefined}
          type="neutral"
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[500px]">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-genesis-surface rounded-3xl border border-white shadow-soft p-8 flex flex-col">
          <h3 className="text-lg font-bold text-genesis-dark mb-6">
            Fluxo de Caixa (Semestral)
          </h3>
          <div className="flex-1 w-full min-h-0">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#007AFF" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#007AFF" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorDespesa" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF3B30" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#FF3B30" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2F2F7" />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#86868B', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#86868B', fontSize: 12 }}
                    tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)',
                    }}
                    cursor={{ stroke: '#E5E5EA', strokeWidth: 1 }}
                    formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, '']}
                  />
                  <Area
                    type="monotone"
                    dataKey="receita"
                    stroke="#007AFF"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorReceita)"
                    name="Receita"
                  />
                  <Area
                    type="monotone"
                    dataKey="despesa"
                    stroke="#FF3B30"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorDespesa)"
                    name="Despesa"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-genesis-subtle">
                {loading ? (
                  <Loader2 className="w-8 h-8 animate-spin" />
                ) : (
                  'Nenhum dado disponível'
                )}
              </div>
            )}
          </div>
        </div>

        {/* Recent Transactions List */}
        <div className="bg-genesis-surface rounded-3xl border border-white shadow-soft p-0 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-genesis-border-subtle flex flex-col gap-3 bg-genesis-surface/50 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-genesis-dark">Transações</h3>
              <span className="text-xs text-genesis-medium">
                {transactions.length} total
              </span>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-genesis-subtle" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar..."
                className="w-full pl-10 pr-4 py-2 text-sm border border-genesis-border-subtle rounded-lg focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] outline-none"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-genesis-subtle" />
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-genesis-subtle mx-auto mb-3" />
                <p className="text-sm text-genesis-muted">Nenhuma transação encontrada</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-4 text-sm text-[#4F46E5] font-medium hover:underline"
                >
                  Adicionar primeira transação
                </button>
              </div>
            ) : (
              filteredTransactions.map((t) => (
                <TransactionRow key={t.id} transaction={t} />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Transaction Form Modal */}
      {showForm && (
        <TransactionForm
          onClose={() => setShowForm(false)}
          onSubmit={addTransaction}
          onGeneratePix={handleGeneratePix}
        />
      )}

      {/* Direct PIX Modal (0% fees) */}
      {showPixModal && (
        <DirectPixModal
          amountInCents={pixModalData.amount || 0}
          description={pixModalData.description || ''}
          transactionId={pixModalData.transactionId}
          onClose={() => {
            setShowPixModal(false);
            setPixModalData({});
          }}
          onConfirmPayment={() => {
            setShowPixModal(false);
            setPixModalData({});
          }}
        />
      )}
    </div>
  );
};

export default Finance;
