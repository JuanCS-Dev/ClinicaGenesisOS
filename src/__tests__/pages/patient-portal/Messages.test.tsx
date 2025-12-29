/**
 * Patient Portal Messages Tests
 * @module __tests__/pages/patient-portal/Messages.test
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { resetPatientPortalMocks } from './setup'
import { usePatientMessages } from '../../../hooks/usePatientMessages'
import {
  mockConversations,
  mockActiveConversation,
  mockSendMessage,
  mockSelectConversation,
  defaultMessagesHook,
  loadingMessagesHook,
  emptyMessagesHook,
  activeConversationHook,
} from './Messages.setup'

const mockUsePatientMessages = usePatientMessages as ReturnType<typeof vi.fn>

import { PatientMessages } from '../../../pages/patient-portal/Messages'
const renderMessages = () =>
  render(
    <MemoryRouter>
      <PatientMessages />
    </MemoryRouter>
  )

describe('PatientMessages', () => {
  beforeEach(() => {
    resetPatientPortalMocks()
    vi.clearAllMocks()
  })

  afterEach(() => vi.restoreAllMocks())

  describe('loading state', () => {
    beforeEach(() => mockUsePatientMessages.mockReturnValue(loadingMessagesHook))

    it('should render skeleton while loading', () => {
      renderMessages()
      expect(document.querySelector('.animate-enter')).toBeInTheDocument()
    })

    it('should not render main title while loading', () => {
      renderMessages()
      expect(screen.queryByText('Mensagens')).not.toBeInTheDocument()
    })
  })

  describe('empty state', () => {
    beforeEach(() => mockUsePatientMessages.mockReturnValue(emptyMessagesHook))

    it('should render page title', () => {
      renderMessages()
      expect(screen.getByText('Mensagens')).toBeInTheDocument()
    })

    it('should render empty conversation message', () => {
      renderMessages()
      expect(screen.getByText('Nenhuma conversa')).toBeInTheDocument()
    })

    it('should render empty chat placeholder', () => {
      renderMessages()
      expect(screen.getByText('Selecione uma conversa')).toBeInTheDocument()
    })

    it('should show all messages read text', () => {
      renderMessages()
      expect(screen.getByText('Todas as mensagens lidas')).toBeInTheDocument()
    })

    it('should render new message button', () => {
      renderMessages()
      expect(screen.getByRole('button', { name: /Nova Mensagem/i })).toBeInTheDocument()
    })
  })

  describe('with conversations', () => {
    beforeEach(() => mockUsePatientMessages.mockReturnValue(defaultMessagesHook))

    it('should render conversation list', () => {
      renderMessages()
      expect(screen.getByText('Dr. João Silva')).toBeInTheDocument()
      expect(screen.getByText('Dra. Ana Costa')).toBeInTheDocument()
    })

    it('should render specialties', () => {
      renderMessages()
      expect(screen.getByText('Cardiologia')).toBeInTheDocument()
      expect(screen.getByText('Dermatologia')).toBeInTheDocument()
    })

    it('should show unread count', () => {
      renderMessages()
      expect(screen.getByText('2')).toBeInTheDocument()
    })

    it('should select conversation on click', async () => {
      renderMessages()
      const convButton = screen.getByText('Dr. João Silva').closest('button')
      fireEvent.click(convButton!)
      await waitFor(() => expect(mockSelectConversation).toHaveBeenCalledWith('conv-1'))
    })

    it('should auto-select first conversation on load', () => {
      renderMessages()
      expect(mockSelectConversation).toHaveBeenCalled()
    })
  })

  describe('with active conversation', () => {
    beforeEach(() => mockUsePatientMessages.mockReturnValue(activeConversationHook))

    it('should render chat view', () => {
      renderMessages()
      expect(screen.getAllByText('Dr. João Silva').length).toBeGreaterThan(1)
    })

    it('should render messages', () => {
      renderMessages()
      expect(screen.getAllByText('Olá, como posso ajudar?').length).toBeGreaterThan(0)
      expect(
        screen.getByText('Boa tarde, tenho uma dúvida sobre minha medicação')
      ).toBeInTheDocument()
    })

    it('should render message input', () => {
      renderMessages()
      expect(screen.getByPlaceholderText('Digite sua mensagem...')).toBeInTheDocument()
    })

    it('should update message input on type', () => {
      renderMessages()
      const input = screen.getByPlaceholderText('Digite sua mensagem...')
      fireEvent.change(input, { target: { value: 'Test message' } })
      expect(input).toHaveValue('Test message')
    })

    it('should send message on button click', async () => {
      renderMessages()
      const input = screen.getByPlaceholderText('Digite sua mensagem...')
      fireEvent.change(input, { target: { value: 'Hello doctor' } })
      const sendButton = document.querySelector('.lucide-send')?.closest('button')
      fireEvent.click(sendButton!)
      await waitFor(() => {
        expect(mockSendMessage).toHaveBeenCalled()
        expect(mockSendMessage.mock.calls[0][0]).toBe('Hello doctor')
      })
    })

    it('should clear input after sending', async () => {
      renderMessages()
      const input = screen.getByPlaceholderText('Digite sua mensagem...')
      fireEvent.change(input, { target: { value: 'Hello doctor' } })
      const sendButton = document.querySelector('.lucide-send')?.closest('button')
      fireEvent.click(sendButton!)
      await waitFor(() => expect(input).toHaveValue(''))
    })

    it('should send message on Enter key', async () => {
      renderMessages()
      const input = screen.getByPlaceholderText('Digite sua mensagem...')
      fireEvent.change(input, { target: { value: 'Enter message' } })
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 })
      await waitFor(() => {
        expect(mockSendMessage).toHaveBeenCalled()
        expect(mockSendMessage.mock.calls[0][0]).toBe('Enter message')
      })
    })

    it('should not send on Shift+Enter', () => {
      renderMessages()
      const input = screen.getByPlaceholderText('Digite sua mensagem...')
      fireEvent.change(input, { target: { value: 'Shift enter' } })
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13, shiftKey: true })
      expect(mockSendMessage).not.toHaveBeenCalled()
    })

    it('should not send empty message', () => {
      renderMessages()
      const sendButton = document.querySelector('.lucide-send')?.closest('button')
      expect(sendButton).toBeDisabled()
    })
  })

  describe('search functionality', () => {
    beforeEach(() =>
      mockUsePatientMessages.mockReturnValue({ ...defaultMessagesHook, totalUnread: 0 })
    )

    it('should filter conversations by provider name', () => {
      renderMessages()
      fireEvent.change(screen.getByPlaceholderText('Buscar conversa...'), {
        target: { value: 'João' },
      })
      expect(screen.getByText('Dr. João Silva')).toBeInTheDocument()
      expect(screen.queryByText('Dra. Ana Costa')).not.toBeInTheDocument()
    })

    it('should show no results when search matches nothing', () => {
      renderMessages()
      fireEvent.change(screen.getByPlaceholderText('Buscar conversa...'), {
        target: { value: 'xyz' },
      })
      expect(screen.getByText('Nenhuma conversa')).toBeInTheDocument()
    })

    it('should be case insensitive', () => {
      renderMessages()
      fireEvent.change(screen.getByPlaceholderText('Buscar conversa...'), {
        target: { value: 'ANA' },
      })
      expect(screen.getByText('Dra. Ana Costa')).toBeInTheDocument()
    })

    it('should show all conversations when search is cleared', () => {
      renderMessages()
      fireEvent.change(screen.getByPlaceholderText('Buscar conversa...'), {
        target: { value: 'João' },
      })
      fireEvent.change(screen.getByPlaceholderText('Buscar conversa...'), { target: { value: '' } })
      expect(screen.getByText('Dr. João Silva')).toBeInTheDocument()
      expect(screen.getByText('Dra. Ana Costa')).toBeInTheDocument()
    })
  })

  describe('empty messages in conversation', () => {
    beforeEach(() => {
      mockUsePatientMessages.mockReturnValue({
        ...activeConversationHook,
        activeConversation: { ...mockConversations[0], messages: [] },
      })
    })

    it('should show empty messages state', () => {
      renderMessages()
      expect(screen.getByText('Nenhuma mensagem ainda')).toBeInTheDocument()
    })
  })

  describe('singular unread count', () => {
    beforeEach(() =>
      mockUsePatientMessages.mockReturnValue({ ...defaultMessagesHook, totalUnread: 1 })
    )

    it('should show singular form for 1 message', () => {
      renderMessages()
      expect(screen.getByText('1 mensagem não lida')).toBeInTheDocument()
    })
  })

  describe('error handling', () => {
    it('should handle send error gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockUsePatientMessages.mockReturnValue({
        ...activeConversationHook,
        sendMessage: vi.fn().mockRejectedValue(new Error('Send failed')),
      })

      renderMessages()
      const input = screen.getByPlaceholderText('Digite sua mensagem...')
      fireEvent.change(input, { target: { value: 'Test error' } })
      const sendButton = document.querySelector('.lucide-send')?.closest('button')
      fireEvent.click(sendButton!)

      await waitFor(() => expect(consoleSpy).toHaveBeenCalled())
      consoleSpy.mockRestore()
    })

    it('should handle selection error gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockUsePatientMessages.mockReturnValue({
        ...defaultMessagesHook,
        selectConversation: vi.fn().mockRejectedValue(new Error('Select failed')),
      })

      renderMessages()
      const convButton = screen.getByText('Dr. João Silva').closest('button')
      fireEvent.click(convButton!)

      await waitFor(() => expect(consoleSpy).toHaveBeenCalled())
      consoleSpy.mockRestore()
    })
  })

  describe('message read status', () => {
    beforeEach(() => {
      mockUsePatientMessages.mockReturnValue({
        ...activeConversationHook,
        activeConversation: {
          ...mockConversations[0],
          messages: [
            {
              id: 'msg-read',
              conversationId: 'conv-1',
              sender: 'patient',
              content: 'Read message',
              status: 'read',
              createdAt: new Date().toISOString(),
            },
          ],
        },
      })
    })

    it('should show read indicator for patient messages', () => {
      renderMessages()
      expect(document.querySelector('.lucide-check-check')).toBeInTheDocument()
    })
  })
})
