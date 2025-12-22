/**
 * Booking UI Components
 *
 * Reusable UI components for the public booking flow.
 * Includes step indicator, patient form, and booking summary.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Calendar,
  Mail,
  Phone,
  CheckCircle2,
  Building2,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { PublicProfessional } from './ProfessionalSelector';

// ============================================================================
// Types
// ============================================================================

/**
 * Booking step identifier.
 */
export type BookingStep = 'professional' | 'datetime' | 'info' | 'confirm';

/**
 * Patient info for booking.
 */
export interface PatientInfo {
  name: string;
  phone: string;
  email: string;
  notes?: string;
}

/**
 * Clinic data for display.
 */
export interface ClinicInfo {
  id: string;
  name: string;
  address: string;
  phone: string;
  logo?: string;
}

// ============================================================================
// StepIndicator
// ============================================================================

interface StepConfig {
  key: BookingStep;
  label: string;
  icon: React.ElementType;
}

const STEPS: StepConfig[] = [
  { key: 'professional', label: 'Profissional', icon: User },
  { key: 'datetime', label: 'Data e Hora', icon: Calendar },
  { key: 'info', label: 'Seus Dados', icon: Mail },
  { key: 'confirm', label: 'Confirmação', icon: CheckCircle2 },
];

interface StepIndicatorProps {
  currentStep: BookingStep;
  onStepClick?: (step: BookingStep) => void;
}

/**
 * Multi-step progress indicator.
 */
export const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  onStepClick,
}) => {
  const currentIndex = STEPS.findIndex((s) => s.key === currentStep);

  return (
    <div className="flex items-center justify-between mb-8">
      {STEPS.map((step, index) => {
        const Icon = step.icon;
        const isActive = step.key === currentStep;
        const isCompleted = index < currentIndex;
        const canClick = isCompleted && onStepClick;

        return (
          <React.Fragment key={step.key}>
            <button
              onClick={() => canClick && onStepClick(step.key)}
              disabled={!canClick}
              className={`
                flex flex-col items-center gap-2 transition-all
                ${canClick ? 'cursor-pointer' : 'cursor-default'}
              `}
            >
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center transition-all
                  ${
                    isActive
                      ? 'bg-genesis-primary text-white'
                      : isCompleted
                        ? 'bg-emerald-500 text-white'
                        : 'bg-genesis-soft text-genesis-muted'
                  }
                `}
              >
                {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
              </div>
              <span
                className={`
                  text-xs font-medium hidden sm:block
                  ${isActive ? 'text-genesis-primary' : 'text-genesis-muted'}
                `}
              >
                {step.label}
              </span>
            </button>

            {index < STEPS.length - 1 && (
              <div
                className={`
                  flex-1 h-0.5 mx-2 rounded
                  ${index < currentIndex ? 'bg-emerald-500' : 'bg-genesis-soft'}
                `}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ============================================================================
// PatientInfoForm
// ============================================================================

interface PatientInfoFormProps {
  info: PatientInfo;
  onChange: (info: PatientInfo) => void;
  errors: Partial<Record<keyof PatientInfo, string>>;
}

/**
 * Patient information form.
 */
export const PatientInfoForm: React.FC<PatientInfoFormProps> = ({ info, onChange, errors }) => {
  const handleChange = (field: keyof PatientInfo, value: string) => {
    onChange({ ...info, [field]: value });
  };

  const inputBaseClass = `
    w-full px-4 py-3 rounded-xl border bg-genesis-bg
    text-genesis-dark placeholder-genesis-muted
    focus:outline-none focus:ring-2 focus:ring-genesis-primary focus:border-transparent
  `;

  return (
    <div className="space-y-4">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-genesis-dark mb-2">Nome completo *</label>
        <input
          type="text"
          value={info.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Seu nome completo"
          className={`${inputBaseClass} ${errors.name ? 'border-red-500' : 'border-genesis-border'}`}
        />
        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium text-genesis-dark mb-2">
          WhatsApp / Telefone *
        </label>
        <div className="relative">
          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-genesis-muted" />
          <input
            type="tel"
            value={info.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="(11) 99999-9999"
            className={`${inputBaseClass} pl-11 ${errors.phone ? 'border-red-500' : 'border-genesis-border'}`}
          />
        </div>
        {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-genesis-dark mb-2">E-mail *</label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-genesis-muted" />
          <input
            type="email"
            value={info.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="seu@email.com"
            className={`${inputBaseClass} pl-11 ${errors.email ? 'border-red-500' : 'border-genesis-border'}`}
          />
        </div>
        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-genesis-dark mb-2">
          Observações (opcional)
        </label>
        <textarea
          value={info.notes || ''}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="Informe algo que o profissional deva saber antes da consulta..."
          rows={3}
          className={`${inputBaseClass} resize-none border-genesis-border`}
        />
      </div>
    </div>
  );
};

// ============================================================================
// BookingSummary
// ============================================================================

interface BookingSummaryProps {
  professional: PublicProfessional;
  datetime: string;
  patient: PatientInfo;
  clinic: ClinicInfo;
}

/**
 * Booking confirmation summary.
 */
export const BookingSummary: React.FC<BookingSummaryProps> = ({
  professional,
  datetime,
  patient,
  clinic,
}) => {
  return (
    <div className="space-y-6">
      {/* Success message */}
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="text-xl font-bold text-genesis-dark mb-2">Agendamento Confirmado!</h2>
        <p className="text-genesis-muted">Enviamos os detalhes para seu e-mail e WhatsApp.</p>
      </div>

      {/* Booking details */}
      <div className="bg-genesis-soft rounded-2xl p-6 space-y-4">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-lg bg-genesis-surface">
            <Calendar className="w-5 h-5 text-genesis-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-genesis-dark">
              {format(new Date(datetime), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
            <p className="text-sm text-genesis-muted">{format(new Date(datetime), 'HH:mm')}</p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="p-2 rounded-lg bg-genesis-surface">
            <User className="w-5 h-5 text-genesis-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-genesis-dark">{professional.name}</p>
            <p className="text-sm text-genesis-muted capitalize">{professional.specialty}</p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="p-2 rounded-lg bg-genesis-surface">
            <Building2 className="w-5 h-5 text-genesis-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-genesis-dark">{clinic.name}</p>
            <p className="text-sm text-genesis-muted">{clinic.address}</p>
          </div>
        </div>
      </div>

      {/* Patient info */}
      <div className="bg-genesis-surface rounded-2xl p-6 border border-genesis-border-subtle">
        <h3 className="font-semibold text-genesis-dark mb-4">Seus Dados</h3>
        <div className="space-y-2 text-sm">
          <p>
            <span className="text-genesis-muted">Nome:</span>{' '}
            <span className="text-genesis-dark">{patient.name}</span>
          </p>
          <p>
            <span className="text-genesis-muted">Telefone:</span>{' '}
            <span className="text-genesis-dark">{patient.phone}</span>
          </p>
          <p>
            <span className="text-genesis-muted">E-mail:</span>{' '}
            <span className="text-genesis-dark">{patient.email}</span>
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button className="flex-1 px-6 py-3 bg-genesis-primary text-white rounded-xl font-medium hover:bg-genesis-primary-dark transition-colors">
          Adicionar ao Calendário
        </button>
        <Link
          to="/"
          className="flex-1 px-6 py-3 bg-genesis-soft text-genesis-dark rounded-xl font-medium hover:bg-genesis-hover transition-colors text-center"
        >
          Voltar ao Início
        </Link>
      </div>
    </div>
  );
};
