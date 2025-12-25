/**
 * Command Palette Tests
 * =====================
 *
 * Unit tests for cmdk-based CommandPalette component.
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

    it('shows ESC keyboard hint', () => {
      renderPalette();
      expect(screen.getByText('ESC')).toBeInTheDocument();
    });
  });

  describe('Quick Actions', () => {
    it('shows quick actions when palette opens', () => {
      renderPalette();
      expect(screen.getByText('Ações Rápidas')).toBeInTheDocument();
    });

    it('displays navigation options', () => {
      renderPalette();
      expect(screen.getByText('Ir para Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Ir para Agenda')).toBeInTheDocument();
      expect(screen.getByText('Ir para Pacientes')).toBeInTheDocument();
    });

    it('displays create actions', () => {
      renderPalette();
      expect(screen.getByText('Novo Paciente')).toBeInTheDocument();
    });

    it('displays settings and help', () => {
      renderPalette();
      expect(screen.getByText('Configurações')).toBeInTheDocument();
      expect(screen.getByText('Ajuda')).toBeInTheDocument();
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

  describe('No Results State', () => {
    it('shows no results message when search returns empty', () => {
      mockSearchState.hasSearched = true;
      mockSearchState.query = 'xyz123';
      mockSearchState.results = [];

      renderPalette();

      expect(screen.getByText(/Nenhum resultado para "xyz123"/i)).toBeInTheDocument();
    });
  });

  describe('With Patient Results', () => {
    beforeEach(() => {
      mockSearchState = {
        query: 'joao',
        setQuery: mockSetQuery,
        results: [
          { id: '1', type: 'patient', title: 'João Silva', subtitle: 'joao@email.com', path: '/patients/1', score: 100 },
        ],
        loading: false,
        hasSearched: true,
        groupedResults: {
          patient: [{ id: '1', type: 'patient', title: 'João Silva', subtitle: 'joao@email.com', path: '/patients/1', score: 100 }],
          appointment: [],
          medical_record: [],
          prescription: [],
          transaction: [],
        },
        clear: mockClear,
      };
    });

    it('displays patient group header', () => {
      renderPalette();
      expect(screen.getByText('Pacientes')).toBeInTheDocument();
    });

    it('displays patient name', () => {
      renderPalette();
      expect(screen.getByText('João Silva')).toBeInTheDocument();
    });

    it('displays patient email', () => {
      renderPalette();
      expect(screen.getByText('joao@email.com')).toBeInTheDocument();
    });
  });

  describe('With Appointment Results', () => {
    beforeEach(() => {
      mockSearchState = {
        query: 'maria',
        setQuery: mockSetQuery,
        results: [
          { id: '2', type: 'appointment', title: 'Maria Santos', subtitle: '2025-12-25 14:00', path: '/agenda?date=2025-12-25', score: 80 },
        ],
        loading: false,
        hasSearched: true,
        groupedResults: {
          patient: [],
          appointment: [{ id: '2', type: 'appointment', title: 'Maria Santos', subtitle: '2025-12-25 14:00', path: '/agenda?date=2025-12-25', score: 80 }],
          medical_record: [],
          prescription: [],
          transaction: [],
        },
        clear: mockClear,
      };
    });

    it('displays appointment group header', () => {
      renderPalette();
      expect(screen.getByText('Consultas')).toBeInTheDocument();
    });

    it('displays appointment patient name', () => {
      renderPalette();
      expect(screen.getByText('Maria Santos')).toBeInTheDocument();
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

  describe('Footer', () => {
    it('shows keyboard hints in footer', () => {
      renderPalette();
      expect(screen.getByText(/navegar/i)).toBeInTheDocument();
      expect(screen.getByText(/selecionar/i)).toBeInTheDocument();
      expect(screen.getByText(/fechar/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has correct aria label', () => {
      renderPalette();
      const dialog = document.querySelector('[cmdk-dialog]');
      expect(dialog).toBeInTheDocument();
    });
  });

  describe('Navigation on Select', () => {
    it('navigates to dashboard when selecting quick action', () => {
      renderPalette();
      const dashboardItem = screen.getByText('Ir para Dashboard');
      fireEvent.click(dashboardItem);
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });

    it('navigates to agenda when selecting', () => {
      renderPalette();
      const agendaItem = screen.getByText('Ir para Agenda');
      fireEvent.click(agendaItem);
      expect(mockNavigate).toHaveBeenCalledWith('/agenda');
    });

    it('navigates to patients when selecting', () => {
      renderPalette();
      const patientsItem = screen.getByText('Ir para Pacientes');
      fireEvent.click(patientsItem);
      expect(mockNavigate).toHaveBeenCalledWith('/patients');
    });

    it('navigates to new patient when selecting', () => {
      renderPalette();
      const newPatientItem = screen.getByText('Novo Paciente');
      fireEvent.click(newPatientItem);
      expect(mockNavigate).toHaveBeenCalledWith('/patients/new');
    });

    it('navigates to finance when selecting', () => {
      renderPalette();
      const financeItem = screen.getByText('Ir para Financeiro');
      fireEvent.click(financeItem);
      expect(mockNavigate).toHaveBeenCalledWith('/finance');
    });

    it('navigates to reports when selecting', () => {
      renderPalette();
      const reportsItem = screen.getByText('Ir para Relatórios');
      fireEvent.click(reportsItem);
      expect(mockNavigate).toHaveBeenCalledWith('/reports');
    });

    it('navigates to settings when selecting', () => {
      renderPalette();
      const settingsItem = screen.getByText('Configurações');
      fireEvent.click(settingsItem);
      expect(mockNavigate).toHaveBeenCalledWith('/settings');
    });

    it('navigates to help when selecting', () => {
      renderPalette();
      const helpItem = screen.getByText('Ajuda');
      fireEvent.click(helpItem);
      expect(mockNavigate).toHaveBeenCalledWith('/help');
    });

    it('calls clear and onClose when selecting an item', () => {
      renderPalette();
      const dashboardItem = screen.getByText('Ir para Dashboard');
      fireEvent.click(dashboardItem);
      expect(mockClear).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Search Result Navigation', () => {
    beforeEach(() => {
      mockSearchState = {
        query: 'silva',
        setQuery: mockSetQuery,
        results: [
          { id: '1', type: 'patient', title: 'João Silva', subtitle: 'joao@email.com', path: '/patients/1', score: 100 },
        ],
        loading: false,
        hasSearched: true,
        groupedResults: {
          patient: [{ id: '1', type: 'patient', title: 'João Silva', subtitle: 'joao@email.com', path: '/patients/1', score: 100 }],
          appointment: [],
          medical_record: [],
          prescription: [],
          transaction: [],
        },
        clear: mockClear,
      };
    });

    it('navigates to patient page when selecting patient result', () => {
      renderPalette();
      const patientItem = screen.getByText('João Silva');
      fireEvent.click(patientItem);
      expect(mockNavigate).toHaveBeenCalledWith('/patients/1');
    });
  });

  describe('Appointment Result Navigation', () => {
    beforeEach(() => {
      mockSearchState = {
        query: 'maria',
        setQuery: mockSetQuery,
        results: [
          { id: '2', type: 'appointment', title: 'Maria Santos', subtitle: '2025-12-25 14:00', path: '/agenda?date=2025-12-25', score: 80 },
        ],
        loading: false,
        hasSearched: true,
        groupedResults: {
          patient: [],
          appointment: [{ id: '2', type: 'appointment', title: 'Maria Santos', subtitle: '2025-12-25 14:00', path: '/agenda?date=2025-12-25', score: 80 }],
          medical_record: [],
          prescription: [],
          transaction: [],
        },
        clear: mockClear,
      };
    });

    it('navigates to agenda when selecting appointment result', () => {
      renderPalette();
      const appointmentItem = screen.getByText('Maria Santos');
      fireEvent.click(appointmentItem);
      expect(mockNavigate).toHaveBeenCalledWith('/agenda?date=2025-12-25');
    });

    it('displays appointment subtitle', () => {
      renderPalette();
      expect(screen.getByText('2025-12-25 14:00')).toBeInTheDocument();
    });
  });

  describe('Multiple Result Types', () => {
    beforeEach(() => {
      mockSearchState = {
        query: 'maria',
        setQuery: mockSetQuery,
        results: [
          { id: '1', type: 'patient', title: 'Maria Silva', subtitle: 'maria@email.com', path: '/patients/1', score: 100 },
          { id: '2', type: 'appointment', title: 'Maria Santos', subtitle: '2025-12-25 14:00', path: '/agenda?date=2025-12-25', score: 80 },
        ],
        loading: false,
        hasSearched: true,
        groupedResults: {
          patient: [{ id: '1', type: 'patient', title: 'Maria Silva', subtitle: 'maria@email.com', path: '/patients/1', score: 100 }],
          appointment: [{ id: '2', type: 'appointment', title: 'Maria Santos', subtitle: '2025-12-25 14:00', path: '/agenda?date=2025-12-25', score: 80 }],
          medical_record: [],
          prescription: [],
          transaction: [],
        },
        clear: mockClear,
      };
    });

    it('shows both Pacientes and Consultas groups', () => {
      renderPalette();
      expect(screen.getByText('Pacientes')).toBeInTheDocument();
      expect(screen.getByText('Consultas')).toBeInTheDocument();
    });

    it('displays results from both groups', () => {
      renderPalette();
      expect(screen.getByText('Maria Silva')).toBeInTheDocument();
      expect(screen.getByText('Maria Santos')).toBeInTheDocument();
    });

    it('does not show quick actions when results exist', () => {
      renderPalette();
      expect(screen.queryByText('Ações Rápidas')).not.toBeInTheDocument();
    });
  });

  describe('Empty Search State', () => {
    it('shows quick actions when not searched', () => {
      mockSearchState.hasSearched = false;
      mockSearchState.query = '';
      renderPalette();
      // When no search performed, quick actions are shown
      expect(screen.getByText('Ações Rápidas')).toBeInTheDocument();
    });
  });

  describe('Result Without Subtitle', () => {
    beforeEach(() => {
      mockSearchState = {
        query: 'silva',
        setQuery: mockSetQuery,
        results: [
          { id: '1', type: 'patient', title: 'João Silva', path: '/patients/1', score: 100 },
        ],
        loading: false,
        hasSearched: true,
        groupedResults: {
          patient: [{ id: '1', type: 'patient', title: 'João Silva', path: '/patients/1', score: 100 }],
          appointment: [],
          medical_record: [],
          prescription: [],
          transaction: [],
        },
        clear: mockClear,
      };
    });

    it('renders patient without subtitle', () => {
      renderPalette();
      expect(screen.getByText('João Silva')).toBeInTheDocument();
    });
  });
});
