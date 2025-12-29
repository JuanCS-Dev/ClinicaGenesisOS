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
 *
 * @module pages/public/BookAppointment
 * @version 2.0.0
 */

import React, { useState, useMemo, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Loader2, Building2, MapPin, AlertCircle } from 'lucide-react'
import { addDays, startOfDay } from 'date-fns'
import {
  ProfessionalSelector,
  AvailabilityCalendar,
  generateDaySlots,
  type PublicProfessional,
  type DayAvailability,
} from '@/components/booking'
import {
  StepIndicator,
  PatientInfoForm,
  BookingSummary,
  type BookingStep,
  type PatientInfo,
} from '@/components/booking/BookingComponents'
import { usePublicClinicData } from '@/hooks/usePublicClinicData'
import { Skeleton } from '@/components/ui/Skeleton'

// ============================================================================
// Validation
// ============================================================================

function validatePatientInfo(info: PatientInfo): Partial<Record<keyof PatientInfo, string>> {
  const errors: Partial<Record<keyof PatientInfo, string>> = {}

  if (!info.name.trim()) {
    errors.name = 'Nome é obrigatório'
  } else if (info.name.trim().length < 3) {
    errors.name = 'Nome deve ter pelo menos 3 caracteres'
  }

  if (!info.phone.trim()) {
    errors.phone = 'Telefone é obrigatório'
  } else if (!/^\(?[1-9]{2}\)?\s?9?[0-9]{4}-?[0-9]{4}$/.test(info.phone.replace(/\s/g, ''))) {
    errors.phone = 'Telefone inválido'
  }

  if (!info.email.trim()) {
    errors.email = 'E-mail é obrigatório'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(info.email)) {
    errors.email = 'E-mail inválido'
  }

  return errors
}

// ============================================================================
// Components
// ============================================================================

function BookingSkeleton() {
  return (
    <div className="min-h-screen bg-genesis-soft">
      {/* Header Skeleton */}
      <header className="bg-genesis-surface border-b border-genesis-border-subtle sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Skeleton className="w-9 h-9 rounded-lg" />
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-lg" />
              <div>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-3 w-48 mt-1" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content Skeleton */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <Skeleton className="h-12 w-full rounded-xl mb-6" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </main>
    </div>
  )
}

function ClinicNotFound({ clinicSlug }: { clinicSlug?: string }) {
  return (
    <div className="min-h-screen bg-genesis-soft flex items-center justify-center p-4">
      <div className="bg-genesis-surface rounded-2xl border border-genesis-border p-8 text-center max-w-md">
        <AlertCircle className="w-12 h-12 text-danger mx-auto mb-4" />
        <h1 className="text-xl font-bold text-genesis-dark mb-2">Clínica não encontrada</h1>
        <p className="text-genesis-muted mb-6">
          {clinicSlug
            ? `Não foi possível encontrar a clínica "${clinicSlug}".`
            : 'O link de agendamento está incompleto.'}
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-genesis-primary text-white font-medium hover:bg-genesis-primary-dark transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar ao início
        </Link>
      </div>
    </div>
  )
}

