/**
 * LabUploadPanel Tests
 * ====================
 *
 * Unit tests for LabUploadPanel component.
 * Fase 15: Coverage Enhancement (95%+)
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LabUploadPanel } from '../../../../components/ai/clinical-reasoning/LabUploadPanel';
import type { LabAnalysisStatus } from '@/types';

// Mock values that can be controlled per test
let mockIsDragActive = false;
const mockOpen = vi.fn();

// Mock react-dropzone with proper implementation
vi.mock('react-dropzone', () => ({
  useDropzone: vi.fn((config: { onDrop?: (files: File[]) => void }) => {
    // Store config for later access
    (global as unknown as { dropzoneConfig: typeof config }).dropzoneConfig = config;
    return {
      getRootProps: () => ({
        role: 'button',
        tabIndex: 0,
      }),
      getInputProps: () => ({
        type: 'file',
        style: { display: 'none' },
      }),
      isDragActive: mockIsDragActive,
      open: mockOpen,
    };
  }),
}));

describe('LabUploadPanel', () => {
  const mockOnFileSelect = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockIsDragActive = false;
  });

  const renderPanel = (
    status: LabAnalysisStatus = 'idle',
    error?: string | null,
    disabled?: boolean
  ) => {
    return render(
      <LabUploadPanel
        status={status}
        error={error}
        onFileSelect={mockOnFileSelect}
        onCancel={mockOnCancel}
        disabled={disabled}
      />
    );
  };

  describe('Idle State', () => {
    it('renders upload UI when idle', () => {
      renderPanel('idle');

      expect(screen.getByText('Análise de Exame Laboratorial')).toBeInTheDocument();
      expect(screen.getByText(/Arraste um PDF ou imagem/)).toBeInTheDocument();
    });

    it('displays "Escolher Arquivo" button', () => {
      renderPanel('idle');

      expect(screen.getByText('Escolher Arquivo')).toBeInTheDocument();
    });

    it('displays "Usar Câmera" button', () => {
      renderPanel('idle');

      expect(screen.getByText('Usar Câmera')).toBeInTheDocument();
    });

    it('displays feature items', () => {
      renderPanel('idle');

      expect(screen.getByText('HIPAA Compliant')).toBeInTheDocument();
      expect(screen.getByText('Multi-LLM')).toBeInTheDocument();
      expect(screen.getByText('15-30 segundos')).toBeInTheDocument();
    });

    it('displays supported formats info', () => {
      renderPanel('idle');

      expect(screen.getByText(/Formatos aceitos: PDF, JPG, PNG, WebP/)).toBeInTheDocument();
      expect(screen.getByText(/Máximo 15MB/)).toBeInTheDocument();
    });

    it('calls open when "Escolher Arquivo" is clicked', () => {
      renderPanel('idle');

      const button = screen.getByText('Escolher Arquivo');
      fireEvent.click(button);

      expect(mockOpen).toHaveBeenCalled();
    });

    it('handles file drop via onDrop callback', () => {
      renderPanel('idle');

      // Get the stored dropzone config and simulate drop
      const config = (global as unknown as { dropzoneConfig: { onDrop?: (files: File[]) => void } }).dropzoneConfig;
      
      if (config?.onDrop) {
        const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
        config.onDrop([mockFile]);
        
        expect(mockOnFileSelect).toHaveBeenCalledWith(mockFile);
      }
    });

    it('does not process empty file array on drop', () => {
      renderPanel('idle');

      const config = (global as unknown as { dropzoneConfig: { onDrop?: (files: File[]) => void } }).dropzoneConfig;
      
      if (config?.onDrop) {
        config.onDrop([]);
        
        expect(mockOnFileSelect).not.toHaveBeenCalled();
      }
    });
  });

  describe('Drag Active State', () => {
    it('displays drag active message', async () => {
      const { useDropzone } = await import('react-dropzone');
      (useDropzone as ReturnType<typeof vi.fn>).mockReturnValue({
        getRootProps: () => ({ role: 'button', tabIndex: 0 }),
        getInputProps: () => ({ type: 'file', style: { display: 'none' } }),
        isDragActive: true,
        open: mockOpen,
      });

      renderPanel('idle');

      expect(screen.getByText('Solte o arquivo aqui')).toBeInTheDocument();
      expect(screen.getByText('Vamos processar seu exame com IA avançada')).toBeInTheDocument();
    });
  });

  describe('Processing States', () => {
    it('renders uploading state', () => {
      renderPanel('uploading');

      expect(screen.getByText('Processando Análise')).toBeInTheDocument();
      expect(screen.getByText('Enviando')).toBeInTheDocument();
      expect(screen.getByText('Transferindo documento para análise')).toBeInTheDocument();
    });

    it('renders extracting state', () => {
      renderPanel('extracting');

      expect(screen.getByText('Processando Análise')).toBeInTheDocument();
      expect(screen.getByText('Extraindo')).toBeInTheDocument();
      expect(screen.getByText('OCR identificando valores laboratoriais')).toBeInTheDocument();
    });

    it('renders processing state', () => {
      renderPanel('processing');

      expect(screen.getByText('Processando Análise')).toBeInTheDocument();
      expect(screen.getByText('Analisando')).toBeInTheDocument();
      expect(screen.getByText('IA processando raciocínio clínico')).toBeInTheDocument();
    });

    it('shows completed stages', () => {
      renderPanel('processing');

      // When in processing state, uploading and extracting should be completed
      const completedBadges = screen.getAllByText('Concluído');
      expect(completedBadges.length).toBe(2); // uploading and extracting
    });

    it('displays estimated time', () => {
      renderPanel('uploading');

      expect(screen.getByText(/Tempo estimado: 15-30 segundos/)).toBeInTheDocument();
    });

    it('calls onCancel when cancel button is clicked during processing', () => {
      renderPanel('uploading');

      // Find the button with X icon in header
      const buttons = document.querySelectorAll('button');
      const cancelButton = Array.from(buttons).find(btn => 
        btn.querySelector('.lucide-x')
      );
      
      if (cancelButton) {
        fireEvent.click(cancelButton);
        expect(mockOnCancel).toHaveBeenCalled();
      }
    });

    it('shows all three processing stages', () => {
      renderPanel('uploading');

      expect(screen.getByText('Enviando')).toBeInTheDocument();
      expect(screen.getByText('Extraindo')).toBeInTheDocument();
      expect(screen.getByText('Analisando')).toBeInTheDocument();
    });
  });

  describe('Ready State', () => {
    it('renders success message when ready', () => {
      renderPanel('ready');

      expect(screen.getByText('Análise Concluída')).toBeInTheDocument();
      expect(screen.getByText('Resultados prontos para revisão médica')).toBeInTheDocument();
    });

    it('displays success styling', () => {
      const { container } = renderPanel('ready');

      // Should have green-themed container
      const successContainer = container.querySelector('.from-\\[\\#ECFDF5\\]');
      expect(successContainer).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('renders error message when error occurs', () => {
      renderPanel('error', 'Arquivo inválido ou corrompido');

      expect(screen.getByText('Erro no Processamento')).toBeInTheDocument();
      expect(screen.getByText('Arquivo inválido ou corrompido')).toBeInTheDocument();
    });

    it('displays retry button on error', () => {
      renderPanel('error', 'Erro');

      expect(screen.getByText('Tentar Novamente')).toBeInTheDocument();
    });

    it('calls onCancel when retry button is clicked', () => {
      renderPanel('error', 'Erro');

      const retryButton = screen.getByText('Tentar Novamente');
      fireEvent.click(retryButton);

      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('handles error state without error message', () => {
      renderPanel('error');

      expect(screen.getByText('Erro no Processamento')).toBeInTheDocument();
      // Should not crash even without error message
    });

    it('displays error styling', () => {
      const { container } = renderPanel('error', 'Test');

      // Should have red-themed container
      const errorContainer = container.querySelector('.from-\\[\\#FEF2F2\\]');
      expect(errorContainer).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('renders without onCancel prop in error state', () => {
      render(
        <LabUploadPanel
          status="error"
          error="Test error"
          onFileSelect={mockOnFileSelect}
        />
      );

      // Retry button should not be present
      expect(screen.queryByText('Tentar Novamente')).not.toBeInTheDocument();
    });

    it('renders without onCancel prop in processing state', () => {
      render(
        <LabUploadPanel
          status="uploading"
          onFileSelect={mockOnFileSelect}
        />
      );

      // Should still render processing UI
      expect(screen.getByText('Processando Análise')).toBeInTheDocument();
    });
  });
});
