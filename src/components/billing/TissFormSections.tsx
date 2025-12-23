/**
 * TissFormSections Component
 *
 * Reusable form sections for TISS guide forms (Operadora, Beneficiário, Solicitação).
 */

import React from 'react';
import { User, Building2, Calendar } from 'lucide-react';
import type { CaraterAtendimento } from '@/types';

// =============================================================================
// TYPES
// =============================================================================

export interface OperadoraSectionProps {
  registroANS: string;
  nomeOperadora: string;
  onRegistroANSChange: (value: string) => void;
  onNomeOperadoraChange: (value: string) => void;
  errors?: { registroANS?: string };
}

export interface BeneficiarioSectionProps {
  numeroCarteira: string;
  nomeBeneficiario: string;
  dataNascimento?: string;
  onNumeroCarteiraChange: (value: string) => void;
  onNomeBeneficiarioChange: (value: string) => void;
  onDataNascimentoChange?: (value: string) => void;
  errors?: { numeroCarteira?: string; nomeBeneficiario?: string };
  /** If true, hides birth date field and uses 2-column layout */
  compact?: boolean;
}

export interface SolicitacaoSectionProps {
  caraterAtendimento: CaraterAtendimento;
  dataSolicitacao: string;
  indicacaoClinica: string;
  onCaraterAtendimentoChange: (value: CaraterAtendimento) => void;
  onDataSolicitacaoChange: (value: string) => void;
  onIndicacaoClinicaChange: (value: string) => void;
  errors?: { dataSolicitacao?: string; indicacaoClinica?: string };
}

// =============================================================================
// CONSTANTS
// =============================================================================

const CARATER_ATENDIMENTO_OPTIONS: Array<{ value: CaraterAtendimento; label: string }> = [
  { value: '1', label: 'Eletivo' },
  { value: '2', label: 'Urgência/Emergência' },
];

// =============================================================================
// OPERADORA SECTION
// =============================================================================

export function OperadoraSection({
  registroANS,
  nomeOperadora,
  onRegistroANSChange,
  onNomeOperadoraChange,
  errors = {},
}: OperadoraSectionProps) {
  return (
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
            onChange={(e) => onRegistroANSChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            maxLength={6}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-genesis-primary bg-genesis-surface ${
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
            onChange={(e) => onNomeOperadoraChange(e.target.value)}
            placeholder="Ex: Unimed, Bradesco Saúde"
            className="w-full px-3 py-2 border border-genesis-border rounded-lg focus:outline-none focus:ring-2 focus:ring-genesis-primary bg-genesis-surface"
          />
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// BENEFICIARIO SECTION
// =============================================================================

export function BeneficiarioSection({
  numeroCarteira,
  nomeBeneficiario,
  dataNascimento,
  onNumeroCarteiraChange,
  onNomeBeneficiarioChange,
  onDataNascimentoChange,
  errors = {},
  compact = false,
}: BeneficiarioSectionProps) {
  const showBirthDate = !compact && onDataNascimentoChange;
  const gridCols = showBirthDate ? 'grid-cols-3' : 'grid-cols-2';

  return (
    <div className="bg-genesis-soft rounded-xl p-4 space-y-4">
      <div className="flex items-center gap-2 text-genesis-text">
        <User className="w-4 h-4" />
        <span className="font-medium">Dados do Beneficiário</span>
      </div>

      <div className={`grid ${gridCols} gap-4`}>
        <div>
          <label className="block text-sm font-medium text-genesis-text mb-1">
            Número da Carteira *
          </label>
          <input
            type="text"
            value={numeroCarteira}
            onChange={(e) => onNumeroCarteiraChange(e.target.value.replace(/\D/g, ''))}
            placeholder="00000000000000000"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-genesis-primary bg-genesis-surface ${
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
            onChange={(e) => onNomeBeneficiarioChange(e.target.value)}
            placeholder="Nome completo"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-genesis-primary bg-genesis-surface ${
              errors.nomeBeneficiario ? 'border-red-300' : 'border-genesis-border'
            }`}
          />
          {errors.nomeBeneficiario && (
            <p className="text-xs text-red-500 mt-1">{errors.nomeBeneficiario}</p>
          )}
        </div>

        {showBirthDate && (
          <div>
            <label className="block text-sm font-medium text-genesis-text mb-1">
              Data de Nascimento
            </label>
            <input
              type="date"
              value={dataNascimento || ''}
              onChange={(e) => onDataNascimentoChange(e.target.value)}
              className="w-full px-3 py-2 border border-genesis-border rounded-lg focus:outline-none focus:ring-2 focus:ring-genesis-primary bg-genesis-surface"
            />
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// SOLICITACAO SECTION
// =============================================================================

export function SolicitacaoSection({
  caraterAtendimento,
  dataSolicitacao,
  indicacaoClinica,
  onCaraterAtendimentoChange,
  onDataSolicitacaoChange,
  onIndicacaoClinicaChange,
  errors = {},
}: SolicitacaoSectionProps) {
  return (
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
            onChange={(e) => onCaraterAtendimentoChange(e.target.value as CaraterAtendimento)}
            className="w-full px-3 py-2 border border-genesis-border rounded-lg focus:outline-none focus:ring-2 focus:ring-genesis-primary bg-genesis-surface"
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
            onChange={(e) => onDataSolicitacaoChange(e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-genesis-primary bg-genesis-surface ${
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
          onChange={(e) => onIndicacaoClinicaChange(e.target.value)}
          placeholder="Descreva a indicação clínica, diagnóstico ou CID..."
          rows={2}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-genesis-primary bg-genesis-surface resize-none ${
            errors.indicacaoClinica ? 'border-red-300' : 'border-genesis-border'
          }`}
        />
        {errors.indicacaoClinica && (
          <p className="text-xs text-red-500 mt-1">{errors.indicacaoClinica}</p>
        )}
      </div>
    </div>
  );
}