function NoProfessionalsAvailable() {
  return (
    <div className="text-center py-8">
      <Building2 className="w-12 h-12 text-genesis-muted mx-auto mb-4" />
      <h3 className="font-medium text-genesis-dark mb-2">Nenhum profissional disponível</h3>
      <p className="text-sm text-genesis-muted">
        No momento não há profissionais cadastrados para agendamento online.
      </p>
    </div>
  )
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * Public booking page.
 */
export function BookAppointment(): React.ReactElement {
  const { clinicSlug } = useParams<{ clinicSlug: string }>()

  // Fetch clinic data from Firestore
  const { clinic, professionals, loading, notFound } = usePublicClinicData(clinicSlug)

  // Convert professionals to the format expected by ProfessionalSelector
  const publicProfessionals: PublicProfessional[] = useMemo(() => {
    return professionals.map(p => ({
      id: p.id,
      name: p.name,
      specialty: p.specialty,
      avatar: p.avatar,
      bio: p.bio,
      nextAvailable: p.nextAvailable,
    }))
  }, [professionals])

  // State
  const [step, setStep] = useState<BookingStep>('professional')
  const [submitting, setSubmitting] = useState(false)
  const [selectedProfessional, setSelectedProfessional] = useState<PublicProfessional | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [patientInfo, setPatientInfo] = useState<PatientInfo>({
    name: '',
    phone: '',
    email: '',
    notes: '',
  })
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof PatientInfo, string>>>({})

  // Generate availability for next 4 weeks
  const availability: DayAvailability[] = useMemo(() => {
    const days: DayAvailability[] = []
    const today = startOfDay(new Date())

    for (let i = 0; i < 28; i++) {
      const date = addDays(today, i)
      const dayOfWeek = date.getDay()

      // Skip weekends
      if (dayOfWeek === 0 || dayOfWeek === 6) continue

      // Generate slots with some random booking
      const bookedSlots: string[] = []
      const slots = generateDaySlots(date, undefined, bookedSlots)

      days.push({ date, slots })
    }

    return days
  }, [])

  // Navigation handlers
  const canGoNext = useCallback((): boolean => {
    switch (step) {
      case 'professional':
        return selectedProfessional !== null
      case 'datetime':
        return selectedSlot !== null
      case 'info':
        return Object.keys(validatePatientInfo(patientInfo)).length === 0
      default:
        return false
    }
  }, [step, selectedProfessional, selectedSlot, patientInfo])

  const goToNextStep = useCallback(() => {
    if (step === 'info') {
      const errors = validatePatientInfo(patientInfo)
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors)
        return
      }
      setFormErrors({})
    }

    const steps: BookingStep[] = ['professional', 'datetime', 'info', 'confirm']
    const currentIndex = steps.indexOf(step)

    if (step === 'info') {
      // Submit booking
      setSubmitting(true)
      setTimeout(() => {
        setSubmitting(false)
        setStep('confirm')
      }, 1500)
    } else if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1])
    }
  }, [step, patientInfo])

  const goToPreviousStep = useCallback(() => {
    const steps: BookingStep[] = ['professional', 'datetime', 'info', 'confirm']
    const currentIndex = steps.indexOf(step)
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1])
    }
  }, [step])

  // Loading state
  if (loading) {
    return <BookingSkeleton />
  }

  // Not found state
  if (notFound || !clinic) {
    return <ClinicNotFound clinicSlug={clinicSlug} />
  }

  // Build clinic info for BookingSummary
  const formatAddress = (addr: typeof clinic.address): string => {
    if (!addr) return ''
    if (typeof addr === 'string') return addr
    return `${addr.street}, ${addr.number}${addr.complement ? ` - ${addr.complement}` : ''}, ${addr.neighborhood}, ${addr.city} - ${addr.state}`
  }

  const clinicInfo = {
    id: clinic.id,
    name: clinic.name,
    address: formatAddress(clinic.address),
    phone: clinic.phone || '',
    logo: clinic.logo,
  }

  return (
    <div className="min-h-screen bg-genesis-soft">
      {/* Header */}
      <header className="bg-genesis-surface border-b border-genesis-border-subtle sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              to={`/clinica/${clinicSlug}`}
              className="p-2 rounded-lg hover:bg-genesis-hover transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-genesis-dark" />
            </Link>
            <div className="flex items-center gap-3">
              {clinic.logo ? (
                <img
                  src={clinic.logo}
                  alt={clinic.name}
                  loading="lazy"
                  className="w-10 h-10 rounded-lg object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-genesis-primary/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-genesis-primary" />
                </div>
              )}
              <div>
                <h1 className="font-semibold text-genesis-dark">{clinic.name}</h1>
                {clinic.address && (
                  <p className="text-xs text-genesis-muted flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {formatAddress(clinic.address)}
                  </p>
                )}
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
              <h2 className="text-lg font-bold text-genesis-dark mb-4">Escolha o profissional</h2>
              {publicProfessionals.length === 0 ? (
                <NoProfessionalsAvailable />
              ) : (
                <ProfessionalSelector
                  professionals={publicProfessionals}
                  selectedId={selectedProfessional?.id}
                  onSelect={setSelectedProfessional}
                />
              )}
            </div>
          )}

          {/* Step 2: Date/Time */}
          {step === 'datetime' && (
            <div>
              <h2 className="text-lg font-bold text-genesis-dark mb-4">Escolha data e horário</h2>
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
              clinic={clinicInfo}
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
  )
}

export default BookAppointment
