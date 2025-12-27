/**
 * Patient Insights Dashboard Component
 * ====================================
 *
 * Patient analytics, retention, and engagement metrics.
 * Inspired by Epic MyChart Central.
 *
 * @module components/analytics/PatientInsights
 * @version 1.0.0
 */

import React from 'react';
import {
  Users,
  UserPlus,
  UserMinus,
  TrendingUp,
  AlertTriangle,
  Star,
  MessageSquare,
  Calendar,
  Clock,
  Heart,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Phone,
  Mail,
  Smartphone,
} from 'lucide-react';
import { usePatientInsights } from '../../hooks/usePatientInsights';

// ============================================================================
// Sub-Components
// ============================================================================

interface NPSGaugeProps {
  score: number;
  trend: 'up' | 'down' | 'stable';
}

const NPSGauge: React.FC<NPSGaugeProps> = ({ score, trend }) => {
  // NPS ranges from -100 to 100
  const normalizedScore = (score + 100) / 2; // Convert to 0-100
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  const getColor = () => {
    if (score >= 50) return 'stroke-emerald-500';
    if (score >= 0) return 'stroke-blue-500';
    if (score >= -50) return 'stroke-amber-500';
    return 'stroke-red-500';
  };

  const getLabel = () => {
    if (score >= 50) return { text: 'Excelente', bg: 'bg-emerald-100', color: 'text-emerald-700' };
    if (score >= 0) return { text: 'Bom', bg: 'bg-blue-100', color: 'text-blue-700' };
    if (score >= -50) return { text: 'Neutro', bg: 'bg-amber-100', color: 'text-amber-700' };
    return { text: 'Crítico', bg: 'bg-red-100', color: 'text-red-700' };
  };

  const label = getLabel();

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-28 h-28">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="var(--color-genesis-border)"
            strokeWidth="10"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            className={getColor()}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-genesis-dark">{score}</span>
          <div className="flex items-center gap-1">
            {trend === 'up' && <ArrowUpRight className="w-3 h-3 text-emerald-500" />}
            {trend === 'down' && <ArrowDownRight className="w-3 h-3 text-red-500" />}
          </div>
        </div>
      </div>
      <div className={`mt-2 px-3 py-1 rounded-full ${label.bg}`}>
        <span className={`text-sm font-medium ${label.color}`}>{label.text}</span>
      </div>
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, trend, subtitle }) => (
  <div className="bg-genesis-soft rounded-xl p-4">
    <div className="flex items-center justify-between mb-2">
      <span className="text-genesis-muted">{icon}</span>
      {trend !== undefined && (
        <span className={`flex items-center text-xs font-medium ${trend >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
          {trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <p className="text-2xl font-bold text-genesis-dark">{value}</p>
    <p className="text-sm text-genesis-muted">{label}</p>
    {subtitle && <p className="text-xs text-genesis-subtle mt-1">{subtitle}</p>}
  </div>
);

// ============================================================================
// Main Component
// ============================================================================

export const PatientInsights: React.FC = () => {
  const { retention, nps, patientsAtRisk, engagement, loading } = usePatientInsights();

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
            <Heart className="w-5 h-5 text-pink-500" />
            Insights de Pacientes
          </h2>
          <p className="text-sm text-genesis-muted mt-1">
            Retenção, satisfação e engajamento
          </p>
        </div>
      </div>

      {/* NPS + Retention Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* NPS Card */}
        <div className="bg-genesis-surface rounded-2xl border border-genesis-border-subtle p-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <h3 className="text-sm font-medium text-genesis-muted">Net Promoter Score</h3>
            {nps.isExample && (
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full dark:bg-amber-900/30 dark:text-amber-400">
                Exemplo
              </span>
            )}
          </div>
          <NPSGauge score={nps.score} trend={nps.trend} />

          {/* NPS Breakdown */}
          <div className="mt-6 grid grid-cols-3 gap-2">
            <div className="text-center p-2 bg-emerald-50 rounded-lg">
              <p className="text-lg font-bold text-emerald-600">{nps.promoters}</p>
              <p className="text-xs text-emerald-700">Promotores</p>
            </div>
            <div className="text-center p-2 bg-genesis-soft dark:bg-genesis-hover rounded-lg">
              <p className="text-lg font-bold text-genesis-muted">{nps.passives}</p>
              <p className="text-xs text-genesis-text dark:text-genesis-muted">Neutros</p>
            </div>
            <div className="text-center p-2 bg-red-50 rounded-lg">
              <p className="text-lg font-bold text-red-600">{nps.detractors}</p>
              <p className="text-xs text-red-700">Detratores</p>
            </div>
          </div>

          <p className="text-xs text-genesis-muted text-center mt-4">
            {nps.totalResponses} respostas coletadas
          </p>
        </div>

        {/* Retention Metrics */}
        <div className="lg:col-span-2 bg-genesis-surface rounded-2xl border border-genesis-border-subtle p-6">
          <h3 className="text-sm font-medium text-genesis-muted mb-4 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Métricas de Retenção
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label="Total de Pacientes"
              value={retention.totalPatients}
              icon={<Users className="w-5 h-5" />}
            />
            <StatCard
              label="Pacientes Ativos"
              value={retention.activePatients}
              icon={<Activity className="w-5 h-5" />}
              subtitle="Últimos 90 dias"
            />
            <StatCard
              label="Taxa de Retorno"
              value={`${retention.retentionRate}%`}
              icon={<TrendingUp className="w-5 h-5" />}
              trend={5}
            />
            <StatCard
              label="Novos este Mês"
              value={retention.newPatients}
              icon={<UserPlus className="w-5 h-5" />}
            />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="p-4 bg-emerald-50 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-sm text-emerald-700">Visitas/Paciente</span>
                <span className="text-2xl font-bold text-emerald-700">
                  {retention.averageVisitsPerPatient}
                </span>
              </div>
            </div>
            <div className="p-4 bg-red-50 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-sm text-red-700">Taxa de Churn</span>
                <span className="text-2xl font-bold text-red-700">{retention.churnRate}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Patients at Risk + Engagement */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patients at Risk */}
        <div className="bg-genesis-surface rounded-2xl border border-genesis-border-subtle p-6">
          <h3 className="text-lg font-semibold text-genesis-dark flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Pacientes em Risco
            {patientsAtRisk.length > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
                {patientsAtRisk.length}
              </span>
            )}
          </h3>

          <div className="space-y-3 max-h-80 overflow-y-auto">
            {patientsAtRisk.map((patient) => {
              const riskColors = {
                high: 'border-red-200 bg-red-50',
                medium: 'border-amber-200 bg-amber-50',
                low: 'border-blue-200 bg-blue-50',
              };
              const riskLabels = {
                high: { text: 'Alto', color: 'text-red-700 bg-red-100' },
                medium: { text: 'Médio', color: 'text-amber-700 bg-amber-100' },
                low: { text: 'Baixo', color: 'text-blue-700 bg-blue-100' },
              };
              const reasonLabels = {
                no_return: 'Sem retorno',
                missed_appointments: 'Faltas frequentes',
                negative_feedback: 'Feedback negativo',
                chronic_condition: 'Condição crônica',
              };

              return (
                <div
                  key={patient.patientId}
                  className={`p-4 rounded-xl border ${riskColors[patient.riskLevel]}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-genesis-dark">{patient.patientName}</p>
                      <p className="text-xs text-genesis-muted mt-1">
                        {reasonLabels[patient.reason]}
                        {patient.daysSinceLastVisit > 0 && ` • ${patient.daysSinceLastVisit} dias`}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${riskLabels[patient.riskLevel].color}`}>
                      {riskLabels[patient.riskLevel].text}
                    </span>
                  </div>
                  <p className="text-sm text-genesis-medium mt-2">{patient.recommendedAction}</p>
                </div>
              );
            })}

            {patientsAtRisk.length === 0 && (
              <div className="text-center py-8">
                <Heart className="w-12 h-12 text-emerald-300 mx-auto mb-3" />
                <p className="text-genesis-muted">Nenhum paciente em risco identificado!</p>
              </div>
            )}
          </div>
        </div>

        {/* Engagement Metrics */}
        <div className="bg-genesis-surface rounded-2xl border border-genesis-border-subtle p-6">
          <h3 className="text-lg font-semibold text-genesis-dark flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-genesis-primary" />
            Engajamento
            {engagement.isExample && (
              <span className="text-xs font-normal bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full dark:bg-amber-900/30 dark:text-amber-400">
                Parcialmente exemplo
              </span>
            )}
          </h3>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-genesis-soft rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-genesis-primary" />
                <span className="text-sm text-genesis-muted">Confirmação</span>
              </div>
              <p className="text-2xl font-bold text-genesis-dark">
                {engagement.appointmentConfirmationRate}%
              </p>
            </div>
            <div className="p-4 bg-genesis-soft rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <UserMinus className="w-4 h-4 text-red-500" />
                <span className="text-sm text-genesis-muted">No-show</span>
              </div>
              <p className="text-2xl font-bold text-genesis-dark">{engagement.noShowRate}%</p>
            </div>
          </div>

          {/* Communication Channels */}
          <h4 className="text-sm font-medium text-genesis-muted mb-3">Canais de Comunicação</h4>
          <div className="space-y-2 mb-6">
            {engagement.communicationChannels.map((channel) => {
              const icons = {
                WhatsApp: <Smartphone className="w-4 h-4 text-emerald-500" />,
                Telefone: <Phone className="w-4 h-4 text-blue-500" />,
                Email: <Mail className="w-4 h-4 text-purple-500" />,
                Portal: <Users className="w-4 h-4 text-genesis-primary" />,
              };
              return (
                <div key={channel.channel} className="flex items-center gap-3">
                  {icons[channel.channel as keyof typeof icons]}
                  <span className="text-sm text-genesis-text w-20">{channel.channel}</span>
                  <div className="flex-1 h-2 bg-genesis-border rounded-full overflow-hidden">
                    <div
                      className="h-full bg-genesis-primary rounded-full"
                      style={{ width: `${channel.usage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-genesis-dark w-12 text-right">
                    {channel.usage}%
                  </span>
                </div>
              );
            })}
          </div>

          {/* Time of Day Distribution */}
          <h4 className="text-sm font-medium text-genesis-muted mb-3">Horários Preferidos</h4>
          <div className="grid grid-cols-3 gap-2">
            {engagement.byTimeOfDay.map((period) => (
              <div key={period.period} className="text-center p-3 bg-genesis-soft rounded-lg">
                <Clock className="w-4 h-4 text-genesis-muted mx-auto mb-1" />
                <p className="text-lg font-bold text-genesis-dark">{period.appointments}</p>
                <p className="text-xs text-genesis-muted">{period.period}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Feedback */}
      {nps.recentFeedback.length > 0 && (
        <div className="bg-genesis-surface rounded-2xl border border-genesis-border-subtle p-6">
          <h3 className="text-lg font-semibold text-genesis-dark flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-amber-400" />
            Feedback Recente
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {nps.recentFeedback.map((feedback, i) => (
              <div key={i} className="p-4 bg-genesis-soft rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-genesis-dark">{feedback.patientName}</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="font-medium text-genesis-dark">{feedback.rating}</span>
                  </div>
                </div>
                {feedback.comment && (
                  <p className="text-sm text-genesis-medium italic">"{feedback.comment}"</p>
                )}
                <p className="text-xs text-genesis-muted mt-2">
                  {new Date(feedback.date).toLocaleDateString('pt-BR')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientInsights;
