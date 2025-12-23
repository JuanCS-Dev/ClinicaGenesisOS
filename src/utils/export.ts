/**
 * Export Utilities
 *
 * Functions for exporting data to CSV and PDF formats.
 *
 * @module utils/export
 */

// =============================================================================
// TYPES
// =============================================================================

export interface ExportColumn<T> {
  key: keyof T | string;
  label: string;
  format?: (value: unknown, row: T) => string;
}

export interface ExportOptions {
  filename: string;
  title?: string;
  subtitle?: string;
  dateGenerated?: boolean;
}

// =============================================================================
// CSV EXPORT
// =============================================================================

/**
 * Generate CSV content from data.
 */
export function generateCSV<T extends Record<string, unknown>>(
  data: T[],
  columns: ExportColumn<T>[]
): string {
  // Header row
  const header = columns.map((col) => `"${col.label}"`).join(',');

  // Data rows
  const rows = data.map((row) => {
    return columns
      .map((col) => {
        const keyStr = String(col.key);
        const value = keyStr.includes('.')
          ? getNestedValue(row, keyStr)
          : row[col.key as keyof T];

        const formatted = col.format ? col.format(value, row) : String(value ?? '');
        // Escape quotes and wrap in quotes
        return `"${formatted.replace(/"/g, '""')}"`;
      })
      .join(',');
  });

  return [header, ...rows].join('\n');
}

/**
 * Download CSV file.
 */
export function downloadCSV<T extends Record<string, unknown>>(
  data: T[],
  columns: ExportColumn<T>[],
  options: ExportOptions
): void {
  const csv = generateCSV(data, columns);
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${options.filename}.csv`);
}

// =============================================================================
// PDF EXPORT (Simple HTML-based)
// =============================================================================

/**
 * Generate printable HTML for PDF export.
 */
export function generatePrintHTML<T extends Record<string, unknown>>(
  data: T[],
  columns: ExportColumn<T>[],
  options: ExportOptions
): string {
  const dateStr = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const headerRow = columns.map((col) => `<th>${col.label}</th>`).join('');

  const dataRows = data
    .map((row) => {
      const cells = columns
        .map((col) => {
          const keyStr = String(col.key);
          const value = keyStr.includes('.')
            ? getNestedValue(row, keyStr)
            : row[col.key as keyof T];

          const formatted = col.format ? col.format(value, row) : String(value ?? '');
          return `<td>${escapeHtml(formatted)}</td>`;
        })
        .join('');
      return `<tr>${cells}</tr>`;
    })
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${options.title || options.filename}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          padding: 20px;
          color: #1a1a1a;
        }
        .header {
          margin-bottom: 20px;
          border-bottom: 2px solid #0d9488;
          padding-bottom: 10px;
        }
        .header h1 {
          margin: 0 0 5px 0;
          color: #0d9488;
          font-size: 24px;
        }
        .header p {
          margin: 0;
          color: #666;
          font-size: 14px;
        }
        .meta {
          color: #999;
          font-size: 12px;
          margin-bottom: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }
        th {
          background: #f5f5f5;
          border: 1px solid #ddd;
          padding: 10px 8px;
          text-align: left;
          font-weight: 600;
        }
        td {
          border: 1px solid #ddd;
          padding: 8px;
        }
        tr:nth-child(even) {
          background: #fafafa;
        }
        .footer {
          margin-top: 20px;
          text-align: center;
          color: #999;
          font-size: 11px;
        }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${options.title || 'Relatório'}</h1>
        ${options.subtitle ? `<p>${options.subtitle}</p>` : ''}
      </div>
      ${options.dateGenerated !== false ? `<div class="meta">Gerado em: ${dateStr}</div>` : ''}
      <table>
        <thead><tr>${headerRow}</tr></thead>
        <tbody>${dataRows}</tbody>
      </table>
      <div class="footer">
        Genesis OS - Relatório de Faturamento
      </div>
    </body>
    </html>
  `;
}

