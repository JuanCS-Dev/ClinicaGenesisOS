/**
 * Messages Test Setup
 * @module __tests__/pages/patient-portal/Messages.setup
 */

import { vi } from 'vitest'

export const mockConversations = [
  {
    id: 'conv-1',
    patientId: 'patient-123',
    providerId: 'provider-1',
    providerName: 'Dr. João Silva',
    providerSpecialty: 'Cardiologia',
    lastMessage: 'Olá, como posso ajudar?',
    lastMessageAt: new Date().toISOString(),
    unreadCountPatient: 2,
    unreadCountProvider: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'conv-2',
    patientId: 'patient-123',
    providerId: 'provider-2',
    providerName: 'Dra. Ana Costa',
    providerSpecialty: 'Dermatologia',
    lastMessage: 'Resultado do exame ficou pronto',
    lastMessageAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    unreadCountPatient: 0,
    unreadCountProvider: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export const mockActiveConversation = {
  ...mockConversations[0],
  messages: [
    {
      id: 'msg-1',
      conversationId: 'conv-1',
      sender: 'provider',
      content: 'Olá, como posso ajudar?',
      status: 'read',
      createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'msg-2',
      conversationId: 'conv-1',
      sender: 'patient',
      content: 'Boa tarde, tenho uma dúvida sobre minha medicação',
      status: 'read',
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
  ],
}

export const mockSendMessage = vi.fn().mockResolvedValue(undefined)
export const mockSelectConversation = vi.fn().mockResolvedValue(undefined)
export const mockRefresh = vi.fn()
export const mockCreateConversation = vi.fn()

export const defaultMessagesHook = {
  conversations: mockConversations,
  activeConversation: null,
  totalUnread: 2,
  loading: false,
  error: null,
  sendMessage: mockSendMessage,
  selectConversation: mockSelectConversation,
  createConversation: mockCreateConversation,
  refresh: mockRefresh,
}

export const loadingMessagesHook = {
  ...defaultMessagesHook,
  conversations: [],
  activeConversation: null,
  totalUnread: 0,
  loading: true,
}

export const emptyMessagesHook = {
  ...defaultMessagesHook,
  conversations: [],
  activeConversation: null,
  totalUnread: 0,
}

export const activeConversationHook = {
  ...defaultMessagesHook,
  activeConversation: mockActiveConversation,
}
