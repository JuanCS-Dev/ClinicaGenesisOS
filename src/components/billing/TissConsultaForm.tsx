/**
 * TissConsultaForm Component
 *
 * Form for creating a TISS Guia de Consulta (medical consultation bill).
 * Includes TUSS code search and validation.
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  FileText,
  Search,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import type {
  TipoConsulta,
  DadosBeneficiario,
  CodigoTUSS,
} from '@/types';
import { searchTussCodes, getConsultaCodes } from '@/services/tiss';
import { OperadoraSection, BeneficiarioSection } from './TissFormSections';

// =============================================================================
// TYPES
// =============================================================================

interface TissConsultaFormProps {
  /** Pre-filled patient data */
  patient?: {
    name: string;
    insuranceNumber?: string;
    insurance?: string;
  };
  /** Appointment date */
  appointmentDate?: string;
  /** Callback when form is submitted */
  onSubmit: (data: TissConsultaFormData) => Promise<void>;
  /** Callback when form is cancelled */
  onCancel: () => void;
  /** Loading state */
  isLoading?: boolean;
}

export interface TissConsultaFormData {
  registroANS: string;
  nomeOperadora: string;
  beneficiario: DadosBeneficiario;
  tipoConsulta: TipoConsulta;
  dataAtendimento: string;
  codigoProcedimento: string;
  descricaoProcedimento: string;
  valorProcedimento: number;
  indicacaoClinica: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const TIPO_CONSULTA_OPTIONS: Array<{ value: TipoConsulta; label: string }> = [
  { value: '1', label: 'Primeira consulta' },
  { value: '2', label: 'Retorno' },
  { value: '3', label: 'Pré-natal' },
  { value: '4', label: 'Por encaminhamento' },
];

// =============================================================================
// COMPONENT
// =============================================================================

export function TissConsultaForm({
  patient,
  appointmentDate,
  onSubmit,
  onCancel,
  isLoading = false,
}: TissConsultaFormProps) {
  // Form state
  const [registroANS, setRegistroANS] = useState('');
  const [nomeOperadora, setNomeOperadora] = useState(patient?.insurance || '');
  const [numeroCarteira, setNumeroCarteira] = useState(patient?.insuranceNumber || '');
  const [nomeBeneficiario, setNomeBeneficiario] = useState(patient?.name || '');
  const [tipoConsulta, setTipoConsulta] = useState<TipoConsulta>('1');
  const [dataAtendimento, setDataAtendimento] = useState(
    appointmentDate || new Date().toISOString().split('T')[0]
  );
  const [codigoProcedimento, setCodigoProcedimento] = useState('');
  const [descricaoProcedimento, setDescricaoProcedimento] = useState('');
  const [valorProcedimento, setValorProcedimento] = useState('');
  const [indicacaoClinica, setIndicacaoClinica] = useState('');

  // TUSS search state
  const [tussSearch, setTussSearch] = useState('');
  const [showTussDropdown, setShowTussDropdown] = useState(false);

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Quick access to common consultation codes
  const consultaCodes = useMemo(() => getConsultaCodes(), []);

  // TUSS search results
  const tussResults = useMemo(() => {
    if (tussSearch.length < 2) return [];
    return searchTussCodes(tussSearch, 10);
  }, [tussSearch]);

  // Handle TUSS code selection
  const handleSelectTuss = useCallback((tuss: CodigoTUSS) => {
    setCodigoProcedimento(tuss.codigo);
    setDescricaoProcedimento(tuss.descricao);
    if (tuss.valorReferencia) {
      setValorProcedimento(tuss.valorReferencia.toFixed(2));
    }
    setTussSearch('');
    setShowTussDropdown(false);
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

    if (!dataAtendimento) {
      newErrors.dataAtendimento = 'Data do atendimento é obrigatória';
    }

    if (!codigoProcedimento) {
      newErrors.codigoProcedimento = 'Código do procedimento é obrigatório';
    }

    const valor = parseFloat(valorProcedimento);
    if (isNaN(valor) || valor <= 0) {
      newErrors.valorProcedimento = 'Valor deve ser maior que zero';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [registroANS, numeroCarteira, nomeBeneficiario, dataAtendimento, codigoProcedimento, valorProcedimento]);

  // Handle form submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      const formData: TissConsultaFormData = {
        registroANS,
        nomeOperadora,
        beneficiario: {
          numeroCarteira,
          nomeBeneficiario,
        },
        tipoConsulta,
        dataAtendimento,
        codigoProcedimento,
        descricaoProcedimento,
        valorProcedimento: parseFloat(valorProcedimento),
        indicacaoClinica,
      };

      await onSubmit(formData);
    },
    [
      validateForm,
      registroANS,
      nomeOperadora,
      numeroCarteira,
      nomeBeneficiario,
      tipoConsulta,
      dataAtendimento,
      codigoProcedimento,
      descricaoProcedimento,
      valorProcedimento,
      indicacaoClinica,
      onSubmit,
    ]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-genesis-border">
        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
          <FileText className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-genesis-dark">Guia de Consulta</h2>
          <p className="text-sm text-genesis-muted">TISS 4.02.00</p>
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
        onNumeroCarteiraChange={setNumeroCarteira}
        onNomeBeneficiarioChange={setNomeBeneficiario}
        errors={{
          numeroCarteira: errors.numeroCarteira,
          nomeBeneficiario: errors.nomeBeneficiario,
        }}
        compact
      />

      {/* Atendimento Section */}
      <div className="bg-genesis-soft rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-2 text-genesis-text">
          <Calendar className="w-4 h-4" />
          <span className="font-medium">Dados do Atendimento</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-genesis-text mb-1">
              Tipo de Consulta *
            </label>
            <select
              value={tipoConsulta}
              onChange={(e) => setTipoConsulta(e.target.value as TipoConsulta)}
              className="w-full px-3 py-2 border border-genesis-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {TIPO_CONSULTA_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-genesis-text mb-1">
              Data do Atendimento *
            </label>
            <input
              type="date"
              value={dataAtendimento}
              onChange={(e) => setDataAtendimento(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.dataAtendimento ? 'border-red-300' : 'border-genesis-border'
              }`}
            />
            {errors.dataAtendimento && (
              <p className="text-xs text-red-500 mt-1">{errors.dataAtendimento}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-genesis-text mb-1">
            Indicação Clínica / CID
          </label>
          <input
            type="text"
            value={indicacaoClinica}
            onChange={(e) => setIndicacaoClinica(e.target.value)}
            placeholder="Ex: Hipertensão arterial - I10"
            className="w-full px-3 py-2 border border-genesis-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Procedimento Section */}
      <div className="bg-genesis-soft rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-2 text-genesis-text">
          <DollarSign className="w-4 h-4" />
          <span className="font-medium">Procedimento</span>
        </div>

        {/* Quick select common consultation codes */}
        <div>
          <label className="block text-sm font-medium text-genesis-text mb-2">
            Consultas Comuns
          </label>
          <div className="flex flex-wrap gap-2">
            {consultaCodes.slice(0, 4).map((code) => (
              <button
                key={code.codigo}
                type="button"
                onClick={() => handleSelectTuss(code)}
                className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                  codigoProcedimento === code.codigo
                    ? 'bg-blue-100 border-blue-300 text-blue-700'
                    : 'bg-genesis-surface border-genesis-border text-genesis-medium hover:border-blue-300'
                }`}
              >
                {code.codigo} - {code.descricao.substring(0, 30)}...
              </button>
            ))}
          </div>
        </div>

        {/* TUSS Search */}
        <div className="relative">
          <label className="block text-sm font-medium text-genesis-text mb-1">
            Buscar Procedimento TUSS
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-genesis-subtle" />
            <input
              type="text"
              value={tussSearch}
              onChange={(e) => {
                setTussSearch(e.target.value);
                setShowTussDropdown(e.target.value.length >= 2);
              }}
              onFocus={() => setShowTussDropdown(tussSearch.length >= 2)}
              onBlur={() => setTimeout(() => setShowTussDropdown(false), 200)}
              placeholder="Digite código ou descrição..."
              className="w-full pl-10 pr-3 py-2 border border-genesis-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Search Results Dropdown */}
          {showTussDropdown && tussResults.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-genesis-surface border border-genesis-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {tussResults.map((tuss) => (
                <button
                  key={tuss.codigo}
                  type="button"
                  onClick={() => handleSelectTuss(tuss)}
                  className="w-full px-4 py-2 text-left hover:bg-genesis-soft border-b border-genesis-border-subtle last:border-0"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm text-blue-600">{tuss.codigo}</span>
                    {tuss.valorReferencia && (
                      <span className="text-sm text-green-600">
                        R$ {tuss.valorReferencia.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-genesis-text truncate">{tuss.descricao}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected Procedure */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-genesis-text mb-1">
              Código TUSS *
            </label>
            <input
              type="text"
              value={codigoProcedimento}
              onChange={(e) => setCodigoProcedimento(e.target.value)}
              placeholder="00000000"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono ${
                errors.codigoProcedimento ? 'border-red-300' : 'border-genesis-border'
              }`}
            />
            {errors.codigoProcedimento && (
              <p className="text-xs text-red-500 mt-1">{errors.codigoProcedimento}</p>
            )}
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-genesis-text mb-1">
              Descrição
            </label>
            <input
              type="text"
              value={descricaoProcedimento}
              onChange={(e) => setDescricaoProcedimento(e.target.value)}
              placeholder="Descrição do procedimento"
              className="w-full px-3 py-2 border border-genesis-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-genesis-text mb-1">
            Valor do Procedimento (R$) *
          </label>
          <input
            type="text"
            value={valorProcedimento}
            onChange={(e) => {
              const value = e.target.value.replace(/[^\d.,]/g, '').replace(',', '.');
              setValorProcedimento(value);
            }}
            placeholder="0.00"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.valorProcedimento ? 'border-red-300' : 'border-genesis-border'
            }`}
          />
          {errors.valorProcedimento && (
            <p className="text-xs text-red-500 mt-1">{errors.valorProcedimento}</p>
          )}
        </div>
      </div>

      {/* Validation Summary */}
      {Object.keys(errors).length > 0 && (
        <div className="flex items-start gap-2 p-3 bg-red-50 text-red-700 rounded-lg">
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
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50"
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
