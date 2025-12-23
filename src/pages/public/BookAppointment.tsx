/**
 * BookAppointment Page (Public)
 *
 * Public appointment booking page - no login required.
 * Inspired by Zocdoc and Jane App booking flows.
 *
 * Flow:
 * 1. Select professional
 * 2. Choose date/time
 * 3. Fill patient info
 * 4. Confirm booking
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Loader2, Building2, MapPin } from 'lucide-react';
import { addDays, startOfDay } from 'date-fns';
import {
  ProfessionalSelector,
  AvailabilityCalendar,
  generateDaySlots,
  type PublicProfessional,
  type DayAvailability,
} from '@/components/booking';
import {
  StepIndicator,
  PatientInfoForm,
  BookingSummary,
  type BookingStep,
  type PatientInfo,
  type ClinicInfo,
} from '@/components/booking/BookingComponents';

// ============================================================================
// Mock Data (will be replaced with Firestore fetch)
// ============================================================================

const MOCK_CLINIC: ClinicInfo = {
  id: 'clinic-1',
  name: 'Clínica Genesis',
  address: 'Av. Paulista, 1000 - São Paulo, SP',
  phone: '(11) 4002-8922',
  logo: undefined,
};

const MOCK_PROFESSIONALS: PublicProfessional[] = [
  {
    id: 'prof-1',
    name: 'Dr. João Silva',
    specialty: 'medicina',
    bio: 'Clínico geral com 15 anos de experiência. Especialista em medicina preventiva.',
    rating: 4.9,
    reviewCount: 127,
    nextAvailable: 'Hoje, 14:00',
  },
  {
    id: 'prof-2',
    name: 'Dra. Maria Santos',
    specialty: 'nutricao',
    bio: 'Nutricionista esportiva e funcional. Atendimento personalizado.',
    rating: 4.8,
    reviewCount: 89,
    nextAvailable: 'Amanhã, 09:00',
  },
  {
    id: 'prof-3',
    name: 'Dr. Pedro Oliveira',
    specialty: 'psicologia',
    bio: 'Psicólogo clínico especializado em terapia cognitivo-comportamental.',
    rating: 5.0,
    reviewCount: 64,
    nextAvailable: 'Hoje, 16:00',
  },
];

// ============================================================================
// Validation
// ============================================================================

function validatePatientInfo(info: PatientInfo): Partial<Record<keyof PatientInfo, string>> {
  const errors: Partial<Record<keyof PatientInfo, string>> = {};

  if (!info.name.trim()) {
    errors.name = 'Nome é obrigatório';
  } else if (info.name.trim().length < 3) {
    errors.name = 'Nome deve ter pelo menos 3 caracteres';
  }

  if (!info.phone.trim()) {
    errors.phone = 'Telefone é obrigatório';
  } else if (!/^\(?[1-9]{2}\)?\s?9?[0-9]{4}-?[0-9]{4}$/.test(info.phone.replace(/\s/g, ''))) {
    errors.phone = 'Telefone inválido';
  }

  if (!info.email.trim()) {
    errors.email = 'E-mail é obrigatório';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(info.email)) {
    errors.email = 'E-mail inválido';
  }

  return errors;
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * Public booking page.
 */
