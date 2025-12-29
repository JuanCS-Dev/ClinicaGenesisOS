/**
 * Team Settings Component
 *
 * Main component for managing clinic team members and roles.
 * Includes member list, role assignment, and permission matrix.
 *
 * @module components/settings/team/TeamSettings
 */

import { useState } from 'react'
import { Users, UserPlus, Shield, Loader2, RefreshCw, AlertCircle } from 'lucide-react'
import { useTeamMembers } from '@/hooks/useTeamMembers'
import { useClinicContext } from '@/contexts/ClinicContext'
import { useAuthContext } from '@/contexts/AuthContext'
import { TeamMemberCard } from './TeamMemberCard'
import { PermissionMatrix } from './PermissionMatrix'
import { InviteMemberModal } from './InviteMemberModal'

type TabId = 'members' | 'permissions'

export function TeamSettings(): React.ReactElement {
  const { clinic, userProfile } = useClinicContext()
  const { user } = useAuthContext()
  const { members, loading, error, updateRole, removeMember, refresh } = useTeamMembers()
  const [activeTab, setActiveTab] = useState<TabId>('members')
  const [showInviteModal, setShowInviteModal] = useState(false)

  const isOwner = userProfile?.role === 'owner'
  const canManage = isOwner || userProfile?.role === 'admin'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
            <Users className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-semibold text-genesis-dark">Equipe</h3>
            <p className="text-sm text-genesis-muted">
              {members.length} {members.length === 1 ? 'membro' : 'membros'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            className="p-2 hover:bg-genesis-hover rounded-lg transition-colors"
            title="Atualizar"
          >
            <RefreshCw className={`w-4 h-4 text-genesis-muted ${loading ? 'animate-spin' : ''}`} />
          </button>

          {isOwner && (
            <button
              type="button"
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-genesis-primary text-white rounded-xl font-medium hover:bg-genesis-primary-dark transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <UserPlus className="w-4 h-4" />
              Convidar
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-genesis-soft rounded-xl">
        <button
          type="button"
          onClick={() => setActiveTab('members')}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
            ${activeTab === 'members' ? 'bg-genesis-surface text-genesis-dark shadow-sm' : 'text-genesis-muted hover:text-genesis-dark'}
          `}
        >
          <Users className="w-4 h-4" />
          Membros
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('permissions')}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
            ${activeTab === 'permissions' ? 'bg-genesis-surface text-genesis-dark shadow-sm' : 'text-genesis-muted hover:text-genesis-dark'}
          `}
        >
          <Shield className="w-4 h-4" />
          Permissões
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-[300px]">
        {/* Members Tab */}
        {activeTab === 'members' && (
          <div className="space-y-3">
            {loading && members.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-genesis-primary animate-spin" />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="w-12 h-12 text-danger mb-3" />
                <p className="text-genesis-dark font-medium">{error}</p>
                <button
                  type="button"
                  onClick={refresh}
                  className="mt-3 text-sm text-genesis-primary hover:underline"
                >
                  Tentar novamente
                </button>
              </div>
            ) : members.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="w-12 h-12 text-genesis-muted mb-3" />
                <p className="text-genesis-dark font-medium">Nenhum membro encontrado</p>
                <p className="text-sm text-genesis-muted mt-1">Convide membros para sua equipe</p>
              </div>
            ) : (
              members.map(member => (
                <TeamMemberCard
                  key={member.id}
                  member={member}
                  isCurrentUser={member.id === user?.uid}
                  canManage={canManage}
                  onRoleChange={updateRole}
                  onRemove={removeMember}
                />
              ))
            )}

            {/* Role Info Box */}
            {!loading && members.length > 0 && (
              <div className="mt-6 p-4 bg-info-soft border border-info/20 rounded-xl">
                <h4 className="font-medium text-info-dark mb-2">Sobre as funções</h4>
                <ul className="text-sm text-info-dark/80 space-y-1">
                  <li>
                    • <strong>Proprietário:</strong> Acesso total, gerencia equipe e configurações
                  </li>
                  <li>
                    • <strong>Administrador:</strong> Gerencia financeiro e equipe, sem acesso a
                    prontuários
                  </li>
                  <li>
                    • <strong>Profissional:</strong> Atende pacientes, cria prontuários e
                    prescrições
                  </li>
                  <li>
                    • <strong>Recepcionista:</strong> Gerencia agenda e cadastros básicos
                  </li>
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Permissions Tab */}
        {activeTab === 'permissions' && (
          <div className="bg-genesis-surface rounded-xl border border-genesis-border-subtle p-6">
            <div className="mb-6">
              <h4 className="font-semibold text-genesis-dark mb-1">Matriz de Permissões</h4>
              <p className="text-sm text-genesis-muted">
                Visualize o que cada função pode fazer no sistema
              </p>
            </div>
            <PermissionMatrix />
          </div>
        )}
      </div>

      {/* Invite Modal */}
      <InviteMemberModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        clinicId={clinic?.id || ''}
        clinicName={clinic?.name || 'Clínica'}
      />
    </div>
  )
}
