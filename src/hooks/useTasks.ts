/**
 * useTasks Hook
 *
 * Provides real-time access to tasks with CRUD operations.
 * Includes loading/error states and pending tasks filter.
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useClinicContext } from '../contexts/ClinicContext'
import { useAuthContext } from '../contexts/AuthContext'
import { taskService } from '../services/firestore'
import { TaskStatus } from '@/types'
import type { Task, TaskPriority, CreateTaskInput, UpdateTaskInput } from '@/types'

/**
 * Return type for useTasks hook.
 */
export interface UseTasksReturn {
  /** Array of all tasks */
  tasks: Task[]
  /** Array of pending tasks only */
  pendingTasks: Task[]
  /** Loading state for initial fetch */
  loading: boolean
  /** Error state */
  error: Error | null
  /** Create a new task */
  addTask: (data: Omit<CreateTaskInput, 'createdBy' | 'status'>) => Promise<string>
  /** Update an existing task */
  updateTask: (id: string, data: UpdateTaskInput) => Promise<void>
  /** Toggle task completion */
  toggleComplete: (id: string, currentStatus: TaskStatus) => Promise<void>
  /** Delete a task */
  deleteTask: (id: string) => Promise<void>
}

/**
 * Sort tasks by priority (HIGH first) and due date.
 */
function sortTasks(tasks: Task[]): Task[] {
  const priorityOrder: Record<TaskPriority, number> = {
    high: 0,
    medium: 1,
    low: 2,
  }

  return [...tasks].sort((a, b) => {
    // First by priority
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
    if (priorityDiff !== 0) return priorityDiff

    // Then by due date (tasks with due dates come first)
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    }
    if (a.dueDate) return -1
    if (b.dueDate) return 1

    // Finally by creation date (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
}

/**
 * Hook for managing tasks with real-time updates.
 *
 * @param pendingOnly - If true, subscribe only to pending tasks
 * @returns Tasks data and CRUD operations
 *
 * @example
 * const { tasks, pendingTasks, addTask, toggleComplete } = useTasks();
 */
export function useTasks(pendingOnly = false): UseTasksReturn {
  const { clinicId } = useClinicContext()
  const { user } = useAuthContext()

  const [tasks, setTasks] = useState<Task[]>([])
  const [error, setError] = useState<Error | null>(null)

  // Track subscription state
  const [hasReceived, setHasReceived] = useState(false)

  // Subscribe to real-time updates
  useEffect(() => {
    if (!clinicId) {
      return
    }

    let isActive = true
    let unsubscribe: () => void

    const handleData = (data: Task[]) => {
      if (isActive) {
        setTasks(sortTasks(data))
        setHasReceived(true)
        setError(null)
      }
    }

    if (pendingOnly) {
      unsubscribe = taskService.subscribePending(clinicId, handleData)
    } else {
      unsubscribe = taskService.subscribe(clinicId, handleData)
    }

    return () => {
      isActive = false
      setHasReceived(false)
      unsubscribe()
    }
  }, [clinicId, pendingOnly])

  // Derive final values based on clinicId presence
  const effectiveTasks = useMemo(() => (clinicId ? tasks : []), [clinicId, tasks])
  const effectiveLoading = clinicId ? !hasReceived : false

  /**
   * Pending tasks (filtered from all tasks).
   */
  const pendingTasks = useMemo(() => {
    return effectiveTasks.filter(task => task.status === 'pending')
  }, [effectiveTasks])

  /**
   * Create a new task.
   */
  const addTask = useCallback(
    async (data: Omit<CreateTaskInput, 'createdBy' | 'status'>): Promise<string> => {
      if (!clinicId) {
        throw new Error('No clinic selected')
      }
      if (!user) {
        throw new Error('User not authenticated')
      }

      const taskData: CreateTaskInput = {
        ...data,
        status: TaskStatus.PENDING,
        createdBy: user.uid,
      }

      return taskService.create(clinicId, taskData)
    },
    [clinicId, user]
  )

  /**
   * Update an existing task.
   */
  const updateTask = useCallback(
    async (id: string, data: UpdateTaskInput): Promise<void> => {
      if (!clinicId) {
        throw new Error('No clinic selected')
      }
      await taskService.update(clinicId, id, data)
    },
    [clinicId]
  )

  /**
   * Toggle task completion status.
   */
  const toggleComplete = useCallback(
    async (id: string, currentStatus: TaskStatus): Promise<void> => {
      if (!clinicId) {
        throw new Error('No clinic selected')
      }
      await taskService.toggleComplete(clinicId, id, currentStatus)
    },
    [clinicId]
  )

  /**
   * Delete a task.
   */
  const deleteTask = useCallback(
    async (id: string): Promise<void> => {
      if (!clinicId) {
        throw new Error('No clinic selected')
      }
      await taskService.delete(clinicId, id)
    },
    [clinicId]
  )

  return {
    tasks: effectiveTasks,
    pendingTasks,
    loading: effectiveLoading,
    error,
    addTask,
    updateTask,
    toggleComplete,
    deleteTask,
  }
}
