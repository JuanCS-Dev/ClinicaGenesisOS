/**
 * WhatsApp Metrics Dashboard
 *
 * Real-time analytics for WhatsApp appointment reminders.
 * Optimized with React.memo, useMemo, and lazy-loaded charts.
 */

import React, { memo, useMemo, lazy, Suspense } from 'react';
import {
  MessageCircle,
  CheckCheck,
  Eye,
  UserCheck,
  TrendingUp,
  TrendingDown,
  Send,
  AlertCircle,
  Clock,
  CalendarX,
  Loader2,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import { useWhatsAppMetrics } from '../hooks/useWhatsAppMetrics';
import { formatPercent, StatusCounts } from '../services/whatsapp-metrics.service';

// Lazy load Recharts for better initial load performance
const LazyAreaChart = lazy(() =>
  import('recharts').then((m) => ({ default: m.AreaChart }))
);
const LazyArea = lazy(() =>
  import('recharts').then((m) => ({ default: m.Area }))
);
const LazyXAxis = lazy(() =>
  import('recharts').then((m) => ({ default: m.XAxis }))
);
const LazyYAxis = lazy(() =>
  import('recharts').then((m) => ({ default: m.YAxis }))
);
const LazyCartesianGrid = lazy(() =>
  import('recharts').then((m) => ({ default: m.CartesianGrid }))
);
const LazyTooltip = lazy(() =>
  import('recharts').then((m) => ({ default: m.Tooltip }))
);
const LazyResponsiveContainer = lazy(() =>
  import('recharts').then((m) => ({ default: m.ResponsiveContainer }))
);
const LazyBarChart = lazy(() =>
  import('recharts').then((m) => ({ default: m.BarChart }))
);
const LazyBar = lazy(() =>
  import('recharts').then((m) => ({ default: m.Bar }))
);

// ============================================================================
// KPI Card Component (Memoized)
// ============================================================================

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ElementType;
  colorClass: string;
  bgClass: string;
  trend?: number;
  trendLabel?: string;
}

