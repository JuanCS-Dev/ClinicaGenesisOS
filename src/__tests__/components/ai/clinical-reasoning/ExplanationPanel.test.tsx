/**
 * Explanation Panel Tests
 * =======================
 *
 * Unit tests for ExplanationPanel component.
 * Fase 13: Clinical Reasoning Explainability
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExplanationPanel } from '../../../../components/ai/clinical-reasoning/ExplanationPanel';
import type { DifferentialDiagnosis } from '@/types/clinical-reasoning';

describe('ExplanationPanel', () => {
  const mockDiagnosis: DifferentialDiagnosis = {
    name: 'Diabetes Tipo 2',
    icd10: 'E11',
    confidence: 85,
    supportingEvidence: [
      'Glicose em jejum elevada (142 mg/dL)',
      'HbA1c de 7.2%',
      'Histórico familiar positivo',
    ],
    contradictingEvidence: [
      'IMC normal',
    ],
    suggestedTests: [
      'TOTG (Teste Oral de Tolerância à Glicose)',
      'Peptídeo C',
    ],
  };

  it('renders diagnosis name in header', () => {
    render(<ExplanationPanel diagnosis={mockDiagnosis} />);

    expect(screen.getByText(/Por que Diabetes Tipo 2/)).toBeInTheDocument();
  });

  it('shows confidence percentage', () => {
    render(<ExplanationPanel diagnosis={mockDiagnosis} />);

    expect(screen.getByText('85%')).toBeInTheDocument();
  });

  it('expands on click', () => {
    render(<ExplanationPanel diagnosis={mockDiagnosis} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(screen.getByText('Fatores Contribuintes')).toBeInTheDocument();
  });

  it('shows ICD-10 code when expanded', () => {
    render(<ExplanationPanel diagnosis={mockDiagnosis} defaultExpanded />);

    expect(screen.getByText('ICD-10: E11')).toBeInTheDocument();
  });

  it('displays supporting evidence', () => {
    render(<ExplanationPanel diagnosis={mockDiagnosis} defaultExpanded />);

    expect(screen.getByText('Glicose em jejum elevada (142 mg/dL)')).toBeInTheDocument();
    expect(screen.getByText('HbA1c de 7.2%')).toBeInTheDocument();
  });

  it('displays contradicting evidence', () => {
    render(<ExplanationPanel diagnosis={mockDiagnosis} defaultExpanded />);

    expect(screen.getByText('IMC normal')).toBeInTheDocument();
  });

  it('shows suggested tests section', () => {
    render(<ExplanationPanel diagnosis={mockDiagnosis} defaultExpanded />);

    expect(screen.getByText('Exames para Confirmar')).toBeInTheDocument();
    expect(screen.getByText('TOTG (Teste Oral de Tolerância à Glicose)')).toBeInTheDocument();
    expect(screen.getByText('Peptídeo C')).toBeInTheDocument();
  });

  it('does not show tests section when empty', () => {
    const diagnosisNoTests: DifferentialDiagnosis = {
      ...mockDiagnosis,
      suggestedTests: [],
    };

    render(<ExplanationPanel diagnosis={diagnosisNoTests} defaultExpanded />);

    expect(screen.queryByText('Exames para Confirmar')).not.toBeInTheDocument();
  });

  it('shows low confidence warning when below 50%', () => {
    const lowConfidenceDiagnosis: DifferentialDiagnosis = {
      ...mockDiagnosis,
      confidence: 35,
    };

    render(<ExplanationPanel diagnosis={lowConfidenceDiagnosis} defaultExpanded />);

    expect(screen.getByText(/Confiança baixa/)).toBeInTheDocument();
  });

  it('does not show warning for high confidence', () => {
    render(<ExplanationPanel diagnosis={mockDiagnosis} defaultExpanded />);

    expect(screen.queryByText(/Confiança baixa/)).not.toBeInTheDocument();
  });

  it('toggles expanded state on click', () => {
    render(<ExplanationPanel diagnosis={mockDiagnosis} />);

    const button = screen.getByRole('button');

    // First click - expand
    fireEvent.click(button);
    expect(screen.getByText('Fatores Contribuintes')).toBeInTheDocument();

    // Second click - collapse
    fireEvent.click(button);
    expect(screen.queryByText('Fatores Contribuintes')).not.toBeInTheDocument();
  });

  it('applies green color for high confidence', () => {
    render(<ExplanationPanel diagnosis={mockDiagnosis} />);

    const confidenceElement = screen.getByText('85%');
    expect(confidenceElement).toHaveClass('text-green-600');
  });

  it('handles diagnosis without ICD-10', () => {
    const diagnosisNoIcd: DifferentialDiagnosis = {
      ...mockDiagnosis,
      icd10: undefined,
    };

    render(<ExplanationPanel diagnosis={diagnosisNoIcd} defaultExpanded />);

    expect(screen.queryByText(/ICD-10/)).not.toBeInTheDocument();
  });

  it('handles diagnosis without contradicting evidence', () => {
    const diagnosisNoContradict: DifferentialDiagnosis = {
      ...mockDiagnosis,
      contradictingEvidence: [],
    };

    render(<ExplanationPanel diagnosis={diagnosisNoContradict} defaultExpanded />);

    expect(screen.queryByText('IMC normal')).not.toBeInTheDocument();
  });
});

