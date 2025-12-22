/**
 * Financial Wellness Dashboard Component
 * ======================================
 *
 * Comprehensive financial health visualization.
 * Inspired by Healthie and athenahealth Executive Summary.
 *
 * @module components/analytics/FinancialWellness
 * @version 1.0.0
 */

import React from 'react';
import {
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Target,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useFinancialWellness } from '../../hooks/useFinancialWellness';
import { formatCurrency } from '../../types';

// ============================================================================
// Sub-Components
// ============================================================================

interface HealthScoreGaugeProps {
  score: number;
  status: 'excellent' | 'good' | 'attention' | 'critical';
}

const HealthScoreGauge: React.FC<HealthScoreGaugeProps> = ({ score, status }) => {
  const statusColors = {
    excellent: { ring: 'stroke-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700' },
    good: { ring: 'stroke-blue-500', bg: 'bg-blue-50', text: 'text-blue-700' },
    attention: { ring: 'stroke-amber-500', bg: 'bg-amber-50', text: 'text-amber-700' },
    critical: { ring: 'stroke-red-500', bg: 'bg-red-50', text: 'text-red-700' },
  };

  const statusLabels = {
    excellent: 'Excelente',
    good: 'Bom',
    attention: 'Atenção',
    critical: 'Crítico',
  };

  const colors = statusColors[status];
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="var(--color-genesis-border)"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            className={colors.ring}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-genesis-dark">{score}</span>
          <span className="text-xs text-genesis-muted">/100</span>
        </div>
      </div>
      <div className={`mt-3 px-3 py-1 rounded-full ${colors.bg}`}>
        <span className={`text-sm font-medium ${colors.text}`}>{statusLabels[status]}</span>
      </div>
    </div>
  );
};

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'amber' | 'red' | 'purple';
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, subtitle, trend, icon, color }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="bg-genesis-surface rounded-xl border border-genesis-border-subtle p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className={`p-2 rounded-lg ${colors[color]}`}>{icon}</div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-sm ${trend >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {trend >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-genesis-dark">{value}</p>
        <p className="text-sm text-genesis-muted">{title}</p>
        {subtitle && <p className="text-xs text-genesis-subtle mt-1">{subtitle}</p>}
      </div>
    </div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

