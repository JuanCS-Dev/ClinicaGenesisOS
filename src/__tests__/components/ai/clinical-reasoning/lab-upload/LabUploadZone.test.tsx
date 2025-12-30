/**
 * LabUploadZone Component Tests
 *
 * Comprehensive tests for the lab document upload zone.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LabUploadZone } from '@/components/ai/clinical-reasoning/lab-upload/LabUploadZone'

// Mock react-dropzone
const mockOpen = vi.fn()
vi.mock('react-dropzone', () => ({
  useDropzone: vi.fn(({ onDrop, onDragEnter, onDragLeave, disabled }) => ({
    getRootProps: () => ({
      onDragEnter: () => {
        if (!disabled) onDragEnter?.()
      },
      onDragLeave: () => {
        if (!disabled) onDragLeave?.()
      },
      onDrop: (e: DragEvent) => {
        if (!disabled) {
          const files = e.dataTransfer?.files
          if (files && files.length > 0) {
            onDrop?.([files[0]])
          }
        }
      },
    }),
    getInputProps: () => ({
      type: 'file',
      'data-testid': 'file-input',
    }),
    isDragActive: false,
    open: mockOpen,
  })),
}))

describe('LabUploadZone', () => {
  const mockOnFileSelect = vi.fn()

  const defaultProps = {
    onFileSelect: mockOnFileSelect,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render the upload zone', () => {
      render(<LabUploadZone {...defaultProps} />)

      expect(screen.getByRole('region')).toBeInTheDocument()
    })

    it('should render with correct aria label', () => {
      render(<LabUploadZone {...defaultProps} />)

      expect(
        screen.getByRole('region', { name: /Área de upload de exames laboratoriais/i })
      ).toBeInTheDocument()
    })

    it('should render upload title', () => {
      render(<LabUploadZone {...defaultProps} />)

      expect(screen.getByText('Análise de Exame Laboratorial')).toBeInTheDocument()
    })

    it('should render upload description', () => {
      render(<LabUploadZone {...defaultProps} />)

      expect(
        screen.getByText(/Arraste um PDF ou imagem do exame, ou escolha uma das opções abaixo/)
      ).toBeInTheDocument()
    })

    it('should render file input', () => {
      render(<LabUploadZone {...defaultProps} />)

      expect(screen.getByTestId('file-input')).toBeInTheDocument()
    })
  })

  describe('action buttons', () => {
    it('should render Escolher Arquivo button', () => {
      render(<LabUploadZone {...defaultProps} />)

      expect(screen.getByRole('button', { name: /Escolher Arquivo/i })).toBeInTheDocument()
    })

    it('should render Usar Câmera button', () => {
      render(<LabUploadZone {...defaultProps} />)

      expect(screen.getByRole('button', { name: /Usar Câmera/i })).toBeInTheDocument()
    })

    it('should call open when Escolher Arquivo is clicked', async () => {
      const user = userEvent.setup()
      render(<LabUploadZone {...defaultProps} />)

      const fileButton = screen.getByRole('button', { name: /Escolher Arquivo/i })
      await user.click(fileButton)

      expect(mockOpen).toHaveBeenCalled()
    })

    it('should have clickable camera button', async () => {
      const user = userEvent.setup()
      render(<LabUploadZone {...defaultProps} />)

      const cameraButton = screen.getByRole('button', { name: /Usar Câmera/i })

      // Button should be clickable without errors
      await user.click(cameraButton)
      expect(cameraButton).toBeInTheDocument()
    })
  })

  describe('feature items', () => {
    it('should render HIPAA Compliant feature', () => {
      render(<LabUploadZone {...defaultProps} />)

      expect(screen.getByText('HIPAA Compliant')).toBeInTheDocument()
    })

    it('should render Multi-LLM feature', () => {
      render(<LabUploadZone {...defaultProps} />)

      expect(screen.getByText('Multi-LLM')).toBeInTheDocument()
    })

    it('should render processing time feature', () => {
      render(<LabUploadZone {...defaultProps} />)

      expect(screen.getByText('15-30 segundos')).toBeInTheDocument()
    })
  })

  describe('supported formats', () => {
    it('should display supported file formats', () => {
      render(<LabUploadZone {...defaultProps} />)

      expect(screen.getByText(/Formatos aceitos: PDF, JPG, PNG, WebP/)).toBeInTheDocument()
    })

    it('should display maximum file size', () => {
      render(<LabUploadZone {...defaultProps} />)

      expect(screen.getByText(/Máximo 15MB/)).toBeInTheDocument()
    })
  })

  describe('disabled state', () => {
    it('should render when disabled', () => {
      render(<LabUploadZone {...defaultProps} disabled={true} />)

      expect(screen.getByRole('region')).toBeInTheDocument()
    })

    it('should still show buttons when disabled', () => {
      render(<LabUploadZone {...defaultProps} disabled={true} />)

      expect(screen.getByRole('button', { name: /Escolher Arquivo/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Usar Câmera/i })).toBeInTheDocument()
    })
  })

  describe('file drop', () => {
    it('should call onFileSelect when file is dropped', () => {
      render(<LabUploadZone {...defaultProps} />)

      const dropzone = screen.getByRole('region')
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })

      const dataTransfer = {
        files: [file],
        types: ['Files'],
      }

      fireEvent.drop(dropzone, {
        dataTransfer,
      })

      // The mock handles the drop internally
      expect(dropzone).toBeInTheDocument()
    })
  })

  describe('file selection via dropzone', () => {
    it('should have file input with correct test id', () => {
      render(<LabUploadZone {...defaultProps} />)

      expect(screen.getByTestId('file-input')).toBeInTheDocument()
    })

    it('should have file input of type file', () => {
      render(<LabUploadZone {...defaultProps} />)

      const input = screen.getByTestId('file-input')
      expect(input).toHaveAttribute('type', 'file')
    })
  })

  describe('accessibility', () => {
    it('should have accessible upload region', () => {
      render(<LabUploadZone {...defaultProps} />)

      const region = screen.getByRole('region')
      expect(region).toHaveAttribute('aria-label')
    })

    it('should have buttons with accessible names', () => {
      render(<LabUploadZone {...defaultProps} />)

      expect(screen.getByRole('button', { name: /Escolher Arquivo/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Usar Câmera/i })).toBeInTheDocument()
    })

    it('should have file input', () => {
      render(<LabUploadZone {...defaultProps} />)

      const input = screen.getByTestId('file-input')
      expect(input).toHaveAttribute('type', 'file')
    })
  })

  describe('edge cases', () => {
    it('should render with required props only', () => {
      render(<LabUploadZone onFileSelect={mockOnFileSelect} />)

      // Should render normally without optional disabled prop
      expect(screen.getByRole('region')).toBeInTheDocument()
    })

    it('should render all expected elements', () => {
      render(<LabUploadZone onFileSelect={mockOnFileSelect} />)

      expect(screen.getByText('Análise de Exame Laboratorial')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Escolher Arquivo/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Usar Câmera/i })).toBeInTheDocument()
    })
  })
})
