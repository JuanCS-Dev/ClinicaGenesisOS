/**
 * Reports Page
 * ============
 *
 * Clinical reports dashboard with real-time data from Firestore.
 * Fase 4: Financeiro & Relatórios
 *
 * Note: Uses explicit hex colors for Tailwind 4 compatibility.
 */

import React, { useState, useCallback } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'
import {
  Download,
  Share2,
  Info,
  Loader2,
  Calendar,
  Users,
  FileText,
  CheckCircle,
  TrendingUp,
} from 'lucide-react'
import { toast } from 'sonner'
import { useReports } from '../hooks/useReports'
import { exportReportToPDF } from '../services/export.service'
import type { SpecialtyType } from '@/types'

/**
 * Insight card component for KPI display.
 */
interface InsightCardProps {
  title: string
  value: string
  footer?: string
  loading?: boolean
  icon?: React.ReactNode
}

const InsightCard: React.FC<InsightCardProps> = ({ title, value, footer, loading, icon }) => (
  <div className="bg-genesis-surface p-6 rounded-2xl border border-genesis-border-subtle shadow-md flex flex-col justify-between group hover:shadow-lg transition-all duration-300">
    <div className="flex justify-between items-start">
      <h4 className="text-[11px] font-semibold text-genesis-muted uppercase tracking-wider">
        {title}
      </h4>
      {icon || (
        <Info className="w-4 h-4 text-genesis-subtle hover:text-genesis-primary cursor-pointer transition-colors" />
      )}
    </div>
    <div className="mt-3">
      {loading ? (
        <div className="h-9 flex items-center">
          <Loader2 className="w-6 h-6 animate-spin text-genesis-subtle" />
        </div>
      ) : (
        <h2 className="text-3xl font-bold text-genesis-dark tracking-tight leading-none">
          {value}
        </h2>
      )}
      {footer && <p className="text-xs text-genesis-medium mt-2 font-medium">{footer}</p>}
    </div>
  </div>
)

/**
 * Filter bar component.
 */
interface FilterBarProps {
  filters: {
    specialty?: SpecialtyType
    professional?: string
  }
  onFilterChange: (filters: { specialty?: SpecialtyType; professional?: string }) => void
}

const FilterBar: React.FC<FilterBarProps> = ({ filters, onFilterChange }) => {
  return (
    <div className="flex gap-3 flex-wrap">
      <select
        value={filters.specialty || ''}
        onChange={e =>
          onFilterChange({
            ...filters,
            specialty: (e.target.value as SpecialtyType) || undefined,
          })
        }
        className="px-4 py-2.5 bg-genesis-surface border border-genesis-border rounded-xl text-sm font-medium text-genesis-dark focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] outline-none"
      >
        <option value="">Todas Especialidades</option>
        <option value="medicina">Medicina</option>
        <option value="nutricao">Nutrição</option>
        <option value="psicologia">Psicologia</option>
      </select>
      <button className="flex items-center gap-2 px-4 py-2.5 bg-genesis-surface border border-genesis-border rounded-xl text-sm font-medium text-genesis-dark hover:bg-genesis-soft transition-colors shadow-sm">
        <Calendar className="w-4 h-4 text-genesis-medium" />
        Este Mês
      </button>
    </div>
  )
}

/**
 * Empty state component.
 */
const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div className="h-full flex flex-col items-center justify-center text-genesis-subtle">
    <FileText className="w-12 h-12 mb-3 text-genesis-subtle" />
    <p className="text-sm">{message}</p>
  </div>
)

/**
 * Main Reports page component.
 */
