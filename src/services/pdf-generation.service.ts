/**
 * PDF Generation Service
 * ======================
 *
 * Generates PDF documents for prescriptions and lab results.
 * Uses jsPDF with dynamic imports for optimal bundle size.
 *
 * @module services/pdf-generation
 */

import type { Prescription, PrescriptionMedication } from '@/types/prescription'
import type { LabResult } from '@/types/lab-result/lab-result'

// Dynamic imports - loaded only when PDF generation is triggered
let jsPDFModule: typeof import('jspdf') | null = null
let autoTableModule: typeof import('jspdf-autotable') | null = null

async function loadPDFLibs(): Promise<{
  jsPDF: typeof import('jspdf').default
  autoTable: typeof import('jspdf-autotable').default
}> {
  if (!jsPDFModule || !autoTableModule) {
    ;[jsPDFModule, autoTableModule] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable'),
    ])
  }
  return {
    jsPDF: jsPDFModule.default,
    autoTable: autoTableModule.default,
  }
}

// ============================================================================
// Helpers
// ============================================================================

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function formatDateLong(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function getPrescriptionTypeLabel(type: Prescription['type']): string {
  const labels: Record<Prescription['type'], string> = {
    common: 'Receita Simples',
    special_white: 'Receita Especial',
    blue: 'Receita Azul (Controlado B)',
    yellow: 'Receita Amarela (Controlado A)',
    antimicrobial: 'Receita Antimicrobiano',
  }
  return labels[type] || type
}

function getExamTypeLabel(type: LabResult['examType']): string {
  const labels: Record<LabResult['examType'], string> = {
    hemograma: 'Hemograma',
    bioquimica: 'Bioquimica',
    hormonal: 'Hormonal',
    urina: 'Urina',
    imagem: 'Imagem',
    outros: 'Outros',
  }
  return labels[type] || type
}

// ============================================================================
// Prescription PDF
// ============================================================================

/**
 * Generate a PDF for a prescription.
 * Returns a Blob that can be downloaded or displayed.
 */
export async function generatePrescriptionPDF(
  prescription: Prescription,
  clinicName: string = 'Clinica Genesis',
  clinicAddress?: string,
  clinicPhone?: string
): Promise<Blob> {
  const { jsPDF, autoTable } = await loadPDFLibs()
  const doc = new jsPDF()

  const pageWidth = doc.internal.pageSize.width
  const margin = 20

  // Header - Clinic Info
  doc.setFontSize(18)
  doc.setTextColor(17, 24, 39) // genesis-dark
  doc.text(clinicName, pageWidth / 2, 20, { align: 'center' })

  if (clinicAddress) {
    doc.setFontSize(9)
    doc.setTextColor(107, 114, 128) // gray-500
    doc.text(clinicAddress, pageWidth / 2, 27, { align: 'center' })
  }

  if (clinicPhone) {
    doc.setFontSize(9)
    doc.text(`Tel: ${clinicPhone}`, pageWidth / 2, 33, { align: 'center' })
  }

  // Divider line
  doc.setDrawColor(229, 231, 235) // gray-200
  doc.line(margin, 38, pageWidth - margin, 38)

  // Prescription Title
  doc.setFontSize(16)
  doc.setTextColor(17, 24, 39)
  doc.text('RECEITA MEDICA', pageWidth / 2, 48, { align: 'center' })

  // Prescription type badge
  doc.setFontSize(10)
  doc.setTextColor(79, 70, 229) // indigo
  doc.text(getPrescriptionTypeLabel(prescription.type), pageWidth / 2, 55, { align: 'center' })

  // Patient Info
  doc.setFontSize(11)
  doc.setTextColor(17, 24, 39)
  doc.text('PACIENTE:', margin, 68)
  doc.setFont('helvetica', 'bold')
  doc.text(prescription.patientName, margin + 28, 68)
  doc.setFont('helvetica', 'normal')

  if (prescription.patientCpf) {
    doc.setFontSize(10)
    doc.setTextColor(107, 114, 128)
    doc.text(`CPF: ${prescription.patientCpf}`, margin, 75)
  }

  // Date
  doc.setFontSize(10)
  doc.setTextColor(107, 114, 128)
  doc.text(`Data: ${formatDateLong(prescription.prescribedAt)}`, pageWidth - margin - 60, 68)

  // Medications Table
  const medicationsData = prescription.medications.map(
    (med: PrescriptionMedication, index: number) => [
      (index + 1).toString(),
      `${med.name}${med.presentation ? ` - ${med.presentation}` : ''}`,
      med.dosage,
      med.frequency,
      med.duration,
      med.quantity.toString(),
    ]
  )

  autoTable(doc, {
    startY: 85,
    head: [['#', 'Medicamento', 'Dose', 'Frequencia', 'Duracao', 'Qtd']],
    body: medicationsData,
    theme: 'grid',
    headStyles: {
      fillColor: [17, 24, 39], // genesis-dark
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [31, 41, 55],
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251], // gray-50
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 60 },
      2: { cellWidth: 25 },
      3: { cellWidth: 35 },
      4: { cellWidth: 25 },
      5: { cellWidth: 15, halign: 'center' },
    },
    margin: { left: margin, right: margin },
  })

  // Instructions for each medication
  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY || 120
  let currentY = finalY + 10

  const medsWithInstructions = prescription.medications.filter(
    (m: PrescriptionMedication) => m.instructions
  )
  if (medsWithInstructions.length > 0) {
    doc.setFontSize(10)
    doc.setTextColor(17, 24, 39)
    doc.text('Instrucoes:', margin, currentY)
    currentY += 6

    doc.setFontSize(9)
    doc.setTextColor(75, 85, 99) // gray-600
    medsWithInstructions.forEach((med: PrescriptionMedication) => {
      const text = `${med.name}: ${med.instructions}`
      const lines = doc.splitTextToSize(text, pageWidth - margin * 2)
      doc.text(lines, margin, currentY)
      currentY += lines.length * 5 + 3
    })
  }

  // General observations
  if (prescription.observations) {
    currentY += 5
    doc.setFontSize(10)
    doc.setTextColor(17, 24, 39)
    doc.text('Observacoes:', margin, currentY)
    currentY += 6

    doc.setFontSize(9)
    doc.setTextColor(75, 85, 99)
    const obsLines = doc.splitTextToSize(prescription.observations, pageWidth - margin * 2)
    doc.text(obsLines, margin, currentY)
    currentY += obsLines.length * 5
  }

  // Validity
  currentY += 10
  doc.setFontSize(9)
  doc.setTextColor(107, 114, 128)
  doc.text(`Validade: ${prescription.validityDays} dias (ate ${formatDate(prescription.expiresAt)})`, margin, currentY)

  // Digital signature info
  if (prescription.signature) {
    currentY += 15
    doc.setDrawColor(34, 197, 94) // green
    doc.setFillColor(240, 253, 244) // green-50
    doc.roundedRect(margin, currentY - 5, pageWidth - margin * 2, 25, 3, 3, 'FD')

    doc.setFontSize(9)
    doc.setTextColor(22, 163, 74) // green-600
    doc.text('ASSINATURA DIGITAL VALIDA', pageWidth / 2, currentY + 3, { align: 'center' })
    doc.setFontSize(8)
    doc.text(
      `Assinado por: ${prescription.signature.signedBy}`,
      pageWidth / 2,
      currentY + 10,
      { align: 'center' }
    )
    doc.text(
      `Data: ${formatDate(prescription.signature.signedAt)} | Hash: ${prescription.signature.signatureHash.substring(0, 16)}...`,
      pageWidth / 2,
      currentY + 16,
      { align: 'center' }
    )
    currentY += 25
  }

  // Professional signature area
  currentY = Math.max(currentY + 20, doc.internal.pageSize.height - 60)

  doc.setDrawColor(156, 163, 175) // gray-400
  doc.line(pageWidth / 2 - 50, currentY, pageWidth / 2 + 50, currentY)

  doc.setFontSize(11)
  doc.setTextColor(17, 24, 39)
  doc.text(prescription.professionalName, pageWidth / 2, currentY + 8, { align: 'center' })

  doc.setFontSize(9)
  doc.setTextColor(107, 114, 128)
  doc.text(
    `CRM ${prescription.professionalCrm}/${prescription.professionalCrmState}`,
    pageWidth / 2,
    currentY + 15,
    { align: 'center' }
  )

  // Footer
  doc.setFontSize(7)
  doc.setTextColor(156, 163, 175)
  doc.text(
    `Documento gerado em ${new Date().toLocaleString('pt-BR')} | ${clinicName}`,
    pageWidth / 2,
    doc.internal.pageSize.height - 10,
    { align: 'center' }
  )

  // Validation code if exists
  if (prescription.validationCode) {
    doc.text(
      `Codigo de validacao: ${prescription.validationCode}`,
      pageWidth / 2,
      doc.internal.pageSize.height - 5,
      { align: 'center' }
    )
  }

  return doc.output('blob')
}

