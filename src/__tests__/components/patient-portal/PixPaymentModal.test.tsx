/**
 * PixPaymentModal Tests
 * =====================
 *
 * Tests for the PIX payment modal component.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock PIX service
const mockGenerateDirectPixQRCode = vi.fn()
vi.mock('../../../services/pix.service', () => ({
  generateDirectPixQRCode: (input: unknown) => mockGenerateDirectPixQRCode(input),
}))

// Mock PIX config
vi.mock('../../../config/pix', () => ({
  PIX_CONFIG: {
    pixKey: 'test@email.com',
    pixKeyType: 'email',
    receiverName: 'CLINICA TEST',
    receiverCity: 'SAO PAULO',
    enabled: true,
  },
  isPixConfigured: vi.fn(() => true),
}))

import { PixPaymentModal } from '../../../components/patient-portal/PixPaymentModal'
import { toast } from 'sonner'
import { isPixConfigured } from '../../../config/pix'
import type { Transaction } from '@/types'

// Test data
const mockTransaction: Transaction = {
  id: 'tx-123',
  clinicId: 'clinic-123',
  patientId: 'patient-123',
  type: 'income',
  amount: 250,
  status: 'pending',
  description: 'Consulta Cardiologia',
  category: 'consultation',
  date: '2025-01-15T10:00:00Z',
  createdAt: '2025-01-15T10:00:00Z',
  updatedAt: '2025-01-15T10:00:00Z',
}

const mockPixResult = {
  qrCodeDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA',
  pixCopiaECola: '00020126580014br.gov.bcb.pix0136test@email.com',
}

describe('PixPaymentModal', () => {
  const mockOnClose = vi.fn()
  const mockOnPaymentComplete = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockGenerateDirectPixQRCode.mockResolvedValue(mockPixResult)
    vi.mocked(isPixConfigured).mockReturnValue(true)
  })

  const renderModal = (props: Partial<Parameters<typeof PixPaymentModal>[0]> = {}) => {
    return render(
      <PixPaymentModal
        isOpen={true}
        transaction={mockTransaction}
        onClose={mockOnClose}
        onPaymentComplete={mockOnPaymentComplete}
        {...props}
      />
    )
  }

  describe('rendering', () => {
    it('should render nothing when isOpen is false', () => {
      const { container } = render(
        <PixPaymentModal
          isOpen={false}
          transaction={mockTransaction}
          onClose={mockOnClose}
          onPaymentComplete={mockOnPaymentComplete}
        />
      )

      expect(container.firstChild).toBeNull()
    })

    it('should render nothing when transaction is null', () => {
      const { container } = render(
        <PixPaymentModal
          isOpen={true}
          transaction={null}
          onClose={mockOnClose}
          onPaymentComplete={mockOnPaymentComplete}
        />
      )

      expect(container.firstChild).toBeNull()
    })

    it('should render modal when open with transaction', async () => {
      renderModal()

      expect(screen.getByText('Pagar com PIX')).toBeInTheDocument()
    })

    it('should display transaction amount', async () => {
      renderModal()

      // R$ 250,00 format
      await waitFor(() => {
        expect(screen.getByText(/R\$\s*250,00/)).toBeInTheDocument()
      })
    })

    it('should display transaction description', async () => {
      renderModal()

      expect(screen.getByText('Consulta Cardiologia')).toBeInTheDocument()
    })
  })

  describe('QR code generation', () => {
    it('should show loading state initially', () => {
      // Mock slow response
      mockGenerateDirectPixQRCode.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockPixResult), 1000))
      )

      renderModal()

      expect(screen.getByText('Gerando QR Code...')).toBeInTheDocument()
    })

    it('should display QR code when generated', async () => {
      renderModal()

      await waitFor(() => {
        const qrImage = screen.getByAltText('QR Code PIX')
        expect(qrImage).toBeInTheDocument()
        expect(qrImage).toHaveAttribute('src', mockPixResult.qrCodeDataUrl)
      })
    })

    it('should show instructions after QR code loads', async () => {
      renderModal()

      await waitFor(() => {
        expect(screen.getByText('Escaneie o QR Code com o app do seu banco')).toBeInTheDocument()
      })
    })

    it('should show error state when generation fails', async () => {
      mockGenerateDirectPixQRCode.mockRejectedValue(new Error('Failed'))

      renderModal()

      await waitFor(() => {
        expect(screen.getByText('Erro ao gerar PIX')).toBeInTheDocument()
      })
    })

    it('should show not configured state when PIX is disabled', async () => {
      vi.mocked(isPixConfigured).mockReturnValue(false)

      renderModal()

      await waitFor(() => {
        expect(screen.getByText('PIX nao configurado')).toBeInTheDocument()
      })
    })
  })

  describe('copy functionality', () => {
    it('should render copy button after QR loads', async () => {
      renderModal()

      await waitFor(() => {
        expect(screen.getByText('Copiar codigo PIX')).toBeInTheDocument()
      })
    })

    it('should copy PIX code to clipboard', async () => {
      // Mock clipboard
      const mockClipboard = {
        writeText: vi.fn().mockResolvedValue(undefined),
      }
      Object.assign(navigator, { clipboard: mockClipboard })

      renderModal()

      await waitFor(() => {
        expect(screen.getByText('Copiar codigo PIX')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('Copiar codigo PIX'))

      await waitFor(() => {
        expect(mockClipboard.writeText).toHaveBeenCalledWith(mockPixResult.pixCopiaECola)
        expect(toast.success).toHaveBeenCalledWith('Codigo PIX copiado!')
      })
    })

    it('should show copied state after copying', async () => {
      const mockClipboard = {
        writeText: vi.fn().mockResolvedValue(undefined),
      }
      Object.assign(navigator, { clipboard: mockClipboard })

      renderModal()

      await waitFor(() => {
        expect(screen.getByText('Copiar codigo PIX')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('Copiar codigo PIX'))

      await waitFor(() => {
        expect(screen.getByText('Codigo copiado!')).toBeInTheDocument()
      })
    })
  })

  describe('payment confirmation', () => {
    it('should render confirm payment button after QR loads', async () => {
      renderModal()

      await waitFor(() => {
        expect(screen.getByText('Ja paguei')).toBeInTheDocument()
      })
    })

    it('should call onPaymentComplete when confirm is clicked', async () => {
      renderModal()

      await waitFor(() => {
        expect(screen.getByText('Ja paguei')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('Ja paguei'))

      expect(mockOnPaymentComplete).toHaveBeenCalledWith('tx-123')
      expect(toast.success).toHaveBeenCalledWith('Pagamento confirmado!')
    })
  })

  describe('close behavior', () => {
    it('should call onClose when close button is clicked', async () => {
      renderModal()

      const closeButton = screen.getByRole('button', { name: /fechar/i })
      fireEvent.click(closeButton)

      expect(mockOnClose).toHaveBeenCalled()
    })

    it('should call onClose when backdrop is clicked', async () => {
      renderModal()

      // Click on backdrop (the overlay div)
      const backdrop = document.querySelector('.bg-black\\/50')
      if (backdrop) {
        fireEvent.click(backdrop)
        expect(mockOnClose).toHaveBeenCalled()
      }
    })
  })

  describe('info display', () => {
    it('should show awaiting payment info', async () => {
      renderModal()

      await waitFor(() => {
        expect(screen.getByText('Aguardando pagamento')).toBeInTheDocument()
      })
    })
  })
})
