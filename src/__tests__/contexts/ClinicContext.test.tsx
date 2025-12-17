/**
 * Tests for ClinicContext
 *
 * Tests the clinic and user profile management context.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { ClinicProvider, useClinicContext } from '@/contexts/ClinicContext';
import { userService, clinicService, seedClinicData } from '@/services/firestore';
import type { UserProfile, Clinic } from '@/types';

// Mock AuthContext
const mockUser = { uid: 'user-123', email: 'test@example.com', displayName: 'Test User' };
let mockAuthLoading = false;

vi.mock('@/contexts/AuthContext', () => ({
  useAuthContext: vi.fn(() => ({
    user: mockUser,
    loading: mockAuthLoading,
  })),
}));

// Mock the firestore services
vi.mock('@/services/firestore', () => ({
  userService: {
    getById: vi.fn(),
    create: vi.fn(),
    subscribe: vi.fn(),
    update: vi.fn(),
    joinClinic: vi.fn(),
  },
  clinicService: {
    create: vi.fn(),
    subscribe: vi.fn(),
    getById: vi.fn(),
    updateSettings: vi.fn(),
  },
  seedClinicData: vi.fn(),
}));

// Import mocked useAuthContext to control it
import { useAuthContext } from '@/contexts/AuthContext';

/**
 * Create a mock user profile.
 */
