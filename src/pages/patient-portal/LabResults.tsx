/**
 * Patient Portal - Lab Results
 * ============================
 *
 * View and download laboratory exam results.
 *
 * @module pages/patient-portal/LabResults
 * @version 2.0.0
 */

import React, { useState, useMemo } from 'react'
import {
  FlaskConical,
  Download,
  Eye,
  Calendar,
  FileText,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  User,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { useLabResults } from '../../hooks/useLabResults'
import { useClinicContext } from '../../contexts/ClinicContext'
import { Skeleton } from '../../components/ui/Skeleton'
import { downloadLabResultPDF } from '../../services/pdf-generation.service'
import type { LabResult, LabExamType } from '@/types'

// ============================================================================
// Helpers
// ============================================================================

const STATUS_CONFIG: Record<
  LabResult['status'],
  { label: string; color: string; icon: React.ElementType }
> = {
  ready: {
    label: 'Disponível',
    color: 'text-success bg-success-soft',
    icon: CheckCircle2,
  },
  pending: {
    label: 'Aguardando',
    color: 'text-warning bg-warning-soft',
    icon: Clock,
  },
  viewed: {
    label: 'Visualizado',
    color: 'text-info bg-info-soft',
    icon: CheckCircle2,
  },
}

const EXAM_TYPE_LABELS: Record<LabExamType, string> = {
  hemograma: 'Hematologia',
  bioquimica: 'Bioquímica',
  hormonal: 'Hormônios',
  urina: 'Urinálise',
  imagem: 'Imagem',
  outros: 'Outros',
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

// ============================================================================
// Components
// ============================================================================

function ResultCardSkeleton() {
  return (
    <div className="bg-genesis-surface rounded-2xl border border-genesis-border p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-20 rounded-lg" />
          <Skeleton className="h-6 w-16 rounded-lg" />
        </div>
      </div>
      <div className="flex items-center gap-3 mb-3">
        <Skeleton variant="rect" className="w-12 h-12 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <Skeleton className="h-4 w-36 mb-4" />
      <div className="flex gap-2">
        <Skeleton className="h-10 flex-1 rounded-xl" />
        <Skeleton className="h-10 w-12 rounded-xl" />
      </div>
    </div>
  )
}

interface ResultCardProps {
  result: LabResult
  onView: (result: LabResult) => void
  onDownload: (result: LabResult) => void
  onDownloadSummary: (result: LabResult) => Promise<void>
}

const ResultCard: React.FC<ResultCardProps> = ({ result, onView, onDownload, onDownloadSummary }) => {
  const [downloading, setDownloading] = useState(false)
  const statusConfig = STATUS_CONFIG[result.status] || STATUS_CONFIG.pending
  const StatusIcon = statusConfig.icon
  const categoryLabel = EXAM_TYPE_LABELS[result.examType] || result.examType

  const handleDownloadSummary = async () => {
    setDownloading(true)
    try {
      await onDownloadSummary(result)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="bg-genesis-surface rounded-2xl border border-genesis-border p-4 hover:shadow-lg transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 ${statusConfig.color}`}
          >
            <StatusIcon className="w-3 h-3" />
            {statusConfig.label}
          </div>
        </div>
        <span className="text-xs text-genesis-muted">{categoryLabel}</span>
      </div>

      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-xl bg-clinical-soft flex items-center justify-center">
          <FlaskConical className="w-6 h-6 text-clinical-start" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-genesis-dark truncate">{result.examName}</p>
          <p className="text-sm text-genesis-muted flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(result.requestedAt)}
          </p>
        </div>
      </div>

      <p className="text-xs text-genesis-muted mb-4 flex items-center gap-1">
        <User className="w-3 h-3" />
        Solicitado por: {result.requestedByName || 'Médico'}
      </p>

      {(result.status === 'ready' || result.status === 'viewed') && (
        <div className="flex gap-2">
          {result.fileUrl ? (
            <>
              <button
                onClick={() => onView(result)}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-genesis-primary text-white text-sm font-medium hover:bg-genesis-primary-dark hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                <Eye className="w-4 h-4" />
                Visualizar
              </button>
              <button
                onClick={() => onDownload(result)}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-genesis-border text-genesis-medium text-sm font-medium hover:bg-genesis-hover hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                <Download className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              onClick={handleDownloadSummary}
              disabled={downloading}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-genesis-primary text-white text-sm font-medium hover:bg-genesis-primary-dark hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50"
            >
              {downloading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {downloading ? 'Gerando...' : 'Baixar Resumo'}
            </button>
          )}
        </div>
      )}

      {result.status === 'pending' && (
        <div className="py-2 text-center text-sm text-genesis-muted">
          Resultado em processamento
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function PatientLabResults(): React.ReactElement {
  const { results, pendingResults, readyResults, loading, markAsViewed } = useLabResults()
  const { clinic } = useClinicContext()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'ready' | 'pending'>('all')

  const handleDownloadSummary = async (result: LabResult) => {
    try {
      await downloadLabResultPDF(
        result,
        clinic?.name || 'Clinica Genesis',
        clinic?.address
      )
      toast.success('PDF gerado com sucesso!')
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast.error('Erro ao gerar PDF. Tente novamente.')
    }
  }

  const filteredResults = useMemo(() => {
    let filtered = results

    if (filter === 'ready') {
      filtered = filtered.filter(r => r.status === 'ready' || r.status === 'viewed')
    } else if (filter === 'pending') {
      filtered = filtered.filter(r => r.status === 'pending')
    }

    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(
        r =>
          r.examName.toLowerCase().includes(searchLower) ||
          r.requestedByName?.toLowerCase().includes(searchLower)
      )
    }

    // Sort by date (most recent first)
    return filtered.sort(
      (a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
    )
  }, [results, filter, search])

  const readyCount = readyResults.length
  const pendingCount = pendingResults.length

  const handleView = async (result: LabResult) => {
    // Mark as viewed if not already
    if (result.status === 'ready') {
      try {
        await markAsViewed(result.id)
      } catch (error) {
        console.error('Error marking as viewed:', error)
      }
    }
    // Open PDF or viewer
    if (result.fileUrl) {
      window.open(result.fileUrl, '_blank')
    }
  }

  const handleDownload = (result: LabResult) => {
    if (result.fileUrl) {
      const link = document.createElement('a')
      link.href = result.fileUrl
      link.download = result.fileName || `${result.examName}.pdf`
      link.click()
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-enter pb-8">
        {/* Header Skeleton */}
        <div>
          <div className="flex items-center gap-3">
            <FlaskConical className="w-7 h-7 text-clinical-start" />
            <Skeleton className="h-8 w-40" />
          </div>
          <Skeleton className="h-4 w-48 mt-2" />
        </div>

        {/* Search/Filter Skeleton */}
        <div className="flex flex-col md:flex-row gap-4">
          <Skeleton className="h-10 flex-1 rounded-xl" />
          <Skeleton className="h-10 w-64 rounded-xl" />
        </div>

        {/* Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ResultCardSkeleton />
          <ResultCardSkeleton />
          <ResultCardSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-enter pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-genesis-dark flex items-center gap-3">
          <FlaskConical className="w-7 h-7 text-clinical-start" />
          Meus Exames
        </h1>
        <p className="text-genesis-muted text-sm mt-1">
          {readyCount} resultado{readyCount !== 1 ? 's' : ''} disponíve
          {readyCount !== 1 ? 'is' : 'l'} • {pendingCount} pendente
          {pendingCount !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-genesis-muted" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar exame..."
            className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-genesis-border bg-genesis-surface text-genesis-dark placeholder:text-genesis-muted focus:outline-none focus:ring-2 focus:ring-genesis-primary focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-genesis-muted" />
          <div className="flex bg-genesis-soft rounded-xl p-1">
            {[
              { value: 'all', label: 'Todos' },
              { value: 'ready', label: 'Disponíveis' },
              { value: 'pending', label: 'Pendentes' },
            ].map(option => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value as typeof filter)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filter === option.value
                    ? 'bg-genesis-surface text-genesis-dark shadow-sm'
                    : 'text-genesis-muted hover:text-genesis-dark'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Grid */}
      {filteredResults.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResults.map(result => (
            <ResultCard
              key={result.id}
              result={result}
              onView={handleView}
              onDownload={handleDownload}
              onDownloadSummary={handleDownloadSummary}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-genesis-surface rounded-2xl border border-genesis-border">
          <FlaskConical className="w-12 h-12 text-genesis-muted mx-auto mb-4" />
          <p className="text-genesis-dark font-medium">Nenhum exame encontrado</p>
          <p className="text-genesis-muted text-sm mt-1">
            {search ? 'Tente outra busca' : 'Nenhum resultado de exame disponível'}
          </p>
        </div>
      )}

      {/* Info Card */}
      <div className="bg-clinical-soft rounded-2xl p-4 border border-clinical-muted/20">
        <div className="flex gap-3">
          <FileText className="w-5 h-5 text-clinical-start flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-genesis-dark">
              Sobre seus resultados
            </p>
            <p className="text-sm text-genesis-medium mt-1">
              Os resultados ficam disponíveis para download após liberação do laboratório. Consulte
              seu médico para interpretação dos valores.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PatientLabResults
