/**
 * Analytics Page
 * ==============
 *
 * Comprehensive analytics dashboard combining Financial Wellness
 * and Patient Insights in one unified view.
 *
 * OPTIMIZED: Real export functionality with lazy-loaded Excel/PDF.
 *
 * @module pages/Analytics
 * @version 2.0.0
 */

import React, { useState, useCallback } from 'react'
import {
  BarChart3,
  TrendingUp,
  Heart,
  Download,
  RefreshCw,
  FileSpreadsheet,
  FileText,
} from 'lucide-react'
import { toast } from 'sonner'
import { FinancialWellness, PatientInsights } from '../components/analytics'
import { useFinancialWellness } from '../hooks/useFinancialWellness'
import { usePatientInsights } from '../hooks/usePatientInsights'
import { exportAnalytics, type ExportFormat } from '../services/analytics-export.service'

type AnalyticsTab = 'financial' | 'patients'

/**
 * Analytics page component.
 */
export const Analytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('financial')
  const [dateRange, setDateRange] = useState('month')
  const [refreshKey, setRefreshKey] = useState(0)
  const [exporting, setExporting] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)

  // Get data for export
  const financialData = useFinancialWellness()
  const patientData = usePatientInsights()

  // Date range label for export
  const dateRangeLabels: Record<string, string> = {
    week: 'Última Semana',
    month: 'Último Mês',
    quarter: 'Último Trimestre',
    year: 'Último Ano',
  }
  const dateRangeLabel = dateRangeLabels[dateRange] || 'Período Personalizado'

  // Refresh handler - forces re-render of child components
  const handleRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1)
    toast.success('Dados atualizados')
  }, [])

  // Export handler - real analytics export
  const handleExport = useCallback(
    async (format: ExportFormat) => {
      setExporting(true)
      setShowExportMenu(false)

      try {
        await exportAnalytics(
          {
            financial: financialData,
            patients: patientData,
            dateRange: dateRangeLabel,
            generatedAt: new Date(),
          },
          format
        )

        toast.success(`Relatório exportado em ${format.toUpperCase()}`)
      } catch (error) {
        console.error('Export error:', error)
        toast.error('Erro ao exportar relatório')
      } finally {
        setExporting(false)
      }
    },
    [financialData, patientData, dateRangeLabel]
  )

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
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={exporting || financialData.loading || patientData.loading}
              className="flex items-center gap-2 px-4 py-2.5 bg-genesis-surface border border-genesis-border rounded-xl text-sm font-medium text-genesis-dark hover:bg-genesis-soft hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exporting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {exporting ? 'Exportando...' : 'Exportar'}
            </button>

            {/* Export Menu Dropdown */}
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-genesis-surface border border-genesis-border rounded-xl shadow-lg z-50 py-1 animate-in fade-in zoom-in-95">
                <button
                  onClick={() => handleExport('xlsx')}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-genesis-dark hover:bg-genesis-soft transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  Excel (.xlsx)
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-genesis-dark hover:bg-genesis-soft transition-colors"
                >
                  <FileText className="w-4 h-4 text-red-600" />
                  PDF (.pdf)
                </button>
              </div>
            )}
          </div>
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
