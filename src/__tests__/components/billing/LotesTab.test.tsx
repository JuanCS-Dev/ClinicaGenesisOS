/**
 * Tests for LotesTab and related components
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LotesTab } from '@/components/billing/LotesTab';
import { LoteCard } from '@/components/billing/LoteCard';
import { CreateLoteModal } from '@/components/billing/CreateLoteModal';
import type { LoteGuias, GuiaFirestore, StatusLote } from '@/types';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Create mock data factories
const createMockLote = (overrides: Partial<LoteGuias> = {}): LoteGuias => ({
  id: 'lote-1',
  clinicId: 'clinic-1',
  registroANS: '123456',
  nomeOperadora: 'Unimed',
  guiaIds: ['guia-1', 'guia-2'],
  quantidadeGuias: 2,
  valorTotal: 1500,
  status: 'rascunho',
  numeroLote: 'L-2024-001',
  dataGeracao: '2024-01-15T10:00:00Z',
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z',
  createdBy: 'user-1',
  ...overrides,
});

const createMockGuia = (overrides: Partial<GuiaFirestore> = {}): GuiaFirestore => ({
  id: 'guia-1',
  clinicId: 'clinic-1',
  patientId: 'patient-1',
  appointmentId: 'apt-1',
  tipo: 'consulta',
  registroANS: '123456',
  nomeOperadora: 'Unimed',
  numeroGuiaPrestador: 'GP-001',
  dataAtendimento: '2024-01-15',
  status: 'rascunho',
  valorTotal: 500,
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z',
  dadosGuia: {
    dadosBeneficiario: {
      numeroCarteira: '123456789',
      nomeBeneficiario: 'João Silva',
    },
  },
  ...overrides,
} as GuiaFirestore);

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
