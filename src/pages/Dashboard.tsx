/**
 * Dashboard Page
 *
 * Main overview page showing KPIs, upcoming appointments, and tasks.
 * Inspired by athenahealth Executive Summary and Elation three-panel console.
 *
 * Features:
 * - Real-time KPIs with temporal comparisons
 * - Visual occupancy gauge
 * - Upcoming appointments timeline
 * - Priority task list
 */

import React, { useMemo, useState } from 'react'
import {
  Users,
  Calendar,
  Wallet,
  MoreHorizontal,
  Clock,
  ArrowRight,
  Loader2,
  CheckCircle2,
  CalendarPlus,
  ListTodo,
} from 'lucide-react'
import { Status } from '../types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useNavigate } from 'react-router-dom'
import { useClinicContext } from '../contexts/ClinicContext'
import { useAppointments } from '../hooks/useAppointments'
import { useDashboardMetrics } from '../hooks/useDashboardMetrics'
import { useTasks } from '../hooks/useTasks'
import { KPICard, OccupancyBar } from '../components/dashboard'
import { TaskModal, TaskItem } from '../components/tasks'
import type { Task } from '../types'

/**
 * Status badge configuration.
 */
function getStatusConfig(status: Status) {
  switch (status) {
    case Status.CONFIRMED:
      return {
        bg: 'bg-emerald-50 dark:bg-emerald-900/30',
        text: 'text-emerald-600 dark:text-emerald-400',
        border: 'border-emerald-100 dark:border-emerald-800',
      }
    case Status.PENDING:
      return {
        bg: 'bg-amber-50 dark:bg-amber-900/30',
        text: 'text-amber-600 dark:text-amber-400',
        border: 'border-amber-100 dark:border-amber-800',
      }
    case Status.IN_PROGRESS:
      return {
        bg: 'bg-purple-50 dark:bg-purple-900/30',
        text: 'text-purple-600 dark:text-purple-400',
        border: 'border-purple-100 dark:border-purple-800',
      }
    case Status.ARRIVED:
      return {
        bg: 'bg-blue-50 dark:bg-blue-900/30',
        text: 'text-blue-600 dark:text-blue-400',
        border: 'border-blue-100 dark:border-blue-800',
      }
    case Status.FINISHED:
      return {
        bg: 'bg-genesis-soft dark:bg-genesis-border',
        text: 'text-genesis-medium',
        border: 'border-genesis-border-subtle',
      }
    default:
      return {
        bg: 'bg-genesis-hover',
        text: 'text-genesis-muted',
        border: 'border-genesis-border-subtle',
      }
  }
}

/**
 * Format currency for display.
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

/**
 * Get contextual greeting based on time of day.
 */
function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

