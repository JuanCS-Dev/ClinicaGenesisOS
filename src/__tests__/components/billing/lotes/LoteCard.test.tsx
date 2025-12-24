/**
 * LoteCard Component Tests
 *
 * Tests for the LoteCard component.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoteCard } from '@/components/billing/LoteCard';
import { createMockLote, createMockGuia } from './setup';

describe('LoteCard', () => {
  const defaultProps = {
    lote: createMockLote(),
    guias: [createMockGuia()],
    onSend: vi.fn().mockResolvedValue(undefined),
    onDelete: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render lote info', () => {
    render(<LoteCard {...defaultProps} />);

    expect(screen.getByText(/Lote L-2024-001/)).toBeInTheDocument();
    expect(screen.getByText('Unimed')).toBeInTheDocument();
    expect(screen.getByText('2 guias')).toBeInTheDocument();
  });

  it('should show status badge', () => {
    render(<LoteCard {...defaultProps} />);

    expect(screen.getByText('Rascunho')).toBeInTheDocument();
  });

  it('should show send button for draft lotes', () => {
    render(<LoteCard {...defaultProps} />);

    expect(screen.getByText('Enviar')).toBeInTheDocument();
  });

  it('should not show send button for sent lotes', () => {
    const sentLote = createMockLote({ status: 'enviado' });
    render(<LoteCard {...defaultProps} lote={sentLote} />);

    expect(screen.queryByText('Enviar')).not.toBeInTheDocument();
  });

  it('should show delete button for draft lotes', () => {
    render(<LoteCard {...defaultProps} />);

    // Delete button should be visible (trash icon)
    const deleteButton = screen.getByTitle('Excluir');
    expect(deleteButton).toBeInTheDocument();
  });

  it('should expand when clicked to show details', () => {
    render(<LoteCard {...defaultProps} />);

    const header = screen.getByText(/Lote L-2024-001/).closest('div[class*="cursor-pointer"]');
    if (header) fireEvent.click(header);

    expect(screen.getByText('Data Geração')).toBeInTheDocument();
    expect(screen.getByText('Registro ANS')).toBeInTheDocument();
  });

  it('should call onSend when send button is clicked', async () => {
    const onSend = vi.fn().mockResolvedValue(undefined);
    render(<LoteCard {...defaultProps} onSend={onSend} />);

    fireEvent.click(screen.getByText('Enviar'));

    expect(onSend).toHaveBeenCalled();
  });

  it('should show confirmation before delete', () => {
    render(<LoteCard {...defaultProps} />);

    const deleteButton = screen.getByTitle('Excluir');
    fireEvent.click(deleteButton);

    // Should show confirm/cancel buttons
    expect(screen.getByTitle('Confirmar')).toBeInTheDocument();
    expect(screen.getByTitle('Cancelar')).toBeInTheDocument();
  });

  it('should show download button when XML is available', () => {
    const loteWithXml = createMockLote({ xmlContent: '<xml>content</xml>' });
    const onDownloadXml = vi.fn();

    render(
      <LoteCard
        {...defaultProps}
        lote={loteWithXml}
        onDownloadXml={onDownloadXml}
      />
    );

    expect(screen.getByTitle('Baixar XML')).toBeInTheDocument();
  });

  it('should show errors when lote has errors', () => {
    const loteWithErrors = createMockLote({
      status: 'erro',
      erros: [{ guiaId: 'guia-1', mensagem: 'Erro de validação' }],
    });

    render(<LoteCard {...defaultProps} lote={loteWithErrors} />);

    // Expand to see errors
    const header = screen.getByText(/Lote L-2024-001/).closest('div[class*="cursor-pointer"]');
    if (header) fireEvent.click(header);

    expect(screen.getByText(/Erros/)).toBeInTheDocument();
    expect(screen.getByText('• Erro de validação')).toBeInTheDocument();
  });
});
