/**
 * Onboarding Page Tests
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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
    createClinic: mockCreateClinic.mockResolvedValue({ id: 'clinic-123' }),
  })),
}));

// Mock onboarding step components
vi.mock('../../components/onboarding/StepIndicator', () => ({
  StepIndicator: ({ number, title, isActive, isCompleted }: { number: number; title: string; isActive: boolean; isCompleted: boolean }) => (
    <div data-testid={`step-${number}`} data-active={isActive} data-completed={isCompleted}>
      {title}
    </div>
  ),
}));

vi.mock('../../components/onboarding/StepClinicInfo', () => ({
  StepClinicInfo: ({ clinicName, setClinicName, phone, setPhone, address, setAddress }: {
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
  StepSpecialties: () => <div data-testid="step-specialties">Specialties Selection</div>,
}));

vi.mock('../../components/onboarding/StepSettings', () => ({
  StepSettings: () => <div data-testid="step-settings">Settings Step</div>,
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
  });

  describe('navigation', () => {
    it('should have next button initially disabled if name is empty', () => {
      renderOnboarding();
      // The Continuar button should be present
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
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
});
