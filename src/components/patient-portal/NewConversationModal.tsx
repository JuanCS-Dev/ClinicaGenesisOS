/**
 * Patient Portal - New Conversation Modal
 * =======================================
 *
 * Modal for starting a new conversation with a healthcare provider.
 *
 * @module components/patient-portal/NewConversationModal
 * @version 1.0.0
 */

import React, { useState } from 'react'
import { MessageCircle, Send, User, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Skeleton } from '../ui/Skeleton'
import type { UserProfile } from '@/types'

// ============================================================================
// Types
// ============================================================================

export interface NewConversationModalProps {
  /** Whether the modal is open */
  isOpen: boolean
  /** Callback to close the modal */
  onClose: () => void
  /** List of available professionals to message */
  professionals: UserProfile[]
  /** Whether professionals are being loaded */
  loading: boolean
  /** Callback to start a conversation with a provider */
  onStartConversation: (provider: UserProfile, message: string) => Promise<void>
}

// ============================================================================
// Component
// ============================================================================

/**
 * Modal for starting a new conversation with a healthcare provider.
 *
 * @param props - Component props
 * @returns React element or null if not open
 */
export function NewConversationModal({
  isOpen,
  onClose,
  professionals,
  loading,
  onStartConversation,
}: NewConversationModalProps): React.ReactElement | null {
  const [selectedProvider, setSelectedProvider] = useState<UserProfile | null>(null)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  const handleSend = async (): Promise<void> => {
    if (!selectedProvider || !message.trim() || sending) return

    setSending(true)
    try {
      await onStartConversation(selectedProvider, message.trim())
      setSelectedProvider(null)
      setMessage('')
      onClose()
    } catch (error) {
      console.error('Error starting conversation:', error)
      toast.error('Erro ao iniciar conversa. Tente novamente.')
    } finally {
      setSending(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-in fade-in">
      <div className="bg-genesis-surface rounded-2xl w-full max-w-md mx-4 shadow-xl animate-in zoom-in-95 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-genesis-border">
          <h3 className="font-semibold text-genesis-dark flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-genesis-primary" />
            Nova Mensagem
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-genesis-muted hover:bg-genesis-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Provider Selection */}
          <div>
            <label className="text-sm font-medium text-genesis-dark mb-2 block">
              Selecione o profissional
            </label>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-14 rounded-xl" />
                <Skeleton className="h-14 rounded-xl" />
              </div>
            ) : professionals.length === 0 ? (
              <p className="text-sm text-genesis-muted text-center py-4">
                Nenhum profissional disponivel
              </p>
            ) : (
              <div className="space-y-2">
                {professionals.map(provider => (
                  <button
                    key={provider.id}
                    onClick={() => setSelectedProvider(provider)}
                    className={`w-full p-3 rounded-xl text-left transition-colors flex items-center gap-3 ${
                      selectedProvider?.id === provider.id
                        ? 'bg-genesis-primary/10 border-genesis-primary border-2'
                        : 'bg-genesis-soft border border-genesis-border hover:bg-genesis-hover'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-genesis-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-genesis-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-genesis-dark">{provider.displayName}</p>
                      <p className="text-xs text-genesis-muted capitalize">{provider.specialty}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Message Input */}
          {selectedProvider && (
            <div>
              <label className="text-sm font-medium text-genesis-dark mb-2 block">
                Sua mensagem
              </label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-genesis-border bg-genesis-soft text-genesis-dark placeholder:text-genesis-muted focus:outline-none focus:ring-2 focus:ring-genesis-primary focus:border-transparent resize-none"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-genesis-border flex gap-3">
          <button
            onClick={onClose}
            disabled={sending}
            className="flex-1 py-2.5 rounded-xl border border-genesis-border text-genesis-medium font-medium hover:bg-genesis-hover transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSend}
            disabled={!selectedProvider || !message.trim() || sending}
            className="flex-1 py-2.5 rounded-xl bg-genesis-primary text-white font-medium hover:bg-genesis-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {sending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Enviar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default NewConversationModal
