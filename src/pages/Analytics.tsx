/**
 * Analytics Page
 * ==============
 *
 * Comprehensive analytics dashboard combining Financial Wellness
 * and Patient Insights in one unified view.
 *
 * Inspired by athenahealth Executive Summary and Epic MyChart Central.
 *
 * @module pages/Analytics
 * @version 1.0.0
 */

import React, { useState, useCallback } from 'react'
import { BarChart3, TrendingUp, Heart, Download, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { FinancialWellness, PatientInsights } from '../components/analytics'

type AnalyticsTab = 'financial' | 'patients'

/**
 * Analytics page component.
 */
export const Analytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('financial')
  const [dateRange, setDateRange] = useState('month')
  const [refreshKey, setRefreshKey] = useState(0)

  // Refresh handler - forces re-render of child components
  const handleRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1)
    toast.success('Dados atualizados')
  }, [])

  // Export handler - analytics export coming soon
  const handleExport = useCallback(() => {
    toast.info('Exportação de analytics em desenvolvimento')
  }, [])

  const tabs = [
    {
      id: 'financial' as const,
      label: 'Saúde Financeira',
      icon: TrendingUp,
      description: 'Métricas financeiras, projeções e inadimplência',
    },
    {
      id: 'patients' as const,
      label: 'Insights de Pacientes',
      icon: Heart,
      description: 'Retenção, NPS e engajamento',
    },
  ]

  return (
    <div className="space-y-8 animate-enter pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-genesis-dark tracking-tight flex items-center gap-3">
            <BarChart3 className="w-7 h-7 text-genesis-primary" />
            Analytics & Insights
          </h1>
          <p className="text-genesis-medium text-sm mt-1">
            Inteligência de negócios para tomada de decisão
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Date Range Selector */}
          <div className="flex items-center gap-2 bg-genesis-surface border border-genesis-border rounded-xl p-1">
            {['week', 'month', 'quarter', 'year'].map(range => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  dateRange === range
                    ? 'bg-genesis-primary text-white'
                    : 'text-genesis-muted hover:text-genesis-dark'
                }`}
              >
                {range === 'week' && 'Semana'}
                {range === 'month' && 'Mês'}
                {range === 'quarter' && 'Trimestre'}
                {range === 'year' && 'Ano'}
              </button>
            ))}
          </div>

          {/* Actions */}
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2.5 bg-genesis-surface border border-genesis-border rounded-xl text-sm font-medium text-genesis-dark hover:bg-genesis-soft hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Atualizar
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 bg-genesis-surface border border-genesis-border rounded-xl text-sm font-medium text-genesis-dark hover:bg-genesis-soft hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-4 border-b border-genesis-border">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-genesis-primary text-genesis-primary'
                : 'border-transparent text-genesis-muted hover:text-genesis-dark'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'financial' && <FinancialWellness key={`fin-${refreshKey}`} />}
        {activeTab === 'patients' && <PatientInsights key={`pat-${refreshKey}`} />}
      </div>
    </div>
  )
}

export default Analytics
