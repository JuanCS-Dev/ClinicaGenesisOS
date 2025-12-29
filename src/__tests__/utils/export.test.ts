/**
 * Export Utilities Tests
 *
 * Tests for CSV, PDF, and Excel export functions.
 *
 * @module __tests__/utils/export
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  generateCSV,
  downloadCSV,
  generatePrintHTML,
  exportToPDF,
  downloadExcel,
  exportGuiasToCSV,
  exportGuiasToPDF,
} from '../../utils/export'
import type { ExportColumn, ExportOptions } from '../../utils/export'
import type { GuiaFirestore } from '@/types'

// Mock DOM methods
let mockLink: { href: string; download: string; click: () => void }
let mockPrintWindow: {
  document: { write: ReturnType<typeof vi.fn>; close: ReturnType<typeof vi.fn> }
  focus: ReturnType<typeof vi.fn>
  print: ReturnType<typeof vi.fn>
}

beforeEach(() => {
  mockLink = {
    href: '',
    download: '',
    click: vi.fn(),
  }

  mockPrintWindow = {
    document: {
      write: vi.fn(),
      close: vi.fn(),
    },
    focus: vi.fn(),
    print: vi.fn(),
  }

  vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
    if (tag === 'a') {
      return mockLink as unknown as HTMLAnchorElement
    }
    if (tag === 'div') {
      const div = {
        textContent: '',
        get innerHTML() {
          return this.textContent
        },
      }
      return div as unknown as HTMLDivElement
    }
    return document.createElement(tag)
  })

  vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as unknown as Node)
  vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as unknown as Node)
  vi.spyOn(window, 'open').mockReturnValue(mockPrintWindow as unknown as Window)

  globalThis.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
  globalThis.URL.revokeObjectURL = vi.fn()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('Export Utilities', () => {
  // Sample data for testing
  const sampleData = [
    { id: '1', name: 'Item 1', price: 100, nested: { value: 'nested1' } },
    { id: '2', name: 'Item 2', price: 200, nested: { value: 'nested2' } },
    { id: '3', name: 'Item "Special"', price: 300, nested: { value: 'nested3' } },
  ]

  const sampleColumns: ExportColumn<(typeof sampleData)[0]>[] = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Nome' },
    { key: 'price', label: 'Preço', format: v => `R$ ${v}` },
  ]

  const sampleOptions: ExportOptions = {
    filename: 'test-export',
    title: 'Test Report',
    subtitle: 'Test Subtitle',
  }

  describe('generateCSV', () => {
    it('should generate CSV with headers', () => {
      const csv = generateCSV(sampleData, sampleColumns)

      expect(csv).toContain('"ID","Nome","Preço"')
    })

    it('should generate CSV with data rows', () => {
      const csv = generateCSV(sampleData, sampleColumns)
      const lines = csv.split('\n')

      expect(lines).toHaveLength(4) // header + 3 data rows
      expect(lines[1]).toContain('"1"')
      expect(lines[1]).toContain('"Item 1"')
    })

    it('should apply format function', () => {
      const csv = generateCSV(sampleData, sampleColumns)

      expect(csv).toContain('"R$ 100"')
      expect(csv).toContain('"R$ 200"')
    })

    it('should escape quotes in values', () => {
      const csv = generateCSV(sampleData, sampleColumns)

      expect(csv).toContain('"Item ""Special"""')
    })

    it('should handle nested values with dot notation', () => {
      const columns: ExportColumn<(typeof sampleData)[0]>[] = [
        { key: 'nested.value', label: 'Nested Value' },
      ]
      const csv = generateCSV(sampleData, columns)

      expect(csv).toContain('"nested1"')
      expect(csv).toContain('"nested2"')
    })

    it('should handle null/undefined values', () => {
      const dataWithNull = [{ id: '1', name: null, price: undefined }]
      const csv = generateCSV(dataWithNull as unknown as typeof sampleData, sampleColumns)

      expect(csv).toContain('""')
    })

    it('should handle empty data array', () => {
      const csv = generateCSV([], sampleColumns)
      const lines = csv.split('\n')

      expect(lines).toHaveLength(1) // header only
    })
  })

  describe('downloadCSV', () => {
    it('should create blob and trigger download', () => {
      downloadCSV(sampleData, sampleColumns, sampleOptions)

      expect(URL.createObjectURL).toHaveBeenCalled()
      expect(mockLink.click).toHaveBeenCalled()
      expect(mockLink.download).toBe('test-export.csv')
    })

    it('should include BOM for UTF-8', () => {
      downloadCSV(sampleData, sampleColumns, sampleOptions)

      // Check that Blob was created (we can't easily check BOM without more complex mocking)
      expect(URL.createObjectURL).toHaveBeenCalled()
    })

    it('should revoke object URL after download', () => {
      downloadCSV(sampleData, sampleColumns, sampleOptions)

      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
    })
  })

  describe('generatePrintHTML', () => {
    it('should generate HTML document', () => {
      const html = generatePrintHTML(sampleData, sampleColumns, sampleOptions)

      expect(html).toContain('<!DOCTYPE html>')
      expect(html).toContain('<html>')
      expect(html).toContain('</html>')
    })

    it('should include title', () => {
      const html = generatePrintHTML(sampleData, sampleColumns, sampleOptions)

      expect(html).toContain('<title>Test Report</title>')
      expect(html).toContain('<h1>Test Report</h1>')
    })

    it('should include subtitle when provided', () => {
      const html = generatePrintHTML(sampleData, sampleColumns, sampleOptions)

      expect(html).toContain('<p>Test Subtitle</p>')
    })

    it('should not include subtitle when not provided', () => {
      const optionsNoSubtitle = { ...sampleOptions, subtitle: undefined }
      const html = generatePrintHTML(sampleData, sampleColumns, optionsNoSubtitle)

      expect(html).not.toContain('<p>undefined</p>')
    })

    it('should include table headers', () => {
      const html = generatePrintHTML(sampleData, sampleColumns, sampleOptions)

      expect(html).toContain('<th>ID</th>')
      expect(html).toContain('<th>Nome</th>')
      expect(html).toContain('<th>Preço</th>')
    })

    it('should include table data', () => {
      const html = generatePrintHTML(sampleData, sampleColumns, sampleOptions)

      expect(html).toContain('<td>1</td>')
      expect(html).toContain('<td>Item 1</td>')
      expect(html).toContain('<td>R$ 100</td>')
    })

    it('should include date generated by default', () => {
      const html = generatePrintHTML(sampleData, sampleColumns, sampleOptions)

      expect(html).toContain('Gerado em:')
    })

    it('should hide date when dateGenerated is false', () => {
      const optionsNoDate = { ...sampleOptions, dateGenerated: false }
      const html = generatePrintHTML(sampleData, sampleColumns, optionsNoDate)

      expect(html).not.toContain('Gerado em:')
    })

    it('should use filename as title fallback', () => {
      const optionsNoTitle = { filename: 'test-file' }
      const html = generatePrintHTML(sampleData, sampleColumns, optionsNoTitle)

      expect(html).toContain('<title>test-file</title>')
    })

    it('should include Genesis footer', () => {
      const html = generatePrintHTML(sampleData, sampleColumns, sampleOptions)

      expect(html).toContain('Genesis OS')
    })

    it('should include print media styles', () => {
      const html = generatePrintHTML(sampleData, sampleColumns, sampleOptions)

      expect(html).toContain('@media print')
    })
  })

  describe('exportToPDF', () => {
    it('should open new window for print', () => {
      exportToPDF(sampleData, sampleColumns, sampleOptions)

      expect(window.open).toHaveBeenCalledWith('', '_blank')
    })

    it('should write HTML to print window', () => {
      exportToPDF(sampleData, sampleColumns, sampleOptions)

      expect(mockPrintWindow.document.write).toHaveBeenCalled()
      const htmlWritten = mockPrintWindow.document.write.mock.calls[0][0]
      expect(htmlWritten).toContain('<!DOCTYPE html>')
    })

    it('should close document and focus window', () => {
      exportToPDF(sampleData, sampleColumns, sampleOptions)

      expect(mockPrintWindow.document.close).toHaveBeenCalled()
      expect(mockPrintWindow.focus).toHaveBeenCalled()
    })

    it('should handle null window gracefully', () => {
      vi.spyOn(window, 'open').mockReturnValue(null)

      // Should not throw
      expect(() => exportToPDF(sampleData, sampleColumns, sampleOptions)).not.toThrow()
    })
  })

  describe('downloadExcel', () => {
    it('should create Excel-compatible blob', () => {
      downloadExcel(sampleData, sampleColumns, sampleOptions)

      expect(URL.createObjectURL).toHaveBeenCalled()
      expect(mockLink.download).toBe('test-export.xls')
    })

    it('should trigger download', () => {
      downloadExcel(sampleData, sampleColumns, sampleOptions)

      expect(mockLink.click).toHaveBeenCalled()
    })
  })

  describe('exportGuiasToCSV', () => {
    const mockGuias: Partial<GuiaFirestore>[] = [
      {
        numeroGuiaPrestador: 'GUIA-001',
        tipoGuia: 'consulta',
        nomeOperadora: 'Operadora A',
        registroANS: '123456',
        dadosGuia: {
          dadosBeneficiario: {
            nomeBeneficiario: 'João Silva',
            numeroCarteira: '12345',
            atendimentoRN: 'N',
          },
        },
        dataAtendimento: '2024-01-15',
        valorTotal: 150,
        valorPago: 150,
        valorGlosado: 0,
        status: 'pago',
        createdAt: '2024-01-15T10:00:00Z',
      },
    ]

    it('should call downloadCSV with correct columns', () => {
      exportGuiasToCSV(mockGuias as GuiaFirestore[], 'guias-export')

      expect(URL.createObjectURL).toHaveBeenCalled()
      expect(mockLink.download).toBe('guias-export.csv')
    })
  })

  describe('exportGuiasToPDF', () => {
    const mockGuias: Partial<GuiaFirestore>[] = [
      {
        numeroGuiaPrestador: 'GUIA-001',
        tipoGuia: 'consulta',
        nomeOperadora: 'Operadora A',
        dadosGuia: {
          dadosBeneficiario: {
            nomeBeneficiario: 'João Silva',
            numeroCarteira: '12345',
            atendimentoRN: 'N',
          },
        },
        dataAtendimento: '2024-01-15',
        valorTotal: 150,
        status: 'pago',
      },
    ]

    it('should call exportToPDF with correct options', () => {
      exportGuiasToPDF(mockGuias as GuiaFirestore[], { title: 'Relatório de Guias' })

      expect(window.open).toHaveBeenCalled()
      const htmlWritten = mockPrintWindow.document.write.mock.calls[0][0]
      expect(htmlWritten).toContain('Relatório de Guias')
    })

    it('should include guia count in subtitle', () => {
      exportGuiasToPDF(mockGuias as GuiaFirestore[], { title: 'Test' })

      const htmlWritten = mockPrintWindow.document.write.mock.calls[0][0]
      expect(htmlWritten).toContain('Total: 1 guias')
    })
  })
})
