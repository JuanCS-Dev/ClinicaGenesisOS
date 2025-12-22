/**
 * Command Palette Tests
 * =====================
 *
 * Unit tests for CommandPalette component.
 * Fase 14: UX Enhancement
 * Fase 15: Coverage Enhancement (95%+)
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { CommandPalette } from '../../../components/search/CommandPalette';

// Mock navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Create mock functions that can be controlled per test
const mockSetQuery = vi.fn();
const mockClear = vi.fn();

// Default mock state
let mockSearchState = {
  query: '',
  setQuery: mockSetQuery,
  results: [] as Array<{ id: string; type: string; title: string; subtitle?: string; path: string; score: number }>,
  loading: false,
  hasSearched: false,
  groupedResults: {
    patient: [] as Array<{ id: string; type: string; title: string; subtitle?: string; path: string; score: number }>,
    appointment: [] as Array<{ id: string; type: string; title: string; subtitle?: string; path: string; score: number }>,
    medical_record: [] as Array<{ id: string; type: string; title: string; subtitle?: string; path: string; score: number }>,
    prescription: [] as Array<{ id: string; type: string; title: string; subtitle?: string; path: string; score: number }>,
    transaction: [] as Array<{ id: string; type: string; title: string; subtitle?: string; path: string; score: number }>,
  },
  clear: mockClear,
};

// Mock useGlobalSearch
vi.mock('@/hooks/useGlobalSearch', () => ({
  useGlobalSearch: () => mockSearchState,
}));

describe('CommandPalette', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset to default state
    mockSearchState = {
      query: '',
      setQuery: mockSetQuery,
      results: [],
      loading: false,
      hasSearched: false,
      groupedResults: {
        patient: [],
        appointment: [],
        medical_record: [],
        prescription: [],
        transaction: [],
      },
      clear: mockClear,
    };
  });

  const renderPalette = (isOpen = true) => {
    return render(
      <BrowserRouter>
        <CommandPalette isOpen={isOpen} onClose={mockOnClose} />
      </BrowserRouter>
    );
  };

  describe('Basic Rendering', () => {
    it('renders when open', () => {
      renderPalette(true);
      expect(screen.getByPlaceholderText(/Buscar pacientes/i)).toBeInTheDocument();
    });

    it('does not render when closed', () => {
      renderPalette(false);
      expect(screen.queryByPlaceholderText(/Buscar pacientes/i)).not.toBeInTheDocument();
    });

    it('displays search input', () => {
      renderPalette();
      const input = screen.getByPlaceholderText(/Buscar pacientes/i);
      expect(input).toBeInTheDocument();
    });

    it('focuses input when opened', () => {
      renderPalette();
      const input = screen.getByPlaceholderText(/Buscar pacientes/i);
      expect(document.activeElement).toBe(input);
    });

    it('shows ESC keyboard hint', () => {
      renderPalette();
      expect(screen.getByText('ESC')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('shows empty state when no search', () => {
      renderPalette();
      expect(screen.getByText(/Digite para buscar/i)).toBeInTheDocument();
    });

    it('displays keyboard shortcuts in empty state', () => {
      renderPalette();
      expect(screen.getByText('Navegar')).toBeInTheDocument();
      expect(screen.getByText('Selecionar')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('shows loading spinner when loading', () => {
      mockSearchState.loading = true;
      renderPalette();
      
      // Spinner should be visible (has animate-spin class)
      const container = document.querySelector('.animate-spin');
      expect(container).toBeInTheDocument();
    });
  });

  describe('Close Actions', () => {
    it('calls onClose when ESC key pressed on container', () => {
      renderPalette();

      const container = document.querySelector('.bg-genesis-surface.rounded-2xl');
      if (container) {
        fireEvent.keyDown(container, { key: 'Escape' });
      }

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('calls onClose when clicking backdrop', () => {
      renderPalette();

      const backdrop = document.querySelector('.bg-black\\/50');
      if (backdrop) {
        fireEvent.click(backdrop);
      }

      expect(mockOnClose).toHaveBeenCalled();
      expect(mockClear).toHaveBeenCalled();
    });

    it('calls onClose when clicking X button', () => {
      renderPalette();

      const closeButtons = screen.getAllByRole('button');
      const xButton = closeButtons.find(
        (btn) => btn.querySelector('svg')?.classList.contains('lucide-x')
      );

      if (xButton) {
        fireEvent.click(xButton);
      }

      expect(mockOnClose).toHaveBeenCalled();
      expect(mockClear).toHaveBeenCalled();
    });
  });

  describe('No Results State', () => {
    it('shows no results message when search returns empty', () => {
      mockSearchState.hasSearched = true;
      mockSearchState.query = 'xyz123';
      mockSearchState.results = [];
      
      renderPalette();
      
      expect(screen.getByText(/Nenhum resultado encontrado/i)).toBeInTheDocument();
    });
  });

  describe('With Results', () => {
    beforeEach(() => {
      mockSearchState = {
        query: 'test',
        setQuery: mockSetQuery,
        results: [
          { id: '1', type: 'patient', title: 'João Silva', subtitle: 'joao@email.com', path: '/patients/1', score: 100 },
          { id: '2', type: 'appointment', title: 'Maria Santos', subtitle: '2025-12-25 14:00', path: '/agenda?date=2025-12-25', score: 80 },
          { id: '3', type: 'medical_record', title: 'Prontuário #123', subtitle: 'João Silva', path: '/patients/1', score: 70 },
          { id: '4', type: 'prescription', title: 'Receita #456', subtitle: 'Paracetamol', path: '/prescriptions/456', score: 60 },
          { id: '5', type: 'transaction', title: 'Pagamento R$100', subtitle: 'PIX', path: '/finance', score: 50 },
        ],
        loading: false,
        hasSearched: true,
        groupedResults: {
          patient: [{ id: '1', type: 'patient', title: 'João Silva', subtitle: 'joao@email.com', path: '/patients/1', score: 100 }],
          appointment: [{ id: '2', type: 'appointment', title: 'Maria Santos', subtitle: '2025-12-25 14:00', path: '/agenda?date=2025-12-25', score: 80 }],
          medical_record: [{ id: '3', type: 'medical_record', title: 'Prontuário #123', subtitle: 'João Silva', path: '/patients/1', score: 70 }],
          prescription: [{ id: '4', type: 'prescription', title: 'Receita #456', subtitle: 'Paracetamol', path: '/prescriptions/456', score: 60 }],
          transaction: [{ id: '5', type: 'transaction', title: 'Pagamento R$100', subtitle: 'PIX', path: '/finance', score: 50 }],
        },
        clear: mockClear,
      };
    });

    it('displays results grouped by type', () => {
      renderPalette();
      
      expect(screen.getByText('Pacientes')).toBeInTheDocument();
      expect(screen.getByText('Consultas')).toBeInTheDocument();
      expect(screen.getByText('Prontuários')).toBeInTheDocument();
      expect(screen.getByText('Prescrições')).toBeInTheDocument();
      expect(screen.getByText('Transações')).toBeInTheDocument();
    });

    it('displays result titles', () => {
      renderPalette();
      
      // João Silva appears twice (patient title and medical_record subtitle)
      expect(screen.getAllByText('João Silva').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Maria Santos')).toBeInTheDocument();
    });

    it('displays result subtitles', () => {
      renderPalette();
      
      expect(screen.getByText('joao@email.com')).toBeInTheDocument();
    });

    it('shows result count in footer', () => {
      renderPalette();
      
      expect(screen.getByText('5 resultados')).toBeInTheDocument();
    });

    it('navigates when result is clicked', () => {
      renderPalette();
      
      const resultButtons = screen.getAllByText('João Silva');
      const resultButton = resultButtons[0].closest('button');
      if (resultButton) {
        fireEvent.click(resultButton);
      }

      expect(mockNavigate).toHaveBeenCalledWith('/patients/1');
      expect(mockClear).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('shows footer with Tab hint when results exist', () => {
      renderPalette();
      
      expect(screen.getByText('Tab')).toBeInTheDocument();
      expect(screen.getByText(/ações rápidas/i)).toBeInTheDocument();
    });
  });

  describe('Input Interaction', () => {
    it('calls setQuery when typing in input', () => {
      renderPalette();
      
      const input = screen.getByPlaceholderText(/Buscar pacientes/i);
      fireEvent.change(input, { target: { value: 'test' } });

      expect(mockSetQuery).toHaveBeenCalledWith('test');
    });
  });

  describe('Type Icons and Labels', () => {
    it('renders patient results with user icon', () => {
      mockSearchState.hasSearched = true;
      mockSearchState.results = [{ id: '1', type: 'patient', title: 'Test', path: '/test', score: 100 }];
      mockSearchState.groupedResults.patient = [{ id: '1', type: 'patient', title: 'Test', path: '/test', score: 100 }];
      
      renderPalette();
      
      expect(screen.getByText('Pacientes')).toBeInTheDocument();
    });

    it('renders appointment results with calendar icon', () => {
      mockSearchState.hasSearched = true;
      mockSearchState.results = [{ id: '1', type: 'appointment', title: 'Test', path: '/test', score: 100 }];
      mockSearchState.groupedResults.appointment = [{ id: '1', type: 'appointment', title: 'Test', path: '/test', score: 100 }];
      
      renderPalette();
      
      expect(screen.getByText('Consultas')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has correct aria attributes', () => {
      renderPalette();
      
      const dialog = document.querySelector('[role="dialog"]');
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });
  });
});
