/**
 * Task Types
 *
 * Core task entity for clinic task management.
 * Tasks can optionally be associated with patients.
 */

/** Task completion status. */
export enum TaskStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
}

/** Task priority levels. */
export enum TaskPriority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

/** Priority display configuration. */
export const TASK_PRIORITY_CONFIG = {
  [TaskPriority.HIGH]: {
    label: 'Alta',
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    dotColor: 'bg-red-500',
    dotGlow: 'shadow-[0_0_8px_rgba(239,68,68,0.4)]',
  },
  [TaskPriority.MEDIUM]: {
    label: 'Média',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    dotColor: 'bg-amber-500',
    dotGlow: '',
  },
  [TaskPriority.LOW]: {
    label: 'Baixa',
    color: 'text-genesis-muted',
    bgColor: 'bg-genesis-soft',
    dotColor: 'bg-genesis-subtle',
    dotGlow: '',
  },
} as const

/** Core task entity. */
export interface Task {
  /** Unique identifier */
  id: string
  /** Task title (required) */
  title: string
  /** Task description (optional) */
  description?: string
  /** Priority level */
  priority: TaskPriority
  /** Completion status */
  status: TaskStatus
  /** Associated patient ID (optional) */
  patientId?: string
  /** Associated patient name (denormalized for performance) */
  patientName?: string
  /** Due date in ISO format (optional) */
  dueDate?: string
  /** Creation timestamp */
  createdAt: string
  /** User ID who created the task */
  createdBy: string
  /** Completion timestamp (set when status changes to completed) */
  completedAt?: string
}

/**
 * Input type for creating a new task (without auto-generated fields).
 */
export type CreateTaskInput = Omit<Task, 'id' | 'createdAt' | 'completedAt'>

/**
 * Input type for updating a task.
 */
export type UpdateTaskInput = Partial<Omit<Task, 'id' | 'createdAt' | 'createdBy'>>
