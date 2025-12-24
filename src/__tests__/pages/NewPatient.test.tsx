/**
 * NewPatient Page Tests
 *
 * Smoke tests + basic functionality verification.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mockNavigate = vi.fn();
const mockAddPatient = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../contexts/ClinicContext', () => ({
  useClinicContext: vi.fn(() => ({
    clinicId: 'clinic-123',
  })),
}));

vi.mock('../../hooks/usePatients', () => ({
  usePatients: vi.fn(() => ({
    patients: [],
    loading: false,
    addPatient: mockAddPatient.mockResolvedValue({ id: 'new-patient-123' }),
  })),
}));

// Mock AvatarUpload
vi.mock('../../components/ui/AvatarUpload', () => ({
  AvatarUpload: () => <div data-testid="avatar-upload">Avatar Upload</div>,
}));

import { NewPatient } from '../../pages/NewPatient';

const renderNewPatient = () => {
  return render(
    <MemoryRouter>
      <NewPatient />
    </MemoryRouter>
  );
};

describe('NewPatient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('smoke tests', () => {
    it('should render without crashing', () => {
      const { container } = renderNewPatient();
      expect(container).toBeDefined();
    });
  });

  describe('header', () => {
    it('should render page title', () => {
      renderNewPatient();
      expect(screen.getByText('Novo Paciente')).toBeInTheDocument();
    });

    it('should render page description', () => {
      renderNewPatient();
      expect(screen.getByText(/Preencha os dados/i)).toBeInTheDocument();
    });
  });

  describe('form sections', () => {
    it('should have Dados Pessoais section', () => {
      renderNewPatient();
      expect(screen.getByText('Dados Pessoais')).toBeInTheDocument();
    });

    it('should have Contato section', () => {
      renderNewPatient();
      expect(screen.getByText('Contato')).toBeInTheDocument();
    });

    it('should have Convênio section', () => {
      renderNewPatient();
      // There may be multiple "Convênio" texts (label + select option)
      const convenioElements = screen.getAllByText('Convênio');
      expect(convenioElements.length).toBeGreaterThan(0);
    });

    it('should have avatar upload', () => {
      renderNewPatient();
      expect(screen.getByTestId('avatar-upload')).toBeInTheDocument();
    });
  });

  describe('form fields', () => {
    it('should have name input with placeholder', () => {
      renderNewPatient();
      expect(screen.getByPlaceholderText(/Maria Silva Oliveira/i)).toBeInTheDocument();
    });

    it('should have phone input', () => {
      renderNewPatient();
      expect(screen.getByPlaceholderText(/99999-9999/i)).toBeInTheDocument();
    });

    it('should have email input', () => {
      renderNewPatient();
      expect(screen.getByPlaceholderText(/paciente@email/i)).toBeInTheDocument();
    });
  });

  describe('buttons', () => {
    it('should have submit button', () => {
      renderNewPatient();
      expect(screen.getByText('Salvar Cadastro')).toBeInTheDocument();
    });

    it('should have cancel button', () => {
      renderNewPatient();
      expect(screen.getByText('Cancelar')).toBeInTheDocument();
    });
  });

  describe('navigation', () => {
    it('should navigate back on cancel', () => {
      renderNewPatient();
      fireEvent.click(screen.getByText('Cancelar'));
      expect(mockNavigate).toHaveBeenCalledWith('/patients');
    });
  });

  describe('form validation', () => {
    it('should not submit without required fields', () => {
      renderNewPatient();
      fireEvent.click(screen.getByText('Salvar Cadastro'));
      expect(mockAddPatient).not.toHaveBeenCalled();
    });
  });
});
