/**
 * PDF Generation Service Tests
 * ============================
 *
 * Tests for prescription and lab result PDF generation.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock jsPDF and jspdf-autotable with proper class structure
const mockDocOutput = vi.fn(() => new Blob(['pdf content'], { type: 'application/pdf' }))
const mockDocText = vi.fn()
const mockDocLine = vi.fn()
const mockDocRoundedRect = vi.fn()
const mockDocSetFontSize = vi.fn()
const mockDocSetTextColor = vi.fn()
const mockDocSetDrawColor = vi.fn()
const mockDocSetFillColor = vi.fn()
const mockDocSetFont = vi.fn()
const mockDocSplitTextToSize = vi.fn((text: string) => [text])

// Create a proper mock class
class MockJsPDF {
  text = mockDocText
  line = mockDocLine
  roundedRect = mockDocRoundedRect
  setFontSize = mockDocSetFontSize
  setTextColor = mockDocSetTextColor
  setDrawColor = mockDocSetDrawColor
  setFillColor = mockDocSetFillColor
  setFont = mockDocSetFont
  splitTextToSize = mockDocSplitTextToSize
  output = mockDocOutput
  internal = {
    pageSize: { width: 210, height: 297 },
  }
  lastAutoTable = { finalY: 120 }
}

vi.mock('jspdf', () => ({
  default: MockJsPDF,
}))

vi.mock('jspdf-autotable', () => ({
  default: vi.fn(),
}))

// Import after mocks
import {
  generatePrescriptionPDF,
  downloadPrescriptionPDF,
  generateLabResultPDF,
  downloadLabResultPDF,
  pdfService,
} from '../../services/pdf-generation.service'
import type { Prescription } from '@/types/prescription'
import type { LabResult } from '@/types/lab-result/lab-result'

// Test data
const mockPrescription: Prescription = {
  id: 'rx-123',
  clinicId: 'clinic-123',
  patientId: 'patient-123',
  patientName: 'Maria Santos',
  patientCpf: '123.456.789-00',
  professionalId: 'prof-123',
  professionalName: 'Dr. João Silva',
  professionalCrm: '12345',
  professionalCrmState: 'SP',
  prescribedAt: '2025-01-15T10:00:00Z',
  expiresAt: '2025-02-14T10:00:00Z',
  validityDays: 30,
  type: 'common',
  status: 'active',
  medications: [
    {
      name: 'Paracetamol',
      presentation: '750mg',
      dosage: '1 comprimido',
      frequency: '8/8h',
      duration: '5 dias',
      quantity: 15,
      instructions: 'Tomar com agua',
    },
    {
      name: 'Ibuprofeno',
      presentation: '400mg',
      dosage: '1 comprimido',
      frequency: '12/12h',
      duration: '3 dias',
      quantity: 6,
    },
  ],
  observations: 'Retornar se nao melhorar',
  createdAt: '2025-01-15T10:00:00Z',
  updatedAt: '2025-01-15T10:00:00Z',
}

const mockPrescriptionWithSignature: Prescription = {
  ...mockPrescription,
  signature: {
    signedBy: 'Dr. João Silva',
    signedAt: '2025-01-15T10:05:00Z',
    signatureHash: 'abc123def456ghi789jkl012mno345pqr678stu901vwx234',
    certificateId: 'cert-123',
  },
  validationCode: 'VAL-2025-001',
}

const mockLabResult: LabResult = {
  id: 'lab-123',
  clinicId: 'clinic-123',
  patientId: 'patient-123',
  patientName: 'Maria Santos',
  examName: 'Hemograma Completo',
  examType: 'hemograma',
  requestedBy: 'prof-123',
  requestedByName: 'Dr. João Silva',
  requestedAt: '2025-01-10T10:00:00Z',
  completedAt: '2025-01-12T14:00:00Z',
  status: 'ready',
  notes: 'Resultado dentro da normalidade',
  fileUrl: 'https://storage.example.com/results/lab-123.pdf',
  fileName: 'hemograma_2025.pdf',
  fileType: 'application/pdf',
  createdAt: '2025-01-10T10:00:00Z',
  updatedAt: '2025-01-12T14:00:00Z',
}

describe('PDF Generation Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('generatePrescriptionPDF', () => {
    it('should generate a PDF blob for a prescription', async () => {
      const blob = await generatePrescriptionPDF(mockPrescription)

      expect(blob).toBeInstanceOf(Blob)
      expect(blob.type).toBe('application/pdf')
    })

    it('should include clinic name in header', async () => {
      await generatePrescriptionPDF(mockPrescription, 'Test Clinic')

      expect(mockDocText).toHaveBeenCalledWith(
        'Test Clinic',
        expect.any(Number),
        20,
        expect.any(Object)
      )
    })

    it('should include clinic address when provided', async () => {
      await generatePrescriptionPDF(mockPrescription, 'Test Clinic', 'Rua Test, 123')

      expect(mockDocText).toHaveBeenCalledWith(
        'Rua Test, 123',
        expect.any(Number),
        27,
        expect.any(Object)
      )
    })

    it('should include clinic phone when provided', async () => {
      await generatePrescriptionPDF(mockPrescription, 'Test Clinic', undefined, '11999999999')

      expect(mockDocText).toHaveBeenCalledWith(
        'Tel: 11999999999',
        expect.any(Number),
        33,
        expect.any(Object)
      )
    })

    it('should include patient name', async () => {
      await generatePrescriptionPDF(mockPrescription)

      expect(mockDocText).toHaveBeenCalledWith(
        'Maria Santos',
        expect.any(Number),
        68
      )
    })

    it('should include patient CPF when available', async () => {
      await generatePrescriptionPDF(mockPrescription)

      expect(mockDocText).toHaveBeenCalledWith(
        'CPF: 123.456.789-00',
        expect.any(Number),
        75
      )
    })

    it('should include professional name and CRM', async () => {
      await generatePrescriptionPDF(mockPrescription)

      expect(mockDocText).toHaveBeenCalledWith(
        'Dr. João Silva',
        expect.any(Number),
        expect.any(Number),
        expect.any(Object)
      )

      expect(mockDocText).toHaveBeenCalledWith(
        'CRM 12345/SP',
        expect.any(Number),
        expect.any(Number),
        expect.any(Object)
      )
    })

    it('should include prescription observations', async () => {
      await generatePrescriptionPDF(mockPrescription)

      expect(mockDocText).toHaveBeenCalledWith(
        'Observacoes:',
        expect.any(Number),
        expect.any(Number)
      )
    })

    it('should include digital signature info when present', async () => {
      await generatePrescriptionPDF(mockPrescriptionWithSignature)

      expect(mockDocText).toHaveBeenCalledWith(
        'ASSINATURA DIGITAL VALIDA',
        expect.any(Number),
        expect.any(Number),
        expect.any(Object)
      )

      expect(mockDocText).toHaveBeenCalledWith(
        'Assinado por: Dr. João Silva',
        expect.any(Number),
        expect.any(Number),
        expect.any(Object)
      )
    })

    it('should include validation code when present', async () => {
      await generatePrescriptionPDF(mockPrescriptionWithSignature)

      expect(mockDocText).toHaveBeenCalledWith(
        'Codigo de validacao: VAL-2025-001',
        expect.any(Number),
        expect.any(Number),
        expect.any(Object)
      )
    })

    it('should handle different prescription types', async () => {
      const specialPrescription = { ...mockPrescription, type: 'blue' as const }
      await generatePrescriptionPDF(specialPrescription)

      expect(mockDocText).toHaveBeenCalledWith(
        'Receita Azul (Controlado B)',
        expect.any(Number),
        55,
        expect.any(Object)
      )
    })

    it('should use default clinic name when not provided', async () => {
      await generatePrescriptionPDF(mockPrescription)

      expect(mockDocText).toHaveBeenCalledWith(
        'Clinica Genesis',
        expect.any(Number),
        20,
        expect.any(Object)
      )
    })
  })

  describe('downloadPrescriptionPDF', () => {
    let mockCreateElement: ReturnType<typeof vi.spyOn>
    let mockAppendChild: ReturnType<typeof vi.spyOn>
    let mockRemoveChild: ReturnType<typeof vi.spyOn>
    let mockCreateObjectURL: ReturnType<typeof vi.spyOn>
    let mockRevokeObjectURL: ReturnType<typeof vi.spyOn>
    let mockLink: { href: string; download: string; click: ReturnType<typeof vi.fn> }

    beforeEach(() => {
      mockLink = { href: '', download: '', click: vi.fn() }
      mockCreateElement = vi.spyOn(document, 'createElement').mockReturnValue(mockLink as unknown as HTMLAnchorElement)
      mockAppendChild = vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as unknown as Node)
      mockRemoveChild = vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as unknown as Node)
      mockCreateObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test-url')
      mockRevokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    })

    afterEach(() => {
      mockCreateElement.mockRestore()
      mockAppendChild.mockRestore()
      mockRemoveChild.mockRestore()
      mockCreateObjectURL.mockRestore()
      mockRevokeObjectURL.mockRestore()
    })

    it('should download PDF with correct filename', async () => {
      await downloadPrescriptionPDF(mockPrescription)

      expect(mockLink.download).toMatch(/receita_Maria_Santos_/)
      expect(mockLink.download).toMatch(/\.pdf$/)
    })

    it('should trigger download by clicking link', async () => {
      await downloadPrescriptionPDF(mockPrescription)

      expect(mockLink.click).toHaveBeenCalled()
    })

    it('should clean up after download', async () => {
      await downloadPrescriptionPDF(mockPrescription)

      expect(mockRemoveChild).toHaveBeenCalled()
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:test-url')
    })
  })

  describe('generateLabResultPDF', () => {
    it('should generate a PDF blob for a lab result', async () => {
      const blob = await generateLabResultPDF(mockLabResult)

      expect(blob).toBeInstanceOf(Blob)
      expect(blob.type).toBe('application/pdf')
    })

    it('should include patient name', async () => {
      await generateLabResultPDF(mockLabResult)

      expect(mockDocText).toHaveBeenCalledWith(
        'Maria Santos',
        expect.any(Number),
        75
      )
    })

    it('should include exam name', async () => {
      await generateLabResultPDF(mockLabResult)

      expect(mockDocText).toHaveBeenCalledWith(
        'Hemograma Completo',
        expect.any(Number),
        85
      )
    })

    it('should include requesting professional', async () => {
      await generateLabResultPDF(mockLabResult)

      expect(mockDocText).toHaveBeenCalledWith(
        'Dr. João Silva',
        expect.any(Number),
        95
      )
    })

    it('should show ready status when result is available', async () => {
      await generateLabResultPDF(mockLabResult)

      expect(mockDocText).toHaveBeenCalledWith(
        'STATUS: RESULTADO DISPONIVEL',
        expect.any(Number),
        expect.any(Number),
        expect.any(Object)
      )
    })

    it('should show pending status when result is not ready', async () => {
      const pendingResult = { ...mockLabResult, status: 'pending' as const }
      await generateLabResultPDF(pendingResult)

      expect(mockDocText).toHaveBeenCalledWith(
        'STATUS: AGUARDANDO RESULTADO',
        expect.any(Number),
        expect.any(Number),
        expect.any(Object)
      )
    })

    it('should show viewed status when result was viewed', async () => {
      const viewedResult = { ...mockLabResult, status: 'viewed' as const }
      await generateLabResultPDF(viewedResult)

      expect(mockDocText).toHaveBeenCalledWith(
        'STATUS: VISUALIZADO',
        expect.any(Number),
        expect.any(Number),
        expect.any(Object)
      )
    })

    it('should include notes when present', async () => {
      await generateLabResultPDF(mockLabResult)

      expect(mockDocText).toHaveBeenCalledWith(
        'Observacoes:',
        expect.any(Number),
        165
      )
    })

    it('should include file info when available', async () => {
      await generateLabResultPDF(mockLabResult)

      // File type is uppercased: 'application/pdf' -> 'APPLICATION/PDF'
      expect(mockDocText).toHaveBeenCalledWith(
        'Arquivo: hemograma_2025.pdf (APPLICATION/PDF)',
        20, // margin
        200
      )
    })

    it('should handle different exam types', async () => {
      const bioquimicaResult = { ...mockLabResult, examType: 'bioquimica' as const }
      await generateLabResultPDF(bioquimicaResult)

      expect(mockDocText).toHaveBeenCalledWith(
        'Bioquimica',
        expect.any(Number),
        55,
        expect.any(Object)
      )
    })
  })

  describe('downloadLabResultPDF', () => {
    let mockCreateElement: ReturnType<typeof vi.spyOn>
    let mockAppendChild: ReturnType<typeof vi.spyOn>
    let mockRemoveChild: ReturnType<typeof vi.spyOn>
    let mockCreateObjectURL: ReturnType<typeof vi.spyOn>
    let mockRevokeObjectURL: ReturnType<typeof vi.spyOn>
    let mockLink: { href: string; download: string; click: ReturnType<typeof vi.fn> }

    beforeEach(() => {
      mockLink = { href: '', download: '', click: vi.fn() }
      mockCreateElement = vi.spyOn(document, 'createElement').mockReturnValue(mockLink as unknown as HTMLAnchorElement)
      mockAppendChild = vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as unknown as Node)
      mockRemoveChild = vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as unknown as Node)
      mockCreateObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test-url')
      mockRevokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    })

    afterEach(() => {
      mockCreateElement.mockRestore()
      mockAppendChild.mockRestore()
      mockRemoveChild.mockRestore()
      mockCreateObjectURL.mockRestore()
      mockRevokeObjectURL.mockRestore()
    })

    it('should download PDF with correct filename', async () => {
      await downloadLabResultPDF(mockLabResult)

      expect(mockLink.download).toMatch(/exame_Hemograma_Completo_/)
      expect(mockLink.download).toMatch(/\.pdf$/)
    })

    it('should trigger download by clicking link', async () => {
      await downloadLabResultPDF(mockLabResult)

      expect(mockLink.click).toHaveBeenCalled()
    })

    it('should clean up after download', async () => {
      await downloadLabResultPDF(mockLabResult)

      expect(mockRemoveChild).toHaveBeenCalled()
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:test-url')
    })
  })

  describe('pdfService object export', () => {
    it('should export all methods', () => {
      expect(pdfService).toHaveProperty('generatePrescriptionPDF')
      expect(pdfService).toHaveProperty('downloadPrescriptionPDF')
      expect(pdfService).toHaveProperty('generateLabResultPDF')
      expect(pdfService).toHaveProperty('downloadLabResultPDF')
    })
  })
})
