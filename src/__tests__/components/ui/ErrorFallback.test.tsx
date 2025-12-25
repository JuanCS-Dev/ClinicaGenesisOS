/**
 * ErrorFallback Component Tests
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorFallback } from '../../../components/ui/ErrorFallback';

describe('ErrorFallback', () => {
  const mockError = new Error('Test error message');
  const mockResetBoundary = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders error message', () => {
      render(<ErrorFallback error={mockError} resetErrorBoundary={mockResetBoundary} />);
      expect(screen.getByText('Test error message')).toBeInTheDocument();
    });

    it('renders default error message when error has no message', () => {
      const emptyError = new Error();
      render(<ErrorFallback error={emptyError} resetErrorBoundary={mockResetBoundary} />);
      expect(screen.getByText('Erro inesperado na aplicação.')).toBeInTheDocument();
    });

    it('renders main title', () => {
      render(<ErrorFallback error={mockError} resetErrorBoundary={mockResetBoundary} />);
      expect(screen.getByText('Algo deu errado')).toBeInTheDocument();
    });

    it('renders retry button', () => {
      render(<ErrorFallback error={mockError} resetErrorBoundary={mockResetBoundary} />);
      expect(screen.getByRole('button', { name: /Tentar novamente/i })).toBeInTheDocument();
    });

    it('renders alert icon', () => {
      const { container } = render(
        <ErrorFallback error={mockError} resetErrorBoundary={mockResetBoundary} />
      );
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('calls resetErrorBoundary when retry button is clicked', () => {
      render(<ErrorFallback error={mockError} resetErrorBoundary={mockResetBoundary} />);

      const button = screen.getByRole('button', { name: /Tentar novamente/i });
      fireEvent.click(button);

      expect(mockResetBoundary).toHaveBeenCalledTimes(1);
    });
  });

  describe('styling', () => {
    it('has centered layout', () => {
      const { container } = render(
        <ErrorFallback error={mockError} resetErrorBoundary={mockResetBoundary} />
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('flex', 'items-center', 'justify-center');
    });
  });
});
