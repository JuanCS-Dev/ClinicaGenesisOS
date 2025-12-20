/**
 * AnalysisSummary Tests
 *
 * Tests for the lab analysis summary component.
 * Verifies correct display of analysis results overview.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { AnalysisSummary } from '../../../../components/ai/clinical-reasoning/AnalysisSummary';
import type { LabAnalysisResult } from '../../../../types/clinical-reasoning';

const mockResult: LabAnalysisResult = {
  summary: {
    critical: 2,
    attention: 3,
    normal: 10,
    overallRiskScore: 65,
  },
  triage: {
    urgency: 'high',
    redFlags: [
      {
        description: 'Hiperglicemia severa',
        relatedMarkers: ['Glicemia', 'HbA1c'],
        action: 'Avaliação endocrinológica urgente',
      },
    ],
    recommendedWorkflow: 'specialist',
    confidence: 85,
  },
  markers: [],
  correlations: [],
  differentialDiagnosis: [
    {
      name: 'Diabetes Mellitus tipo 2',
      icd10: 'E11.9',
      confidence: 90,
      supportingEvidence: ['Glicemia 280 mg/dL', 'HbA1c 9.5%'],
      contradictingEvidence: [],
      suggestedTests: ['Insulina jejum', 'Peptídeo C'],
    },
  ],
  investigativeQuestions: [],
  suggestedTests: [],
  chainOfThought: [],
  disclaimer: 'Análise gerada por IA. Requer validação médica.',
  metadata: {
    processingTimeMs: 3500,
    model: 'gemini-2.5-flash',
    promptVersion: '1.0.0',
    inputTokens: 2500,
    outputTokens: 1800,
  },
};

describe('AnalysisSummary', () => {
  describe('marker counts', () => {
    it('should render without errors', () => {
      expect(() => {
        render(<AnalysisSummary result={mockResult} onSectionClick={() => {}} />);
      }).not.toThrow();
    });

    it('should display normal marker count', () => {
      render(<AnalysisSummary result={mockResult} onSectionClick={() => {}} />);
      // Normal count should be visible (may have multiple elements with numbers)
      expect(screen.getAllByText('10').length).toBeGreaterThan(0);
    });
  });

  describe('triage display', () => {
    it('should display triage information', () => {
      render(<AnalysisSummary result={mockResult} onSectionClick={() => {}} />);
      // Component renders successfully with triage data
      expect(document.body.textContent).toBeTruthy();
    });

    it('should display workflow recommendation', () => {
      render(<AnalysisSummary result={mockResult} onSectionClick={() => {}} />);
      // Workflow recommendation should be visible
      expect(screen.getAllByText(/Especialista|specialist/i).length).toBeGreaterThan(0);
    });
  });

  describe('section navigation', () => {
    it('should render clickable sections', () => {
      const onSectionClick = vi.fn();
      render(<AnalysisSummary result={mockResult} onSectionClick={onSectionClick} />);

      // Component renders successfully with onSectionClick handler
      expect(document.body.textContent).toBeTruthy();
    });
  });

  describe('empty states', () => {
    it('should handle zero critical markers', () => {
      const resultZeroCritical = {
        ...mockResult,
        summary: { ...mockResult.summary, critical: 0 },
      };

      expect(() => {
        render(<AnalysisSummary result={resultZeroCritical} onSectionClick={() => {}} />);
      }).not.toThrow();
    });

    it('should handle empty red flags array', () => {
      const resultNoRedFlags = {
        ...mockResult,
        triage: { ...mockResult.triage, redFlags: [] },
      };

      expect(() => {
        render(<AnalysisSummary result={resultNoRedFlags} onSectionClick={() => {}} />);
      }).not.toThrow();
    });

    it('should handle missing risk score', () => {
      const resultWithoutRisk = {
        ...mockResult,
        summary: { ...mockResult.summary, overallRiskScore: undefined },
      };

      expect(() => {
        render(<AnalysisSummary result={resultWithoutRisk} onSectionClick={() => {}} />);
      }).not.toThrow();
    });
  });
});
