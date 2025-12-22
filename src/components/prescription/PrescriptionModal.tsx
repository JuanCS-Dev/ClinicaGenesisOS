/**
 * PrescriptionModal Component
 *
 * Full-screen modal for creating and managing digital prescriptions.
 * Integrates with Memed SDK for medication search and digital signing.
 *
 * Flow:
 * 1. Search and add medications
 * 2. Configure dosage and instructions
 * 3. Preview prescription
 * 4. Sign digitally (e-CPF)
 * 5. Send to patient
 */

import { useState, useCallback, useMemo } from 'react';
import {
  X,
  Plus,
  ChevronLeft,
  ChevronRight,
  FileText,
  AlertCircle,
  Loader2,
  Send,
  BadgeCheck,
} from 'lucide-react';
import { MedicationForm } from './MedicationForm';
import { usePrescription } from '@/hooks/usePrescription';
import type {
  PrescriptionModalProps,
  PrescriptionMedication,
  MemedMedication,
  CreatePrescriptionInput,
} from '@/types';
import { toast } from 'sonner';

type ModalStep = 'medications' | 'preview' | 'success';

/**
 * Create empty medication entry.
 */
function createEmptyMedication(): PrescriptionMedication {
  return {
    id: `med-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: '',
    dosage: '',
    unit: 'comprimido',
    route: 'oral',
    frequency: '',
    duration: '',
    quantity: 1,
    isControlled: false,
    continuousUse: false,
  };
}

/**
 * PrescriptionModal - Main prescription creation interface.
 */
export function PrescriptionModal({
  isOpen,
  onClose,
  patientId,
  patientName,
  patientCpf,
  existingPrescription,
  onSave: _onSave,
}: PrescriptionModalProps) {
  const { createPrescription, signPrescription, sendToPatient } = usePrescription();

  const [step, setStep] = useState<ModalStep>('medications');
  const [medications, setMedications] = useState<PrescriptionMedication[]>(
    existingPrescription?.medications || [createEmptyMedication()]
  );
  const [observations, setObservations] = useState(existingPrescription?.observations || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdPrescriptionId, setCreatedPrescriptionId] = useState<string | null>(null);

  const isValid = useMemo(() => {
    return medications.every(
      (med) =>
        med.name.trim() &&
        med.dosage.trim() &&
        med.frequency.trim() &&
        med.duration.trim() &&
        med.quantity > 0
    );
  }, [medications]);

  const handleMedicationSelect = useCallback(
    (index: number, medication: MemedMedication) => {
      setMedications((prev) =>
        prev.map((med, i) =>
          i === index
            ? {
                ...med,
                memedId: medication.id,
                name: medication.name,
                activePrinciple: medication.activePrinciple,
                presentation: medication.presentation,
                isControlled: medication.isControlled,
                controlType: medication.controlType,
              }
            : med
        )
      );
    },
    []
  );

  const updateMedication = useCallback(
    (index: number, field: keyof PrescriptionMedication, value: unknown) => {
      setMedications((prev) =>
        prev.map((med, i) => (i === index ? { ...med, [field]: value } : med))
      );
    },
    []
  );

  const addMedication = useCallback(() => {
    setMedications((prev) => [...prev, createEmptyMedication()]);
  }, []);

  const removeMedication = useCallback((index: number) => {
    setMedications((prev) => {
      if (prev.length === 1) return [createEmptyMedication()];
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const handleCreate = useCallback(async () => {
    if (!isValid) return;
    setLoading(true);
    setError(null);

    try {
      const input: CreatePrescriptionInput = {
        patientId,
        patientName,
        patientCpf,
        type: 'common',
        medications,
        observations: observations || undefined,
        validityDays: 60,
      };

      const prescriptionId = await createPrescription(input);
      setCreatedPrescriptionId(prescriptionId);
      toast.success('Prescrição criada com sucesso');
      setStep('success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar prescrição';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [isValid, patientId, patientName, patientCpf, medications, observations, createPrescription]);

  const handleSign = useCallback(async () => {
    if (!createdPrescriptionId) return;
    setLoading(true);
    try {
      await signPrescription(createdPrescriptionId);
      toast.success('Prescrição assinada digitalmente');
    } catch {
      toast.error('Erro ao assinar prescrição');
    } finally {
      setLoading(false);
    }
  }, [createdPrescriptionId, signPrescription]);

  const handleSend = useCallback(async () => {
    if (!createdPrescriptionId) return;
    setLoading(true);
    try {
      await sendToPatient(createdPrescriptionId, 'whatsapp');
      toast.success('Prescrição enviada ao paciente');
      onClose();
    } catch {
      toast.error('Erro ao enviar prescrição');
    } finally {
      setLoading(false);
    }
  }, [createdPrescriptionId, sendToPatient, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="h-full flex items-center justify-center p-4">
        <div className="w-full max-w-4xl max-h-[90vh] bg-genesis-surface rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-genesis-border-subtle">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-xl">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="font-semibold text-genesis-dark text-lg">
                  {existingPrescription ? 'Editar Prescrição' : 'Nova Prescrição'}
                </h2>
                <p className="text-sm text-genesis-muted">{patientName}</p>
              </div>
            </div>

            {/* Steps indicator */}
            <div className="flex items-center gap-2">
              {(['medications', 'preview', 'success'] as const).map((s, i) => (
                <div key={s} className={`flex items-center ${i > 0 ? 'ml-2' : ''}`}>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step === s
                        ? 'bg-blue-600 text-white'
                        : i < ['medications', 'preview', 'success'].indexOf(step)
                          ? 'bg-emerald-500 text-white'
                          : 'bg-genesis-hover text-genesis-subtle'
                    }`}
                  >
                    {i + 1}
                  </div>
                  {i < 2 && <div className="w-8 h-0.5 bg-genesis-border-subtle mx-1" />}
                </div>
              ))}
            </div>

            <button onClick={onClose} className="p-2 hover:bg-genesis-hover rounded-lg transition-colors">
              <X className="w-5 h-5 text-genesis-muted" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {error && (
              <div className="mb-6 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {/* Step 1: Medications */}
            {step === 'medications' && (
              <div className="space-y-6">
                <h3 className="font-medium text-genesis-dark">Medicamentos</h3>

                {medications.map((med, index) => {
                  const key = med.id;
                  return (
                    <MedicationForm
                      key={key}
                      medication={med}
                      index={index}
                      onMedicationSelect={handleMedicationSelect}
                      onUpdate={updateMedication}
                      onRemove={removeMedication}
                    />
                  );
                })}

                <button
                  onClick={addMedication}
                  className="flex items-center gap-2 px-4 py-3 w-full border-2 border-dashed border-genesis-border hover:border-blue-400 rounded-xl text-genesis-medium hover:text-blue-600 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Adicionar medicamento
                </button>

                <div>
                  <label className="block text-sm font-medium text-genesis-text mb-1">
                    Observações gerais (opcional)
                  </label>
                  <textarea
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                    placeholder="Orientações adicionais para o paciente..."
                    rows={3}
                    className="w-full px-3 py-2 border border-genesis-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Preview */}
            {step === 'preview' && (
              <div className="space-y-6">
                <h3 className="font-medium text-genesis-dark">Revisar Prescrição</h3>

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-sm text-amber-800">
                    Revise cuidadosamente todos os medicamentos antes de criar a prescrição.
                  </p>
                </div>

                <div className="border border-genesis-border rounded-xl overflow-hidden">
                  <div className="p-4 bg-genesis-soft border-b border-genesis-border">
                    <h4 className="font-medium text-genesis-dark">{patientName}</h4>
                    {patientCpf && <p className="text-sm text-genesis-muted">CPF: {patientCpf}</p>}
                  </div>

                  <div className="p-4 space-y-3">
                    {medications.map((med, index) => (
                      <div key={med.id} className="p-3 bg-genesis-soft rounded-lg">
                        <div className="font-medium text-genesis-dark">
                          {med.name || `Medicamento ${index + 1}`}
                        </div>
                        <div className="text-sm text-genesis-medium">
                          {med.dosage} - {med.frequency} por {med.duration}
                        </div>
                        <div className="text-sm text-genesis-muted">
                          Quantidade: {med.quantity} {med.unit}
                        </div>
                      </div>
                    ))}
                  </div>

                  {observations && (
                    <div className="p-4 border-t border-genesis-border bg-genesis-soft">
                      <div className="text-sm font-medium text-genesis-text mb-1">Observações:</div>
                      <p className="text-genesis-medium">{observations}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Success */}
            {step === 'success' && (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-6 bg-emerald-100 rounded-full flex items-center justify-center">
                  <BadgeCheck className="w-10 h-10 text-emerald-600" />
                </div>

                <h3 className="text-2xl font-bold text-genesis-dark mb-2">Prescrição Criada!</h3>
                <p className="text-genesis-medium mb-8">
                  A prescrição foi salva. Você pode assinar e enviar ao paciente.
                </p>

                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={handleSign}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <BadgeCheck className="w-5 h-5" />}
                    Assinar Digitalmente
                  </button>

                  <button
                    onClick={handleSend}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    Enviar ao Paciente
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {step !== 'success' && (
            <div className="flex items-center justify-between p-6 border-t border-genesis-border-subtle bg-genesis-soft">
              {step === 'preview' ? (
                <button
                  onClick={() => setStep('medications')}
                  className="flex items-center gap-2 px-4 py-2.5 text-genesis-medium hover:text-genesis-dark"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Voltar
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-3">
                <button onClick={onClose} className="px-4 py-2.5 text-genesis-medium hover:text-genesis-dark">
                  Cancelar
                </button>

                {step === 'medications' && (
                  <button
                    onClick={() => setStep('preview')}
                    disabled={!isValid}
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Próximo
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}

                {step === 'preview' && (
                  <button
                    onClick={handleCreate}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
                    Criar Prescrição
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