export function BookAppointment(): React.ReactElement {
  // clinicSlug will be used to fetch clinic data from Firestore in production
  const { clinicSlug: _clinicSlug } = useParams<{ clinicSlug: string }>();

  // State
  const [step, setStep] = useState<BookingStep>('professional');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState<PublicProfessional | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [patientInfo, setPatientInfo] = useState<PatientInfo>({
    name: '',
    phone: '',
    email: '',
    notes: '',
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof PatientInfo, string>>>({});

  // Mock loading
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Generate availability for next 4 weeks
  const availability: DayAvailability[] = useMemo(() => {
    const days: DayAvailability[] = [];
    const today = startOfDay(new Date());

    for (let i = 0; i < 28; i++) {
      const date = addDays(today, i);
      const dayOfWeek = date.getDay();

      // Skip weekends
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;

      // Generate slots with some random booking
      const bookedSlots: string[] = [];
      const slots = generateDaySlots(date, undefined, bookedSlots);

      days.push({ date, slots });
    }

    return days;
  }, []);

  // Navigation handlers
  const canGoNext = useCallback((): boolean => {
    switch (step) {
      case 'professional':
        return selectedProfessional !== null;
      case 'datetime':
        return selectedSlot !== null;
      case 'info':
        return Object.keys(validatePatientInfo(patientInfo)).length === 0;
      default:
        return false;
    }
  }, [step, selectedProfessional, selectedSlot, patientInfo]);

  const goToNextStep = useCallback(() => {
    if (step === 'info') {
      const errors = validatePatientInfo(patientInfo);
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }
      setFormErrors({});
    }

    const steps: BookingStep[] = ['professional', 'datetime', 'info', 'confirm'];
    const currentIndex = steps.indexOf(step);

    if (step === 'info') {
      // Submit booking
      setSubmitting(true);
      setTimeout(() => {
        setSubmitting(false);
        setStep('confirm');
      }, 1500);
    } else if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
    }
  }, [step, patientInfo]);

  const goToPreviousStep = useCallback(() => {
    const steps: BookingStep[] = ['professional', 'datetime', 'info', 'confirm'];
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
    }
  }, [step]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-genesis-soft flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-genesis-primary animate-spin" />
          <span className="text-genesis-medium font-medium">Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-genesis-soft">
      {/* Header */}
      <header className="bg-genesis-surface border-b border-genesis-border-subtle sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              to={`/clinica/${_clinicSlug || 'clinica-genesis'}`}
              className="p-2 rounded-lg hover:bg-genesis-hover transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-genesis-dark" />
            </Link>
            <div className="flex items-center gap-3">
              {MOCK_CLINIC.logo ? (
                <img
                  src={MOCK_CLINIC.logo}
                  alt={MOCK_CLINIC.name}
                  className="w-10 h-10 rounded-lg object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-genesis-primary/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-genesis-primary" />
                </div>
              )}
              <div>
                <h1 className="font-semibold text-genesis-dark">{MOCK_CLINIC.name}</h1>
                <p className="text-xs text-genesis-muted flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {MOCK_CLINIC.address}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Step indicator */}
        <StepIndicator currentStep={step} onStepClick={setStep} />

        {/* Step content */}
        <div className="bg-genesis-surface rounded-2xl border border-genesis-border-subtle p-6">
          {/* Step 1: Professional */}
          {step === 'professional' && (
            <div>
              <h2 className="text-lg font-bold text-genesis-dark mb-4">
                Escolha o profissional
              </h2>
              <ProfessionalSelector
                professionals={MOCK_PROFESSIONALS}
                selectedId={selectedProfessional?.id}
                onSelect={setSelectedProfessional}
              />
            </div>
          )}

          {/* Step 2: Date/Time */}
          {step === 'datetime' && (
            <div>
              <h2 className="text-lg font-bold text-genesis-dark mb-4">
                Escolha data e horário
              </h2>
              <AvailabilityCalendar
                availability={availability}
                selectedSlot={selectedSlot || undefined}
                onSelectSlot={setSelectedSlot}
              />
            </div>
          )}

          {/* Step 3: Patient Info */}
          {step === 'info' && (
            <div>
              <h2 className="text-lg font-bold text-genesis-dark mb-4">Seus dados</h2>
              <PatientInfoForm info={patientInfo} onChange={setPatientInfo} errors={formErrors} />
            </div>
          )}

          {/* Step 4: Confirmation */}
          {step === 'confirm' && selectedProfessional && selectedSlot && (
            <BookingSummary
              professional={selectedProfessional}
              datetime={selectedSlot}
              patient={patientInfo}
              clinic={MOCK_CLINIC}
            />
          )}
        </div>

        {/* Navigation buttons */}
        {step !== 'confirm' && (
          <div className="flex justify-between mt-6">
            <button
              onClick={goToPreviousStep}
              disabled={step === 'professional'}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200
                ${
                  step === 'professional'
                    ? 'text-genesis-subtle cursor-not-allowed'
                    : 'text-genesis-dark hover:bg-genesis-hover hover:scale-[1.02] active:scale-[0.98]'
                }
              `}
            >
              <ArrowLeft className="w-5 h-5" />
              Voltar
            </button>

            <button
              onClick={goToNextStep}
              disabled={!canGoNext() || submitting}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200
                ${
                  canGoNext() && !submitting
                    ? 'bg-genesis-primary text-white hover:bg-genesis-primary-dark hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] shadow-lg shadow-genesis-primary/20'
                    : 'bg-genesis-soft text-genesis-subtle cursor-not-allowed'
                }
              `}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Agendando...
                </>
              ) : step === 'info' ? (
                'Confirmar Agendamento'
              ) : (
                <>
                  Continuar
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default BookAppointment;
