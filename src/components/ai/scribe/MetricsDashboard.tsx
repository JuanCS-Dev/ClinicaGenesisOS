/**
 * Scribe Metrics Dashboard Component
 * ===================================
 *
 * Admin dashboard for viewing AI Scribe performance metrics.
 * Shows aggregated stats, trends, and recent feedback.
 *
 * Fase 12: AI Scribe Enhancement
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart3,
  Clock,
  Edit3,
  ThumbsUp,
  ThumbsDown,
  Star,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { useClinicContext } from '@/contexts/ClinicContext';
import {
  getDailyMetricsRange,
  getRecentFeedback,
  calculateAggregateMetrics,
} from '@/services/firestore/scribe-metrics.service';
import {
  FEEDBACK_CATEGORY_LABELS,
  SOAP_FIELD_LABELS,
  type DailyMetrics,
  type ScribeFeedback,
  type ScribeMetricsAggregate,
} from '@/types/scribe-metrics';

/**
 * Metrics Dashboard component.
 */
export const MetricsDashboard: React.FC = () => {
  const { clinicId } = useClinicContext();

  // State
  const [loading, setLoading] = useState(true);
  const [dailyMetrics, setDailyMetrics] = useState<DailyMetrics[]>([]);
  const [recentFeedback, setRecentFeedback] = useState<ScribeFeedback[]>([]);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('7d');

  // Calculate date range
  const { startDate, endDate } = useMemo(() => {
    const end = new Date();
    const start = new Date();
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
    start.setDate(start.getDate() - days);

    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    };
  }, [dateRange]);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      if (!clinicId) return;

      setLoading(true);
      try {
        const [metrics, feedback] = await Promise.all([
          getDailyMetricsRange(clinicId, startDate, endDate),
          getRecentFeedback(clinicId, 20),
        ]);

        setDailyMetrics(metrics);
        setRecentFeedback(feedback);
      } catch (err) {
        console.error('Failed to load scribe metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [clinicId, startDate, endDate]);

  // Calculate aggregate stats
  const aggregate: ScribeMetricsAggregate = useMemo(() => {
    return calculateAggregateMetrics(recentFeedback, startDate, endDate);
  }, [recentFeedback, startDate, endDate]);

  // Calculate totals from daily metrics
  const totals = useMemo(() => {
    return dailyMetrics.reduce(
      (acc, day) => ({
        generations: acc.generations + day.generations,
        thumbsUp: acc.thumbsUp + day.thumbsUp,
        thumbsDown: acc.thumbsDown + day.thumbsDown,
        avgRating:
          dailyMetrics.length > 0
            ? dailyMetrics.reduce((s, d) => s + d.averageRating, 0) / dailyMetrics.length
            : 0,
        avgGenTime:
          dailyMetrics.length > 0
            ? dailyMetrics.reduce((s, d) => s + d.avgGenerationTimeMs, 0) / dailyMetrics.length
            : 0,
        avgEditPct:
          dailyMetrics.length > 0
            ? dailyMetrics.reduce((s, d) => s + d.avgEditPercentage, 0) / dailyMetrics.length
            : 0,
      }),
      { generations: 0, thumbsUp: 0, thumbsDown: 0, avgRating: 0, avgGenTime: 0, avgEditPct: 0 }
    );
  }, [dailyMetrics]);

  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-genesis-subtle" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-genesis-dark">
            Métricas AI Scribe
          </h2>
          <p className="text-sm text-genesis-muted">
            SCRIBE Framework - Avaliação de Qualidade
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Date range selector */}
          <div className="flex items-center gap-1 bg-genesis-hover rounded-lg p-1">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  dateRange === range
                    ? 'bg-genesis-surface text-genesis-dark shadow-sm'
                    : 'text-genesis-medium hover:text-genesis-dark'
                }`}
              >
                {range === '7d' ? '7 dias' : range === '30d' ? '30 dias' : '90 dias'}
              </button>
            ))}
          </div>

          <button
            onClick={() => window.location.reload()}
            className="p-2 hover:bg-genesis-hover rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-genesis-muted" />
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<BarChart3 className="w-5 h-5" />}
          label="Gerações"
          value={totals.generations.toString()}
          color="blue"
        />
        <StatCard
          icon={<Star className="w-5 h-5" />}
          label="Avaliação Média"
          value={totals.avgRating.toFixed(1)}
          suffix="/5"
          color="amber"
        />
        <StatCard
          icon={<Clock className="w-5 h-5" />}
          label="Tempo Médio"
          value={(totals.avgGenTime / 1000).toFixed(1)}
          suffix="s"
          color="green"
        />
        <StatCard
          icon={<Edit3 className="w-5 h-5" />}
          label="Edição Média"
          value={totals.avgEditPct.toFixed(0)}
          suffix="%"
          color="purple"
        />
      </div>

      {/* Feedback summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Thumbs ratio */}
        <div className="bg-genesis-surface rounded-2xl border border-genesis-border-subtle p-6">
          <h3 className="font-semibold text-genesis-dark mb-4">Satisfação</h3>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <ThumbsUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-genesis-dark">
                  {totals.thumbsUp}
                </p>
                <p className="text-xs text-genesis-muted">Positivos</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-red-100 rounded-lg">
                <ThumbsDown className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-genesis-dark">
                  {totals.thumbsDown}
                </p>
                <p className="text-xs text-genesis-muted">Negativos</p>
              </div>
            </div>
          </div>

          {/* Ratio bar */}
          {(totals.thumbsUp + totals.thumbsDown) > 0 && (
            <div className="mt-4">
              <div className="h-3 bg-genesis-hover rounded-full overflow-hidden flex">
                <div
                  className="bg-green-500"
                  style={{
                    width: `${(totals.thumbsUp / (totals.thumbsUp + totals.thumbsDown)) * 100}%`,
                  }}
                />
                <div
                  className="bg-red-500"
                  style={{
                    width: `${(totals.thumbsDown / (totals.thumbsUp + totals.thumbsDown)) * 100}%`,
                  }}
                />
              </div>
              <p className="mt-2 text-sm text-genesis-muted text-center">
                {((totals.thumbsUp / (totals.thumbsUp + totals.thumbsDown)) * 100).toFixed(0)}%
                satisfação
              </p>
            </div>
          )}
        </div>

        {/* Most edited fields */}
        <div className="bg-genesis-surface rounded-2xl border border-genesis-border-subtle p-6">
          <h3 className="font-semibold text-genesis-dark mb-4">Campos Mais Editados</h3>
          <div className="space-y-3">
            {Object.entries(aggregate.mostEditedFields)
              .sort(([, a], [, b]) => b - a)
              .map(([field, count]) => {
                const maxCount = Math.max(...Object.values(aggregate.mostEditedFields));
                const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;

                return (
                  <div key={field} className="flex items-center gap-3">
                    <span className="w-24 text-sm text-genesis-medium">
                      {SOAP_FIELD_LABELS[field as keyof typeof SOAP_FIELD_LABELS]}
                    </span>
                    <div className="flex-1 h-2 bg-genesis-hover rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-genesis-muted w-8 text-right">
                      {count}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Recent feedback */}
      <div className="bg-genesis-surface rounded-2xl border border-genesis-border-subtle p-6">
        <h3 className="font-semibold text-genesis-dark mb-4">Feedback Recente</h3>
        
        {recentFeedback.length === 0 ? (
          <p className="text-center text-genesis-muted py-8">
            Nenhum feedback recebido ainda
          </p>
        ) : (
          <div className="space-y-3">
            {recentFeedback.slice(0, 10).map((feedback) => (
              <div
                key={feedback.id}
                className="flex items-start gap-3 p-3 bg-genesis-soft rounded-xl"
              >
                <div
                  className={`p-2 rounded-lg ${
                    feedback.type === 'positive'
                      ? 'bg-green-100'
                      : 'bg-red-100'
                  }`}
                >
                  {feedback.type === 'positive' ? (
                    <ThumbsUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <ThumbsDown className="w-4 h-4 text-red-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-genesis-dark">
                      {feedback.rating}/5
                    </span>
                    <span className="text-genesis-subtle">•</span>
                    <span className="text-sm text-genesis-muted">
                      {formatDate(feedback.createdAt)}
                    </span>
                  </div>
                  {feedback.categories.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {feedback.categories.map((cat) => (
                        <span
                          key={cat}
                          className="px-2 py-0.5 bg-genesis-border-subtle text-genesis-medium rounded-full text-xs"
                        >
                          {FEEDBACK_CATEGORY_LABELS[cat]}
                        </span>
                      ))}
                    </div>
                  )}
                  {feedback.comment && (
                    <p className="mt-1 text-sm text-genesis-medium truncate">
                      {feedback.comment}
                    </p>
                  )}
                </div>
                <span className="text-xs text-genesis-subtle">
                  {feedback.totalEditPercentage.toFixed(0)}% editado
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Stat card component.
 */
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  suffix?: string;
  color: 'blue' | 'green' | 'amber' | 'purple';
}

function StatCard({ icon, label, value, suffix, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    amber: 'bg-amber-100 text-amber-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <div className="bg-genesis-surface rounded-2xl border border-genesis-border-subtle p-4">
      <div className={`w-10 h-10 rounded-xl ${colorClasses[color]} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="text-sm text-genesis-muted">{label}</p>
      <p className="text-2xl font-bold text-genesis-dark">
        {value}
        {suffix && <span className="text-lg text-genesis-subtle">{suffix}</span>}
      </p>
    </div>
  );
}

export default MetricsDashboard;

