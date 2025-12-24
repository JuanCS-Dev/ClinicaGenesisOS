/**
 * Appointment Modal Component
 *
 * Premium modal for creating new appointments.
 * Features patient search, datetime selection, and validation.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { Calendar, Clock, User, Stethoscope, FileText, Search, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Modal } from '@/design-system';
import { usePatients } from '@/hooks/usePatients';
import { useAppointments } from '@/hooks/useAppointments';
import { useClinicContext } from '@/contexts/ClinicContext';
import { Status, type SpecialtyType, type CreateAppointmentInput } from '@/types';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: Date;
}

const PROCEDURES = [
  'Consulta',
  'Retorno',
  'Primeira Consulta',
  'Avaliação',
  'Acompanhamento',
  'Exame',
  'Procedimento',
];

const DURATIONS = [
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '1 hora' },
  { value: 90, label: '1h 30min' },
  { value: 120, label: '2 horas' },
];

export function AppointmentModal({ isOpen, onClose, initialDate }: AppointmentModalProps) {
  const { patients, loading: patientsLoading } = usePatients();
  const { addAppointment } = useAppointments();
  const { userProfile } = useClinicContext();

  // Form state
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<{ id: string; name: string; phone?: string } | null>(null);
  const [showPatientList, setShowPatientList] = useState(false);
  const [date, setDate] = useState(initialDate ? format(initialDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'));
  const [time, setTime] = useState('09:00');
  const [duration, setDuration] = useState(30);
  const [procedure, setProcedure] = useState('Consulta');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // Filter patients based on search
  const filteredPatients = useMemo(() => {
    if (!patientSearch.trim()) return patients.slice(0, 10);
    const search = patientSearch.toLowerCase();
    return patients
      .filter(p => p.name.toLowerCase().includes(search))
      .slice(0, 10);
  }, [patients, patientSearch]);

  // Reset form
  const resetForm = useCallback(() => {
    setPatientSearch('');
    setSelectedPatient(null);
    setShowPatientList(false);
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setTime('09:00');
    setDuration(30);
    setProcedure('Consulta');
    setNotes('');
  }, []);

  // Handle close
  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [onClose, resetForm]);

  // Handle patient selection
  const handleSelectPatient = useCallback((patient: { id: string; name: string; phone?: string }) => {
    setSelectedPatient(patient);
    setPatientSearch(patient.name);
    setShowPatientList(false);
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPatient) {
      toast.error('Selecione um paciente');
      return;
    }

    setSaving(true);

    try {
      const appointmentData: CreateAppointmentInput = {
        patientId: selectedPatient.id,
        patientName: selectedPatient.name,
        patientPhone: selectedPatient.phone,
        date: `${date}T${time}:00.000Z`,
        durationMin: duration,
        procedure,
        status: Status.PENDING,
        professional: userProfile?.displayName || 'Profissional',
        specialty: (userProfile?.specialty as SpecialtyType) || 'medicina',
        notes: notes.trim() || undefined,
      };

      await addAppointment(appointmentData);
      toast.success('Consulta agendada com sucesso!');
      handleClose();
    } catch (error) {
      console.error('Failed to create appointment:', error);
      toast.error('Erro ao agendar consulta');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Nova Consulta"
      size="lg"
      footer={
        <>
          <button
            type="button"
            onClick={handleClose}
            className="px-5 py-2.5 text-sm font-medium text-genesis-muted hover:text-genesis-dark hover:bg-genesis-hover rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="appointment-form"
            disabled={saving || !selectedPatient}
            className="flex items-center gap-2 px-6 py-2.5 bg-genesis-dark text-white rounded-xl text-sm font-bold hover:bg-black shadow-lg shadow-genesis-medium/30 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Agendar Consulta
              </>
            )}
          </button>
        </>
      }
    >
      <form id="appointment-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Patient Selection */}
        <div className="relative">
          <label className="block text-sm font-medium text-genesis-dark mb-2">
            <User className="w-4 h-4 inline-block mr-2 text-genesis-muted" />
            Paciente
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-genesis-muted" />
            <input
              type="text"
              value={patientSearch}
              onChange={(e) => {
                setPatientSearch(e.target.value);
                setSelectedPatient(null);
                setShowPatientList(true);
              }}
              onFocus={() => setShowPatientList(true)}
              placeholder="Buscar paciente..."
              className="w-full pl-10 pr-4 py-3 bg-genesis-surface border border-genesis-border rounded-xl text-genesis-dark placeholder:text-genesis-subtle focus:outline-none focus:ring-2 focus:ring-genesis-primary/20 focus:border-genesis-primary transition-all"
            />
            {selectedPatient && (
              <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
            )}
          </div>

          {/* Patient Dropdown */}
          {showPatientList && !selectedPatient && (
            <div className="absolute z-20 w-full mt-2 bg-genesis-surface border border-genesis-border rounded-xl shadow-xl max-h-60 overflow-auto">
              {patientsLoading ? (
                <div className="p-4 text-center">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto text-genesis-muted" />
                </div>
              ) : filteredPatients.length === 0 ? (
                <div className="p-4 text-center text-genesis-muted text-sm">
                  Nenhum paciente encontrado
                </div>
              ) : (
                filteredPatients.map((patient) => (
                  <button
                    key={patient.id}
                    type="button"
                    onClick={() => handleSelectPatient({ id: patient.id, name: patient.name, phone: patient.phone })}
                    className="w-full px-4 py-3 text-left hover:bg-genesis-hover transition-colors flex items-center gap-3 border-b border-genesis-border-subtle last:border-0"
                  >
                    <div className="w-8 h-8 rounded-full bg-genesis-primary/10 flex items-center justify-center text-xs font-bold text-genesis-primary">
                      {patient.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-genesis-dark text-sm">{patient.name}</p>
                      {patient.phone && (
                        <p className="text-xs text-genesis-muted">{patient.phone}</p>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Date & Time Row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-genesis-dark mb-2">
              <Calendar className="w-4 h-4 inline-block mr-2 text-genesis-muted" />
              Data
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 bg-genesis-surface border border-genesis-border rounded-xl text-genesis-dark focus:outline-none focus:ring-2 focus:ring-genesis-primary/20 focus:border-genesis-primary transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-genesis-dark mb-2">
              <Clock className="w-4 h-4 inline-block mr-2 text-genesis-muted" />
              Horário
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-4 py-3 bg-genesis-surface border border-genesis-border rounded-xl text-genesis-dark focus:outline-none focus:ring-2 focus:ring-genesis-primary/20 focus:border-genesis-primary transition-all"
            />
          </div>
        </div>

        {/* Duration & Procedure Row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-genesis-dark mb-2">
              <Clock className="w-4 h-4 inline-block mr-2 text-genesis-muted" />
              Duração
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full px-4 py-3 bg-genesis-surface border border-genesis-border rounded-xl text-genesis-dark focus:outline-none focus:ring-2 focus:ring-genesis-primary/20 focus:border-genesis-primary transition-all appearance-none cursor-pointer"
            >
              {DURATIONS.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-genesis-dark mb-2">
              <Stethoscope className="w-4 h-4 inline-block mr-2 text-genesis-muted" />
              Tipo
            </label>
            <select
              value={procedure}
              onChange={(e) => setProcedure(e.target.value)}
              className="w-full px-4 py-3 bg-genesis-surface border border-genesis-border rounded-xl text-genesis-dark focus:outline-none focus:ring-2 focus:ring-genesis-primary/20 focus:border-genesis-primary transition-all appearance-none cursor-pointer"
            >
              {PROCEDURES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-genesis-dark mb-2">
            <FileText className="w-4 h-4 inline-block mr-2 text-genesis-muted" />
            Observações (opcional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Informações adicionais sobre a consulta..."
            rows={3}
            className="w-full px-4 py-3 bg-genesis-surface border border-genesis-border rounded-xl text-genesis-dark placeholder:text-genesis-subtle focus:outline-none focus:ring-2 focus:ring-genesis-primary/20 focus:border-genesis-primary transition-all resize-none"
          />
        </div>

        {/* Summary */}
        {selectedPatient && (
          <div className="p-4 bg-genesis-soft rounded-xl border border-genesis-border-subtle">
            <p className="text-xs font-medium text-genesis-muted mb-2">Resumo</p>
            <p className="text-sm text-genesis-dark">
              <strong>{selectedPatient.name}</strong> • {procedure} • {format(new Date(`${date}T${time}`), "EEEE, d 'de' MMMM 'às' HH:mm", { locale: ptBR })} • {DURATIONS.find(d => d.value === duration)?.label}
            </p>
          </div>
        )}
      </form>
    </Modal>
  );
}

export default AppointmentModal;
