/**
 * BiomarkerCard Tests
 *
 * Tests for the biomarker display component.
 * Verifies correct rendering of lab values and status indicators.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { BiomarkerCard } from '../../../../components/ai/clinical-reasoning/BiomarkerCard';
import type { ExtractedBiomarker } from '../../../../types/clinical-reasoning';

const mockNormalMarker: ExtractedBiomarker = {
  id: 'tsh-1',
  name: 'TSH',
  value: 2.5,
  unit: 'mUI/L',
  labRange: { min: 0.4, max: 4.0 },
  functionalRange: { min: 1.0, max: 2.5 },
  status: 'normal',
  interpretation: 'Valor dentro da faixa normal',
};

const mockCriticalMarker: ExtractedBiomarker = {
  id: 'glucose-1',
  name: 'Glicemia Jejum',
  value: 280,
  unit: 'mg/dL',
  labRange: { min: 70, max: 99 },
  functionalRange: { min: 75, max: 90 },
  status: 'critical',
  interpretation: 'Hiperglicemia severa, sugestivo de diabetes descompensado',
  deviationScore: 85,
};

const mockAttentionMarker: ExtractedBiomarker = {
  id: 'hba1c-1',
  name: 'HbA1c',
  value: 6.2,
  unit: '%',
  labRange: { min: 0, max: 5.7 },
  functionalRange: { min: 4.5, max: 5.5 },
  status: 'attention',
  interpretation: 'Pré-diabetes',
};

describe('BiomarkerCard', () => {
  describe('basic rendering', () => {
    it('should render marker name', () => {
      render(<BiomarkerCard marker={mockNormalMarker} expanded={false} onToggle={() => {}} />);
      expect(screen.getByText('TSH')).toBeInTheDocument();
    });

    it('should render marker value', () => {
      render(<BiomarkerCard marker={mockNormalMarker} expanded={false} onToggle={() => {}} />);
      // Value is formatted with pt-BR locale (2.5 -> "2,5")
      expect(screen.getAllByText(/2,5|2\.5/).length).toBeGreaterThan(0);
    });

    it('should render marker unit', () => {
      render(<BiomarkerCard marker={mockNormalMarker} expanded={false} onToggle={() => {}} />);
      expect(screen.getByText('mUI/L')).toBeInTheDocument();
    });
  });

  describe('status handling', () => {
    it('should render normal status marker', () => {
      expect(() => {
        render(<BiomarkerCard marker={mockNormalMarker} expanded={false} onToggle={() => {}} />);
      }).not.toThrow();
    });

    it('should render critical status marker', () => {
      render(<BiomarkerCard marker={mockCriticalMarker} expanded={false} onToggle={() => {}} />);
      expect(screen.getByText('Glicemia Jejum')).toBeInTheDocument();
    });

    it('should render attention status marker', () => {
      render(<BiomarkerCard marker={mockAttentionMarker} expanded={false} onToggle={() => {}} />);
      expect(screen.getByText('HbA1c')).toBeInTheDocument();
    });
  });

  describe('expansion behavior', () => {
    it('should call onToggle when clicked', () => {
      const onToggle = vi.fn();
      render(<BiomarkerCard marker={mockNormalMarker} expanded={false} onToggle={onToggle} />);

      // Find the clickable element (card container)
      const buttons = screen.getAllByRole('button');
      if (buttons.length > 0) {
        fireEvent.click(buttons[0]);
        expect(onToggle).toHaveBeenCalled();
      }
    });

    it('should show interpretation when expanded', () => {
      render(<BiomarkerCard marker={mockNormalMarker} expanded={true} onToggle={() => {}} />);
      expect(screen.getByText('Valor dentro da faixa normal')).toBeInTheDocument();
    });

    it('should hide interpretation when collapsed', () => {
      render(<BiomarkerCard marker={mockNormalMarker} expanded={false} onToggle={() => {}} />);
      expect(screen.queryByText('Valor dentro da faixa normal')).not.toBeInTheDocument();
    });
  });

  describe('reference ranges', () => {
    it('should show lab reference when expanded', () => {
      render(<BiomarkerCard marker={mockNormalMarker} expanded={true} onToggle={() => {}} />);
      // Lab range values should be visible (using getAllByText since multiple may exist)
      expect(screen.getAllByText(/0\.4/).length).toBeGreaterThan(0);
    });
  });

  describe('all statuses', () => {
    it('should handle all status types without errors', () => {
      const statuses: Array<'normal' | 'attention' | 'critical'> = ['normal', 'attention', 'critical'];

      statuses.forEach((status) => {
        const marker = { ...mockNormalMarker, status };
        expect(() => {
          render(<BiomarkerCard marker={marker} expanded={false} onToggle={() => {}} />);
        }).not.toThrow();
      });
    });
  });
});