export function Dashboard() {
  const navigate = useNavigate()
  const { userProfile } = useClinicContext()
  const { appointments } = useAppointments()
  const metrics = useDashboardMetrics()
  const { pendingTasks, toggleComplete } = useTasks(true)

  // Task modal state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined)

  // Open modal for new task
  const handleAddTask = () => {
    setSelectedTask(undefined)
    setIsTaskModalOpen(true)
  }

  // Open modal for editing task
  const handleEditTask = (task: Task) => {
    setSelectedTask(task)
    setIsTaskModalOpen(true)
  }

  // Close modal
  const handleCloseTaskModal = () => {
    setIsTaskModalOpen(false)
    setSelectedTask(undefined)
  }

  // Get user's display name
  const userName = userProfile?.displayName?.split(' ')[0] || 'Profissional'

  // Memoize upcoming appointments to avoid recalculating on every render
  // PERF: This was previously inline .filter().sort() causing unnecessary work
  const upcomingAppointments = useMemo(() => {
    const now = new Date()
    return [...appointments]
      .filter(apt => new Date(apt.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5)
  }, [appointments])

  // Loading state
  if (metrics.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-genesis-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-enter">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-genesis-dark tracking-tight mb-1">
            {getGreeting()}, {userName}
          </h1>
          <p className="text-genesis-medium text-sm font-medium">
            Resumo operacional de hoje, {format(new Date(), "d 'de' MMMM", { locale: ptBR })}.
          </p>
        </div>
        <button
          onClick={() => navigate('/finance')}
          className="bg-genesis-primary text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-genesis-primary-dark transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform"
        >
          Relatório Completo
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Consultas Hoje"
          value={metrics.todayAppointments.value}
          icon={Calendar}
          iconColor="text-genesis-primary"
          iconBg="bg-genesis-primary/10"
          trend={metrics.todayAppointments.trend}
          comparison={metrics.todayAppointments.comparisonText}
          subLabel="Agenda do dia"
          onClick={() => navigate('/agenda')}
        />

        <KPICard
          title="Pacientes Ativos"
          value={metrics.activePatients.value}
          icon={Users}
          iconColor="text-info"
          iconBg="bg-info/10"
          trend={metrics.activePatients.trend}
          comparison={metrics.activePatients.comparisonText}
          subLabel="Base cadastrada"
          onClick={() => navigate('/patients')}
        />

        <KPICard
          title="Faturamento Mês"
          value={formatCurrency(metrics.revenue.value)}
          icon={Wallet}
          iconColor="text-success"
          iconBg="bg-success/10"
          trend={metrics.revenue.trend}
          comparison={metrics.revenue.comparisonText}
          subLabel={`${metrics.revenue.completedCount} consultas finalizadas`}
          onClick={() => navigate('/finance')}
        />

        {/* Occupancy Card */}
        <div className="bg-genesis-surface p-6 rounded-2xl border border-genesis-border-subtle shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-clinical-soft">
              <CheckCircle2 className="w-5 h-5 text-clinical-start" strokeWidth={2.5} />
            </div>
          </div>

          <div className="space-y-1 mb-4">
            <h3 className="text-3xl font-bold text-genesis-dark tracking-tight">
              {metrics.occupancy.rate}%
            </h3>
            <p className="text-[13px] font-medium text-genesis-muted">Taxa de Ocupação</p>
          </div>

          <OccupancyBar metrics={metrics.occupancy} />
        </div>
      </div>

      {/* Content Grid: Appointments + Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upcoming Appointments */}
        <div className="lg:col-span-2 bg-genesis-surface rounded-2xl border border-genesis-border-subtle shadow-md overflow-hidden flex flex-col">
          <div className="p-6 border-b border-genesis-border-subtle flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-genesis-dark text-base">Próximas Consultas</h3>
              <p className="text-xs text-genesis-muted mt-0.5">
                {upcomingAppointments.length} agendadas
              </p>
            </div>
            <button
              onClick={() => navigate('/agenda')}
              className="text-xs text-genesis-primary font-semibold hover:bg-genesis-primary/10 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
            >
              Ver Agenda
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="flex-1 overflow-auto max-h-[400px]">
            {upcomingAppointments.length === 0 ? (
              <div className="p-8 text-center">
                <CalendarPlus className="w-12 h-12 text-genesis-muted mx-auto mb-3 opacity-50" />
                <p className="text-genesis-muted text-sm font-medium">Nenhuma consulta agendada.</p>
                <button
                  onClick={() => navigate('/agenda')}
                  className="mt-4 text-sm text-genesis-primary font-semibold hover:underline"
                >
                  Agendar consulta
                </button>
              </div>
            ) : (
              upcomingAppointments.map(apt => {
                const statusConfig = getStatusConfig(apt.status)
                const isToday =
                  format(new Date(apt.date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')

                return (
                  <div
                    key={apt.id}
                    className="p-4 hover:bg-genesis-hover transition-colors flex items-center justify-between group cursor-pointer border-b border-genesis-border-subtle last:border-0"
                    onClick={() => navigate('/agenda')}
                  >
                    <div className="flex items-center gap-4">
                      {/* Date Badge */}
                      <div
                        className={`
                          flex flex-col items-center justify-center w-12 h-12 rounded-xl
                          border shadow-sm group-hover:border-genesis-primary/30 transition-all
                          ${
                            isToday
                              ? 'bg-genesis-primary/10 border-genesis-primary/20 text-genesis-primary'
                              : 'bg-genesis-soft border-genesis-border-subtle text-genesis-dark'
                          }
                        `}
                      >
                        <span className="text-[10px] font-bold uppercase opacity-70">
                          {isToday ? 'Hoje' : format(new Date(apt.date), 'MMM', { locale: ptBR })}
                        </span>
                        <span className="text-lg font-bold leading-none">
                          {format(new Date(apt.date), 'dd')}
                        </span>
                      </div>

                      {/* Patient Info */}
                      <div>
                        <h4 className="font-semibold text-genesis-dark text-sm mb-0.5">
                          {apt.patientName}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-genesis-muted">
                          <Clock className="w-3 h-3" />
                          <span className="font-medium">{format(new Date(apt.date), 'HH:mm')}</span>
                          <span className="text-genesis-subtle">•</span>
                          <span>{apt.procedure}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status + Actions */}
                    <div className="flex items-center gap-4">
                      <span
                        className={`
                          px-2.5 py-1 rounded-full text-[11px] font-semibold border
                          ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}
                        `}
                      >
                        {apt.status}
                      </span>
                      <button className="p-2 text-genesis-subtle hover:text-genesis-dark hover:bg-genesis-hover rounded-full transition-all opacity-0 group-hover:opacity-100">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Tasks Panel */}
        <div className="bg-genesis-surface rounded-2xl border border-genesis-border-subtle shadow-md p-6 flex flex-col h-full">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-semibold text-genesis-dark text-base">Tarefas Pendentes</h3>
              <p className="text-xs text-genesis-muted mt-0.5">Ações prioritárias</p>
            </div>
            <span className="text-[10px] font-bold text-genesis-muted bg-genesis-soft px-2 py-1 rounded-full">
              {pendingTasks.length} {pendingTasks.length === 1 ? 'item' : 'itens'}
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-auto max-h-[320px]">
            {pendingTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <ListTodo className="w-10 h-10 text-genesis-muted mb-3 opacity-40" />
                <p className="text-sm text-genesis-muted font-medium">Nenhuma tarefa pendente</p>
                <p className="text-xs text-genesis-subtle mt-1">
                  Adicione tarefas para organizar seu dia
                </p>
              </div>
            ) : (
              pendingTasks
                .slice(0, 5)
                .map(task => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    compact
                    onClick={() => handleEditTask(task)}
                    onToggleComplete={() => toggleComplete(task.id, task.status)}
                  />
                ))
            )}
          </div>

          <button
            onClick={handleAddTask}
            className="w-full mt-4 py-2.5 border border-dashed border-genesis-border text-genesis-muted rounded-xl text-xs font-semibold hover:bg-genesis-hover hover:border-genesis-primary/50 hover:text-genesis-primary transition-all uppercase tracking-wide"
          >
            + Adicionar Tarefa
          </button>
        </div>
      </div>

      {/* Task Modal */}
      <TaskModal isOpen={isTaskModalOpen} onClose={handleCloseTaskModal} task={selectedTask} />

      {/* Quick Stats Bar */}
      <div className="bg-genesis-surface rounded-2xl border border-genesis-border-subtle shadow-md p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 divide-x divide-genesis-border-subtle">
          <div className="text-center px-4">
            <span className="text-2xl font-bold text-emerald-600">
              {metrics.breakdown.confirmed}
            </span>
            <p className="text-[11px] text-genesis-muted font-medium mt-0.5">Confirmados</p>
          </div>
          <div className="text-center px-4">
            <span className="text-2xl font-bold text-amber-600">{metrics.breakdown.pending}</span>
            <p className="text-[11px] text-genesis-muted font-medium mt-0.5">Pendentes</p>
          </div>
          <div className="text-center px-4">
            <span className="text-2xl font-bold text-genesis-primary">
              {metrics.breakdown.completed}
            </span>
            <p className="text-[11px] text-genesis-muted font-medium mt-0.5">Finalizados</p>
          </div>
          <div className="text-center px-4">
            <span className="text-2xl font-bold text-red-600">{metrics.breakdown.noShow}</span>
            <p className="text-[11px] text-genesis-muted font-medium mt-0.5">Faltas</p>
          </div>
        </div>
      </div>
    </div>
  )
}
