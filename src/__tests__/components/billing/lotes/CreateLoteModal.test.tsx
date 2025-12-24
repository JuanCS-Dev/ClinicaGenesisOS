/**
 * CreateLoteModal Component Tests
 *
 * Tests for the CreateLoteModal component.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateLoteModal } from '@/components/billing/CreateLoteModal';
import { createMockGuia } from './setup';

describe('CreateLoteModal', () => {
  const defaultProps = {
    guias: [
      createMockGuia({ status: 'rascunho' }),
      createMockGuia({ id: 'guia-2', status: 'rascunho', valorTotal: 750 }),
    ],
    onClose: vi.fn(),
    onCreate: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render modal with title', () => {
    render(<CreateLoteModal {...defaultProps} />);

    expect(screen.getByText('Criar Novo Lote')).toBeInTheDocument();
  });

  it('should show operadora selector', () => {
    render(<CreateLoteModal {...defaultProps} />);

    expect(screen.getByText('Operadora')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('should show available guias for selection', () => {
    render(<CreateLoteModal {...defaultProps} />);

    // Guias are displayed with checkboxes
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBe(2); // Two guias available
  });

  it('should have select all and clear buttons', () => {
    render(<CreateLoteModal {...defaultProps} />);

    expect(screen.getByText('Selecionar tudo')).toBeInTheDocument();
    expect(screen.getByText('Limpar')).toBeInTheDocument();
  });

  it('should update total when guias are selected', () => {
    render(<CreateLoteModal {...defaultProps} />);

    // Click select all
    fireEvent.click(screen.getByText('Selecionar tudo'));

    // Should show total value
    expect(screen.getByText(/Valor Total/)).toBeInTheDocument();
    expect(screen.getByText(/1.250,00/)).toBeInTheDocument();
  });

  it('should show selection count', () => {
    render(<CreateLoteModal {...defaultProps} />);

    expect(screen.getByText('0 de 2 selecionadas')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Selecionar tudo'));

    expect(screen.getByText('2 de 2 selecionadas')).toBeInTheDocument();
  });

  it('should call onClose when cancel is clicked', () => {
    render(<CreateLoteModal {...defaultProps} />);

    fireEvent.click(screen.getByText('Cancelar'));

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('should call onCreate with selected guias', async () => {
    const onCreate = vi.fn().mockResolvedValue(undefined);
    render(<CreateLoteModal {...defaultProps} onCreate={onCreate} />);

    fireEvent.click(screen.getByText('Selecionar tudo'));
    fireEvent.click(screen.getByText('Criar Lote'));

    await waitFor(() => {
      expect(onCreate).toHaveBeenCalledWith('123456', ['guia-1', 'guia-2']);
    });
  });

  it('should show empty state when no pending guias', () => {
    render(<CreateLoteModal {...defaultProps} guias={[]} />);

    expect(screen.getByText('Nenhuma guia pendente')).toBeInTheDocument();
  });

  it('should disable create button when no guias selected', () => {
    render(<CreateLoteModal {...defaultProps} />);

    const createButton = screen.getByRole('button', { name: /Criar Lote/i });
    expect(createButton).toBeDisabled();
  });
});
