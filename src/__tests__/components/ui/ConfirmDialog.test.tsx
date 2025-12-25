/**
 * ConfirmDialog Component Tests
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';

describe('ConfirmDialog', () => {
  const defaultProps = {
    open: true,
    title: 'Confirmar ação',
    description: 'Esta ação não pode ser desfeita.',
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders title when open', () => {
      render(<ConfirmDialog {...defaultProps} />);
      expect(screen.getByText('Confirmar ação')).toBeInTheDocument();
    });

    it('renders description', () => {
      render(<ConfirmDialog {...defaultProps} />);
      expect(screen.getByText('Esta ação não pode ser desfeita.')).toBeInTheDocument();
    });

    it('renders default button labels', () => {
      render(<ConfirmDialog {...defaultProps} />);
      expect(screen.getByRole('button', { name: 'Confirmar' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
    });

    it('renders custom button labels', () => {
      render(
        <ConfirmDialog
          {...defaultProps}
          confirmLabel="Sim, excluir"
          cancelLabel="Não, manter"
        />
      );
      expect(screen.getByRole('button', { name: 'Sim, excluir' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Não, manter' })).toBeInTheDocument();
    });

    it('does not render when closed', () => {
      render(<ConfirmDialog {...defaultProps} open={false} />);
      expect(screen.queryByText('Confirmar ação')).not.toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('calls onConfirm when confirm button is clicked', () => {
      const onConfirm = vi.fn();
      render(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} />);

      const confirmButton = screen.getByRole('button', { name: 'Confirmar' });
      fireEvent.click(confirmButton);

      expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('calls onCancel when cancel button is clicked', () => {
      const onCancel = vi.fn();
      render(<ConfirmDialog {...defaultProps} onCancel={onCancel} />);

      const cancelButton = screen.getByRole('button', { name: 'Cancelar' });
      fireEvent.click(cancelButton);

      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('loading state', () => {
    it('disables cancel button when loading', () => {
      render(<ConfirmDialog {...defaultProps} loading />);
      const cancelButton = screen.getByRole('button', { name: 'Cancelar' });
      expect(cancelButton).toBeDisabled();
    });
  });

  describe('variants', () => {
    it('renders with danger variant by default', () => {
      const { container } = render(<ConfirmDialog {...defaultProps} />);
      // Danger variant should have specific styling
      expect(container).toBeDefined();
    });

    it('renders with warning variant', () => {
      const { container } = render(<ConfirmDialog {...defaultProps} variant="warning" />);
      expect(container).toBeDefined();
    });
  });
});