/**
 * Download prescription PDF with auto-generated filename.
 */
export async function downloadPrescriptionPDF(
  prescription: Prescription,
  clinicName?: string,
  clinicAddress?: string,
  clinicPhone?: string
): Promise<void> {
  const blob = await generatePrescriptionPDF(prescription, clinicName, clinicAddress, clinicPhone)
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  const dateStr = formatDate(prescription.prescribedAt).replace(/\//g, '-')
  link.download = `receita_${prescription.patientName.replace(/\s+/g, '_')}_${dateStr}.pdf`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// ============================================================================
// Lab Result PDF
// ============================================================================

/**
 * Generate a cover PDF for a lab result.
 * This creates a summary page that can accompany the actual result file.
 */
export async function generateLabResultPDF(
  result: LabResult,
  clinicName: string = 'Clinica Genesis',
  clinicAddress?: string
): Promise<Blob> {
  const { jsPDF } = await loadPDFLibs()
  const doc = new jsPDF()

  const pageWidth = doc.internal.pageSize.width
  const margin = 20

  // Header
  doc.setFontSize(18)
  doc.setTextColor(17, 24, 39)
  doc.text(clinicName, pageWidth / 2, 20, { align: 'center' })

  if (clinicAddress) {
    doc.setFontSize(9)
    doc.setTextColor(107, 114, 128)
    doc.text(clinicAddress, pageWidth / 2, 27, { align: 'center' })
  }

  // Divider
  doc.setDrawColor(229, 231, 235)
  doc.line(margin, 35, pageWidth - margin, 35)

  // Title
  doc.setFontSize(16)
  doc.setTextColor(17, 24, 39)
  doc.text('RESULTADO DE EXAME', pageWidth / 2, 48, { align: 'center' })

  // Exam type badge
  doc.setFontSize(10)
  doc.setTextColor(79, 70, 229)
  doc.text(getExamTypeLabel(result.examType), pageWidth / 2, 55, { align: 'center' })

  // Patient Info Box
  doc.setDrawColor(229, 231, 235)
  doc.setFillColor(249, 250, 251)
  doc.roundedRect(margin, 65, pageWidth - margin * 2, 35, 3, 3, 'FD')

  doc.setFontSize(10)
  doc.setTextColor(107, 114, 128)
  doc.text('Paciente:', margin + 5, 75)
  doc.setFontSize(12)
  doc.setTextColor(17, 24, 39)
  doc.setFont('helvetica', 'bold')
  doc.text(result.patientName, margin + 30, 75)
  doc.setFont('helvetica', 'normal')

  doc.setFontSize(10)
  doc.setTextColor(107, 114, 128)
  doc.text('Exame:', margin + 5, 85)
  doc.setFontSize(11)
  doc.setTextColor(17, 24, 39)
  doc.text(result.examName, margin + 30, 85)

  doc.setFontSize(10)
  doc.setTextColor(107, 114, 128)
  doc.text('Solicitado por:', margin + 5, 95)
  doc.setTextColor(17, 24, 39)
  doc.text(result.requestedByName || result.requestedBy, margin + 40, 95)

  // Dates section
  doc.setFontSize(10)
  doc.setTextColor(107, 114, 128)
  doc.text(`Data da Solicitacao: ${formatDateLong(result.requestedAt)}`, margin, 115)

  if (result.completedAt) {
    doc.text(`Data do Resultado: ${formatDateLong(result.completedAt)}`, margin, 125)
  }

  // Status
  doc.setFontSize(11)
  const statusY = 145
  if (result.status === 'ready') {
    doc.setTextColor(22, 163, 74) // green
    doc.text('STATUS: RESULTADO DISPONIVEL', pageWidth / 2, statusY, { align: 'center' })
  } else if (result.status === 'pending') {
    doc.setTextColor(234, 179, 8) // yellow
    doc.text('STATUS: AGUARDANDO RESULTADO', pageWidth / 2, statusY, { align: 'center' })
  } else {
    doc.setTextColor(59, 130, 246) // blue
    doc.text('STATUS: VISUALIZADO', pageWidth / 2, statusY, { align: 'center' })
  }

  // Notes
  if (result.notes) {
    doc.setFontSize(10)
    doc.setTextColor(17, 24, 39)
    doc.text('Observacoes:', margin, 165)

    doc.setFontSize(9)
    doc.setTextColor(75, 85, 99)
    const notesLines = doc.splitTextToSize(result.notes, pageWidth - margin * 2)
    doc.text(notesLines, margin, 173)
  }

  // File info
  if (result.fileUrl) {
    doc.setFontSize(9)
    doc.setTextColor(107, 114, 128)
    doc.text(
      `Arquivo: ${result.fileName || 'resultado'} (${result.fileType?.toUpperCase() || 'PDF'})`,
      margin,
      200
    )
  }

  // Footer
  doc.setFontSize(7)
  doc.setTextColor(156, 163, 175)
  doc.text(
    `Documento gerado em ${new Date().toLocaleString('pt-BR')} | ${clinicName}`,
    pageWidth / 2,
    doc.internal.pageSize.height - 10,
    { align: 'center' }
  )

  return doc.output('blob')
}

/**
 * Download lab result PDF with auto-generated filename.
 */
export async function downloadLabResultPDF(
  result: LabResult,
  clinicName?: string,
  clinicAddress?: string
): Promise<void> {
  const blob = await generateLabResultPDF(result, clinicName, clinicAddress)
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  const dateStr = formatDate(result.requestedAt).replace(/\//g, '-')
  link.download = `exame_${result.examName.replace(/\s+/g, '_')}_${dateStr}.pdf`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// ============================================================================
// Exports
// ============================================================================

export const pdfService = {
  generatePrescriptionPDF,
  downloadPrescriptionPDF,
  generateLabResultPDF,
  downloadLabResultPDF,
}

export default pdfService
