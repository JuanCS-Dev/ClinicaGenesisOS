/**
 * Confirm Dialog Component
 * ========================
 * 
 * Modal de confirmação usando o Design System Genesis.
 * 
 * @example
 * ```tsx
 * <ConfirmDialog
 *   open={isOpen}
 *   title="Excluir paciente?"
 *   description="Esta ação não pode ser desfeita."
 *   onConfirm={handleDelete}
 *   onCancel={() => setIsOpen(false)}
 * />
 * ```
 */

import { Modal, Button } from '@/design-system';

interface Props {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning';
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
  variant = 'danger',
  loading = false,
}: Props) {
  return (
    <Modal
      isOpen={open}
      onClose={onCancel}
      title={title}
      size="sm"
      showCloseButton={false}
      footer={
        <>
          <Button 
            variant="ghost" 
            onClick={onCancel}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-[var(--color-genesis-muted)] text-sm">
        {description}
      </p>
    </Modal>
  );
}
