/**
 * LabUploadPanel Tests
 *
 * Tests for the premium lab file upload component.
 * Verifies upload flow, status handling, and error states.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { LabUploadPanel } from '../../../../components/ai/clinical-reasoning/LabUploadPanel';
import type { LabAnalysisStatus } from '../../../../types/clinical-reasoning';

describe('LabUploadPanel', () => {
  const defaultProps = {
    status: 'idle' as LabAnalysisStatus,
    error: null as string | null,
    onFileSelect: vi.fn(),
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('idle state', () => {
    it('should render upload zone when idle', () => {
      render(<LabUploadPanel {...defaultProps} />);
      expect(screen.getByText('Análise de Exame Laboratorial')).toBeInTheDocument();
    });

    it('should show file type information', () => {
      render(<LabUploadPanel {...defaultProps} />);
      expect(screen.getByText(/PDF, JPG, PNG/i)).toBeInTheDocument();
    });

    it('should show action buttons', () => {
      render(<LabUploadPanel {...defaultProps} />);
      expect(screen.getByText('Escolher Arquivo')).toBeInTheDocument();
      expect(screen.getByText('Usar Câmera')).toBeInTheDocument();
    });

    it('should show feature badges', () => {
      render(<LabUploadPanel {...defaultProps} />);
      expect(screen.getByText('HIPAA Compliant')).toBeInTheDocument();
      expect(screen.getByText('Multi-LLM')).toBeInTheDocument();
    });
  });

  describe('uploading state', () => {
    it('should show uploading step as active', () => {
      render(<LabUploadPanel {...defaultProps} status="uploading" />);
      expect(screen.getByText('Enviando')).toBeInTheDocument();
    });

    it('should show processing header', () => {
      render(<LabUploadPanel {...defaultProps} status="uploading" />);
      expect(screen.getByText('Processando Análise')).toBeInTheDocument();
    });

    it('should show cancel button during upload', () => {
      render(<LabUploadPanel {...defaultProps} status="uploading" />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('extracting state', () => {
    it('should show extraction step as active', () => {
      render(<LabUploadPanel {...defaultProps} status="extracting" />);
      expect(screen.getByText('Extraindo')).toBeInTheDocument();
    });

    it('should show OCR description', () => {
      render(<LabUploadPanel {...defaultProps} status="extracting" />);
      expect(screen.getByText(/OCR identificando/i)).toBeInTheDocument();
    });
  });

  describe('processing state', () => {
    it('should show analysis step as active', () => {
      render(<LabUploadPanel {...defaultProps} status="processing" />);
      expect(screen.getByText('Analisando')).toBeInTheDocument();
    });

    it('should show AI description', () => {
      render(<LabUploadPanel {...defaultProps} status="processing" />);
      expect(screen.getByText(/IA processando/i)).toBeInTheDocument();
    });
  });

  describe('error state', () => {
    it('should display error message', () => {
      render(<LabUploadPanel {...defaultProps} status="error" error="Falha no upload" />);
      expect(screen.getByText(/Falha no upload/)).toBeInTheDocument();
    });

    it('should show error title', () => {
      render(<LabUploadPanel {...defaultProps} status="error" error="Erro de teste" />);
      expect(screen.getByText('Erro no Processamento')).toBeInTheDocument();
    });

    it('should show retry button', () => {
      render(<LabUploadPanel {...defaultProps} status="error" error="Erro" />);
      expect(screen.getByText('Tentar Novamente')).toBeInTheDocument();
    });
  });

  describe('ready state', () => {
    it('should show completion message', () => {
      render(<LabUploadPanel {...defaultProps} status="ready" />);
      expect(screen.getByText('Análise Concluída')).toBeInTheDocument();
    });

    it('should show review message', () => {
      render(<LabUploadPanel {...defaultProps} status="ready" />);
      expect(screen.getByText('Resultados prontos para revisão médica')).toBeInTheDocument();
    });
  });

  describe('status transitions', () => {
    it('should handle all status values without errors', () => {
      const statuses: LabAnalysisStatus[] = ['idle', 'uploading', 'extracting', 'processing', 'ready', 'error'];

      statuses.forEach((status) => {
        expect(() => {
          render(<LabUploadPanel {...defaultProps} status={status} />);
        }).not.toThrow();
      });
    });
  });
});
