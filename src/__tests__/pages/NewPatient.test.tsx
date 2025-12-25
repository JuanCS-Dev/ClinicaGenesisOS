/** NewPatient Tests - Comprehensive tests for new patient form. */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { toast } from 'sonner';

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

vi.mock('sonner', () => ({
  toast: {
    warning: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// Mock AvatarUpload to capture onAvatarChange callback
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
    mockOnAvatarChange = null;
    mockAddPatient.mockResolvedValue({ id: 'new-patient-123' });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('rendering', () => {
    it('should render without crashing', () => {
      const { container } = renderNewPatient();
      expect(container).toBeDefined();
    });

    it('should have animation class', () => {
      const { container } = renderNewPatient();
      expect(container.querySelector('.animate-enter')).toBeTruthy();
    });
  });

  describe('header', () => {
    it('should render page title', () => {
      renderNewPatient();
      expect(screen.getByText('Novo Paciente')).toBeInTheDocument();
    });
    it('should render page description', () => {
      renderNewPatient();
      expect(screen.getByText(/Preencha os dados para iniciar o prontuário/)).toBeInTheDocument();
    });
    it('should have cancel button', () => {
      renderNewPatient();
      expect(screen.getByText('Cancelar')).toBeInTheDocument();
    });
    it('should have save button', () => {
      renderNewPatient();
      expect(screen.getByText('Salvar Cadastro')).toBeInTheDocument();
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
      expect(screen.getAllByText('Convênio').length).toBeGreaterThan(0);
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
    it('should have phone input with placeholder', () => {
      renderNewPatient();
      expect(screen.getByPlaceholderText(/99999-9999/i)).toBeInTheDocument();
    });
    it('should have email input with placeholder', () => {
      renderNewPatient();
      expect(screen.getByPlaceholderText(/paciente@email/i)).toBeInTheDocument();
    });
    it('should have birth date input', () => {
      renderNewPatient();
      expect(document.querySelector('input[type="date"]')).toBeInTheDocument();
    });
    it('should have gender select', () => {
      renderNewPatient();
      expect(document.querySelector('select[name="gender"]')).toBeInTheDocument();
    });
    it('should have insurance select', () => {
      renderNewPatient();
      expect(document.querySelector('select[name="insurance"]')).toBeInTheDocument();
    });
  });

  describe('form field changes', () => {
    it('should update name on change', () => {
      renderNewPatient();
      fireEvent.change(screen.getByPlaceholderText(/Maria Silva Oliveira/i), { target: { value: 'João Santos' } });
      expect(screen.getByDisplayValue('João Santos')).toBeInTheDocument();
    });
    it('should update email on change', () => {
      renderNewPatient();
      fireEvent.change(screen.getByPlaceholderText(/paciente@email/i), { target: { value: 'joao@email.com' } });
      expect(screen.getByDisplayValue('joao@email.com')).toBeInTheDocument();
    });
    it('should update phone on change', () => {
      renderNewPatient();
      fireEvent.change(screen.getByPlaceholderText(/99999-9999/i), { target: { value: '11999999999' } });
      expect(screen.getByDisplayValue('11999999999')).toBeInTheDocument();
    });

    it('should update birthDate on change', () => {
      renderNewPatient();
      const birthInput = document.querySelector('input[type="date"]') as HTMLInputElement;
      fireEvent.change(birthInput, { target: { value: '1990-05-15' } });
      expect(birthInput.value).toBe('1990-05-15');
    });
    it('should update gender on change', () => {
      renderNewPatient();
      const genderSelect = document.querySelector('select[name="gender"]') as HTMLSelectElement;
      fireEvent.change(genderSelect, { target: { value: 'Masculino' } });
      expect(genderSelect.value).toBe('Masculino');
    });
    it('should update insurance on change', () => {
      renderNewPatient();
      const insuranceSelect = document.querySelector('select[name="insurance"]') as HTMLSelectElement;
      fireEvent.change(insuranceSelect, { target: { value: 'Unimed' } });
      expect(insuranceSelect.value).toBe('Unimed');
    });
  });

  describe('avatar change', () => {
    it('should update avatar when changed', () => {
      renderNewPatient();
      fireEvent.click(screen.getByTestId('change-avatar'));
      expect(screen.getByTestId('avatar-upload')).toBeInTheDocument();
    });
    it('should pass empty string initially to AvatarUpload', () => {
      renderNewPatient();
      expect(screen.getByTestId('avatar-upload')).toHaveAttribute('data-current', '');
    });
  });

  describe('form submission - success', () => {
    it('should call addPatient with form data', async () => {
      renderNewPatient();

      // Fill required fields
      const nameInput = screen.getByPlaceholderText(/Maria Silva Oliveira/i);
      const phoneInput = screen.getByPlaceholderText(/99999-9999/i);

      fireEvent.change(nameInput, { target: { value: 'João Santos' } });
      fireEvent.change(phoneInput, { target: { value: '11999999999' } });

      fireEvent.click(screen.getByText('Salvar Cadastro'));

      await waitFor(() => {
        expect(mockAddPatient).toHaveBeenCalledWith(expect.objectContaining({
          name: 'João Santos',
          phone: '11999999999',
        }));
      });
    });

    it('should navigate to patients list on success', async () => {
      renderNewPatient();

      const nameInput = screen.getByPlaceholderText(/Maria Silva Oliveira/i);
      const phoneInput = screen.getByPlaceholderText(/99999-9999/i);

      fireEvent.change(nameInput, { target: { value: 'João Santos' } });
      fireEvent.change(phoneInput, { target: { value: '11999999999' } });

      fireEvent.click(screen.getByText('Salvar Cadastro'));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/patients');
      });
    });

    it('should show saving state on submit', async () => {
      mockAddPatient.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      renderNewPatient();

      const nameInput = screen.getByPlaceholderText(/Maria Silva Oliveira/i);
      const phoneInput = screen.getByPlaceholderText(/99999-9999/i);

      fireEvent.change(nameInput, { target: { value: 'João Santos' } });
      fireEvent.change(phoneInput, { target: { value: '11999999999' } });

      fireEvent.click(screen.getByText('Salvar Cadastro'));

      await waitFor(() => {
        expect(screen.getByText('Salvando...')).toBeInTheDocument();
      });
    });

    it('should disable save button while saving', async () => {
      mockAddPatient.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      renderNewPatient();

      const nameInput = screen.getByPlaceholderText(/Maria Silva Oliveira/i);
      const phoneInput = screen.getByPlaceholderText(/99999-9999/i);

      fireEvent.change(nameInput, { target: { value: 'João Santos' } });
      fireEvent.change(phoneInput, { target: { value: '11999999999' } });

      fireEvent.click(screen.getByText('Salvar Cadastro'));

      await waitFor(() => {
        const saveButton = screen.getByText('Salvando...').closest('button');
        expect(saveButton).toBeDisabled();
      });
    });

    it('should use generated avatar when no avatar uploaded', async () => {
      renderNewPatient();

      const nameInput = screen.getByPlaceholderText(/Maria Silva Oliveira/i);
      const phoneInput = screen.getByPlaceholderText(/99999-9999/i);

      fireEvent.change(nameInput, { target: { value: 'João Santos' } });
      fireEvent.change(phoneInput, { target: { value: '11999999999' } });

      fireEvent.click(screen.getByText('Salvar Cadastro'));

      await waitFor(() => {
        expect(mockAddPatient).toHaveBeenCalledWith(expect.objectContaining({
          avatar: expect.stringContaining('ui-avatars.com'),
        }));
      });
    });

    it('should use uploaded avatar URL when provided', async () => {
      renderNewPatient();

      const nameInput = screen.getByPlaceholderText(/Maria Silva Oliveira/i);
      const phoneInput = screen.getByPlaceholderText(/99999-9999/i);

      fireEvent.change(nameInput, { target: { value: 'João Santos' } });
      fireEvent.change(phoneInput, { target: { value: '11999999999' } });

      // Change avatar to a non-blob URL
      fireEvent.click(screen.getByTestId('change-avatar'));

      fireEvent.click(screen.getByText('Salvar Cadastro'));

      await waitFor(() => {
        expect(mockAddPatient).toHaveBeenCalledWith(expect.objectContaining({
          avatar: 'https://new-avatar.jpg',
        }));
      });
    });

    it('should use default birthDate when not provided', async () => {
      renderNewPatient();

      const nameInput = screen.getByPlaceholderText(/Maria Silva Oliveira/i);
      const phoneInput = screen.getByPlaceholderText(/99999-9999/i);

      fireEvent.change(nameInput, { target: { value: 'João Santos' } });
      fireEvent.change(phoneInput, { target: { value: '11999999999' } });

      fireEvent.click(screen.getByText('Salvar Cadastro'));

      await waitFor(() => {
        expect(mockAddPatient).toHaveBeenCalledWith(expect.objectContaining({
          birthDate: '2000-01-01',
        }));
      });
    });

    it('should add "Novo" tag to new patient', async () => {
      renderNewPatient();

      const nameInput = screen.getByPlaceholderText(/Maria Silva Oliveira/i);
      const phoneInput = screen.getByPlaceholderText(/99999-9999/i);

      fireEvent.change(nameInput, { target: { value: 'João Santos' } });
      fireEvent.change(phoneInput, { target: { value: '11999999999' } });

      fireEvent.click(screen.getByText('Salvar Cadastro'));

      await waitFor(() => {
        expect(mockAddPatient).toHaveBeenCalledWith(expect.objectContaining({
          tags: ['Novo'],
        }));
      });
    });
  });

  describe('form submission - validation', () => {
    it('should show warning when name is empty', () => {
      renderNewPatient();

      const phoneInput = screen.getByPlaceholderText(/99999-9999/i);
      fireEvent.change(phoneInput, { target: { value: '11999999999' } });

      fireEvent.click(screen.getByText('Salvar Cadastro'));

      expect(toast.warning).toHaveBeenCalledWith('Preencha os campos obrigatórios.');
      expect(mockAddPatient).not.toHaveBeenCalled();
    });

    it('should show warning when phone is empty', () => {
      renderNewPatient();

      const nameInput = screen.getByPlaceholderText(/Maria Silva Oliveira/i);
      fireEvent.change(nameInput, { target: { value: 'João Santos' } });

      fireEvent.click(screen.getByText('Salvar Cadastro'));

      expect(toast.warning).toHaveBeenCalledWith('Preencha os campos obrigatórios.');
      expect(mockAddPatient).not.toHaveBeenCalled();
    });

    it('should not submit without any required fields', () => {
      renderNewPatient();
      fireEvent.click(screen.getByText('Salvar Cadastro'));

      expect(toast.warning).toHaveBeenCalledWith('Preencha os campos obrigatórios.');
      expect(mockAddPatient).not.toHaveBeenCalled();
    });
  });

  describe('form submission - error', () => {
    it('should handle addPatient error gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockAddPatient.mockRejectedValueOnce(new Error('API Error'));

      renderNewPatient();

      const nameInput = screen.getByPlaceholderText(/Maria Silva Oliveira/i);
      const phoneInput = screen.getByPlaceholderText(/99999-9999/i);

      fireEvent.change(nameInput, { target: { value: 'João Santos' } });
      fireEvent.change(phoneInput, { target: { value: '11999999999' } });

      fireEvent.click(screen.getByText('Salvar Cadastro'));

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Error creating patient:',
          expect.any(Error)
        );
      });

      consoleSpy.mockRestore();
    });

    it('should show error toast on failure', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockAddPatient.mockRejectedValueOnce(new Error('API Error'));

      renderNewPatient();

      const nameInput = screen.getByPlaceholderText(/Maria Silva Oliveira/i);
      const phoneInput = screen.getByPlaceholderText(/99999-9999/i);

      fireEvent.change(nameInput, { target: { value: 'João Santos' } });
      fireEvent.change(phoneInput, { target: { value: '11999999999' } });

      fireEvent.click(screen.getByText('Salvar Cadastro'));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Erro ao cadastrar paciente. Tente novamente.');
      });

      consoleSpy.mockRestore();
    });
  });

  describe('navigation', () => {
    it('should navigate to patients list on cancel', () => {
      renderNewPatient();
      fireEvent.click(screen.getByText('Cancelar'));
      expect(mockNavigate).toHaveBeenCalledWith('/patients');
    });
  });

  describe('form labels', () => {
    it('should have Nome Completo label', () => {
      renderNewPatient();
      expect(screen.getByText('Nome Completo')).toBeInTheDocument();
    });

    it('should have Data de Nascimento label', () => {
      renderNewPatient();
      expect(screen.getByText('Data de Nascimento')).toBeInTheDocument();
    });

    it('should have Gênero label', () => {
      renderNewPatient();
      expect(screen.getByText('Gênero')).toBeInTheDocument();
    });

    it('should have Celular label', () => {
      renderNewPatient();
      expect(screen.getByText(/Celular/)).toBeInTheDocument();
    });

    it('should have Email label', () => {
      renderNewPatient();
      expect(screen.getByText('Email')).toBeInTheDocument();
    });
  });

  describe('select options', () => {
    it('should have gender options', () => {
      renderNewPatient();
      const genderSelect = document.querySelector('select[name="gender"]') as HTMLSelectElement;
      expect(genderSelect.querySelectorAll('option').length).toBe(4); // Selecione, Feminino, Masculino, Outro
    });

    it('should have insurance options', () => {
      renderNewPatient();
      const insuranceSelect = document.querySelector('select[name="insurance"]') as HTMLSelectElement;
      expect(insuranceSelect.querySelectorAll('option').length).toBe(4); // Particular, Unimed, Bradesco, SulAmérica
    });

    it('should have Particular as default insurance', () => {
      renderNewPatient();
      const insuranceSelect = document.querySelector('select[name="insurance"]') as HTMLSelectElement;
      expect(insuranceSelect.value).toBe('Particular');
    });
  });
});