const MetricCard = memo(function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  colorClass,
  bgClass,
  trend,
  trendLabel,
}: MetricCardProps) {
  const isPositive = trend !== undefined && trend >= 0;

  return (
    <div className="group bg-white p-6 rounded-2xl border border-white shadow-soft hover:shadow-float hover:-translate-y-1 transition-all duration-300 ease-out relative overflow-hidden">
      {/* Background gradient */}
      <div
        className={`absolute top-0 right-0 w-24 h-24 ${bgClass} opacity-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110`}
      />

      <div className="relative">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-xl ${bgClass}`}>
            <Icon className={`w-5 h-5 ${colorClass}`} strokeWidth={2.5} />
          </div>
          {trend !== undefined && (
            <span
              className={`text-[11px] font-semibold px-2 py-1 rounded-full flex items-center gap-1 border ${
                isPositive
                  ? 'text-emerald-600 bg-emerald-50 border-emerald-100'
                  : 'text-red-600 bg-red-50 border-red-100'
              }`}
            >
              {isPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {trend > 0 ? '+' : ''}
              {trend.toFixed(0)}%
            </span>
          )}
        </div>

        <div className="space-y-1">
          <h3 className="text-3xl font-bold text-genesis-dark tracking-tight">
            {value}
          </h3>
          <p className="text-[13px] font-medium text-genesis-medium">{title}</p>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="text-[10px] text-genesis-medium">
            {trendLabel || subtitle}
          </span>
          <ArrowRight className="w-3 h-3 text-genesis-blue" />
        </div>
      </div>
    </div>
  );
});

// ============================================================================
// Status Breakdown Card (Memoized)
// ============================================================================

interface StatusBreakdownProps {
  title: string;
  data: StatusCounts;
  icon: React.ElementType;
  accentColor: string;
}

const StatusBreakdown = memo(function StatusBreakdown({
  title,
  data,
  icon: Icon,
  accentColor,
}: StatusBreakdownProps) {
  const statuses = [
    { key: 'sent', label: 'Enviados', color: 'bg-amber-500' },
    { key: 'delivered', label: 'Entregues', color: 'bg-green-500' },
    { key: 'read', label: 'Lidos', color: 'bg-blue-500' },
    { key: 'failed', label: 'Falhas', color: 'bg-red-500' },
  ] as const;

  return (
    <div className="bg-white rounded-2xl border border-white shadow-soft p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg ${accentColor}`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <h4 className="font-semibold text-genesis-dark text-sm">{title}</h4>
        <span className="ml-auto text-xs text-genesis-medium bg-gray-100 px-2 py-1 rounded-full">
          {data.total} total
        </span>
      </div>

      <div className="space-y-3">
        {statuses.map(({ key, label, color }) => {
          const count = data[key];
          const percent = data.total > 0 ? (count / data.total) * 100 : 0;

          return (
            <div key={key} className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${color}`} />
              <span className="text-xs text-genesis-medium w-20">{label}</span>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${color} rounded-full transition-all duration-500`}
                  style={{ width: `${percent}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-genesis-dark w-8 text-right">
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
});

// ============================================================================
// Chart Loading Fallback
// ============================================================================

const ChartLoader = () => (
  <div className="flex items-center justify-center h-full">
    <Loader2 className="w-6 h-6 text-genesis-blue animate-spin" />
  </div>
);

// ============================================================================
// Main Component
// ============================================================================

export function WhatsAppMetrics() {
  const { metrics, loading, error } = useWhatsAppMetrics();

  // Format chart data
  const chartData = useMemo(() => {
    if (!metrics.dailyStats.length) {
      // Generate last 7 days as placeholder
      return Array.from({ length: 7 }, (_, i) => ({
        date: format(subDays(new Date(), 6 - i), 'dd/MM'),
        sent: 0,
        delivered: 0,
        read: 0,
        confirmed: 0,
      }));
    }

    return metrics.dailyStats.map((day) => ({
      ...day,
      date: format(new Date(day.date), 'dd/MM'),
    }));
  }, [metrics.dailyStats]);

  // No-show comparison data
  const noShowData = useMemo(
    () => [
      {
        name: 'Com Lembrete',
        value: metrics.noShowsWithReminder,
        fill: '#34C759',
      },
      {
        name: 'Sem Lembrete',
        value: metrics.noShowsWithoutReminder,
        fill: '#FF3B30',
      },
    ],
    [metrics.noShowsWithReminder, metrics.noShowsWithoutReminder]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-genesis-blue animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-500">
        <AlertCircle className="w-8 h-8 mb-2" />
        <p>Erro ao carregar métricas</p>
      </div>
    );
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
        <button className="flex items-center gap-2 px-4 py-2.5 bg-genesis-dark text-white rounded-xl text-sm font-medium hover:bg-black transition-colors shadow-lg shadow-gray-200">
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
        <div className="lg:col-span-2 bg-white rounded-3xl border border-white shadow-soft p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-genesis-dark">
              Tendência de Engajamento
            </h3>
            <span className="text-xs text-genesis-medium bg-gray-100 px-3 py-1 rounded-full">
              Últimos 30 dias
            </span>
          </div>

          <div className="h-[300px]">
            <Suspense fallback={<ChartLoader />}>
              <LazyResponsiveContainer width="100%" height="100%">
                <LazyAreaChart
                  data={chartData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient
                      id="colorDelivered"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#34C759" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#34C759" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorRead" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#007AFF" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#007AFF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <LazyCartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#F2F2F7"
                  />
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
            </Suspense>
          </div>
        </div>

        {/* No-Show Impact */}
        <div className="bg-white rounded-3xl border border-white shadow-soft p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-red-50 rounded-lg">
              <CalendarX className="w-4 h-4 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-genesis-dark">
              Impacto No-Shows
            </h3>
          </div>

          <div className="h-[200px] mb-4">
            <Suspense fallback={<ChartLoader />}>
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
            </Suspense>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="w-4 h-4 text-green-600" />
              <span className="text-sm font-bold text-green-700">
                {metrics.noShowReduction > 0 ? '-' : ''}
                {formatPercent(Math.abs(metrics.noShowReduction))}
              </span>
            </div>
            <p className="text-xs text-green-600">
              Redução de no-shows com lembretes WhatsApp
            </p>
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
      <div className="bg-gradient-to-br from-genesis-dark to-gray-800 rounded-3xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold mb-1">Resumo de Respostas</h3>
            <p className="text-gray-400 text-sm">
              Interações dos pacientes com os lembretes
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">
              {formatPercent(metrics.responseRate)}
            </p>
            <p className="text-gray-400 text-xs">Taxa de Resposta</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-400">
              {metrics.totalConfirmed}
            </p>
            <p className="text-xs text-gray-400 mt-1">Confirmaram</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-400">
              {metrics.totalNeedReschedule}
            </p>
            <p className="text-xs text-gray-400 mt-1">Pediram Remarcação</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-400">
              {metrics.totalRead}
            </p>
            <p className="text-xs text-gray-400 mt-1">Visualizaram</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-400">
              {metrics.totalFailed}
            </p>
            <p className="text-xs text-gray-400 mt-1">Falhas de Envio</p>
          </div>
        </div>
      </div>
    </div>
  );
}
