/**
 * Patient Portal Login Tests
 *
 * Smoke tests for magic link authentication.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mockSendMagicLink = vi.fn();

vi.mock('../../../contexts/PatientAuthContext', () => ({
  usePatientAuth: vi.fn(() => ({
    sendMagicLink: mockSendMagicLink,
    loading: false,
    error: null,
    clearError: vi.fn(),
  })),
}));

import { PatientLogin } from '../../../pages/patient-portal/Login';

const renderLogin = () => {
  return render(
    <MemoryRouter>
      <PatientLogin />
    </MemoryRouter>
  );
};

describe('PatientLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSendMagicLink.mockResolvedValue(undefined);
  });

  describe('smoke tests', () => {
    it('should render without crashing', () => {
      const { container } = renderLogin();
      expect(container).toBeDefined();
    });
  });

  describe('login form', () => {
    it('should render email input', () => {
      renderLogin();
      expect(screen.getByPlaceholderText(/seu@email/i)).toBeInTheDocument();
    });

    it('should render portal heading', () => {
      renderLogin();
      expect(screen.getByText(/Portal do Paciente/i)).toBeInTheDocument();
    });

    it('should render submit button', () => {
      renderLogin();
      expect(screen.getByText(/Enviar link/i)).toBeInTheDocument();
    });
  });

  describe('email submission', () => {
    it('should call sendMagicLink on form submit', async () => {
      renderLogin();

      const emailInput = screen.getByPlaceholderText(/seu@email/i);
      fireEvent.change(emailInput, { target: { value: 'test@email.com' } });

      const submitButton = screen.getByText(/Enviar link/i);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSendMagicLink).toHaveBeenCalledWith('test@email.com', 'default-clinic');
      });
    });

    it('should show success message after sending link', async () => {
      renderLogin();

      const emailInput = screen.getByPlaceholderText(/seu@email/i);
      fireEvent.change(emailInput, { target: { value: 'test@email.com' } });
      fireEvent.click(screen.getByText(/Enviar link/i));

      await waitFor(() => {
        expect(screen.getByText(/Link enviado/i)).toBeInTheDocument();
      });
    });
  });

  describe('loading state', () => {
    it('should show spinner when loading', async () => {
      const { usePatientAuth } = await import('../../../contexts/PatientAuthContext');
      vi.mocked(usePatientAuth).mockReturnValue({
        sendMagicLink: mockSendMagicLink,
        loading: true,
        error: null,
        clearError: vi.fn(),
        patient: null,
        isAuthenticated: false,
        verifyMagicLink: vi.fn(),
        logout: vi.fn(),
      });

      renderLogin();
      expect(document.querySelector('.animate-spin')).toBeTruthy();
    });
  });
});
