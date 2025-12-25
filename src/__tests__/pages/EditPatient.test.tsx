/** EditPatient Page Tests - Comprehensive tests for edit patient form. */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { toast } from 'sonner';

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

const mockPatient = {
  id: 'patient-123',
  name: 'Maria Santos',
  email: 'maria@email.com',
  phone: '11999999999',
  birthDate: '1990-05-15',
  gender: 'Feminino',
  insurance: 'Unimed',
  age: 34,
  avatar: 'https://example.com/avatar.jpg',
};

vi.mock('../../hooks/usePatient', () => ({
  usePatient: vi.fn(() => ({
    patient: mockPatient,
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

vi.mock('sonner', () => ({
  toast: {
    warning: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
  },
}));

let mockOnAvatarChange: ((url: string) => void) | null = null;
vi.mock('../../components/ui/AvatarUpload', () => ({
  AvatarUpload: ({
    onAvatarChange,
    currentAvatar,
    disabled,
  }: {
    onAvatarChange: (url: string) => void;
    currentAvatar: string;
    disabled?: boolean;
  }) => {
    mockOnAvatarChange = onAvatarChange;
    return (
      <div data-testid="avatar-upload" data-current={currentAvatar} data-disabled={disabled}>
        Avatar Upload
        <button data-testid="change-avatar" onClick={() => onAvatarChange('https://new-avatar.jpg')}>
          Change Avatar
        </button>
      </div>
    );
  },
}));

import { usePatient } from '../../hooks/usePatient';
const mockUsePatient = usePatient as ReturnType<typeof vi.fn>;

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
    mockOnAvatarChange = null;
    mockUsePatient.mockReturnValue({
      patient: mockPatient,
      loading: false,
      error: null,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('rendering', () => {
    it('should render without crashing', () => {
      const { container } = renderEditPatient();
      expect(container).toBeDefined();
    });

    it('should have animation class', () => {
      const { container } = renderEditPatient();
      expect(container.querySelector('.animate-enter')).toBeTruthy();
    });
  });

  describe('header', () => {
    it('should render page title', () => {
      renderEditPatient();
      expect(screen.getByText('Editar Paciente')).toBeInTheDocument();
    });
    it('should show patient name in description', () => {
      renderEditPatient();
      expect(screen.getByText(/Atualize os dados de Maria Santos/)).toBeInTheDocument();
    });
    it('should have back button', () => {
      renderEditPatient();
      expect(screen.getByText('Voltar')).toBeInTheDocument();
    });
    it('should have cancel button', () => {
      renderEditPatient();
      expect(screen.getByText('Cancelar')).toBeInTheDocument();
    });
    it('should have save button', () => {
      renderEditPatient();
      expect(screen.getByText('Salvar Alterações')).toBeInTheDocument();
    });
  });

  describe('form sections', () => {
    it('should have Dados Pessoais section', () => {
      renderEditPatient();
      expect(screen.getByText('Dados Pessoais')).toBeInTheDocument();
    });
    it('should have Contato section', () => {
      renderEditPatient();
      expect(screen.getByText('Contato')).toBeInTheDocument();
    });
    it('should have Convênio section', () => {
      renderEditPatient();
      const convenioElements = screen.getAllByText('Convênio');
      expect(convenioElements.length).toBeGreaterThan(0);
    });
    it('should have avatar upload', () => {
      renderEditPatient();
      expect(screen.getByTestId('avatar-upload')).toBeInTheDocument();
    });
  });

  describe('pre-filled data', () => {
    it('should display patient name in input', () => {
      renderEditPatient();
      expect(screen.getByDisplayValue('Maria Santos')).toBeInTheDocument();
    });
    it('should display patient email', () => {
      renderEditPatient();
      expect(screen.getByDisplayValue('maria@email.com')).toBeInTheDocument();
    });
    it('should display patient phone', () => {
      renderEditPatient();
      expect(screen.getByDisplayValue('11999999999')).toBeInTheDocument();
    });
    it('should display patient birthDate', () => {
      renderEditPatient();
      expect(screen.getByDisplayValue('1990-05-15')).toBeInTheDocument();
    });
    it('should display patient gender', () => {
      renderEditPatient();
      const genderSelect = document.querySelector('select[name="gender"]') as HTMLSelectElement;
      expect(genderSelect.value).toBe('Feminino');
    });
    it('should display patient insurance', () => {
      renderEditPatient();
      const insuranceSelect = document.querySelector('select[name="insurance"]') as HTMLSelectElement;
      expect(insuranceSelect.value).toBe('Unimed');
    });
    it('should display patient info in sidebar', () => {
      renderEditPatient();
      expect(screen.getByText('Maria Santos')).toBeInTheDocument();
      expect(screen.getByText('34 anos')).toBeInTheDocument();
    });
  });

  describe('form field changes', () => {
    it('should update name on change', () => {
      renderEditPatient();
      const nameInput = screen.getByDisplayValue('Maria Santos');
      fireEvent.change(nameInput, { target: { value: 'Maria Silva' } });
      expect(screen.getByDisplayValue('Maria Silva')).toBeInTheDocument();
    });
    it('should update email on change', () => {
      renderEditPatient();
      const emailInput = screen.getByDisplayValue('maria@email.com');
      fireEvent.change(emailInput, { target: { value: 'maria.nova@email.com' } });
      expect(screen.getByDisplayValue('maria.nova@email.com')).toBeInTheDocument();
    });
    it('should update phone on change', () => {
      renderEditPatient();
      const phoneInput = screen.getByDisplayValue('11999999999');
      fireEvent.change(phoneInput, { target: { value: '11888888888' } });
      expect(screen.getByDisplayValue('11888888888')).toBeInTheDocument();
    });
    it('should update birthDate on change', () => {
      renderEditPatient();
      const birthInput = screen.getByDisplayValue('1990-05-15');
      fireEvent.change(birthInput, { target: { value: '1992-10-20' } });
      expect(screen.getByDisplayValue('1992-10-20')).toBeInTheDocument();
    });
    it('should update gender on change', () => {
      renderEditPatient();
      const genderSelect = document.querySelector('select[name="gender"]') as HTMLSelectElement;
      fireEvent.change(genderSelect, { target: { value: 'Masculino' } });
      expect(genderSelect.value).toBe('Masculino');
    });
    it('should update insurance on change', () => {
      renderEditPatient();
      const insuranceSelect = document.querySelector('select[name="insurance"]') as HTMLSelectElement;
      fireEvent.change(insuranceSelect, { target: { value: 'Bradesco Saúde' } });
      expect(insuranceSelect.value).toBe('Bradesco Saúde');
    });
  });

  describe('avatar change', () => {
    it('should update avatar when changed', () => {
      renderEditPatient();
      fireEvent.click(screen.getByTestId('change-avatar'));
      expect(screen.getByTestId('avatar-upload')).toBeInTheDocument();
    });
    it('should pass current avatar to AvatarUpload', () => {
      renderEditPatient();
      expect(screen.getByTestId('avatar-upload')).toHaveAttribute('data-current', 'https://example.com/avatar.jpg');
    });
  });

  describe('form submission - success', () => {
    it('should call updatePatient on save', async () => {
      renderEditPatient();
      fireEvent.click(screen.getByText('Salvar Alterações'));
      await waitFor(() => {
        expect(mockUpdatePatient).toHaveBeenCalledWith('patient-123', expect.objectContaining({
          name: 'Maria Santos', email: 'maria@email.com', phone: '11999999999',
        }));
      });
    });
    it('should navigate to patient page on success', async () => {
      renderEditPatient();
      fireEvent.click(screen.getByText('Salvar Alterações'));
      await waitFor(() => { expect(mockNavigate).toHaveBeenCalledWith('/patients/patient-123'); });
    });

    it('should show saving state on submit', async () => {
      mockUpdatePatient.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      renderEditPatient();
      fireEvent.click(screen.getByText('Salvar Alterações'));

      await waitFor(() => {
        expect(screen.getByText('Salvando...')).toBeInTheDocument();
      });
    });

    it('should disable save button while saving', async () => {
      mockUpdatePatient.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      renderEditPatient();
      fireEvent.click(screen.getByText('Salvar Alterações'));

      await waitFor(() => {
        const saveButton = screen.getByText('Salvando...').closest('button');
        expect(saveButton).toBeDisabled();
      });
    });
  });

  describe('form submission - validation', () => {
    it('should show warning when name is empty', async () => {
      renderEditPatient();
      const nameInput = screen.getByDisplayValue('Maria Santos');
      fireEvent.change(nameInput, { target: { value: '' } });
      fireEvent.click(screen.getByText('Salvar Alterações'));

      expect(toast.warning).toHaveBeenCalledWith('Preencha os campos obrigatórios.');
      expect(mockUpdatePatient).not.toHaveBeenCalled();
    });

    it('should show warning when phone is empty', async () => {
      renderEditPatient();
      const phoneInput = screen.getByDisplayValue('11999999999');
      fireEvent.change(phoneInput, { target: { value: '' } });
      fireEvent.click(screen.getByText('Salvar Alterações'));

      expect(toast.warning).toHaveBeenCalledWith('Preencha os campos obrigatórios.');
      expect(mockUpdatePatient).not.toHaveBeenCalled();
    });
  });

  describe('form submission - error', () => {
    it('should handle update error gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockUpdatePatient.mockRejectedValueOnce(new Error('API Error'));

      renderEditPatient();
      fireEvent.click(screen.getByText('Salvar Alterações'));

      // Wait for error to be logged
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled();
      });

      consoleSpy.mockRestore();
    });

    it('should call console.error on failure', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockUpdatePatient.mockRejectedValueOnce(new Error('API Error'));

      renderEditPatient();
      fireEvent.click(screen.getByText('Salvar Alterações'));

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Error updating patient:',
          expect.any(Error)
        );
      });

      consoleSpy.mockRestore();
    });
  });

  describe('navigation', () => {
    it('should navigate back on cancel', () => {
      renderEditPatient();
      fireEvent.click(screen.getByText('Cancelar'));
      expect(mockNavigate).toHaveBeenCalledWith('/patients/patient-123');
    });

    it('should navigate back on Voltar button', () => {
      renderEditPatient();
      fireEvent.click(screen.getByText('Voltar'));
      expect(mockNavigate).toHaveBeenCalledWith('/patients/patient-123');
    });
  });

  describe('loading state', () => {
    it('should show loading spinner when fetching patient', () => {
      mockUsePatient.mockReturnValue({
        patient: null,
        loading: true,
        error: null,
      });

      renderEditPatient();
      expect(document.querySelector('.animate-spin')).toBeTruthy();
    });

    it('should not show form when loading', () => {
      mockUsePatient.mockReturnValue({
        patient: null,
        loading: true,
        error: null,
      });

      renderEditPatient();
      expect(screen.queryByText('Dados Pessoais')).not.toBeInTheDocument();
    });
  });

  describe('patient not found', () => {
    beforeEach(() => {
      mockUsePatient.mockReturnValue({
        patient: null,
        loading: false,
        error: null,
      });
    });

    it('should show not found message', () => {
      renderEditPatient();
      expect(screen.getByText(/Paciente não encontrado/)).toBeInTheDocument();
    });

    it('should show link to go back to list', () => {
      renderEditPatient();
      expect(screen.getByText('Voltar para lista')).toBeInTheDocument();
    });

    it('should navigate to patients list on click', () => {
      renderEditPatient();
      fireEvent.click(screen.getByText('Voltar para lista'));
      expect(mockNavigate).toHaveBeenCalledWith('/patients');
    });
  });

  describe('patient with missing fields', () => {
    it('should handle patient with no avatar', () => {
      mockUsePatient.mockReturnValue({
        patient: { ...mockPatient, avatar: '' },
        loading: false,
        error: null,
      });

      renderEditPatient();
      const avatarUpload = screen.getByTestId('avatar-upload');
      expect(avatarUpload).toHaveAttribute('data-current', '');
    });

    it('should handle patient with no insurance', () => {
      mockUsePatient.mockReturnValue({
        patient: { ...mockPatient, insurance: '' },
        loading: false,
        error: null,
      });

      renderEditPatient();
      const insuranceSelect = document.querySelector('select[name="insurance"]') as HTMLSelectElement;
      // Should default to "Particular"
      expect(insuranceSelect.value).toBe('Particular');
    });

    it('should handle patient with no email', () => {
      mockUsePatient.mockReturnValue({
        patient: { ...mockPatient, email: '' },
        loading: false,
        error: null,
      });

      renderEditPatient();
      const emailInput = document.querySelector('input[name="email"]') as HTMLInputElement;
      expect(emailInput.value).toBe('');
    });
  });

  describe('form labels', () => {
    it('should have Nome Completo label', () => {
      renderEditPatient();
      expect(screen.getByText('Nome Completo')).toBeInTheDocument();
    });

    it('should have Data de Nascimento label', () => {
      renderEditPatient();
      expect(screen.getByText('Data de Nascimento')).toBeInTheDocument();
    });

    it('should have Gênero label', () => {
      renderEditPatient();
      expect(screen.getByText('Gênero')).toBeInTheDocument();
    });

    it('should have Celular label', () => {
      renderEditPatient();
      expect(screen.getByText(/Celular/)).toBeInTheDocument();
    });

    it('should have Email label', () => {
      renderEditPatient();
      expect(screen.getByText('Email')).toBeInTheDocument();
    });
  });

  describe('select options', () => {
    it('should have gender options', () => {
      renderEditPatient();
      const genderSelect = document.querySelector('select[name="gender"]') as HTMLSelectElement;
      expect(genderSelect.querySelectorAll('option').length).toBe(4); // Selecione, Feminino, Masculino, Outro
    });

    it('should have insurance options', () => {
      renderEditPatient();
      const insuranceSelect = document.querySelector('select[name="insurance"]') as HTMLSelectElement;
      expect(insuranceSelect.querySelectorAll('option').length).toBe(4); // Particular, Unimed, Bradesco, SulAmérica
    });
  });
});
