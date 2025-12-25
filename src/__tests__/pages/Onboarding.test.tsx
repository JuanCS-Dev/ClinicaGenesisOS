/**
 * Onboarding Page Tests
 *
 * Comprehensive tests for the clinic onboarding flow.
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mockNavigate = vi.fn();
const mockCreateClinic = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    user: { uid: 'user-123', email: 'admin@clinica.com' },
    userProfile: null, // No profile yet - onboarding needed
  })),
}));

vi.mock('../../contexts/ClinicContext', () => ({
  useClinicContext: vi.fn(() => ({
    clinicId: null, // No clinic yet - onboarding needed
    createClinic: mockCreateClinic,
  })),
}));

// Mock onboarding step components
vi.mock('../../components/onboarding/StepIndicator', () => ({
  StepIndicator: ({
    number,
    title,
    isActive,
    isCompleted,
  }: {
    number: number;
    title: string;
    isActive: boolean;
    isCompleted: boolean;
  }) => (
    <div data-testid={`step-${number}`} data-active={isActive} data-completed={isCompleted}>
      {title}
    </div>
  ),
}));

vi.mock('../../components/onboarding/StepClinicInfo', () => ({
  StepClinicInfo: ({
    clinicName,
    setClinicName,
    phone,
    setPhone,
    address,
    setAddress,
  }: {
    clinicName: string;
    setClinicName: (v: string) => void;
    phone: string;
    setPhone: (v: string) => void;
    address: string;
    setAddress: (v: string) => void;
  }) => (
    <div data-testid="step-clinic-info">
      <input
        data-testid="clinic-name-input"
        placeholder="Nome da clínica"
        value={clinicName}
        onChange={(e) => setClinicName(e.target.value)}
      />
      <input
        data-testid="phone-input"
        placeholder="Telefone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <input
        data-testid="address-input"
        placeholder="Endereço"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />
    </div>
  ),
}));

vi.mock('../../components/onboarding/StepSpecialties', () => ({
  StepSpecialties: ({
    selectedSpecialties,
    toggleSpecialty,
  }: {
    selectedSpecialties: string[];
    toggleSpecialty: (s: string) => void;
  }) => (
    <div data-testid="step-specialties">
      <span data-testid="selected-count">{selectedSpecialties.length} selected</span>
      <button data-testid="toggle-dermatologia" onClick={() => toggleSpecialty('dermatologia')}>
        Toggle Dermatologia
      </button>
      <button data-testid="toggle-medicina" onClick={() => toggleSpecialty('medicina')}>
        Toggle Medicina
      </button>
    </div>
  ),
}));

vi.mock('../../components/onboarding/StepSettings', () => ({
  StepSettings: ({
    workStart,
    setWorkStart,
    workEnd,
    setWorkEnd,
    appointmentDuration,
    setAppointmentDuration,
    seedData,
    setSeedData,
  }: {
    workStart: string;
    setWorkStart: (v: string) => void;
    workEnd: string;
    setWorkEnd: (v: string) => void;
    appointmentDuration: number;
    setAppointmentDuration: (v: number) => void;
    seedData: boolean;
    setSeedData: (v: boolean) => void;
  }) => (
    <div data-testid="step-settings">
      <input
        data-testid="work-start-input"
        value={workStart}
        onChange={(e) => setWorkStart(e.target.value)}
      />
      <input
        data-testid="work-end-input"
        value={workEnd}
        onChange={(e) => setWorkEnd(e.target.value)}
      />
      <input
        data-testid="duration-input"
        type="number"
        value={appointmentDuration}
        onChange={(e) => setAppointmentDuration(Number(e.target.value))}
      />
      <input
        data-testid="seed-data-checkbox"
        type="checkbox"
        checked={seedData}
        onChange={(e) => setSeedData(e.target.checked)}
      />
    </div>
  ),
}));

import { Onboarding } from '../../pages/Onboarding';

const renderOnboarding = () => {
  return render(
    <MemoryRouter>
      <Onboarding />
    </MemoryRouter>
  );
};

describe('Onboarding', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateClinic.mockResolvedValue({ id: 'clinic-123' });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('rendering', () => {
    it('should render clinic genesis branding', () => {
      renderOnboarding();
      expect(screen.getByText('CLÍNICA GENESIS')).toBeInTheDocument();
    });

    it('should render step indicators', () => {
      renderOnboarding();
      expect(screen.getByTestId('step-1')).toBeInTheDocument();
      expect(screen.getByTestId('step-2')).toBeInTheDocument();
      expect(screen.getByTestId('step-3')).toBeInTheDocument();
    });

    it('should show step 1 as active initially', () => {
      renderOnboarding();
      const step1 = screen.getByTestId('step-1');
      expect(step1).toHaveAttribute('data-active', 'true');
    });

    it('should render first step content', () => {
      renderOnboarding();
      expect(screen.getByTestId('step-clinic-info')).toBeInTheDocument();
    });

    it('should render Continuar button', () => {
      renderOnboarding();
      expect(screen.getByText('Continuar')).toBeInTheDocument();
    });

    it('should render Voltar button (hidden on step 1)', () => {
      renderOnboarding();
      expect(screen.getByText('Voltar')).toBeInTheDocument();
    });
  });

  describe('step indicators', () => {
    it('should show Dados da Clínica step', () => {
      renderOnboarding();
      expect(screen.getByText('Dados da Clínica')).toBeInTheDocument();
    });

    it('should show Especialidades step', () => {
      renderOnboarding();
      expect(screen.getByText('Especialidades')).toBeInTheDocument();
    });

    it('should show Configurações step', () => {
      renderOnboarding();
      expect(screen.getByText('Configurações')).toBeInTheDocument();
    });
  });

  describe('step 1 - clinic info', () => {
    it('should have clinic name input', () => {
      renderOnboarding();
      expect(screen.getByTestId('clinic-name-input')).toBeInTheDocument();
    });

    it('should allow entering clinic name', () => {
      renderOnboarding();
      const input = screen.getByTestId('clinic-name-input');
      fireEvent.change(input, { target: { value: 'Clínica Genesis' } });
      expect(input).toHaveValue('Clínica Genesis');
    });

    it('should have phone input', () => {
      renderOnboarding();
      expect(screen.getByTestId('phone-input')).toBeInTheDocument();
    });

    it('should have address input', () => {
      renderOnboarding();
      expect(screen.getByTestId('address-input')).toBeInTheDocument();
    });

    it('should disable next button if clinic name is too short', () => {
      renderOnboarding();
      const input = screen.getByTestId('clinic-name-input');
      fireEvent.change(input, { target: { value: 'AB' } }); // Less than 3 chars
      const continueButton = screen.getByText('Continuar');
      expect(continueButton).toBeDisabled();
    });

    it('should enable next button when clinic name is valid', () => {
      renderOnboarding();
      const input = screen.getByTestId('clinic-name-input');
      fireEvent.change(input, { target: { value: 'Genesis Clinic' } });
      const continueButton = screen.getByText('Continuar');
      expect(continueButton).not.toBeDisabled();
    });
  });

  describe('navigation - forward', () => {
    it('should navigate to step 2 when Continue clicked with valid name', () => {
      renderOnboarding();
      // Fill clinic name
      const input = screen.getByTestId('clinic-name-input');
      fireEvent.change(input, { target: { value: 'Clínica Genesis' } });

      // Click continue
      fireEvent.click(screen.getByText('Continuar'));

      // Step 2 content should be visible
      expect(screen.getByTestId('step-specialties')).toBeInTheDocument();
    });

    it('should show step 2 as active after navigation', () => {
      renderOnboarding();
      const input = screen.getByTestId('clinic-name-input');
      fireEvent.change(input, { target: { value: 'Clínica Genesis' } });
      fireEvent.click(screen.getByText('Continuar'));

      const step2 = screen.getByTestId('step-2');
      expect(step2).toHaveAttribute('data-active', 'true');
    });

    it('should mark step 1 as completed after moving to step 2', () => {
      renderOnboarding();
      const input = screen.getByTestId('clinic-name-input');
      fireEvent.change(input, { target: { value: 'Clínica Genesis' } });
      fireEvent.click(screen.getByText('Continuar'));

      const step1 = screen.getByTestId('step-1');
      expect(step1).toHaveAttribute('data-completed', 'true');
    });

    it('should navigate to step 3 from step 2', () => {
      renderOnboarding();
      // Go to step 2
      const input = screen.getByTestId('clinic-name-input');
      fireEvent.change(input, { target: { value: 'Clínica Genesis' } });
      fireEvent.click(screen.getByText('Continuar'));

      // Go to step 3
      fireEvent.click(screen.getByText('Continuar'));

      expect(screen.getByTestId('step-settings')).toBeInTheDocument();
    });
  });

  describe('navigation - backward', () => {
    it('should navigate back to step 1 from step 2', () => {
      renderOnboarding();
      // Go to step 2
      const input = screen.getByTestId('clinic-name-input');
      fireEvent.change(input, { target: { value: 'Clínica Genesis' } });
      fireEvent.click(screen.getByText('Continuar'));

      // Go back
      fireEvent.click(screen.getByText('Voltar'));

      expect(screen.getByTestId('step-clinic-info')).toBeInTheDocument();
    });

    it('should navigate back to step 2 from step 3', () => {
      renderOnboarding();
      // Go to step 3
      const input = screen.getByTestId('clinic-name-input');
      fireEvent.change(input, { target: { value: 'Clínica Genesis' } });
      fireEvent.click(screen.getByText('Continuar'));
      fireEvent.click(screen.getByText('Continuar'));

      // Go back
      fireEvent.click(screen.getByText('Voltar'));

      expect(screen.getByTestId('step-specialties')).toBeInTheDocument();
    });

    it('should preserve clinic name when navigating back', () => {
      renderOnboarding();
      const input = screen.getByTestId('clinic-name-input');
      fireEvent.change(input, { target: { value: 'Test Clinic' } });

      // Go forward and back
      fireEvent.click(screen.getByText('Continuar'));
      fireEvent.click(screen.getByText('Voltar'));

      const nameInput = screen.getByTestId('clinic-name-input');
      expect(nameInput).toHaveValue('Test Clinic');
    });
  });

  describe('step 2 - specialties', () => {
    const goToStep2 = () => {
      const input = screen.getByTestId('clinic-name-input');
      fireEvent.change(input, { target: { value: 'Clínica Genesis' } });
      fireEvent.click(screen.getByText('Continuar'));
    };

    it('should show specialties step content', () => {
      renderOnboarding();
      goToStep2();
      expect(screen.getByTestId('step-specialties')).toBeInTheDocument();
    });

    it('should have medicina selected by default', () => {
      renderOnboarding();
      goToStep2();
      expect(screen.getByTestId('selected-count')).toHaveTextContent('1 selected');
    });

    it('should allow adding specialty', () => {
      renderOnboarding();
      goToStep2();
      fireEvent.click(screen.getByTestId('toggle-dermatologia'));
      expect(screen.getByTestId('selected-count')).toHaveTextContent('2 selected');
    });

    it('should allow removing specialty', () => {
      renderOnboarding();
      goToStep2();
      // Medicina is selected by default, toggle it off
      fireEvent.click(screen.getByTestId('toggle-medicina'));
      expect(screen.getByTestId('selected-count')).toHaveTextContent('0 selected');
    });

    it('should disable continue when no specialties selected', () => {
      renderOnboarding();
      goToStep2();
      // Remove default medicina
      fireEvent.click(screen.getByTestId('toggle-medicina'));

      const continueButton = screen.getByText('Continuar');
      expect(continueButton).toBeDisabled();
    });
  });

  describe('step 3 - settings', () => {
    const goToStep3 = () => {
      const input = screen.getByTestId('clinic-name-input');
      fireEvent.change(input, { target: { value: 'Clínica Genesis' } });
      fireEvent.click(screen.getByText('Continuar'));
      fireEvent.click(screen.getByText('Continuar'));
    };

    it('should show settings step content', () => {
      renderOnboarding();
      goToStep3();
      expect(screen.getByTestId('step-settings')).toBeInTheDocument();
    });

    it('should have Finalizar Setup button on step 3', () => {
      renderOnboarding();
      goToStep3();
      expect(screen.getByText('Finalizar Setup')).toBeInTheDocument();
    });

    it('should not show Continuar button on step 3', () => {
      renderOnboarding();
      goToStep3();
      expect(screen.queryByText('Continuar')).not.toBeInTheDocument();
    });

    it('should have work start input with default value', () => {
      renderOnboarding();
      goToStep3();
      const workStart = screen.getByTestId('work-start-input');
      expect(workStart).toHaveValue('08:00');
    });

    it('should have work end input with default value', () => {
      renderOnboarding();
      goToStep3();
      const workEnd = screen.getByTestId('work-end-input');
      expect(workEnd).toHaveValue('18:00');
    });

    it('should have appointment duration with default value', () => {
      renderOnboarding();
      goToStep3();
      const duration = screen.getByTestId('duration-input');
      expect(duration).toHaveValue(30);
    });

    it('should have seed data checkbox checked by default', () => {
      renderOnboarding();
      goToStep3();
      const seedData = screen.getByTestId('seed-data-checkbox');
      expect(seedData).toBeChecked();
    });

    it('should allow changing work hours', () => {
      renderOnboarding();
      goToStep3();
      const workStart = screen.getByTestId('work-start-input');
      fireEvent.change(workStart, { target: { value: '09:00' } });
      expect(workStart).toHaveValue('09:00');
    });

    it('should allow toggling seed data', () => {
      renderOnboarding();
      goToStep3();
      const seedData = screen.getByTestId('seed-data-checkbox');
      fireEvent.click(seedData);
      expect(seedData).not.toBeChecked();
    });
  });

  describe('form submission', () => {
    const goToStep3 = () => {
      const input = screen.getByTestId('clinic-name-input');
      fireEvent.change(input, { target: { value: 'Clínica Genesis' } });
      fireEvent.click(screen.getByText('Continuar'));
      fireEvent.click(screen.getByText('Continuar'));
    };

    it('should call createClinic on submit', async () => {
      renderOnboarding();
      goToStep3();

      fireEvent.click(screen.getByText('Finalizar Setup'));

      await waitFor(() => {
        expect(mockCreateClinic).toHaveBeenCalled();
      });
    });

    it('should pass clinic name to createClinic', async () => {
      renderOnboarding();
      const input = screen.getByTestId('clinic-name-input');
      fireEvent.change(input, { target: { value: 'My Clinic' } });
      fireEvent.click(screen.getByText('Continuar'));
      fireEvent.click(screen.getByText('Continuar'));

      fireEvent.click(screen.getByText('Finalizar Setup'));

      await waitFor(() => {
        expect(mockCreateClinic).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'My Clinic',
          }),
          expect.any(Boolean)
        );
      });
    });

    it('should pass phone and address to createClinic', async () => {
      renderOnboarding();
      fireEvent.change(screen.getByTestId('clinic-name-input'), {
        target: { value: 'My Clinic' },
      });
      fireEvent.change(screen.getByTestId('phone-input'), {
        target: { value: '11999999999' },
      });
      fireEvent.change(screen.getByTestId('address-input'), {
        target: { value: 'Rua Teste, 123' },
      });
      fireEvent.click(screen.getByText('Continuar'));
      fireEvent.click(screen.getByText('Continuar'));

      fireEvent.click(screen.getByText('Finalizar Setup'));

      await waitFor(() => {
        expect(mockCreateClinic).toHaveBeenCalledWith(
          expect.objectContaining({
            phone: '11999999999',
            address: 'Rua Teste, 123',
          }),
          expect.any(Boolean)
        );
      });
    });

    it('should pass settings to createClinic', async () => {
      renderOnboarding();
      goToStep3();

      fireEvent.click(screen.getByText('Finalizar Setup'));

      await waitFor(() => {
        expect(mockCreateClinic).toHaveBeenCalledWith(
          expect.objectContaining({
            settings: expect.objectContaining({
              workingHours: { start: '08:00', end: '18:00' },
              defaultAppointmentDuration: 30,
              specialties: expect.arrayContaining(['medicina']),
            }),
          }),
          expect.any(Boolean)
        );
      });
    });

    it('should navigate to dashboard on success', async () => {
      renderOnboarding();
      goToStep3();

      fireEvent.click(screen.getByText('Finalizar Setup'));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('should show loading state during submission', async () => {
      // Make createClinic take some time
      mockCreateClinic.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ id: 'clinic-123' }), 100))
      );

      renderOnboarding();
      goToStep3();

      fireEvent.click(screen.getByText('Finalizar Setup'));

      await waitFor(() => {
        expect(screen.getByText('Criando Clínica...')).toBeInTheDocument();
      });
    });

    it('should disable submit button during loading', async () => {
      mockCreateClinic.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ id: 'clinic-123' }), 100))
      );

      renderOnboarding();
      goToStep3();

      const submitButton = screen.getByText('Finalizar Setup');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Criando Clínica...')).toBeInTheDocument();
      });

      // Button should be disabled (we look for the parent button)
      const loadingButton = screen.getByText('Criando Clínica...').closest('button');
      expect(loadingButton).toBeDisabled();
    });
  });

  describe('error handling', () => {
    const goToStep3 = () => {
      const input = screen.getByTestId('clinic-name-input');
      fireEvent.change(input, { target: { value: 'Clínica Genesis' } });
      fireEvent.click(screen.getByText('Continuar'));
      fireEvent.click(screen.getByText('Continuar'));
    };

    it('should display error message on failure', async () => {
      mockCreateClinic.mockRejectedValue(new Error('Falha ao criar clínica'));

      renderOnboarding();
      goToStep3();

      fireEvent.click(screen.getByText('Finalizar Setup'));

      await waitFor(() => {
        expect(screen.getByText('Falha ao criar clínica')).toBeInTheDocument();
      });
    });

    it('should show generic error for non-Error exceptions', async () => {
      mockCreateClinic.mockRejectedValue('Unknown error');

      renderOnboarding();
      goToStep3();

      fireEvent.click(screen.getByText('Finalizar Setup'));

      await waitFor(() => {
        expect(screen.getByText('Erro ao criar clínica')).toBeInTheDocument();
      });
    });

    it('should not navigate on error', async () => {
      mockCreateClinic.mockRejectedValue(new Error('Failed'));

      renderOnboarding();
      goToStep3();

      fireEvent.click(screen.getByText('Finalizar Setup'));

      await waitFor(() => {
        expect(screen.getByText('Failed')).toBeInTheDocument();
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should re-enable submit button after error', async () => {
      mockCreateClinic.mockRejectedValue(new Error('Failed'));

      renderOnboarding();
      goToStep3();

      fireEvent.click(screen.getByText('Finalizar Setup'));

      await waitFor(() => {
        expect(screen.getByText('Failed')).toBeInTheDocument();
      });

      // Button should be enabled again
      expect(screen.getByText('Finalizar Setup')).not.toBeDisabled();
    });
  });
});
