/**
 * ConsensusBadge Tests
 *
 * Tests for the multi-LLM consensus badge component.
 * Verifies correct visual representation of consensus levels.
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { ConsensusBadge, ModelComparison } from '../../../../components/ai/clinical-reasoning/ConsensusBadge';
import type { ConsensusLevel } from '../../../../types/clinical-reasoning';

describe('ConsensusBadge', () => {
  describe('consensus level rendering', () => {
    it('should render strong consensus label', () => {
      render(<ConsensusBadge level="strong" />);
      expect(screen.getByText('Consenso Forte')).toBeInTheDocument();
    });

    it('should render moderate consensus label', () => {
      render(<ConsensusBadge level="moderate" />);
      expect(screen.getByText('Consenso')).toBeInTheDocument();
    });

    it('should render weak consensus label', () => {
      render(<ConsensusBadge level="weak" />);
      expect(screen.getByText('Consenso Fraco')).toBeInTheDocument();
    });

    it('should render single model label', () => {
      render(<ConsensusBadge level="single" />);
      expect(screen.getByText('Modelo Único')).toBeInTheDocument();
    });

    it('should render divergent label', () => {
      render(<ConsensusBadge level="divergent" />);
      expect(screen.getByText('Divergência')).toBeInTheDocument();
    });
  });

  describe('label visibility', () => {
    it('should show label by default', () => {
      render(<ConsensusBadge level="strong" />);
      expect(screen.getByText('Consenso Forte')).toBeInTheDocument();
    });

    it('should hide label when showLabel is false', () => {
      render(<ConsensusBadge level="strong" showLabel={false} />);
      expect(screen.queryByText('Consenso Forte')).not.toBeInTheDocument();
    });
  });

  describe('size variants', () => {
    it('should render small size by default', () => {
      const { container } = render(<ConsensusBadge level="strong" />);
      const badge = container.querySelector('span');
      expect(badge).toHaveClass('text-xs');
    });

    it('should render medium size when specified', () => {
      const { container } = render(<ConsensusBadge level="strong" size="md" />);
      const badge = container.querySelector('span');
      expect(badge).toHaveClass('text-sm');
    });
  });

  describe('accessibility', () => {
    it('should have title attribute with description', () => {
      const { container } = render(<ConsensusBadge level="strong" />);
      const badge = container.querySelector('span');
      expect(badge).toHaveAttribute('title', 'Ambos os modelos concordam na posição do diagnóstico');
    });
  });

  describe('all consensus levels', () => {
    const levels: ConsensusLevel[] = ['strong', 'moderate', 'weak', 'single', 'divergent'];

    it.each(levels)('should render %s level without errors', (level) => {
      expect(() => render(<ConsensusBadge level={level} />)).not.toThrow();
    });
  });
});

describe('ModelComparison', () => {
  describe('rendering', () => {
    it('should render nothing when no model data provided', () => {
      const { container } = render(<ModelComparison />);
      expect(container.firstChild).toBeNull();
    });

    it('should render Gemini data when provided', () => {
      render(<ModelComparison gemini={{ rank: 1, confidence: 95 }} />);

      expect(screen.getByText('Gemini:')).toBeInTheDocument();
      expect(screen.getByText('#1')).toBeInTheDocument();
      expect(screen.getByText('(95%)')).toBeInTheDocument();
    });

    it('should render GPT-4o data when provided', () => {
      render(<ModelComparison gpt4o={{ rank: 2, confidence: 88 }} />);

      expect(screen.getByText('GPT-4o:')).toBeInTheDocument();
      expect(screen.getByText('#2')).toBeInTheDocument();
      expect(screen.getByText('(88%)')).toBeInTheDocument();
    });

    it('should render both models when both provided', () => {
      render(
        <ModelComparison
          gemini={{ rank: 1, confidence: 95 }}
          gpt4o={{ rank: 1, confidence: 92 }}
        />
      );

      expect(screen.getByText('Gemini:')).toBeInTheDocument();
      expect(screen.getByText('GPT-4o:')).toBeInTheDocument();
    });
  });

  describe('header', () => {
    it('should show "Detalhes por modelo" header', () => {
      render(<ModelComparison gemini={{ rank: 1, confidence: 90 }} />);
      expect(screen.getByText('Detalhes por modelo')).toBeInTheDocument();
    });
  });
});
