/**
 * NewConversationModal Tests
 * ==========================
 *
 * Tests for the new conversation modal component.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

import { NewConversationModal } from '../../../components/patient-portal/NewConversationModal'
import { toast } from 'sonner'
import type { UserProfile } from '@/types'

// Test data
const mockProfessionals: UserProfile[] = [
  {
    id: 'prof-1',
    uid: 'uid-1',
    clinicId: 'clinic-123',
    email: 'joao@clinic.com',
    displayName: 'Dr. João Silva',
    role: 'professional',
    specialty: 'Cardiologia',
    createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'prof-2',
    uid: 'uid-2',
    clinicId: 'clinic-123',
    email: 'ana@clinic.com',
    displayName: 'Dra. Ana Costa',
    role: 'professional',
    specialty: 'Dermatologia',
    createdAt: '2025-01-01T00:00:00Z',
  },
]

describe('NewConversationModal', () => {
  const mockOnClose = vi.fn()
  const mockOnStartConversation = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const renderModal = (props: Partial<Parameters<typeof NewConversationModal>[0]> = {}) => {
    return render(
      <NewConversationModal
        isOpen={true}
        onClose={mockOnClose}
        professionals={mockProfessionals}
        loading={false}
        onStartConversation={mockOnStartConversation}
        {...props}
      />
    )
  }

  describe('rendering', () => {
    it('should render nothing when isOpen is false', () => {
      const { container } = render(
        <NewConversationModal
          isOpen={false}
          onClose={mockOnClose}
          professionals={mockProfessionals}
          loading={false}
          onStartConversation={mockOnStartConversation}
        />
      )

      expect(container.firstChild).toBeNull()
    })

    it('should render modal when open', () => {
      renderModal()

      expect(screen.getByText('Nova Mensagem')).toBeInTheDocument()
    })

    it('should show list of professionals', () => {
      renderModal()

      expect(screen.getByText('Dr. João Silva')).toBeInTheDocument()
      expect(screen.getByText('Dra. Ana Costa')).toBeInTheDocument()
    })

    it('should show professional specialties', () => {
      renderModal()

      expect(screen.getByText('Cardiologia')).toBeInTheDocument()
      expect(screen.getByText('Dermatologia')).toBeInTheDocument()
    })

    it('should show loading state when loading professionals', () => {
      renderModal({ loading: true })

      // Skeleton should be present
      expect(screen.queryByText('Dr. João Silva')).not.toBeInTheDocument()
    })

    it('should show empty message when no professionals', () => {
      renderModal({ professionals: [] })

      expect(screen.getByText('Nenhum profissional disponivel')).toBeInTheDocument()
    })

    it('should render cancel and send buttons', () => {
      renderModal()

      expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /enviar/i })).toBeInTheDocument()
    })
  })

  describe('professional selection', () => {
    it('should highlight selected professional', async () => {
      renderModal()

      const drJoao = screen.getByText('Dr. João Silva')
      fireEvent.click(drJoao.closest('button')!)

      expect(drJoao.closest('button')).toHaveClass('border-genesis-primary')
    })

    it('should show message input after selecting professional', async () => {
      renderModal()

      expect(screen.queryByText('Sua mensagem')).not.toBeInTheDocument()

      const drJoao = screen.getByText('Dr. João Silva')
      fireEvent.click(drJoao.closest('button')!)

      expect(screen.getByText('Sua mensagem')).toBeInTheDocument()
    })

    it('should allow changing selection', async () => {
      renderModal()

      // Select first
      const drJoao = screen.getByText('Dr. João Silva')
      fireEvent.click(drJoao.closest('button')!)

      // Select second
      const draAna = screen.getByText('Dra. Ana Costa')
      fireEvent.click(draAna.closest('button')!)

      expect(draAna.closest('button')).toHaveClass('border-genesis-primary')
      expect(drJoao.closest('button')).not.toHaveClass('border-genesis-primary')
    })
  })

  describe('message input', () => {
    it('should allow typing message', async () => {
      const user = userEvent.setup()
      renderModal()

      // Select professional first
      const drJoao = screen.getByText('Dr. João Silva')
      fireEvent.click(drJoao.closest('button')!)

      const textarea = screen.getByPlaceholderText('Digite sua mensagem...')
      await user.type(textarea, 'Olá, gostaria de agendar uma consulta')

      expect(textarea).toHaveValue('Olá, gostaria de agendar uma consulta')
    })
  })

  describe('form submission', () => {
    it('should disable send button when no professional selected', () => {
      renderModal()

      const sendButton = screen.getByRole('button', { name: /enviar/i })
      expect(sendButton).toBeDisabled()
    })

    it('should disable send button when no message entered', async () => {
      renderModal()

      // Select professional
      const drJoao = screen.getByText('Dr. João Silva')
      fireEvent.click(drJoao.closest('button')!)

      const sendButton = screen.getByRole('button', { name: /enviar/i })
      expect(sendButton).toBeDisabled()
    })

    it('should enable send button when professional selected and message entered', async () => {
      const user = userEvent.setup()
      renderModal()

      // Select professional
      const drJoao = screen.getByText('Dr. João Silva')
      fireEvent.click(drJoao.closest('button')!)

      // Enter message
      const textarea = screen.getByPlaceholderText('Digite sua mensagem...')
      await user.type(textarea, 'Test message')

      const sendButton = screen.getByRole('button', { name: /enviar/i })
      expect(sendButton).not.toBeDisabled()
    })

    it('should call onStartConversation with correct parameters', async () => {
      mockOnStartConversation.mockResolvedValue(undefined)
      const user = userEvent.setup()
      renderModal()

      // Select professional
      const drJoao = screen.getByText('Dr. João Silva')
      fireEvent.click(drJoao.closest('button')!)

      // Enter message
      const textarea = screen.getByPlaceholderText('Digite sua mensagem...')
      await user.type(textarea, 'Test message')

      // Send
      fireEvent.click(screen.getByRole('button', { name: /enviar/i }))

      await waitFor(() => {
        expect(mockOnStartConversation).toHaveBeenCalledWith(
          mockProfessionals[0],
          'Test message'
        )
      })
    })

    it('should close modal on successful send', async () => {
      mockOnStartConversation.mockResolvedValue(undefined)
      const user = userEvent.setup()
      renderModal()

      // Select professional
      const drJoao = screen.getByText('Dr. João Silva')
      fireEvent.click(drJoao.closest('button')!)

      // Enter message
      const textarea = screen.getByPlaceholderText('Digite sua mensagem...')
      await user.type(textarea, 'Test message')

      // Send
      fireEvent.click(screen.getByRole('button', { name: /enviar/i }))

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled()
      })
    })

    it('should show error toast on failed send', async () => {
      mockOnStartConversation.mockRejectedValue(new Error('Failed'))
      const user = userEvent.setup()
      renderModal()

      // Select professional
      const drJoao = screen.getByText('Dr. João Silva')
      fireEvent.click(drJoao.closest('button')!)

      // Enter message
      const textarea = screen.getByPlaceholderText('Digite sua mensagem...')
      await user.type(textarea, 'Test message')

      // Send
      fireEvent.click(screen.getByRole('button', { name: /enviar/i }))

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Erro ao iniciar conversa. Tente novamente.')
      })
    })

    it('should show loading state during send', async () => {
      mockOnStartConversation.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)))
      const user = userEvent.setup()
      renderModal()

      // Select professional
      const drJoao = screen.getByText('Dr. João Silva')
      fireEvent.click(drJoao.closest('button')!)

      // Enter message
      const textarea = screen.getByPlaceholderText('Digite sua mensagem...')
      await user.type(textarea, 'Test message')

      // Send
      fireEvent.click(screen.getByRole('button', { name: /enviar/i }))

      expect(screen.getByText('Enviando...')).toBeInTheDocument()
    })
  })

  describe('close behavior', () => {
    it('should call onClose when cancel button is clicked', () => {
      renderModal()

      fireEvent.click(screen.getByRole('button', { name: /cancelar/i }))

      expect(mockOnClose).toHaveBeenCalled()
    })

    it('should not call onClose when cancel is disabled during loading', async () => {
      mockOnStartConversation.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)))
      const user = userEvent.setup()
      renderModal()

      // Setup and start send
      const drJoao = screen.getByText('Dr. João Silva')
      fireEvent.click(drJoao.closest('button')!)

      const textarea = screen.getByPlaceholderText('Digite sua mensagem...')
      await user.type(textarea, 'Test message')

      fireEvent.click(screen.getByRole('button', { name: /enviar/i }))

      // Cancel button should be disabled
      const cancelButton = screen.getByRole('button', { name: /cancelar/i })
      expect(cancelButton).toBeDisabled()
    })
  })
})