export const Reports: React.FC = () => {
  const { loading, demographics, procedureStats, metrics, filters, setFilters } = useReports()
  const [exporting, setExporting] = useState(false)

  // Share handler - uses Web Share API or clipboard fallback
  const handleShare = useCallback(async () => {
    const shareData = {
      title: 'Relatórios Clínicos - Clínica Genesis',
      text: `Relatório: ${metrics?.totalPatients || 0} pacientes, ${metrics?.appointmentsCount || 0} agendamentos, ${metrics?.completionRate || 0}% taxa de conclusão`,
      url: window.location.href,
    }

    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          toast.error('Erro ao compartilhar')
        }
      }
    } else {
      // Fallback: copy link to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href)
        toast.success('Link copiado para a área de transferência')
      } catch {
        toast.error('Erro ao copiar link')
      }
    }
  }, [metrics])

  // Handle export (async due to dynamic imports for bundle optimization)
  const handleExport = async () => {
    setExporting(true)
    try {
      await exportReportToPDF(
        {
          totalPatients: metrics?.totalPatients || 0,
          activePatients: metrics?.activePatients || 0,
          appointmentsCount: metrics?.appointmentsCount || 0,
          completionRate: metrics?.completionRate || 0,
          procedureStats,
          demographics,
        },
        'Clínica Genesis'
      )
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-8 animate-enter pb-12">
      {/* Header */}
      <div className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-genesis-dark tracking-tight leading-tight">
            Relatórios Clínicos
          </h1>
          <p className="text-genesis-muted text-sm mt-1">
            Análise demográfica e desempenho de procedimentos
          </p>
        </div>
        <div className="flex gap-3">
          <FilterBar
            filters={{
              specialty: filters.specialty,
              professional: filters.professional,
            }}
            onFilterChange={f =>
              setFilters({
                ...filters,
                specialty: f.specialty,
                professional: f.professional,
              })
            }
          />
          <button
            onClick={handleShare}
            className="p-2.5 bg-genesis-surface border border-genesis-border rounded-xl text-genesis-dark hover:bg-genesis-soft hover:scale-[1.02] active:scale-[0.98] transition-all shadow-sm"
            title="Compartilhar relatório"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2.5 bg-genesis-primary text-white rounded-xl text-sm font-medium hover:bg-genesis-primary-dark transition-colors shadow-lg shadow-genesis-primary/20 disabled:opacity-50"
          >
            {exporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Exportar PDF
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <InsightCard
          title="Total de Pacientes"
          value={metrics?.totalPatients?.toLocaleString('pt-BR') || '0'}
          footer="Base cadastrada"
          loading={loading}
          icon={<Users className="w-4 h-4 text-[#3B82F6]" />}
        />
        <InsightCard
          title="Pacientes Ativos"
          value={metrics?.activePatients?.toLocaleString('pt-BR') || '0'}
          footer="Últimos 6 meses"
          loading={loading}
          icon={<TrendingUp className="w-4 h-4 text-[#22C55E]" />}
        />
        <InsightCard
          title="Agendamentos"
          value={metrics?.appointmentsCount?.toLocaleString('pt-BR') || '0'}
          footer="Período selecionado"
          loading={loading}
          icon={<Calendar className="w-4 h-4 text-[#8B5CF6]" />}
        />
        <InsightCard
          title="Taxa de Conclusão"
          value={`${metrics?.completionRate || 0}%`}
          footer="Consultas finalizadas"
          loading={loading}
          icon={<CheckCircle className="w-4 h-4 text-[#F59E0B]" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Procedures Chart */}
        <div className="bg-genesis-surface p-8 rounded-3xl border border-genesis-border-subtle shadow-md h-[400px] flex flex-col">
          <h3 className="text-base font-semibold text-genesis-dark mb-6">
            Procedimentos Populares
          </h3>
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-genesis-subtle" />
            </div>
          ) : procedureStats.length === 0 ? (
            <EmptyState message="Nenhum procedimento registrado" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={procedureStats} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--color-genesis-muted)', fontSize: 13, fontWeight: 500 }}
                  width={120}
                />
                <Tooltip
                  cursor={{ fill: 'var(--color-genesis-hover)' }}
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    backgroundColor: 'var(--color-genesis-surface)',
                    color: 'var(--color-genesis-dark)',
                  }}
                  formatter={value =>
                    value !== undefined ? [`${value} agendamentos`, 'Total'] : ['', 'Total']
                  }
                />
                <Bar
                  dataKey="value"
                  fill="#4F46E5"
                  radius={[0, 4, 4, 0]}
                  barSize={32}
                  animationDuration={1000}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Demographics & Age Grid */}
        <div className="grid grid-rows-2 gap-6 h-[400px]">
          {/* Gender Distribution */}
          <div className="bg-genesis-surface p-6 rounded-3xl border border-genesis-border-subtle shadow-md flex items-center justify-between min-h-0">
            <div>
              <h3 className="text-base font-semibold text-genesis-dark mb-3">Gênero</h3>
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin text-genesis-subtle" />
              ) : demographics?.gender && demographics.gender.length > 0 ? (
                <div className="space-y-2">
                  {demographics.gender.map((g, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: g.color }} />
                      <span className="text-sm text-genesis-medium">
                        {g.name} ({g.value}%)
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-genesis-subtle">Sem dados</p>
              )}
            </div>
            <div className="w-40 h-40">
              {demographics?.gender && demographics.gender.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={demographics.gender}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {demographics.gender.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-genesis-hover" />
                </div>
              )}
            </div>
          </div>

          {/* Age Distribution */}
          <div className="bg-genesis-surface p-6 rounded-3xl border border-genesis-border-subtle shadow-md flex flex-col min-h-0">
            <h3 className="text-base font-semibold text-genesis-dark mb-4">
              Faixa Etária Predominante
            </h3>
            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-genesis-subtle" />
              </div>
            ) : demographics?.ageGroups && demographics.ageGroups.length > 0 ? (
              <div className="flex items-end justify-between h-full gap-4 px-4">
                {demographics.ageGroups.map((d, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 w-full group">
                    <div className="w-full bg-genesis-soft rounded-t-xl relative overflow-hidden h-24 flex items-end">
                      <div
                        className="w-full bg-genesis-primary/60 group-hover:bg-genesis-primary transition-colors duration-500 rounded-t-xl"
                        style={{ height: `${Math.max(d.value * 2, 10)}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-genesis-medium">{d.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="Sem dados de idade" />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Reports
