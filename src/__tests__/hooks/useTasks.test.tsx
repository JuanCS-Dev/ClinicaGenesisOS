/**
 * useTasks Hook Tests
 *
 * Tests for the tasks hook.
 *
 * @module __tests__/hooks/useTasks
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useTasks } from '../../hooks/useTasks'
import { taskService } from '../../services/firestore'
import { useClinicContext } from '../../contexts/ClinicContext'
import { useAuthContext } from '../../contexts/AuthContext'
import { TaskStatus } from '@/types'
import type { Task } from '@/types'

vi.mock('../../contexts/ClinicContext', () => ({
  useClinicContext: vi.fn(),
}))

vi.mock('../../contexts/AuthContext', () => ({
  useAuthContext: vi.fn(),
}))

vi.mock('../../services/firestore', () => ({
  taskService: {
    subscribe: vi.fn(),
    subscribePending: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    toggleComplete: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('useTasks', () => {
  const mockClinicId = 'clinic-123'
  const mockUser = { uid: 'user-123' }
  let mockUnsubscribe: ReturnType<typeof vi.fn>

  const mockTasks: Task[] = [
    {
      id: 'task-1',
      clinicId: mockClinicId,
      title: 'High Priority Task',
      description: 'Description',
      priority: 'high',
      status: TaskStatus.PENDING,
      createdBy: 'user-123',
      dueDate: new Date(Date.now() + 86400000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'task-2',
      clinicId: mockClinicId,
      title: 'Low Priority Task',
      description: 'Description',
      priority: 'low',
      status: TaskStatus.COMPLETED,
      createdBy: 'user-123',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'task-3',
      clinicId: mockClinicId,
      title: 'Medium Priority Task',
      description: 'Description',
      priority: 'medium',
      status: TaskStatus.PENDING,
      createdBy: 'user-123',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    mockUnsubscribe = vi.fn()

    vi.mocked(useClinicContext).mockReturnValue({
      clinicId: mockClinicId,
    } as ReturnType<typeof useClinicContext>)

    vi.mocked(useAuthContext).mockReturnValue({
      user: mockUser,
    } as ReturnType<typeof useAuthContext>)

    vi.mocked(taskService.subscribe).mockImplementation((_, onData) => {
      setTimeout(() => onData(mockTasks), 0)
      return mockUnsubscribe
    })

    vi.mocked(taskService.subscribePending).mockImplementation((_, onData) => {
      setTimeout(() => onData(mockTasks.filter(t => t.status === TaskStatus.PENDING)), 0)
      return mockUnsubscribe
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('initialization', () => {
    it('should initialize with empty tasks', () => {
      vi.mocked(taskService.subscribe).mockReturnValue(mockUnsubscribe)

      const { result } = renderHook(() => useTasks())

      expect(result.current.tasks).toEqual([])
      expect(result.current.loading).toBe(true)
    })

    it('should not subscribe without clinicId', () => {
      vi.mocked(useClinicContext).mockReturnValue({
        clinicId: null,
      } as unknown as ReturnType<typeof useClinicContext>)

      renderHook(() => useTasks())

      expect(taskService.subscribe).not.toHaveBeenCalled()
    })
  })

  describe('subscription', () => {
    it('should subscribe to all tasks by default', () => {
      renderHook(() => useTasks())

      expect(taskService.subscribe).toHaveBeenCalledWith(mockClinicId, expect.any(Function))
    })

    it('should subscribe to pending tasks only when specified', () => {
      renderHook(() => useTasks(true))

      expect(taskService.subscribePending).toHaveBeenCalledWith(mockClinicId, expect.any(Function))
    })

    it('should unsubscribe on unmount', () => {
      const { unmount } = renderHook(() => useTasks())

      unmount()

      expect(mockUnsubscribe).toHaveBeenCalled()
    })

    it('should receive tasks from subscription', async () => {
      vi.useFakeTimers()

      const { result } = renderHook(() => useTasks())

      await act(async () => {
        vi.runAllTimers()
      })

      expect(result.current.tasks.length).toBe(3)
      expect(result.current.loading).toBe(false)
    })
  })

  describe('sorting', () => {
    it('should sort tasks by priority (high first)', async () => {
      vi.useFakeTimers()

      const { result } = renderHook(() => useTasks())

      await act(async () => {
        vi.runAllTimers()
      })

      expect(result.current.tasks[0].priority).toBe('high')
    })

    it('should sort by due date within same priority', async () => {
      const tasksWithDates: Task[] = [
        {
          ...mockTasks[0],
          id: 'task-a',
          priority: 'high',
          dueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
        },
        {
          ...mockTasks[0],
          id: 'task-b',
          priority: 'high',
          dueDate: new Date(Date.now() + 86400000).toISOString(),
        },
      ]

      vi.mocked(taskService.subscribe).mockImplementation((_, onData) => {
        setTimeout(() => onData(tasksWithDates), 0)
        return mockUnsubscribe
      })

      vi.useFakeTimers()

      const { result } = renderHook(() => useTasks())

      await act(async () => {
        vi.runAllTimers()
      })

      // Earlier due date should come first
      expect(result.current.tasks[0].id).toBe('task-b')
    })
  })

  describe('derived states', () => {
    it('should compute pending tasks', async () => {
      vi.useFakeTimers()

      const { result } = renderHook(() => useTasks())

      await act(async () => {
        vi.runAllTimers()
      })

      expect(result.current.pendingTasks.length).toBe(2)
      expect(result.current.pendingTasks.every(t => t.status === TaskStatus.PENDING)).toBe(true)
    })
  })

  describe('CRUD operations', () => {
    it('should add task', async () => {
      vi.mocked(taskService.create).mockResolvedValue('new-task-id')

      const { result } = renderHook(() => useTasks())

      const newTask = {
        title: 'New Task',
        description: 'Description',
        priority: 'high' as const,
      }

      await act(async () => {
        const id = await result.current.addTask(newTask)
        expect(id).toBe('new-task-id')
      })

      expect(taskService.create).toHaveBeenCalledWith(mockClinicId, {
        ...newTask,
        status: TaskStatus.PENDING,
        createdBy: mockUser.uid,
      })
    })

    it('should throw error when adding without clinic', async () => {
      vi.mocked(useClinicContext).mockReturnValue({
        clinicId: null,
      } as unknown as ReturnType<typeof useClinicContext>)

      const { result } = renderHook(() => useTasks())

      await expect(
        result.current.addTask({
          title: 'Test',
          description: 'Test',
          priority: 'medium',
        })
      ).rejects.toThrow('No clinic selected')
    })

    it('should throw error when adding without user', async () => {
      vi.mocked(useAuthContext).mockReturnValue({
        user: null,
      } as unknown as ReturnType<typeof useAuthContext>)

      const { result } = renderHook(() => useTasks())

      await expect(
        result.current.addTask({
          title: 'Test',
          description: 'Test',
          priority: 'medium',
        })
      ).rejects.toThrow('User not authenticated')
    })

    it('should update task', async () => {
      vi.mocked(taskService.update).mockResolvedValue()

      const { result } = renderHook(() => useTasks())

      await act(async () => {
        await result.current.updateTask('task-1', { title: 'Updated' })
      })

      expect(taskService.update).toHaveBeenCalledWith(mockClinicId, 'task-1', { title: 'Updated' })
    })

    it('should toggle complete', async () => {
      vi.mocked(taskService.toggleComplete).mockResolvedValue()

      const { result } = renderHook(() => useTasks())

      await act(async () => {
        await result.current.toggleComplete('task-1', TaskStatus.PENDING)
      })

      expect(taskService.toggleComplete).toHaveBeenCalledWith(
        mockClinicId,
        'task-1',
        TaskStatus.PENDING
      )
    })

    it('should delete task', async () => {
      vi.mocked(taskService.delete).mockResolvedValue()

      const { result } = renderHook(() => useTasks())

      await act(async () => {
        await result.current.deleteTask('task-1')
      })

      expect(taskService.delete).toHaveBeenCalledWith(mockClinicId, 'task-1')
    })
  })

  describe('error handling', () => {
    it('should throw error on update without clinic', async () => {
      vi.mocked(useClinicContext).mockReturnValue({
        clinicId: null,
      } as unknown as ReturnType<typeof useClinicContext>)

      const { result } = renderHook(() => useTasks())

      await expect(result.current.updateTask('task-1', { title: 'Test' })).rejects.toThrow(
        'No clinic selected'
      )
    })

    it('should throw error on toggle without clinic', async () => {
      vi.mocked(useClinicContext).mockReturnValue({
        clinicId: null,
      } as unknown as ReturnType<typeof useClinicContext>)

      const { result } = renderHook(() => useTasks())

      await expect(result.current.toggleComplete('task-1', TaskStatus.PENDING)).rejects.toThrow(
        'No clinic selected'
      )
    })

    it('should throw error on delete without clinic', async () => {
      vi.mocked(useClinicContext).mockReturnValue({
        clinicId: null,
      } as unknown as ReturnType<typeof useClinicContext>)

      const { result } = renderHook(() => useTasks())

      await expect(result.current.deleteTask('task-1')).rejects.toThrow('No clinic selected')
    })
  })
})
