/**
 * Register Page Tests
 *
 * Tests for registration page component.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Register } from '../../../pages/auth/Register';
import { AuthProvider } from '../../../contexts/AuthContext';
import * as firebaseAuth from 'firebase/auth';

const mockUser = {
  uid: 'test-uid-123',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: 'https://example.com/photo.jpg',
  emailVerified: true,
};

const DashboardPage = () => <div data-testid="dashboard">Dashboard</div>;
const LoginPage = () => <div data-testid="login">Login</div>;

const renderRegister = () => {
  return render(
    <MemoryRouter initialEntries={['/register']}>
      <AuthProvider>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
};

describe('Register', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(firebaseAuth.onAuthStateChanged).mockImplementation((auth, callback) => {
      setTimeout(() => (callback as (user: null) => void)(null), 0);
      return vi.fn();
    });
  });

  describe('rendering', () => {
    it('should render registration form', async () => {
      renderRegister();

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /criar conta/i })).toBeInTheDocument();
      });

      expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^senha$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirmar senha/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /criar conta/i })).toBeInTheDocument();
    });

    it('should render Google sign up button', async () => {
      renderRegister();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /google/i })).toBeInTheDocument();
      });
    });

    it('should render link to login page', async () => {
      renderRegister();

      await waitFor(() => {
        expect(screen.getByRole('link', { name: /entrar/i })).toBeInTheDocument();
      });
    });

    it('should render password requirements', async () => {
      renderRegister();

      await waitFor(() => {
        expect(screen.getByText(/mínimo 6 caracteres/i)).toBeInTheDocument();
        expect(screen.getByText(/senhas coincidem/i)).toBeInTheDocument();
      });
    });

    it('should render branding elements', async () => {
      renderRegister();

      await waitFor(() => {
        expect(screen.getAllByText(/clínica genesis/i).length).toBeGreaterThan(0);
      });
    });

    it('should render feature highlights', async () => {
      renderRegister();

      await waitFor(() => {
        expect(screen.getByText(/agenda inteligente/i)).toBeInTheDocument();
        expect(screen.getByText(/prontuário eletrônico/i)).toBeInTheDocument();
        expect(screen.getByText(/whatsapp integrado/i)).toBeInTheDocument();
      });
    });
  });

  describe('form validation', () => {
    it('should require all fields', async () => {
      renderRegister();

      await waitFor(() => {
        expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
      });

      expect(screen.getByLabelText(/nome completo/i)).toBeRequired();
      expect(screen.getByLabelText(/email/i)).toBeRequired();
      expect(screen.getByLabelText(/^senha$/i)).toBeRequired();
      expect(screen.getByLabelText(/confirmar senha/i)).toBeRequired();
    });
  });

  describe('password requirements', () => {
    it('should show requirement met for password length', async () => {
      renderRegister();

      await waitFor(() => {
        expect(screen.getByLabelText(/^senha$/i)).toBeInTheDocument();
      });

      const user = userEvent.setup();
      const passwordInput = screen.getByLabelText(/^senha$/i);

      await user.type(passwordInput, 'password123');

      await waitFor(() => {
        expect(screen.getByText(/mínimo 6 caracteres/i).className).toContain('text-green-600');
      });
    });

    it('should show requirement met when passwords match', async () => {
      renderRegister();

      await waitFor(() => {
        expect(screen.getByLabelText(/^senha$/i)).toBeInTheDocument();
      });

      const user = userEvent.setup();

      await user.type(screen.getByLabelText(/^senha$/i), 'password123');
      await user.type(screen.getByLabelText(/confirmar senha/i), 'password123');

      await waitFor(() => {
        expect(screen.getByText(/senhas coincidem/i).className).toContain('text-green-600');
      });
    });

    it('should not show match requirement when passwords differ', async () => {
      renderRegister();

      await waitFor(() => {
        expect(screen.getByLabelText(/^senha$/i)).toBeInTheDocument();
      });

      const user = userEvent.setup();

      await user.type(screen.getByLabelText(/^senha$/i), 'password123');
      await user.type(screen.getByLabelText(/confirmar senha/i), 'different');

      expect(screen.getByText(/senhas coincidem/i).className).toContain('text-genesis-medium');
    });
  });

  describe('form submission', () => {
    it('should create account successfully', async () => {
      vi.mocked(firebaseAuth.createUserWithEmailAndPassword).mockResolvedValueOnce({
        user: mockUser,
      } as firebaseAuth.UserCredential);
      vi.mocked(firebaseAuth.updateProfile).mockResolvedValueOnce();

      renderRegister();

      await waitFor(() => {
        expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
      });

      const user = userEvent.setup();

      await user.type(screen.getByLabelText(/nome completo/i), 'Test User');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^senha$/i), 'password123');
      await user.type(screen.getByLabelText(/confirmar senha/i), 'password123');
      await user.click(screen.getByRole('button', { name: /criar conta/i }));

      await waitFor(() => {
        expect(firebaseAuth.createUserWithEmailAndPassword).toHaveBeenCalledWith(
          expect.anything(),
          'test@example.com',
          'password123'
        );
      });

      expect(firebaseAuth.updateProfile).toHaveBeenCalledWith(mockUser, { displayName: 'Test User' });
    });

    it('should navigate to dashboard on successful registration', async () => {
      vi.mocked(firebaseAuth.createUserWithEmailAndPassword).mockResolvedValueOnce({
        user: mockUser,
      } as firebaseAuth.UserCredential);
      vi.mocked(firebaseAuth.updateProfile).mockResolvedValueOnce();

      renderRegister();

      await waitFor(() => {
        expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
      });

      const user = userEvent.setup();

      await user.type(screen.getByLabelText(/nome completo/i), 'Test User');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^senha$/i), 'password123');
      await user.type(screen.getByLabelText(/confirmar senha/i), 'password123');
      await user.click(screen.getByRole('button', { name: /criar conta/i }));

      await waitFor(() => {
        expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      });
    });

    it('should show loading state during submission', async () => {
      vi.mocked(firebaseAuth.createUserWithEmailAndPassword).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ user: mockUser } as firebaseAuth.UserCredential), 100))
      );
      vi.mocked(firebaseAuth.updateProfile).mockResolvedValueOnce();

      renderRegister();

      await waitFor(() => {
        expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
      });

      const user = userEvent.setup();

      await user.type(screen.getByLabelText(/nome completo/i), 'Test User');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^senha$/i), 'password123');
      await user.type(screen.getByLabelText(/confirmar senha/i), 'password123');
      await user.click(screen.getByRole('button', { name: /criar conta/i }));

      expect(screen.getByRole('button', { name: /criando conta/i })).toBeInTheDocument();
    });
  });

  describe('local validation', () => {
    it('should show error when passwords do not match', async () => {
      renderRegister();

      await waitFor(() => {
        expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
      });

      const user = userEvent.setup();

      await user.type(screen.getByLabelText(/nome completo/i), 'Test User');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^senha$/i), 'password123');
      await user.type(screen.getByLabelText(/confirmar senha/i), 'different');
      await user.click(screen.getByRole('button', { name: /criar conta/i }));

      await waitFor(() => {
        expect(screen.getByText(/senhas não coincidem/i)).toBeInTheDocument();
      });
    });

    it('should show error when password is too short', async () => {
      renderRegister();

      await waitFor(() => {
        expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
      });

      const user = userEvent.setup();

      await user.type(screen.getByLabelText(/nome completo/i), 'Test User');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^senha$/i), '123');
      await user.type(screen.getByLabelText(/confirmar senha/i), '123');
      await user.click(screen.getByRole('button', { name: /criar conta/i }));

      await waitFor(() => {
        expect(screen.getByText(/pelo menos 6 caracteres/i)).toBeInTheDocument();
      });
    });
  });

  describe('error handling', () => {
    it('should display error on email already in use', async () => {
      const error = new Error('Email already in use');
      (error as { code?: string }).code = 'auth/email-already-in-use';
      vi.mocked(firebaseAuth.createUserWithEmailAndPassword).mockRejectedValueOnce(error);

      renderRegister();

      await waitFor(() => {
        expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
      });

      const user = userEvent.setup();

      await user.type(screen.getByLabelText(/nome completo/i), 'Test User');
      await user.type(screen.getByLabelText(/email/i), 'existing@example.com');
      await user.type(screen.getByLabelText(/^senha$/i), 'password123');
      await user.type(screen.getByLabelText(/confirmar senha/i), 'password123');
      await user.click(screen.getByRole('button', { name: /criar conta/i }));

      await waitFor(() => {
        expect(screen.getByText(/email já está em uso/i)).toBeInTheDocument();
      });
    });

    it('should display error on weak password', async () => {
      const error = new Error('Weak password');
      (error as { code?: string }).code = 'auth/weak-password';
      vi.mocked(firebaseAuth.createUserWithEmailAndPassword).mockRejectedValueOnce(error);

      renderRegister();

      await waitFor(() => {
        expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
      });

      const user = userEvent.setup();

      await user.type(screen.getByLabelText(/nome completo/i), 'Test User');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^senha$/i), 'password123');
      await user.type(screen.getByLabelText(/confirmar senha/i), 'password123');
      await user.click(screen.getByRole('button', { name: /criar conta/i }));

      await waitFor(() => {
        expect(screen.getByText(/pelo menos 6 caracteres/i)).toBeInTheDocument();
      });
    });
  });

  describe('Google sign up', () => {
    it('should call signInWithGoogle on button click', async () => {
      vi.mocked(firebaseAuth.signInWithPopup).mockResolvedValueOnce({
        user: mockUser,
      } as firebaseAuth.UserCredential);

      renderRegister();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /google/i })).toBeInTheDocument();
      });

      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: /google/i }));

      await waitFor(() => {
        expect(firebaseAuth.signInWithPopup).toHaveBeenCalled();
      });
    });

    it('should navigate to dashboard on successful Google sign up', async () => {
      vi.mocked(firebaseAuth.signInWithPopup).mockResolvedValueOnce({
        user: mockUser,
      } as firebaseAuth.UserCredential);

      renderRegister();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /google/i })).toBeInTheDocument();
      });

      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: /google/i }));

      await waitFor(() => {
        expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      });
    });
  });

  describe('password visibility toggle', () => {
    it('should toggle password visibility', async () => {
      renderRegister();

      await waitFor(() => {
        expect(screen.getByLabelText(/^senha$/i)).toBeInTheDocument();
      });

      const passwordInput = screen.getByLabelText(/^senha$/i);
      expect(passwordInput).toHaveAttribute('type', 'password');

      const user = userEvent.setup();

      const toggleButtons = screen.getAllByRole('button');
      const toggleButton = toggleButtons.find(btn =>
        !btn.textContent?.includes('Criar') && !btn.textContent?.includes('Google')
      );

      if (toggleButton) {
        await user.click(toggleButton);
        expect(passwordInput).toHaveAttribute('type', 'text');
      }
    });
  });

  describe('navigation links', () => {
    it('should navigate to login page', async () => {
      renderRegister();

      await waitFor(() => {
        expect(screen.getByRole('link', { name: /entrar/i })).toBeInTheDocument();
      });

      const user = userEvent.setup();
      await user.click(screen.getByRole('link', { name: /entrar/i }));

      await waitFor(() => {
        expect(screen.getByTestId('login')).toBeInTheDocument();
      });
    });
  });
});