function createMockUserProfile(overrides: Partial<UserProfile> = {}): UserProfile {
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
function createMockClinic(overrides: Partial<Clinic> = {}): Clinic {
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
function wrapper({ children }: { children: ReactNode }) {
  return <ClinicProvider>{children}</ClinicProvider>;
}

describe('ClinicContext', () => {
  let mockUserUnsubscribe: ReturnType<typeof vi.fn>;
  let mockClinicUnsubscribe: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUserUnsubscribe = vi.fn();
    mockClinicUnsubscribe = vi.fn();
    mockAuthLoading = false;

    // Reset auth mock
    vi.mocked(useAuthContext).mockReturnValue({
      user: mockUser,
      loading: false,
    } as ReturnType<typeof useAuthContext>);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('useClinicContext', () => {
    it('throws when used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useClinicContext());
      }).toThrow('useClinicContext must be used within a ClinicProvider');

      consoleSpy.mockRestore();
    });
  });

  describe('initialization', () => {
    it('starts with loading true when auth is loading', async () => {
      vi.mocked(useAuthContext).mockReturnValue({
        user: null,
        loading: true,
      } as ReturnType<typeof useAuthContext>);

      const { result } = renderHook(() => useClinicContext(), { wrapper });

      expect(result.current.loading).toBe(true);
    });

    it('returns null values when no user', async () => {
      vi.mocked(useAuthContext).mockReturnValue({
        user: null,
        loading: false,
      } as ReturnType<typeof useAuthContext>);

      const { result } = renderHook(() => useClinicContext(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.userProfile).toBeNull();
      expect(result.current.clinic).toBeNull();
      expect(result.current.clinicId).toBeNull();
    });

    it('creates new profile for first-time users', async () => {
      const newProfile = createMockUserProfile({ clinicId: undefined });
      vi.mocked(userService.getById).mockResolvedValue(null);
      vi.mocked(userService.create).mockResolvedValue(newProfile);

      const { result } = renderHook(() => useClinicContext(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(userService.create).toHaveBeenCalledWith('user-123', {
        email: 'test@example.com',
        displayName: 'Test User',
      });
    });

    it('subscribes to existing user profile', async () => {
      const profile = createMockUserProfile();
      vi.mocked(userService.getById).mockResolvedValue(profile);
      vi.mocked(userService.subscribe).mockImplementation((_, callback) => {
        callback(profile);
        return mockUserUnsubscribe as () => void;
      });
      vi.mocked(clinicService.subscribe).mockReturnValue(mockClinicUnsubscribe as () => void);

      const { result } = renderHook(() => useClinicContext(), { wrapper });

      await waitFor(() => {
        expect(result.current.userProfile).toEqual(profile);
      });

      expect(userService.subscribe).toHaveBeenCalledWith('user-123', expect.any(Function));
    });

    it('subscribes to clinic when user has clinicId', async () => {
      const profile = createMockUserProfile({ clinicId: 'clinic-123' });
      const clinic = createMockClinic();

      vi.mocked(userService.getById).mockResolvedValue(profile);
      vi.mocked(userService.subscribe).mockImplementation((_, callback) => {
        callback(profile);
        return mockUserUnsubscribe as () => void;
      });
      vi.mocked(clinicService.subscribe).mockImplementation((_, callback) => {
        callback(clinic);
        return mockClinicUnsubscribe as () => void;
      });

      const { result } = renderHook(() => useClinicContext(), { wrapper });

      await waitFor(() => {
        expect(result.current.clinic).toEqual(clinic);
      });

      expect(clinicService.subscribe).toHaveBeenCalledWith('clinic-123', expect.any(Function));
    });
  });

  describe('needsOnboarding', () => {
    it('returns true when user has no clinicId', async () => {
      const profileWithoutClinic = createMockUserProfile({ clinicId: undefined });

      vi.mocked(userService.getById).mockResolvedValue(profileWithoutClinic);
      vi.mocked(userService.subscribe).mockImplementation((_, callback) => {
        callback(profileWithoutClinic);
        return mockUserUnsubscribe as () => void;
      });

      const { result } = renderHook(() => useClinicContext(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.needsOnboarding).toBe(true);
    });

    it('returns false when user has clinicId', async () => {
      const profileWithClinic = createMockUserProfile({ clinicId: 'clinic-123' });
      const clinic = createMockClinic();

      vi.mocked(userService.getById).mockResolvedValue(profileWithClinic);
      vi.mocked(userService.subscribe).mockImplementation((_, callback) => {
        callback(profileWithClinic);
        return mockUserUnsubscribe as () => void;
      });
      vi.mocked(clinicService.subscribe).mockImplementation((_, callback) => {
        callback(clinic);
        return mockClinicUnsubscribe as () => void;
      });

      const { result } = renderHook(() => useClinicContext(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.needsOnboarding).toBe(false);
    });

    it('returns false while loading', () => {
      vi.mocked(useAuthContext).mockReturnValue({
        user: mockUser,
        loading: true,
      } as ReturnType<typeof useAuthContext>);

      const { result } = renderHook(() => useClinicContext(), { wrapper });

      expect(result.current.needsOnboarding).toBe(false);
    });
  });

  describe('createClinic', () => {
    beforeEach(() => {
      const profile = createMockUserProfile({ clinicId: undefined });
      vi.mocked(userService.getById).mockResolvedValue(profile);
      vi.mocked(userService.subscribe).mockImplementation((_, callback) => {
        callback(profile);
        return mockUserUnsubscribe as () => void;
      });
    });

    it('creates clinic and associates user as owner', async () => {
      vi.mocked(clinicService.create).mockResolvedValue('new-clinic-id');
      vi.mocked(userService.joinClinic).mockResolvedValue();
      vi.mocked(seedClinicData).mockResolvedValue(undefined);

      const { result } = renderHook(() => useClinicContext(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let clinicId: string;
      await act(async () => {
        clinicId = await result.current.createClinic({
          name: 'New Clinic',
          phone: '123456789',
        });
      });

      expect(clinicService.create).toHaveBeenCalledWith('user-123', {
        name: 'New Clinic',
        phone: '123456789',
      });
      expect(userService.joinClinic).toHaveBeenCalledWith('user-123', 'new-clinic-id', 'owner');
      expect(clinicId!).toBe('new-clinic-id');
    });

    it('seeds clinic data by default', async () => {
      vi.mocked(clinicService.create).mockResolvedValue('new-clinic-id');
      vi.mocked(userService.joinClinic).mockResolvedValue();
      vi.mocked(seedClinicData).mockResolvedValue(undefined);

      const { result } = renderHook(() => useClinicContext(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.createClinic({ name: 'Test' });
      });

      expect(seedClinicData).toHaveBeenCalledWith('new-clinic-id', 'Test User');
    });

    it('skips seed data when seedData is false', async () => {
      vi.mocked(clinicService.create).mockResolvedValue('new-clinic-id');
      vi.mocked(userService.joinClinic).mockResolvedValue();

      const { result } = renderHook(() => useClinicContext(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.createClinic({ name: 'Test' }, false);
      });

      expect(seedClinicData).not.toHaveBeenCalled();
    });

    it('throws when no user', async () => {
      vi.mocked(useAuthContext).mockReturnValue({
        user: null,
        loading: false,
      } as ReturnType<typeof useAuthContext>);

      const { result } = renderHook(() => useClinicContext(), { wrapper });

      await expect(
        result.current.createClinic({ name: 'Test' })
      ).rejects.toThrow('User must be logged in to create a clinic');
    });
  });

  describe('updateClinicSettings', () => {
    it('updates clinic settings', async () => {
      const profile = createMockUserProfile({ clinicId: 'clinic-123' });
      const clinic = createMockClinic();

      vi.mocked(userService.getById).mockResolvedValue(profile);
      vi.mocked(userService.subscribe).mockImplementation((_, callback) => {
        callback(profile);
        return mockUserUnsubscribe as () => void;
      });
      vi.mocked(clinicService.subscribe).mockImplementation((_, callback) => {
        callback(clinic);
        return mockClinicUnsubscribe as () => void;
      });
      vi.mocked(clinicService.updateSettings).mockResolvedValue();

      const { result } = renderHook(() => useClinicContext(), { wrapper });

      await waitFor(() => {
        expect(result.current.clinic).toBeTruthy();
      });

      await act(async () => {
        await result.current.updateClinicSettings({ defaultAppointmentDuration: 45 });
      });

      expect(clinicService.updateSettings).toHaveBeenCalledWith('clinic-123', {
        defaultAppointmentDuration: 45,
      });
    });

    it('throws when no clinic', async () => {
      vi.mocked(useAuthContext).mockReturnValue({
        user: null,
        loading: false,
      } as ReturnType<typeof useAuthContext>);

      const { result } = renderHook(() => useClinicContext(), { wrapper });

      await expect(
        result.current.updateClinicSettings({ defaultAppointmentDuration: 45 })
      ).rejects.toThrow('No clinic to update');
    });
  });

  describe('updateUserProfile', () => {
    it('updates user profile', async () => {
      const profile = createMockUserProfile();

      vi.mocked(userService.getById).mockResolvedValue(profile);
      vi.mocked(userService.subscribe).mockImplementation((_, callback) => {
        callback(profile);
        return mockUserUnsubscribe as () => void;
      });
      vi.mocked(clinicService.subscribe).mockReturnValue(mockClinicUnsubscribe as () => void);
      vi.mocked(userService.update).mockResolvedValue();

      const { result } = renderHook(() => useClinicContext(), { wrapper });

      await waitFor(() => {
        expect(result.current.userProfile).toBeTruthy();
      });

      await act(async () => {
        await result.current.updateUserProfile({ displayName: 'New Name' });
      });

      expect(userService.update).toHaveBeenCalledWith('user-123', { displayName: 'New Name' });
    });

    it('throws when no user', async () => {
      vi.mocked(useAuthContext).mockReturnValue({
        user: null,
        loading: false,
      } as ReturnType<typeof useAuthContext>);

      const { result } = renderHook(() => useClinicContext(), { wrapper });

      await expect(
        result.current.updateUserProfile({ displayName: 'Test' })
      ).rejects.toThrow('User must be logged in to update profile');
    });
  });

  describe('refreshClinic', () => {
    it('refreshes clinic data', async () => {
      const profile = createMockUserProfile({ clinicId: 'clinic-123' });
      const clinic = createMockClinic();

      vi.mocked(userService.getById).mockResolvedValue(profile);
      vi.mocked(userService.subscribe).mockImplementation((_, callback) => {
        callback(profile);
        return mockUserUnsubscribe as () => void;
      });
      vi.mocked(clinicService.subscribe).mockImplementation((_, callback) => {
        callback(clinic);
        return mockClinicUnsubscribe as () => void;
      });
      vi.mocked(clinicService.getById).mockResolvedValue(clinic);

      const { result } = renderHook(() => useClinicContext(), { wrapper });

      await waitFor(() => {
        expect(result.current.clinic).toBeTruthy();
      });

      await act(async () => {
        await result.current.refreshClinic();
      });

      expect(clinicService.getById).toHaveBeenCalledWith('clinic-123');
    });

    it('does nothing when no clinicId', async () => {
      const profile = createMockUserProfile({ clinicId: undefined });

      vi.mocked(userService.getById).mockResolvedValue(profile);
      vi.mocked(userService.subscribe).mockImplementation((_, callback) => {
        callback(profile);
        return mockUserUnsubscribe as () => void;
      });

      const { result } = renderHook(() => useClinicContext(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.refreshClinic();
      });

      expect(clinicService.getById).not.toHaveBeenCalled();
    });
  });

  describe('cleanup', () => {
    it('unsubscribes on unmount', async () => {
      const profile = createMockUserProfile({ clinicId: 'clinic-123' });
      const clinic = createMockClinic();

      vi.mocked(userService.getById).mockResolvedValue(profile);
      vi.mocked(userService.subscribe).mockImplementation((_, callback) => {
        callback(profile);
        return mockUserUnsubscribe as () => void;
      });
      vi.mocked(clinicService.subscribe).mockImplementation((_, callback) => {
        callback(clinic);
        return mockClinicUnsubscribe as () => void;
      });

      const { unmount } = renderHook(() => useClinicContext(), { wrapper });

      await waitFor(() => {
        expect(userService.subscribe).toHaveBeenCalled();
      });

      unmount();

      expect(mockUserUnsubscribe).toHaveBeenCalled();
      expect(mockClinicUnsubscribe).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('sets error when profile initialization fails', async () => {
      vi.mocked(userService.getById).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useClinicContext(), { wrapper });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      expect(result.current.error?.message).toBe('Network error');
      expect(result.current.loading).toBe(false);
    });
  });
});
