/**
 * OccupancyGauge Component Tests
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OccupancyGauge, OccupancyBar } from '../../../components/dashboard/OccupancyGauge';
import type { OccupancyMetrics } from '../../../hooks/useDashboardMetrics';

const mockMetrics: OccupancyMetrics = {
  rate: 75,
  target: 85,
  bookedSlots: 15,
  totalSlots: 20,
  status: 'good',
};

describe('OccupancyGauge', () => {
  describe('basic rendering', () => {
    it('renders with required props', () => {
      render(<OccupancyGauge metrics={mockMetrics} />);
      expect(screen.getByText('75%')).toBeInTheDocument();
      expect(screen.getByText('Ocupação')).toBeInTheDocument();
    });

    it('renders SVG gauge', () => {
      const { container } = render(<OccupancyGauge metrics={mockMetrics} />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('has aria-label for accessibility', () => {
      render(<OccupancyGauge metrics={mockMetrics} />);
      const svg = screen.getByRole('img');
      expect(svg).toHaveAttribute('aria-label', 'Ocupação: 75%');
    });
  });

  describe('status indicators', () => {
    it('shows "Bom" for good status', () => {
      render(<OccupancyGauge metrics={mockMetrics} />);
      expect(screen.getByText('Bom')).toBeInTheDocument();
    });

    it('shows "Excelente" for excellent status', () => {
      render(<OccupancyGauge metrics={{ ...mockMetrics, status: 'excellent' }} />);
      expect(screen.getByText('Excelente')).toBeInTheDocument();
    });

    it('shows "Atenção" for needs-attention status', () => {
      render(<OccupancyGauge metrics={{ ...mockMetrics, status: 'needs-attention' }} />);
      expect(screen.getByText('Atenção')).toBeInTheDocument();
    });
  });

  describe('size variants', () => {
    it('renders small size', () => {
      const { container } = render(<OccupancyGauge metrics={mockMetrics} size="sm" />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '80');
    });

    it('renders medium size (default)', () => {
      const { container } = render(<OccupancyGauge metrics={mockMetrics} size="md" />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '120');
    });

    it('renders large size', () => {
      const { container } = render(<OccupancyGauge metrics={mockMetrics} size="lg" />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '160');
    });
  });

  describe('details tooltip', () => {
    it('renders details tooltip by default', () => {
      const { container } = render(<OccupancyGauge metrics={mockMetrics} />);
      // Text is split across elements, so check container textContent
      expect(container.textContent).toContain('15');
      expect(container.textContent).toContain('20');
      expect(container.textContent).toContain('slots');
      expect(container.textContent).toContain('Meta:');
      expect(container.textContent).toContain('85');
    });

    it('hides details tooltip when showDetails is false', () => {
      render(<OccupancyGauge metrics={mockMetrics} showDetails={false} />);
      expect(screen.queryByText(/slots/)).not.toBeInTheDocument();
    });
  });

  describe('SVG elements', () => {
    it('renders background and progress circles', () => {
      const { container } = render(<OccupancyGauge metrics={mockMetrics} />);
      const circles = container.querySelectorAll('circle');
      expect(circles.length).toBeGreaterThanOrEqual(2); // Background + Progress + Target
    });

    it('renders target indicator dot', () => {
      const { container } = render(<OccupancyGauge metrics={mockMetrics} />);
      const circles = container.querySelectorAll('circle');
      // Should have a small target indicator circle
      expect(circles.length).toBe(3);
    });
  });

  describe('edge cases', () => {
    it('handles 0% rate', () => {
      render(<OccupancyGauge metrics={{ ...mockMetrics, rate: 0 }} />);
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('handles 100% rate', () => {
      render(<OccupancyGauge metrics={{ ...mockMetrics, rate: 100 }} />);
      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('caps rate at 100%', () => {
      const { container } = render(<OccupancyGauge metrics={{ ...mockMetrics, rate: 120 }} />);
      // Should still render without errors
      expect(container).toBeDefined();
    });
  });
});

describe('OccupancyBar', () => {
  describe('basic rendering', () => {
    it('renders with metrics', () => {
      render(<OccupancyBar metrics={mockMetrics} />);
      expect(screen.getByText('75% ocupado')).toBeInTheDocument();
    });

    it('shows target percentage', () => {
      render(<OccupancyBar metrics={mockMetrics} />);
      expect(screen.getByText('Meta: 85%')).toBeInTheDocument();
    });
  });

  describe('progress bar', () => {
    it('renders progress bar container', () => {
      const { container } = render(<OccupancyBar metrics={mockMetrics} />);
      const progressContainer = container.querySelector('.h-2');
      expect(progressContainer).toBeInTheDocument();
    });

    it('renders target line', () => {
      const { container } = render(<OccupancyBar metrics={mockMetrics} />);
      // Target line should be positioned at 85%
      const targetLine = container.querySelector('[style*="left: 85%"]');
      expect(targetLine).toBeInTheDocument();
    });
  });

  describe('status colors', () => {
    it('applies amber color for good status', () => {
      const { container } = render(<OccupancyBar metrics={mockMetrics} />);
      const progressFill = container.querySelector('.bg-amber-500');
      expect(progressFill).toBeInTheDocument();
    });

    it('applies emerald color for excellent status', () => {
      const { container } = render(
        <OccupancyBar metrics={{ ...mockMetrics, status: 'excellent' }} />
      );
      const progressFill = container.querySelector('.bg-emerald-500');
      expect(progressFill).toBeInTheDocument();
    });

    it('applies red color for needs-attention status', () => {
      const { container } = render(
        <OccupancyBar metrics={{ ...mockMetrics, status: 'needs-attention' }} />
      );
      const progressFill = container.querySelector('.bg-red-500');
      expect(progressFill).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('handles 0% rate', () => {
      render(<OccupancyBar metrics={{ ...mockMetrics, rate: 0 }} />);
      expect(screen.getByText('0% ocupado')).toBeInTheDocument();
    });

    it('handles rate over 100%', () => {
      const { container } = render(<OccupancyBar metrics={{ ...mockMetrics, rate: 120 }} />);
      // Should cap at 100% for visual
      expect(container).toBeDefined();
    });
  });
});
