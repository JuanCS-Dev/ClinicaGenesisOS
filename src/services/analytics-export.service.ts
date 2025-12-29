/**
 * Analytics Export Service
 * ========================
 *
 * Exports analytics data to Excel/PDF formats.
 * Uses lazy loading to avoid bundle bloat.
 *
 * @module services/analytics-export
 */

import type { FinancialWellnessData } from '@/hooks/useFinancialWellness'
import type { PatientInsightsData } from '@/hooks/usePatientInsights'
import { formatCurrency } from '@/types'

// =============================================================================
// Types
// =============================================================================

export type ExportFormat = 'xlsx' | 'pdf'

export interface AnalyticsExportData {
  financial?: FinancialWellnessData
  patients?: PatientInsightsData
  dateRange: string
  generatedAt: Date
}

// =============================================================================
// Lazy Loading - Dynamic imports to avoid bundle bloat
// =============================================================================

async function getXLSX() {
  const XLSX = await import('xlsx')
  return XLSX
}

async function getJsPDF() {
  const { default: jsPDF } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')
  return { jsPDF, autoTable }
}

// =============================================================================
// Excel Export
// =============================================================================

async function exportToExcel(data: AnalyticsExportData): Promise<Blob> {
  const XLSX = await getXLSX()
  const wb = XLSX.utils.book_new()

  // Financial Sheet
  if (data.financial) {
    const financialData = [
      ['=== SAÚDE FINANCEIRA ===', '', '', ''],
      ['Período:', data.dateRange, '', ''],
      ['Gerado em:', data.generatedAt.toLocaleString('pt-BR'), '', ''],
      ['', '', '', ''],
      ['--- Score de Saúde ---', '', '', ''],
      ['Score Geral:', `${data.financial.healthScore.overall}/100`, '', ''],
      ['Status:', data.financial.healthScore.status.toUpperCase(), '', ''],
      ['', '', '', ''],
      ['--- Componentes do Score ---', '', '', ''],
      ['Fluxo de Caixa:', `${data.financial.healthScore.components.cashFlow}/100`, '', ''],
      ['Rentabilidade:', `${data.financial.healthScore.components.profitability}/100`, '', ''],
      ['Cobranças:', `${data.financial.healthScore.components.collections}/100`, '', ''],
      ['Crescimento:', `${data.financial.healthScore.components.growth}/100`, '', ''],
      ['', '', '', ''],
      ['--- Projeções ---', '', '', ''],
      ['Receita Mês Atual:', formatCurrency(data.financial.projection.currentMonth), '', ''],
      ['Projeção Próximo Mês:', formatCurrency(data.financial.projection.projectedMonth), '', ''],
      ['Projeção Trimestre:', formatCurrency(data.financial.projection.projectedQuarter), '', ''],
      ['Projeção Ano:', formatCurrency(data.financial.projection.projectedYear), '', ''],
      ['Taxa de Crescimento:', `${data.financial.projection.growthRate}%`, '', ''],
      ['Confiança:', data.financial.projection.confidence.toUpperCase(), '', ''],
      ['', '', '', ''],
      ['--- Inadimplência ---', '', '', ''],
      ['Total Vencido:', formatCurrency(data.financial.delinquency.totalOverdue), '', ''],
      ['Qtd Vencidos:', data.financial.delinquency.overdueCount.toString(), '', ''],
      ['Taxa Inadimplência:', `${data.financial.delinquency.overduePercentage}%`, '', ''],
      ['Dias Médios Atraso:', data.financial.delinquency.averageDaysOverdue.toString(), '', ''],
      ['', '', '', ''],
      ['--- Métricas por Procedimento ---', '', '', ''],
      ['Procedimento', 'Quantidade', 'Receita Total', 'Ticket Médio'],
      ...data.financial.procedureMetrics.map(p => [
        p.procedureType,
        p.count.toString(),
        formatCurrency(p.totalRevenue),
        formatCurrency(p.averageTicket),
      ]),
      ['', '', '', ''],
      ['--- Recomendações ---', '', '', ''],
      ...data.financial.healthScore.recommendations.map(r => [r, '', '', '']),
    ]

    const wsFinancial = XLSX.utils.aoa_to_sheet(financialData)
    wsFinancial['!cols'] = [{ wch: 30 }, { wch: 20 }, { wch: 20 }, { wch: 20 }]
    XLSX.utils.book_append_sheet(wb, wsFinancial, 'Financeiro')
  }

  // Patient Insights Sheet
  if (data.patients) {
    // Get NPS category based on score
    const getNPSCategory = (score: number) => {
      if (score >= 50) return 'Excelente'
      if (score >= 0) return 'Bom'
      return 'Precisa Melhorar'
    }

    const patientData = [
      ['=== INSIGHTS DE PACIENTES ===', '', '', ''],
      ['Período:', data.dateRange, '', ''],
      ['Gerado em:', data.generatedAt.toLocaleString('pt-BR'), '', ''],
      ['', '', '', ''],
      ['--- Resumo ---', '', '', ''],
      ['Total de Pacientes:', data.patients.retention.totalPatients.toString(), '', ''],
      ['Novos (período):', data.patients.retention.newPatients.toString(), '', ''],
      ['Ativos:', data.patients.retention.activePatients.toString(), '', ''],
      ['Retornantes:', data.patients.retention.returningPatients.toString(), '', ''],
      ['Taxa de Retenção:', `${data.patients.retention.retentionRate}%`, '', ''],
      ['Taxa de Churn:', `${data.patients.retention.churnRate}%`, '', ''],
      ['', '', '', ''],
      ['--- NPS ---', '', '', ''],
      ['Score NPS:', data.patients.nps.score.toString(), '', ''],
      ['Categoria:', getNPSCategory(data.patients.nps.score), '', ''],
      ['Promotores:', data.patients.nps.promoters.toString(), '', ''],
      ['Neutros:', data.patients.nps.passives.toString(), '', ''],
      ['Detratores:', data.patients.nps.detractors.toString(), '', ''],
      ['Total Respostas:', data.patients.nps.totalResponses.toString(), '', ''],
      ['', '', '', ''],
      ['--- Engajamento ---', '', '', ''],
      ['Adoção Portal:', `${data.patients.engagement.portalAdoption}%`, '', ''],
      ['Taxa Confirmação:', `${data.patients.engagement.appointmentConfirmationRate}%`, '', ''],
      ['Taxa No-Show:', `${data.patients.engagement.noShowRate}%`, '', ''],
      ['Tempo Resposta Médio:', `${data.patients.engagement.averageResponseTime}h`, '', ''],
      ['', '', '', ''],
      ['--- Distribuição por Idade ---', '', '', ''],
      ['Faixa Etária', 'Quantidade', '%', ''],
      ...data.patients.demographics.byAge.map(a => [
        a.range || 'N/A',
        a.count.toString(),
        `${a.percentage}%`,
        '',
      ]),
      ['', '', '', ''],
      ['--- Distribuição por Gênero ---', '', '', ''],
      ['Gênero', 'Quantidade', '%', ''],
      ...data.patients.demographics.byGender.map(g => [
        g.gender || 'N/A',
        g.count.toString(),
        `${g.percentage}%`,
        '',
      ]),
      ['', '', '', ''],
      ['--- Pacientes em Risco ---', '', '', ''],
      ['Nome', 'Última Visita', 'Motivo', 'Risco'],
      ...data.patients.patientsAtRisk.map(p => [
        p.patientName,
        new Date(p.lastVisit).toLocaleDateString('pt-BR'),
        p.reason,
        p.riskLevel.toUpperCase(),
      ]),
    ]

    const wsPatients = XLSX.utils.aoa_to_sheet(patientData)
    wsPatients['!cols'] = [{ wch: 30 }, { wch: 20 }, { wch: 15 }, { wch: 15 }]
    XLSX.utils.book_append_sheet(wb, wsPatients, 'Pacientes')
  }

  // YoY Comparison Sheet (if financial data available)
  if (data.financial?.yoyComparison.byMonth.length) {
    const yoyData = [
      ['=== COMPARATIVO ANO A ANO ===', '', ''],
      ['', '', ''],
      ['Mês', 'Ano Atual', 'Ano Anterior'],
      ...data.financial.yoyComparison.byMonth.map(m => [
        m.month,
        formatCurrency(m.currentYear),
        formatCurrency(m.previousYear),
      ]),
      ['', '', ''],
      [
        'TOTAL',
        formatCurrency(data.financial.yoyComparison.currentYear),
        formatCurrency(data.financial.yoyComparison.previousYear),
      ],
      [
        'VARIAÇÃO',
        `${data.financial.yoyComparison.percentageChange}%`,
        data.financial.yoyComparison.trend.toUpperCase(),
      ],
    ]

    const wsYoY = XLSX.utils.aoa_to_sheet(yoyData)
    wsYoY['!cols'] = [{ wch: 15 }, { wch: 20 }, { wch: 20 }]
    XLSX.utils.book_append_sheet(wb, wsYoY, 'YoY')
  }

  // Generate buffer
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  return new Blob([wbout], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}

// =============================================================================
// PDF Export
// =============================================================================

async function exportToPDF(data: AnalyticsExportData): Promise<Blob> {
  const { jsPDF } = await getJsPDF()
  const doc = new jsPDF()

  let yPosition = 20

  // Title
  doc.setFontSize(18)
  doc.setTextColor(15, 118, 110) // genesis-primary
  doc.text('Relatório de Analytics - Clínica Genesis', 14, yPosition)
  yPosition += 10

  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.text(`Período: ${data.dateRange}`, 14, yPosition)
  yPosition += 5
  doc.text(`Gerado em: ${data.generatedAt.toLocaleString('pt-BR')}`, 14, yPosition)
  yPosition += 15

  // Financial Section
  if (data.financial) {
    doc.setFontSize(14)
    doc.setTextColor(0)
    doc.text('Saúde Financeira', 14, yPosition)
    yPosition += 10

    // Health Score
    doc.setFontSize(24)
    doc.setTextColor(15, 118, 110)
    doc.text(`${data.financial.healthScore.overall}`, 14, yPosition)
    doc.setFontSize(10)
    doc.text('/100', 35, yPosition)
    doc.setTextColor(100)
    doc.text(`Status: ${data.financial.healthScore.status.toUpperCase()}`, 50, yPosition)
    yPosition += 15

    // Projections table
    doc.setFontSize(11)
    doc.setTextColor(0)
    doc.text('Projeções de Receita', 14, yPosition)
    yPosition += 5

    // @ts-expect-error - autoTable extends jsPDF
    doc.autoTable({
      startY: yPosition,
      head: [['Métrica', 'Valor']],
      body: [
        ['Receita Atual', formatCurrency(data.financial.projection.currentMonth)],
        ['Projeção Mês', formatCurrency(data.financial.projection.projectedMonth)],
        ['Projeção Trimestre', formatCurrency(data.financial.projection.projectedQuarter)],
        ['Taxa Crescimento', `${data.financial.projection.growthRate}%`],
      ],
      theme: 'striped',
      headStyles: { fillColor: [15, 118, 110] },
    })

    // @ts-expect-error - autoTable extends jsPDF
    yPosition = doc.lastAutoTable.finalY + 10

    // Delinquency
    doc.text('Inadimplência', 14, yPosition)
    yPosition += 5

    // @ts-expect-error - autoTable extends jsPDF
    doc.autoTable({
      startY: yPosition,
      head: [['Faixa', 'Quantidade', 'Valor']],
      body: data.financial.delinquency.byAgeRange.map(r => [
        r.range,
        r.count.toString(),
        formatCurrency(r.amount),
      ]),
      theme: 'striped',
      headStyles: { fillColor: [239, 68, 68] },
    })

    // @ts-expect-error - autoTable extends jsPDF
    yPosition = doc.lastAutoTable.finalY + 10
  }

  // Patient Section (new page if needed)
  if (data.patients) {
    if (yPosition > 200) {
      doc.addPage()
      yPosition = 20
    }

    // Get NPS category based on score
    const getNPSCategory = (score: number) => {
      if (score >= 50) return 'Excelente'
      if (score >= 0) return 'Bom'
      return 'Precisa Melhorar'
    }

    doc.setFontSize(14)
    doc.setTextColor(0)
    doc.text('Insights de Pacientes', 14, yPosition)
    yPosition += 10

    // Summary
    doc.setFontSize(11)
    doc.text(`Total Pacientes: ${data.patients.retention.totalPatients}`, 14, yPosition)
    yPosition += 6
    doc.text(
      `Novos: ${data.patients.retention.newPatients} | Ativos: ${data.patients.retention.activePatients}`,
      14,
      yPosition
    )
    yPosition += 6
    doc.text(`Taxa Retenção: ${data.patients.retention.retentionRate}%`, 14, yPosition)
    yPosition += 10

    // NPS
    doc.setFontSize(20)
    doc.setTextColor(15, 118, 110)
    doc.text(`NPS: ${data.patients.nps.score}`, 14, yPosition)
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`(${getNPSCategory(data.patients.nps.score)})`, 50, yPosition)
    yPosition += 15

    // Demographics table
    doc.setFontSize(11)
    doc.setTextColor(0)
    doc.text('Distribuição por Idade', 14, yPosition)
    yPosition += 5

    // @ts-expect-error - autoTable extends jsPDF
    doc.autoTable({
      startY: yPosition,
      head: [['Faixa', 'Qtd', '%']],
      body: data.patients.demographics.byAge.map(a => [
        a.range || 'N/A',
        a.count.toString(),
        `${a.percentage}%`,
      ]),
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 9 },
    })
  }

  // Return as blob
  return doc.output('blob')
}

// =============================================================================
// Main Export Function
// =============================================================================

export async function exportAnalytics(
  data: AnalyticsExportData,
  format: ExportFormat = 'xlsx'
): Promise<void> {
  let blob: Blob
  let filename: string
  const timestamp = new Date().toISOString().slice(0, 10)

  if (format === 'xlsx') {
    blob = await exportToExcel(data)
    filename = `analytics-clinica-genesis-${timestamp}.xlsx`
  } else {
    blob = await exportToPDF(data)
    filename = `analytics-clinica-genesis-${timestamp}.pdf`
  }

  // Trigger download
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export default exportAnalytics
