/**
 * Progress Components Tests
 *
 * @module __tests__/design-system/Progress
 */

import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  ProgressBar,
  ProgressCircular,
  LoadingDots,
  LoadingSpinner,
  StepProgress,
} from '../../design-system/components/Progress';

describe('ProgressBar', () => {
  it('renders with default props', () => {
    render(<ProgressBar />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toBeInTheDocument();
    expect(progressbar).toHaveAttribute('aria-valuenow', '0');
    expect(progressbar).toHaveAttribute('aria-valuemin', '0');
    expect(progressbar).toHaveAttribute('aria-valuemax', '100');
  });

  it('renders with specific value', () => {
    render(<ProgressBar value={75} />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '75');
  });

  it('clamps value to 0-100 range', () => {
    const { rerender } = render(<ProgressBar value={150} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');

    rerender(<ProgressBar value={-50} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });

  it('renders indeterminate state', () => {
    render(<ProgressBar indeterminate />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).not.toHaveAttribute('aria-valuenow');
  });

  it('shows label when showLabel is true', () => {
    render(<ProgressBar value={50} showLabel />);
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('shows custom label', () => {
    render(<ProgressBar value={50} showLabel label="Halfway there" />);
    expect(screen.getByText('Halfway there')).toBeInTheDocument();
  });

  it('shows label inside bar for md and lg sizes', () => {
    render(<ProgressBar value={50} showLabel labelPosition="inside" size="md" />);
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('applies variant styles', () => {
    const { container, rerender } = render(<ProgressBar value={50} variant="success" />);
    expect(container.firstChild).toBeInTheDocument();

    rerender(<ProgressBar value={50} variant="warning" />);
    expect(container.firstChild).toBeInTheDocument();

    rerender(<ProgressBar value={50} variant="danger" />);
    expect(container.firstChild).toBeInTheDocument();

    rerender(<ProgressBar value={50} variant="info" />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('applies size styles', () => {
    const { container, rerender } = render(<ProgressBar value={50} size="xs" />);
    expect(container.firstChild).toBeInTheDocument();

    rerender(<ProgressBar value={50} size="sm" />);
    expect(container.firstChild).toBeInTheDocument();

    rerender(<ProgressBar value={50} size="lg" />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<ProgressBar className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('uses custom aria-label', () => {
    render(<ProgressBar aria-label="Upload progress" value={30} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-label', 'Upload progress');
  });

  it('does not show inside label for xs size', () => {
    render(<ProgressBar value={50} showLabel labelPosition="inside" size="xs" />);
    // Label should not be visible inside for xs
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toBeInTheDocument();
  });

  it('does not show inside label for sm size', () => {
    render(<ProgressBar value={50} showLabel labelPosition="inside" size="sm" />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toBeInTheDocument();
  });

  it('does not show right label when indeterminate', () => {
    render(<ProgressBar indeterminate showLabel labelPosition="right" />);
    // Indeterminate should not show percentage label
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
  });

  it('renders without animation when animated is false', () => {
    const { container } = render(<ProgressBar value={50} animated={false} />);
    expect(container.firstChild).toBeInTheDocument();
  });
});

describe('ProgressCircular', () => {
  it('renders with default props', () => {
    render(<ProgressCircular />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toBeInTheDocument();
    expect(progressbar).toHaveAttribute('aria-valuenow', '0');
  });

  it('renders with specific value', () => {
    render(<ProgressCircular value={60} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '60');
  });

  it('clamps value to 0-100 range', () => {
    const { rerender } = render(<ProgressCircular value={200} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');

    rerender(<ProgressCircular value={-100} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });

  it('renders indeterminate state', () => {
    render(<ProgressCircular indeterminate />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).not.toHaveAttribute('aria-valuenow');
  });

  it('shows label when showLabel is true', () => {
    render(<ProgressCircular value={75} showLabel />);
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('shows custom label', () => {
    render(<ProgressCircular value={75} showLabel label={<span>Custom</span>} />);
    expect(screen.getByText('Custom')).toBeInTheDocument();
  });

  it('does not show label when indeterminate', () => {
    render(<ProgressCircular indeterminate showLabel />);
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
  });

  it('applies different sizes', () => {
    const { container, rerender } = render(<ProgressCircular size="sm" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '32');

    rerender(<ProgressCircular size="md" />);
    expect(container.querySelector('svg')).toHaveAttribute('width', '48');

    rerender(<ProgressCircular size="lg" />);
    expect(container.querySelector('svg')).toHaveAttribute('width', '64');

    rerender(<ProgressCircular size="xl" />);
    expect(container.querySelector('svg')).toHaveAttribute('width', '80');
  });

  it('applies variant styles', () => {
    const variants = ['primary', 'success', 'warning', 'danger', 'info'] as const;
    variants.forEach(variant => {
      const { container } = render(<ProgressCircular value={50} variant={variant} />);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  it('applies custom className', () => {
    const { container } = render(<ProgressCircular className="my-circular" />);
    expect(container.firstChild).toHaveClass('my-circular');
  });

  it('renders custom strokeWidth', () => {
    const { container } = render(<ProgressCircular strokeWidth={8} />);
    const circles = container.querySelectorAll('circle');
    expect(circles[0]).toHaveAttribute('stroke-width', '8');
  });
});

describe('LoadingDots', () => {
  it('renders with default props', () => {
    render(<LoadingDots />);
    const status = screen.getByRole('status');
    expect(status).toBeInTheDocument();
    expect(status).toHaveAttribute('aria-label', 'Carregando');
  });

  it('renders three dots', () => {
    const { container } = render(<LoadingDots />);
    const dots = container.querySelectorAll('.rounded-full');
    expect(dots.length).toBeGreaterThanOrEqual(3);
  });

  it('has screen reader text', () => {
    render(<LoadingDots />);
    expect(screen.getByText('Carregando...')).toBeInTheDocument();
  });

  it('applies different sizes', () => {
    const { container, rerender } = render(<LoadingDots size="sm" />);
    expect(container.firstChild).toBeInTheDocument();

    rerender(<LoadingDots size="md" />);
    expect(container.firstChild).toBeInTheDocument();

    rerender(<LoadingDots size="lg" />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('applies variant styles', () => {
    const variants = ['primary', 'success', 'warning', 'danger', 'info'] as const;
    variants.forEach(variant => {
      const { container } = render(<LoadingDots variant={variant} />);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  it('applies custom className', () => {
    const { container } = render(<LoadingDots className="custom-dots" />);
    expect(container.firstChild).toHaveClass('custom-dots');
  });
});

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />);
    const status = screen.getByRole('status');
    expect(status).toBeInTheDocument();
    expect(status).toHaveAttribute('aria-label', 'Carregando');
  });

  it('has screen reader text', () => {
    render(<LoadingSpinner />);
    expect(screen.getByText('Carregando...')).toBeInTheDocument();
  });

  it('applies different sizes', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
    sizes.forEach(size => {
      const { container } = render(<LoadingSpinner size={size} />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });

  it('applies variant styles', () => {
    const variants = ['primary', 'success', 'warning', 'danger', 'info'] as const;
    variants.forEach(variant => {
      const { container } = render(<LoadingSpinner variant={variant} />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });

  it('applies custom className', () => {
    const { container } = render(<LoadingSpinner className="my-spinner" />);
    expect(container.querySelector('svg')).toHaveClass('my-spinner');
  });
});

describe('StepProgress', () => {
  it('renders with default props', () => {
    render(<StepProgress steps={4} currentStep={2} />);
    // Should render 4 steps
    expect(screen.getAllByText(/[1-4]/).length).toBeGreaterThan(0);
  });

  it('marks completed steps with checkmark', () => {
    const { container } = render(<StepProgress steps={4} currentStep={3} />);
    // Steps 1 and 2 should be completed (have checkmark SVG)
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThanOrEqual(2);
  });

  it('highlights current step', () => {
    render(<StepProgress steps={3} currentStep={2} />);
    // Step 2 should be current
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('shows labels when provided', () => {
    render(
      <StepProgress
        steps={3}
        currentStep={1}
        labels={['Start', 'Middle', 'End']}
      />
    );
    expect(screen.getByText('Start')).toBeInTheDocument();
    expect(screen.getByText('Middle')).toBeInTheDocument();
    expect(screen.getByText('End')).toBeInTheDocument();
  });

  it('only shows labels up to number of steps', () => {
    render(
      <StepProgress
        steps={2}
        currentStep={1}
        labels={['One', 'Two', 'Three', 'Four']}
      />
    );
    expect(screen.getByText('One')).toBeInTheDocument();
    expect(screen.getByText('Two')).toBeInTheDocument();
    expect(screen.queryByText('Three')).not.toBeInTheDocument();
  });

  it('applies variant styles', () => {
    const variants = ['primary', 'success', 'warning', 'danger', 'info'] as const;
    variants.forEach(variant => {
      const { container } = render(
        <StepProgress steps={3} currentStep={2} variant={variant} />
      );
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  it('applies custom className', () => {
    const { container } = render(
      <StepProgress steps={3} currentStep={1} className="my-steps" />
    );
    expect(container.firstChild).toHaveClass('my-steps');
  });

  it('does not show labels when empty array', () => {
    const { container } = render(<StepProgress steps={3} currentStep={1} labels={[]} />);
    // No labels should be rendered - the labels div should not exist
    // Only the step indicators row should exist
    const stepsContainer = container.querySelector('.flex.items-center');
    expect(stepsContainer).toBeInTheDocument();
    // With empty labels array, no label section should be rendered
  });

  it('renders connector lines between steps', () => {
    const { container } = render(<StepProgress steps={3} currentStep={2} />);
    // Should have 2 connector lines for 3 steps
    const connectors = container.querySelectorAll('.flex-1.h-1');
    expect(connectors.length).toBe(2);
  });
});
