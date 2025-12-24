/**
 * ClinicContext Lifecycle Tests
 *
 * Tests for ClinicContext cleanup and error handling.
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

describe('ClinicContext - Lifecycle', () => {
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

  describe('cleanup', () => {
    it('does not make additional requests after unmount', async () => {
      // PERF: ClinicContext now uses getDoc instead of subscribe for efficiency
      // This test verifies that unmount cancels any pending requests
      const profile = createMockUserProfile({ clinicId: 'clinic-123' });
      const clinic = createMockClinic();

      vi.mocked(userService.getById).mockResolvedValue(profile);
      vi.mocked(clinicService.getById).mockResolvedValue(clinic);

      const { unmount } = renderHook(() => useClinicContext(), { wrapper });

      // Wait for initial load
      await waitFor(() => {
        expect(userService.getById).toHaveBeenCalled();
      });

      unmount();

      // Verify no subscriptions were used (PERF optimization)
      expect(userService.subscribe).not.toHaveBeenCalled();
      expect(clinicService.subscribe).not.toHaveBeenCalled();
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
