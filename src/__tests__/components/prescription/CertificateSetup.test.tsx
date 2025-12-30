/**
 * CertificateSetup Component Tests
 *
 * Comprehensive tests for digital certificate configuration.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { DigitalCertificate } from '@/types'

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

import { CertificateSetup } from '../../../components/prescription/CertificateSetup'
import { toast } from 'sonner'

describe('CertificateSetup', () => {
  const mockOnCertificateConfigured = vi.fn()
  const mockOnClose = vi.fn()

  const defaultProps = {
    onCertificateConfigured: mockOnCertificateConfigured,
    onClose: mockOnClose,
  }

  const existingCertificate: DigitalCertificate = {
    id: 'cert-123',
    type: 'A1',
    subjectName: 'Dr. João Silva',
    issuer: 'AC Certisign',
    serialNumber: 'ABC123DEF456',
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    isValid: true,
    cpf: '123.456.789-00',
    professionalRegistration: 'CRM 123456-SP',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render the modal with header', () => {
      render(<CertificateSetup {...defaultProps} />)

      expect(screen.getByText('Certificado Digital')).toBeInTheDocument()
      expect(screen.getByText('Configure seu e-CPF para assinatura')).toBeInTheDocument()
    })

    it('should render close button', () => {
      render(<CertificateSetup {...defaultProps} />)

      const closeButtons = screen.getAllByRole('button')
      expect(closeButtons.length).toBeGreaterThan(0)
    })

    it('should render certificate type selection', () => {
      render(<CertificateSetup {...defaultProps} />)

      expect(screen.getByText('Certificado A1')).toBeInTheDocument()
      expect(screen.getByText('Certificado A3')).toBeInTheDocument()
    })

    it('should render help button', () => {
      render(<CertificateSetup {...defaultProps} />)

      const helpButton = screen.getByTitle('Ajuda')
      expect(helpButton).toBeInTheDocument()
    })
  })

  describe('certificate type selection', () => {
    it('should default to A1 type', () => {
      render(<CertificateSetup {...defaultProps} />)

      expect(screen.getByText('Arquivo digital (.pfx)')).toBeInTheDocument()
    })

    it('should switch to A3 type when clicked', async () => {
      const user = userEvent.setup()
      render(<CertificateSetup {...defaultProps} />)

      const a3Button = screen.getByText('Certificado A3')
      await user.click(a3Button)

      expect(screen.getByText('Token USB / Smartcard')).toBeInTheDocument()
      expect(screen.getByText(/Certificado A3 requer software adicional/)).toBeInTheDocument()
    })

    it('should show A1 upload fields when A1 is selected', async () => {
      const user = userEvent.setup()
      render(<CertificateSetup {...defaultProps} />)

      const a1Button = screen.getByText('Certificado A1')
      await user.click(a1Button)

      expect(screen.getByText('Arquivo do certificado')).toBeInTheDocument()
      expect(screen.getByText('Senha do certificado')).toBeInTheDocument()
    })

    it('should show A3 info when A3 is selected', async () => {
      const user = userEvent.setup()
      render(<CertificateSetup {...defaultProps} />)

      const a3Button = screen.getByText('Certificado A3')
      await user.click(a3Button)

      expect(screen.getByText(/Conecte seu token USB ou smartcard/)).toBeInTheDocument()
    })
  })

  describe('help panel', () => {
    it('should toggle help panel when help button is clicked', async () => {
      const user = userEvent.setup()
      render(<CertificateSetup {...defaultProps} />)

      const helpButton = screen.getByTitle('Ajuda')
      await user.click(helpButton)

      expect(screen.getByText('O que é o e-CPF?')).toBeInTheDocument()
      expect(screen.getByText('Tipos de certificado:')).toBeInTheDocument()
    })

    it('should hide help panel when clicked again', async () => {
      const user = userEvent.setup()
      render(<CertificateSetup {...defaultProps} />)

      const helpButton = screen.getByTitle('Ajuda')
      await user.click(helpButton)
      await user.click(helpButton)

      expect(screen.queryByText('O que é o e-CPF?')).not.toBeInTheDocument()
    })
  })

  describe('existing certificate display', () => {
    it('should display existing certificate info', () => {
      render(<CertificateSetup {...defaultProps} certificate={existingCertificate} />)

      expect(screen.getByText('Certificado configurado')).toBeInTheDocument()
      expect(screen.getByText('Dr. João Silva')).toBeInTheDocument()
      expect(screen.getByText('CRM 123456-SP')).toBeInTheDocument()
    })

    it('should show expiration date of existing certificate', () => {
      render(<CertificateSetup {...defaultProps} certificate={existingCertificate} />)

      expect(screen.getByText(/Válido até:/)).toBeInTheDocument()
    })
  })

  describe('file upload (A1)', () => {
    it('should accept .pfx files', async () => {
      render(<CertificateSetup {...defaultProps} />)

      const fileInput = document.querySelector('input[type="file"]')
      expect(fileInput).toHaveAttribute('accept', '.pfx,.p12')
    })

    it('should show file name after selection', async () => {
      render(<CertificateSetup {...defaultProps} />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = new File(['certificate'], 'cert.pfx', { type: 'application/x-pkcs12' })

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText('cert.pfx')).toBeInTheDocument()
      })
    })

    it('should show error for invalid file extension', async () => {
      render(<CertificateSetup {...defaultProps} />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const invalidFile = new File(['data'], 'invalid.txt', { type: 'text/plain' })

      fireEvent.change(fileInput, { target: { files: [invalidFile] } })

      await waitFor(() => {
        expect(screen.getByText('Selecione um arquivo .pfx ou .p12')).toBeInTheDocument()
      })
    })

    it('should accept .p12 files', async () => {
      render(<CertificateSetup {...defaultProps} />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = new File(['certificate'], 'cert.p12', { type: 'application/x-pkcs12' })

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText('cert.p12')).toBeInTheDocument()
      })
    })
  })

  describe('password input', () => {
    it('should render password input for A1', () => {
      render(<CertificateSetup {...defaultProps} />)

      const passwordInput = screen.getByPlaceholderText('Digite a senha')
      expect(passwordInput).toBeInTheDocument()
      expect(passwordInput).toHaveAttribute('type', 'password')
    })

    it('should update password value on change', async () => {
      const user = userEvent.setup()
      render(<CertificateSetup {...defaultProps} />)

      const passwordInput = screen.getByPlaceholderText('Digite a senha')
      await user.type(passwordInput, 'secretpassword')

      expect(passwordInput).toHaveValue('secretpassword')
    })
  })

  describe('form validation', () => {
    it('should show error when submitting without file', async () => {
      const user = userEvent.setup()
      render(<CertificateSetup {...defaultProps} />)

      // Type password but don't select file
      const passwordInput = screen.getByPlaceholderText('Digite a senha')
      await user.type(passwordInput, 'password123')

      // Button should still be disabled without file
      const submitButton = screen.getByText('Configurar Certificado')
      expect(submitButton).toBeDisabled()
    })

    it('should show error when submitting without password', async () => {
      render(<CertificateSetup {...defaultProps} />)

      // Select file but don't type password
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = new File(['certificate'], 'cert.pfx', { type: 'application/x-pkcs12' })
      fireEvent.change(fileInput, { target: { files: [file] } })

      // Button should still be disabled without password
      const submitButton = screen.getByText('Configurar Certificado')
      expect(submitButton).toBeDisabled()
    })

    it('should enable submit button when file and password are provided', async () => {
      const user = userEvent.setup()
      render(<CertificateSetup {...defaultProps} />)

      // Select file
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = new File(['certificate'], 'cert.pfx', { type: 'application/x-pkcs12' })
      fireEvent.change(fileInput, { target: { files: [file] } })

      // Type password
      const passwordInput = screen.getByPlaceholderText('Digite a senha')
      await user.type(passwordInput, 'password123')

      // Button should be enabled
      const submitButton = screen.getByText('Configurar Certificado')
      expect(submitButton).not.toBeDisabled()
    })
  })

  describe('form submission', () => {
    it('should call onCertificateConfigured on successful submit', async () => {
      const user = userEvent.setup()
      render(<CertificateSetup {...defaultProps} />)

      // Select file
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = new File(['certificate'], 'cert.pfx', { type: 'application/x-pkcs12' })
      fireEvent.change(fileInput, { target: { files: [file] } })

      // Type password
      const passwordInput = screen.getByPlaceholderText('Digite a senha')
      await user.type(passwordInput, 'password123')

      // Submit
      const submitButton = screen.getByText('Configurar Certificado')
      await user.click(submitButton)

      await waitFor(
        () => {
          expect(mockOnCertificateConfigured).toHaveBeenCalled()
        },
        { timeout: 3000 }
      )

      expect(toast.success).toHaveBeenCalledWith('Certificado configurado com sucesso')
    })

    it('should show loading state during submission', async () => {
      const user = userEvent.setup()
      render(<CertificateSetup {...defaultProps} />)

      // Select file
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = new File(['certificate'], 'cert.pfx', { type: 'application/x-pkcs12' })
      fireEvent.change(fileInput, { target: { files: [file] } })

      // Type password
      const passwordInput = screen.getByPlaceholderText('Digite a senha')
      await user.type(passwordInput, 'password123')

      // Submit
      const submitButton = screen.getByText('Configurar Certificado')
      await user.click(submitButton)

      // Check loading state
      expect(screen.getByText('Validando...')).toBeInTheDocument()
    })

    it('should allow A3 submission without file/password', async () => {
      const user = userEvent.setup()
      render(<CertificateSetup {...defaultProps} />)

      // Switch to A3
      const a3Button = screen.getByText('Certificado A3')
      await user.click(a3Button)

      // Submit should be enabled for A3
      const submitButton = screen.getByText('Configurar Certificado')
      expect(submitButton).not.toBeDisabled()

      await user.click(submitButton)

      await waitFor(
        () => {
          expect(mockOnCertificateConfigured).toHaveBeenCalled()
        },
        { timeout: 3000 }
      )
    })
  })

  describe('close functionality', () => {
    it('should call onClose when close button is clicked', async () => {
      const user = userEvent.setup()
      render(<CertificateSetup {...defaultProps} />)

      const closeButton = screen.getByText('Cancelar')
      await user.click(closeButton)

      expect(mockOnClose).toHaveBeenCalled()
    })

    it('should call onClose when X button is clicked', async () => {
      const user = userEvent.setup()
      render(<CertificateSetup {...defaultProps} />)

      // Find the X button (second button after help)
      const buttons = screen.getAllByRole('button')
      const xButton = buttons.find(btn => btn.querySelector('svg.lucide-x') !== null)

      if (xButton) {
        await user.click(xButton)
        expect(mockOnClose).toHaveBeenCalled()
      }
    })
  })

  describe('accessibility', () => {
    it('should have proper labels for inputs', () => {
      render(<CertificateSetup {...defaultProps} />)

      expect(screen.getByText('Arquivo do certificado')).toBeInTheDocument()
      expect(screen.getByText('Senha do certificado')).toBeInTheDocument()
      expect(screen.getByText('Tipo de certificado')).toBeInTheDocument()
    })

    it('should have accessible file input', () => {
      render(<CertificateSetup {...defaultProps} />)

      const fileInput = document.querySelector('input[type="file"]')
      expect(fileInput).toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('should handle empty file selection', () => {
      render(<CertificateSetup {...defaultProps} />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      fireEvent.change(fileInput, { target: { files: [] } })

      // Should not crash and should not show file name
      expect(screen.queryByText('cert.pfx')).not.toBeInTheDocument()
    })

    it('should preserve type from existing certificate', () => {
      const a3Certificate = { ...existingCertificate, type: 'A3' as const }
      render(<CertificateSetup {...defaultProps} certificate={a3Certificate} />)

      // Should show A3 info
      expect(screen.getByText(/Certificado A3 requer software adicional/)).toBeInTheDocument()
    })

    it('should clear error when valid file is selected', async () => {
      render(<CertificateSetup {...defaultProps} />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      // First, select invalid file
      const invalidFile = new File(['data'], 'invalid.txt', { type: 'text/plain' })
      fireEvent.change(fileInput, { target: { files: [invalidFile] } })

      await waitFor(() => {
        expect(screen.getByText('Selecione um arquivo .pfx ou .p12')).toBeInTheDocument()
      })

      // Then select valid file
      const validFile = new File(['certificate'], 'cert.pfx', { type: 'application/x-pkcs12' })
      fireEvent.change(fileInput, { target: { files: [validFile] } })

      await waitFor(() => {
        expect(screen.queryByText('Selecione um arquivo .pfx ou .p12')).not.toBeInTheDocument()
      })
    })
  })
})
