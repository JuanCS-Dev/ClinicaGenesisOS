/**
 * CorrelationCard Tests
 *
 * Tests for the clinical correlation pattern card.
 * Verifies correct display of multi-marker correlations.
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { CorrelationCard } from '../../../../components/ai/clinical-reasoning/CorrelationCard';
import type { ClinicalCorrelation, ConfidenceLevel, PatternType } from '../../../../types/clinical-reasoning';

const mockCorrelation: ClinicalCorrelation = {
  type: 'metabolic_syndrome' as PatternType,
  markers: ['Glicemia', 'Triglicerídeos', 'HDL', 'PA'],
  pattern: 'Síndrome Metabólica - 4/5 critérios ATP III',
  clinicalImplication: 'Risco cardiovascular elevado. Intervenção no estilo de vida prioritária.',
  confidence: 'high' as ConfidenceLevel,
  criteriaMet: '4/5 critérios ATP III',
};

const mockLowConfidenceCorrelation: ClinicalCorrelation = {
  type: 'insulin_resistance' as PatternType,
  markers: ['Glicemia', 'Insulina'],
  pattern: 'Possível resistência insulínica',
  clinicalImplication: 'Considerar avaliação HOMA-IR',
  confidence: 'low' as ConfidenceLevel,
};

describe('CorrelationCard', () => {
  describe('basic rendering', () => {
    it('should render pattern name', () => {
      render(<CorrelationCard correlation={mockCorrelation} />);
      expect(screen.getByText(/Síndrome Metabólica/)).toBeInTheDocument();
    });

    it('should render clinical implication', () => {
      render(<CorrelationCard correlation={mockCorrelation} />);
      expect(screen.getByText(/Risco cardiovascular elevado/)).toBeInTheDocument();
    });

    it('should render involved markers', () => {
      render(<CorrelationCard correlation={mockCorrelation} />);
      expect(screen.getByText(/Glicemia/)).toBeInTheDocument();
    });
  });

  describe('confidence levels', () => {
    it('should render high confidence correlation', () => {
      expect(() => {
        render(<CorrelationCard correlation={mockCorrelation} />);
      }).not.toThrow();
    });

    it('should render low confidence correlation', () => {
      expect(() => {
        render(<CorrelationCard correlation={mockLowConfidenceCorrelation} />);
      }).not.toThrow();
    });

    it('should render medium confidence correlation', () => {
      const mediumConfidence: ClinicalCorrelation = {
        ...mockCorrelation,
        confidence: 'medium' as ConfidenceLevel,
      };

      expect(() => {
        render(<CorrelationCard correlation={mediumConfidence} />);
      }).not.toThrow();
    });
  });

  describe('criteria display', () => {
    it('should handle missing criteria gracefully', () => {
      const correlationWithoutCriteria = {
        ...mockCorrelation,
        criteriaMet: undefined,
      };

      expect(() => {
        render(<CorrelationCard correlation={correlationWithoutCriteria} />);
      }).not.toThrow();
    });
  });

  describe('pattern types', () => {
    const patternTypes: PatternType[] = [
      'metabolic_syndrome',
      'insulin_resistance',
      'diabetes_type2',
      'hypothyroidism',
      'iron_deficiency_anemia',
      'chronic_inflammation',
    ];

    it.each(patternTypes)('should render %s pattern without errors', (type) => {
      const correlation: ClinicalCorrelation = {
        ...mockCorrelation,
        type,
      };

      expect(() => {
        render(<CorrelationCard correlation={correlation} />);
      }).not.toThrow();
    });
  });

  describe('marker list', () => {
    it('should render multiple markers', () => {
      render(<CorrelationCard correlation={mockCorrelation} />);
      // At least one marker should be visible
      expect(screen.getByText(/Glicemia/)).toBeInTheDocument();
    });

    it('should handle single marker correlation', () => {
      const singleMarker: ClinicalCorrelation = {
        ...mockCorrelation,
        markers: ['TSH'],
      };

      render(<CorrelationCard correlation={singleMarker} />);
      expect(screen.getByText(/TSH/)).toBeInTheDocument();
    });

    it('should handle many markers correlation', () => {
      const manyMarkers: ClinicalCorrelation = {
        ...mockCorrelation,
        markers: ['A', 'B', 'C', 'D', 'E', 'F'],
      };

      expect(() => {
        render(<CorrelationCard correlation={manyMarkers} />);
      }).not.toThrow();
    });
  });

  describe('accessibility', () => {
    it('should have semantic structure', () => {
      const { container } = render(<CorrelationCard correlation={mockCorrelation} />);

      // Should have heading or strong element for pattern name
      const heading = container.querySelector('h3, h4, strong, .font-medium, .font-semibold');
      expect(heading).toBeInTheDocument();
    });
  });
});
