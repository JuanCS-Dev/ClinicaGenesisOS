/**
 * Tests for useAppointments Hook
 *
 * Tests real-time appointment subscriptions and CRUD operations.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAppointments, usePatientAppointments } from '@/hooks/useAppointments';
import { appointmentService } from '@/services/firestore';
import { Status, type Appointment } from '@/types';

// Mock the ClinicContext
const mockClinicId = 'test-clinic-123';
vi.mock('@/contexts/ClinicContext', () => ({
  useClinicContext: vi.fn(() => ({ clinicId: mockClinicId })),
}));

// Mock the appointment service
vi.mock('@/services/firestore', () => ({
  appointmentService: {
    subscribe: vi.fn(),
    subscribeByDate: vi.fn(),
    subscribeByPatient: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateStatus: vi.fn(),
    delete: vi.fn(),
  },
}));

// Import the mocked useClinicContext to control it
import { useClinicContext } from '@/contexts/ClinicContext';

/**
 * Create a mock appointment for testing.
 */
function createMockAppointment(overrides: Partial<Appointment> = {}): Appointment {
  const today = new Date().toISOString().split('T')[0];
  return {
    id: 'apt-1',
    patientId: 'patient-1',
    patientName: 'Test Patient',
    date: `${today}T10:00:00.000Z`,
    durationMin: 60,
    procedure: 'Consulta',
    status: Status.CONFIRMED,
    professional: 'Dr. Test',
    specialty: 'medicina',
    ...overrides,
  };
}

