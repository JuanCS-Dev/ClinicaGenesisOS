/**
 * Patient Portal - Lab Results
 * ============================
 *
 * View and download laboratory exam results.
 *
 * @module pages/patient-portal/LabResults
 * @version 1.0.0
 */

import React, { useState } from 'react'
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
  AlertTriangle,
} from 'lucide-react'

// ============================================================================
// Types
// ============================================================================

type ResultStatus = 'ready' | 'pending' | 'partial'

interface LabResult {
  id: string
  name: string
  category: string
  date: string
  status: ResultStatus
  doctor: string
  hasAbnormal: boolean
  pdfUrl?: string
}

// ============================================================================
// Mock Data
// ============================================================================

const MOCK_RESULTS: LabResult[] = [
  {
    id: '1',
    name: 'Hemograma Completo',
    category: 'Hematologia',
    date: '2024-12-20',
    status: 'ready',
    doctor: 'Dr. João Silva',
    hasAbnormal: false,
  },
  {
    id: '2',
    name: 'Glicemia de Jejum',
    category: 'Bioquímica',
    date: '2024-12-20',
    status: 'ready',
    doctor: 'Dr. João Silva',
    hasAbnormal: true,
  },
  {
    id: '3',
    name: 'Perfil Lipídico',
    category: 'Bioquímica',
    date: '2024-12-18',
    status: 'ready',
    doctor: 'Dra. Maria Santos',
    hasAbnormal: false,
  },
  {
    id: '4',
    name: 'TSH e T4 Livre',
    category: 'Hormônios',
    date: '2024-12-22',
    status: 'pending',
    doctor: 'Dr. João Silva',
    hasAbnormal: false,
  },
  {
    id: '5',
    name: 'Urina Tipo I',
    category: 'Urinálise',
    date: '2024-12-22',
    status: 'partial',
    doctor: 'Dr. João Silva',
    hasAbnormal: false,
  },
]

// ============================================================================
// Helpers
// ============================================================================

const STATUS_CONFIG: Record<
  ResultStatus,
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
  partial: {
    label: 'Parcial',
    color: 'text-info bg-info-soft',
    icon: Clock,
  },
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

interface ResultCardProps {
  result: LabResult
}

const ResultCard: React.FC<ResultCardProps> = ({ result }) => {
  const statusConfig = STATUS_CONFIG[result.status]
  const StatusIcon = statusConfig.icon

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
          {result.hasAbnormal && (
            <div className="px-2.5 py-1 rounded-lg text-xs font-medium bg-danger-soft text-danger flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Atenção
            </div>
          )}
        </div>
        <span className="text-xs text-genesis-muted">{result.category}</span>
      </div>

      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
          <FlaskConical className="w-6 h-6 text-purple-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-genesis-dark truncate">{result.name}</p>
          <p className="text-sm text-genesis-muted flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(result.date)}
          </p>
        </div>
      </div>

      <p className="text-xs text-genesis-muted mb-4">Solicitado por: {result.doctor}</p>

      {result.status === 'ready' && (
        <div className="flex gap-2">
          <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-genesis-primary text-white text-sm font-medium hover:bg-genesis-primary-dark hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
            <Eye className="w-4 h-4" />
            Visualizar
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-genesis-border text-genesis-medium text-sm font-medium hover:bg-genesis-hover hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
            <Download className="w-4 h-4" />
          </button>
        </div>
      )}

      {result.status === 'pending' && (
        <div className="py-2 text-center text-sm text-genesis-muted">
          Resultado em processamento
        </div>
      )}

      {result.status === 'partial' && (
        <button className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-genesis-border text-genesis-medium text-sm font-medium hover:bg-genesis-hover hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
          <Eye className="w-4 h-4" />
          Ver Parcial
        </button>
      )}
    </div>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function PatientLabResults(): React.ReactElement {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'ready' | 'pending'>('all')

  const filteredResults = MOCK_RESULTS.filter(result => {
    if (filter === 'ready' && result.status !== 'ready') return false
    if (filter === 'pending' && result.status === 'ready') return false
    if (search && !result.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const readyCount = MOCK_RESULTS.filter(r => r.status === 'ready').length
  const pendingCount = MOCK_RESULTS.filter(r => r.status !== 'ready').length

  return (
    <div className="space-y-6 animate-enter pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-genesis-dark flex items-center gap-3">
          <FlaskConical className="w-7 h-7 text-purple-600" />
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
            <ResultCard key={result.id} result={result} />
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
      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-4 border border-purple-100 dark:border-purple-800">
        <div className="flex gap-3">
          <FileText className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
              Sobre seus resultados
            </p>
            <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
              Resultados marcados com "Atenção" indicam valores fora da faixa de referência.
              Consulte seu médico para interpretação.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PatientLabResults
