/**
 * TissSADTForm Component
 *
 * Form for creating a TISS Guia SP/SADT (Serviço Profissional /
 * Serviço Auxiliar de Diagnóstico e Terapia).
 *
 * This is used for procedures, exams, and therapies - more complex
 * than the simple consultation guide.
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  FileText,
  Search,
  User,
  Building2,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Loader2,
  Plus,
  Trash2,
  Stethoscope,
  Clock,
} from 'lucide-react';
import type {
  CaraterAtendimento,
  TipoTabela,
  DadosBeneficiario,
  ProcedimentoRealizado,
  CodigoTUSS,
} from '@/types';
import { searchTussCodes } from '@/services/tiss';

// =============================================================================
// TYPES
// =============================================================================

interface TissSADTFormProps {
  /** Pre-filled patient data */
  patient?: {
    name: string;
    insuranceNumber?: string;
    insurance?: string;
    birthDate?: string;
  };
  /** Appointment date */
  appointmentDate?: string;
  /** Callback when form is submitted */
  onSubmit: (data: TissSADTFormData) => Promise<void>;
  /** Callback when form is cancelled */
  onCancel: () => void;
  /** Loading state */
  isLoading?: boolean;
}

export interface TissSADTFormData {
  registroANS: string;
  nomeOperadora: string;
  beneficiario: DadosBeneficiario;
  caraterAtendimento: CaraterAtendimento;
  dataSolicitacao: string;
  indicacaoClinica: string;
  procedimentos: ProcedimentoRealizado[];
  valorTotalProcedimentos: number;
  valorTotalTaxas?: number;
  valorTotalMateriais?: number;
  valorTotalGeral: number;
}

