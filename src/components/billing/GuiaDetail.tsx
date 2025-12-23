/**
 * GuiaDetail Component
 *
 * Modal to display full details of a TISS guide including:
 * - Status and timeline
 * - Patient and operator information
 * - Procedure details
 * - Values and glosas
 * - Action buttons (send, cancel, recurse)
 */

import React, { useMemo } from 'react';
import {
  X,
  FileText,
  User,
  Building2,
  Calendar,
  DollarSign,
  Clock,
  Send,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileDown,
  RefreshCw,
  Stethoscope,
  BadgeInfo,
  Receipt,
  TrendingDown,
  Undo2,
} from 'lucide-react';
import type { GuiaFirestore, StatusGuia, TipoGuia, Glosa } from '@/types';

// =============================================================================
// TYPES
// =============================================================================

interface GuiaDetailProps {
  /** The guia to display */
  guia: GuiaFirestore;
  /** Callback to close the modal */
  onClose: () => void;
  /** Callback to send the guia */
  onSend?: (guiaId: string) => Promise<void>;
  /** Callback to cancel the guia */
  onCancel?: (guiaId: string) => Promise<void>;
  /** Callback to start a recurso de glosa */
  onRecurso?: (guiaId: string) => void;
  /** Callback to download XML */
  onDownloadXml?: (guiaId: string) => void;
  /** Loading state for actions */
  isLoading?: boolean;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const STATUS_CONFIG: Record<
  StatusGuia,
  { label: string; color: string; bgColor: string; icon: React.ElementType }
> = {
  rascunho: {
    label: 'Rascunho',
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
    icon: FileText,
  },
  enviada: {
    label: 'Enviada',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    icon: Send,
  },
  em_analise: {
    label: 'Em Análise',
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    icon: Clock,
  },
  autorizada: {
    label: 'Autorizada',
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
    icon: CheckCircle2,
  },
  glosada_parcial: {
    label: 'Glosa Parcial',
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    icon: AlertTriangle,
  },
  glosada_total: {
    label: 'Glosa Total',
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    icon: XCircle,
  },
  paga: {
    label: 'Paga',
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    icon: DollarSign,
  },
  recurso: {
    label: 'Em Recurso',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    icon: RefreshCw,
  },
};

const TIPO_GUIA_LABELS: Record<TipoGuia, string> = {
  consulta: 'Consulta',
  sadt: 'SP/SADT',
  internacao: 'Internação',
  honorarios: 'Honorários',
  anexo: 'Anexo',
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Format date for display
 */
function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

/**
 * Format datetime for display
 */
function formatDateTime(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

/**
 * Format currency for display
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

// =============================================================================
// COMPONENT
// =============================================================================

export function GuiaDetail({
  guia,
  onClose,
  onSend,
  onCancel,
  onRecurso,
  onDownloadXml,
  isLoading = false,
}: GuiaDetailProps) {
  const statusConfig = STATUS_CONFIG[guia.status];
  const StatusIcon = statusConfig.icon;

  // Calculate valores
  const valorGlosado = guia.valorGlosado ?? 0;
  const valorPago = guia.valorPago ?? 0;
  const valorPendente = guia.valorTotal - valorGlosado - valorPago;

  // Check if guia has procedures (SADT)
  const isSADT = guia.tipo === 'sadt';
  const procedimentos = useMemo(() => {
    if (isSADT && 'procedimentosRealizados' in guia.dadosGuia) {
      return guia.dadosGuia.procedimentosRealizados;
    }
    return [];
  }, [guia.dadosGuia, isSADT]);

  // Can perform actions based on status
  const canSend = guia.status === 'rascunho';
  const canCancel = guia.status === 'rascunho' || guia.status === 'enviada';
  const canRecurso =
    guia.status === 'glosada_parcial' || guia.status === 'glosada_total';
  const hasGlosas = guia.glosas && guia.glosas.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-genesis-surface rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-genesis-border">
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-xl ${statusConfig.bgColor} flex items-center justify-center`}
            >
              <StatusIcon className={`w-6 h-6 ${statusConfig.color}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold text-genesis-dark">
                  Guia {guia.numeroGuiaPrestador}
                </h2>
                <span
                  className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusConfig.bgColor} ${statusConfig.color}`}
                >
                  {statusConfig.label}
                </span>
              </div>
              <p className="text-sm text-genesis-muted flex items-center gap-2">
                <span>{TIPO_GUIA_LABELS[guia.tipo]}</span>
                <span>•</span>
                <span>{guia.nomeOperadora}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-genesis-hover rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-genesis-muted" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Valor Summary */}
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 bg-genesis-soft rounded-xl">
              <div className="flex items-center gap-2 text-genesis-muted mb-1">
                <Receipt className="w-4 h-4" />
                <span className="text-xs font-medium">Valor Total</span>
              </div>
              <p className="text-xl font-bold text-genesis-dark">
                {formatCurrency(guia.valorTotal)}
              </p>
            </div>

            <div className="p-4 bg-genesis-soft rounded-xl">
              <div className="flex items-center gap-2 text-genesis-muted mb-1">
                <TrendingDown className="w-4 h-4" />
                <span className="text-xs font-medium">Glosado</span>
              </div>
              <p
                className={`text-xl font-bold ${
                  valorGlosado > 0
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-genesis-dark'
                }`}
              >
                {formatCurrency(valorGlosado)}
              </p>
            </div>

            <div className="p-4 bg-genesis-soft rounded-xl">
              <div className="flex items-center gap-2 text-genesis-muted mb-1">
                <DollarSign className="w-4 h-4" />
                <span className="text-xs font-medium">Pago</span>
              </div>
              <p
                className={`text-xl font-bold ${
                  valorPago > 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-genesis-dark'
                }`}
              >
                {formatCurrency(valorPago)}
              </p>
            </div>

            <div className="p-4 bg-genesis-soft rounded-xl">
              <div className="flex items-center gap-2 text-genesis-muted mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-medium">Pendente</span>
              </div>
              <p
                className={`text-xl font-bold ${
                  valorPendente > 0
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-genesis-dark'
                }`}
              >
                {formatCurrency(valorPendente > 0 ? valorPendente : 0)}
              </p>
            </div>
          </div>

          {/* Patient Info */}
          <div className="bg-genesis-soft rounded-xl p-4">
            <div className="flex items-center gap-2 text-genesis-text mb-3">
              <User className="w-4 h-4" />
              <span className="font-medium">Beneficiário</span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-genesis-muted">Nome:</span>
                <p className="text-genesis-dark font-medium">
                  {guia.dadosGuia.dadosBeneficiario.nomeBeneficiario}
                </p>
              </div>
              <div>
                <span className="text-genesis-muted">Carteira:</span>
                <p className="text-genesis-dark font-mono">
                  {guia.dadosGuia.dadosBeneficiario.numeroCarteira}
                </p>
              </div>
              {guia.dadosGuia.dadosBeneficiario.validadeCarteira && (
                <div>
                  <span className="text-genesis-muted">Validade:</span>
                  <p className="text-genesis-dark">
                    {formatDate(guia.dadosGuia.dadosBeneficiario.validadeCarteira)}
                  </p>
                </div>
              )}
              {guia.dadosGuia.dadosBeneficiario.dataNascimento && (
                <div>
                  <span className="text-genesis-muted">Nascimento:</span>
                  <p className="text-genesis-dark">
                    {formatDate(guia.dadosGuia.dadosBeneficiario.dataNascimento)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Operator Info */}
          <div className="bg-genesis-soft rounded-xl p-4">
            <div className="flex items-center gap-2 text-genesis-text mb-3">
              <Building2 className="w-4 h-4" />
              <span className="font-medium">Operadora</span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-genesis-muted">Nome:</span>
                <p className="text-genesis-dark font-medium">{guia.nomeOperadora}</p>
              </div>
              <div>
                <span className="text-genesis-muted">Registro ANS:</span>
                <p className="text-genesis-dark font-mono">{guia.registroANS}</p>
              </div>
              {guia.numeroGuiaOperadora && (
                <div>
                  <span className="text-genesis-muted">Nº Guia Operadora:</span>
                  <p className="text-genesis-dark font-mono">
                    {guia.numeroGuiaOperadora}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Procedure Details */}
          <div className="bg-genesis-soft rounded-xl p-4">
            <div className="flex items-center gap-2 text-genesis-text mb-3">
              <Stethoscope className="w-4 h-4" />
              <span className="font-medium">
                {isSADT ? 'Procedimentos Realizados' : 'Procedimento'}
              </span>
            </div>

            {isSADT && procedimentos.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-genesis-border">
                      <th className="text-left py-2 text-genesis-muted font-medium">
                        Código
                      </th>
                      <th className="text-left py-2 text-genesis-muted font-medium">
                        Descrição
                      </th>
                      <th className="text-center py-2 text-genesis-muted font-medium">
                        Qtd
                      </th>
                      <th className="text-right py-2 text-genesis-muted font-medium">
                        Valor
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {procedimentos.map((proc, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-genesis-border-subtle last:border-0"
                      >
                        <td className="py-2 font-mono text-genesis-dark">
                          {proc.codigoProcedimento}
                        </td>
                        <td className="py-2 text-genesis-dark">
                          {proc.descricaoProcedimento}
                        </td>
                        <td className="py-2 text-center text-genesis-dark">
                          {proc.quantidadeRealizada}
                        </td>
                        <td className="py-2 text-right text-genesis-dark">
                          {formatCurrency(proc.valorTotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-genesis-muted">Código:</span>
                  <p className="text-genesis-dark font-mono">
                    {'codigoProcedimento' in guia.dadosGuia
                      ? guia.dadosGuia.codigoProcedimento
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-genesis-muted">Data:</span>
                  <p className="text-genesis-dark">
                    {formatDate(guia.dataAtendimento)}
                  </p>
                </div>
                <div>
                  <span className="text-genesis-muted">Valor:</span>
                  <p className="text-genesis-dark font-medium">
                    {formatCurrency(guia.valorTotal)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Glosas */}
          {hasGlosas && (
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-300 mb-3">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-medium">Glosas ({guia.glosas!.length})</span>
              </div>

              <div className="space-y-4">
                {guia.glosas!.map((glosa: Glosa, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 bg-genesis-surface rounded-lg border border-red-200 dark:border-red-800"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-genesis-muted">
                        Guia: {glosa.numeroGuiaPrestador}
                      </span>
                      <span className="font-medium text-red-700 dark:text-red-300">
                        {formatCurrency(glosa.valorGlosado)}
                      </span>
                    </div>
                    {glosa.itensGlosados.map((item, itemIdx) => (
                      <div key={itemIdx} className="mt-2 pt-2 border-t border-red-100 dark:border-red-800">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs text-red-600 dark:text-red-400">
                            {item.codigoGlosa}
                          </span>
                          <span className="text-sm text-genesis-dark">
                            {formatCurrency(item.valorGlosado)}
                          </span>
                        </div>
                        <p className="text-sm text-genesis-dark mt-1">
                          {item.descricaoGlosa}
                        </p>
                      </div>
                    ))}
                    {glosa.observacaoOperadora && (
                      <p className="text-xs text-genesis-muted mt-2 pt-2 border-t border-genesis-border-subtle">
                        {glosa.observacaoOperadora}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="bg-genesis-soft rounded-xl p-4">
            <div className="flex items-center gap-2 text-genesis-text mb-3">
              <BadgeInfo className="w-4 h-4" />
              <span className="font-medium">Informações do Sistema</span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-genesis-muted">Criada em:</span>
                <p className="text-genesis-dark">{formatDateTime(guia.createdAt)}</p>
              </div>
              <div>
                <span className="text-genesis-muted">Atualizada em:</span>
                <p className="text-genesis-dark">{formatDateTime(guia.updatedAt)}</p>
              </div>
              <div>
                <span className="text-genesis-muted">ID da Guia:</span>
                <p className="text-genesis-dark font-mono text-xs">{guia.id}</p>
              </div>
              <div>
                <span className="text-genesis-muted">ID do Paciente:</span>
                <p className="text-genesis-dark font-mono text-xs">{guia.patientId}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-6 border-t border-genesis-border bg-genesis-soft">
          <div className="flex items-center gap-2">
            {onDownloadXml && guia.xmlContent && (
              <button
                onClick={() => onDownloadXml(guia.id)}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 text-genesis-text bg-genesis-surface border border-genesis-border rounded-lg hover:bg-genesis-hover transition-colors disabled:opacity-50"
              >
                <FileDown className="w-4 h-4" />
                Baixar XML
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {canCancel && onCancel && (
              <button
                onClick={() => onCancel(guia.id)}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                Cancelar
              </button>
            )}

            {canRecurso && onRecurso && (
              <button
                onClick={() => onRecurso(guia.id)}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors disabled:opacity-50"
              >
                <Undo2 className="w-4 h-4" />
                Recurso de Glosa
              </button>
            )}

            {canSend && onSend && (
              <button
                onClick={() => onSend(guia.id)}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-genesis-primary text-white rounded-lg hover:bg-genesis-primary/90 transition-all hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 disabled:hover:translate-y-0"
              >
                <Send className="w-4 h-4" />
                Enviar Guia
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
