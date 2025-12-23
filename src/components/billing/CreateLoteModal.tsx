/**
 * CreateLoteModal Component
 *
 * Modal for creating a new batch (lote) by selecting pending guides.
 */

import React, { useState, useMemo } from 'react';
import { Package, FileText, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import type { GuiaFirestore } from '@/types';

// =============================================================================
// TYPES
// =============================================================================

export interface CreateLoteModalProps {
  guias: GuiaFirestore[];
  onClose: () => void;
  onCreate: (operadoraRegistroANS: string, guiaIds: string[]) => Promise<void>;
}

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

export function CreateLoteModal({ guias, onClose, onCreate }: CreateLoteModalProps) {
  const [selectedGuiaIds, setSelectedGuiaIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

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
