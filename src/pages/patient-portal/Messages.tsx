/**
 * Patient Portal - Messages
 * =========================
 *
 * Secure messaging with healthcare providers.
 *
 * @module pages/patient-portal/Messages
 * @version 1.0.0
 */

import React, { useState } from 'react'
import { MessageCircle, Send, User, Clock, CheckCheck, Paperclip, Search, Plus } from 'lucide-react'

// ============================================================================
// Types
// ============================================================================

interface Message {
  id: string
  content: string
  sender: 'patient' | 'provider'
  timestamp: string
  read: boolean
}

interface Conversation {
  id: string
  provider: string
  specialty: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  messages: Message[]
}

// ============================================================================
// Mock Data
// ============================================================================

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    provider: 'Dr. João Silva',
    specialty: 'Clínica Geral',
    lastMessage: 'Os resultados dos seus exames estão normais.',
    lastMessageTime: '2024-12-22T10:30:00',
    unreadCount: 1,
    messages: [
      {
        id: '1',
        content: 'Dr. João, recebi meus exames. Poderia verificar os resultados?',
        sender: 'patient',
        timestamp: '2024-12-22T09:00:00',
        read: true,
      },
      {
        id: '2',
        content: 'Claro! Vou analisar e retorno em breve.',
        sender: 'provider',
        timestamp: '2024-12-22T09:30:00',
        read: true,
      },
      {
        id: '3',
        content:
          'Os resultados dos seus exames estão normais. Todos os valores dentro da referência. Podemos conversar na próxima consulta sobre prevenção.',
        sender: 'provider',
        timestamp: '2024-12-22T10:30:00',
        read: false,
      },
    ],
  },
  {
    id: '2',
    provider: 'Dra. Maria Santos',
    specialty: 'Cardiologia',
    lastMessage: 'Continue tomando a medicação conforme prescrito.',
    lastMessageTime: '2024-12-20T15:00:00',
    unreadCount: 0,
    messages: [
      {
        id: '1',
        content: 'Dra. Maria, estou sentindo tontura com a nova medicação.',
        sender: 'patient',
        timestamp: '2024-12-20T14:00:00',
        read: true,
      },
      {
        id: '2',
        content:
          'Tontura leve pode ocorrer nos primeiros dias. Se persistir por mais de uma semana, me avise. Continue tomando a medicação conforme prescrito.',
        sender: 'provider',
        timestamp: '2024-12-20T15:00:00',
        read: true,
      },
    ],
  },
]

// ============================================================================
// Helpers
// ============================================================================

function formatTime(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  } else if (days === 1) {
    return 'Ontem'
  } else if (days < 7) {
    return date.toLocaleDateString('pt-BR', { weekday: 'short' })
  } else {
    return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })
  }
}

// ============================================================================
// Components
// ============================================================================

