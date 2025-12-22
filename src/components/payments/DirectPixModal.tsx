/**
 * Direct PIX Modal
 * ================
 *
 * Modal wrapper for DirectPixPayment component.
 * Shows QR code for direct PIX payment (0% fees).
 *
 * Fase 10: Payment Integration
 * Migrated to Design System - Fase 16.5
 */

import React, { useState } from 'react';
import { Modal, Button, Card } from '@/design-system';
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
      <Modal
        isOpen={true}
        onClose={onClose}
        title="PIX não configurado"
        size="md"
        footer={
          <Button variant="secondary" onClick={onClose}>
            Fechar
          </Button>
        }
      >
        <p className="text-[var(--color-genesis-muted)] mb-4">
          Configure sua chave PIX no arquivo{' '}
          <code className="bg-[var(--color-genesis-hover)] px-1.5 py-0.5 rounded text-sm">
            .env
          </code>:
        </p>
        <Card padding="none" className="overflow-hidden">
          <pre className="bg-[var(--color-genesis-dark)] text-[var(--color-success)] p-4 text-sm overflow-x-auto">
{`VITE_PIX_KEY=sua_chave_pix
VITE_PIX_KEY_TYPE=cpf
VITE_PIX_RECEIVER_NAME=SUA CLINICA
VITE_PIX_RECEIVER_CITY=SUA CIDADE
VITE_PIX_ENABLED=true`}
          </pre>
        </Card>
      </Modal>
    );
  }

  const handleConfirm = () => {
    setConfirmed(true);
    onConfirmPayment();
    // Close after animation
    setTimeout(onClose, 1500);
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Pagamento PIX"
      size="md"
    >
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
    </Modal>
  );
};

export default DirectPixModal;
