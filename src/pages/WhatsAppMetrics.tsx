/**
 * WhatsApp Metrics Dashboard
 *
 * Real-time analytics for WhatsApp appointment reminders.
 * Components extracted to src/components/whatsapp/ for modularity.
 */

import { useMemo, useCallback } from 'react'
import {
  MessageCircle,
  CheckCheck,
  Eye,
  UserCheck,
  TrendingDown,
  Send,
  AlertCircle,
  Clock,
  CalendarX,
  Loader2,
  RefreshCw,
} from 'lucide-react'
import { toast } from 'sonner'
import { format, subDays } from 'date-fns'
import { useWhatsAppMetrics } from '../hooks/useWhatsAppMetrics'
import { formatPercent } from '../services/whatsapp-metrics.service'
import {
  MetricCard,
  StatusBreakdown,
  LazyAreaChart,
  LazyArea,
  LazyXAxis,
  LazyYAxis,
  LazyCartesianGrid,
  LazyTooltip,
  LazyResponsiveContainer,
  LazyBarChart,
  LazyBar,
  ChartSuspense,
} from '../components/whatsapp'

export function WhatsAppMetrics() {
  const { metrics, loading, error, refresh } = useWhatsAppMetrics()

  // Refresh handler with toast feedback
  const handleRefresh = useCallback(() => {
    refresh()
    toast.success('Métricas atualizadas')
  }, [refresh])

  // Format chart data
  const chartData = useMemo(() => {
    if (!metrics.dailyStats.length) {
      return Array.from({ length: 7 }, (_, i) => ({
        date: format(subDays(new Date(), 6 - i), 'dd/MM'),
        sent: 0,
        delivered: 0,
        read: 0,
        confirmed: 0,
      }))
    }
    return metrics.dailyStats.map(day => ({
      ...day,
      date: format(new Date(day.date), 'dd/MM'),
    }))
  }, [metrics.dailyStats])

  // No-show comparison data
  const noShowData = useMemo(
    () => [
      { name: 'Com Lembrete', value: metrics.noShowsWithReminder, fill: '#34C759' },
      { name: 'Sem Lembrete', value: metrics.noShowsWithoutReminder, fill: '#FF3B30' },
    ],
    [metrics.noShowsWithReminder, metrics.noShowsWithoutReminder]
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-genesis-primary animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-500">
        <AlertCircle className="w-8 h-8 mb-2" />
        <p>Erro ao carregar métricas</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-enter pb-10">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-green-100 rounded-xl">
              <MessageCircle className="w-5 h-5 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-genesis-dark tracking-tight">
              WhatsApp Lembretes
            </h1>
          </div>
          <p className="text-genesis-medium text-sm">
            Métricas de engajamento e confirmações de consulta via WhatsApp.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2.5 bg-genesis-primary text-white rounded-xl text-sm font-medium hover:bg-genesis-primary-dark hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-genesis-primary/20"
        >
          <RefreshCw className="w-4 h-4" /> Atualizar
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Mensagens Enviadas"
          value={metrics.totalSent}
          subtitle="Total de lembretes"
          icon={Send}
          colorClass="text-amber-600"
          bgClass="bg-amber-50"
        />
        <MetricCard
          title="Taxa de Entrega"
          value={formatPercent(metrics.deliveryRate)}
          subtitle="Entregues com sucesso"
          icon={CheckCheck}
          colorClass="text-green-600"
          bgClass="bg-green-50"
          trend={metrics.deliveryRate > 95 ? 5 : metrics.deliveryRate - 95}
          trendLabel="Meta: 95%"
        />
        <MetricCard
          title="Taxa de Leitura"
          value={formatPercent(metrics.readRate)}
          subtitle="Pacientes que leram"
          icon={Eye}
          colorClass="text-blue-600"
          bgClass="bg-blue-50"
          trend={metrics.readRate > 80 ? 10 : metrics.readRate - 80}
          trendLabel="Benchmark: 98%"
        />
        <MetricCard
          title="Confirmações"
          value={metrics.totalConfirmed}
          subtitle={`${formatPercent(metrics.confirmationRate)} confirmaram`}
          icon={UserCheck}
          colorClass="text-purple-600"
          bgClass="bg-purple-50"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart - Delivery Trend */}
        <div className="lg:col-span-2 bg-genesis-surface rounded-3xl border border-genesis-border-subtle shadow-md p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-genesis-dark">Tendência de Engajamento</h3>
            <span className="text-xs text-genesis-medium bg-genesis-hover px-3 py-1 rounded-full">
              Últimos 30 dias
            </span>
          </div>
          <div className="h-[300px]">
            <ChartSuspense>
              <LazyResponsiveContainer width="100%" height="100%">
                <LazyAreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorDelivered" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#34C759" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#34C759" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorRead" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#007AFF" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#007AFF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <LazyCartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2F2F7" />
                  <LazyXAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#86868B', fontSize: 12 }}
                    dy={10}
                  />
                  <LazyYAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#86868B', fontSize: 12 }}
                  />
                  <LazyTooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)',
                    }}
                    cursor={{ stroke: '#E5E5EA', strokeWidth: 1 }}
                  />
                  <LazyArea
                    type="monotone"
                    dataKey="sent"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorSent)"
                    name="Enviados"
                  />
                  <LazyArea
                    type="monotone"
                    dataKey="delivered"
                    stroke="#34C759"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorDelivered)"
                    name="Entregues"
                  />
                  <LazyArea
                    type="monotone"
                    dataKey="read"
                    stroke="#007AFF"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRead)"
                    name="Lidos"
                  />
                </LazyAreaChart>
              </LazyResponsiveContainer>
            </ChartSuspense>
          </div>
        </div>

        {/* No-Show Impact */}
        <div className="bg-genesis-surface rounded-3xl border border-genesis-border-subtle shadow-md p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-red-50 rounded-lg">
              <CalendarX className="w-4 h-4 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-genesis-dark">Impacto No-Shows</h3>
          </div>
          <div className="h-[200px] mb-4">
            <ChartSuspense>
              <LazyResponsiveContainer width="100%" height="100%">
                <LazyBarChart
                  data={noShowData}
                  layout="vertical"
                  margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
                >
                  <LazyXAxis type="number" hide />
                  <LazyYAxis
                    type="category"
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#86868B', fontSize: 12 }}
                    width={100}
                  />
                  <LazyTooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)',
                    }}
                  />
                  <LazyBar dataKey="value" radius={[0, 8, 8, 0]} />
                </LazyBarChart>
              </LazyResponsiveContainer>
            </ChartSuspense>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="w-4 h-4 text-green-600" />
              <span className="text-sm font-bold text-green-700">
                {metrics.noShowReduction > 0 ? '-' : ''}
                {formatPercent(Math.abs(metrics.noShowReduction))}
              </span>
            </div>
            <p className="text-xs text-green-600">Redução de no-shows com lembretes WhatsApp</p>
          </div>
        </div>
      </div>

      {/* Status Breakdown Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatusBreakdown
          title="Confirmação"
          data={metrics.confirmation}
          icon={Send}
          accentColor="bg-purple-500"
        />
        <StatusBreakdown
          title="Lembrete 24h"
          data={metrics.reminder24h}
          icon={Clock}
          accentColor="bg-blue-500"
        />
        <StatusBreakdown
          title="Lembrete 2h"
          data={metrics.reminder2h}
          icon={Clock}
          accentColor="bg-amber-500"
        />
      </div>

      {/* Response Summary */}
      <div
        className="rounded-2xl p-8 text-white shadow-xl border border-genesis-border-subtle"
        style={{ background: 'linear-gradient(to bottom right, #0f172a, #000000)' }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold mb-1">Resumo de Respostas</h3>
            <p className="text-genesis-subtle text-sm">Interações dos pacientes com os lembretes</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">{formatPercent(metrics.responseRate)}</p>
            <p className="text-genesis-subtle text-xs">Taxa de Resposta</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-400">{metrics.totalConfirmed}</p>
            <p className="text-xs text-genesis-subtle mt-1">Confirmaram</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-400">{metrics.totalNeedReschedule}</p>
            <p className="text-xs text-genesis-subtle mt-1">Pediram Remarcação</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-400">{metrics.totalRead}</p>
            <p className="text-xs text-genesis-subtle mt-1">Visualizaram</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-400">{metrics.totalFailed}</p>
            <p className="text-xs text-genesis-subtle mt-1">Falhas de Envio</p>
          </div>
        </div>
      </div>
    </div>
  )
}