/**
 * Export to PDF via print dialog.
 */
export function exportToPDF<T extends Record<string, unknown>>(
  data: T[],
  columns: ExportColumn<T>[],
  options: ExportOptions
): void {
  const html = generatePrintHTML(data, columns, options);
  const printWindow = window.open('', '_blank');

  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();

    // Trigger print after content loads
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }
}

// =============================================================================
// EXCEL EXPORT (Simple XLSX via CSV)
// =============================================================================

/**
 * Download as Excel-compatible CSV with proper encoding.
 */
export function downloadExcel<T extends Record<string, unknown>>(
  data: T[],
  columns: ExportColumn<T>[],
  options: ExportOptions
): void {
  const csv = generateCSV(data, columns);
  // BOM for Excel UTF-8 compatibility
  const blob = new Blob(['\ufeff' + csv], {
    type: 'application/vnd.ms-excel;charset=utf-8;',
  });
  downloadBlob(blob, `${options.filename}.xls`);
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Get nested value from object using dot notation.
 */
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((current, key) => {
    return current && typeof current === 'object' ? (current as Record<string, unknown>)[key] : undefined;
  }, obj as unknown);
}

/**
 * Escape HTML special characters.
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Download blob as file.
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// =============================================================================
// BILLING-SPECIFIC EXPORTS
// =============================================================================

import type { GuiaFirestore } from '@/types';

/**
 * Export guias to CSV.
 */
export function exportGuiasToCSV(guias: GuiaFirestore[], filename: string): void {
  const columns: ExportColumn<GuiaFirestore>[] = [
    { key: 'numeroGuiaPrestador', label: 'Número Guia' },
    { key: 'tipoGuia', label: 'Tipo' },
    { key: 'nomeOperadora', label: 'Operadora' },
    { key: 'registroANS', label: 'ANS' },
    {
      key: 'dadosGuia.dadosBeneficiario.nomeBeneficiario',
      label: 'Paciente',
      format: (_, row) => row.dadosGuia?.dadosBeneficiario?.nomeBeneficiario || '',
    },
    { key: 'dataAtendimento', label: 'Data Atendimento' },
    {
      key: 'valorTotal',
      label: 'Valor Total',
      format: (v) => formatCurrencyPlain(v as number),
    },
    {
      key: 'valorPago',
      label: 'Valor Pago',
      format: (v) => formatCurrencyPlain((v as number) || 0),
    },
    {
      key: 'valorGlosado',
      label: 'Valor Glosado',
      format: (v) => formatCurrencyPlain((v as number) || 0),
    },
    { key: 'status', label: 'Status' },
    { key: 'createdAt', label: 'Criado Em' },
  ];

  downloadCSV(guias as unknown as Record<string, unknown>[], columns as unknown as ExportColumn<Record<string, unknown>>[], { filename });
}

/**
 * Export guias to PDF.
 */
export function exportGuiasToPDF(guias: GuiaFirestore[], options: { title: string }): void {
  const columns: ExportColumn<GuiaFirestore>[] = [
    { key: 'numeroGuiaPrestador', label: 'Guia' },
    { key: 'nomeOperadora', label: 'Operadora' },
    {
      key: 'dadosGuia.dadosBeneficiario.nomeBeneficiario',
      label: 'Paciente',
      format: (_, row) => row.dadosGuia?.dadosBeneficiario?.nomeBeneficiario || '',
    },
    { key: 'dataAtendimento', label: 'Data' },
    {
      key: 'valorTotal',
      label: 'Valor',
      format: (v) => formatCurrencyPlain(v as number),
    },
    { key: 'status', label: 'Status' },
  ];

  exportToPDF(guias as unknown as Record<string, unknown>[], columns as unknown as ExportColumn<Record<string, unknown>>[], {
    filename: 'guias',
    title: options.title,
    subtitle: `Total: ${guias.length} guias`,
  });
}

/**
 * Format currency without symbol for export.
 */
function formatCurrencyPlain(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
