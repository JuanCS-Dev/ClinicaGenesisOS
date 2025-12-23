/**
 * ProcedimentoItem Component
 *
 * Individual procedure item with TUSS search for TissSADTForm.
 */

import React, { useMemo, useCallback } from 'react';
import { Search, Trash2, Clock } from 'lucide-react';
import type { TipoTabela, CodigoTUSS } from '@/types';
import { searchTussCodes } from '@/services/tiss';

// =============================================================================
// TYPES
// =============================================================================

export interface ProcedimentoFormItem {
  id: string;
  dataRealizacao: string;
  horaInicial: string;
  horaFinal: string;
  codigoTabela: TipoTabela;
  codigoProcedimento: string;
  descricaoProcedimento: string;
  quantidadeRealizada: string;
  valorUnitario: string;
}

export interface ProcedimentoItemProps {
  procedimento: ProcedimentoFormItem;
  index: number;
  canRemove: boolean;
  onUpdate: (field: keyof ProcedimentoFormItem, value: string) => void;
  onRemove: () => void;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const TIPO_TABELA_OPTIONS: Array<{ value: TipoTabela; label: string }> = [
  { value: '22', label: 'TUSS' },
  { value: '18', label: 'Tabela Própria Prestador' },
  { value: '19', label: 'Tabela Própria Operadora' },
  { value: '20', label: 'Pacote' },
];

// =============================================================================
// HELPERS
// =============================================================================

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function createEmptyProcedimento(): ProcedimentoFormItem {
  return {
    id: crypto.randomUUID(),
    dataRealizacao: new Date().toISOString().split('T')[0],
    horaInicial: '',
    horaFinal: '',
    codigoTabela: '22',
    codigoProcedimento: '',
    descricaoProcedimento: '',
    quantidadeRealizada: '1',
    valorUnitario: '',
  };
}

// =============================================================================
// COMPONENT
// =============================================================================

export const ProcedimentoItem: React.FC<ProcedimentoItemProps> = ({
  procedimento: proc,
  index,
  canRemove,
  onUpdate,
  onRemove,
}) => {
  const [tussSearch, setTussSearch] = React.useState('');
  const [showDropdown, setShowDropdown] = React.useState(false);

  const tussResults = useMemo(() => {
    if (tussSearch.length < 2) return [];
    return searchTussCodes(tussSearch, 10);
  }, [tussSearch]);

  const handleSelectTuss = useCallback(
    (tuss: CodigoTUSS) => {
      onUpdate('codigoProcedimento', tuss.codigo);
      onUpdate('descricaoProcedimento', tuss.descricao);
      if (tuss.valorReferencia) {
        onUpdate('valorUnitario', tuss.valorReferencia.toFixed(2));
      }
      setTussSearch('');
      setShowDropdown(false);
    },
    [onUpdate]
  );

  const subtotal =
    (parseFloat(proc.quantidadeRealizada) || 0) * (parseFloat(proc.valorUnitario) || 0);

  return (
    <div className="p-4 bg-genesis-surface rounded-lg border border-genesis-border space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-genesis-muted">
          Procedimento {index + 1}
        </span>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="p-1 text-genesis-muted hover:text-danger transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* TUSS Search */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-genesis-subtle" />
          <input
            type="text"
            value={tussSearch}
            onChange={(e) => {
              setTussSearch(e.target.value);
              setShowDropdown(e.target.value.length >= 2);
            }}
            onFocus={() => setShowDropdown(tussSearch.length >= 2)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            placeholder="Buscar procedimento TUSS..."
            className="w-full pl-10 pr-3 py-2 border border-genesis-border rounded-lg focus:outline-none focus:ring-2 focus:ring-genesis-primary bg-genesis-soft text-sm"
          />
        </div>

        {showDropdown && tussResults.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-genesis-surface border border-genesis-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {tussResults.map((tuss) => (
              <button
                key={tuss.codigo}
                type="button"
                onClick={() => handleSelectTuss(tuss)}
                className="w-full px-3 py-2 text-left hover:bg-genesis-soft border-b border-genesis-border-subtle last:border-0"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-purple-600 dark:text-purple-400">
                    {tuss.codigo}
                  </span>
                  {tuss.valorReferencia && (
                    <span className="text-xs text-green-600 dark:text-green-400">
                      R$ {tuss.valorReferencia.toFixed(2)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-genesis-text truncate">{tuss.descricao}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Procedure details row 1 */}
      <div className="grid grid-cols-4 gap-3">
        <div>
          <label className="block text-xs font-medium text-genesis-muted mb-1">
            Código TUSS *
          </label>
          <input
            type="text"
            value={proc.codigoProcedimento}
            onChange={(e) => onUpdate('codigoProcedimento', e.target.value)}
            placeholder="00000000"
            className="w-full px-2 py-1.5 text-sm border border-genesis-border rounded-lg focus:outline-none focus:ring-2 focus:ring-genesis-primary font-mono bg-genesis-soft"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-xs font-medium text-genesis-muted mb-1">
            Descrição
          </label>
          <input
            type="text"
            value={proc.descricaoProcedimento}
            onChange={(e) => onUpdate('descricaoProcedimento', e.target.value)}
            placeholder="Descrição do procedimento"
            className="w-full px-2 py-1.5 text-sm border border-genesis-border rounded-lg focus:outline-none focus:ring-2 focus:ring-genesis-primary bg-genesis-soft"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-genesis-muted mb-1">
            Tabela
          </label>
          <select
            value={proc.codigoTabela}
            onChange={(e) => onUpdate('codigoTabela', e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-genesis-border rounded-lg focus:outline-none focus:ring-2 focus:ring-genesis-primary bg-genesis-soft"
          >
            {TIPO_TABELA_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Procedure details row 2 */}
      <div className="grid grid-cols-5 gap-3">
        <div>
          <label className="block text-xs font-medium text-genesis-muted mb-1">
            Data *
          </label>
          <input
            type="date"
            value={proc.dataRealizacao}
            onChange={(e) => onUpdate('dataRealizacao', e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-genesis-border rounded-lg focus:outline-none focus:ring-2 focus:ring-genesis-primary bg-genesis-soft"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-genesis-muted mb-1">
            <Clock className="inline w-3 h-3 mr-1" />
            Início
          </label>
          <input
            type="time"
            value={proc.horaInicial}
            onChange={(e) => onUpdate('horaInicial', e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-genesis-border rounded-lg focus:outline-none focus:ring-2 focus:ring-genesis-primary bg-genesis-soft"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-genesis-muted mb-1">
            <Clock className="inline w-3 h-3 mr-1" />
            Fim
          </label>
          <input
            type="time"
            value={proc.horaFinal}
            onChange={(e) => onUpdate('horaFinal', e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-genesis-border rounded-lg focus:outline-none focus:ring-2 focus:ring-genesis-primary bg-genesis-soft"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-genesis-muted mb-1">
            Qtd *
          </label>
          <input
            type="text"
            value={proc.quantidadeRealizada}
            onChange={(e) => onUpdate('quantidadeRealizada', e.target.value.replace(/\D/g, ''))}
            placeholder="1"
            className="w-full px-2 py-1.5 text-sm border border-genesis-border rounded-lg focus:outline-none focus:ring-2 focus:ring-genesis-primary bg-genesis-soft text-center"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-genesis-muted mb-1">
            Valor Unit. (R$) *
          </label>
          <input
            type="text"
            value={proc.valorUnitario}
            onChange={(e) =>
              onUpdate('valorUnitario', e.target.value.replace(/[^\d.,]/g, '').replace(',', '.'))
            }
            placeholder="0.00"
            className="w-full px-2 py-1.5 text-sm border border-genesis-border rounded-lg focus:outline-none focus:ring-2 focus:ring-genesis-primary bg-genesis-soft text-right"
          />
        </div>
      </div>

      {/* Line total */}
      <div className="text-right text-sm">
        <span className="text-genesis-muted">Subtotal: </span>
        <span className="font-medium text-genesis-dark">{formatCurrency(subtotal)}</span>
      </div>
    </div>
  );
}