function ConversationList({
  conversations,
  selectedId,
  onSelect,
}: {
  conversations: Conversation[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  return (
    <div className="space-y-2">
      {conversations.map(conv => (
        <button
          key={conv.id}
          onClick={() => onSelect(conv.id)}
          className={`w-full p-4 rounded-xl text-left transition-colors ${
            selectedId === conv.id
              ? 'bg-genesis-primary/10 border-genesis-primary'
              : 'bg-genesis-surface hover:bg-genesis-hover'
          } border border-genesis-border`}
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-genesis-primary/10 flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-genesis-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="font-medium text-genesis-dark text-sm truncate">{conv.provider}</p>
                <span className="text-xs text-genesis-muted">
                  {formatTime(conv.lastMessageTime)}
                </span>
              </div>
              <p className="text-xs text-genesis-muted">{conv.specialty}</p>
              <p className="text-sm text-genesis-medium mt-1 truncate">{conv.lastMessage}</p>
            </div>
            {conv.unreadCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-genesis-primary text-white text-xs flex items-center justify-center flex-shrink-0">
                {conv.unreadCount}
              </span>
            )}
          </div>
        </button>
      ))}
    </div>
  )
}

function ChatView({ conversation }: { conversation: Conversation }) {
  const [message, setMessage] = useState('')

  const handleSend = () => {
    if (!message.trim()) return
    // Would send message to backend
    setMessage('')
  }

  return (
    <div className="flex flex-col h-full bg-genesis-surface rounded-2xl border border-genesis-border overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-genesis-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-genesis-primary/10 flex items-center justify-center">
            <User className="w-5 h-5 text-genesis-primary" />
          </div>
          <div>
            <p className="font-medium text-genesis-dark">{conversation.provider}</p>
            <p className="text-xs text-genesis-muted">{conversation.specialty}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversation.messages.map(msg => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'patient' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                msg.sender === 'patient'
                  ? 'bg-genesis-primary text-white'
                  : 'bg-genesis-soft text-genesis-dark'
              }`}
            >
              <p className="text-sm">{msg.content}</p>
              <div
                className={`flex items-center gap-1 mt-1 ${
                  msg.sender === 'patient' ? 'justify-end' : 'justify-start'
                }`}
              >
                <Clock className="w-3 h-3 opacity-60" />
                <span className="text-xs opacity-60">
                  {new Date(msg.timestamp).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                {msg.sender === 'patient' && msg.read && (
                  <CheckCheck className="w-3 h-3 opacity-60" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-genesis-border">
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-xl text-genesis-muted hover:bg-genesis-hover transition-colors">
            <Paperclip className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSend()}
            placeholder="Digite sua mensagem..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-genesis-border bg-genesis-soft text-genesis-dark placeholder:text-genesis-muted focus:outline-none focus:ring-2 focus:ring-genesis-primary focus:border-transparent"
          />
          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className="p-2.5 rounded-xl bg-genesis-primary text-white hover:bg-genesis-primary-dark hover:scale-[1.05] active:scale-[0.95] transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function PatientMessages(): React.ReactElement {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(
    MOCK_CONVERSATIONS[0]?.id || null
  )
  const [search, setSearch] = useState('')

  const filteredConversations = MOCK_CONVERSATIONS.filter(conv => {
    if (!search) return true
    return conv.provider.toLowerCase().includes(search.toLowerCase())
  })

  const activeConversation = MOCK_CONVERSATIONS.find(c => c.id === selectedConversation)

  const totalUnread = MOCK_CONVERSATIONS.reduce((sum, c) => sum + c.unreadCount, 0)

  return (
    <div className="space-y-6 animate-enter pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-genesis-dark flex items-center gap-3">
            <MessageCircle className="w-7 h-7 text-amber-600" />
            Mensagens
          </h1>
          <p className="text-genesis-muted text-sm mt-1">
            {totalUnread > 0
              ? `${totalUnread} mensagem${totalUnread !== 1 ? 's' : ''} não lida${totalUnread !== 1 ? 's' : ''}`
              : 'Todas as mensagens lidas'}
          </p>
        </div>

        <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-genesis-primary text-white font-medium hover:bg-genesis-primary-dark hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200">
          <Plus className="w-5 h-5" />
          Nova Mensagem
        </button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[500px]">
        {/* Conversation List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-genesis-muted" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar conversa..."
              className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-genesis-border bg-genesis-surface text-genesis-dark placeholder:text-genesis-muted focus:outline-none focus:ring-2 focus:ring-genesis-primary focus:border-transparent"
            />
          </div>

          <ConversationList
            conversations={filteredConversations}
            selectedId={selectedConversation}
            onSelect={setSelectedConversation}
          />
        </div>

        {/* Chat View */}
        <div className="lg:col-span-2 h-[500px]">
          {activeConversation ? (
            <ChatView conversation={activeConversation} />
          ) : (
            <div className="h-full flex items-center justify-center bg-genesis-surface rounded-2xl border border-genesis-border">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 text-genesis-muted mx-auto mb-4" />
                <p className="text-genesis-dark font-medium">Selecione uma conversa</p>
                <p className="text-genesis-muted text-sm mt-1">Ou inicie uma nova mensagem</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PatientMessages
