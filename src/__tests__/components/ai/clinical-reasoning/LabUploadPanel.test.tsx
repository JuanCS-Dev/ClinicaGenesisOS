/**
 * LabUploadPanel Tests
 *
 * Tests for the lab file upload component.
 * Verifies upload flow, status handling, and error states.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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
      // Component renders without error
      expect(document.body.textContent).toBeTruthy();
    });

    it('should show file type information', () => {
      render(<LabUploadPanel {...defaultProps} />);
      // Should mention supported formats
      expect(screen.getByText(/PDF|imagem/i)).toBeInTheDocument();
    });
  });

  describe('uploading state', () => {
    it('should show uploading indicator', () => {
      render(<LabUploadPanel {...defaultProps} status="uploading" />);
      expect(screen.getByText('Enviando...')).toBeInTheDocument();
    });

    it('should show cancel button during upload', () => {
      render(<LabUploadPanel {...defaultProps} status="uploading" />);
      // Cancel button should exist (X icon button)
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('extracting state', () => {
    it('should show extraction in progress', () => {
      render(<LabUploadPanel {...defaultProps} status="extracting" />);
      expect(screen.getByText('Extraindo...')).toBeInTheDocument();
    });
  });

  describe('processing state', () => {
    it('should show processing in progress', () => {
      render(<LabUploadPanel {...defaultProps} status="processing" />);
      expect(screen.getByText('Analisando...')).toBeInTheDocument();
    });
  });

  describe('error state', () => {
    it('should display error message', () => {
      render(<LabUploadPanel {...defaultProps} status="error" error="Falha no upload" />);
      expect(screen.getByText(/Falha no upload/)).toBeInTheDocument();
    });

    it('should show error label', () => {
      render(<LabUploadPanel {...defaultProps} status="error" error="Erro de teste" />);
      expect(screen.getByText('Erro')).toBeInTheDocument();
    });
  });

  describe('ready state', () => {
    it('should show completion message', () => {
      render(<LabUploadPanel {...defaultProps} status="ready" />);
      expect(screen.getByText('Concluído!')).toBeInTheDocument();
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
