/**
 * Patients Page Tests
 *
 * Note: This page uses @tanstack/react-virtual for performance.
 * Virtual lists only render visible items, so we mock the virtualizer.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../hooks/usePatients', () => ({
  usePatients: vi.fn(() => ({
    patients: [
      {
        id: 'patient-1',
        name: 'Maria Santos',
        email: 'maria@email.com',
        phone: '11999999999',
        insurance: 'Unimed',
        tags: ['VIP'],
        createdAt: new Date().toISOString(),
      },
      {
        id: 'patient-2',
        name: 'João Silva',
        email: 'joao@email.com',
        phone: '11888888888',
        insurance: 'SulAmérica',
        tags: [],
        createdAt: new Date().toISOString(),
      },
    ],
    loading: false,
    error: null,
  })),
}));

// Mock TanStack Virtual to render all items (no virtualization in tests)
vi.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: vi.fn(({ count }: { count: number }) => ({
    getVirtualItems: () =>
      Array.from({ length: count }, (_, i) => ({
        index: i,
        key: i,
        size: 72,
        start: i * 72,
      })),
    getTotalSize: () => count * 72,
    measureElement: vi.fn(),
  })),
}));

import { Patients } from '../../pages/Patients';

const renderPatients = () => {
  return render(
    <MemoryRouter>
      <Patients />
    </MemoryRouter>
  );
};

describe('Patients', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('smoke tests', () => {
    it('should render without crashing', () => {
      const { container } = renderPatients();
      expect(container).toBeDefined();
    });
  });

  describe('header', () => {
    it('should render page title', () => {
      renderPatients();
      expect(screen.getByText('Pacientes')).toBeInTheDocument();
    });

    it('should render page description', () => {
      renderPatients();
      expect(screen.getByText(/Gerencie seus cadastros/i)).toBeInTheDocument();
    });

    it('should render new patient button', () => {
      renderPatients();
      expect(screen.getByText(/Novo Paciente/i)).toBeInTheDocument();
    });
  });

  describe('search', () => {
    it('should render search input', () => {
      renderPatients();
      expect(screen.getByPlaceholderText(/Buscar/i)).toBeInTheDocument();
    });

    it('should filter patients by name', () => {
      renderPatients();
      const searchInput = screen.getByPlaceholderText(/Buscar/i);
      fireEvent.change(searchInput, { target: { value: 'Maria' } });

      // Count indicator should appear
      expect(screen.getByText(/1 de 2/)).toBeInTheDocument();
    });
  });

  describe('navigation', () => {
    it('should navigate to new patient page on button click', () => {
      renderPatients();
      fireEvent.click(screen.getByText(/Novo Paciente/i));
      expect(mockNavigate).toHaveBeenCalledWith('/patients/new');
    });
  });

  describe('loading state', () => {
    it('should show loading spinner when loading', async () => {
      const { usePatients } = await import('../../hooks/usePatients');
      vi.mocked(usePatients).mockReturnValue({
        patients: [],
        loading: true,
        error: null,
      } as ReturnType<typeof usePatients>);

      renderPatients();
      expect(document.querySelector('.animate-spin')).toBeTruthy();
    });
  });
});
