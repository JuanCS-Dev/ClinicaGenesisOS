/**
 * Export Service
 * ==============
 *
 * Provides PDF and Excel export functionality for financial and report data.
 * Uses jsPDF for PDF generation and xlsx for Excel export.
 *
 * PERFORMANCE: Libraries are loaded dynamically to avoid 909KB in initial bundle.
 *
 * Fase 4: Financeiro & Relatórios
 */

// Dynamic imports - loaded only when export is triggered
// This saves ~909KB from the initial bundle!
type XLSX = typeof import('xlsx');

let xlsxModule: XLSX | null = null;
let jsPDFModule: typeof import('jspdf') | null = null;
let autoTableModule: typeof import('jspdf-autotable') | null = null;

async function loadXLSX(): Promise<XLSX> {
  if (!xlsxModule) {
    xlsxModule = await import('xlsx');
  }
  return xlsxModule;
}

async function loadPDFLibs(): Promise<{
  jsPDF: typeof import('jspdf').default;
  autoTable: typeof import('jspdf-autotable').default;
}> {
  if (!jsPDFModule || !autoTableModule) {
    [jsPDFModule, autoTableModule] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable'),
    ]);
  }
  return {
    jsPDF: jsPDFModule.default,
    autoTable: autoTableModule.default,
  };
}

import {
  formatCurrency,
  DEFAULT_CATEGORIES,
  PAYMENT_METHOD_LABELS,
  TRANSACTION_STATUS_LABELS,
  type Transaction,
  type FinancialSummary,
} from '@/types';

/**
 * Format date for display in exports.
 */
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Get category name by ID.
 */
function getCategoryName(categoryId: string): string {
  const category = DEFAULT_CATEGORIES.find((c) => c.id === categoryId);
  return category?.name || categoryId;
}

/**
 * Export transactions to Excel.
 * Note: This function is async due to dynamic import of xlsx library.
 */
export async function exportTransactionsToExcel(
  transactions: Transaction[],
  filename: string = 'transacoes'
): Promise<void> {
  // Load XLSX dynamically (first call loads ~500KB, subsequent calls are cached)
  const XLSX = await loadXLSX();

  // Prepare data for Excel
  const data = transactions.map((t) => ({
    Data: formatDate(t.date),
    Descrição: t.description,
    Tipo: t.type === 'income' ? 'Receita' : 'Despesa',
    Categoria: getCategoryName(t.categoryId),
    'Forma de Pagamento': PAYMENT_METHOD_LABELS[t.paymentMethod],
    Status: TRANSACTION_STATUS_LABELS[t.status],
    Valor: formatCurrency(t.amount),
    Paciente: t.patientName || '-',
  }));

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);

  // Set column widths
  ws['!cols'] = [
    { wch: 12 }, // Data
    { wch: 40 }, // Descrição
    { wch: 10 }, // Tipo
    { wch: 20 }, // Categoria
    { wch: 18 }, // Forma de Pagamento
    { wch: 12 }, // Status
    { wch: 15 }, // Valor
    { wch: 25 }, // Paciente
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Transações');

  // Generate filename with date
  const dateStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `${filename}_${dateStr}.xlsx`);
}

/**
 * Export transactions to PDF.
 * Note: This function is async due to dynamic import of jspdf library.
 */
