/**
 * LoteCard Component
 *
 * Displays a single batch (lote) card with expandable details.
 */

import React, { useState, useMemo } from 'react';
import {
  Package,
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Building2,
  ChevronDown,
  ChevronUp,
  Loader2,
  Download,
  Trash2,
  X,
  Check,
  Eye,
} from 'lucide-react';
import type { LoteGuias, GuiaFirestore, StatusLote } from '@/types';

// =============================================================================
// TYPES
// =============================================================================

export interface LoteCardProps {
  lote: LoteGuias;
  guias: GuiaFirestore[];
  onSend: () => Promise<void>;
  onDelete: () => Promise<void>;
  onDownloadXml?: () => void;
  onViewGuia?: (guiaId: string) => void;
  isLoading?: boolean;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const STATUS_CONFIG: Record<
  StatusLote,
  { label: string; color: string; bgColor: string; icon: React.ElementType }
> = {
  rascunho: {
    label: 'Rascunho',
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
    icon: FileText,
  },
  validando: {
    label: 'Validando',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    icon: Clock,
  },
  pronto: {
    label: 'Pronto',
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
    icon: CheckCircle2,
  },
  enviando: {
    label: 'Enviando',
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    icon: Loader2,
  },
  enviado: {
    label: 'Enviado',
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    icon: Send,
  },
  erro: {
    label: 'Erro',
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    icon: AlertCircle,
  },
  processado: {
    label: 'Processado',
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
    icon: CheckCircle2,
  },
};

// =============================================================================
// HELPERS
// =============================================================================

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

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

// =============================================================================
// COMPONENT
// =============================================================================

export const LoteCard: React.FC<LoteCardProps> = ({
  lote,
  guias,
  onSend,
  onDelete,
  onDownloadXml,
  onViewGuia,
  isLoading,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const statusConfig = STATUS_CONFIG[lote.status];
  const StatusIcon = statusConfig.icon;

  const canSend = lote.status === 'pronto' || lote.status === 'rascunho';
  const canDelete = lote.status === 'rascunho' || lote.status === 'erro';

  const loteGuias = useMemo(() => {
    return guias.filter((g) => lote.guiaIds.includes(g.id));
  }, [guias, lote.guiaIds]);

  return (
    <div className="bg-genesis-surface rounded-xl border border-genesis-border-subtle overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-genesis-soft transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-10 h-10 rounded-lg ${statusConfig.bgColor} flex items-center justify-center`}
          >
            <StatusIcon
              className={`w-5 h-5 ${statusConfig.color} ${
                lote.status === 'enviando' ? 'animate-spin' : ''
              }`}
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-genesis-dark">
                Lote {lote.numeroLote}
              </span>
              <span
                className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusConfig.bgColor} ${statusConfig.color}`}
              >
                {statusConfig.label}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm text-genesis-muted mt-0.5">
              <span className="flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                {lote.nomeOperadora}
              </span>
              <span>•</span>
              <span>{lote.quantidadeGuias} guia{lote.quantidadeGuias !== 1 ? 's' : ''}</span>
              <span>•</span>
              <span className="font-medium text-genesis-dark">
                {formatCurrency(lote.valorTotal)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canSend && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSend();
              }}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-genesis-primary text-white rounded-lg text-sm font-medium hover:bg-genesis-primary/90 transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              Enviar
            </button>
          )}

          {onDownloadXml && lote.xmlContent && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDownloadXml();
              }}
              className="p-2 text-genesis-muted hover:text-genesis-dark hover:bg-genesis-hover rounded-lg transition-colors"
              title="Baixar XML"
            >
              <Download className="w-4 h-4" />
            </button>
          )}

          {canDelete && (
            confirmDelete ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  disabled={isLoading}
                  className="p-2 bg-danger text-white rounded-lg hover:bg-danger/90 transition-colors disabled:opacity-50"
                  title="Confirmar"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmDelete(false);
                  }}
                  className="p-2 text-genesis-muted hover:bg-genesis-hover rounded-lg transition-colors"
                  title="Cancelar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmDelete(true);
                }}
                className="p-2 text-genesis-muted hover:text-danger hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Excluir"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )
          )}

          <button className="p-2 text-genesis-muted">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-genesis-border-subtle">
          <div className="p-4 bg-genesis-soft/50 grid grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-genesis-muted">Data Geração</span>
              <p className="font-medium text-genesis-dark">{formatDate(lote.dataGeracao)}</p>
            </div>
            <div>
              <span className="text-genesis-muted">Registro ANS</span>
              <p className="font-mono text-genesis-dark">{lote.registroANS}</p>
            </div>
            {lote.dataEnvio && (
              <div>
                <span className="text-genesis-muted">Data Envio</span>
                <p className="font-medium text-genesis-dark">{formatDate(lote.dataEnvio)}</p>
              </div>
            )}
            {lote.protocoloOperadora && (
              <div>
                <span className="text-genesis-muted">Protocolo</span>
                <p className="font-mono text-genesis-dark">{lote.protocoloOperadora}</p>
              </div>
            )}
          </div>

          {lote.erros && lote.erros.length > 0 && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border-t border-red-100 dark:border-red-800">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-300 mb-2">
                <AlertCircle className="w-4 h-4" />
                <span className="font-medium">Erros ({lote.erros.length})</span>
              </div>
              <ul className="space-y-1 text-sm text-red-600 dark:text-red-400">
                {lote.erros.map((erro, idx) => (
                  <li key={idx}>• {erro.mensagem}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="p-4 border-t border-genesis-border-subtle">
            <h4 className="text-sm font-medium text-genesis-text mb-3">Guias no Lote</h4>
            <div className="space-y-2">
              {loteGuias.map((guia) => (
                <div
                  key={guia.id}
                  className="flex items-center justify-between p-3 bg-genesis-soft rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-genesis-muted" />
                    <div>
                      <span className="font-medium text-genesis-dark">
                        {guia.numeroGuiaPrestador}
                      </span>
                      <span className="text-genesis-muted text-sm ml-2">
                        {guia.dadosGuia.dadosBeneficiario.nomeBeneficiario}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-genesis-dark font-medium">
                      {formatCurrency(guia.valorTotal)}
                    </span>
                    {onViewGuia && (
                      <button
                        onClick={() => onViewGuia(guia.id)}
                        className="p-1.5 text-genesis-muted hover:text-genesis-dark hover:bg-genesis-hover rounded-lg transition-colors"
                        title="Ver detalhes"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
