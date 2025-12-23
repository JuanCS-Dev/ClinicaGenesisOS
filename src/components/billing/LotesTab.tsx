/**
 * LotesTab Component
 *
 * Tab for managing TISS guide batches (lotes) for submission to operators.
 * Allows grouping pending guides into batches and tracking submission status.
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  Package,
  Plus,
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Building2,
  Calendar,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Loader2,
  Download,
  Trash2,
  X,
  Check,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import { EmptyState } from '@/components/ui/EmptyState';
import type { LoteGuias, GuiaFirestore, StatusLote } from '@/types';

// =============================================================================
// TYPES
// =============================================================================

interface LotesTabProps {
  /** List of lotes */
  lotes: LoteGuias[];
  /** List of guias (for selecting into lotes) */
  guias: GuiaFirestore[];
  /** Loading state */
  loading?: boolean;
  /** Callback to create a new lote */
  onCreateLote: (operadoraRegistroANS: string, guiaIds: string[]) => Promise<void>;
  /** Callback to send a lote */
  onSendLote: (loteId: string) => Promise<void>;
  /** Callback to delete a lote */
  onDeleteLote: (loteId: string) => Promise<void>;
  /** Callback to download lote XML */
  onDownloadXml?: (loteId: string) => void;
  /** Callback to view a guia */
  onViewGuia?: (guiaId: string) => void;
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
// HELPER FUNCTIONS
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
// SUB-COMPONENTS
// =============================================================================

interface LoteCardProps {
  lote: LoteGuias;
  guias: GuiaFirestore[];
  onSend: () => Promise<void>;
  onDelete: () => Promise<void>;
  onDownloadXml?: () => void;
  onViewGuia?: (guiaId: string) => void;
  isLoading?: boolean;
}