export const FinancialWellness: React.FC = () => {
  const { procedureMetrics, delinquency, projection, yoyComparison, healthScore, loading } =
    useFinancialWellness();

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-genesis-border rounded" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-genesis-border rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-genesis-dark flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-genesis-primary" />
            Saúde Financeira
          </h2>
          <p className="text-sm text-genesis-muted mt-1">
            Métricas avançadas e projeções de receita
          </p>
        </div>
      </div>

      {/* Health Score + Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Health Score Card */}
        <div className="lg:col-span-1 bg-genesis-surface rounded-2xl border border-genesis-border-subtle p-6">
          <h3 className="text-sm font-medium text-genesis-muted mb-4 text-center">
            Score de Saúde
          </h3>
          <HealthScoreGauge score={healthScore.overall} status={healthScore.status} />

          {/* Component breakdown */}
          <div className="mt-6 space-y-2">
            {Object.entries(healthScore.components).map(([key, value]) => {
              const labels = {
                cashFlow: 'Fluxo de Caixa',
                profitability: 'Lucratividade',
                collections: 'Recebimentos',
                growth: 'Crescimento',
              };
              return (
                <div key={key} className="flex items-center justify-between text-sm">
                  <span className="text-genesis-muted">{labels[key as keyof typeof labels]}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-genesis-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-genesis-primary rounded-full transition-all"
                        style={{ width: `${value}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-genesis-text w-8">{value}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="lg:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            title="Projeção Mensal"
            value={formatCurrency(projection.projectedMonth)}
            subtitle={`Crescimento de ${projection.growthRate}%`}
            trend={projection.growthRate}
            icon={<TrendingUp className="w-5 h-5" />}
            color="blue"
          />
          <MetricCard
            title="Projeção Anual"
            value={formatCurrency(projection.projectedYear)}
            subtitle={`Confiança: ${projection.confidence === 'high' ? 'Alta' : projection.confidence === 'medium' ? 'Média' : 'Baixa'}`}
            icon={<Target className="w-5 h-5" />}
            color="purple"
          />
          <MetricCard
            title="Inadimplência"
            value={formatCurrency(delinquency.totalOverdue)}
            subtitle={`${delinquency.overduePercentage}% do faturamento`}
            trend={-delinquency.overduePercentage}
            icon={<AlertTriangle className="w-5 h-5" />}
            color={delinquency.overduePercentage > 10 ? 'red' : 'amber'}
          />
          <MetricCard
            title="YoY"
            value={`${yoyComparison.percentageChange > 0 ? '+' : ''}${yoyComparison.percentageChange}%`}
            subtitle="vs. ano anterior"
            trend={yoyComparison.percentageChange}
            icon={<BarChart3 className="w-5 h-5" />}
            color={yoyComparison.percentageChange >= 0 ? 'green' : 'red'}
          />
        </div>
      </div>

      {/* Recommendations */}
      {healthScore.recommendations.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <h4 className="text-sm font-medium text-amber-800 flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4" />
            Recomendações
          </h4>
          <ul className="space-y-2">
            {healthScore.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-amber-700">
                <span className="w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center flex-shrink-0 text-xs font-medium">
                  {i + 1}
                </span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Procedure Metrics + Delinquency */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ticket Médio por Procedimento */}
        <div className="bg-genesis-surface rounded-2xl border border-genesis-border-subtle p-6">
          <h3 className="text-lg font-semibold text-genesis-dark flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-genesis-primary" />
            Ticket Médio por Procedimento
          </h3>
          <div className="space-y-3">
            {procedureMetrics.slice(0, 5).map((proc, i) => (
              <div
                key={proc.procedureType}
                className="flex items-center justify-between p-3 bg-genesis-soft rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-genesis-primary text-white text-xs font-medium flex items-center justify-center">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-medium text-genesis-dark">{proc.procedureType}</p>
                    <p className="text-xs text-genesis-muted">{proc.count} procedimentos</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-genesis-dark">
                    {formatCurrency(proc.averageTicket)}
                  </p>
                  <div className={`flex items-center gap-1 text-xs ${proc.trend >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {proc.trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {Math.abs(proc.trend)}%
                  </div>
                </div>
              </div>
            ))}
            {procedureMetrics.length === 0 && (
              <p className="text-center text-genesis-muted py-8">
                Nenhum procedimento registrado ainda.
              </p>
            )}
          </div>
        </div>

        {/* Aging de Inadimplência */}
        <div className="bg-genesis-surface rounded-2xl border border-genesis-border-subtle p-6">
          <h3 className="text-lg font-semibold text-genesis-dark flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-genesis-primary" />
            Aging de Inadimplência
          </h3>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-3 bg-genesis-soft rounded-lg">
              <p className="text-2xl font-bold text-genesis-dark">{delinquency.overdueCount}</p>
              <p className="text-xs text-genesis-muted">Títulos em Atraso</p>
            </div>
            <div className="text-center p-3 bg-genesis-soft rounded-lg">
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(delinquency.totalOverdue)}
              </p>
              <p className="text-xs text-genesis-muted">Valor Total</p>
            </div>
            <div className="text-center p-3 bg-genesis-soft rounded-lg">
              <p className="text-2xl font-bold text-genesis-dark">{delinquency.averageDaysOverdue}</p>
              <p className="text-xs text-genesis-muted">Dias Médios</p>
            </div>
          </div>

          {/* By Age Range */}
          <div className="space-y-3">
            {delinquency.byAgeRange.map((range) => {
              const maxAmount = Math.max(...delinquency.byAgeRange.map(r => r.amount));
              const percentage = maxAmount > 0 ? (range.amount / maxAmount) * 100 : 0;
              const isHigh = range.range.includes('90+');

              return (
                <div key={range.range} className="flex items-center gap-4">
                  <span className="w-24 text-sm text-genesis-muted">{range.range}</span>
                  <div className="flex-1 h-6 bg-genesis-border rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${isHigh ? 'bg-red-500' : 'bg-amber-500'}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="w-28 text-right">
                    <span className="text-sm font-medium text-genesis-dark">
                      {formatCurrency(range.amount)}
                    </span>
                    <span className="text-xs text-genesis-muted ml-1">({range.count})</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialWellness;
