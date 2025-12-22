/**
 * Confidence Gauge Tests
 * ======================
 *
 * Unit tests for ConfidenceGauge and ConfidenceBar components.
 * Fase 13: Clinical Reasoning Explainability
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  ConfidenceGauge,
  ConfidenceBar,
} from '../../../../components/ai/clinical-reasoning/ConfidenceGauge';

describe('ConfidenceGauge', () => {
  it('renders confidence percentage', () => {
    render(<ConfidenceGauge confidence={75} />);

    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('shows "Alta" label for high confidence', () => {
    render(<ConfidenceGauge confidence={85} />);

    expect(screen.getByText('Alta')).toBeInTheDocument();
  });

  it('shows "Boa" label for good confidence', () => {
    render(<ConfidenceGauge confidence={65} />);

    expect(screen.getByText('Boa')).toBeInTheDocument();
  });

  it('shows "Moderada" label for moderate confidence', () => {
    render(<ConfidenceGauge confidence={45} />);

    expect(screen.getByText('Moderada')).toBeInTheDocument();
  });

  it('shows "Baixa" label for low confidence', () => {
    render(<ConfidenceGauge confidence={25} />);

    expect(screen.getByText('Baixa')).toBeInTheDocument();
  });

  it('shows "Muito Baixa" label for very low confidence', () => {
    render(<ConfidenceGauge confidence={15} />);

    expect(screen.getByText('Muito Baixa')).toBeInTheDocument();
  });

  it('hides label when showLabel is false', () => {
    render(<ConfidenceGauge confidence={75} showLabel={false} />);

    expect(screen.queryByText('Boa')).not.toBeInTheDocument();
  });

  it('shows strong consensus badge', () => {
    render(<ConfidenceGauge confidence={85} consensusLevel="strong" />);

    expect(screen.getByText('Consenso Forte')).toBeInTheDocument();
  });

  it('shows moderate consensus badge', () => {
    render(<ConfidenceGauge confidence={70} consensusLevel="moderate" />);

    expect(screen.getByText('Consenso Moderado')).toBeInTheDocument();
  });

  it('shows weak consensus badge', () => {
    render(<ConfidenceGauge confidence={50} consensusLevel="weak" />);

    expect(screen.getByText('Consenso Fraco')).toBeInTheDocument();
  });

  it('shows single model badge', () => {
    render(<ConfidenceGauge confidence={60} consensusLevel="single" />);

    expect(screen.getByText('Modelo Único')).toBeInTheDocument();
  });

  it('shows divergent badge', () => {
    render(<ConfidenceGauge confidence={40} consensusLevel="divergent" />);

    expect(screen.getByText('Divergente')).toBeInTheDocument();
  });

  it('hides consensus badge when showConsensus is false', () => {
    render(
      <ConfidenceGauge
        confidence={85}
        consensusLevel="strong"
        showConsensus={false}
      />
    );

    expect(screen.queryByText('Consenso Forte')).not.toBeInTheDocument();
  });

  it('renders small size variant', () => {
    const { container } = render(<ConfidenceGauge confidence={50} size="sm" />);

    // Check that the gauge container has small size
    const gaugeContainer = container.querySelector('.relative');
    expect(gaugeContainer).toHaveStyle({ width: '48px', height: '48px' });
  });

  it('renders large size variant', () => {
    const { container } = render(<ConfidenceGauge confidence={50} size="lg" />);

    const gaugeContainer = container.querySelector('.relative');
    expect(gaugeContainer).toHaveStyle({ width: '96px', height: '96px' });
  });

  it('renders default medium size', () => {
    const { container } = render(<ConfidenceGauge confidence={50} />);

    const gaugeContainer = container.querySelector('.relative');
    expect(gaugeContainer).toHaveStyle({ width: '64px', height: '64px' });
  });
});

describe('ConfidenceBar', () => {
  it('renders percentage', () => {
    render(<ConfidenceBar confidence={60} />);

    expect(screen.getByText('60%')).toBeInTheDocument();
  });

  it('renders custom label', () => {
    render(<ConfidenceBar confidence={75} label="Diagnóstico" />);

    expect(screen.getByText('Diagnóstico')).toBeInTheDocument();
  });

  it('hides percentage when showPercentage is false', () => {
    render(<ConfidenceBar confidence={75} showPercentage={false} />);

    expect(screen.queryByText('75%')).not.toBeInTheDocument();
  });

  it('shows both label and percentage', () => {
    render(<ConfidenceBar confidence={80} label="Confiança" />);

    expect(screen.getByText('Confiança')).toBeInTheDocument();
    expect(screen.getByText('80%')).toBeInTheDocument();
  });

  it('renders progress bar at correct width', () => {
    const { container } = render(<ConfidenceBar confidence={75} />);

    const progressBar = container.querySelector('.transition-all');
    expect(progressBar).toHaveStyle({ width: '75%' });
  });

  it('renders small height variant', () => {
    const { container } = render(<ConfidenceBar confidence={50} height="sm" />);

    const bar = container.querySelector('.bg-gray-200');
    expect(bar).toHaveClass('h-1.5');
  });

  it('renders default medium height', () => {
    const { container } = render(<ConfidenceBar confidence={50} />);

    const bar = container.querySelector('.bg-gray-200');
    expect(bar).toHaveClass('h-2.5');
  });

  it('applies correct color for high confidence', () => {
    render(<ConfidenceBar confidence={85} />);

    const percentage = screen.getByText('85%');
    expect(percentage).toHaveClass('text-green-600');
  });

  it('applies correct color for low confidence', () => {
    render(<ConfidenceBar confidence={25} />);

    const percentage = screen.getByText('25%');
    expect(percentage).toHaveClass('text-orange-600');
  });
});

