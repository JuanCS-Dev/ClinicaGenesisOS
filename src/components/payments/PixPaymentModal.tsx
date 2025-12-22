/**
 * PIX Payment Modal
 * =================
 *
 * Modal for creating and tracking PIX payments.
 * Supports both creating new payments and viewing existing ones.
 *
 * Fase 10: PIX Integration
 */

import React, { useState, useCallback } from 'react';
import { X, QrCode, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useCreatePixPayment, usePayment } from '../../hooks/usePayment';
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#32D583]/10 flex items-center justify-center">
              <QrCode className="w-5 h-5 text-[#32D583]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {step === 'form' && 'Novo Pagamento PIX'}
                {step === 'payment' && 'Aguardando Pagamento'}
                {step === 'success' && 'Pagamento Confirmado'}
              </h2>
              {patient && (
                <p className="text-sm text-gray-500">{patient.name}</p>
              )}
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step: Form */}
          {step === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    R$
                  </span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#32D583]/20 focus:border-[#32D583] outline-none text-lg font-medium"
                    placeholder="0,00"
                    min="1"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição *
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#32D583]/20 focus:border-[#32D583] outline-none"
                  placeholder="Ex: Consulta médica"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email para comprovante (opcional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#32D583]/20 focus:border-[#32D583] outline-none"
                  placeholder="paciente@email.com"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={creating || amount <= 0}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#32D583] text-white rounded-xl font-medium hover:bg-[#2BBF76] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Gerando PIX...
                  </>
                ) : (
                  <>
                    <QrCode className="w-5 h-5" />
                    Gerar QR Code PIX
                  </>
                )}
              </button>
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
              <div className="w-20 h-20 rounded-full bg-[#32D583] flex items-center justify-center mb-6">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Pagamento Confirmado!
              </h3>
              <p className="text-3xl font-bold text-[#32D583] mb-4">
                {formatPaymentAmount(Math.round(amount * 100))}
              </p>
              <p className="text-gray-500 text-center mb-6">
                O pagamento foi recebido com sucesso.
              </p>
              <button
                onClick={handleClose}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Fechar
              </button>
            </div>
          )}
        </div>

        {/* Footer info */}
        {step === 'form' && (
          <div className="px-6 pb-6">
            <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
              <QrCode className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-gray-500">
                O código PIX será gerado e ficará válido por 60 minutos.
                O paciente poderá pagar escaneando o QR Code ou copiando o código.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PixPaymentModal;