describe('useAppointments', () => {
  let mockUnsubscribe: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUnsubscribe = vi.fn();

    // Default mock: subscribe returns unsubscribe function
    vi.mocked(appointmentService.subscribe).mockReturnValue(mockUnsubscribe as () => void);
    vi.mocked(appointmentService.subscribeByDate).mockReturnValue(mockUnsubscribe as () => void);
    vi.mocked(appointmentService.subscribeByPatient).mockReturnValue(mockUnsubscribe as () => void);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    beforeEach(() => {
      vi.mocked(useClinicContext).mockReturnValue({ clinicId: mockClinicId } as ReturnType<typeof useClinicContext>);
    });

    it('returns empty appointments initially', () => {
      const { result } = renderHook(() => useAppointments());

      expect(result.current.appointments).toEqual([]);
      expect(result.current.todaysAppointments).toEqual([]);
    });

    it('starts with loading true when clinicId exists', () => {
      const { result } = renderHook(() => useAppointments());

      expect(result.current.loading).toBe(true);
    });

    it('starts with loading false when no clinicId', () => {
      vi.mocked(useClinicContext).mockReturnValue({ clinicId: null } as ReturnType<typeof useClinicContext>);

      const { result } = renderHook(() => useAppointments());

      expect(result.current.loading).toBe(false);
      expect(result.current.appointments).toEqual([]);
    });

    it('subscribes to all appointments without filters', () => {
      renderHook(() => useAppointments());

      expect(appointmentService.subscribe).toHaveBeenCalledWith(
        mockClinicId,
        expect.any(Function)
      );
    });
  });

  describe('subscriptions', () => {
    beforeEach(() => {
      vi.mocked(useClinicContext).mockReturnValue({ clinicId: mockClinicId } as ReturnType<typeof useClinicContext>);
    });

    it('subscribes by date when date filter provided', () => {
      renderHook(() => useAppointments({ date: '2025-01-15' }));

      expect(appointmentService.subscribeByDate).toHaveBeenCalledWith(
        mockClinicId,
        '2025-01-15',
        expect.any(Function)
      );
    });

    it('subscribes by patient when patientId filter provided', () => {
      renderHook(() => useAppointments({ patientId: 'patient-123' }));

      expect(appointmentService.subscribeByPatient).toHaveBeenCalledWith(
        mockClinicId,
        'patient-123',
        expect.any(Function)
      );
    });

    it('unsubscribes on unmount', () => {
      const { unmount } = renderHook(() => useAppointments());

      unmount();

      expect(mockUnsubscribe).toHaveBeenCalled();
    });

    it('receives appointments from subscription', async () => {
      const mockAppointments = [createMockAppointment()];

      vi.mocked(appointmentService.subscribe).mockImplementation((_, callback) => {
        // Simulate async data arrival
        setTimeout(() => callback(mockAppointments), 0);
        return mockUnsubscribe as () => void;
      });

      const { result } = renderHook(() => useAppointments());

      await waitFor(() => {
        expect(result.current.appointments).toEqual(mockAppointments);
      });

      expect(result.current.loading).toBe(false);
    });
  });

  describe('todaysAppointments', () => {
    beforeEach(() => {
      vi.mocked(useClinicContext).mockReturnValue({ clinicId: mockClinicId } as ReturnType<typeof useClinicContext>);
    });

    it('filters appointments for today', async () => {
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

      const mockAppointments = [
        createMockAppointment({ id: 'apt-1', date: `${today}T10:00:00.000Z` }),
        createMockAppointment({ id: 'apt-2', date: `${tomorrow}T10:00:00.000Z` }),
      ];

      vi.mocked(appointmentService.subscribe).mockImplementation((_, callback) => {
        setTimeout(() => callback(mockAppointments), 0);
        return mockUnsubscribe as () => void;
      });

      const { result } = renderHook(() => useAppointments());

      await waitFor(() => {
        expect(result.current.todaysAppointments).toHaveLength(1);
        expect(result.current.todaysAppointments[0].id).toBe('apt-1');
      });
    });
  });

  describe('CRUD operations', () => {
    beforeEach(() => {
      vi.mocked(useClinicContext).mockReturnValue({ clinicId: mockClinicId } as ReturnType<typeof useClinicContext>);
    });

    it('addAppointment creates appointment', async () => {
      vi.mocked(appointmentService.create).mockResolvedValue('new-apt-id');

      const { result } = renderHook(() => useAppointments());

      const newAppointment = {
        patientId: 'patient-1',
        patientName: 'Test',
        date: '2025-01-15T10:00:00.000Z',
        durationMin: 60,
        procedure: 'Consulta',
        status: Status.CONFIRMED,
        professional: 'Dr. Test',
        specialty: 'medicina' as const,
      };

      let appointmentId: string;
      await act(async () => {
        appointmentId = await result.current.addAppointment(newAppointment);
      });

      expect(appointmentService.create).toHaveBeenCalledWith(mockClinicId, newAppointment);
      expect(appointmentId!).toBe('new-apt-id');
    });

    it('addAppointment throws when no clinic', async () => {
      vi.mocked(useClinicContext).mockReturnValue({ clinicId: null } as ReturnType<typeof useClinicContext>);

      const { result } = renderHook(() => useAppointments());

      await expect(
        result.current.addAppointment({} as Parameters<typeof result.current.addAppointment>[0])
      ).rejects.toThrow('No clinic selected');
    });

    it('updateAppointment updates appointment', async () => {
      vi.mocked(appointmentService.update).mockResolvedValue();

      const { result } = renderHook(() => useAppointments());

      await act(async () => {
        await result.current.updateAppointment('apt-1', { procedure: 'Updated' });
      });

      expect(appointmentService.update).toHaveBeenCalledWith(mockClinicId, 'apt-1', {
        procedure: 'Updated',
      });
    });

    it('updateAppointment throws when no clinic', async () => {
      vi.mocked(useClinicContext).mockReturnValue({ clinicId: null } as ReturnType<typeof useClinicContext>);

      const { result } = renderHook(() => useAppointments());

      await expect(result.current.updateAppointment('apt-1', {})).rejects.toThrow(
        'No clinic selected'
      );
    });

    it('updateStatus updates appointment status', async () => {
      vi.mocked(appointmentService.updateStatus).mockResolvedValue();

      const { result } = renderHook(() => useAppointments());

      await act(async () => {
        await result.current.updateStatus('apt-1', Status.FINISHED);
      });

      expect(appointmentService.updateStatus).toHaveBeenCalledWith(
        mockClinicId,
        'apt-1',
        Status.FINISHED
      );
    });

    it('updateStatus throws when no clinic', async () => {
      vi.mocked(useClinicContext).mockReturnValue({ clinicId: null } as ReturnType<typeof useClinicContext>);

      const { result } = renderHook(() => useAppointments());

      await expect(result.current.updateStatus('apt-1', Status.FINISHED)).rejects.toThrow(
        'No clinic selected'
      );
    });

    it('deleteAppointment deletes appointment', async () => {
      vi.mocked(appointmentService.delete).mockResolvedValue();

      const { result } = renderHook(() => useAppointments());

      await act(async () => {
        await result.current.deleteAppointment('apt-1');
      });

      expect(appointmentService.delete).toHaveBeenCalledWith(mockClinicId, 'apt-1');
    });

    it('deleteAppointment throws when no clinic', async () => {
      vi.mocked(useClinicContext).mockReturnValue({ clinicId: null } as ReturnType<typeof useClinicContext>);

      const { result } = renderHook(() => useAppointments());

      await expect(result.current.deleteAppointment('apt-1')).rejects.toThrow('No clinic selected');
    });
  });

  describe('filter management', () => {
    beforeEach(() => {
      vi.mocked(useClinicContext).mockReturnValue({ clinicId: mockClinicId } as ReturnType<typeof useClinicContext>);
    });

    it('setFilters updates filters and resubscribes', async () => {
      const { result } = renderHook(() => useAppointments());

      // Initial subscription
      expect(appointmentService.subscribe).toHaveBeenCalledTimes(1);

      // Update filters
      act(() => {
        result.current.setFilters({ date: '2025-01-20' });
      });

      // Should unsubscribe from previous and subscribe with new filter
      await waitFor(() => {
        expect(appointmentService.subscribeByDate).toHaveBeenCalledWith(
          mockClinicId,
          '2025-01-20',
          expect.any(Function)
        );
      });
    });

    it('clearFilters resets filters', async () => {
      const { result } = renderHook(() => useAppointments({ date: '2025-01-15' }));

      // Initially subscribed by date
      expect(appointmentService.subscribeByDate).toHaveBeenCalled();

      // Clear filters
      act(() => {
        result.current.clearFilters();
      });

      // Should resubscribe without filters
      await waitFor(() => {
        expect(appointmentService.subscribe).toHaveBeenCalled();
      });
    });
  });
});

describe('usePatientAppointments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useClinicContext).mockReturnValue({ clinicId: mockClinicId } as ReturnType<typeof useClinicContext>);
    vi.mocked(appointmentService.subscribeByPatient).mockReturnValue(vi.fn());
  });

  it('subscribes to patient appointments when patientId provided', () => {
    renderHook(() => usePatientAppointments('patient-123'));

    expect(appointmentService.subscribeByPatient).toHaveBeenCalledWith(
      mockClinicId,
      'patient-123',
      expect.any(Function)
    );
  });

  it('does not subscribe when patientId is undefined', () => {
    vi.mocked(appointmentService.subscribe).mockReturnValue(vi.fn());

    renderHook(() => usePatientAppointments(undefined));

    expect(appointmentService.subscribeByPatient).not.toHaveBeenCalled();
    expect(appointmentService.subscribe).toHaveBeenCalled();
  });
});
