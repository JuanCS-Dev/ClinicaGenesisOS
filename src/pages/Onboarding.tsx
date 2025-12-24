import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ChevronRight, ChevronLeft, Loader2, Check } from 'lucide-react';
import { useClinicContext } from '../contexts/ClinicContext';
import type { SpecialtyType, ClinicSettings, CreateClinicInput } from '@/types';

import { StepIndicator } from '../components/onboarding/StepIndicator';
import { StepClinicInfo } from '../components/onboarding/StepClinicInfo';
import { StepSpecialties } from '../components/onboarding/StepSpecialties';
import { StepSettings } from '../components/onboarding/StepSettings';

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
      <div className="bg-genesis-surface border-b border-genesis-border-subtle">
        <div className="max-w-3xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-genesis-primary rounded-xl flex items-center justify-center">
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
          <div className="flex-1 h-1 bg-genesis-border-subtle mx-4 rounded">
            <div
              className={`h-full bg-genesis-primary rounded transition-all duration-500 ${
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
          <div className="flex-1 h-1 bg-genesis-border-subtle mx-4 rounded">
            <div
              className={`h-full bg-genesis-primary rounded transition-all duration-500 ${
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
        <div className="bg-genesis-surface rounded-2xl shadow-xl border border-genesis-border-subtle p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              {error}
            </div>
          )}

          {step === 1 && (
            <StepClinicInfo
              clinicName={clinicName}
              setClinicName={setClinicName}
              phone={phone}
              setPhone={setPhone}
              address={address}
              setAddress={setAddress}
            />
          )}

          {step === 2 && (
            <StepSpecialties
              selectedSpecialties={selectedSpecialties}
              toggleSpecialty={toggleSpecialty}
            />
          )}

          {step === 3 && (
            <StepSettings
              workStart={workStart}
              setWorkStart={setWorkStart}
              workEnd={workEnd}
              setWorkEnd={setWorkEnd}
              appointmentDuration={appointmentDuration}
              setAppointmentDuration={setAppointmentDuration}
              seedData={seedData}
              setSeedData={setSeedData}
            />
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-genesis-border-subtle">
            <button
              type="button"
              onClick={handleBack}
              disabled={step === 1}
              className="flex items-center gap-2 px-6 py-3 text-genesis-medium font-medium hover:text-genesis-dark transition-colors disabled:opacity-0 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
              Voltar
            </button>

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={(step === 1 && !canProceedStep1) || (step === 2 && !canProceedStep2)}
                className="flex items-center gap-2 px-6 py-3 bg-genesis-primary text-white font-semibold rounded-xl hover:bg-blue-600 transition-all hover:scale-105 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
              >
                Continuar
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-8 py-3 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition-all hover:scale-105 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed shadow-lg shadow-green-500/20"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Criando Clínica...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Finalizar Setup
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
