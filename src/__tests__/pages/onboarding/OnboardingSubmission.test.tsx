/**
 * Onboarding Page Tests - Form Submission & Error Handling
 *
 * Tests for form submission, data passing, and error handling in the onboarding flow.
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { resetOnboardingMocks, mockCreateClinic, mockNavigate } from './setup';
import { Onboarding } from '../../../pages/Onboarding';

const renderOnboarding = () => {
  return render(
    <MemoryRouter>
      <Onboarding />
    </MemoryRouter>
  );
};

describe('Onboarding - Submission & Errors', () => {
  beforeEach(() => {
    resetOnboardingMocks();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  const goToStep3 = () => {
    const input = screen.getByTestId('clinic-name-input');
    fireEvent.change(input, { target: { value: 'Clínica Genesis' } });
    fireEvent.click(screen.getByText('Continuar'));
    fireEvent.click(screen.getByText('Continuar'));
  };

  describe('form submission', () => {
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

    it('should stay on settings page on error', async () => {
      mockCreateClinic.mockRejectedValue(new Error('Failed'));

      renderOnboarding();
      goToStep3();

      fireEvent.click(screen.getByText('Finalizar Setup'));

      // Wait for error to appear
      await waitFor(() => {
        expect(screen.getByText('Failed')).toBeInTheDocument();
      });

      // Verify we're still on step 3 (settings)
      expect(screen.getByTestId('step-settings')).toBeInTheDocument();

      // Button should be re-enabled
      expect(screen.getByText('Finalizar Setup')).not.toBeDisabled();
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
