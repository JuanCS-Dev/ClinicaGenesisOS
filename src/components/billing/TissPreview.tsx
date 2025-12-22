/**
 * TissPreview Component
 *
 * Displays a preview of the generated TISS XML with syntax highlighting
 * and options to copy or download.
 */

import { useState, useCallback } from 'react';
import {
  FileText,
  Download,
  Copy,
  Check,
  Eye,
  Code,
  AlertCircle,
  CheckCircle,
  X,
} from 'lucide-react';
import type { GuiaFirestore, TissValidationResult } from '@/types';

// =============================================================================
// TYPES
// =============================================================================

interface TissPreviewProps {
  /** The guia data to preview */
  guia: GuiaFirestore;
  /** XML content to display */
  xmlContent: string;
  /** Validation result */
  validation?: TissValidationResult;
  /** Close handler */
  onClose: () => void;
  /** Send to operator handler */
  onSend?: () => Promise<void>;
  /** Whether sending is in progress */
  isSending?: boolean;
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Simple XML syntax highlighting.
 */
function highlightXml(xml: string): string {
  return xml
    // Tags
    .replace(/(&lt;[/?]?\w+)/g, '<span class="text-blue-600">$1</span>')
    .replace(/(&gt;)/g, '<span class="text-blue-600">$1</span>')
    // Attributes
    .replace(/(\s\w+)(=)/g, '<span class="text-purple-600">$1</span>$2')
    // Attribute values
    .replace(/(=)(&quot;[^&]*&quot;)/g, '$1<span class="text-green-600">$2</span>')
    // Comments
    .replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="text-genesis-subtle italic">$1</span>');
}

/**
 * Escape HTML for safe rendering.
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// =============================================================================
// COMPONENT
// =============================================================================

export function TissPreview({
  guia,
  xmlContent,
  validation,
  onClose,
  onSend,
  isSending = false,
}: TissPreviewProps) {
  const [viewMode, setViewMode] = useState<'preview' | 'xml'>('preview');
  const [copied, setCopied] = useState(false);

  // Copy XML to clipboard
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(xmlContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }, [xmlContent]);

  // Download XML file
  const handleDownload = useCallback(() => {
    const blob = new Blob([xmlContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `guia_${guia.tipo}_${guia.numeroGuiaPrestador}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [xmlContent, guia]);

  // Format date for display
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Status badge
  const getStatusBadge = () => {
    const statusColors: Record<string, string> = {
      rascunho: 'bg-genesis-hover text-genesis-text',
      enviada: 'bg-blue-100 text-blue-700',
      em_analise: 'bg-yellow-100 text-yellow-700',
      autorizada: 'bg-green-100 text-green-700',
      glosada_parcial: 'bg-orange-100 text-orange-700',
      glosada_total: 'bg-red-100 text-red-700',
      paga: 'bg-emerald-100 text-emerald-700',
      recurso: 'bg-purple-100 text-purple-700',
    };

    const statusLabels: Record<string, string> = {
      rascunho: 'Rascunho',
      enviada: 'Enviada',
      em_analise: 'Em Análise',
      autorizada: 'Autorizada',
      glosada_parcial: 'Glosada Parcial',
      glosada_total: 'Glosada Total',
      paga: 'Paga',
      recurso: 'Em Recurso',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[guia.status] || 'bg-genesis-hover'}`}>
        {statusLabels[guia.status] || guia.status}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-genesis-surface rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-genesis-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-genesis-dark">
                Guia {guia.tipo.toUpperCase()} - {guia.numeroGuiaPrestador}
              </h2>
              <p className="text-sm text-genesis-muted">
                {guia.nomeOperadora} • {formatDate(guia.dataAtendimento)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {getStatusBadge()}
            <button
              onClick={onClose}
              className="p-2 text-genesis-subtle hover:text-genesis-medium hover:bg-genesis-hover rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 p-4 border-b border-genesis-border">
          <button
            onClick={() => setViewMode('preview')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'preview'
                ? 'bg-blue-100 text-blue-700'
                : 'text-genesis-medium hover:bg-genesis-hover'
            }`}
          >
            <Eye className="w-4 h-4" />
            Resumo
          </button>
          <button
            onClick={() => setViewMode('xml')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'xml'
                ? 'bg-blue-100 text-blue-700'
                : 'text-genesis-medium hover:bg-genesis-hover'
            }`}
          >
            <Code className="w-4 h-4" />
            XML
          </button>

          <div className="flex-1" />

          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-1.5 text-genesis-medium hover:bg-genesis-hover rounded-lg text-sm transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-500" />
                Copiado
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copiar
              </>
            )}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-3 py-1.5 text-genesis-medium hover:bg-genesis-hover rounded-lg text-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>

        {/* Validation Warning */}
        {validation && !validation.valid && (
          <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-red-700">Erros de validação</p>
                <ul className="text-sm text-red-600 mt-1 list-disc list-inside">
                  {validation.errors.map((error, i) => (
                    <li key={i}>{error.message}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {viewMode === 'preview' ? (
            <div className="space-y-4">
              {/* Summary Card */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-genesis-soft rounded-xl p-4">
                  <p className="text-sm text-genesis-muted">Valor Total</p>
                  <p className="text-2xl font-bold text-genesis-dark">
                    {formatCurrency(guia.valorTotal)}
                  </p>
                </div>
                {guia.valorGlosado !== undefined && guia.valorGlosado > 0 && (
                  <div className="bg-red-50 rounded-xl p-4">
                    <p className="text-sm text-red-600">Valor Glosado</p>
                    <p className="text-2xl font-bold text-red-700">
                      {formatCurrency(guia.valorGlosado)}
                    </p>
                  </div>
                )}
                {guia.valorPago !== undefined && guia.valorPago > 0 && (
                  <div className="bg-green-50 rounded-xl p-4">
                    <p className="text-sm text-green-600">Valor Pago</p>
                    <p className="text-2xl font-bold text-green-700">
                      {formatCurrency(guia.valorPago)}
                    </p>
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="bg-genesis-soft rounded-xl p-4 space-y-3">
                <h3 className="font-medium text-genesis-dark">Detalhes da Guia</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-genesis-muted">Número do Prestador</p>
                    <p className="font-mono">{guia.numeroGuiaPrestador}</p>
                  </div>
                  {guia.numeroGuiaOperadora && (
                    <div>
                      <p className="text-genesis-muted">Número da Operadora</p>
                      <p className="font-mono">{guia.numeroGuiaOperadora}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-genesis-muted">Registro ANS</p>
                    <p className="font-mono">{guia.registroANS}</p>
                  </div>
                  <div>
                    <p className="text-genesis-muted">Operadora</p>
                    <p>{guia.nomeOperadora}</p>
                  </div>
                  <div>
                    <p className="text-genesis-muted">Data do Atendimento</p>
                    <p>{formatDate(guia.dataAtendimento)}</p>
                  </div>
                  <div>
                    <p className="text-genesis-muted">Criado em</p>
                    <p>{formatDate(guia.createdAt)}</p>
                  </div>
                </div>
              </div>

              {/* Validation Success */}
              {validation && validation.valid && (
                <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg">
                  <CheckCircle className="w-5 h-5" />
                  <span>XML válido conforme padrão TISS 4.02.00</span>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-900 rounded-xl p-4 overflow-auto">
              <pre
                className="text-sm font-mono text-gray-100 whitespace-pre-wrap"
                dangerouslySetInnerHTML={{
                  __html: highlightXml(escapeHtml(xmlContent)),
                }}
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-4 border-t border-genesis-border">
          <p className="text-sm text-genesis-muted">
            Gerado em {new Date().toLocaleString('pt-BR')}
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-genesis-text bg-genesis-surface border border-genesis-border rounded-lg hover:bg-genesis-soft transition-colors"
            >
              Fechar
            </button>
            {onSend && guia.status === 'rascunho' && (
              <button
                onClick={onSend}
                disabled={isSending || (validation && !validation.valid)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? 'Enviando...' : 'Enviar para Operadora'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
