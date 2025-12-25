/**
 * Patient Portal Messages Tests
 *
 * Comprehensive tests for patient messaging page.
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
// Import setup to activate mocks (hoisted automatically)
import { resetPatientPortalMocks } from './setup';

import { PatientMessages } from '../../../pages/patient-portal/Messages';

// Get the mock function to override per-test
import { usePatientMessages } from '../../../hooks/usePatientMessages';

const mockUsePatientMessages = usePatientMessages as ReturnType<typeof vi.fn>;

const renderMessages = () => {
  return render(
    <MemoryRouter>
      <PatientMessages />
    </MemoryRouter>
  );
};

// Mock data
const mockConversations = [
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
];

const mockActiveConversation = {
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
};

describe('PatientMessages', () => {
  const mockSendMessage = vi.fn().mockResolvedValue(undefined);
  const mockSelectConversation = vi.fn().mockResolvedValue(undefined);
  const mockRefresh = vi.fn();
  const mockCreateConversation = vi.fn();

  beforeEach(() => {
    resetPatientPortalMocks();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('loading state', () => {
    beforeEach(() => {
      mockUsePatientMessages.mockReturnValue({
        conversations: [],
        activeConversation: null,
        totalUnread: 0,
        loading: true,
        error: null,
        sendMessage: mockSendMessage,
        selectConversation: mockSelectConversation,
        createConversation: mockCreateConversation,
        refresh: mockRefresh,
      });
    });

    it('should render skeleton while loading', () => {
      renderMessages();
      const animatedContainer = document.querySelector('.animate-enter');
      expect(animatedContainer).toBeInTheDocument();
    });

    it('should not render main title while loading', () => {
      renderMessages();
      expect(screen.queryByText('Mensagens')).not.toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    beforeEach(() => {
      mockUsePatientMessages.mockReturnValue({
        conversations: [],
        activeConversation: null,
        totalUnread: 0,
        loading: false,
        error: null,
        sendMessage: mockSendMessage,
        selectConversation: mockSelectConversation,
        createConversation: mockCreateConversation,
        refresh: mockRefresh,
      });
    });

    it('should render without crashing', () => {
      const { container } = renderMessages();
      expect(container).toBeDefined();
    });

    it('should render page title', () => {
      renderMessages();
      expect(screen.getByText('Mensagens')).toBeInTheDocument();
    });

    it('should render empty conversation message', () => {
      renderMessages();
      expect(screen.getByText('Nenhuma conversa')).toBeInTheDocument();
    });

    it('should render empty chat placeholder', () => {
      renderMessages();
      expect(screen.getByText('Selecione uma conversa')).toBeInTheDocument();
      expect(screen.getByText('Ou inicie uma nova mensagem')).toBeInTheDocument();
    });

    it('should show all messages read text', () => {
      renderMessages();
      expect(screen.getByText('Todas as mensagens lidas')).toBeInTheDocument();
    });

    it('should render new message button', () => {
      renderMessages();
      expect(screen.getByRole('button', { name: /Nova Mensagem/i })).toBeInTheDocument();
    });

    it('should render search input', () => {
      renderMessages();
      expect(screen.getByPlaceholderText('Buscar conversa...')).toBeInTheDocument();
    });
  });

  describe('with conversations', () => {
    beforeEach(() => {
      mockUsePatientMessages.mockReturnValue({
        conversations: mockConversations,
        activeConversation: null,
        totalUnread: 2,
        loading: false,
        error: null,
        sendMessage: mockSendMessage,
        selectConversation: mockSelectConversation,
        createConversation: mockCreateConversation,
        refresh: mockRefresh,
      });
    });

    it('should render conversation list', () => {
      renderMessages();
      expect(screen.getByText('Dr. João Silva')).toBeInTheDocument();
      expect(screen.getByText('Dra. Ana Costa')).toBeInTheDocument();
    });

    it('should render specialties', () => {
      renderMessages();
      expect(screen.getByText('Cardiologia')).toBeInTheDocument();
      expect(screen.getByText('Dermatologia')).toBeInTheDocument();
    });

    it('should render last messages', () => {
      renderMessages();
      // Note: 'Olá, como posso ajudar?' may appear multiple times if auto-selected
      expect(screen.getAllByText('Olá, como posso ajudar?').length).toBeGreaterThan(0);
      expect(screen.getByText('Resultado do exame ficou pronto')).toBeInTheDocument();
    });

    it('should show unread count', () => {
      renderMessages();
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('should not show "todas as mensagens lidas" when has unread', () => {
      renderMessages();
      // With unread messages, should not show "all read" message
      expect(screen.queryByText('Todas as mensagens lidas')).not.toBeInTheDocument();
    });

    it('should select conversation on click', async () => {
      renderMessages();
      const convButton = screen.getByText('Dr. João Silva').closest('button');
      fireEvent.click(convButton!);

      await waitFor(() => {
        expect(mockSelectConversation).toHaveBeenCalledWith('conv-1');
      });
    });

    it('should auto-select first conversation on load', () => {
      renderMessages();
      // Effect runs on mount, should select first conversation
      expect(mockSelectConversation).toHaveBeenCalled();
    });
  });

  describe('with active conversation', () => {
    beforeEach(() => {
      mockUsePatientMessages.mockReturnValue({
        conversations: mockConversations,
        activeConversation: mockActiveConversation,
        totalUnread: 2,
        loading: false,
        error: null,
        sendMessage: mockSendMessage,
        selectConversation: mockSelectConversation,
        createConversation: mockCreateConversation,
        refresh: mockRefresh,
      });
    });

    it('should render chat view', () => {
      renderMessages();
      // Chat header shows provider name
      const providerNames = screen.getAllByText('Dr. João Silva');
      expect(providerNames.length).toBeGreaterThan(1); // In list and chat
    });

    it('should render messages', () => {
      renderMessages();
      // Text appears in both conversation list and chat view
      const helpMessages = screen.getAllByText('Olá, como posso ajudar?');
      expect(helpMessages.length).toBeGreaterThan(0);
      expect(screen.getByText('Boa tarde, tenho uma dúvida sobre minha medicação')).toBeInTheDocument();
    });

    it('should render message input', () => {
      renderMessages();
      expect(screen.getByPlaceholderText('Digite sua mensagem...')).toBeInTheDocument();
    });

    it('should render send button', () => {
      renderMessages();
      const sendButtons = document.querySelectorAll('.lucide-send');
      expect(sendButtons.length).toBeGreaterThan(0);
    });

    it('should render attachment button', () => {
      renderMessages();
      const paperclipIcon = document.querySelector('.lucide-paperclip');
      expect(paperclipIcon).toBeInTheDocument();
    });

    it('should update message input on type', () => {
      renderMessages();
      const input = screen.getByPlaceholderText('Digite sua mensagem...');
      fireEvent.change(input, { target: { value: 'Test message' } });
      expect(input).toHaveValue('Test message');
    });

    it('should send message on button click', async () => {
      renderMessages();
      const input = screen.getByPlaceholderText('Digite sua mensagem...');
      fireEvent.change(input, { target: { value: 'Hello doctor' } });

      // Find the send button by parent element with send icon
      const sendButton = document.querySelector('.lucide-send')?.closest('button');
      fireEvent.click(sendButton!);

      await waitFor(() => {
        expect(mockSendMessage).toHaveBeenCalledWith('Hello doctor');
      });
    });

    it('should clear input after sending', async () => {
      renderMessages();
      const input = screen.getByPlaceholderText('Digite sua mensagem...');
      fireEvent.change(input, { target: { value: 'Hello doctor' } });

      const sendButton = document.querySelector('.lucide-send')?.closest('button');
      fireEvent.click(sendButton!);

      await waitFor(() => {
        expect(input).toHaveValue('');
      });
    });

    it('should send message on Enter key', async () => {
      renderMessages();
      const input = screen.getByPlaceholderText('Digite sua mensagem...');
      fireEvent.change(input, { target: { value: 'Enter message' } });
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });

      await waitFor(() => {
        expect(mockSendMessage).toHaveBeenCalledWith('Enter message');
      });
    });

    it('should not send on Shift+Enter', () => {
      renderMessages();
      const input = screen.getByPlaceholderText('Digite sua mensagem...');
      fireEvent.change(input, { target: { value: 'Shift enter' } });
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13, shiftKey: true });

      expect(mockSendMessage).not.toHaveBeenCalled();
    });

    it('should not send empty message', () => {
      renderMessages();
      const sendButton = document.querySelector('.lucide-send')?.closest('button');
      expect(sendButton).toBeDisabled();
    });
  });

  describe('search functionality', () => {
    beforeEach(() => {
      mockUsePatientMessages.mockReturnValue({
        conversations: mockConversations,
        activeConversation: null,
        totalUnread: 0,
        loading: false,
        error: null,
        sendMessage: mockSendMessage,
        selectConversation: mockSelectConversation,
        createConversation: mockCreateConversation,
        refresh: mockRefresh,
      });
    });

    it('should filter conversations by provider name', () => {
      renderMessages();
      const searchInput = screen.getByPlaceholderText('Buscar conversa...');
      fireEvent.change(searchInput, { target: { value: 'João' } });

      expect(screen.getByText('Dr. João Silva')).toBeInTheDocument();
      expect(screen.queryByText('Dra. Ana Costa')).not.toBeInTheDocument();
    });

    it('should show no results when search matches nothing', () => {
      renderMessages();
      const searchInput = screen.getByPlaceholderText('Buscar conversa...');
      fireEvent.change(searchInput, { target: { value: 'xyz' } });

      expect(screen.getByText('Nenhuma conversa')).toBeInTheDocument();
    });

    it('should be case insensitive', () => {
      renderMessages();
      const searchInput = screen.getByPlaceholderText('Buscar conversa...');
      fireEvent.change(searchInput, { target: { value: 'ANA' } });

      expect(screen.getByText('Dra. Ana Costa')).toBeInTheDocument();
      expect(screen.queryByText('Dr. João Silva')).not.toBeInTheDocument();
    });

    it('should show all conversations when search is cleared', () => {
      renderMessages();
      const searchInput = screen.getByPlaceholderText('Buscar conversa...');

      // First filter
      fireEvent.change(searchInput, { target: { value: 'João' } });
      expect(screen.queryByText('Dra. Ana Costa')).not.toBeInTheDocument();

      // Clear filter
      fireEvent.change(searchInput, { target: { value: '' } });
      expect(screen.getByText('Dr. João Silva')).toBeInTheDocument();
      expect(screen.getByText('Dra. Ana Costa')).toBeInTheDocument();
    });
  });

  describe('empty messages in conversation', () => {
    beforeEach(() => {
      mockUsePatientMessages.mockReturnValue({
        conversations: mockConversations,
        activeConversation: {
          ...mockConversations[0],
          messages: [],
        },
        totalUnread: 0,
        loading: false,
        error: null,
        sendMessage: mockSendMessage,
        selectConversation: mockSelectConversation,
        createConversation: mockCreateConversation,
        refresh: mockRefresh,
      });
    });

    it('should show empty messages state', () => {
      renderMessages();
      expect(screen.getByText('Nenhuma mensagem ainda')).toBeInTheDocument();
    });
  });

  describe('singular unread count', () => {
    beforeEach(() => {
      mockUsePatientMessages.mockReturnValue({
        conversations: mockConversations,
        activeConversation: null,
        totalUnread: 1,
        loading: false,
        error: null,
        sendMessage: mockSendMessage,
        selectConversation: mockSelectConversation,
        createConversation: mockCreateConversation,
        refresh: mockRefresh,
      });
    });

    it('should show singular form for 1 message', () => {
      renderMessages();
      expect(screen.getByText('1 mensagem não lida')).toBeInTheDocument();
    });
  });

  describe('message sending error', () => {
    beforeEach(() => {
      const errorSendMessage = vi.fn().mockRejectedValue(new Error('Send failed'));
      mockUsePatientMessages.mockReturnValue({
        conversations: mockConversations,
        activeConversation: mockActiveConversation,
        totalUnread: 0,
        loading: false,
        error: null,
        sendMessage: errorSendMessage,
        selectConversation: mockSelectConversation,
        createConversation: mockCreateConversation,
        refresh: mockRefresh,
      });
    });

    it('should handle send error gracefully', async () => {
      // Mock console.error to prevent test output noise
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      renderMessages();
      const input = screen.getByPlaceholderText('Digite sua mensagem...');
      fireEvent.change(input, { target: { value: 'Test error' } });

      const sendButton = document.querySelector('.lucide-send')?.closest('button');
      fireEvent.click(sendButton!);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled();
      });

      consoleSpy.mockRestore();
    });
  });

  describe('conversation selection error', () => {
    beforeEach(() => {
      const errorSelectConversation = vi.fn().mockRejectedValue(new Error('Select failed'));
      mockUsePatientMessages.mockReturnValue({
        conversations: mockConversations,
        activeConversation: null,
        totalUnread: 0,
        loading: false,
        error: null,
        sendMessage: mockSendMessage,
        selectConversation: errorSelectConversation,
        createConversation: mockCreateConversation,
        refresh: mockRefresh,
      });
    });

    it('should handle selection error gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      renderMessages();
      const convButton = screen.getByText('Dr. João Silva').closest('button');
      fireEvent.click(convButton!);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled();
      });

      consoleSpy.mockRestore();
    });
  });

  describe('message read status', () => {
    beforeEach(() => {
      mockUsePatientMessages.mockReturnValue({
        conversations: mockConversations,
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
        totalUnread: 0,
        loading: false,
        error: null,
        sendMessage: mockSendMessage,
        selectConversation: mockSelectConversation,
        createConversation: mockCreateConversation,
        refresh: mockRefresh,
      });
    });

    it('should show read indicator for patient messages', () => {
      renderMessages();
      // Check for double-check icon (read indicator)
      const readIndicator = document.querySelector('.lucide-check-check');
      expect(readIndicator).toBeInTheDocument();
    });
  });
});
