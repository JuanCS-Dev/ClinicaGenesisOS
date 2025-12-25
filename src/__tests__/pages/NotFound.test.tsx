/**
 * NotFound Page Tests
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { NotFound } from '../../pages/NotFound';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('NotFound', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderNotFound = () => {
    return render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );
  };

  describe('rendering', () => {
    it('renders 404 text', () => {
      renderNotFound();
      expect(screen.getByText('404')).toBeInTheDocument();
    });

    it('renders error message', () => {
      renderNotFound();
      expect(screen.getByText('Pagina nao encontrada')).toBeInTheDocument();
    });

    it('renders description text', () => {
      renderNotFound();
      expect(screen.getByText(/A pagina que voce procura/i)).toBeInTheDocument();
    });

    it('renders back button', () => {
      renderNotFound();
      expect(screen.getByRole('button', { name: /Voltar/i })).toBeInTheDocument();
    });

    it('renders dashboard button', () => {
      renderNotFound();
      expect(screen.getByRole('button', { name: /Ir para Dashboard/i })).toBeInTheDocument();
    });
  });

  describe('navigation', () => {
    it('navigates back when clicking back button', () => {
      renderNotFound();

      const backButton = screen.getByRole('button', { name: /Voltar/i });
      fireEvent.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });

    it('navigates to dashboard when clicking dashboard button', () => {
      renderNotFound();

      const dashboardButton = screen.getByRole('button', { name: /Ir para Dashboard/i });
      fireEvent.click(dashboardButton);

      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });
});
