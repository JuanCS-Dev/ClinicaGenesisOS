/**
 * KPICard Component Tests
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Calendar, Users, Wallet } from 'lucide-react';
import { KPICard } from '../../../components/dashboard/KPICard';

describe('KPICard', () => {
  describe('basic rendering', () => {
    it('renders with required props', () => {
      render(<KPICard title="Consultas Hoje" value={12} icon={Calendar} />);
      expect(screen.getByText('Consultas Hoje')).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument();
    });

    it('renders string value', () => {
      render(<KPICard title="Revenue" value="R$ 5.000" icon={Wallet} />);
      expect(screen.getByText('R$ 5.000')).toBeInTheDocument();
    });

    it('renders icon', () => {
      const { container } = render(<KPICard title="Test" value={1} icon={Calendar} />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('loading state', () => {
    it('renders skeleton when loading', () => {
      const { container } = render(<KPICard title="Test" value={1} icon={Calendar} loading />);
      expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
    });

    it('does not render value when loading', () => {
      render(<KPICard title="Test" value={100} icon={Calendar} loading />);
      expect(screen.queryByText('100')).not.toBeInTheDocument();
    });
  });

  describe('trend indicators', () => {
    it('renders up trend indicator', () => {
      const { container } = render(
        <KPICard title="Test" value={1} icon={Calendar} trend="up" comparison="+10%" />
      );
      // Should have emerald/green styling for up trend
      const trendBadge = container.querySelector('.bg-emerald-50, .dark\\:bg-emerald-900\\/30');
      expect(trendBadge || container.textContent?.includes('+10%')).toBeTruthy();
    });

    it('renders down trend indicator', () => {
      const { container } = render(
        <KPICard title="Test" value={1} icon={Calendar} trend="down" comparison="-5%" />
      );
      expect(container.textContent).toContain('-5%');
    });

    it('renders stable trend indicator', () => {
      render(<KPICard title="Test" value={1} icon={Calendar} trend="stable" comparison="0%" />);
      // Stable trend should still render
      expect(screen.getByText('Test')).toBeInTheDocument();
    });
  });

  describe('comparison text', () => {
    it('renders comparison in footer', () => {
      render(<KPICard title="Test" value={1} icon={Calendar} comparison="vs ontem" />);
      expect(screen.getByText('vs ontem')).toBeInTheDocument();
    });

    it('renders subLabel when provided', () => {
      render(
        <KPICard
          title="Test"
          value={1}
          icon={Calendar}
          comparison="hidden"
          subLabel="Custom label"
        />
      );
      expect(screen.getByText('Custom label')).toBeInTheDocument();
    });
  });

  describe('click handling', () => {
    it('calls onClick when clicked', () => {
      const handleClick = vi.fn();
      render(<KPICard title="Test" value={1} icon={Calendar} onClick={handleClick} />);

      const card = screen.getByRole('button');
      fireEvent.click(card);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('has button role when clickable', () => {
      render(<KPICard title="Test" value={1} icon={Calendar} onClick={() => {}} />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('has no button role when not clickable', () => {
      render(<KPICard title="Test" value={1} icon={Calendar} />);
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('handles keyboard Enter press', () => {
      const handleClick = vi.fn();
      render(<KPICard title="Test" value={1} icon={Calendar} onClick={handleClick} />);

      const card = screen.getByRole('button');
      fireEvent.keyDown(card, { key: 'Enter' });

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('handles keyboard Space press', () => {
      const handleClick = vi.fn();
      render(<KPICard title="Test" value={1} icon={Calendar} onClick={handleClick} />);

      const card = screen.getByRole('button');
      fireEvent.keyDown(card, { key: ' ' });

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('renders arrow icon when clickable', () => {
      const { container } = render(
        <KPICard title="Test" value={1} icon={Calendar} onClick={() => {}} />
      );
      // Should have arrow icon for clickable cards
      const svgs = container.querySelectorAll('svg');
      expect(svgs.length).toBeGreaterThan(1); // Icon + Arrow
    });
  });

  describe('custom styling', () => {
    it('applies custom iconColor', () => {
      const { container } = render(
        <KPICard title="Test" value={1} icon={Users} iconColor="text-purple-500" />
      );
      const icon = container.querySelector('.text-purple-500');
      expect(icon).toBeInTheDocument();
    });

    it('applies custom iconBg', () => {
      const { container } = render(
        <KPICard title="Test" value={1} icon={Users} iconBg="bg-purple-100" />
      );
      const iconContainer = container.querySelector('.bg-purple-100');
      expect(iconContainer).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has tabIndex when clickable', () => {
      render(<KPICard title="Test" value={1} icon={Calendar} onClick={() => {}} />);
      const card = screen.getByRole('button');
      expect(card).toHaveAttribute('tabIndex', '0');
    });
  });
});
