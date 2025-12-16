/**
 * Firebase Auth Mock
 *
 * Provides mock implementations of Firebase Auth for testing.
 */
import { vi } from 'vitest';

// Mock user object
export const mockUser = {
  uid: 'test-uid-123',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: 'https://example.com/photo.jpg',
  emailVerified: true,
};

// Auth state change callback holder
let authStateCallback: ((user: typeof mockUser | null) => void) | null = null;

// Mock functions
export const mockSignInWithEmailAndPassword = vi.fn();
export const mockCreateUserWithEmailAndPassword = vi.fn();
export const mockSignOut = vi.fn();
export const mockSignInWithPopup = vi.fn();
export const mockSendPasswordResetEmail = vi.fn();
export const mockUpdateProfile = vi.fn();
export const mockOnAuthStateChanged = vi.fn((auth, callback) => {
  authStateCallback = callback;
  // Return unsubscribe function
  return vi.fn();
});

// Helper to simulate auth state changes
export const simulateAuthStateChange = (user: typeof mockUser | null) => {
  if (authStateCallback) {
    authStateCallback(user);
  }
};

// Reset all mocks
export const resetFirebaseMocks = () => {
  mockSignInWithEmailAndPassword.mockReset();
  mockCreateUserWithEmailAndPassword.mockReset();
  mockSignOut.mockReset();
  mockSignInWithPopup.mockReset();
  mockSendPasswordResetEmail.mockReset();
  mockUpdateProfile.mockReset();
  mockOnAuthStateChanged.mockReset();
  authStateCallback = null;
};

// Mock Firebase Auth module
vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: mockSignInWithEmailAndPassword,
  createUserWithEmailAndPassword: mockCreateUserWithEmailAndPassword,
  signOut: mockSignOut,
  onAuthStateChanged: mockOnAuthStateChanged,
  GoogleAuthProvider: vi.fn(),
  signInWithPopup: mockSignInWithPopup,
  sendPasswordResetEmail: mockSendPasswordResetEmail,
  updateProfile: mockUpdateProfile,
  getAuth: vi.fn(() => ({})),
}));

// Mock Firebase app
vi.mock('../services/firebase', () => ({
  auth: {},
  db: {},
  storage: {},
  app: {},
}));
