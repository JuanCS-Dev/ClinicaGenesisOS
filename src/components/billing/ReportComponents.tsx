/**
 * Report Components
 *
 * Reusable chart and stat components for billing reports.
 */

import React, { useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  PieChart,
  Building2,
} from 'lucide-react';
import type { GuiaFirestore, StatusGuia } from '@/types';

// =============================================================================
// CONSTANTS
// =============================================================================

export const STATUS_COLORS: Record<StatusGuia, string> = {
  rascunho: 'bg-gray-400',
  enviada: 'bg-blue-400',
  em_analise: 'bg-amber-400',
  autorizada: 'bg-emerald-400',
  glosada_parcial: 'bg-orange-400',
  glosada_total: 'bg-red-400',
  paga: 'bg-green-400',
  recurso: 'bg-purple-400',
};

export const STATUS_LABELS: Record<StatusGuia, string> = {
  rascunho: 'Rascunho',
  enviada: 'Enviada',
  em_analise: 'Em Análise',
  autorizada: 'Autorizada',
  glosada_parcial: 'Glosa Parcial',
  glosada_total: 'Glosa Total',
  paga: 'Paga',
  recurso: 'Em Recurso',
};

// =============================================================================
// HELPERS
// =============================================================================

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

// =============================================================================
// STAT CARD
// =============================================================================

export interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  trend?: { value: number; label: string };
  color: 'blue' | 'green' | 'red' | 'amber' | 'purple';
}

export function StatCard({ title, value, subtitle, icon: Icon, trend, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    red: 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    amber: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    purple: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  };

  return (
    <div className="p-5 bg-genesis-surface rounded-xl border border-genesis-border-subtle">
      <div className="flex items-start justify-between">
        <div className={`p-2.5 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 text-xs font-medium ${
              trend.value >= 0
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            {trend.value >= 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {trend.label}
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-genesis-dark">{value}</p>
        <p className="text-sm text-genesis-muted mt-0.5">{title}</p>
        {subtitle && <p className="text-xs text-genesis-subtle mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}

// =============================================================================
// STATUS CHART
// =============================================================================

export interface StatusChartProps {
  guiasPorStatus: Record<StatusGuia, number>;
  total: number;
}

export function StatusChart({ guiasPorStatus, total }: StatusChartProps) {
  const entries = Object.entries(guiasPorStatus)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]);

  if (total === 0) {
    return (
      <div className="text-center py-8 text-genesis-muted">
        <PieChart className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>Sem dados para exibir</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map(([status, count]) => {
        const percent = (count / total) * 100;
        return (
          <div key={status}>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-genesis-text">
                {STATUS_LABELS[status as StatusGuia]}
              </span>
              <span className="text-genesis-muted">
                {count} ({percent.toFixed(0)}%)
              </span>
            </div>
            <div className="h-2 bg-genesis-soft rounded-full overflow-hidden">
              <div
                className={`h-full ${STATUS_COLORS[status as StatusGuia]} rounded-full transition-all`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// =============================================================================
// OPERATOR BREAKDOWN
// =============================================================================

export interface OperatorBreakdownProps {
  guias: GuiaFirestore[];
}

export function OperatorBreakdown({ guias }: OperatorBreakdownProps) {
  const byOperator = useMemo(() => {
    const groups: Record<
      string,
      { nome: string; total: number; recebido: number; glosado: number; count: number }
    > = {};

    guias.forEach((guia) => {
      const key = guia.registroANS;
      if (!groups[key]) {
        groups[key] = {
          nome: guia.nomeOperadora,
          total: 0,
          recebido: 0,
          glosado: 0,
          count: 0,
        };
      }
      groups[key].total += guia.valorTotal;
      groups[key].recebido += guia.valorPago ?? 0;
      groups[key].glosado += guia.valorGlosado ?? 0;
      groups[key].count++;
    });

    return Object.entries(groups)
      .map(([ans, data]) => ({ ans, ...data }))
      .sort((a, b) => b.total - a.total);
  }, [guias]);

  if (byOperator.length === 0) {
    return (
      <div className="text-center py-8 text-genesis-muted">
        <Building2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>Sem dados de operadoras</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {byOperator.slice(0, 5).map((op) => (
        <div key={op.ans} className="p-3 bg-genesis-soft rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="font-medium text-genesis-dark">{op.nome}</span>
              <span className="text-xs text-genesis-muted ml-2">ANS: {op.ans}</span>
            </div>
            <span className="text-xs text-genesis-muted">
              {op.count} guia{op.count !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div>
              <span className="text-genesis-muted text-xs">Total</span>
              <p className="font-medium text-genesis-dark">{formatCurrency(op.total)}</p>
            </div>
            <div>
              <span className="text-genesis-muted text-xs">Recebido</span>
              <p className="font-medium text-green-600 dark:text-green-400">
                {formatCurrency(op.recebido)}
              </p>
            </div>
            <div>
              <span className="text-genesis-muted text-xs">Glosado</span>
              <p className="font-medium text-red-600 dark:text-red-400">
                {formatCurrency(op.glosado)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
