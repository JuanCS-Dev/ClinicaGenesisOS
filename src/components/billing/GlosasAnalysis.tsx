/**
 * GlosasAnalysis Component
 *
 * Detailed analysis of billing denials (glosas) with trends and insights.
 *
 * @module components/billing/GlosasAnalysis
 */

import React, { useMemo } from 'react';
import {
  AlertTriangle,
  TrendingUp,
  Clock,
  BarChart3,
  AlertCircle,
  CheckCircle2,
  XCircle,
  FileText,
  Calendar,
} from 'lucide-react';
import type { GlosaFirestore, GlosaStats } from '@/services/firestore/glosa.service';
import { formatCurrency } from './ReportComponents';

// =============================================================================
// TYPES
// =============================================================================

interface GlosasAnalysisProps {
  glosas: GlosaFirestore[];
  stats: GlosaStats;
  loading?: boolean;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const MOTIVO_LABELS: Record<string, string> = {
  A1: 'Guia não preenchida corretamente',
  A2: 'Procedimento não coberto',
  A3: 'Procedimento já realizado',
  A4: 'Beneficiário sem cobertura',
  A5: 'Carência não cumprida',
  A6: 'Cobrança em duplicidade',
  A7: 'Valor acima do contratado',
  A8: 'Ausência de autorização prévia',
  A9: 'Documentação incompleta',
  A10: 'Prazo de envio excedido',
  B1: 'CID incompatível',
  B2: 'Quantidade acima do permitido',
  C1: 'Profissional não cadastrado',
  outros: 'Outros motivos',
};

const STATUS_STYLES = {
  pendente: {
    bg: 'bg-amber-50 dark:bg-amber-900/30',
    text: 'text-amber-700 dark:text-amber-400',
    icon: Clock,
  },
  em_recurso: {
    bg: 'bg-blue-50 dark:bg-blue-900/30',
    text: 'text-blue-700 dark:text-blue-400',
    icon: FileText,
  },
  resolvida: {
    bg: 'bg-green-50 dark:bg-green-900/30',
    text: 'text-green-700 dark:text-green-400',
    icon: CheckCircle2,
  },
};

// =============================================================================
// HELPERS
// =============================================================================

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

function getDaysUntilDeadline(prazoRecurso: string): number {
  const prazo = new Date(prazoRecurso);
  const today = new Date();
  return Math.ceil((prazo.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

// =============================================================================
// SUBCOMPONENTS
// =============================================================================

interface StatBoxProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  color: 'amber' | 'blue' | 'green' | 'red';
}

function StatBox({ title, value, subtitle, icon: Icon, color }: StatBoxProps) {
  const colorClasses = {
    amber: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    blue: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    red: 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  };

  return (
    <div className="p-4 bg-genesis-surface rounded-xl border border-genesis-border-subtle">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-genesis-dark">{value}</p>
          <p className="text-sm text-genesis-muted">{title}</p>
          {subtitle && <p className="text-xs text-genesis-subtle">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function GlosasAnalysis({ glosas, stats, loading = false }: GlosasAnalysisProps) {
  // Group glosas by deadline urgency
  const urgentGlosas = useMemo(() => {
    return glosas
      .filter((g) => g.status === 'pendente')
      .map((g) => ({
        ...g,
        diasRestantes: getDaysUntilDeadline(g.prazoRecurso),
      }))
      .filter((g) => g.diasRestantes <= 7 && g.diasRestantes >= 0)
      .sort((a, b) => a.diasRestantes - b.diasRestantes);
  }, [glosas]);

  // Group by operadora
  const byOperadora = useMemo(() => {
    const groups: Record<string, { count: number; valor: number }> = {};
    glosas.forEach((g) => {
      if (!groups[g.operadoraId]) {
        groups[g.operadoraId] = { count: 0, valor: 0 };
      }
      groups[g.operadoraId].count++;
      groups[g.operadoraId].valor += g.valorGlosado;
    });
    return Object.entries(groups)
      .map(([operadora, data]) => ({ operadora, ...data }))
      .sort((a, b) => b.valor - a.valor);
  }, [glosas]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-genesis-soft rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-genesis-soft rounded-xl" />
          <div className="h-64 bg-genesis-soft rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-genesis-dark flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Análise de Glosas
          </h3>
          <p className="text-sm text-genesis-muted">
            Visão detalhada das negativas de pagamento
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatBox
          title="Total de Glosas"
          value={stats.totalGlosas}
          icon={AlertTriangle}
          color="amber"
        />
        <StatBox
          title="Valor Glosado"
          value={formatCurrency(stats.valorTotalGlosado)}
          icon={XCircle}
          color="red"
        />
        <StatBox
          title="Valor Recuperado"
          value={formatCurrency(stats.valorRecuperado)}
          subtitle={`${formatPercent(stats.taxaRecuperacao)} do total`}
          icon={TrendingUp}
          color="green"
        />
        <StatBox
          title="Prazo Próximo"
          value={stats.glosasProximoPrazo}
          subtitle="Próximos 7 dias"
          icon={Clock}
          color="blue"
        />
      </div>

      {/* Status Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(stats.glosasPerStatus).map(([status, count]) => {
          const style = STATUS_STYLES[status as keyof typeof STATUS_STYLES];
          const Icon = style?.icon || FileText;
          const percent = stats.totalGlosas > 0 ? (count / stats.totalGlosas) * 100 : 0;

          return (
            <div
              key={status}
              className={`p-4 rounded-xl border border-genesis-border-subtle ${style?.bg}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={`w-5 h-5 ${style?.text}`} />
                  <span className={`font-medium capitalize ${style?.text}`}>
                    {status.replace('_', ' ')}
                  </span>
                </div>
                <span className="text-lg font-bold text-genesis-dark">{count}</span>
              </div>
              <div className="mt-2 h-2 bg-genesis-soft/50 rounded-full overflow-hidden">
                <div
                  className={`h-full ${style?.text.replace('text-', 'bg-').replace('-700', '-400').replace('-400', '-500')} rounded-full`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Principais Motivos */}
        <div className="bg-genesis-surface rounded-xl border border-genesis-border-subtle p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-genesis-muted" />
            <h4 className="font-semibold text-genesis-dark">Principais Motivos de Glosa</h4>
          </div>

          {stats.principaisMotivos.length === 0 ? (
            <div className="text-center py-8 text-genesis-muted">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Nenhuma glosa encontrada</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.principaisMotivos.slice(0, 5).map((item) => {
                const maxValor = stats.principaisMotivos[0]?.valor || 1;
                const percent = (item.valor / maxValor) * 100;

                return (
                  <div key={item.motivo}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-genesis-text truncate" title={MOTIVO_LABELS[item.motivo] || item.motivo}>
                        {MOTIVO_LABELS[item.motivo] || item.motivo}
                      </span>
                      <span className="text-genesis-muted ml-2 shrink-0">
                        {item.quantidade}x • {formatCurrency(item.valor)}
                      </span>
                    </div>
                    <div className="h-2 bg-genesis-soft rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-400 rounded-full transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Prazos Urgentes */}
        <div className="bg-genesis-surface rounded-xl border border-genesis-border-subtle p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <h4 className="font-semibold text-genesis-dark">Prazos de Recurso Próximos</h4>
          </div>

          {urgentGlosas.length === 0 ? (
            <div className="text-center py-8 text-genesis-muted">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-500 opacity-50" />
              <p>Nenhum prazo próximo</p>
            </div>
          ) : (
            <div className="space-y-2">
              {urgentGlosas.slice(0, 5).map((glosa) => (
                <div
                  key={glosa.id}
                  className={`p-3 rounded-lg border ${
                    glosa.diasRestantes <= 3
                      ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                      : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-genesis-dark text-sm">
                        Guia {glosa.numeroGuiaPrestador}
                      </p>
                      <p className="text-xs text-genesis-muted">
                        {formatCurrency(glosa.valorGlosado)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div
                        className={`flex items-center gap-1 text-sm font-medium ${
                          glosa.diasRestantes <= 3
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        <Calendar className="w-4 h-4" />
                        {glosa.diasRestantes === 0
                          ? 'Hoje!'
                          : glosa.diasRestantes === 1
                            ? '1 dia'
                            : `${glosa.diasRestantes} dias`}
                      </div>
                      <p className="text-xs text-genesis-muted">{glosa.prazoRecurso}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Glosas por Operadora */}
      {byOperadora.length > 0 && (
        <div className="bg-genesis-surface rounded-xl border border-genesis-border-subtle p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-genesis-muted" />
            <h4 className="font-semibold text-genesis-dark">Glosas por Operadora</h4>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-genesis-border">
                  <th className="text-left py-3 text-genesis-muted font-medium">Operadora (ANS)</th>
                  <th className="text-right py-3 text-genesis-muted font-medium">Qtd Glosas</th>
                  <th className="text-right py-3 text-genesis-muted font-medium">Valor Total</th>
                  <th className="text-right py-3 text-genesis-muted font-medium">% do Total</th>
                </tr>
              </thead>
              <tbody>
                {byOperadora.slice(0, 5).map((op) => {
                  const percent =
                    stats.valorTotalGlosado > 0
                      ? (op.valor / stats.valorTotalGlosado) * 100
                      : 0;

                  return (
                    <tr
                      key={op.operadora}
                      className="border-b border-genesis-border-subtle last:border-0"
                    >
                      <td className="py-3 font-mono text-genesis-dark">{op.operadora}</td>
                      <td className="py-3 text-right text-genesis-dark">{op.count}</td>
                      <td className="py-3 text-right font-medium text-red-600 dark:text-red-400">
                        {formatCurrency(op.valor)}
                      </td>
                      <td className="py-3 text-right text-genesis-muted">
                        {formatPercent(percent)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