export async function exportTransactionsToPDF(
  transactions: Transaction[],
  summary: FinancialSummary | null,
  clinicName: string = 'Clínica Genesis',
  filename: string = 'relatorio-financeiro'
): Promise<void> {
  // Load PDF libs dynamically (first call loads ~400KB, subsequent calls are cached)
  const { jsPDF, autoTable } = await loadPDFLibs();
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.setTextColor(17, 24, 39); // genesis-dark
  doc.text(clinicName, 20, 20);

  doc.setFontSize(14);
  doc.setTextColor(107, 114, 128); // gray-500
  doc.text('Relatório Financeiro', 20, 30);

  doc.setFontSize(10);
  const dateRange = new Date().toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });
  doc.text(`Período: ${dateRange}`, 20, 38);
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 20, 44);

  // Summary section
  if (summary) {
    doc.setFontSize(12);
    doc.setTextColor(17, 24, 39);
    doc.text('Resumo Financeiro', 20, 58);

    doc.setFontSize(10);
    doc.setTextColor(34, 197, 94); // green
    doc.text(`Receitas: ${formatCurrency(summary.totalIncome)}`, 20, 68);

    doc.setTextColor(239, 68, 68); // red
    doc.text(`Despesas: ${formatCurrency(summary.totalExpenses)}`, 80, 68);

    doc.setTextColor(59, 130, 246); // blue
    doc.text(`Saldo: ${formatCurrency(summary.netBalance)}`, 140, 68);
  }

  // Transactions table
  const tableData = transactions.map((t) => [
    formatDate(t.date),
    t.description.substring(0, 30) + (t.description.length > 30 ? '...' : ''),
    t.type === 'income' ? 'Receita' : 'Despesa',
    getCategoryName(t.categoryId),
    TRANSACTION_STATUS_LABELS[t.status],
    formatCurrency(t.amount),
  ]);

  autoTable(doc, {
    startY: summary ? 78 : 55,
    head: [['Data', 'Descrição', 'Tipo', 'Categoria', 'Status', 'Valor']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [17, 24, 39], // genesis-dark
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251], // gray-50
    },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 50 },
      2: { cellWidth: 20 },
      3: { cellWidth: 35 },
      4: { cellWidth: 22 },
      5: { cellWidth: 28 },
    },
    margin: { left: 20, right: 20 },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175); // gray-400
    doc.text(
      `Página ${i} de ${pageCount} | ${clinicName}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  // Save
  const dateStr = new Date().toISOString().split('T')[0];
  doc.save(`${filename}_${dateStr}.pdf`);
}

/**
 * Export report data to PDF.
 * Note: This function is async due to dynamic import of jspdf library.
 */
export async function exportReportToPDF(
  data: {
    totalPatients: number;
    activePatients: number;
    appointmentsCount: number;
    completionRate: number;
    procedureStats: { name: string; value: number }[];
    demographics: {
      gender: { name: string; value: number }[];
      ageGroups: { name: string; value: number }[];
    } | null;
  },
  clinicName: string = 'Clínica Genesis',
  filename: string = 'relatorio-clinico'
): Promise<void> {
  // Load PDF libs dynamically
  const { jsPDF, autoTable } = await loadPDFLibs();
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.setTextColor(17, 24, 39);
  doc.text(clinicName, 20, 20);

  doc.setFontSize(14);
  doc.setTextColor(107, 114, 128);
  doc.text('Relatório Clínico', 20, 30);

  doc.setFontSize(10);
  const dateRange = new Date().toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });
  doc.text(`Período: ${dateRange}`, 20, 38);
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 20, 44);

  // KPIs
  doc.setFontSize(12);
  doc.setTextColor(17, 24, 39);
  doc.text('Indicadores Principais', 20, 58);

  doc.setFontSize(10);
  doc.setTextColor(59, 130, 246);
  doc.text(`Total de Pacientes: ${data.totalPatients}`, 20, 68);
  doc.text(`Pacientes Ativos: ${data.activePatients}`, 20, 76);
  doc.text(`Agendamentos: ${data.appointmentsCount}`, 100, 68);
  doc.text(`Taxa de Conclusão: ${data.completionRate}%`, 100, 76);

  // Procedures table
  if (data.procedureStats.length > 0) {
    doc.setFontSize(12);
    doc.setTextColor(17, 24, 39);
    doc.text('Procedimentos Mais Populares', 20, 92);

    autoTable(doc, {
      startY: 98,
      head: [['Procedimento', 'Quantidade']],
      body: data.procedureStats.map((p) => [p.name, p.value.toString()]),
      theme: 'striped',
      headStyles: {
        fillColor: [79, 70, 229], // indigo
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { cellWidth: 100 },
        1: { cellWidth: 40 },
      },
      margin: { left: 20, right: 20 },
    });
  }

  // Demographics
  if (data.demographics) {
    const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY || 120;

    doc.setFontSize(12);
    doc.setTextColor(17, 24, 39);
    doc.text('Perfil Demográfico', 20, finalY + 15);

    if (data.demographics.gender.length > 0) {
      doc.setFontSize(10);
      doc.text('Gênero:', 20, finalY + 25);
      data.demographics.gender.forEach((g, i) => {
        doc.text(`${g.name}: ${g.value}%`, 50 + i * 50, finalY + 25);
      });
    }

    if (data.demographics.ageGroups.length > 0) {
      doc.text('Faixas Etárias:', 20, finalY + 35);
      data.demographics.ageGroups.forEach((a, i) => {
        doc.text(`${a.name}: ${a.value}%`, 20 + i * 30, finalY + 45);
      });
    }
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text(
      `Página ${i} de ${pageCount} | ${clinicName}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  // Save
  const dateStr = new Date().toISOString().split('T')[0];
  doc.save(`${filename}_${dateStr}.pdf`);
}

export default {
  exportTransactionsToExcel,
  exportTransactionsToPDF,
  exportReportToPDF,
};
