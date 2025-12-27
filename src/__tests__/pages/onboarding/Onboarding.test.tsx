/**
 * Onboarding Page Tests - Rendering & Navigation
 *
 * Tests for rendering and step navigation in the onboarding flow.
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { resetOnboardingMocks, mockCreateClinic } from './setup';
import { Onboarding } from '../../../pages/Onboarding';

const renderOnboarding = () => {
  return render(
    <MemoryRouter>
      <Onboarding />
    </MemoryRouter>
  );
};

describe('Onboarding', () => {
  beforeEach(() => {
    resetOnboardingMocks();
  });

  afterEach(() => {
    cleanup();
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
      fireEvent.change(input, { target: { value: 'AB' } });
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
      const input = screen.getByTestId('clinic-name-input');
      fireEvent.change(input, { target: { value: 'Clínica Genesis' } });
      fireEvent.click(screen.getByText('Continuar'));
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
      const input = screen.getByTestId('clinic-name-input');
      fireEvent.change(input, { target: { value: 'Clínica Genesis' } });
      fireEvent.click(screen.getByText('Continuar'));
      fireEvent.click(screen.getByText('Continuar'));
      expect(screen.getByTestId('step-settings')).toBeInTheDocument();
    });
  });

  describe('navigation - backward', () => {
    it('should navigate back to step 1 from step 2', () => {
      renderOnboarding();
      const input = screen.getByTestId('clinic-name-input');
      fireEvent.change(input, { target: { value: 'Clínica Genesis' } });
      fireEvent.click(screen.getByText('Continuar'));
      fireEvent.click(screen.getByText('Voltar'));
      expect(screen.getByTestId('step-clinic-info')).toBeInTheDocument();
    });

    it('should navigate back to step 2 from step 3', () => {
      renderOnboarding();
      const input = screen.getByTestId('clinic-name-input');
      fireEvent.change(input, { target: { value: 'Clínica Genesis' } });
      fireEvent.click(screen.getByText('Continuar'));
      fireEvent.click(screen.getByText('Continuar'));
      fireEvent.click(screen.getByText('Voltar'));
      expect(screen.getByTestId('step-specialties')).toBeInTheDocument();
    });

    it('should preserve clinic name when navigating back', () => {
      renderOnboarding();
      const input = screen.getByTestId('clinic-name-input');
      fireEvent.change(input, { target: { value: 'Test Clinic' } });
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
      fireEvent.click(screen.getByTestId('toggle-medicina'));
      expect(screen.getByTestId('selected-count')).toHaveTextContent('0 selected');
    });

    it('should disable continue when no specialties selected', () => {
      renderOnboarding();
      goToStep2();
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
});
