/**
 * EmptyState Component Tests
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmptyState } from '../../../components/ui/EmptyState';
import type { IllustrationType } from '../../../components/ui/EmptyState';

describe('EmptyState', () => {
  describe('basic rendering', () => {
    it('renders title', () => {
      render(<EmptyState title="Nenhum documento" />);
      expect(screen.getByText('Nenhum documento')).toBeInTheDocument();
    });

    it('renders description when provided', () => {
      render(
        <EmptyState
          title="Nenhum documento"
          description="Comece criando seu primeiro documento"
        />
      );
      expect(screen.getByText('Comece criando seu primeiro documento')).toBeInTheDocument();
    });

    it('does not render description when not provided', () => {
      const { container } = render(<EmptyState title="Nenhum documento" />);
      const description = container.querySelector('.text-genesis-muted.max-w-sm');
      expect(description).not.toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <EmptyState title="Test" className="custom-class" />
      );
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('illustrations', () => {
    const illustrationTypes: IllustrationType[] = [
      'documents',
      'search',
      'success',
      'calendar',
      'patients',
      'inbox',
    ];

    it.each(illustrationTypes)('renders %s illustration', (type) => {
      const { container } = render(
        <EmptyState title="Test" illustration={type} />
      );
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveClass('animate-[float_3s_ease-in-out_infinite]');
    });

    it('renders documents illustration by default', () => {
      const { container } = render(<EmptyState title="Test" />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('action button', () => {
    it('renders action button when provided', () => {
      const handleClick = vi.fn();
      render(
        <EmptyState
          title="Nenhum documento"
          action={{ label: 'Criar', onClick: handleClick }}
        />
      );
      expect(screen.getByRole('button', { name: /Criar/i })).toBeInTheDocument();
    });

    it('does not render action button when not provided', () => {
      render(<EmptyState title="Nenhum documento" />);
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('calls onClick when action button is clicked', () => {
      const handleClick = vi.fn();
      render(
        <EmptyState
          title="Test"
          action={{ label: 'Criar', onClick: handleClick }}
        />
      );

      const button = screen.getByRole('button', { name: /Criar/i });
      fireEvent.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('renders arrow icon in action button', () => {
      const { container } = render(
        <EmptyState
          title="Test"
          action={{ label: 'Criar', onClick: vi.fn() }}
        />
      );
      // Arrow icon should be in the button
      const button = screen.getByRole('button');
      const svg = button.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('styling', () => {
    it('has centered text', () => {
      const { container } = render(<EmptyState title="Test" />);
      expect(container.firstChild).toHaveClass('text-center');
    });

    it('has padding', () => {
      const { container } = render(<EmptyState title="Test" />);
      expect(container.firstChild).toHaveClass('py-12', 'px-4');
    });
  });
});
