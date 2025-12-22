/**
 * Direct PIX Modal
 * ================
 *
 * Modal wrapper for DirectPixPayment component.
 * Shows QR code for direct PIX payment (0% fees).
 *
 * Fase 10: Payment Integration
 */

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { DirectPixPayment } from './DirectPixPayment';
import { PIX_CONFIG, isPixConfigured } from '../../config/pix';

interface DirectPixModalProps {
  /** Amount in cents */
  amountInCents: number;
  /** Description */
  description: string;
  /** Transaction ID for reference */
  transactionId?: string;
  /** Close modal */
  onClose: () => void;
  /** Called when user confirms payment */
  onConfirmPayment: () => void;
}

/**
 * Modal for displaying direct PIX QR code.
 */
export const DirectPixModal: React.FC<DirectPixModalProps> = ({
  amountInCents,
  description,
  transactionId,
  onClose,
  onConfirmPayment,
}) => {
  const [confirmed, setConfirmed] = useState(false);

  // Check if PIX is configured
  if (!isPixConfigured()) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">PIX não configurado</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <p className="text-gray-600 mb-4">
            Configure sua chave PIX no arquivo <code className="bg-gray-100 px-1 rounded">.env</code>:
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
{`VITE_PIX_KEY=sua_chave_pix
VITE_PIX_KEY_TYPE=cpf
VITE_PIX_RECEIVER_NAME=SUA CLINICA
VITE_PIX_RECEIVER_CITY=SUA CIDADE
VITE_PIX_ENABLED=true`}
          </pre>
          <button
            onClick={onClose}
            className="mt-4 w-full py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200"
          >
            Fechar
          </button>
        </div>
      </div>
    );
  }

  const handleConfirm = () => {
    setConfirmed(true);
    onConfirmPayment();
    // Close after animation
    setTimeout(onClose, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="text-lg font-bold text-gray-900">Pagamento PIX</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <DirectPixPayment
            pixConfig={{
              pixKey: PIX_CONFIG.pixKey,
              pixKeyType: PIX_CONFIG.pixKeyType,
              receiverName: PIX_CONFIG.receiverName,
              receiverCity: PIX_CONFIG.receiverCity,
            }}
            amountInCents={amountInCents}
            description={description}
            transactionId={transactionId}
            onConfirmPayment={handleConfirm}
            isConfirmed={confirmed}
          />
        </div>
      </div>
    </div>
  );
};

export default DirectPixModal;

