/**
 * ClinicContext Initialization Tests
 *
 * Tests for ClinicContext initialization and needsOnboarding.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

// Mock AuthContext
vi.mock('@/contexts/AuthContext', () => ({
  useAuthContext: vi.fn(() => ({
    user: { uid: 'user-123', email: 'test@example.com', displayName: 'Test User' },
    loading: false,
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

import { useClinicContext } from '@/contexts/ClinicContext';
import { userService, clinicService } from '@/services/firestore';
import { useAuthContext } from '@/contexts/AuthContext';
import { mockUser, createMockUserProfile, createMockClinic, wrapper } from './setup';

describe('ClinicContext - Initialization', () => {
  beforeEach(() => {
    vi.clearAllMocks();

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

    it('loads existing user profile with getById (PERF: no subscription)', async () => {
      // PERF: ClinicContext uses getById instead of subscribe to reduce Firestore costs
      const profile = createMockUserProfile();
      const clinic = createMockClinic();
      vi.mocked(userService.getById).mockResolvedValue(profile);
      vi.mocked(clinicService.getById).mockResolvedValue(clinic);

      const { result } = renderHook(() => useClinicContext(), { wrapper });

      await waitFor(() => {
        expect(result.current.userProfile).toEqual(profile);
      });

      // Verify getById was used instead of subscribe
      expect(userService.getById).toHaveBeenCalledWith('user-123');
      expect(userService.subscribe).not.toHaveBeenCalled();
    });

    it('loads clinic when user has clinicId', async () => {
      const profile = createMockUserProfile({ clinicId: 'clinic-123' });
      const clinic = createMockClinic();

      vi.mocked(userService.getById).mockResolvedValue(profile);
      vi.mocked(clinicService.getById).mockResolvedValue(clinic);

      const { result } = renderHook(() => useClinicContext(), { wrapper });

      await waitFor(() => {
        expect(result.current.clinic).toEqual(clinic);
      });

      // Verify getById was used instead of subscribe
      expect(clinicService.getById).toHaveBeenCalledWith('clinic-123');
      expect(clinicService.subscribe).not.toHaveBeenCalled();
    });
  });

  describe('needsOnboarding', () => {
    it('returns true when user has no clinicId', async () => {
      const profileWithoutClinic = createMockUserProfile({ clinicId: undefined });

      vi.mocked(userService.getById).mockResolvedValue(profileWithoutClinic);

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
      vi.mocked(clinicService.getById).mockResolvedValue(clinic);

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
});
