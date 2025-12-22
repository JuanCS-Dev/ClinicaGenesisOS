/**
 * PIX Payment Component
 * =====================
 *
 * Displays PIX QR code for payment with countdown timer.
 * Shows different states: loading, QR code, paid, expired.
 *
 * Fase 10: PIX Integration
 */

import React, { useState, useCallback } from 'react';
import {
  QrCode,
  Copy,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  Loader2,
  Smartphone,
} from 'lucide-react';
import { usePayment } from '../../hooks/usePayment';
import { formatPaymentAmount, PAYMENT_STATUS_LABELS } from '@/types';

/**
 * Props for PixPayment component.
 */
interface PixPaymentProps {
  /** Payment document ID to track */
  paymentId: string;
  /** Callback when payment is completed */
  onComplete?: () => void;
  /** Callback when payment expires */
  onExpire?: () => void;
  /** Callback to create a new payment */
  onRetry?: () => void;
  /** Whether to show compact version */
  compact?: boolean;
}

/**
 * PIX Payment component with QR code and real-time status tracking.
 *
 * @example
 * ```tsx
 * <PixPayment
 *   paymentId="payment123"
 *   onComplete={() => toast.success('Pagamento recebido!')}
 *   onExpire={() => setShowRetryButton(true)}
 * />
 * ```
 */
export const PixPayment: React.FC<PixPaymentProps> = ({
  paymentId,
  onComplete,
  onExpire,
  onRetry,
  compact = false,
}) => {
  const { payment, loading, timeRemaining, isExpired } = usePayment(paymentId);
  const [copied, setCopied] = useState(false);

  // Handle copy to clipboard
  const handleCopy = useCallback(async () => {
    if (!payment?.pixData?.qrCodeText) return;

    try {
      await navigator.clipboard.writeText(payment.pixData.qrCodeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }, [payment?.pixData?.qrCodeText]);

  // Call callbacks on status change
  React.useEffect(() => {
    if (payment?.status === 'paid' && onComplete) {
      onComplete();
    }
    if (isExpired && onExpire) {
      onExpire();
    }
  }, [payment?.status, isExpired, onComplete, onExpire]);

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-[#32D583]" />
        <p className="mt-4 text-sm text-gray-500">Carregando pagamento...</p>
      </div>
    );
  }

  // Payment not found
  if (!payment) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <AlertCircle className="w-12 h-12 text-gray-400" />
        <p className="mt-4 text-sm text-gray-500">Pagamento não encontrado</p>
      </div>
    );
  }

  // Payment completed
  if (payment.status === 'paid') {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-[#ECFDF3] rounded-2xl">
        <div className="w-16 h-16 rounded-full bg-[#32D583] flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-white" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-[#027A48]">
          Pagamento Confirmado!
        </h3>
        <p className="mt-2 text-sm text-[#027A48]">
          {formatPaymentAmount(payment.amount)}
        </p>
        {payment.receiptUrl && (
          <a
            href={payment.receiptUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 text-sm text-[#32D583] hover:underline"
          >
            Ver comprovante
          </a>
        )}
      </div>
    );
  }

  // Payment expired
  if (isExpired || payment.status === 'expired') {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-2xl">
        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
          <Clock className="w-8 h-8 text-gray-500" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-gray-700">
          PIX Expirado
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          O tempo para pagamento expirou
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-4 flex items-center gap-2 px-4 py-2 bg-[#32D583] text-white rounded-lg hover:bg-[#2BBF76] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Gerar novo PIX
          </button>
        )}
      </div>
    );
  }

  // Payment failed
  if (payment.status === 'failed') {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-red-50 rounded-2xl">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-red-700">
          Pagamento Falhou
        </h3>
        <p className="mt-2 text-sm text-red-500">
          {payment.failureReason || 'Erro no processamento do pagamento'}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-4 flex items-center gap-2 px-4 py-2 bg-[#32D583] text-white rounded-lg hover:bg-[#2BBF76] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Tentar novamente
          </button>
        )}
      </div>
    );
  }

  // Active PIX payment - show QR code
  const qrCodeImage = payment.pixData?.qrCodeImage;
  const qrCodeText = payment.pixData?.qrCodeText;

  if (compact) {
    return (
      <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100">
        {qrCodeImage && (
          <img
            src={qrCodeImage}
            alt="QR Code PIX"
            className="w-20 h-20 rounded-lg"
          />
        )}
        <div className="flex-1">
          <p className="font-semibold text-gray-900">
            {formatPaymentAmount(payment.amount)}
          </p>
          {timeRemaining && (
            <p className="text-sm text-amber-600">
              Expira em {timeRemaining.minutes}:{String(timeRemaining.seconds).padStart(2, '0')}
            </p>
          )}
          <button
            onClick={handleCopy}
            className="mt-2 text-sm text-[#32D583] hover:underline flex items-center gap-1"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-3 h-3" /> Copiado!
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" /> Copiar código
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 text-[#32D583]">
        <QrCode className="w-5 h-5" />
        <span className="font-medium">PIX</span>
      </div>

      {/* Amount */}
      <p className="mt-4 text-2xl font-bold text-gray-900">
        {formatPaymentAmount(payment.amount)}
      </p>

      {/* Timer */}
      {timeRemaining && (
        <div className="mt-2 flex items-center gap-2 text-amber-600">
          <Clock className="w-4 h-4" />
          <span className="text-sm font-medium">
            Expira em {timeRemaining.minutes}:{String(timeRemaining.seconds).padStart(2, '0')}
          </span>
        </div>
      )}

      {/* QR Code */}
      {qrCodeImage && (
        <div className="mt-6 p-4 bg-white rounded-xl border-2 border-gray-100">
          <img
            src={qrCodeImage}
            alt="QR Code PIX"
            className="w-48 h-48"
          />
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 w-full space-y-3">
        <div className="flex items-start gap-3 text-sm text-gray-600">
          <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
            <Smartphone className="w-3 h-3" />
          </div>
          <p>Abra o app do seu banco e escolha pagar com PIX</p>
        </div>
        <div className="flex items-start gap-3 text-sm text-gray-600">
          <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
            <QrCode className="w-3 h-3" />
          </div>
          <p>Escaneie o QR Code ou copie o código PIX abaixo</p>
        </div>
      </div>

      {/* Copy Button */}
      {qrCodeText && (
        <button
          onClick={handleCopy}
          className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200"
        >
          {copied ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-[#32D583]" />
              <span className="font-medium text-[#32D583]">Código copiado!</span>
            </>
          ) : (
            <>
              <Copy className="w-5 h-5" />
              <span className="font-medium">Copiar código PIX</span>
            </>
          )}
        </button>
      )}

      {/* Status indicator */}
      <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
        <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        <span>{PAYMENT_STATUS_LABELS[payment.status]}</span>
      </div>
    </div>
  );
};

export default PixPayment;