interface ProcedimentoFormItem {
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

// =============================================================================
// CONSTANTS
// =============================================================================

const CARATER_ATENDIMENTO_OPTIONS: Array<{ value: CaraterAtendimento; label: string }> = [
  { value: '1', label: 'Eletivo' },
  { value: '2', label: 'Urgência/Emergência' },
];

const TIPO_TABELA_OPTIONS: Array<{ value: TipoTabela; label: string }> = [
  { value: '22', label: 'TUSS' },
  { value: '18', label: 'Tabela Própria Prestador' },
  { value: '19', label: 'Tabela Própria Operadora' },
  { value: '20', label: 'Pacote' },
];

/**
 * Create empty procedure for the form
 */
function createEmptyProcedimento(): ProcedimentoFormItem {
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

export function TissSADTForm({
  patient,
  appointmentDate,
  onSubmit,
  onCancel,
  isLoading = false,
}: TissSADTFormProps) {
  // Form state - Operadora
  const [registroANS, setRegistroANS] = useState('');
  const [nomeOperadora, setNomeOperadora] = useState(patient?.insurance || '');

  // Form state - Beneficiário
  const [numeroCarteira, setNumeroCarteira] = useState(patient?.insuranceNumber || '');
  const [nomeBeneficiario, setNomeBeneficiario] = useState(patient?.name || '');
  const [dataNascimento, setDataNascimento] = useState(patient?.birthDate || '');

  // Form state - Atendimento
  const [caraterAtendimento, setCaraterAtendimento] = useState<CaraterAtendimento>('1');
  const [dataSolicitacao, setDataSolicitacao] = useState(
    appointmentDate || new Date().toISOString().split('T')[0]
  );
  const [indicacaoClinica, setIndicacaoClinica] = useState('');

  // Form state - Procedimentos
  const [procedimentos, setProcedimentos] = useState<ProcedimentoFormItem[]>([
    createEmptyProcedimento(),
  ]);

  // Form state - Valores adicionais
  const [valorTaxas, setValorTaxas] = useState('');
  const [valorMateriais, setValorMateriais] = useState('');

  // TUSS search state (for currently editing procedure)
  const [tussSearch, setTussSearch] = useState('');
  const [showTussDropdown, setShowTussDropdown] = useState(false);
  const [editingProcedureId, setEditingProcedureId] = useState<string | null>(null);

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate totals
  const valorTotalProcedimentos = useMemo(() => {
    return procedimentos.reduce((sum, proc) => {
      const qty = parseFloat(proc.quantidadeRealizada) || 0;
      const price = parseFloat(proc.valorUnitario) || 0;
      return sum + qty * price;
    }, 0);
  }, [procedimentos]);

  const valorTotalGeral = useMemo(() => {
    const taxas = parseFloat(valorTaxas) || 0;
    const materiais = parseFloat(valorMateriais) || 0;
    return valorTotalProcedimentos + taxas + materiais;
  }, [valorTotalProcedimentos, valorTaxas, valorMateriais]);

  // TUSS search results
  const tussResults = useMemo(() => {
    if (tussSearch.length < 2) return [];
    return searchTussCodes(tussSearch, 10);
  }, [tussSearch]);

  // Handle TUSS code selection
  const handleSelectTuss = useCallback((tuss: CodigoTUSS) => {
    if (!editingProcedureId) return;

    setProcedimentos((prev) =>
      prev.map((proc) =>
        proc.id === editingProcedureId
          ? {
              ...proc,
              codigoProcedimento: tuss.codigo,
              descricaoProcedimento: tuss.descricao,
              valorUnitario: tuss.valorReferencia?.toFixed(2) || '',
            }
          : proc
      )
    );
    setTussSearch('');
    setShowTussDropdown(false);
    setEditingProcedureId(null);
  }, [editingProcedureId]);

  // Update a specific procedure field
  const updateProcedimento = useCallback(
    (id: string, field: keyof ProcedimentoFormItem, value: string) => {
      setProcedimentos((prev) =>
        prev.map((proc) =>
          proc.id === id ? { ...proc, [field]: value } : proc
        )
      );
    },
    []
  );

  // Add new procedure
  const addProcedimento = useCallback(() => {
    setProcedimentos((prev) => [...prev, createEmptyProcedimento()]);
  }, []);

  // Remove procedure
  const removeProcedimento = useCallback((id: string) => {
    setProcedimentos((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((proc) => proc.id !== id);
    });
  }, []);

  // Validate form
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!registroANS || registroANS.length !== 6) {
      newErrors.registroANS = 'Registro ANS deve ter 6 dígitos';
    }

    if (!numeroCarteira || numeroCarteira.length < 10) {
      newErrors.numeroCarteira = 'Número da carteira inválido';
    }

    if (!nomeBeneficiario) {
      newErrors.nomeBeneficiario = 'Nome do beneficiário é obrigatório';
    }

    if (!dataSolicitacao) {
      newErrors.dataSolicitacao = 'Data da solicitação é obrigatória';
    }

    if (!indicacaoClinica) {
      newErrors.indicacaoClinica = 'Indicação clínica é obrigatória para SP/SADT';
    }

    // Validate each procedure
    const invalidProcs = procedimentos.filter(
      (proc) =>
        !proc.codigoProcedimento ||
        !proc.dataRealizacao ||
        parseFloat(proc.quantidadeRealizada) <= 0 ||
        parseFloat(proc.valorUnitario) <= 0
    );

    if (invalidProcs.length > 0) {
      newErrors.procedimentos = 'Preencha todos os campos obrigatórios dos procedimentos';
    }

    if (valorTotalGeral <= 0) {
      newErrors.valorTotal = 'O valor total deve ser maior que zero';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [
    registroANS,
    numeroCarteira,
    nomeBeneficiario,
    dataSolicitacao,
    indicacaoClinica,
    procedimentos,
    valorTotalGeral,
  ]);

  // Handle form submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      // Convert form items to ProcedimentoRealizado
      const procedimentosRealizados: ProcedimentoRealizado[] = procedimentos.map((proc) => ({
        dataRealizacao: proc.dataRealizacao,
        horaInicial: proc.horaInicial || undefined,
        horaFinal: proc.horaFinal || undefined,
        codigoTabela: proc.codigoTabela,
        codigoProcedimento: proc.codigoProcedimento,
        descricaoProcedimento: proc.descricaoProcedimento,
        quantidadeRealizada: parseFloat(proc.quantidadeRealizada),
        valorUnitario: parseFloat(proc.valorUnitario),
        valorTotal: parseFloat(proc.quantidadeRealizada) * parseFloat(proc.valorUnitario),
      }));

      const formData: TissSADTFormData = {
        registroANS,
        nomeOperadora,
        beneficiario: {
          numeroCarteira,
          nomeBeneficiario,
          dataNascimento: dataNascimento || undefined,
        },
        caraterAtendimento,
        dataSolicitacao,
        indicacaoClinica,
        procedimentos: procedimentosRealizados,
        valorTotalProcedimentos,
        valorTotalTaxas: parseFloat(valorTaxas) || undefined,
        valorTotalMateriais: parseFloat(valorMateriais) || undefined,
        valorTotalGeral,
      };

      await onSubmit(formData);
    },
    [
      validateForm,
      registroANS,
      nomeOperadora,
      numeroCarteira,
      nomeBeneficiario,
      dataNascimento,
      caraterAtendimento,
      dataSolicitacao,
      indicacaoClinica,
      procedimentos,
      valorTotalProcedimentos,
      valorTaxas,
      valorMateriais,
      valorTotalGeral,
      onSubmit,
    ]
  );

  // Format currency for display
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-genesis-border">
        <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
          <Stethoscope className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-genesis-dark">Guia SP/SADT</h2>
          <p className="text-sm text-genesis-muted">
            Serviço Profissional / Diagnóstico e Terapia • TISS 4.02.00
          </p>
        </div>
      </div>

      {/* Operadora Section */}
      <div className="bg-genesis-soft rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-2 text-genesis-text">
          <Building2 className="w-4 h-4" />
          <span className="font-medium">Operadora / Convênio</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-genesis-text mb-1">
              Registro ANS *
            </label>
            <input
              type="text"
              value={registroANS}
              onChange={(e) => setRegistroANS(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              maxLength={6}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-genesis-surface ${
                errors.registroANS ? 'border-red-300' : 'border-genesis-border'
              }`}
            />
            {errors.registroANS && (
              <p className="text-xs text-red-500 mt-1">{errors.registroANS}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-genesis-text mb-1">
              Nome da Operadora *
            </label>
            <input
              type="text"
              value={nomeOperadora}
              onChange={(e) => setNomeOperadora(e.target.value)}
              placeholder="Ex: Unimed, Bradesco Saúde"
              className="w-full px-3 py-2 border border-genesis-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-genesis-surface"
            />
          </div>
        </div>
      </div>

      {/* Beneficiário Section */}
      <div className="bg-genesis-soft rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-2 text-genesis-text">
          <User className="w-4 h-4" />
          <span className="font-medium">Dados do Beneficiário</span>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-genesis-text mb-1">
              Número da Carteira *
            </label>
            <input
              type="text"
              value={numeroCarteira}
              onChange={(e) => setNumeroCarteira(e.target.value.replace(/\D/g, ''))}
              placeholder="00000000000000000"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-genesis-surface ${
                errors.numeroCarteira ? 'border-red-300' : 'border-genesis-border'
              }`}
            />
            {errors.numeroCarteira && (
              <p className="text-xs text-red-500 mt-1">{errors.numeroCarteira}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-genesis-text mb-1">
              Nome do Beneficiário *
            </label>
            <input
              type="text"
              value={nomeBeneficiario}
              onChange={(e) => setNomeBeneficiario(e.target.value)}
              placeholder="Nome completo"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-genesis-surface ${
                errors.nomeBeneficiario ? 'border-red-300' : 'border-genesis-border'
              }`}
            />
            {errors.nomeBeneficiario && (
              <p className="text-xs text-red-500 mt-1">{errors.nomeBeneficiario}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-genesis-text mb-1">
              Data de Nascimento
            </label>
            <input
              type="date"
              value={dataNascimento}
              onChange={(e) => setDataNascimento(e.target.value)}
              className="w-full px-3 py-2 border border-genesis-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-genesis-surface"
            />
          </div>
        </div>
      </div>

      {/* Atendimento Section */}
      <div className="bg-genesis-soft rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-2 text-genesis-text">
          <Calendar className="w-4 h-4" />
          <span className="font-medium">Dados da Solicitação</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-genesis-text mb-1">
              Caráter do Atendimento *
            </label>
            <select
              value={caraterAtendimento}
              onChange={(e) => setCaraterAtendimento(e.target.value as CaraterAtendimento)}
              className="w-full px-3 py-2 border border-genesis-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-genesis-surface"
            >
              {CARATER_ATENDIMENTO_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-genesis-text mb-1">
              Data da Solicitação *
            </label>
            <input
              type="date"
              value={dataSolicitacao}
              onChange={(e) => setDataSolicitacao(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-genesis-surface ${
                errors.dataSolicitacao ? 'border-red-300' : 'border-genesis-border'
              }`}
            />
            {errors.dataSolicitacao && (
              <p className="text-xs text-red-500 mt-1">{errors.dataSolicitacao}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-genesis-text mb-1">
            Indicação Clínica / CID *
          </label>
          <textarea
            value={indicacaoClinica}
            onChange={(e) => setIndicacaoClinica(e.target.value)}
            placeholder="Descreva a indicação clínica, diagnóstico ou CID..."
            rows={2}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-genesis-surface resize-none ${
              errors.indicacaoClinica ? 'border-red-300' : 'border-genesis-border'
            }`}
          />
          {errors.indicacaoClinica && (
            <p className="text-xs text-red-500 mt-1">{errors.indicacaoClinica}</p>
          )}
        </div>
      </div>

      {/* Procedimentos Section */}
      <div className="bg-genesis-soft rounded-xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-genesis-text">
            <FileText className="w-4 h-4" />
            <span className="font-medium">Procedimentos Realizados</span>
          </div>
          <button
            type="button"
            onClick={addProcedimento}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Adicionar
          </button>
        </div>

        {errors.procedimentos && (
          <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg text-sm">
            <AlertCircle className="w-4 h-4" />
            {errors.procedimentos}
          </div>
        )}

        <div className="space-y-4">
          {procedimentos.map((proc, index) => (
            <div
              key={proc.id}
              className="p-4 bg-genesis-surface rounded-lg border border-genesis-border space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-genesis-muted">
                  Procedimento {index + 1}
                </span>
                {procedimentos.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeProcedimento(proc.id)}
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
                    value={editingProcedureId === proc.id ? tussSearch : ''}
                    onChange={(e) => {
                      setTussSearch(e.target.value);
                      setEditingProcedureId(proc.id);
                      setShowTussDropdown(e.target.value.length >= 2);
                    }}
                    onFocus={() => {
                      setEditingProcedureId(proc.id);
                      setShowTussDropdown(tussSearch.length >= 2);
                    }}
                    onBlur={() => setTimeout(() => setShowTussDropdown(false), 200)}
                    placeholder="Buscar procedimento TUSS..."
                    className="w-full pl-10 pr-3 py-2 border border-genesis-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-genesis-soft text-sm"
                  />
                </div>

                {/* Search Results Dropdown */}
                {showTussDropdown &&
                  editingProcedureId === proc.id &&
                  tussResults.length > 0 && (
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

              {/* Procedure details */}
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-genesis-muted mb-1">
                    Código TUSS *
                  </label>
                  <input
                    type="text"
                    value={proc.codigoProcedimento}
                    onChange={(e) =>
                      updateProcedimento(proc.id, 'codigoProcedimento', e.target.value)
                    }
                    placeholder="00000000"
                    className="w-full px-2 py-1.5 text-sm border border-genesis-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono bg-genesis-soft"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-medium text-genesis-muted mb-1">
                    Descrição
                  </label>
                  <input
                    type="text"
                    value={proc.descricaoProcedimento}
                    onChange={(e) =>
                      updateProcedimento(proc.id, 'descricaoProcedimento', e.target.value)
                    }
                    placeholder="Descrição do procedimento"
                    className="w-full px-2 py-1.5 text-sm border border-genesis-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-genesis-soft"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-genesis-muted mb-1">
                    Tabela
                  </label>
                  <select
                    value={proc.codigoTabela}
                    onChange={(e) =>
                      updateProcedimento(proc.id, 'codigoTabela', e.target.value)
                    }
                    className="w-full px-2 py-1.5 text-sm border border-genesis-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-genesis-soft"
                  >
                    {TIPO_TABELA_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-3">
                <div>
                  <label className="block text-xs font-medium text-genesis-muted mb-1">
                    Data *
                  </label>
                  <input
                    type="date"
                    value={proc.dataRealizacao}
                    onChange={(e) =>
                      updateProcedimento(proc.id, 'dataRealizacao', e.target.value)
                    }
                    className="w-full px-2 py-1.5 text-sm border border-genesis-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-genesis-soft"
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
                    onChange={(e) =>
                      updateProcedimento(proc.id, 'horaInicial', e.target.value)
                    }
                    className="w-full px-2 py-1.5 text-sm border border-genesis-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-genesis-soft"
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
                    onChange={(e) =>
                      updateProcedimento(proc.id, 'horaFinal', e.target.value)
                    }
                    className="w-full px-2 py-1.5 text-sm border border-genesis-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-genesis-soft"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-genesis-muted mb-1">
                    Qtd *
                  </label>
                  <input
                    type="text"
                    value={proc.quantidadeRealizada}
                    onChange={(e) =>
                      updateProcedimento(
                        proc.id,
                        'quantidadeRealizada',
                        e.target.value.replace(/\D/g, '')
                      )
                    }
                    placeholder="1"
                    className="w-full px-2 py-1.5 text-sm border border-genesis-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-genesis-soft text-center"
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
                      updateProcedimento(
                        proc.id,
                        'valorUnitario',
                        e.target.value.replace(/[^\d.,]/g, '').replace(',', '.')
                      )
                    }
                    placeholder="0.00"
                    className="w-full px-2 py-1.5 text-sm border border-genesis-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-genesis-soft text-right"
                  />
                </div>
              </div>

              {/* Line total */}
              <div className="text-right text-sm">
                <span className="text-genesis-muted">Subtotal: </span>
                <span className="font-medium text-genesis-dark">
                  {formatCurrency(
                    (parseFloat(proc.quantidadeRealizada) || 0) *
                      (parseFloat(proc.valorUnitario) || 0)
                  )}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Valores Section */}
      <div className="bg-genesis-soft rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-2 text-genesis-text">
          <DollarSign className="w-4 h-4" />
          <span className="font-medium">Valores Adicionais</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-genesis-text mb-1">
              Taxas (R$)
            </label>
            <input
              type="text"
              value={valorTaxas}
              onChange={(e) =>
                setValorTaxas(e.target.value.replace(/[^\d.,]/g, '').replace(',', '.'))
              }
              placeholder="0.00"
              className="w-full px-3 py-2 border border-genesis-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-genesis-surface text-right"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-genesis-text mb-1">
              Materiais (R$)
            </label>
            <input
              type="text"
              value={valorMateriais}
              onChange={(e) =>
                setValorMateriais(e.target.value.replace(/[^\d.,]/g, '').replace(',', '.'))
              }
              placeholder="0.00"
              className="w-full px-3 py-2 border border-genesis-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-genesis-surface text-right"
            />
          </div>
        </div>

        {/* Totals */}
        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-genesis-muted">Procedimentos:</span>
            <span className="text-genesis-dark">{formatCurrency(valorTotalProcedimentos)}</span>
          </div>
          {parseFloat(valorTaxas) > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-genesis-muted">Taxas:</span>
              <span className="text-genesis-dark">
                {formatCurrency(parseFloat(valorTaxas) || 0)}
              </span>
            </div>
          )}
          {parseFloat(valorMateriais) > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-genesis-muted">Materiais:</span>
              <span className="text-genesis-dark">
                {formatCurrency(parseFloat(valorMateriais) || 0)}
              </span>
            </div>
          )}
          <div className="flex justify-between text-base font-semibold pt-2 border-t border-purple-200 dark:border-purple-700">
            <span className="text-genesis-dark">Total Geral:</span>
            <span className="text-purple-700 dark:text-purple-300">
              {formatCurrency(valorTotalGeral)}
            </span>
          </div>
        </div>

        {errors.valorTotal && (
          <p className="text-xs text-red-500">{errors.valorTotal}</p>
        )}
      </div>

      {/* Validation Summary */}
      {Object.keys(errors).length > 0 && (
        <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Corrija os erros antes de continuar:</p>
            <ul className="text-sm mt-1 list-disc list-inside">
              {Object.values(errors).map((error, i) => (
                <li key={i}>{error}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-genesis-border">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-genesis-text bg-genesis-surface border border-genesis-border rounded-lg hover:bg-genesis-soft transition-colors disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-all hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 disabled:hover:translate-y-0"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Gerando...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              Gerar Guia
            </>
          )}
        </button>
      </div>
    </form>
  );
}
