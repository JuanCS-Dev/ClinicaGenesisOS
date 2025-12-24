/**
 * EditPatient Page Tests
 *
 * Smoke tests + basic functionality verification.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

const mockNavigate = vi.fn();
const mockUpdatePatient = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: 'patient-123' }),
  };
});

vi.mock('../../contexts/ClinicContext', () => ({
  useClinicContext: vi.fn(() => ({
    clinicId: 'clinic-123',
  })),
}));

vi.mock('../../hooks/usePatient', () => ({
  usePatient: vi.fn(() => ({
    patient: {
      id: 'patient-123',
      name: 'Maria Santos',
      email: 'maria@email.com',
      phone: '11999999999',
      birthDate: '1990-05-15',
      gender: 'feminino',
      insurance: 'Unimed',
      age: 34,
      avatar: '',
    },
    loading: false,
    error: null,
  })),
}));

vi.mock('../../hooks/usePatients', () => ({
  usePatients: vi.fn(() => ({
    patients: [],
    loading: false,
    updatePatient: mockUpdatePatient.mockResolvedValue(undefined),
  })),
}));

// Mock AvatarUpload
vi.mock('../../components/ui/AvatarUpload', () => ({
  AvatarUpload: () => <div data-testid="avatar-upload">Avatar Upload</div>,
}));

import { EditPatient } from '../../pages/EditPatient';

const renderEditPatient = () => {
  return render(
    <MemoryRouter initialEntries={['/patients/patient-123/edit']}>
      <Routes>
        <Route path="/patients/:id/edit" element={<EditPatient />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('EditPatient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('smoke tests', () => {
    it('should render without crashing', () => {
      const { container } = renderEditPatient();
      expect(container).toBeDefined();
    });
  });

  describe('header', () => {
    it('should render page title', () => {
      renderEditPatient();
      expect(screen.getByText('Editar Paciente')).toBeInTheDocument();
    });

    it('should have back button', () => {
      renderEditPatient();
      expect(screen.getByText('Voltar')).toBeInTheDocument();
    });
  });

  describe('form sections', () => {
    it('should have Dados Pessoais section', () => {
      renderEditPatient();
      expect(screen.getByText('Dados Pessoais')).toBeInTheDocument();
    });

    it('should have avatar upload', () => {
      renderEditPatient();
      expect(screen.getByTestId('avatar-upload')).toBeInTheDocument();
    });
  });

  describe('pre-filled data', () => {
    it('should display patient name', () => {
      renderEditPatient();
      expect(screen.getByDisplayValue('Maria Santos')).toBeInTheDocument();
    });

    it('should display patient email', () => {
      renderEditPatient();
      expect(screen.getByDisplayValue('maria@email.com')).toBeInTheDocument();
    });
  });

  describe('buttons', () => {
    it('should have save button', () => {
      renderEditPatient();
      expect(screen.getByText('Salvar Alterações')).toBeInTheDocument();
    });

    it('should have cancel button', () => {
      renderEditPatient();
      expect(screen.getByText('Cancelar')).toBeInTheDocument();
    });
  });

  describe('navigation', () => {
    it('should navigate back on cancel', () => {
      renderEditPatient();
      fireEvent.click(screen.getByText('Cancelar'));
      expect(mockNavigate).toHaveBeenCalled();
    });

    it('should navigate on back button click', () => {
      renderEditPatient();
      fireEvent.click(screen.getByText('Voltar'));
      expect(mockNavigate).toHaveBeenCalled();
    });
  });

  describe('loading state', () => {
    it('should show loading when fetching patient', async () => {
      const { usePatient } = await import('../../hooks/usePatient');
      vi.mocked(usePatient).mockReturnValue({
        patient: null,
        loading: true,
        error: null,
      });

      renderEditPatient();
      expect(document.querySelector('.animate-spin')).toBeTruthy();
    });

    it('should show not found when patient is null', async () => {
      const { usePatient } = await import('../../hooks/usePatient');
      vi.mocked(usePatient).mockReturnValue({
        patient: null,
        loading: false,
        error: null,
      });

      renderEditPatient();
      expect(screen.getByText(/não encontrado/i)).toBeInTheDocument();
    });
  });
});
