/**
 * Patient Portal Login Tests
 *
 * Smoke tests for patient login page.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock PatientAuthContext
const mockSendMagicLink = vi.fn();
const mockClearError = vi.fn();

vi.mock('../../../contexts/PatientAuthContext', () => ({
  usePatientAuth: vi.fn(() => ({
    sendMagicLink: mockSendMagicLink,
    loading: false,
    error: null,
    clearError: mockClearError,
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

  describe('branding', () => {
    it('should render portal title', () => {
      renderLogin();
      expect(screen.getByText(/Portal do Paciente/i)).toBeInTheDocument();
    });

    it('should render clinic name', () => {
      renderLogin();
      expect(screen.getByText(/Clínica Genesis/i)).toBeInTheDocument();
    });
  });

  describe('form', () => {
    it('should render email input', () => {
      renderLogin();
      expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    });

    it('should render submit button', () => {
      renderLogin();
      expect(screen.getByText(/Enviar link de acesso/i)).toBeInTheDocument();
    });
  });

  describe('interaction', () => {
    it('should allow typing email', () => {
      renderLogin();
      const input = screen.getByPlaceholderText(/email/i);
      fireEvent.change(input, { target: { value: 'test@example.com' } });
      expect(input).toHaveValue('test@example.com');
    });

    it('should call sendMagicLink on form submit', async () => {
      renderLogin();
      const input = screen.getByPlaceholderText(/email/i);
      const button = screen.getByText(/Enviar link de acesso/i);

      fireEvent.change(input, { target: { value: 'test@example.com' } });
      fireEvent.click(button);

      expect(mockSendMagicLink).toHaveBeenCalled();
    });
  });

  describe('security', () => {
    it('should show security badge', () => {
      renderLogin();
      expect(screen.getByText(/Acesso seguro/i)).toBeInTheDocument();
    });
  });
});
