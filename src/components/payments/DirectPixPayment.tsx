/**
 * Direct PIX Payment Component
 * ============================
 *
 * Displays PIX QR code generated directly from clinic's PIX key.
 * No payment gateway - 0% fees!
 *
 * Features:
 * - QR code display
 * - Copy "Copia e Cola" button
 * - Manual confirmation button
 * - Amount display
 *
 * Fase 10: Payment Integration
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  QrCode,
  Copy,
  CheckCircle2,
  Loader2,
  Smartphone,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import {
  generateDirectPixQRCode,
  formatPixAmount,
  type DirectPixInput,
  type DirectPixResult,
} from '../../services/pix.service';

/**
 * Props for DirectPixPayment component.
 */
interface DirectPixPaymentProps {
  /** PIX configuration */
  pixConfig: {
    pixKey: string;
    pixKeyType: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';
    receiverName: string;
    receiverCity: string;
  };
  /** Amount in cents (optional - if not set, shows "valor a definir") */
  amountInCents?: number;
  /** Description for the payment */
  description?: string;
  /** Transaction ID for tracking */
  transactionId?: string;
  /** Callback when user confirms payment was made */
  onConfirmPayment?: () => void;
  /** Callback to regenerate QR code */
  onRegenerate?: () => void;
  /** Whether payment has been confirmed */
  isConfirmed?: boolean;
  /** Compact mode for smaller displays */
  compact?: boolean;
}

/**
 * Direct PIX Payment component with locally generated QR code.
 *
 * @example
 * ```tsx
 * <DirectPixPayment
 *   pixConfig={{
 *     pixKey: '12345678901',
 *     pixKeyType: 'cpf',
 *     receiverName: 'CLINICA GENESIS',
 *     receiverCity: 'SAO PAULO',
 *   }}
 *   amountInCents={15000}
 *   description="Consulta Dr. Silva"
 *   onConfirmPayment={() => handlePaymentConfirmed()}
 * />
 * ```
 */
export const DirectPixPayment: React.FC<DirectPixPaymentProps> = ({
  pixConfig,
  amountInCents,
  description,
  transactionId,
  onConfirmPayment,
  onRegenerate,
  isConfirmed = false,
  compact = false,
}) => {
  const [pixData, setPixData] = useState<DirectPixResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Generate QR code on mount or when inputs change
  useEffect(() => {
    const generateQRCode = async () => {
      setLoading(true);
      setError(null);

      try {
        const input: DirectPixInput = {
          pixKey: pixConfig.pixKey,
          pixKeyType: pixConfig.pixKeyType,
          receiverName: pixConfig.receiverName,
          receiverCity: pixConfig.receiverCity,
          amount: amountInCents ? amountInCents / 100 : undefined,
          description,
          transactionId,
        };

        const result = await generateDirectPixQRCode(input);
        setPixData(result);
      } catch (err) {
        console.error('Failed to generate PIX QR code:', err);
        setError('Erro ao gerar QR code PIX');
      } finally {
        setLoading(false);
      }
    };

    generateQRCode();
  }, [pixConfig, amountInCents, description, transactionId]);

  // Handle copy to clipboard
  const handleCopy = useCallback(async () => {
    if (!pixData?.pixCopiaECola) return;

    try {
      await navigator.clipboard.writeText(pixData.pixCopiaECola);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [pixData?.pixCopiaECola]);

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-[#32D583]" />
        <p className="mt-4 text-sm text-gray-500">Gerando QR Code PIX...</p>
      </div>
    );
  }

  // Error state
  if (error || !pixData) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-red-50 rounded-2xl">
        <AlertCircle className="w-12 h-12 text-red-400" />
        <p className="mt-4 text-sm text-red-600">{error || 'Erro desconhecido'}</p>
        {onRegenerate && (
          <button
            onClick={onRegenerate}
            className="mt-4 flex items-center gap-2 px-4 py-2 bg-[#32D583] text-white rounded-lg hover:bg-[#2BBF76] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Tentar novamente
          </button>
        )}
      </div>
    );
  }

  // Payment confirmed
  if (isConfirmed) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-[#ECFDF3] rounded-2xl">
        <div className="w-16 h-16 rounded-full bg-[#32D583] flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-white" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-[#027A48]">
          Pagamento Confirmado!
        </h3>
        {amountInCents && (
          <p className="mt-2 text-sm text-[#027A48]">
            {formatPixAmount(amountInCents)}
          </p>
        )}
      </div>
    );
  }

  // Compact mode
  if (compact) {
    return (
      <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100">
        <img
          src={pixData.qrCodeDataUrl}
          alt="QR Code PIX"
          className="w-20 h-20 rounded-lg"
        />
        <div className="flex-1">
          <p className="font-semibold text-gray-900">
            {amountInCents ? formatPixAmount(amountInCents) : 'Valor a definir'}
          </p>
          <p className="text-xs text-gray-500 mt-1">PIX Direto (sem taxas)</p>
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

  // Full display
  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 text-[#32D583]">
        <QrCode className="w-5 h-5" />
        <span className="font-medium">PIX</span>
        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
          0% taxa
        </span>
      </div>

      {/* Amount */}
      <p className="mt-4 text-2xl font-bold text-gray-900">
        {amountInCents ? formatPixAmount(amountInCents) : 'Valor a definir'}
      </p>

      {/* Description */}
      {description && (
        <p className="mt-1 text-sm text-gray-500 text-center">{description}</p>
      )}

      {/* QR Code */}
      <div className="mt-6 p-4 bg-white rounded-xl border-2 border-gray-100">
        <img
          src={pixData.qrCodeDataUrl}
          alt="QR Code PIX"
          className="w-48 h-48"
        />
      </div>

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

      {/* Receiver info */}
      <div className="mt-4 text-xs text-gray-400 text-center">
        <p>Recebedor: {pixConfig.receiverName}</p>
        <p>Cidade: {pixConfig.receiverCity}</p>
      </div>

      {/* Confirm button */}
      {onConfirmPayment && (
        <button
          onClick={onConfirmPayment}
          className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#32D583] text-white rounded-xl hover:bg-[#2BBF76] transition-colors font-medium"
        >
          <CheckCircle2 className="w-5 h-5" />
          Confirmar que paguei
        </button>
      )}

      {/* Note */}
      <p className="mt-4 text-xs text-gray-400 text-center">
        Após o pagamento, clique em "Confirmar que paguei" para registrar a transação
      </p>
    </div>
  );
};

export default DirectPixPayment;

