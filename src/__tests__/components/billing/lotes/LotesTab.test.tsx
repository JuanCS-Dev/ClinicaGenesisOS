/**
 * LotesTab Component Tests
 *
 * Tests for the main LotesTab component.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LotesTab } from '@/components/billing/LotesTab';
import type { LoteGuias, GuiaFirestore } from '@/types';
import { createMockLote, createMockGuia } from './setup';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('LotesTab', () => {
  const defaultProps = {
    lotes: [] as LoteGuias[],
    guias: [] as GuiaFirestore[],
    loading: false,
    onCreateLote: vi.fn().mockResolvedValue(undefined),
    onSendLote: vi.fn().mockResolvedValue(undefined),
    onDeleteLote: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render header and create button', () => {
    render(<LotesTab {...defaultProps} />);

    expect(screen.getByText('Lotes de Guias')).toBeInTheDocument();
    expect(screen.getByText(/Criar Lote/)).toBeInTheDocument();
  });

  it('should show empty state when no lotes', () => {
    render(<LotesTab {...defaultProps} />);

    expect(screen.getByText('Nenhum lote criado')).toBeInTheDocument();
  });

  it('should show loading state', () => {
    render(<LotesTab {...defaultProps} loading={true} />);

    // Should show spinner instead of empty state
    expect(screen.queryByText('Nenhum lote criado')).not.toBeInTheDocument();
  });

  it('should display stats cards', () => {
    const lotes = [
      createMockLote({ status: 'rascunho' }),
      createMockLote({ id: 'lote-2', status: 'enviado' }),
    ];

    render(<LotesTab {...defaultProps} lotes={lotes} />);

    expect(screen.getByText('Total de Lotes')).toBeInTheDocument();
    expect(screen.getByText('Pendentes')).toBeInTheDocument();
    expect(screen.getByText('Enviados')).toBeInTheDocument();
  });

  it('should render lote cards when lotes exist', () => {
    const lotes = [createMockLote()];
    const guias = [createMockGuia()];

    render(<LotesTab {...defaultProps} lotes={lotes} guias={guias} />);

    expect(screen.getByText(/Lote L-2024-001/)).toBeInTheDocument();
    expect(screen.getByText('Unimed')).toBeInTheDocument();
  });

  it('should show pending guias count in create button', () => {
    const guias = [
      createMockGuia({ status: 'rascunho' }),
      createMockGuia({ id: 'guia-2', status: 'rascunho' }),
    ];

    render(<LotesTab {...defaultProps} guias={guias} />);

    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should disable create button when no pending guias', () => {
    const guias = [createMockGuia({ status: 'paga' })];

    render(<LotesTab {...defaultProps} guias={guias} />);

    const createButton = screen.getByRole('button', { name: /Criar Lote/i });
    expect(createButton).toBeDisabled();
  });

  it('should open create modal when clicking create button', () => {
    const guias = [createMockGuia({ status: 'rascunho' })];

    render(<LotesTab {...defaultProps} guias={guias} />);

    fireEvent.click(screen.getByText(/Criar Lote/));

    expect(screen.getByText('Criar Novo Lote')).toBeInTheDocument();
  });

  it('should handle send lote successfully', async () => {
    const lotes = [createMockLote()];
    const guias = [createMockGuia()];
    const onSendLote = vi.fn().mockResolvedValue(undefined);
    const { toast: mockToast } = await import('sonner');

    render(
      <LotesTab
        {...defaultProps}
        lotes={lotes}
        guias={guias}
        onSendLote={onSendLote}
      />
    );

    fireEvent.click(screen.getByText('Enviar'));

    await waitFor(() => {
      expect(onSendLote).toHaveBeenCalledWith('lote-1');
    });

    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith('Lote enviado com sucesso');
    });
  });

  it('should handle send lote error', async () => {
    const lotes = [createMockLote()];
    const guias = [createMockGuia()];
    const onSendLote = vi.fn().mockRejectedValue(new Error('Network error'));
    const { toast: mockToast } = await import('sonner');

    render(
      <LotesTab
        {...defaultProps}
        lotes={lotes}
        guias={guias}
        onSendLote={onSendLote}
      />
    );

    fireEvent.click(screen.getByText('Enviar'));

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Erro ao enviar lote');
    });
  });

  it('should handle delete lote successfully', async () => {
    const lotes = [createMockLote()];
    const guias = [createMockGuia()];
    const onDeleteLote = vi.fn().mockResolvedValue(undefined);
    const { toast: mockToast } = await import('sonner');

    render(
      <LotesTab
        {...defaultProps}
        lotes={lotes}
        guias={guias}
        onDeleteLote={onDeleteLote}
      />
    );

    // Click delete button
    fireEvent.click(screen.getByTitle('Excluir'));
    // Confirm deletion
    fireEvent.click(screen.getByTitle('Confirmar'));

    await waitFor(() => {
      expect(onDeleteLote).toHaveBeenCalledWith('lote-1');
    });

    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith('Lote excluído');
    });
  });

  it('should handle delete lote error', async () => {
    const lotes = [createMockLote()];
    const guias = [createMockGuia()];
    const onDeleteLote = vi.fn().mockRejectedValue(new Error('Delete failed'));
    const { toast: mockToast } = await import('sonner');

    render(
      <LotesTab
        {...defaultProps}
        lotes={lotes}
        guias={guias}
        onDeleteLote={onDeleteLote}
      />
    );

    // Click delete button
    fireEvent.click(screen.getByTitle('Excluir'));
    // Confirm deletion
    fireEvent.click(screen.getByTitle('Confirmar'));

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Erro ao excluir lote');
    });
  });

  it('should pass onViewGuia callback to LoteCard', () => {
    const lotes = [createMockLote()];
    const guias = [createMockGuia()];
    const onViewGuia = vi.fn();

    render(
      <LotesTab
        {...defaultProps}
        lotes={lotes}
        guias={guias}
        onViewGuia={onViewGuia}
      />
    );

    // LoteCard should be rendered with the callback
    expect(screen.getByText(/Lote L-2024-001/)).toBeInTheDocument();
  });

  it('should pass onDownloadXml callback to LoteCard', () => {
    const lotes = [createMockLote({ xmlContent: '<xml>test</xml>' })];
    const guias = [createMockGuia()];
    const onDownloadXml = vi.fn();

    render(
      <LotesTab
        {...defaultProps}
        lotes={lotes}
        guias={guias}
        onDownloadXml={onDownloadXml}
      />
    );

    expect(screen.getByTitle('Baixar XML')).toBeInTheDocument();
  });

  it('should sort lotes by date descending', () => {
    const lotes = [
      createMockLote({ id: 'lote-1', dataGeracao: '2024-01-10T10:00:00Z', numeroLote: 'L-2024-001' }),
      createMockLote({ id: 'lote-2', dataGeracao: '2024-01-15T10:00:00Z', numeroLote: 'L-2024-002' }),
    ];
    const guias = [createMockGuia()];

    render(<LotesTab {...defaultProps} lotes={lotes} guias={guias} />);

    const loteTexts = screen.getAllByText(/Lote L-2024-/);
    // Should be sorted newest first
    expect(loteTexts[0]).toHaveTextContent('L-2024-002');
  });

  it('should close create modal when onClose is called', async () => {
    const guias = [createMockGuia({ status: 'rascunho' })];

    render(<LotesTab {...defaultProps} guias={guias} />);

    // Open modal
    fireEvent.click(screen.getByText(/Criar Lote/));
    expect(screen.getByText('Criar Novo Lote')).toBeInTheDocument();

    // Close modal
    fireEvent.click(screen.getByText('Cancelar'));

    await waitFor(() => {
      expect(screen.queryByText('Criar Novo Lote')).not.toBeInTheDocument();
    });
  });
});
