/**
 * Team Member Card Component
 *
 * Displays a team member with avatar, role, and actions.
 *
 * @module components/settings/team/TeamMemberCard
 */

import { useState } from 'react'
import { MoreVertical, UserMinus, Mail, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { RoleSelector } from './RoleSelector'
import type { TeamMember } from '@/hooks/useTeamMembers'
import type { UserRole } from '@/types/clinic/clinic'

interface TeamMemberCardProps {
  member: TeamMember
  isCurrentUser: boolean
  canManage: boolean
  onRoleChange: (userId: string, newRole: UserRole) => Promise<void>
  onRemove: (userId: string) => Promise<void>
}

export function TeamMemberCard({
  member,
  isCurrentUser,
  canManage,
  onRoleChange,
  onRemove,
}: TeamMemberCardProps): React.ReactElement {
  const [isUpdating, setIsUpdating] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const avatarUrl =
    member.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(member.displayName)}&background=0D9488&color=fff`

  const handleRoleChange = async (newRole: UserRole) => {
    if (newRole === member.role) return

    setIsUpdating(true)
    try {
      await onRoleChange(member.id, newRole)
      toast.success('Role atualizado', {
        description: `${member.displayName} agora é ${getRoleLabel(newRole)}`,
      })
    } catch (err) {
      toast.error('Erro ao atualizar role', {
        description: err instanceof Error ? err.message : 'Tente novamente',
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRemove = async () => {
    if (!confirm(`Remover ${member.displayName} da equipe?`)) return

    setIsUpdating(true)
    try {
      await onRemove(member.id)
      toast.success('Membro removido', {
        description: `${member.displayName} foi removido da equipe`,
      })
    } catch (err) {
      toast.error('Erro ao remover membro', {
        description: err instanceof Error ? err.message : 'Tente novamente',
      })
    } finally {
      setIsUpdating(false)
      setShowMenu(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div
      className={`
        flex items-center gap-4 p-4 bg-genesis-surface rounded-xl
        border border-genesis-border-subtle
        transition-all duration-200
        ${isCurrentUser ? 'ring-2 ring-genesis-primary/20' : ''}
        ${isUpdating ? 'opacity-50 pointer-events-none' : ''}
      `}
    >
      {/* Avatar */}
      <img
        src={avatarUrl}
        alt={member.displayName}
        className="w-12 h-12 rounded-full object-cover flex-shrink-0"
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-genesis-dark truncate">{member.displayName}</h4>
          {isCurrentUser && (
            <span className="text-xs px-2 py-0.5 bg-genesis-primary/10 text-genesis-primary rounded-full">
              Você
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 mt-1 text-sm text-genesis-muted">
          <span className="flex items-center gap-1 truncate">
            <Mail className="w-3.5 h-3.5" />
            {member.email}
          </span>
          {member.specialty && <span className="hidden sm:block">• {member.specialty}</span>}
        </div>

        <div className="flex items-center gap-1 mt-1 text-xs text-genesis-subtle">
          <Calendar className="w-3 h-3" />
          Desde {formatDate(member.createdAt)}
        </div>
      </div>

      {/* Role Selector */}
      <div className="flex-shrink-0">
        <RoleSelector
          value={member.role}
          onChange={handleRoleChange}
          disabled={!canManage || isCurrentUser || member.role === 'owner'}
          isOwner={member.role === 'owner'}
        />
      </div>

      {/* Actions Menu */}
      {canManage && !isCurrentUser && member.role !== 'owner' && (
        <div className="relative flex-shrink-0">
          <button
            type="button"
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-genesis-hover rounded-lg transition-colors"
          >
            <MoreVertical className="w-4 h-4 text-genesis-muted" />
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full mt-1 w-48 bg-genesis-surface border border-genesis-border-subtle rounded-xl shadow-xl z-50 overflow-hidden">
                <button
                  type="button"
                  onClick={handleRemove}
                  className="w-full flex items-center gap-2 px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors"
                >
                  <UserMinus className="w-4 h-4" />
                  Remover da equipe
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    owner: 'Proprietário',
    admin: 'Administrador',
    professional: 'Profissional',
    receptionist: 'Recepcionista',
  }
  return labels[role]
}
