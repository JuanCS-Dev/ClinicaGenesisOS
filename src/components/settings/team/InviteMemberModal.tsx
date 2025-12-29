/**
 * Invite Member Modal Component
 *
 * Modal for inviting new team members to the clinic.
 *
 * @module components/settings/team/InviteMemberModal
 */

import { useState } from 'react'
import { X, Mail, UserPlus, Loader2, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'
import { RoleSelector } from './RoleSelector'
import type { UserRole } from '@/types/clinic/clinic'

interface InviteMemberModalProps {
  isOpen: boolean
  onClose: () => void
  clinicId: string
  clinicName: string
}

export function InviteMemberModal({
  isOpen,
  onClose,
  clinicId,
  clinicName,
}: InviteMemberModalProps): React.ReactElement | null {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<UserRole>('professional')
  const [isLoading, setIsLoading] = useState(false)
  const [inviteLink, setInviteLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      toast.error('Email obrigatório')
      return
    }

    setIsLoading(true)

    try {
      // Generate invite link (in production, this would be a Cloud Function)
      const inviteData = {
        clinicId,
        role,
        email: email.trim(),
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
      }

      // Base64 encode the invite data
      const encodedInvite = btoa(JSON.stringify(inviteData))
      const link = `${window.location.origin}/join?invite=${encodedInvite}`

      setInviteLink(link)
      toast.success('Link de convite gerado', {
        description: 'Envie o link para o novo membro',
      })
    } catch (err) {
      toast.error('Erro ao gerar convite', {
        description: err instanceof Error ? err.message : 'Tente novamente',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyLink = async () => {
    if (!inviteLink) return

    try {
      await navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      toast.success('Link copiado!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Erro ao copiar')
    }
  }

  const handleClose = () => {
    setEmail('')
    setRole('professional')
    setInviteLink(null)
    setCopied(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in">
      <div className="bg-genesis-surface rounded-2xl shadow-xl w-full max-w-md animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-genesis-border-subtle">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-genesis-primary/10 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-genesis-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-genesis-dark">Convidar Membro</h2>
              <p className="text-sm text-genesis-muted">Adicionar à {clinicName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 hover:bg-genesis-hover rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-genesis-muted" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {!inviteLink ? (
            <>
              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-genesis-text mb-2">
                  Email do novo membro
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-genesis-muted" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="email@exemplo.com"
                    className="w-full pl-10 pr-4 py-2.5 border border-genesis-border rounded-xl focus:ring-2 focus:ring-genesis-primary/20 focus:border-genesis-primary transition-all"
                    required
                    autoFocus
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-genesis-text mb-2">
                  Função na clínica
                </label>
                <RoleSelector value={role} onChange={setRole} />
                <p className="mt-2 text-xs text-genesis-muted">
                  {role === 'admin' && 'Pode gerenciar equipe, financeiro e configurações'}
                  {role === 'professional' &&
                    'Pode atender pacientes, criar prontuários e prescrições'}
                  {role === 'receptionist' && 'Pode gerenciar agenda e cadastros de pacientes'}
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !email.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-genesis-primary text-white rounded-xl font-medium hover:bg-genesis-primary-dark transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Gerando convite...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Gerar Link de Convite
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              {/* Success State */}
              <div className="text-center py-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-success-soft rounded-full flex items-center justify-center">
                  <Check className="w-8 h-8 text-success" />
                </div>
                <h3 className="text-lg font-semibold text-genesis-dark mb-2">
                  Link gerado com sucesso!
                </h3>
                <p className="text-sm text-genesis-muted">
                  Envie o link abaixo para <strong>{email}</strong>
                </p>
              </div>

              {/* Invite Link */}
              <div className="p-3 bg-genesis-soft rounded-xl">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inviteLink}
                    readOnly
                    className="flex-1 bg-transparent text-sm text-genesis-text truncate outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="flex-shrink-0 p-2 bg-genesis-surface hover:bg-genesis-hover rounded-lg transition-colors"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-success" />
                    ) : (
                      <Copy className="w-4 h-4 text-genesis-muted" />
                    )}
                  </button>
                </div>
              </div>

              <p className="text-xs text-genesis-subtle text-center">O link expira em 7 dias</p>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setInviteLink(null)
                    setEmail('')
                  }}
                  className="flex-1 px-4 py-2.5 border border-genesis-border rounded-xl text-genesis-text hover:bg-genesis-hover transition-colors"
                >
                  Convidar outro
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-2.5 bg-genesis-primary text-white rounded-xl hover:bg-genesis-primary-dark transition-colors"
                >
                  Concluir
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  )
}
