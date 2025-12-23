/**
 * TissSADTForm Component
 *
 * Form for creating a TISS Guia SP/SADT (Serviço Profissional /
 * Serviço Auxiliar de Diagnóstico e Terapia).
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  FileText,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Loader2,
  Plus,
  Stethoscope,
} from 'lucide-react';
import type {
  CaraterAtendimento,
  DadosBeneficiario,
  ProcedimentoRealizado,
} from '@/types';
import {
  ProcedimentoItem,
  createEmptyProcedimento,
  type ProcedimentoFormItem,
} from './ProcedimentoItem';
import {
  OperadoraSection,
  BeneficiarioSection,
  SolicitacaoSection,
} from './TissFormSections';

// =============================================================================
// TYPES
// =============================================================================

interface TissSADTFormProps {
  patient?: {
    name: string;
    insuranceNumber?: string;
    insurance?: string;
    birthDate?: string;
  };
  appointmentDate?: string;
  onSubmit: (data: TissSADTFormData) => Promise<void>;
  onCancel: () => void;
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

// =============================================================================
// HELPERS
// =============================================================================

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
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

  // Update a specific procedure field
  const updateProcedimento = useCallback(
    (id: string, field: keyof ProcedimentoFormItem, value: string) => {
      setProcedimentos((prev) =>
        prev.map((proc) => (proc.id === id ? { ...proc, [field]: value } : proc))
      );
    },
    []
  );

  const addProcedimento = useCallback(() => {
    setProcedimentos((prev) => [...prev, createEmptyProcedimento()]);
  }, []);

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
      if (!validateForm()) return;

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
      <OperadoraSection
        registroANS={registroANS}
        nomeOperadora={nomeOperadora}
        onRegistroANSChange={setRegistroANS}
        onNomeOperadoraChange={setNomeOperadora}
        errors={{ registroANS: errors.registroANS }}
      />

      {/* Beneficiário Section */}
      <BeneficiarioSection
        numeroCarteira={numeroCarteira}
        nomeBeneficiario={nomeBeneficiario}
        dataNascimento={dataNascimento}
        onNumeroCarteiraChange={setNumeroCarteira}
        onNomeBeneficiarioChange={setNomeBeneficiario}
        onDataNascimentoChange={setDataNascimento}
        errors={{
          numeroCarteira: errors.numeroCarteira,
          nomeBeneficiario: errors.nomeBeneficiario,
        }}
      />

      {/* Solicitação Section */}
      <SolicitacaoSection
        caraterAtendimento={caraterAtendimento}
        dataSolicitacao={dataSolicitacao}
        indicacaoClinica={indicacaoClinica}
        onCaraterAtendimentoChange={setCaraterAtendimento}
        onDataSolicitacaoChange={setDataSolicitacao}
        onIndicacaoClinicaChange={setIndicacaoClinica}
        errors={{
          dataSolicitacao: errors.dataSolicitacao,
          indicacaoClinica: errors.indicacaoClinica,
        }}
      />

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
            <ProcedimentoItem
              key={proc.id}
              procedimento={proc}
              index={index}
              canRemove={procedimentos.length > 1}
              onUpdate={(field, value) => updateProcedimento(proc.id, field, value)}
              onRemove={() => removeProcedimento(proc.id)}
            />
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
              <span className="text-genesis-dark">{formatCurrency(parseFloat(valorTaxas))}</span>
            </div>
          )}
          {parseFloat(valorMateriais) > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-genesis-muted">Materiais:</span>
              <span className="text-genesis-dark">{formatCurrency(parseFloat(valorMateriais))}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-semibold pt-2 border-t border-purple-200 dark:border-purple-700">
            <span className="text-genesis-dark">Total Geral:</span>
            <span className="text-purple-700 dark:text-purple-300">
              {formatCurrency(valorTotalGeral)}
            </span>
          </div>
        </div>

        {errors.valorTotal && <p className="text-xs text-red-500">{errors.valorTotal}</p>}
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
