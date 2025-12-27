/**
 * PIX Payment Modal
 * =================
 *
 * Modal for paying invoices via PIX QR code.
 * Uses direct PIX generation (0% fees).
 *
 * @module components/patient-portal/PixPaymentModal
 */

import React, { useState, useEffect, useCallback } from 'react'
import { X, QrCode, Copy, Check, Clock, AlertCircle, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { generateDirectPixQRCode, type DirectPixResult } from '../../services/pix.service'
import { PIX_CONFIG, isPixConfigured } from '../../config/pix'
import type { Transaction } from '@/types'

// ============================================================================
// Types
// ============================================================================

interface PixPaymentModalProps {
  isOpen: boolean
  transaction: Transaction | null
  onClose: () => void
  onPaymentComplete?: (transactionId: string) => void
}

type ModalStatus = 'loading' | 'ready' | 'copied' | 'error' | 'not_configured'

// ============================================================================
// Helpers
// ============================================================================

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

function generateTransactionId(transactionId: string): string {
  // Generate a unique ID for this payment (max 25 chars, alphanumeric)
  const timestamp = Date.now().toString(36).toUpperCase()
  const shortId = transactionId.replace(/[^a-zA-Z0-9]/g, '').substring(0, 10).toUpperCase()
  return `GEN${shortId}${timestamp}`.substring(0, 25)
}

// ============================================================================
// Component
// ============================================================================

export function PixPaymentModal({
  isOpen,
  transaction,
  onClose,
  onPaymentComplete,
}: PixPaymentModalProps): React.ReactElement | null {
  const [status, setStatus] = useState<ModalStatus>('loading')
  const [pixData, setPixData] = useState<DirectPixResult | null>(null)
  const [copied, setCopied] = useState(false)

  // Generate PIX QR code when modal opens
  useEffect(() => {
    if (!isOpen || !transaction) return

    const generatePix = async () => {
      // Check if PIX is configured
      if (!isPixConfigured()) {
        setStatus('not_configured')
        return
      }

      setStatus('loading')
      setPixData(null)
      setCopied(false)

      try {
        const result = await generateDirectPixQRCode({
          pixKey: PIX_CONFIG.pixKey,
          pixKeyType: PIX_CONFIG.pixKeyType,
          receiverName: PIX_CONFIG.receiverName,
          receiverCity: PIX_CONFIG.receiverCity,
          amount: transaction.amount,
          transactionId: generateTransactionId(transaction.id),
          description: transaction.description?.substring(0, 72),
        })

        setPixData(result)
        setStatus('ready')
      } catch (error) {
        console.error('Error generating PIX:', error)
        setStatus('error')
        toast.error('Erro ao gerar QR Code PIX')
      }
    }

    generatePix()
  }, [isOpen, transaction])

  // Handle copy to clipboard
  const handleCopy = useCallback(async () => {
    if (!pixData?.pixCopiaECola) return

    try {
      await navigator.clipboard.writeText(pixData.pixCopiaECola)
      setCopied(true)
      setStatus('copied')
      toast.success('Codigo PIX copiado!')

      // Reset after 3 seconds
      setTimeout(() => {
        setCopied(false)
        setStatus('ready')
      }, 3000)
    } catch {
      toast.error('Erro ao copiar codigo')
    }
  }, [pixData])

  // Handle payment confirmation (manual for now)
  const handleConfirmPayment = useCallback(() => {
    if (!transaction) return

    onPaymentComplete?.(transaction.id)
    toast.success('Pagamento confirmado!')
    onClose()
  }, [transaction, onPaymentComplete, onClose])

  // Don't render if not open or no transaction
  if (!isOpen || !transaction) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-genesis-surface rounded-2xl shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto animate-enter">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-genesis-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-genesis-primary/10 flex items-center justify-center">
              <QrCode className="w-5 h-5 text-genesis-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-genesis-dark">Pagar com PIX</h2>
              <p className="text-sm text-genesis-muted">Pagamento instantaneo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-genesis-hover transition-colors"
          >
            <X className="w-5 h-5 text-genesis-muted" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Transaction Info */}
          <div className="bg-genesis-soft rounded-xl p-4">
            <p className="text-sm text-genesis-muted mb-1">Valor a pagar</p>
            <p className="text-2xl font-bold text-genesis-dark">
              {formatCurrency(transaction.amount)}
            </p>
            <p className="text-sm text-genesis-muted mt-2">{transaction.description}</p>
          </div>

          {/* QR Code Area */}
          {status === 'loading' && (
            <div className="flex flex-col items-center py-8">
              <div className="w-48 h-48 bg-genesis-soft rounded-xl animate-pulse flex items-center justify-center">
                <QrCode className="w-12 h-12 text-genesis-muted animate-spin" />
              </div>
              <p className="text-sm text-genesis-muted mt-4">Gerando QR Code...</p>
            </div>
          )}

          {status === 'not_configured' && (
            <div className="flex flex-col items-center py-8 text-center">
              <div className="w-16 h-16 rounded-full bg-warning-soft flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-warning" />
              </div>
              <p className="font-medium text-genesis-dark">PIX nao configurado</p>
              <p className="text-sm text-genesis-muted mt-2">
                Entre em contato com a clinica para realizar o pagamento.
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center py-8 text-center">
              <div className="w-16 h-16 rounded-full bg-danger-soft flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-danger" />
              </div>
              <p className="font-medium text-genesis-dark">Erro ao gerar PIX</p>
              <p className="text-sm text-genesis-muted mt-2">
                Tente novamente ou entre em contato com a clinica.
              </p>
            </div>
          )}

          {(status === 'ready' || status === 'copied') && pixData && (
            <>
              {/* QR Code Image */}
              <div className="flex flex-col items-center">
                <div className="bg-white p-4 rounded-xl shadow-sm">
                  <img
                    src={pixData.qrCodeDataUrl}
                    alt="QR Code PIX"
                    className="w-48 h-48"
                  />
                </div>
                <p className="text-sm text-genesis-muted mt-3 text-center">
                  Escaneie o QR Code com o app do seu banco
                </p>
              </div>

              {/* Copy Button */}
              <button
                onClick={handleCopy}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  copied
                    ? 'bg-success text-white'
                    : 'bg-genesis-soft text-genesis-dark hover:bg-genesis-hover'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5" />
                    Codigo copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    Copiar codigo PIX
                  </>
                )}
              </button>

              {/* Instructions */}
              <div className="bg-info-soft rounded-xl p-4">
                <div className="flex gap-3">
                  <Clock className="w-5 h-5 text-info shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-genesis-dark">
                      Aguardando pagamento
                    </p>
                    <p className="text-xs text-genesis-muted mt-1">
                      Apos realizar o pagamento, ele sera confirmado automaticamente em alguns minutos.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-genesis-border bg-genesis-soft/50 rounded-b-2xl">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-genesis-border text-genesis-dark font-medium hover:bg-genesis-hover transition-colors"
            >
              Fechar
            </button>
            {(status === 'ready' || status === 'copied') && (
              <button
                onClick={handleConfirmPayment}
                className="flex-1 px-4 py-2.5 rounded-xl bg-success text-white font-medium hover:bg-success-dark hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Ja paguei
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PixPaymentModal
