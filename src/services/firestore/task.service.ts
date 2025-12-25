/**
 * Task Service
 *
 * Handles CRUD operations for tasks in Firestore.
 * Tasks are stored as subcollections under clinics for multi-tenancy.
 *
 * Collection: /clinics/{clinicId}/tasks/{taskId}
 */

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { db } from '../firebase'
import type { Task, TaskStatus, TaskPriority, CreateTaskInput, UpdateTaskInput } from '@/types'

/**
 * Get the tasks collection reference for a clinic.
 */
function getTasksCollection(clinicId: string) {
  return collection(db, 'clinics', clinicId, 'tasks')
}

/**
 * Converts Firestore document data to Task type.
 */
function toTask(id: string, data: Record<string, unknown>): Task {
  return {
    id,
    title: data.title as string,
    description: data.description as string | undefined,
    priority: data.priority as TaskPriority,
    status: data.status as TaskStatus,
    patientId: data.patientId as string | undefined,
    patientName: data.patientName as string | undefined,
    dueDate: data.dueDate as string | undefined,
    createdAt:
      data.createdAt instanceof Timestamp
        ? data.createdAt.toDate().toISOString()
        : (data.createdAt as string),
    createdBy: data.createdBy as string,
    completedAt: data.completedAt as string | undefined,
  }
}

/**
 * Task service for Firestore operations.
 */
export const taskService = {
  /**
   * Get all tasks for a clinic.
   *
   * @param clinicId - The clinic ID
   * @returns Array of tasks sorted by creation date (descending)
   */
  async getAll(clinicId: string): Promise<Task[]> {
    const tasksRef = getTasksCollection(clinicId)
    const q = query(tasksRef, orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map(docSnap => toTask(docSnap.id, docSnap.data()))
  },

  /**
   * Get pending tasks for a clinic.
   *
   * @param clinicId - The clinic ID
   * @returns Array of pending tasks sorted by priority and due date
   */
  async getPending(clinicId: string): Promise<Task[]> {
    const tasksRef = getTasksCollection(clinicId)
    const q = query(tasksRef, where('status', '==', 'pending'), orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map(docSnap => toTask(docSnap.id, docSnap.data()))
  },

  /**
   * Get a task by ID.
   *
   * @param clinicId - The clinic ID
   * @param taskId - The task ID
   * @returns The task or null if not found
   */
  async getById(clinicId: string, taskId: string): Promise<Task | null> {
    const docRef = doc(db, 'clinics', clinicId, 'tasks', taskId)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      return null
    }

    return toTask(docSnap.id, docSnap.data())
  },

  /**
   * Create a new task.
   *
   * @param clinicId - The clinic ID
   * @param data - The task data
   * @returns The created task ID
   */
  async create(clinicId: string, data: CreateTaskInput): Promise<string> {
    const tasksRef = getTasksCollection(clinicId)

    const taskData = {
      title: data.title,
      description: data.description || null,
      priority: data.priority,
      status: data.status,
      patientId: data.patientId || null,
      patientName: data.patientName || null,
      dueDate: data.dueDate || null,
      createdBy: data.createdBy,
      createdAt: serverTimestamp(),
      completedAt: null,
    }

    const docRef = await addDoc(tasksRef, taskData)

    return docRef.id
  },

  /**
   * Update an existing task.
   *
   * @param clinicId - The clinic ID
   * @param taskId - The task ID
   * @param data - The fields to update
   */
  async update(clinicId: string, taskId: string, data: UpdateTaskInput): Promise<void> {
    const docRef = doc(db, 'clinics', clinicId, 'tasks', taskId)

    const updateData: Record<string, unknown> = { ...data }

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key]
      }
    })

    await updateDoc(docRef, updateData)
  },

  /**
   * Toggle task completion status.
   *
   * @param clinicId - The clinic ID
   * @param taskId - The task ID
   * @param currentStatus - The current status
   */
  async toggleComplete(clinicId: string, taskId: string, currentStatus: TaskStatus): Promise<void> {
    const docRef = doc(db, 'clinics', clinicId, 'tasks', taskId)

    if (currentStatus === 'pending') {
      await updateDoc(docRef, {
        status: 'completed',
        completedAt: new Date().toISOString(),
      })
    } else {
      await updateDoc(docRef, {
        status: 'pending',
        completedAt: null,
      })
    }
  },

  /**
   * Delete a task.
   *
   * @param clinicId - The clinic ID
   * @param taskId - The task ID
   */
  async delete(clinicId: string, taskId: string): Promise<void> {
    const docRef = doc(db, 'clinics', clinicId, 'tasks', taskId)
    await deleteDoc(docRef)
  },

  /**
   * Subscribe to real-time updates for all tasks.
   *
   * @param clinicId - The clinic ID
   * @param callback - Function called with updated tasks array
   * @returns Unsubscribe function
   */
  subscribe(clinicId: string, callback: (tasks: Task[]) => void): () => void {
    const tasksRef = getTasksCollection(clinicId)
    const q = query(tasksRef, orderBy('createdAt', 'desc'))

    return onSnapshot(
      q,
      querySnapshot => {
        const tasks = querySnapshot.docs.map(docSnap => toTask(docSnap.id, docSnap.data()))
        callback(tasks)
      },
      error => {
        console.error('Error subscribing to tasks:', error)
        callback([])
      }
    )
  },

  /**
   * Subscribe to real-time updates for pending tasks only.
   *
   * @param clinicId - The clinic ID
   * @param callback - Function called with updated tasks array
   * @returns Unsubscribe function
   */
  subscribePending(clinicId: string, callback: (tasks: Task[]) => void): () => void {
    const tasksRef = getTasksCollection(clinicId)
    const q = query(tasksRef, where('status', '==', 'pending'), orderBy('createdAt', 'desc'))

    return onSnapshot(
      q,
      querySnapshot => {
        const tasks = querySnapshot.docs.map(docSnap => toTask(docSnap.id, docSnap.data()))
        callback(tasks)
      },
      error => {
        console.error('Error subscribing to pending tasks:', error)
        callback([])
      }
    )
  },

  /**
   * Subscribe to real-time updates for a patient's tasks.
   *
   * @param clinicId - The clinic ID
   * @param patientId - The patient ID
   * @param callback - Function called with updated tasks array
   * @returns Unsubscribe function
   */
  subscribeByPatient(
    clinicId: string,
    patientId: string,
    callback: (tasks: Task[]) => void
  ): () => void {
    const tasksRef = getTasksCollection(clinicId)
    const q = query(tasksRef, where('patientId', '==', patientId), orderBy('createdAt', 'desc'))

    return onSnapshot(
      q,
      querySnapshot => {
        const tasks = querySnapshot.docs.map(docSnap => toTask(docSnap.id, docSnap.data()))
        callback(tasks)
      },
      error => {
        console.error('Error subscribing to patient tasks:', error)
        callback([])
      }
    )
  },
}
