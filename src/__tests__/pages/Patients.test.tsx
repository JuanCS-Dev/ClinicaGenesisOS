/**
 * Patients Page Tests
 *
 * Comprehensive tests for the patients list page.
 * Uses @tanstack/react-virtual for performance - we mock the virtualizer.
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
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

const mockDefaultPatients = [
  {
    id: 'patient-1',
    name: 'Maria Santos',
    email: 'maria@email.com',
    phone: '11999999999',
    insurance: 'Unimed',
    tags: ['VIP', 'Retorno'],
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
  {
    id: 'patient-3',
    name: 'Ana Costa',
    email: 'ana@email.com',
    phone: '11777777777',
    insurance: '',
    tags: ['Diabético'],
    createdAt: new Date().toISOString(),
  },
];

vi.mock('../../hooks/usePatients', () => ({
  usePatients: vi.fn(() => ({
    patients: mockDefaultPatients,
    loading: false,
    error: null,
  })),
}));

import { usePatients } from '../../hooks/usePatients';
const mockUsePatients = usePatients as ReturnType<typeof vi.fn>;

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
    mockUsePatients.mockReturnValue({
      patients: mockDefaultPatients,
      loading: false,
      error: null,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('rendering', () => {
    it('should render without crashing', () => {
      const { container } = renderPatients();
      expect(container).toBeDefined();
    });

    it('should have animation class', () => {
      const { container } = renderPatients();
      expect(container.querySelector('.animate-enter')).toBeTruthy();
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

  describe('table headers', () => {
    it('should render Nome column', () => {
      renderPatients();
      expect(screen.getByText('Nome')).toBeInTheDocument();
    });

    it('should render Contato column', () => {
      renderPatients();
      expect(screen.getByText('Contato')).toBeInTheDocument();
    });

    it('should render Convênio column', () => {
      renderPatients();
      expect(screen.getByText('Convênio')).toBeInTheDocument();
    });

    it('should render Tags column', () => {
      renderPatients();
      expect(screen.getByText('Tags')).toBeInTheDocument();
    });
  });

  describe('patient list', () => {
    it('should display patient names', () => {
      renderPatients();
      expect(screen.getByText('Maria Santos')).toBeInTheDocument();
      expect(screen.getByText('João Silva')).toBeInTheDocument();
      expect(screen.getByText('Ana Costa')).toBeInTheDocument();
    });

    it('should display patient emails', () => {
      renderPatients();
      expect(screen.getByText('maria@email.com')).toBeInTheDocument();
    });

    it('should display patient phones', () => {
      renderPatients();
      expect(screen.getByText('11999999999')).toBeInTheDocument();
    });

    it('should display insurance info', () => {
      renderPatients();
      expect(screen.getByText('Unimed')).toBeInTheDocument();
      expect(screen.getByText('SulAmérica')).toBeInTheDocument();
    });

    it('should display patient tags', () => {
      renderPatients();
      expect(screen.getByText('VIP')).toBeInTheDocument();
      expect(screen.getByText('Retorno')).toBeInTheDocument();
      expect(screen.getByText('Diabético')).toBeInTheDocument();
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

      expect(screen.getByText(/1 de 3/)).toBeInTheDocument();
    });

    it('should filter patients by email', () => {
      renderPatients();
      const searchInput = screen.getByPlaceholderText(/Buscar/i);
      fireEvent.change(searchInput, { target: { value: 'joao@' } });

      expect(screen.getByText(/1 de 3/)).toBeInTheDocument();
    });

    it('should filter patients by phone', () => {
      renderPatients();
      const searchInput = screen.getByPlaceholderText(/Buscar/i);
      fireEvent.change(searchInput, { target: { value: '999999' } });

      expect(screen.getByText(/1 de 3/)).toBeInTheDocument();
    });

    it('should filter patients by insurance', () => {
      renderPatients();
      const searchInput = screen.getByPlaceholderText(/Buscar/i);
      fireEvent.change(searchInput, { target: { value: 'Unimed' } });

      expect(screen.getByText(/1 de 3/)).toBeInTheDocument();
    });

    it('should filter patients by tag', () => {
      renderPatients();
      const searchInput = screen.getByPlaceholderText(/Buscar/i);
      fireEvent.change(searchInput, { target: { value: 'VIP' } });

      expect(screen.getByText(/1 de 3/)).toBeInTheDocument();
    });

    it('should show no results message when search finds nothing', () => {
      renderPatients();
      const searchInput = screen.getByPlaceholderText(/Buscar/i);
      fireEvent.change(searchInput, { target: { value: 'xyznotfound123' } });

      expect(screen.getByText(/Nenhum paciente encontrado/)).toBeInTheDocument();
    });

    it('should show clear search button when no results', () => {
      renderPatients();
      const searchInput = screen.getByPlaceholderText(/Buscar/i);
      fireEvent.change(searchInput, { target: { value: 'xyznotfound123' } });

      expect(screen.getByText('Limpar busca')).toBeInTheDocument();
    });

    it('should clear search when clicking clear button', () => {
      renderPatients();
      const searchInput = screen.getByPlaceholderText(/Buscar/i);
      fireEvent.change(searchInput, { target: { value: 'xyznotfound123' } });
      fireEvent.click(screen.getByText('Limpar busca'));

      // Should show all patients again
      expect(screen.getByText('Maria Santos')).toBeInTheDocument();
    });
  });

  describe('navigation', () => {
    it('should navigate to new patient page on button click', () => {
      renderPatients();
      fireEvent.click(screen.getByText(/Novo Paciente/i));
      expect(mockNavigate).toHaveBeenCalledWith('/patients/new');
    });

    it('should navigate to patient details on row click', () => {
      renderPatients();
      // Click on patient row
      const patientRow = screen.getByText('Maria Santos').closest('[class*="grid"]');
      if (patientRow) fireEvent.click(patientRow);
      expect(mockNavigate).toHaveBeenCalledWith('/patients/patient-1');
    });
  });

  describe('empty state', () => {
    beforeEach(() => {
      mockUsePatients.mockReturnValue({
        patients: [],
        loading: false,
        error: null,
      });
    });

    it('should show empty state message', () => {
      renderPatients();
      expect(screen.getByText(/Nenhum paciente cadastrado/)).toBeInTheDocument();
    });

    it('should show register first patient link', () => {
      renderPatients();
      expect(screen.getByText('Cadastrar primeiro paciente')).toBeInTheDocument();
    });

    it('should navigate to new patient on link click', () => {
      renderPatients();
      fireEvent.click(screen.getByText('Cadastrar primeiro paciente'));
      expect(mockNavigate).toHaveBeenCalledWith('/patients/new');
    });
  });

  describe('loading state', () => {
    beforeEach(() => {
      mockUsePatients.mockReturnValue({
        patients: [],
        loading: true,
        error: null,
      });
    });

    it('should show loading spinner when loading', () => {
      renderPatients();
      expect(document.querySelector('.animate-spin')).toBeTruthy();
    });

    it('should not show patient list while loading', () => {
      renderPatients();
      expect(screen.queryByText('Nome')).not.toBeInTheDocument();
    });
  });

  describe('patient without insurance', () => {
    it('should handle empty insurance gracefully', () => {
      renderPatients();
      // Ana Costa has no insurance - should still render
      expect(screen.getByText('Ana Costa')).toBeInTheDocument();
    });
  });

  describe('patient without tags', () => {
    it('should handle empty tags gracefully', () => {
      renderPatients();
      // João Silva has no tags - should still render
      expect(screen.getByText('João Silva')).toBeInTheDocument();
    });
  });
});
