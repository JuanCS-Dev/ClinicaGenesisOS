/**
 * ReportsTab Component
 *
 * Tab for billing analytics and reports.
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Building2,
  Download,
  RefreshCw,
  ChevronDown,
  FileText,
  FileSpreadsheet,
  Printer,
} from 'lucide-react';
import type { GuiaFirestore, StatusGuia } from '@/types';
import {
  StatCard,
  StatusChart,
  OperatorBreakdown,
  STATUS_COLORS,
  STATUS_LABELS,
  formatCurrency,
} from './ReportComponents';
import { exportGuiasToCSV, exportGuiasToPDF } from '@/utils/export';

// =============================================================================
// TYPES
// =============================================================================

interface ReportsTabProps {
  guias: GuiaFirestore[];
  loading?: boolean;
  onRefresh?: () => void;
  onExport?: (format: 'pdf' | 'csv' | 'excel') => void;
}

interface DateRange {
  start: string;
  end: string;
}

interface Stats {
  totalGuias: number;
  valorTotal: number;
  valorRecebido: number;
  valorGlosado: number;
  valorPendente: number;
  taxaGlosa: number;
  taxaRecebimento: number;
  mediaValor: number;
  guiasPorStatus: Record<StatusGuia, number>;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const DATE_RANGE_PRESETS = [
  { label: 'Último mês', days: 30 },
  { label: 'Últimos 3 meses', days: 90 },
  { label: 'Último ano', days: 365 },
  { label: 'Tudo', days: 0 },
];

// =============================================================================
// HELPERS
// =============================================================================

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

function getDateRangeFromDays(days: number): DateRange {
  const end = new Date();
  const start = days > 0 ? new Date(end.getTime() - days * 24 * 60 * 60 * 1000) : new Date(0);
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
}

function calculateStats(guias: GuiaFirestore[]): Stats {
  const guiasPorStatus: Record<StatusGuia, number> = {
    rascunho: 0,
    enviada: 0,
    em_analise: 0,
    autorizada: 0,
    glosada_parcial: 0,
    glosada_total: 0,
    paga: 0,
    recurso: 0,
  };

  let valorTotal = 0;
  let valorRecebido = 0;
  let valorGlosado = 0;

  guias.forEach((guia) => {
    guiasPorStatus[guia.status]++;
    valorTotal += guia.valorTotal;
    valorRecebido += guia.valorPago ?? 0;
    valorGlosado += guia.valorGlosado ?? 0;
  });

  const valorPendente = valorTotal - valorRecebido - valorGlosado;
  const taxaGlosa = valorTotal > 0 ? valorGlosado / valorTotal : 0;
  const taxaRecebimento = valorTotal > 0 ? valorRecebido / valorTotal : 0;
  const mediaValor = guias.length > 0 ? valorTotal / guias.length : 0;

  return {
    totalGuias: guias.length,
    valorTotal,
    valorRecebido,
    valorGlosado,
    valorPendente,
    taxaGlosa,
    taxaRecebimento,
    mediaValor,
    guiasPorStatus,
  };
}

// =============================================================================
// COMPONENT
// =============================================================================

export function ReportsTab({ guias, loading = false, onRefresh, onExport }: ReportsTabProps) {
  const [dateRange, setDateRange] = useState<DateRange>(getDateRangeFromDays(30));
  const [showPresets, setShowPresets] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [selectedOperadora, setSelectedOperadora] = useState<string | null>(null);

  const operators = useMemo(() => {
    const unique = new Map<string, string>();
    guias.forEach((g) => unique.set(g.registroANS, g.nomeOperadora));
    return Array.from(unique.entries()).map(([ans, nome]) => ({ ans, nome }));
  }, [guias]);

  const filteredGuias = useMemo(() => {
    return guias.filter((guia) => {
      const guiaDate = new Date(guia.dataAtendimento);
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999);

      if (guiaDate < startDate || guiaDate > endDate) return false;
      if (selectedOperadora && guia.registroANS !== selectedOperadora) return false;
      return true;
    });
  }, [guias, dateRange, selectedOperadora]);

  const stats = useMemo(() => calculateStats(filteredGuias), [filteredGuias]);

  const applyPreset = (days: number) => {
    setDateRange(getDateRangeFromDays(days));
    setShowPresets(false);
  };

  const handleExport = useCallback(
    (format: 'csv' | 'pdf' | 'excel') => {
      setShowExportMenu(false);
      const dateStr = `${dateRange.start}_${dateRange.end}`;
      const filename = `relatorio_faturamento_${dateStr}`;

      if (format === 'csv' || format === 'excel') {
        exportGuiasToCSV(filteredGuias, filename);
      } else if (format === 'pdf') {
        exportGuiasToPDF(filteredGuias, {
          title: `Relatório de Faturamento - ${formatDate(dateRange.start)} a ${formatDate(dateRange.end)}`,
        });
      }

      if (onExport) {
        onExport(format === 'excel' ? 'excel' : format);
      }
    },
    [filteredGuias, dateRange, onExport]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-genesis-dark">Relatórios de Faturamento</h2>
          <p className="text-sm text-genesis-muted">Análise de guias e indicadores financeiros</p>
        </div>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={loading}
              className="p-2.5 text-genesis-muted hover:text-genesis-dark hover:bg-genesis-hover rounded-lg transition-colors disabled:opacity-50"
              title="Atualizar"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          )}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 px-4 py-2.5 bg-genesis-soft border border-genesis-border rounded-xl text-genesis-text hover:bg-genesis-hover transition-colors"
            >
              <Download className="w-4 h-4" />
              Exportar
              <ChevronDown className="w-4 h-4" />
            </button>
            {showExportMenu && (
              <div className="absolute right-0 z-10 mt-1 w-48 bg-genesis-surface border border-genesis-border rounded-lg shadow-lg overflow-hidden">
                <button
                  onClick={() => handleExport('csv')}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-sm text-genesis-text hover:bg-genesis-soft transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Exportar CSV
                </button>
                <button
                  onClick={() => handleExport('excel')}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-sm text-genesis-text hover:bg-genesis-soft transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4 text-green-600" />
                  Exportar Excel
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-sm text-genesis-text hover:bg-genesis-soft transition-colors"
                >
                  <Printer className="w-4 h-4 text-red-600" />
                  Imprimir / PDF
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-genesis-muted" />
          <div className="relative">
            <button
              onClick={() => setShowPresets(!showPresets)}
              className="flex items-center gap-2 px-3 py-2 bg-genesis-soft border border-genesis-border rounded-lg text-sm text-genesis-text hover:bg-genesis-hover transition-colors"
            >
              <span>
                {formatDate(dateRange.start)} - {formatDate(dateRange.end)}
              </span>
              <ChevronDown className="w-4 h-4" />
            </button>
            {showPresets && (
              <div className="absolute z-10 mt-1 w-48 bg-genesis-surface border border-genesis-border rounded-lg shadow-lg overflow-hidden">
                {DATE_RANGE_PRESETS.map((preset) => (
                  <button
                    key={preset.days}
                    onClick={() => applyPreset(preset.days)}
                    className="w-full px-4 py-2 text-left text-sm text-genesis-text hover:bg-genesis-soft transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-genesis-muted" />
          <select
            value={selectedOperadora || ''}
            onChange={(e) => setSelectedOperadora(e.target.value || null)}
            className="px-3 py-2 bg-genesis-soft border border-genesis-border rounded-lg text-sm text-genesis-text focus:ring-2 focus:ring-genesis-primary/20 focus:border-genesis-primary"
          >
            <option value="">Todas as operadoras</option>
            {operators.map((op) => (
              <option key={op.ans} value={op.ans}>
                {op.nome}
              </option>
            ))}
          </select>
        </div>

        <span className="text-sm text-genesis-muted">
          {filteredGuias.length} guia{filteredGuias.length !== 1 ? 's' : ''} encontrada
          {filteredGuias.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Valor Total Faturado"
          value={formatCurrency(stats.valorTotal)}
          subtitle={`${stats.totalGuias} guias`}
          icon={DollarSign}
          color="blue"
        />
        <StatCard
          title="Valor Recebido"
          value={formatCurrency(stats.valorRecebido)}
          subtitle={formatPercent(stats.taxaRecebimento)}
          icon={CheckCircle2}
          color="green"
        />
        <StatCard
          title="Valor Glosado"
          value={formatCurrency(stats.valorGlosado)}
          subtitle={formatPercent(stats.taxaGlosa)}
          icon={AlertTriangle}
          color="red"
        />
        <StatCard
          title="Valor Pendente"
          value={formatCurrency(stats.valorPendente)}
          subtitle="Aguardando pagamento"
          icon={Clock}
          color="amber"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-genesis-surface rounded-xl border border-genesis-border-subtle p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-genesis-muted" />
            <h3 className="font-semibold text-genesis-dark">Distribuição por Status</h3>
          </div>
          <StatusChart guiasPorStatus={stats.guiasPorStatus} total={stats.totalGuias} />
        </div>

        <div className="bg-genesis-surface rounded-xl border border-genesis-border-subtle p-6">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-genesis-muted" />
            <h3 className="font-semibold text-genesis-dark">Faturamento por Operadora</h3>
          </div>
          <OperatorBreakdown guias={filteredGuias} />
        </div>
      </div>

      {/* KPIs Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-genesis-surface rounded-xl border border-genesis-border-subtle">
          <div className="flex items-center gap-2 text-genesis-muted mb-3">
            <FileText className="w-4 h-4" />
            <span className="text-sm font-medium">Ticket Médio</span>
          </div>
          <p className="text-2xl font-bold text-genesis-dark">{formatCurrency(stats.mediaValor)}</p>
          <p className="text-xs text-genesis-subtle mt-1">Por guia emitida</p>
        </div>

        <div className="p-5 bg-genesis-surface rounded-xl border border-genesis-border-subtle">
          <div className="flex items-center gap-2 text-genesis-muted mb-3">
            <TrendingDown className="w-4 h-4" />
            <span className="text-sm font-medium">Taxa de Glosa</span>
          </div>
          <p
            className={`text-2xl font-bold ${
              stats.taxaGlosa > 0.05
                ? 'text-red-600 dark:text-red-400'
                : 'text-green-600 dark:text-green-400'
            }`}
          >
            {formatPercent(stats.taxaGlosa)}
          </p>
          <p className="text-xs text-genesis-subtle mt-1">
            {stats.taxaGlosa > 0.05 ? 'Acima do ideal (5%)' : 'Dentro do esperado'}
          </p>
        </div>

        <div className="p-5 bg-genesis-surface rounded-xl border border-genesis-border-subtle">
          <div className="flex items-center gap-2 text-genesis-muted mb-3">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">Taxa de Recebimento</span>
          </div>
          <p
            className={`text-2xl font-bold ${
              stats.taxaRecebimento > 0.8
                ? 'text-green-600 dark:text-green-400'
                : 'text-amber-600 dark:text-amber-400'
            }`}
          >
            {formatPercent(stats.taxaRecebimento)}
          </p>
          <p className="text-xs text-genesis-subtle mt-1">
            {stats.taxaRecebimento > 0.8 ? 'Ótimo desempenho' : 'Pode melhorar'}
          </p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-genesis-surface rounded-xl border border-genesis-border-subtle p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-genesis-muted" />
          <h3 className="font-semibold text-genesis-dark">Guias Recentes</h3>
        </div>

        {filteredGuias.length === 0 ? (
          <div className="text-center py-8 text-genesis-muted">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Nenhuma guia no período selecionado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-genesis-border">
                  <th className="text-left py-3 text-genesis-muted font-medium">Guia</th>
                  <th className="text-left py-3 text-genesis-muted font-medium">Paciente</th>
                  <th className="text-left py-3 text-genesis-muted font-medium">Operadora</th>
                  <th className="text-left py-3 text-genesis-muted font-medium">Data</th>
                  <th className="text-right py-3 text-genesis-muted font-medium">Valor</th>
                  <th className="text-right py-3 text-genesis-muted font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredGuias.slice(0, 10).map((guia) => (
                  <tr
                    key={guia.id}
                    className="border-b border-genesis-border-subtle last:border-0 hover:bg-genesis-soft/50"
                  >
                    <td className="py-3 font-mono text-genesis-dark">{guia.numeroGuiaPrestador}</td>
                    <td className="py-3 text-genesis-dark">
                      {guia.dadosGuia.dadosBeneficiario.nomeBeneficiario}
                    </td>
                    <td className="py-3 text-genesis-muted">{guia.nomeOperadora}</td>
                    <td className="py-3 text-genesis-muted">{formatDate(guia.dataAtendimento)}</td>
                    <td className="py-3 text-right font-medium text-genesis-dark">
                      {formatCurrency(guia.valorTotal)}
                    </td>
                    <td className="py-3 text-right">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${STATUS_COLORS[guia.status].replace('bg-', 'bg-opacity-20 ')} ${STATUS_COLORS[guia.status].replace('bg-', 'text-').replace('-400', '-700')}`}
                      >
                        {STATUS_LABELS[guia.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