const LoteCard: React.FC<LoteCardProps> = ({
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

  // Get guias in this lote
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
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-genesis-border-subtle">
          {/* Meta Info */}
          <div className="p-4 bg-genesis-soft/50 grid grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-genesis-muted">Data Geração</span>
              <p className="font-medium text-genesis-dark">
                {formatDate(lote.dataGeracao)}
              </p>
            </div>
            <div>
              <span className="text-genesis-muted">Registro ANS</span>
              <p className="font-mono text-genesis-dark">{lote.registroANS}</p>
            </div>
            {lote.dataEnvio && (
              <div>
                <span className="text-genesis-muted">Data Envio</span>
                <p className="font-medium text-genesis-dark">
                  {formatDate(lote.dataEnvio)}
                </p>
              </div>
            )}
            {lote.protocoloOperadora && (
              <div>
                <span className="text-genesis-muted">Protocolo</span>
                <p className="font-mono text-genesis-dark">{lote.protocoloOperadora}</p>
              </div>
            )}
          </div>

          {/* Errors */}
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

          {/* Guias List */}
          <div className="p-4 border-t border-genesis-border-subtle">
            <h4 className="text-sm font-medium text-genesis-text mb-3">
              Guias no Lote
            </h4>
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

// =============================================================================
// CREATE LOTE MODAL
// =============================================================================

interface CreateLoteModalProps {
  guias: GuiaFirestore[];
  onClose: () => void;
  onCreate: (operadoraRegistroANS: string, guiaIds: string[]) => Promise<void>;
}

function CreateLoteModal({ guias, onClose, onCreate }: CreateLoteModalProps) {
  const [selectedGuiaIds, setSelectedGuiaIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  // Group guias by operadora (registroANS)
  const guiasByOperadora = useMemo(() => {
    const groups: Record<string, { nomeOperadora: string; guias: GuiaFirestore[] }> = {};
    guias
      .filter((g) => g.status === 'rascunho')
      .forEach((guia) => {
        if (!groups[guia.registroANS]) {
          groups[guia.registroANS] = {
            nomeOperadora: guia.nomeOperadora,
            guias: [],
          };
        }
        groups[guia.registroANS].guias.push(guia);
      });
    return groups;
  }, [guias]);

  const operadoras = Object.keys(guiasByOperadora);
  const [selectedOperadora, setSelectedOperadora] = useState(operadoras[0] || '');

  const availableGuias = guiasByOperadora[selectedOperadora]?.guias || [];

  const toggleGuia = (guiaId: string) => {
    setSelectedGuiaIds((prev) => {
      const next = new Set(prev);
      if (next.has(guiaId)) {
        next.delete(guiaId);
      } else {
        next.add(guiaId);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedGuiaIds(new Set(availableGuias.map((g) => g.id)));
  };

  const clearSelection = () => {
    setSelectedGuiaIds(new Set());
  };

  const handleCreate = async () => {
    if (selectedGuiaIds.size === 0) {
      toast.error('Selecione ao menos uma guia');
      return;
    }

    setLoading(true);
    try {
      await onCreate(selectedOperadora, Array.from(selectedGuiaIds));
      onClose();
    } catch {
      toast.error('Erro ao criar lote');
    } finally {
      setLoading(false);
    }
  };

  const totalValue = availableGuias
    .filter((g) => selectedGuiaIds.has(g.id))
    .reduce((sum, g) => sum + g.valorTotal, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-genesis-surface rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-genesis-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <Package className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-genesis-dark">Criar Novo Lote</h2>
              <p className="text-sm text-genesis-muted">
                Agrupe guias para envio à operadora
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
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {operadoras.length === 0 ? (
            <div className="text-center py-8 text-genesis-muted">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">Nenhuma guia pendente</p>
              <p className="text-sm">Crie guias com status "Rascunho" para agrupá-las em lotes</p>
            </div>
          ) : (
            <>
              {/* Operadora Select */}
              <div>
                <label className="block text-sm font-medium text-genesis-text mb-2">
                  Operadora
                </label>
                <select
                  value={selectedOperadora}
                  onChange={(e) => {
                    setSelectedOperadora(e.target.value);
                    setSelectedGuiaIds(new Set());
                  }}
                  className="w-full px-4 py-2.5 border border-genesis-border rounded-xl bg-genesis-soft text-genesis-text focus:ring-2 focus:ring-genesis-primary/20 focus:border-genesis-primary"
                >
                  {operadoras.map((ans) => (
                    <option key={ans} value={ans}>
                      {guiasByOperadora[ans].nomeOperadora} (ANS: {ans}) -{' '}
                      {guiasByOperadora[ans].guias.length} guia
                      {guiasByOperadora[ans].guias.length !== 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selection Actions */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-genesis-muted">
                  {selectedGuiaIds.size} de {availableGuias.length} selecionada
                  {selectedGuiaIds.size !== 1 ? 's' : ''}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={selectAll}
                    className="text-sm text-genesis-primary hover:underline"
                  >
                    Selecionar tudo
                  </button>
                  <span className="text-genesis-muted">|</span>
                  <button
                    onClick={clearSelection}
                    className="text-sm text-genesis-muted hover:text-genesis-dark"
                  >
                    Limpar
                  </button>
                </div>
              </div>

              {/* Guias List */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {availableGuias.map((guia) => (
                  <label
                    key={guia.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedGuiaIds.has(guia.id)
                        ? 'bg-genesis-primary/5 border-genesis-primary/30'
                        : 'bg-genesis-soft border-genesis-border hover:border-genesis-primary/30'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedGuiaIds.has(guia.id)}
                      onChange={() => toggleGuia(guia.id)}
                      className="w-4 h-4 text-genesis-primary rounded border-genesis-border focus:ring-genesis-primary/20"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-genesis-dark">
                          {guia.numeroGuiaPrestador}
                        </span>
                        <span className="text-genesis-dark">
                          {formatCurrency(guia.valorTotal)}
                        </span>
                      </div>
                      <div className="text-sm text-genesis-muted">
                        {guia.dadosGuia.dadosBeneficiario.nomeBeneficiario}
                        <span className="mx-2">•</span>
                        {formatDate(guia.dataAtendimento)}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {operadoras.length > 0 && (
          <div className="flex items-center justify-between p-6 border-t border-genesis-border bg-genesis-soft">
            <div>
              <span className="text-genesis-muted text-sm">Valor Total:</span>
              <span className="ml-2 text-lg font-bold text-genesis-dark">
                {formatCurrency(totalValue)}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-genesis-muted hover:text-genesis-dark transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={loading || selectedGuiaIds.size === 0}
                className="flex items-center gap-2 px-4 py-2 bg-genesis-primary text-white rounded-xl font-medium hover:bg-genesis-primary/90 transition-all hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 disabled:hover:translate-y-0"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <Package className="w-4 h-4" />
                    Criar Lote
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function LotesTab({
  lotes,
  guias,
  loading = false,
  onCreateLote,
  onSendLote,
  onDeleteLote,
  onDownloadXml,
  onViewGuia,
}: LotesTabProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Count pending guias for badge
  const pendingGuiasCount = useMemo(() => {
    return guias.filter((g) => g.status === 'rascunho').length;
  }, [guias]);

  // Sort lotes by date (newest first)
  const sortedLotes = useMemo((): LoteGuias[] => {
    return [...lotes].sort(
      (a, b) => new Date(b.dataGeracao).getTime() - new Date(a.dataGeracao).getTime()
    );
  }, [lotes]);

  const handleSendLote = useCallback(
    async (loteId: string) => {
      setActionLoading(loteId);
      try {
        await onSendLote(loteId);
        toast.success('Lote enviado com sucesso');
      } catch {
        toast.error('Erro ao enviar lote');
      } finally {
        setActionLoading(null);
      }
    },
    [onSendLote]
  );

  const handleDeleteLote = useCallback(
    async (loteId: string) => {
      setActionLoading(loteId);
      try {
        await onDeleteLote(loteId);
        toast.success('Lote excluído');
      } catch {
        toast.error('Erro ao excluir lote');
      } finally {
        setActionLoading(null);
      }
    },
    [onDeleteLote]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-genesis-dark">Lotes de Guias</h2>
          <p className="text-sm text-genesis-muted">
            Agrupe guias para envio em lote às operadoras
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          disabled={pendingGuiasCount === 0}
          className="flex items-center gap-2 px-4 py-2.5 bg-genesis-primary text-white rounded-xl font-medium hover:bg-genesis-primary/90 transition-all hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:translate-y-0"
        >
          <Plus className="w-4 h-4" />
          Criar Lote
          {pendingGuiasCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-white/20 rounded-full">
              {pendingGuiasCount}
            </span>
          )}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 bg-genesis-surface rounded-xl border border-genesis-border-subtle">
          <div className="flex items-center gap-2 text-genesis-muted mb-1">
            <Package className="w-4 h-4" />
            <span className="text-sm">Total de Lotes</span>
          </div>
          <p className="text-2xl font-bold text-genesis-dark">{lotes.length}</p>
        </div>

        <div className="p-4 bg-genesis-surface rounded-xl border border-genesis-border-subtle">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Pendentes</span>
          </div>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {lotes.filter((l) => l.status === 'rascunho' || l.status === 'pronto').length}
          </p>
        </div>

        <div className="p-4 bg-genesis-surface rounded-xl border border-genesis-border-subtle">
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-1">
            <Send className="w-4 h-4" />
            <span className="text-sm">Enviados</span>
          </div>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {lotes.filter((l) => l.status === 'enviado' || l.status === 'processado').length}
          </p>
        </div>

        <div className="p-4 bg-genesis-surface rounded-xl border border-genesis-border-subtle">
          <div className="flex items-center gap-2 text-genesis-muted mb-1">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm">Valor Total</span>
          </div>
          <p className="text-xl font-bold text-genesis-dark">
            {formatCurrency(lotes.reduce((sum, l) => sum + l.valorTotal, 0))}
          </p>
        </div>
      </div>

      {/* Lotes List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-genesis-primary" />
        </div>
      ) : sortedLotes.length === 0 ? (
        <EmptyState
          illustration="documents"
          title="Nenhum lote criado"
          description="Crie um lote para agrupar guias e enviá-las às operadoras de uma só vez"
          action={{
            label: 'Criar Primeiro Lote',
            onClick: () => setShowCreateModal(true),
            disabled: pendingGuiasCount === 0,
          }}
        />
      ) : (
        <div className="space-y-3">
          {sortedLotes.map((lote) => (
            <LoteCard
              key={lote.id}
              lote={lote}
              guias={guias}
              onSend={() => handleSendLote(lote.id)}
              onDelete={() => handleDeleteLote(lote.id)}
              onDownloadXml={onDownloadXml ? () => onDownloadXml(lote.id) : undefined}
              onViewGuia={onViewGuia}
              isLoading={actionLoading === lote.id}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateLoteModal
          guias={guias}
          onClose={() => setShowCreateModal(false)}
          onCreate={onCreateLote}
        />
      )}
    </div>
  );
}
