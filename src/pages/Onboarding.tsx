/**
 * Onboarding Page
 *
 * Wizard for setting up a new clinic after user registration.
 * Steps:
 * 1. Clinic basic info (name, phone, address)
 * 2. Specialties offered
 * 3. Working hours and settings
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  Building2,
  Phone,
  MapPin,
  Stethoscope,
  Apple,
  Brain,
  Clock,
  Check,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { useClinicContext } from '../contexts/ClinicContext';
import type { SpecialtyType, ClinicSettings, CreateClinicInput } from '@/types';

interface StepProps {
  isActive: boolean;
  isCompleted: boolean;
  number: number;
  title: string;
}

function StepIndicator({ isActive, isCompleted, number, title }: StepProps) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
          isCompleted
            ? 'bg-green-500 text-white'
            : isActive
              ? 'bg-genesis-blue text-white'
              : 'bg-gray-200 text-gray-500'
        }`}
      >
        {isCompleted ? <Check className="w-5 h-5" /> : number}
      </div>
      <span
        className={`hidden sm:block font-medium transition-colors ${
          isActive ? 'text-genesis-dark' : 'text-gray-400'
        }`}
      >
        {title}
      </span>
    </div>
  );
}

const SPECIALTIES: Array<{
  id: SpecialtyType;
  name: string;
  icon: React.ElementType;
  color: string;
}> = [
  { id: 'medicina', name: 'Medicina', icon: Stethoscope, color: 'bg-blue-500' },
  { id: 'nutricao', name: 'Nutrição', icon: Apple, color: 'bg-green-500' },
  { id: 'psicologia', name: 'Psicologia', icon: Brain, color: 'bg-purple-500' },
];

export function Onboarding() {
  const navigate = useNavigate();
  const { createClinic } = useClinicContext();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Basic info
  const [clinicName, setClinicName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // Step 2: Specialties
  const [selectedSpecialties, setSelectedSpecialties] = useState<SpecialtyType[]>(['medicina']);

  // Step 3: Working hours
  const [workStart, setWorkStart] = useState('08:00');
  const [workEnd, setWorkEnd] = useState('18:00');
  const [appointmentDuration, setAppointmentDuration] = useState(30);
  const [seedData, setSeedData] = useState(true);

  const toggleSpecialty = (specialty: SpecialtyType) => {
    setSelectedSpecialties((prev) =>
      prev.includes(specialty)
        ? prev.filter((s) => s !== specialty)
        : [...prev, specialty]
    );
  };

  const canProceedStep1 = clinicName.trim().length >= 3;
  const canProceedStep2 = selectedSpecialties.length > 0;

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const settings: ClinicSettings = {
        workingHours: {
          start: workStart,
          end: workEnd,
        },
        defaultAppointmentDuration: appointmentDuration,
        specialties: selectedSpecialties,
        timezone: 'America/Sao_Paulo',
      };

      const clinicData: CreateClinicInput = {
        name: clinicName,
        phone: phone || undefined,
        address: address || undefined,
        plan: 'solo',
        settings,
      };

      await createClinic(clinicData, seedData);
      navigate('/dashboard');
    } catch (err) {
      console.error('Error creating clinic:', err);
      setError(err instanceof Error ? err.message : 'Erro ao criar clínica');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-genesis-soft via-white to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-genesis-dark rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold text-genesis-dark">CLÍNICA GENESIS</span>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <StepIndicator
            number={1}
            title="Dados da Clínica"
            isActive={step === 1}
            isCompleted={step > 1}
          />
          <div className="flex-1 h-1 bg-gray-200 mx-4 rounded">
            <div
              className={`h-full bg-genesis-blue rounded transition-all ${
                step > 1 ? 'w-full' : 'w-0'
              }`}
            />
          </div>
          <StepIndicator
            number={2}
            title="Especialidades"
            isActive={step === 2}
            isCompleted={step > 2}
          />
          <div className="flex-1 h-1 bg-gray-200 mx-4 rounded">
            <div
              className={`h-full bg-genesis-blue rounded transition-all ${
                step > 2 ? 'w-full' : 'w-0'
              }`}
            />
          </div>
          <StepIndicator
            number={3}
            title="Configurações"
            isActive={step === 3}
            isCompleted={false}
          />
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-genesis-dark">
                  Vamos configurar sua clínica
                </h2>
                <p className="text-genesis-medium mt-2">
                  Preencha os dados básicos para começar
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="clinicName" className="block text-sm font-semibold text-genesis-dark mb-2">
                    Nome da Clínica *
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-genesis-medium" />
                    <input
                      id="clinicName"
                      type="text"
                      value={clinicName}
                      onChange={(e) => setClinicName(e.target.value)}
                      placeholder="Ex: Clínica São Paulo"
                      className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-genesis-dark placeholder-genesis-medium/50 focus:outline-none focus:ring-2 focus:ring-genesis-blue/20 focus:border-genesis-blue transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-genesis-dark mb-2">
                    Telefone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-genesis-medium" />
                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(11) 99999-9999"
                      className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-genesis-dark placeholder-genesis-medium/50 focus:outline-none focus:ring-2 focus:ring-genesis-blue/20 focus:border-genesis-blue transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-semibold text-genesis-dark mb-2">
                    Endereço
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-genesis-medium" />
                    <input
                      id="address"
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Rua, número - Cidade, Estado"
                      className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-genesis-dark placeholder-genesis-medium/50 focus:outline-none focus:ring-2 focus:ring-genesis-blue/20 focus:border-genesis-blue transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Specialties */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-genesis-dark">
                  Quais especialidades você oferece?
                </h2>
                <p className="text-genesis-medium mt-2">
                  Selecione uma ou mais especialidades
                </p>
              </div>

              <div className="grid gap-4">
                {SPECIALTIES.map(({ id, name, icon: Icon, color }) => {
                  const isSelected = selectedSpecialties.includes(id);
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => toggleSpecialty(id)}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                        isSelected
                          ? 'border-genesis-blue bg-genesis-blue/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <span className="font-semibold text-genesis-dark flex-1 text-left">
                        {name}
                      </span>
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          isSelected
                            ? 'border-genesis-blue bg-genesis-blue'
                            : 'border-gray-300'
                        }`}
                      >
                        {isSelected && <Check className="w-4 h-4 text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Settings */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-genesis-dark">
                  Configurações de funcionamento
                </h2>
                <p className="text-genesis-medium mt-2">
                  Defina o horário de atendimento
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="workStart" className="block text-sm font-semibold text-genesis-dark mb-2">
                      Horário de Início
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-genesis-medium" />
                      <input
                        id="workStart"
                        type="time"
                        value={workStart}
                        onChange={(e) => setWorkStart(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-genesis-dark focus:outline-none focus:ring-2 focus:ring-genesis-blue/20 focus:border-genesis-blue transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="workEnd" className="block text-sm font-semibold text-genesis-dark mb-2">
                      Horário de Término
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-genesis-medium" />
                      <input
                        id="workEnd"
                        type="time"
                        value={workEnd}
                        onChange={(e) => setWorkEnd(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-genesis-dark focus:outline-none focus:ring-2 focus:ring-genesis-blue/20 focus:border-genesis-blue transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="duration" className="block text-sm font-semibold text-genesis-dark mb-2">
                    Duração padrão das consultas
                  </label>
                  <select
                    id="duration"
                    value={appointmentDuration}
                    onChange={(e) => setAppointmentDuration(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-genesis-dark focus:outline-none focus:ring-2 focus:ring-genesis-blue/20 focus:border-genesis-blue transition-all"
                  >
                    <option value={15}>15 minutos</option>
                    <option value={20}>20 minutos</option>
                    <option value={30}>30 minutos</option>
                    <option value={45}>45 minutos</option>
                    <option value={50}>50 minutos</option>
                    <option value={60}>1 hora</option>
                  </select>
                </div>

                <div className="pt-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={seedData}
                      onChange={(e) => setSeedData(e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 text-genesis-blue focus:ring-genesis-blue"
                    />
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-500" />
                      <span className="text-sm text-genesis-dark">
                        Adicionar dados de demonstração para explorar o sistema
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={handleBack}
              disabled={step === 1}
              className="flex items-center gap-2 px-6 py-3 text-genesis-medium font-medium hover:text-genesis-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
              Voltar
            </button>

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={(step === 1 && !canProceedStep1) || (step === 2 && !canProceedStep2)}
                className="flex items-center gap-2 px-6 py-3 bg-genesis-blue text-white font-semibold rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continuar
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-8 py-3 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Criar Clínica
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
