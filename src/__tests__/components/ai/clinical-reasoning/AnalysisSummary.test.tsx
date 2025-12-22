/**
 * AnalysisSummary Tests
 * =====================
 *
 * Unit tests for AnalysisSummary component.
 * Fase 15: Coverage Enhancement (95%+)
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AnalysisSummary } from '../../../../components/ai/clinical-reasoning/AnalysisSummary';
import type { LabAnalysisResult } from '@/types';

// Create mock result factory
function createMockResult(overrides: Partial<LabAnalysisResult> = {}): LabAnalysisResult {
  return {
    summary: {
      critical: 2,
      attention: 3,
      normal: 10,
      total: 15,
    },
    triage: {
      urgency: 'routine',
      redFlags: [],
      recommendedWorkflow: 'primary_care',
      suggestedActions: [],
    },
    markers: [],
    correlations: [],
    differentialDiagnosis: [],
    metadata: {
      processingTimeMs: 1500,
      promptVersion: 'genesis:1.0|multi',
      modelUsed: 'gemini-2.5-flash',
    },
    ...overrides,
  };
}

describe('AnalysisSummary', () => {
  describe('Urgency Levels', () => {
    it('displays routine urgency correctly', () => {
      const result = createMockResult({
        triage: {
          urgency: 'routine',
          redFlags: [],
          recommendedWorkflow: 'primary_care',
          suggestedActions: [],
        },
      });

      render(<AnalysisSummary result={result} />);

      expect(screen.getByText('ROTINA')).toBeInTheDocument();
      expect(screen.getByText('Acompanhamento padrão')).toBeInTheDocument();
      expect(screen.getByText('Atenção Primária')).toBeInTheDocument();
    });

    it('displays high urgency correctly', () => {
      const result = createMockResult({
        triage: {
          urgency: 'high',
          redFlags: ['Anemia severa'],
          recommendedWorkflow: 'specialist',
          suggestedActions: [],
        },
      });

      render(<AnalysisSummary result={result} />);

      expect(screen.getByText('URGÊNCIA')).toBeInTheDocument();
      expect(screen.getByText('Avaliação prioritária')).toBeInTheDocument();
      expect(screen.getByText('Especialista')).toBeInTheDocument();
    });

    it('displays critical urgency correctly', () => {
      const result = createMockResult({
        triage: {
          urgency: 'critical',
          redFlags: ['Hipercalemia severa', 'Creatinina > 10'],
          recommendedWorkflow: 'emergency',
          suggestedActions: [],
        },
      });

      render(<AnalysisSummary result={result} />);

      expect(screen.getByText('CRÍTICO')).toBeInTheDocument();
      expect(screen.getByText('Ação imediata necessária')).toBeInTheDocument();
      expect(screen.getByText('Emergência')).toBeInTheDocument();
    });
  });

  describe('Red Flags', () => {
    it('displays red flag count when present', () => {
      const result = createMockResult({
        triage: {
          urgency: 'high',
          redFlags: ['Red flag 1', 'Red flag 2'],
          recommendedWorkflow: 'specialist',
          suggestedActions: [],
        },
      });

      render(<AnalysisSummary result={result} />);

      expect(screen.getByText(/2 red flag\(s\) identificado\(s\)/)).toBeInTheDocument();
    });

    it('does not display red flag message when none exist', () => {
      const result = createMockResult({
        triage: {
          urgency: 'routine',
          redFlags: [],
          recommendedWorkflow: 'primary_care',
          suggestedActions: [],
        },
      });

      render(<AnalysisSummary result={result} />);

      expect(screen.queryByText(/red flag/)).not.toBeInTheDocument();
    });
  });

  describe('Stats Grid', () => {
    it('displays critical count', () => {
      const result = createMockResult({
        summary: { critical: 5, attention: 3, normal: 10, total: 18 },
      });

      render(<AnalysisSummary result={result} />);

      expect(screen.getByText('Críticos')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('displays attention count', () => {
      const result = createMockResult({
        summary: { critical: 2, attention: 7, normal: 10, total: 19 },
      });

      render(<AnalysisSummary result={result} />);

      expect(screen.getByText('Atenção')).toBeInTheDocument();
      expect(screen.getByText('7')).toBeInTheDocument();
    });

    it('displays normal count', () => {
      const result = createMockResult({
        summary: { critical: 2, attention: 3, normal: 15, total: 20 },
      });

      render(<AnalysisSummary result={result} />);

      expect(screen.getByText('Normais')).toBeInTheDocument();
      expect(screen.getByText('15')).toBeInTheDocument();
    });
  });

  describe('Correlations', () => {
    it('displays correlations when present', () => {
      const result = createMockResult({
        correlations: [
          {
            pattern: 'Síndrome Metabólica',
            confidence: 'high',
            relatedMarkers: ['Glicemia', 'Triglicerídeos'],
            clinicalImplication: 'Risco cardiovascular aumentado',
          },
          {
            pattern: 'Hipotireoidismo',
            confidence: 'medium',
            relatedMarkers: ['TSH', 'T4'],
            clinicalImplication: 'Avaliação tireoidiana recomendada',
          },
        ],
      });

      render(<AnalysisSummary result={result} />);

      expect(screen.getByText('Padrões Clínicos Identificados')).toBeInTheDocument();
      expect(screen.getByText('2 padrão(s)')).toBeInTheDocument();
      expect(screen.getByText('Síndrome Metabólica')).toBeInTheDocument();
      expect(screen.getByText('Alta')).toBeInTheDocument();
      expect(screen.getByText('Hipotireoidismo')).toBeInTheDocument();
      expect(screen.getByText('Média')).toBeInTheDocument();
    });

    it('displays low confidence correlations', () => {
      const result = createMockResult({
        correlations: [
          {
            pattern: 'Possível deficiência vitamínica',
            confidence: 'low',
            relatedMarkers: ['VCM'],
            clinicalImplication: 'Investigar',
          },
        ],
      });

      render(<AnalysisSummary result={result} />);

      expect(screen.getByText('Baixa')).toBeInTheDocument();
    });

    it('shows "+X mais" when more than 3 correlations', () => {
      const result = createMockResult({
        correlations: [
          { pattern: 'Pattern 1', confidence: 'high', relatedMarkers: [], clinicalImplication: '' },
          { pattern: 'Pattern 2', confidence: 'high', relatedMarkers: [], clinicalImplication: '' },
          { pattern: 'Pattern 3', confidence: 'high', relatedMarkers: [], clinicalImplication: '' },
          { pattern: 'Pattern 4', confidence: 'high', relatedMarkers: [], clinicalImplication: '' },
          { pattern: 'Pattern 5', confidence: 'high', relatedMarkers: [], clinicalImplication: '' },
        ],
      });

      render(<AnalysisSummary result={result} />);

      expect(screen.getByText('+2 mais...')).toBeInTheDocument();
    });

    it('does not display correlations section when empty', () => {
      const result = createMockResult({
        correlations: [],
      });

      render(<AnalysisSummary result={result} />);

      expect(screen.queryByText('Padrões Clínicos Identificados')).not.toBeInTheDocument();
    });
  });

  describe('Click Handlers', () => {
    it('calls onSectionClick with "triage" when triage banner clicked', () => {
      const mockOnClick = vi.fn();
      const result = createMockResult();

      render(<AnalysisSummary result={result} onSectionClick={mockOnClick} />);

      const triageBanner = screen.getByText('ROTINA').closest('div[class*="cursor-pointer"]');
      if (triageBanner) {
        fireEvent.click(triageBanner);
      }

      expect(mockOnClick).toHaveBeenCalledWith('triage');
    });

    it('calls onSectionClick with "markers" when critical card clicked', () => {
      const mockOnClick = vi.fn();
      const result = createMockResult();

      render(<AnalysisSummary result={result} onSectionClick={mockOnClick} />);

      const criticalCard = screen.getByText('Críticos').closest('div[class*="cursor-pointer"]');
      if (criticalCard) {
        fireEvent.click(criticalCard);
      }

      expect(mockOnClick).toHaveBeenCalledWith('markers');
    });

    it('calls onSectionClick with "correlations" when correlations clicked', () => {
      const mockOnClick = vi.fn();
      const result = createMockResult({
        correlations: [
          { pattern: 'Test', confidence: 'high', relatedMarkers: [], clinicalImplication: '' },
        ],
      });

      render(<AnalysisSummary result={result} onSectionClick={mockOnClick} />);

      const correlationsCard = screen.getByText('Padrões Clínicos Identificados').closest('div[class*="cursor-pointer"]');
      if (correlationsCard) {
        fireEvent.click(correlationsCard);
      }

      expect(mockOnClick).toHaveBeenCalledWith('correlations');
    });

    it('handles click without onSectionClick prop', () => {
      const result = createMockResult();

      // Should not throw
      const { container } = render(<AnalysisSummary result={result} />);
      
      const triageBanner = container.querySelector('div[class*="cursor-pointer"]');
      if (triageBanner) {
        fireEvent.click(triageBanner);
      }

      // No error thrown
      expect(true).toBe(true);
    });
  });

  describe('Metadata Footer', () => {
    it('displays processing time', () => {
      const result = createMockResult({
        metadata: {
          processingTimeMs: 2500,
          promptVersion: 'genesis:2.0|multi',
          modelUsed: 'gemini-2.5-flash',
        },
      });

      render(<AnalysisSummary result={result} />);

      expect(screen.getByText('2.5s')).toBeInTheDocument();
    });

    it('displays model name', () => {
      const result = createMockResult();

      render(<AnalysisSummary result={result} />);

      expect(screen.getByText('Gemini 2.5 Flash')).toBeInTheDocument();
    });

    it('displays version', () => {
      const result = createMockResult({
        metadata: {
          processingTimeMs: 1000,
          promptVersion: 'genesis:3.5|multi',
          modelUsed: 'gemini-2.5-flash',
        },
      });

      render(<AnalysisSummary result={result} />);

      expect(screen.getByText('v3.5')).toBeInTheDocument();
    });
  });
});
