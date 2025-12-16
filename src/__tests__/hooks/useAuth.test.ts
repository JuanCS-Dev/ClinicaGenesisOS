/**
 * useAuth Hook Tests
 *
 * Tests for Firebase authentication hook.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth } from '../../hooks/useAuth';
import * as firebaseAuth from 'firebase/auth';

// Mock user object
const mockUser = {
  uid: 'test-uid-123',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: 'https://example.com/photo.jpg',
  emailVerified: true,
};

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset onAuthStateChanged to default behavior
    vi.mocked(firebaseAuth.onAuthStateChanged).mockImplementation((auth, callback) => {
      setTimeout(() => (callback as (user: null) => void)(null), 0);
      return vi.fn();
    });
  });

  describe('initial state', () => {
    it('should start with loading true and no user', () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.loading).toBe(true);
      expect(result.current.user).toBe(null);
      expect(result.current.error).toBe(null);
    });

    it('should set loading to false after auth state is determined', async () => {
      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe('signIn', () => {
    it('should sign in successfully with email and password', async () => {
      vi.mocked(firebaseAuth.signInWithEmailAndPassword).mockResolvedValueOnce({
        user: mockUser,
      } as firebaseAuth.UserCredential);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.signIn('test@example.com', 'password123');
      });

      expect(firebaseAuth.signInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'test@example.com',
        'password123'
      );
    });

    it('should handle invalid email error', async () => {
      const error = new Error('Invalid email');
      (error as { code?: string }).code = 'auth/invalid-email';
      vi.mocked(firebaseAuth.signInWithEmailAndPassword).mockRejectedValueOnce(error);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        try {
          await result.current.signIn('invalid', 'password');
        } catch {
          // Expected
        }
      });

      expect(result.current.error).toBe('Email inválido.');
    });

    it('should handle user not found error', async () => {
      const error = new Error('User not found');
      (error as { code?: string }).code = 'auth/user-not-found';
      vi.mocked(firebaseAuth.signInWithEmailAndPassword).mockRejectedValueOnce(error);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        try {
          await result.current.signIn('notfound@example.com', 'password');
        } catch {
          // Expected
        }
      });

      expect(result.current.error).toBe('Usuário não encontrado.');
    });

    it('should handle wrong password error', async () => {
      const error = new Error('Wrong password');
      (error as { code?: string }).code = 'auth/wrong-password';
      vi.mocked(firebaseAuth.signInWithEmailAndPassword).mockRejectedValueOnce(error);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        try {
          await result.current.signIn('test@example.com', 'wrongpassword');
        } catch {
          // Expected
        }
      });

      expect(result.current.error).toBe('Senha incorreta.');
    });

    it('should handle invalid credential error', async () => {
      const error = new Error('Invalid credential');
      (error as { code?: string }).code = 'auth/invalid-credential';
      vi.mocked(firebaseAuth.signInWithEmailAndPassword).mockRejectedValueOnce(error);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        try {
          await result.current.signIn('test@example.com', 'invalid');
        } catch {
          // Expected
        }
      });

      expect(result.current.error).toBe('Credenciais inválidas.');
    });

    it('should handle too many requests error', async () => {
      const error = new Error('Too many requests');
      (error as { code?: string }).code = 'auth/too-many-requests';
      vi.mocked(firebaseAuth.signInWithEmailAndPassword).mockRejectedValueOnce(error);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        try {
          await result.current.signIn('test@example.com', 'password');
        } catch {
          // Expected
        }
      });

      expect(result.current.error).toBe('Muitas tentativas. Tente novamente mais tarde.');
    });

    it('should handle user disabled error', async () => {
      const error = new Error('User disabled');
      (error as { code?: string }).code = 'auth/user-disabled';
      vi.mocked(firebaseAuth.signInWithEmailAndPassword).mockRejectedValueOnce(error);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        try {
          await result.current.signIn('disabled@example.com', 'password');
        } catch {
          // Expected
        }
      });

      expect(result.current.error).toBe('Esta conta foi desativada.');
    });
  });

  describe('signUp', () => {
    it('should create account successfully', async () => {
      vi.mocked(firebaseAuth.createUserWithEmailAndPassword).mockResolvedValueOnce({
        user: mockUser,
      } as firebaseAuth.UserCredential);
      vi.mocked(firebaseAuth.updateProfile).mockResolvedValueOnce();

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.signUp('new@example.com', 'password123', 'New User');
      });

      expect(firebaseAuth.createUserWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'new@example.com',
        'password123'
      );
      expect(firebaseAuth.updateProfile).toHaveBeenCalledWith(mockUser, { displayName: 'New User' });
    });

    it('should handle email already in use error', async () => {
      const error = new Error('Email already in use');
      (error as { code?: string }).code = 'auth/email-already-in-use';
      vi.mocked(firebaseAuth.createUserWithEmailAndPassword).mockRejectedValueOnce(error);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        try {
          await result.current.signUp('existing@example.com', 'password123', 'User');
        } catch {
          // Expected
        }
      });

      expect(result.current.error).toBe('Este email já está em uso.');
    });

    it('should handle weak password error', async () => {
      const error = new Error('Weak password');
      (error as { code?: string }).code = 'auth/weak-password';
      vi.mocked(firebaseAuth.createUserWithEmailAndPassword).mockRejectedValueOnce(error);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        try {
          await result.current.signUp('test@example.com', '123', 'User');
        } catch {
          // Expected
        }
      });

      expect(result.current.error).toBe('A senha deve ter pelo menos 6 caracteres.');
    });
  });

  describe('signInWithGoogle', () => {
    it('should sign in with Google successfully', async () => {
      vi.mocked(firebaseAuth.signInWithPopup).mockResolvedValueOnce({
        user: mockUser,
      } as firebaseAuth.UserCredential);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.signInWithGoogle();
      });

      expect(firebaseAuth.signInWithPopup).toHaveBeenCalled();
    });

    it('should handle popup closed by user error', async () => {
      const error = new Error('Popup closed');
      (error as { code?: string }).code = 'auth/popup-closed-by-user';
      vi.mocked(firebaseAuth.signInWithPopup).mockRejectedValueOnce(error);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        try {
          await result.current.signInWithGoogle();
        } catch {
          // Expected
        }
      });

      expect(result.current.error).toBe('Login cancelado.');
    });
  });

  describe('logout', () => {
    it('should sign out successfully', async () => {
      vi.mocked(firebaseAuth.signOut).mockResolvedValueOnce();
      vi.mocked(firebaseAuth.onAuthStateChanged).mockImplementation((auth, callback) => {
        setTimeout(() => (callback as (user: typeof mockUser) => void)(mockUser as any), 0);
        return vi.fn();
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(firebaseAuth.signOut).toHaveBeenCalled();
    });

    it('should handle logout error', async () => {
      const error = new Error('Logout failed');
      vi.mocked(firebaseAuth.signOut).mockRejectedValueOnce(error);
      vi.mocked(firebaseAuth.onAuthStateChanged).mockImplementation((auth, callback) => {
        setTimeout(() => (callback as (user: typeof mockUser) => void)(mockUser as any), 0);
        return vi.fn();
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        try {
          await result.current.logout();
        } catch {
          // Expected
        }
      });

      expect(result.current.error).toBe('Logout failed');
    });
  });

  describe('resetPassword', () => {
    it('should send password reset email successfully', async () => {
      vi.mocked(firebaseAuth.sendPasswordResetEmail).mockResolvedValueOnce();

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.resetPassword('test@example.com');
      });

      expect(firebaseAuth.sendPasswordResetEmail).toHaveBeenCalledWith(
        expect.anything(),
        'test@example.com'
      );
    });

    it('should handle reset password error', async () => {
      const error = new Error('User not found');
      (error as { code?: string }).code = 'auth/user-not-found';
      vi.mocked(firebaseAuth.sendPasswordResetEmail).mockRejectedValueOnce(error);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        try {
          await result.current.resetPassword('notfound@example.com');
        } catch {
          // Expected
        }
      });

      expect(result.current.error).toBe('Usuário não encontrado.');
    });
  });

  describe('clearError', () => {
    it('should clear error state', async () => {
      const error = new Error('Test error');
      (error as { code?: string }).code = 'auth/invalid-email';
      vi.mocked(firebaseAuth.signInWithEmailAndPassword).mockRejectedValueOnce(error);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        try {
          await result.current.signIn('invalid', 'password');
        } catch {
          // Expected
        }
      });

      expect(result.current.error).toBe('Email inválido.');

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBe(null);
    });
  });

  describe('auth state changes', () => {
    it('should update user when auth state changes', async () => {
      let authCallback: ((user: typeof mockUser | null) => void) | null = null;
      vi.mocked(firebaseAuth.onAuthStateChanged).mockImplementation((auth, callback) => {
        authCallback = callback as (user: typeof mockUser | null) => void;
        setTimeout(() => (callback as (user: null) => void)(null), 0);
        return vi.fn();
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toBe(null);

      // Simulate user signing in
      act(() => {
        if (authCallback) {
          authCallback(mockUser as any);
        }
      });

      expect(result.current.user).toEqual(mockUser);
    });
  });

  describe('unknown error handling', () => {
    it('should handle unknown code with empty message', async () => {
      const error = new Error('');
      (error as { code?: string }).code = 'auth/unknown-code';
      vi.mocked(firebaseAuth.signInWithEmailAndPassword).mockRejectedValueOnce(error);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        try {
          await result.current.signIn('test@example.com', 'password');
        } catch {
          // Expected
        }
      });

      expect(result.current.error).toBe('Erro desconhecido.');
    });

    it('should handle unknown error with message', async () => {
      const error = new Error('Unknown error occurred');
      vi.mocked(firebaseAuth.signInWithEmailAndPassword).mockRejectedValueOnce(error);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        try {
          await result.current.signIn('test@example.com', 'password');
        } catch {
          // Expected
        }
      });

      expect(result.current.error).toBe('Unknown error occurred');
    });

    it('should handle non-Error objects', async () => {
      vi.mocked(firebaseAuth.signInWithEmailAndPassword).mockRejectedValueOnce('string error');

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        try {
          await result.current.signIn('test@example.com', 'password');
        } catch {
          // Expected
        }
      });

      expect(result.current.error).toBe('Erro desconhecido.');
    });
  });
});
