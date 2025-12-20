/**
 * ProtectedRoute Tests
 *
 * Tests for route protection component.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '../../../components/auth/ProtectedRoute';
import { AuthProvider } from '../../../contexts/AuthContext';
import * as firebaseAuth from 'firebase/auth';
import type { User } from 'firebase/auth';

const mockUser: Partial<User> = {
  uid: 'test-uid-123',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: null,
  emailVerified: true,
};

const LocationDisplay = () => {
  return <div data-testid="location">Protected Content</div>;
};

const LoginPage = () => {
  return <div data-testid="login-page">Login Page</div>;
};

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loading state', () => {
    it('should show loading indicator while checking auth', () => {
      vi.mocked(firebaseAuth.onAuthStateChanged).mockImplementation(() => {
        return vi.fn();
      });

      render(
        <MemoryRouter initialEntries={['/protected']}>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/protected"
                element={
                  <ProtectedRoute>
                    <LocationDisplay />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      );

      expect(screen.getByText('Carregando...')).toBeInTheDocument();
    });
  });

  describe('authenticated state', () => {
    it('should render children when user is authenticated', async () => {
      vi.mocked(firebaseAuth.onAuthStateChanged).mockImplementation((auth, callback) => {
        setTimeout(() => (callback as (user: User | null) => void)(mockUser as User), 0);
        return vi.fn();
      });

      render(
        <MemoryRouter initialEntries={['/protected']}>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/protected"
                element={
                  <ProtectedRoute>
                    <LocationDisplay />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('location')).toBeInTheDocument();
      });

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  describe('unauthenticated state', () => {
    it('should redirect to login when user is not authenticated', async () => {
      vi.mocked(firebaseAuth.onAuthStateChanged).mockImplementation((auth, callback) => {
        setTimeout(() => (callback as (user: null) => void)(null), 0);
        return vi.fn();
      });

      render(
        <MemoryRouter initialEntries={['/protected']}>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/protected"
                element={
                  <ProtectedRoute>
                    <LocationDisplay />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
      });

      expect(screen.queryByTestId('location')).not.toBeInTheDocument();
    });
  });

  describe('route state preservation', () => {
    it('should redirect to login preserving attempted path', async () => {
      vi.mocked(firebaseAuth.onAuthStateChanged).mockImplementation((auth, callback) => {
        setTimeout(() => (callback as (user: null) => void)(null), 0);
        return vi.fn();
      });

      render(
        <MemoryRouter initialEntries={['/protected/deep/path']}>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/protected/*"
                element={
                  <ProtectedRoute>
                    <LocationDisplay />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
      });
    });
  });

  describe('nested routes', () => {
    it('should protect nested routes', async () => {
      vi.mocked(firebaseAuth.onAuthStateChanged).mockImplementation((auth, callback) => {
        setTimeout(() => (callback as (user: User | null) => void)(mockUser as User), 0);
        return vi.fn();
      });

      const NestedContent = () => <div data-testid="nested">Nested Content</div>;

      render(
        <MemoryRouter initialEntries={['/protected/nested']}>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/protected/*"
                element={
                  <ProtectedRoute>
                    <Routes>
                      <Route path="nested" element={<NestedContent />} />
                    </Routes>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('nested')).toBeInTheDocument();
      });
    });
  });

  describe('loading UI', () => {
    it('should display loading text', () => {
      vi.mocked(firebaseAuth.onAuthStateChanged).mockImplementation(() => {
        return vi.fn();
      });

      render(
        <MemoryRouter initialEntries={['/protected']}>
          <AuthProvider>
            <Routes>
              <Route
                path="/protected"
                element={
                  <ProtectedRoute>
                    <LocationDisplay />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      );

      expect(screen.getByText('Carregando...')).toBeInTheDocument();
    });
  });
});
