/**
 * useAuth Hook Tests - Firebase authentication hook.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth } from '../../hooks/useAuth';
import * as firebaseAuth from 'firebase/auth';

const mockUser = {
  uid: 'test-uid-123',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: 'https://example.com/photo.jpg',
  emailVerified: true,
};

/** Helper: Create error with code */
const createAuthError = (code: string, message = '') => {
  const error = new Error(message);
  (error as { code?: string }).code = code;
  return error;
};

/** Helper: Wait for hook to finish loading */
const waitForLoaded = async (result: { current: { loading: boolean } }) => {
  await waitFor(() => expect(result.current.loading).toBe(false));
};

/** Helper: Execute action and catch expected error */
const safeAct = async (action: () => Promise<void>) => {
  await act(async () => { try { await action(); } catch { /* expected */ } });
};

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
      await waitForLoaded(result);
    });
  });

  describe('signIn', () => {
    it('should sign in successfully', async () => {
      vi.mocked(firebaseAuth.signInWithEmailAndPassword).mockResolvedValueOnce({
        user: mockUser,
      } as firebaseAuth.UserCredential);
      const { result } = renderHook(() => useAuth());
      await waitForLoaded(result);
      await act(async () => { await result.current.signIn('test@example.com', 'password123'); });
      expect(firebaseAuth.signInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(), 'test@example.com', 'password123'
      );
    });

    it('should handle invalid email error', async () => {
      vi.mocked(firebaseAuth.signInWithEmailAndPassword).mockRejectedValueOnce(
        createAuthError('auth/invalid-email')
      );
      const { result } = renderHook(() => useAuth());
      await waitForLoaded(result);
      await safeAct(() => result.current.signIn('invalid', 'password'));
      expect(result.current.error).toBe('Email inválido.');
    });

    it('should handle user not found error', async () => {
      vi.mocked(firebaseAuth.signInWithEmailAndPassword).mockRejectedValueOnce(
        createAuthError('auth/user-not-found')
      );
      const { result } = renderHook(() => useAuth());
      await waitForLoaded(result);
      await safeAct(() => result.current.signIn('notfound@example.com', 'password'));
      expect(result.current.error).toBe('Usuário não encontrado.');
    });

    it('should handle wrong password error', async () => {
      vi.mocked(firebaseAuth.signInWithEmailAndPassword).mockRejectedValueOnce(
        createAuthError('auth/wrong-password')
      );
      const { result } = renderHook(() => useAuth());
      await waitForLoaded(result);
      await safeAct(() => result.current.signIn('test@example.com', 'wrongpassword'));
      expect(result.current.error).toBe('Senha incorreta.');
    });

    it('should handle invalid credential error', async () => {
      vi.mocked(firebaseAuth.signInWithEmailAndPassword).mockRejectedValueOnce(
        createAuthError('auth/invalid-credential')
      );
      const { result } = renderHook(() => useAuth());
      await waitForLoaded(result);
      await safeAct(() => result.current.signIn('test@example.com', 'invalid'));
      expect(result.current.error).toBe('Credenciais inválidas.');
    });

    it('should handle too many requests error', async () => {
      vi.mocked(firebaseAuth.signInWithEmailAndPassword).mockRejectedValueOnce(
        createAuthError('auth/too-many-requests')
      );
      const { result } = renderHook(() => useAuth());
      await waitForLoaded(result);
      await safeAct(() => result.current.signIn('test@example.com', 'password'));
      expect(result.current.error).toBe('Muitas tentativas. Tente novamente mais tarde.');
    });

    it('should handle user disabled error', async () => {
      vi.mocked(firebaseAuth.signInWithEmailAndPassword).mockRejectedValueOnce(
        createAuthError('auth/user-disabled')
      );
      const { result } = renderHook(() => useAuth());
      await waitForLoaded(result);
      await safeAct(() => result.current.signIn('disabled@example.com', 'password'));
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
      await waitForLoaded(result);
      await act(async () => { await result.current.signUp('new@example.com', 'password123', 'New User'); });
      expect(firebaseAuth.createUserWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(), 'new@example.com', 'password123'
      );
      expect(firebaseAuth.updateProfile).toHaveBeenCalledWith(mockUser, { displayName: 'New User' });
    });

    it('should handle email already in use error', async () => {
      vi.mocked(firebaseAuth.createUserWithEmailAndPassword).mockRejectedValueOnce(
        createAuthError('auth/email-already-in-use')
      );
      const { result } = renderHook(() => useAuth());
      await waitForLoaded(result);
      await safeAct(() => result.current.signUp('existing@example.com', 'password123', 'User'));
      expect(result.current.error).toBe('Este email já está em uso.');
    });

    it('should handle weak password error', async () => {
      vi.mocked(firebaseAuth.createUserWithEmailAndPassword).mockRejectedValueOnce(
        createAuthError('auth/weak-password')
      );
      const { result } = renderHook(() => useAuth());
      await waitForLoaded(result);
      await safeAct(() => result.current.signUp('test@example.com', '123', 'User'));
      expect(result.current.error).toBe('A senha deve ter pelo menos 6 caracteres.');
    });
  });

  describe('signInWithGoogle', () => {
    it('should sign in with Google successfully', async () => {
      vi.mocked(firebaseAuth.signInWithPopup).mockResolvedValueOnce({
        user: mockUser,
      } as firebaseAuth.UserCredential);
      const { result } = renderHook(() => useAuth());
      await waitForLoaded(result);
      await act(async () => { await result.current.signInWithGoogle(); });
      expect(firebaseAuth.signInWithPopup).toHaveBeenCalled();
    });

    it('should handle popup closed by user error', async () => {
      vi.mocked(firebaseAuth.signInWithPopup).mockRejectedValueOnce(
        createAuthError('auth/popup-closed-by-user')
      );
      const { result } = renderHook(() => useAuth());
      await waitForLoaded(result);
      await safeAct(() => result.current.signInWithGoogle());
      expect(result.current.error).toBe('Login cancelado.');
    });
  });

  describe('logout', () => {
    const setupLoggedInUser = () => {
      vi.mocked(firebaseAuth.onAuthStateChanged).mockImplementation((auth, callback) => {
        setTimeout(() => (callback as (user: typeof mockUser) => void)(mockUser), 0);
        return vi.fn();
      });
    };

    it('should sign out successfully', async () => {
      vi.mocked(firebaseAuth.signOut).mockResolvedValueOnce();
      setupLoggedInUser();
      const { result } = renderHook(() => useAuth());
      await waitForLoaded(result);
      await act(async () => { await result.current.logout(); });
      expect(firebaseAuth.signOut).toHaveBeenCalled();
    });

    it('should handle logout error', async () => {
      vi.mocked(firebaseAuth.signOut).mockRejectedValueOnce(new Error('Logout failed'));
      setupLoggedInUser();
      const { result } = renderHook(() => useAuth());
      await waitForLoaded(result);
      await safeAct(() => result.current.logout());
      expect(result.current.error).toBe('Logout failed');
    });
  });

  describe('resetPassword', () => {
    it('should send password reset email successfully', async () => {
      vi.mocked(firebaseAuth.sendPasswordResetEmail).mockResolvedValueOnce();
      const { result } = renderHook(() => useAuth());
      await waitForLoaded(result);
      await act(async () => { await result.current.resetPassword('test@example.com'); });
      expect(firebaseAuth.sendPasswordResetEmail).toHaveBeenCalledWith(expect.anything(), 'test@example.com');
    });

    it('should handle reset password error', async () => {
      vi.mocked(firebaseAuth.sendPasswordResetEmail).mockRejectedValueOnce(
        createAuthError('auth/user-not-found')
      );
      const { result } = renderHook(() => useAuth());
      await waitForLoaded(result);
      await safeAct(() => result.current.resetPassword('notfound@example.com'));
      expect(result.current.error).toBe('Usuário não encontrado.');
    });
  });

  describe('clearError', () => {
    it('should clear error state', async () => {
      vi.mocked(firebaseAuth.signInWithEmailAndPassword).mockRejectedValueOnce(
        createAuthError('auth/invalid-email')
      );
      const { result } = renderHook(() => useAuth());
      await waitForLoaded(result);
      await safeAct(() => result.current.signIn('invalid', 'password'));
      expect(result.current.error).toBe('Email inválido.');
      act(() => { result.current.clearError(); });
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
      await waitForLoaded(result);
      expect(result.current.user).toBe(null);
      act(() => { if (authCallback) authCallback(mockUser); });
      expect(result.current.user).toEqual(mockUser);
    });
  });

  describe('unknown error handling', () => {
    it('should handle unknown code with empty message', async () => {
      vi.mocked(firebaseAuth.signInWithEmailAndPassword).mockRejectedValueOnce(
        createAuthError('auth/unknown-code', '')
      );
      const { result } = renderHook(() => useAuth());
      await waitForLoaded(result);
      await safeAct(() => result.current.signIn('test@example.com', 'password'));
      expect(result.current.error).toBe('Erro desconhecido.');
    });

    it('should handle unknown error with message', async () => {
      vi.mocked(firebaseAuth.signInWithEmailAndPassword).mockRejectedValueOnce(
        new Error('Unknown error occurred')
      );
      const { result } = renderHook(() => useAuth());
      await waitForLoaded(result);
      await safeAct(() => result.current.signIn('test@example.com', 'password'));
      expect(result.current.error).toBe('Unknown error occurred');
    });

    it('should handle non-Error objects', async () => {
      vi.mocked(firebaseAuth.signInWithEmailAndPassword).mockRejectedValueOnce('string error');
      const { result } = renderHook(() => useAuth());
      await waitForLoaded(result);
      await safeAct(() => result.current.signIn('test@example.com', 'password'));
      expect(result.current.error).toBe('Erro desconhecido.');
    });
  });
});
