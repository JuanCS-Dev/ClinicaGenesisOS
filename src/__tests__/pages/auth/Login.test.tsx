/**
 * Login Page Tests
 *
 * Tests for login page component.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Login } from '../../../pages/auth/Login';
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
const RegisterPage = () => <div data-testid="register">Register</div>;
const ForgotPasswordPage = () => <div data-testid="forgot-password">Forgot Password</div>;

const renderLogin = () => {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
};

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(firebaseAuth.onAuthStateChanged).mockImplementation((auth, callback) => {
      setTimeout(() => (callback as (user: null) => void)(null), 0);
      return vi.fn();
    });
  });

  describe('rendering', () => {
    it('should render login form', async () => {
      renderLogin();

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /bem-vindo de volta/i })).toBeInTheDocument();
      });

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
    });

    it('should render Google sign in button', async () => {
      renderLogin();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /google/i })).toBeInTheDocument();
      });
    });

    it('should render link to register page', async () => {
      renderLogin();

      await waitFor(() => {
        expect(screen.getByRole('link', { name: /criar conta/i })).toBeInTheDocument();
      });
    });

    it('should render link to forgot password', async () => {
      renderLogin();

      await waitFor(() => {
        expect(screen.getByRole('link', { name: /esqueceu a senha/i })).toBeInTheDocument();
      });
    });

    it('should render branding elements', async () => {
      renderLogin();

      await waitFor(() => {
        expect(screen.getAllByText(/clínica genesis/i).length).toBeGreaterThan(0);
      });
    });
  });

  describe('form validation', () => {
    it('should require email field', async () => {
      renderLogin();

      await waitFor(() => {
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      });

      const emailInput = screen.getByLabelText(/email/i);
      expect(emailInput).toBeRequired();
    });

    it('should require password field', async () => {
      renderLogin();

      await waitFor(() => {
        expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
      });

      const passwordInput = screen.getByLabelText(/senha/i);
      expect(passwordInput).toBeRequired();
    });
  });

  describe('form submission', () => {
    it('should call signIn with email and password', async () => {
      vi.mocked(firebaseAuth.signInWithEmailAndPassword).mockResolvedValueOnce({
        user: mockUser,
      } as firebaseAuth.UserCredential);

      renderLogin();

      await waitFor(() => {
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      });

      const user = userEvent.setup();

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/senha/i), 'password123');
      await user.click(screen.getByRole('button', { name: /entrar/i }));

      await waitFor(() => {
        expect(firebaseAuth.signInWithEmailAndPassword).toHaveBeenCalledWith(
          expect.anything(),
          'test@example.com',
          'password123'
        );
      });
    });

    it('should navigate to dashboard on successful login', async () => {
      vi.mocked(firebaseAuth.signInWithEmailAndPassword).mockResolvedValueOnce({
        user: mockUser,
      } as firebaseAuth.UserCredential);

      renderLogin();

      await waitFor(() => {
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      });

      const user = userEvent.setup();

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/senha/i), 'password123');
      await user.click(screen.getByRole('button', { name: /entrar/i }));

      await waitFor(() => {
        expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      });
    });

    it('should show loading state during submission', async () => {
      vi.mocked(firebaseAuth.signInWithEmailAndPassword).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ user: mockUser } as firebaseAuth.UserCredential), 100))
      );

      renderLogin();

      await waitFor(() => {
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      });

      const user = userEvent.setup();

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/senha/i), 'password123');
      await user.click(screen.getByRole('button', { name: /entrar/i }));

      expect(screen.getByRole('button', { name: /entrando/i })).toBeInTheDocument();
    });

    it('should disable submit button during loading', async () => {
      vi.mocked(firebaseAuth.signInWithEmailAndPassword).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ user: mockUser } as firebaseAuth.UserCredential), 100))
      );

      renderLogin();

      await waitFor(() => {
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      });

      const user = userEvent.setup();

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/senha/i), 'password123');
      await user.click(screen.getByRole('button', { name: /entrar/i }));

      expect(screen.getByRole('button', { name: /entrando/i })).toBeDisabled();
    });
  });

  // Note: Error handling logic is thoroughly tested in useAuth.test.ts
  // Page tests focus on rendering, navigation, and user interactions

  describe('Google sign in', () => {
    it('should call signInWithGoogle on button click', async () => {
      vi.mocked(firebaseAuth.signInWithPopup).mockResolvedValueOnce({
        user: mockUser,
      } as firebaseAuth.UserCredential);

      renderLogin();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /google/i })).toBeInTheDocument();
      });

      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: /google/i }));

      await waitFor(() => {
        expect(firebaseAuth.signInWithPopup).toHaveBeenCalled();
      });
    });

    it('should navigate to dashboard on successful Google sign in', async () => {
      vi.mocked(firebaseAuth.signInWithPopup).mockResolvedValueOnce({
        user: mockUser,
      } as firebaseAuth.UserCredential);

      renderLogin();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /google/i })).toBeInTheDocument();
      });

      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: /google/i }));

      await waitFor(() => {
        expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      });
    });

    it('should handle Google sign in error', async () => {
      const error = new Error('Popup closed');
      (error as { code?: string }).code = 'auth/popup-closed-by-user';
      vi.mocked(firebaseAuth.signInWithPopup).mockRejectedValueOnce(error);

      renderLogin();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /google/i })).toBeInTheDocument();
      });

      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: /google/i }));

      await waitFor(() => {
        expect(screen.getByText(/login cancelado/i)).toBeInTheDocument();
      });
    });
  });

  describe('password visibility toggle', () => {
    it('should toggle password visibility', async () => {
      renderLogin();

      await waitFor(() => {
        expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
      });

      const passwordInput = screen.getByLabelText(/senha/i);
      expect(passwordInput).toHaveAttribute('type', 'password');

      const user = userEvent.setup();

      const toggleButtons = screen.getAllByRole('button');
      const toggleButton = toggleButtons.find(btn => !btn.textContent?.includes('Entrar') && !btn.textContent?.includes('Google'));

      if (toggleButton) {
        await user.click(toggleButton);
        expect(passwordInput).toHaveAttribute('type', 'text');

        await user.click(toggleButton);
        expect(passwordInput).toHaveAttribute('type', 'password');
      }
    });
  });

  describe('navigation links', () => {
    it('should navigate to register page', async () => {
      renderLogin();

      await waitFor(() => {
        expect(screen.getByRole('link', { name: /criar conta/i })).toBeInTheDocument();
      });

      const user = userEvent.setup();
      await user.click(screen.getByRole('link', { name: /criar conta/i }));

      await waitFor(() => {
        expect(screen.getByTestId('register')).toBeInTheDocument();
      });
    });

    it('should navigate to forgot password page', async () => {
      renderLogin();

      await waitFor(() => {
        expect(screen.getByRole('link', { name: /esqueceu a senha/i })).toBeInTheDocument();
      });

      const user = userEvent.setup();
      await user.click(screen.getByRole('link', { name: /esqueceu a senha/i }));

      await waitFor(() => {
        expect(screen.getByTestId('forgot-password')).toBeInTheDocument();
      });
    });
  });
});
