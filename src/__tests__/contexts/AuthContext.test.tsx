/**
 * AuthContext Tests
 *
 * Tests for authentication context provider.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { AuthProvider, useAuthContext } from '../../contexts/AuthContext';
import * as firebaseAuth from 'firebase/auth';

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(firebaseAuth.onAuthStateChanged).mockImplementation((auth, callback) => {
      setTimeout(() => (callback as (user: null) => void)(null), 0);
      return vi.fn();
    });
  });

  describe('AuthProvider', () => {
    it('should render children', async () => {
      render(
        <AuthProvider>
          <div data-testid="child">Test Child</div>
        </AuthProvider>
      );

      expect(screen.getByTestId('child')).toBeInTheDocument();
      expect(screen.getByText('Test Child')).toBeInTheDocument();
    });

    it('should provide auth context to children', async () => {
      const TestComponent = () => {
        const auth = useAuthContext();
        return <div data-testid="auth-status">{auth.loading ? 'loading' : 'loaded'}</div>;
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('auth-status')).toBeInTheDocument();
    });
  });

  describe('useAuthContext', () => {
    it('should throw error when used outside AuthProvider', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useAuthContext());
      }).toThrow('useAuthContext must be used within an AuthProvider');

      consoleSpy.mockRestore();
    });

    it('should return auth context when used within AuthProvider', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuthContext(), { wrapper });

      expect(result.current).toBeDefined();
      expect(result.current.user).toBeDefined();
      expect(result.current.loading).toBeDefined();
      expect(result.current.error).toBeDefined();
      expect(typeof result.current.signIn).toBe('function');
      expect(typeof result.current.signUp).toBe('function');
      expect(typeof result.current.signInWithGoogle).toBe('function');
      expect(typeof result.current.logout).toBe('function');
      expect(typeof result.current.resetPassword).toBe('function');
      expect(typeof result.current.clearError).toBe('function');
    });

    it('should provide initial loading state', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuthContext(), { wrapper });

      expect(result.current.loading).toBe(true);
      expect(result.current.user).toBe(null);
      expect(result.current.error).toBe(null);
    });
  });

  describe('context value stability', () => {
    it('should provide stable function references', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result, rerender } = renderHook(() => useAuthContext(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const initialSignIn = result.current.signIn;
      const initialSignUp = result.current.signUp;
      const initialLogout = result.current.logout;

      rerender();

      expect(result.current.signIn).toBe(initialSignIn);
      expect(result.current.signUp).toBe(initialSignUp);
      expect(result.current.logout).toBe(initialLogout);
    });
  });
});
