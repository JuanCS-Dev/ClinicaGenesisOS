/**
 * Task Item Component
 *
 * Displays a single task with priority indicator, title, and metadata.
 * Supports click to open modal and quick complete toggle.
 */

import React from 'react'
import { Check, Calendar, User } from 'lucide-react'
import { format, isToday, isTomorrow, isPast } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { TASK_PRIORITY_CONFIG } from '@/types'
import type { Task, TaskPriority } from '@/types'

export interface TaskItemProps {
  task: Task
  onClick?: () => void
  onToggleComplete?: () => void
  compact?: boolean
}

/**
 * Format due date for display.
 */
function formatDueDate(dateStr: string): { text: string; isOverdue: boolean } {
  const date = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const isOverdue = isPast(date) && !isToday(date)

  if (isToday(date)) {
    return { text: 'Hoje', isOverdue: false }
  }
  if (isTomorrow(date)) {
    return { text: 'Amanhã', isOverdue: false }
  }

  return {
    text: format(date, "d 'de' MMM", { locale: ptBR }),
    isOverdue,
  }
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onClick,
  onToggleComplete,
  compact = false,
}) => {
  const isCompleted = task.status === 'completed'
  const config = TASK_PRIORITY_CONFIG[task.priority as TaskPriority]
  const dueInfo = task.dueDate ? formatDueDate(task.dueDate) : null

  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleComplete?.()
  }

  if (compact) {
    return (
      <div
        onClick={onClick}
        className={`flex items-start gap-3 p-3 bg-genesis-surface rounded-xl border border-genesis-border-subtle shadow-sm hover:shadow-md hover:border-genesis-primary/30 transition-all cursor-pointer group ${
          isCompleted ? 'opacity-60' : ''
        }`}
      >
        {/* Priority indicator */}
        <div
          className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${config.dotColor} ${
            task.priority === 'high' && !isCompleted ? `animate-pulse ${config.dotGlow}` : ''
          }`}
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm font-medium text-genesis-dark group-hover:text-genesis-primary transition-colors truncate ${
              isCompleted ? 'line-through' : ''
            }`}
          >
            {task.title}
          </p>
          {(task.patientName || dueInfo) && (
            <p className="text-xs text-genesis-muted mt-0.5 truncate">
              {task.patientName}
              {task.patientName && dueInfo && ' • '}
              {dueInfo && (
                <span className={dueInfo.isOverdue && !isCompleted ? 'text-red-500' : ''}>
                  {dueInfo.text}
                </span>
              )}
            </p>
          )}
        </div>

        {/* Complete button */}
        {onToggleComplete && (
          <button
            onClick={handleComplete}
            className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
              isCompleted
                ? 'bg-emerald-500 border-emerald-500 text-white'
                : 'border-genesis-border hover:border-genesis-primary hover:bg-genesis-primary/10'
            }`}
          >
            {isCompleted && <Check className="w-3 h-3" />}
          </button>
        )}
      </div>
    )
  }

  // Full version (for dedicated task list page)
  return (
    <div
      onClick={onClick}
      className={`flex items-start gap-4 p-4 bg-genesis-surface rounded-xl border border-genesis-border-subtle shadow-sm hover:shadow-md hover:border-genesis-primary/30 transition-all cursor-pointer group ${
        isCompleted ? 'opacity-60' : ''
      }`}
    >
      {/* Complete checkbox */}
      {onToggleComplete && (
        <button
          onClick={handleComplete}
          className={`w-6 h-6 mt-0.5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
            isCompleted
              ? 'bg-emerald-500 border-emerald-500 text-white'
              : 'border-genesis-border hover:border-genesis-primary hover:bg-genesis-primary/10'
          }`}
        >
          {isCompleted && <Check className="w-4 h-4" />}
        </button>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 mb-1">
          {/* Priority badge */}
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${config.bgColor} ${config.color}`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${config.dotColor} ${
                task.priority === 'high' && !isCompleted ? 'animate-pulse' : ''
              }`}
            />
            {config.label}
          </span>
        </div>

        <p
          className={`text-sm font-medium text-genesis-dark group-hover:text-genesis-primary transition-colors ${
            isCompleted ? 'line-through' : ''
          }`}
        >
          {task.title}
        </p>

        {task.description && (
          <p className="text-xs text-genesis-muted mt-1 line-clamp-2">{task.description}</p>
        )}

        {/* Metadata */}
        <div className="flex items-center gap-3 mt-2">
          {task.patientName && (
            <span className="inline-flex items-center gap-1 text-xs text-genesis-muted">
              <User className="w-3 h-3" />
              {task.patientName}
            </span>
          )}
          {dueInfo && (
            <span
              className={`inline-flex items-center gap-1 text-xs ${
                dueInfo.isOverdue && !isCompleted ? 'text-red-500' : 'text-genesis-muted'
              }`}
            >
              <Calendar className="w-3 h-3" />
              {dueInfo.text}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

TaskItem.displayName = 'TaskItem'

export default TaskItem
