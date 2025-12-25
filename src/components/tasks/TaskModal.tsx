/**
 * Task Modal Component
 *
 * Premium modal for creating and editing tasks.
 * Features patient search (optional), priority selection, and due date.
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react'
import {
  FileText,
  User,
  Calendar,
  Flag,
  Search,
  Loader2,
  Check,
  AlertCircle,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { Modal } from '@/design-system'
import { usePatients } from '@/hooks/usePatients'
import { useTasks } from '@/hooks/useTasks'
import { TaskPriority, TASK_PRIORITY_CONFIG } from '@/types'
import type { Task } from '@/types'

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  /** Task to edit (undefined for new task) */
  task?: Task
}

const PRIORITIES = [
  { value: TaskPriority.HIGH, label: 'Alta', icon: '🔴' },
  { value: TaskPriority.MEDIUM, label: 'Média', icon: '🟡' },
  { value: TaskPriority.LOW, label: 'Baixa', icon: '⚪' },
]

export function TaskModal({ isOpen, onClose, task }: TaskModalProps) {
  const { patients, loading: patientsLoading } = usePatients()
  const { addTask, updateTask, deleteTask, toggleComplete } = useTasks()

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.MEDIUM)
  const [dueDate, setDueDate] = useState('')
  const [patientSearch, setPatientSearch] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<{
    id: string
    name: string
  } | null>(null)
  const [showPatientList, setShowPatientList] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const isEditing = !!task

  // Populate form when editing
  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description || '')
      setPriority(task.priority)
      setDueDate(task.dueDate ? task.dueDate.split('T')[0] : '')
      if (task.patientId && task.patientName) {
        setSelectedPatient({ id: task.patientId, name: task.patientName })
        setPatientSearch(task.patientName)
      }
    }
  }, [task])

  // Filter patients based on search
  const filteredPatients = useMemo(() => {
    if (!patientSearch.trim()) return patients.slice(0, 8)
    const search = patientSearch.toLowerCase()
    return patients.filter(p => p.name.toLowerCase().includes(search)).slice(0, 8)
  }, [patients, patientSearch])

  // Reset form
  const resetForm = useCallback(() => {
    setTitle('')
    setDescription('')
    setPriority(TaskPriority.MEDIUM)
    setDueDate('')
    setPatientSearch('')
    setSelectedPatient(null)
    setShowPatientList(false)
  }, [])

  // Handle close
  const handleClose = useCallback(() => {
    resetForm()
    onClose()
  }, [onClose, resetForm])

  // Handle patient selection
  const handleSelectPatient = useCallback((patient: { id: string; name: string }) => {
    setSelectedPatient(patient)
    setPatientSearch(patient.name)
    setShowPatientList(false)
  }, [])

  // Clear patient selection
  const handleClearPatient = useCallback(() => {
    setSelectedPatient(null)
    setPatientSearch('')
  }, [])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      toast.error('Digite um título para a tarefa')
      return
    }

    setSaving(true)

    try {
      const taskData = {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        dueDate: dueDate || undefined,
        patientId: selectedPatient?.id,
        patientName: selectedPatient?.name,
      }

      if (isEditing && task) {
        await updateTask(task.id, taskData)
        toast.success('Tarefa atualizada!')
      } else {
        await addTask(taskData)
        toast.success('Tarefa criada!')
      }

      handleClose()
    } catch (error) {
      console.error('Failed to save task:', error)
      toast.error(isEditing ? 'Erro ao atualizar tarefa' : 'Erro ao criar tarefa')
    } finally {
      setSaving(false)
    }
  }

  // Handle delete
  const handleDelete = async () => {
    if (!task) return

    setDeleting(true)

    try {
      await deleteTask(task.id)
      toast.success('Tarefa excluída!')
      handleClose()
    } catch (error) {
      console.error('Failed to delete task:', error)
      toast.error('Erro ao excluir tarefa')
    } finally {
      setDeleting(false)
    }
  }

  // Handle toggle complete
  const handleToggleComplete = async () => {
    if (!task) return

    try {
      await toggleComplete(task.id, task.status)
      toast.success(task.status === 'pending' ? 'Tarefa concluída!' : 'Tarefa reaberta!')
      handleClose()
    } catch (error) {
      console.error('Failed to toggle task:', error)
      toast.error('Erro ao atualizar tarefa')
    }
  }

  const priorityConfig = TASK_PRIORITY_CONFIG[priority]

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? 'Editar Tarefa' : 'Nova Tarefa'}
      size="lg"
      footer={
        <>
          {isEditing && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="mr-auto flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors disabled:opacity-50"
            >
              {deleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              Excluir
            </button>
          )}
          <button
            type="button"
            onClick={handleClose}
            className="px-5 py-2.5 text-sm font-medium text-genesis-muted hover:text-genesis-dark hover:bg-genesis-hover rounded-xl transition-colors"
          >
            Cancelar
          </button>
          {isEditing && task?.status === 'pending' && (
            <button
              type="button"
              onClick={handleToggleComplete}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-0.5"
            >
              <Check className="w-4 h-4" />
              Concluir
            </button>
          )}
          <button
            type="submit"
            form="task-form"
            disabled={saving || !title.trim()}
            className="flex items-center gap-2 px-6 py-2.5 bg-genesis-primary text-white rounded-xl text-sm font-bold hover:bg-genesis-primary-dark shadow-lg shadow-genesis-primary/30 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                {isEditing ? 'Salvar' : 'Criar Tarefa'}
              </>
            )}
          </button>
        </>
      }
    >
      <form id="task-form" onSubmit={handleSubmit} className="space-y-5">
        {/* Completed indicator */}
        {isEditing && task?.status === 'completed' && (
          <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl">
            <Check className="w-5 h-5 text-emerald-500" />
            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
              Tarefa concluída
            </span>
            <button
              type="button"
              onClick={handleToggleComplete}
              className="ml-auto text-xs font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
            >
              Reabrir
            </button>
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-genesis-dark mb-2">
            <FileText className="w-4 h-4 inline-block mr-2 text-genesis-muted" />
            Título
          </label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Ex: Ligar para paciente sobre resultados"
            className="w-full px-4 py-3 bg-genesis-surface border border-genesis-border rounded-xl text-genesis-dark placeholder:text-genesis-subtle focus:outline-none focus:ring-2 focus:ring-genesis-primary/20 focus:border-genesis-primary transition-all"
            autoFocus
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-genesis-dark mb-2">
            <FileText className="w-4 h-4 inline-block mr-2 text-genesis-muted" />
            Descrição (opcional)
          </label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Detalhes adicionais sobre a tarefa..."
            rows={3}
            className="w-full px-4 py-3 bg-genesis-surface border border-genesis-border rounded-xl text-genesis-dark placeholder:text-genesis-subtle focus:outline-none focus:ring-2 focus:ring-genesis-primary/20 focus:border-genesis-primary transition-all resize-none"
          />
        </div>

        {/* Priority & Due Date Row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-genesis-dark mb-2">
              <Flag className="w-4 h-4 inline-block mr-2 text-genesis-muted" />
              Prioridade
            </label>
            <div className="flex gap-2">
              {PRIORITIES.map(p => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPriority(p.value)}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-all border ${
                    priority === p.value
                      ? `${TASK_PRIORITY_CONFIG[p.value].bgColor} ${TASK_PRIORITY_CONFIG[p.value].color} border-current`
                      : 'bg-genesis-surface border-genesis-border text-genesis-muted hover:bg-genesis-hover'
                  }`}
                >
                  <span className="mr-1">{p.icon}</span> {p.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-genesis-dark mb-2">
              <Calendar className="w-4 h-4 inline-block mr-2 text-genesis-muted" />
              Vencimento (opcional)
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="w-full px-4 py-3 bg-genesis-surface border border-genesis-border rounded-xl text-genesis-dark focus:outline-none focus:ring-2 focus:ring-genesis-primary/20 focus:border-genesis-primary transition-all"
            />
          </div>
        </div>

        {/* Patient Selection (Optional) */}
        <div className="relative">
          <label className="block text-sm font-medium text-genesis-dark mb-2">
            <User className="w-4 h-4 inline-block mr-2 text-genesis-muted" />
            Paciente (opcional)
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-genesis-muted" />
            <input
              type="text"
              value={patientSearch}
              onChange={e => {
                setPatientSearch(e.target.value)
                setSelectedPatient(null)
                setShowPatientList(true)
              }}
              onFocus={() => setShowPatientList(true)}
              placeholder="Buscar paciente..."
              className="w-full pl-10 pr-10 py-3 bg-genesis-surface border border-genesis-border rounded-xl text-genesis-dark placeholder:text-genesis-subtle focus:outline-none focus:ring-2 focus:ring-genesis-primary/20 focus:border-genesis-primary transition-all"
            />
            {selectedPatient ? (
              <button
                type="button"
                onClick={handleClearPatient}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-genesis-muted hover:text-genesis-dark"
              >
                <AlertCircle className="w-4 h-4" />
              </button>
            ) : null}
          </div>

          {/* Patient Dropdown */}
          {showPatientList && !selectedPatient && patientSearch && (
            <div className="absolute z-20 w-full mt-2 bg-genesis-surface border border-genesis-border rounded-xl shadow-xl max-h-48 overflow-auto">
              {patientsLoading ? (
                <div className="p-4 text-center">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto text-genesis-muted" />
                </div>
              ) : filteredPatients.length === 0 ? (
                <div className="p-4 text-center text-genesis-muted text-sm">
                  Nenhum paciente encontrado
                </div>
              ) : (
                filteredPatients.map(patient => (
                  <button
                    key={patient.id}
                    type="button"
                    onClick={() => handleSelectPatient({ id: patient.id, name: patient.name })}
                    className="w-full px-4 py-3 text-left hover:bg-genesis-hover transition-colors flex items-center gap-3 border-b border-genesis-border-subtle last:border-0"
                  >
                    <div className="w-8 h-8 rounded-full bg-genesis-primary/10 flex items-center justify-center text-xs font-bold text-genesis-primary">
                      {patient.name
                        .split(' ')
                        .map(n => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <p className="font-medium text-genesis-dark text-sm">{patient.name}</p>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Summary */}
        {title.trim() && (
          <div className={`p-4 rounded-xl border ${priorityConfig.bgColor} border-current/20`}>
            <p className="text-xs font-medium text-genesis-muted mb-2">Resumo</p>
            <p className="text-sm text-genesis-dark">
              <span className={`font-semibold ${priorityConfig.color}`}>
                [{TASK_PRIORITY_CONFIG[priority].label}]
              </span>{' '}
              <strong>{title}</strong>
              {selectedPatient && <> • {selectedPatient.name}</>}
              {dueDate && <> • até {format(new Date(dueDate + 'T00:00:00'), "dd 'de' MMM")}</>}
            </p>
          </div>
        )}
      </form>
    </Modal>
  )
}

export default TaskModal
