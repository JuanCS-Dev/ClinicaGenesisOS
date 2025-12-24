/**
 * ClinicContext Test Setup
 *
 * Shared factories for ClinicContext tests.
 */

import { ReactNode } from 'react';
import { ClinicProvider } from '@/contexts/ClinicContext';
import type { UserProfile, Clinic } from '@/types';

// Mock user for auth
export const mockUser = { uid: 'user-123', email: 'test@example.com', displayName: 'Test User' };

/**
 * Create a mock user profile.
 */
export function createMockUserProfile(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    id: 'user-123',
    email: 'test@example.com',
    displayName: 'Test User',
    clinicId: 'clinic-123',
    role: 'owner',
    specialty: 'medicina',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    ...overrides,
  };
}

/**
 * Create a mock clinic.
 */
export function createMockClinic(overrides: Partial<Clinic> = {}): Clinic {
  return {
    id: 'clinic-123',
    name: 'Test Clinic',
    ownerId: 'user-123',
    plan: 'solo',
    settings: {
      defaultAppointmentDuration: 60,
      workingHours: { start: '08:00', end: '18:00' },
      specialties: ['medicina'],
      timezone: 'America/Sao_Paulo',
    },
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    ...overrides,
  };
}

/**
 * Wrapper component for testing.
 */
export function wrapper({ children }: { children: ReactNode }) {
  return <ClinicProvider>{children}</ClinicProvider>;
}
