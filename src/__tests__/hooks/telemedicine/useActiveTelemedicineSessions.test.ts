/**
 * useActiveTelemedicineSessions Hook Tests
 *
 * Tests for active session listing.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

// Mock dependencies
vi.mock('@/contexts/ClinicContext', () => ({
  useClinicContext: vi.fn(() => ({
    clinicId: 'clinic-123',
    userProfile: { id: 'user-123' },
  })),
}));

vi.mock('@/services/firestore', () => ({
  telemedicineService: {
    subscribe: vi.fn(),
    subscribeActive: vi.fn(),
    create: vi.fn(),
    getById: vi.fn(),
    addParticipant: vi.fn(),
    updateStatus: vi.fn(),
    addLog: vi.fn(),
    endSession: vi.fn(),
    getByAppointment: vi.fn(),
  },
}));

import { useActiveTelemedicineSessions } from '@/hooks/useTelemedicine';
import { telemedicineService } from '@/services/firestore';
import { useClinicContext } from '@/contexts/ClinicContext';
import { mockSession, waitForLoaded } from './setup';

describe('useActiveTelemedicineSessions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useClinicContext).mockReturnValue({
      clinicId: 'clinic-123',
      userProfile: { id: 'user-123' },
    } as unknown as ReturnType<typeof useClinicContext>);

    vi.mocked(telemedicineService.subscribeActive).mockImplementation(
      (_clinicId, callback) => {
        setTimeout(() => callback([mockSession]), 0);
        return vi.fn();
      }
    );
  });

  describe('initial state', () => {
    it('should start with loading true', () => {
      const { result } = renderHook(() => useActiveTelemedicineSessions());
      expect(result.current.loading).toBe(true);
      expect(result.current.activeSessions).toEqual([]);
    });
  });

  describe('loading sessions', () => {
    it('should load active sessions', async () => {
      const { result } = renderHook(() => useActiveTelemedicineSessions());

      await waitForLoaded(result);

      expect(result.current.activeSessions).toHaveLength(1);
      expect(telemedicineService.subscribeActive).toHaveBeenCalledWith(
        'clinic-123',
        expect.any(Function)
      );
    });
  });

  describe('when clinic is not set', () => {
    it('should return empty sessions', async () => {
      vi.mocked(useClinicContext).mockReturnValue({
        clinicId: null,
      } as unknown as ReturnType<typeof useClinicContext>);

      const { result } = renderHook(() => useActiveTelemedicineSessions());

      await waitForLoaded(result);

      expect(result.current.activeSessions).toEqual([]);
    });
  });

  describe('cleanup', () => {
    it('should unsubscribe on unmount', async () => {
      const unsubscribeMock = vi.fn();
      vi.mocked(telemedicineService.subscribeActive).mockImplementation(
        (_clinicId, callback) => {
          setTimeout(() => callback([mockSession]), 0);
          return unsubscribeMock;
        }
      );

      const { unmount } = renderHook(() => useActiveTelemedicineSessions());

      await waitFor(() => {
        expect(telemedicineService.subscribeActive).toHaveBeenCalled();
      });

      unmount();

      expect(unsubscribeMock).toHaveBeenCalled();
    });
  });
});
