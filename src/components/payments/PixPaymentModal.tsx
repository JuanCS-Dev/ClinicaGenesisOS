/**
 * PIX Payment Modal
 * =================
 *
 * Modal for creating and tracking PIX payments.
 * Supports both creating new payments and viewing existing ones.
 *
 * Fase 10: PIX Integration
 * Migrated to Design System - Fase 16.5
 */

import React, { useState, useCallback } from 'react';
import { QrCode, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Modal, Button, Input, Card } from '@/design-system';
import { useCreatePixPayment } from '../../hooks/usePayment';
import { PixPayment } from './PixPayment';
import { formatPaymentAmount, type CreatePixPaymentInput } from '@/types';

/**
 * Props for PixPaymentModal component.
 */
interface PixPaymentModalProps {
  /** Whether modal is open */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** Pre-filled patient info */
  patient?: {
    id: string;
    name: string;
    email?: string;
  };
  /** Pre-filled appointment ID */
  appointmentId?: string;
  /** Pre-filled transaction ID */
  transactionId?: string;
  /** Pre-filled amount in cents */
  initialAmount?: number;
  /** Pre-filled description */
  initialDescription?: string;
  /** Callback when payment is completed */
  onComplete?: () => void;
}

/**
 * Steps in the payment flow.
 */
type Step = 'form' | 'payment' | 'success';

/**
 * PIX payment modal component.
 */
export const PixPaymentModal: React.FC<PixPaymentModalProps> = ({
  isOpen,
  onClose,
  patient,
  appointmentId,
  transactionId,
  initialAmount,
  initialDescription,
  onComplete,
}) => {
  const [step, setStep] = useState<Step>('form');
  const [amount, setAmount] = useState(initialAmount ? initialAmount / 100 : 0);
  const [description, setDescription] = useState(
    initialDescription || (patient ? `Pagamento - ${patient.name}` : '')
  );
  const [email, setEmail] = useState(patient?.email || '');

  const { createPayment, creating, paymentIntent, error, reset } =
    useCreatePixPayment();

  // Handle form submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (amount <= 0) return;

      const input: CreatePixPaymentInput = {
        method: 'pix',
        amount: Math.round(amount * 100), // Convert to cents
        description,
        patientId: patient?.id,
        patientName: patient?.name,
        appointmentId,
        transactionId,
        customerEmail: email || undefined,
      };

      try {
        await createPayment(input);
        setStep('payment');
      } catch (err) {
        // Error is handled in the hook
        console.error('Payment creation failed:', err);
      }
    },
    [
      amount,
      description,
      patient,
      appointmentId,
      transactionId,
      email,
      createPayment,
    ]
  );

  // Handle payment completion
  const handleComplete = useCallback(() => {
    setStep('success');
    onComplete?.();
  }, [onComplete]);

  // Handle retry
  const handleRetry = useCallback(() => {
    reset();
    setStep('form');
  }, [reset]);

  // Handle close
  const handleClose = useCallback(() => {
    reset();
    setStep('form');
    setAmount(initialAmount ? initialAmount / 100 : 0);
    setDescription(initialDescription || '');
    onClose();
  }, [reset, initialAmount, initialDescription, onClose]);

  // Get modal title based on step
  const getTitle = () => {
    if (step === 'form') return 'Novo Pagamento PIX';
    if (step === 'payment') return 'Aguardando Pagamento';
    return 'Pagamento Confirmado';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={getTitle()}
      description={patient ? `Paciente: ${patient.name}` : undefined}
      size="md"
    >
      {/* Step: Form */}
      {step === 'form' && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-genesis-text)] mb-1.5">
              Valor *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-genesis-muted)]">
                R$
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full pl-10 pr-4 py-3 border border-[var(--color-genesis-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-genesis-primary)] focus:border-[var(--color-genesis-primary)] outline-none text-lg font-medium bg-[var(--color-genesis-surface)]"
                placeholder="0,00"
                min="1"
                step="0.01"
                required
              />
            </div>
          </div>

          {/* Description */}
          <Input
            label="Descrição *"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: Consulta médica"
            required
          />

          {/* Email */}
          <Input
            label="Email para comprovante (opcional)"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="paciente@email.com"
          />

          {/* Error */}
          {error && (
            <Card padding="sm" className="bg-[var(--color-danger-soft)] border-[var(--color-danger)]">
              <div className="flex items-center gap-2 text-[var(--color-danger)]">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            </Card>
          )}

          {/* Submit */}
          <Button
            type="submit"
            variant="primary"
            loading={creating}
            disabled={amount <= 0}
            fullWidth
            leftIcon={<QrCode className="w-5 h-5" />}
          >
            {creating ? 'Gerando PIX...' : 'Gerar QR Code PIX'}
          </Button>

          {/* Info */}
          <Card padding="sm" className="bg-[var(--color-genesis-soft)]">
            <div className="flex items-start gap-2">
              <QrCode className="w-4 h-4 text-[var(--color-genesis-muted)] mt-0.5 flex-shrink-0" />
              <p className="text-xs text-[var(--color-genesis-muted)]">
                O código PIX será gerado e ficará válido por 60 minutos.
                O paciente poderá pagar escaneando o QR Code ou copiando o código.
              </p>
            </div>
          </Card>
        </form>
      )}

      {/* Step: Payment */}
      {step === 'payment' && paymentIntent && (
        <PixPayment
          paymentId={paymentIntent.id}
          onComplete={handleComplete}
          onExpire={handleRetry}
          onRetry={handleRetry}
        />
      )}

      {/* Step: Success */}
      {step === 'success' && (
        <div className="flex flex-col items-center py-8">
          <div className="w-20 h-20 rounded-full bg-[var(--color-success)] flex items-center justify-center mb-6">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-[var(--color-genesis-dark)] mb-2">
            Pagamento Confirmado!
          </h3>
          <p className="text-3xl font-bold text-[var(--color-success)] mb-4">
            {formatPaymentAmount(Math.round(amount * 100))}
          </p>
          <p className="text-[var(--color-genesis-muted)] text-center mb-6">
            O pagamento foi recebido com sucesso.
          </p>
          <Button variant="secondary" onClick={handleClose}>
            Fechar
          </Button>
        </div>
      )}
    </Modal>
  );
};

export default PixPaymentModal;
