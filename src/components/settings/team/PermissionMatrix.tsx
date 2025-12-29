/**
 * Permission Matrix Component
 *
 * Visual representation of role-based permissions.
 * Shows which roles can perform which actions on each resource.
 *
 * @module components/settings/team/PermissionMatrix
 */

import { Check, X, Eye, Plus, Pencil, Trash2 } from 'lucide-react'
import type { UserRole } from '@/types/clinic/clinic'

interface PermissionMatrixProps {
  className?: string
}

interface ResourcePermissions {
  label: string
  read: UserRole[]
  create: UserRole[]
  update: UserRole[]
  delete: UserRole[]
}

const PERMISSIONS: ResourcePermissions[] = [
  {
    label: 'Pacientes',
    read: ['owner', 'admin', 'professional', 'receptionist'],
    create: ['owner', 'admin', 'professional', 'receptionist'],
    update: ['owner', 'admin', 'professional'],
    delete: ['owner'],
  },
  {
    label: 'Prontuários',
    read: ['owner', 'admin', 'professional'],
    create: ['owner', 'professional'],
    update: ['owner', 'professional'],
    delete: [],
  },
  {
    label: 'Agenda',
    read: ['owner', 'admin', 'professional', 'receptionist'],
    create: ['owner', 'admin', 'professional', 'receptionist'],
    update: ['owner', 'admin', 'professional', 'receptionist'],
    delete: ['owner', 'admin'],
  },
  {
    label: 'Financeiro',
    read: ['owner', 'admin'],
    create: ['owner', 'admin'],
    update: ['owner', 'admin'],
    delete: ['owner'],
  },
  {
    label: 'Configurações',
    read: ['owner', 'admin', 'professional', 'receptionist'],
    create: ['owner'],
    update: ['owner'],
    delete: ['owner'],
  },
  {
    label: 'Guias TISS',
    read: ['owner', 'admin', 'professional', 'receptionist'],
    create: ['owner', 'admin', 'professional'],
    update: ['owner', 'admin', 'professional'],
    delete: ['owner'],
  },
  {
    label: 'IA Clínica',
    read: ['owner', 'admin', 'professional'],
    create: ['owner', 'professional'],
    update: [],
    delete: [],
  },
]

const ROLES: { role: UserRole; label: string; color: string }[] = [
  { role: 'owner', label: 'Proprietário', color: 'text-amber-600' },
  { role: 'admin', label: 'Admin', color: 'text-purple-600' },
  { role: 'professional', label: 'Profissional', color: 'text-genesis-primary' },
  { role: 'receptionist', label: 'Recepção', color: 'text-gray-600' },
]

const ACTIONS = [
  { key: 'read' as const, icon: Eye, label: 'Ver' },
  { key: 'create' as const, icon: Plus, label: 'Criar' },
  { key: 'update' as const, icon: Pencil, label: 'Editar' },
  { key: 'delete' as const, icon: Trash2, label: 'Excluir' },
]

export function PermissionMatrix({ className = '' }: PermissionMatrixProps): React.ReactElement {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="text-left p-3 bg-genesis-soft rounded-tl-xl">
              <span className="text-sm font-semibold text-genesis-dark">Recurso</span>
            </th>
            <th className="p-3 bg-genesis-soft">
              <span className="text-sm font-medium text-genesis-muted">Ação</span>
            </th>
            {ROLES.map((role, idx) => (
              <th
                key={role.role}
                className={`p-3 bg-genesis-soft text-center ${idx === ROLES.length - 1 ? 'rounded-tr-xl' : ''}`}
              >
                <span className={`text-sm font-semibold ${role.color}`}>{role.label}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PERMISSIONS.map((resource, resourceIdx) =>
            ACTIONS.map((action, actionIdx) => {
              const isFirstAction = actionIdx === 0
              const isLastAction = actionIdx === ACTIONS.length - 1
              const isLastResource = resourceIdx === PERMISSIONS.length - 1
              const ActionIcon = action.icon

              return (
                <tr
                  key={`${resource.label}-${action.key}`}
                  className={`
                    ${isLastAction && !isLastResource ? 'border-b border-genesis-border-subtle' : ''}
                  `}
                >
                  {/* Resource name (only on first action row) */}
                  {isFirstAction ? (
                    <td
                      rowSpan={4}
                      className={`
                        p-3 align-top border-r border-genesis-border-subtle
                        ${isLastResource ? 'rounded-bl-xl' : ''}
                      `}
                    >
                      <span className="font-medium text-genesis-dark">{resource.label}</span>
                    </td>
                  ) : null}

                  {/* Action */}
                  <td className="p-2 text-center border-r border-genesis-border-subtle">
                    <div className="flex items-center justify-center gap-1.5 text-genesis-muted">
                      <ActionIcon className="w-3.5 h-3.5" />
                      <span className="text-xs">{action.label}</span>
                    </div>
                  </td>

                  {/* Permission cells */}
                  {ROLES.map((role, roleIdx) => {
                    const hasPermission = resource[action.key].includes(role.role)
                    const isLastCell = roleIdx === ROLES.length - 1
                    const isBottomRight = isLastResource && isLastAction && isLastCell

                    return (
                      <td
                        key={role.role}
                        className={`
                          p-2 text-center
                          ${isBottomRight ? 'rounded-br-xl' : ''}
                        `}
                      >
                        {hasPermission ? (
                          <div className="inline-flex items-center justify-center w-6 h-6 bg-success-soft rounded-full">
                            <Check className="w-3.5 h-3.5 text-success" />
                          </div>
                        ) : (
                          <div className="inline-flex items-center justify-center w-6 h-6 bg-gray-100 rounded-full">
                            <X className="w-3.5 h-3.5 text-gray-400" />
                          </div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              )
            })
          )}
        </tbody>
      </table>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-4 text-xs text-genesis-muted">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-success-soft rounded-full flex items-center justify-center">
            <Check className="w-3 h-3 text-success" />
          </div>
          <span>Permitido</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center">
            <X className="w-3 h-3 text-gray-400" />
          </div>
          <span>Não permitido</span>
        </div>
      </div>
    </div>
  )
}
