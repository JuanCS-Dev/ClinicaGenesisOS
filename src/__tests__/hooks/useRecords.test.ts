/**
 * Tests for useRecords Hook
 *
 * Tests real-time medical record subscriptions and CRUD operations.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useRecords, useAllRecords } from '@/hooks/useRecords';
import { recordService } from '@/services/firestore';
import { RecordType, type SoapRecord, type CreateSoapRecordInput } from '@/types';

// Mock the ClinicContext
const mockClinicId = 'test-clinic-123';
const mockUserProfile = { displayName: 'Dr. Test' };

vi.mock('@/contexts/ClinicContext', () => ({
  useClinicContext: vi.fn(() => ({
    clinicId: mockClinicId,
    userProfile: mockUserProfile,
  })),
}));

// Mock the record service
vi.mock('@/services/firestore', () => ({
  recordService: {
    subscribe: vi.fn(),
    subscribeByPatient: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getVersionHistory: vi.fn(),
    restoreVersion: vi.fn(),
  },
}));

// Import the mocked useClinicContext to control it
import { useClinicContext } from '@/contexts/ClinicContext';

/**
 * Create a mock SOAP record for testing.
 */
function createMockRecord(overrides: Partial<SoapRecord> = {}): SoapRecord {
  return {
    id: 'record-1',
    patientId: 'patient-1',
    date: '2025-01-15T10:00:00.000Z',
    professional: 'Dr. Test',
    type: RecordType.SOAP,
    specialty: 'medicina',
    subjective: 'Patient reports headache',
    objective: 'BP 120/80',
    assessment: 'Tension headache',
    plan: 'Rest and hydration',
    ...overrides,
  };
}

describe('useRecords', () => {
  let mockUnsubscribe: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUnsubscribe = vi.fn();

    vi.mocked(useClinicContext).mockReturnValue({
      clinicId: mockClinicId,
      userProfile: mockUserProfile,
    } as ReturnType<typeof useClinicContext>);

    vi.mocked(recordService.subscribeByPatient).mockReturnValue(mockUnsubscribe as () => void);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('returns empty records initially', () => {
      const { result } = renderHook(() => useRecords('patient-1'));

      expect(result.current.records).toEqual([]);
    });

    it('starts with loading true when clinicId and patientId exist', () => {
      const { result } = renderHook(() => useRecords('patient-1'));

      expect(result.current.loading).toBe(true);
    });

    it('starts with loading false when no clinicId', () => {
      vi.mocked(useClinicContext).mockReturnValue({
        clinicId: null,
        userProfile: null,
      } as unknown as ReturnType<typeof useClinicContext>);

      const { result } = renderHook(() => useRecords('patient-1'));

      expect(result.current.loading).toBe(false);
      expect(result.current.records).toEqual([]);
    });

    it('starts with loading false when no patientId', () => {
      const { result } = renderHook(() => useRecords(undefined));

      expect(result.current.loading).toBe(false);
      expect(result.current.records).toEqual([]);
    });
  });

  describe('subscriptions', () => {
    it('subscribes to patient records', () => {
      renderHook(() => useRecords('patient-123'));

      expect(recordService.subscribeByPatient).toHaveBeenCalledWith(
        mockClinicId,
        'patient-123',
        expect.any(Function)
      );
    });

    it('unsubscribes on unmount', () => {
      const { unmount } = renderHook(() => useRecords('patient-1'));

      unmount();

      expect(mockUnsubscribe).toHaveBeenCalled();
    });

    it('receives records from subscription', async () => {
      const mockRecords = [createMockRecord()];

      vi.mocked(recordService.subscribeByPatient).mockImplementation((_, __, callback) => {
        setTimeout(() => callback(mockRecords), 0);
        return mockUnsubscribe as () => void;
      });

      const { result } = renderHook(() => useRecords('patient-1'));

      await waitFor(() => {
        expect(result.current.records).toEqual(mockRecords);
      });

      expect(result.current.loading).toBe(false);
    });
  });

  describe('CRUD operations', () => {
    it('addRecord creates record with professional name', async () => {
      vi.mocked(recordService.create).mockResolvedValue('new-record-id');

      const { result } = renderHook(() => useRecords('patient-1'));

      const newRecord: CreateSoapRecordInput = {
        patientId: 'patient-1',
        type: RecordType.SOAP,
        specialty: 'medicina',
        subjective: 'Test',
        objective: 'Test',
        assessment: 'Test',
        plan: 'Test',
      };

      let recordId: string;
      await act(async () => {
        recordId = await result.current.addRecord(newRecord as Parameters<typeof result.current.addRecord>[0]);
      });

      expect(recordService.create).toHaveBeenCalledWith(
        mockClinicId,
        { ...newRecord, patientId: 'patient-1' },
        'Dr. Test'
      );
      expect(recordId!).toBe('new-record-id');
    });

    it('addRecord throws when no clinic', async () => {
      vi.mocked(useClinicContext).mockReturnValue({
        clinicId: null,
        userProfile: null,
      } as unknown as ReturnType<typeof useClinicContext>);

      const { result } = renderHook(() => useRecords('patient-1'));

      await expect(
        result.current.addRecord({} as Parameters<typeof result.current.addRecord>[0])
      ).rejects.toThrow('No clinic selected');
    });

    it('addRecord throws when no patient', async () => {
      const { result } = renderHook(() => useRecords(undefined));

      await expect(
        result.current.addRecord({} as Parameters<typeof result.current.addRecord>[0])
      ).rejects.toThrow('No patient selected');
    });

    it('updateRecord updates record with versioning', async () => {
      vi.mocked(recordService.update).mockResolvedValue();

      const { result } = renderHook(() => useRecords('patient-1'));

      await act(async () => {
        await result.current.updateRecord('record-1', { plan: 'Updated plan' });
      });

      // Should pass updatedBy (from userProfile) and changeReason (undefined)
      expect(recordService.update).toHaveBeenCalledWith(
        mockClinicId,
        'record-1',
        { plan: 'Updated plan' },
        'Dr. Test', // updatedBy from mock userProfile
        undefined   // changeReason
      );
    });

    it('updateRecord passes changeReason for audit trail', async () => {
      vi.mocked(recordService.update).mockResolvedValue();

      const { result } = renderHook(() => useRecords('patient-1'));

      await act(async () => {
        await result.current.updateRecord('record-1', { plan: 'Corrected plan' }, 'Correção de erro de digitação');
      });

      expect(recordService.update).toHaveBeenCalledWith(
        mockClinicId,
        'record-1',
        { plan: 'Corrected plan' },
        'Dr. Test',
        'Correção de erro de digitação'
      );
    });

    it('updateRecord throws when no clinic', async () => {
      vi.mocked(useClinicContext).mockReturnValue({
        clinicId: null,
        userProfile: null,
      } as unknown as ReturnType<typeof useClinicContext>);

      const { result } = renderHook(() => useRecords('patient-1'));

      await expect(result.current.updateRecord('record-1', {})).rejects.toThrow(
        'No clinic selected'
      );
    });

    it('deleteRecord deletes record', async () => {
      vi.mocked(recordService.delete).mockResolvedValue();

      const { result } = renderHook(() => useRecords('patient-1'));

      await act(async () => {
        await result.current.deleteRecord('record-1');
      });

      expect(recordService.delete).toHaveBeenCalledWith(mockClinicId, 'record-1');
    });

    it('deleteRecord throws when no clinic', async () => {
      vi.mocked(useClinicContext).mockReturnValue({
        clinicId: null,
        userProfile: null,
      } as unknown as ReturnType<typeof useClinicContext>);

      const { result } = renderHook(() => useRecords('patient-1'));

      await expect(result.current.deleteRecord('record-1')).rejects.toThrow('No clinic selected');
    });

    it('getVersionHistory returns version history', async () => {
      const mockHistory = [
        { versionNumber: 1, timestamp: '2025-01-01', changedBy: 'Dr. A' },
        { versionNumber: 2, timestamp: '2025-01-02', changedBy: 'Dr. B' },
      ];
      vi.mocked(recordService.getVersionHistory).mockResolvedValue(mockHistory as never);

      const { result } = renderHook(() => useRecords('patient-1'));

      let history;
      await act(async () => {
        history = await result.current.getVersionHistory('record-1');
      });

      expect(recordService.getVersionHistory).toHaveBeenCalledWith(mockClinicId, 'record-1');
      expect(history).toEqual(mockHistory);
    });

    it('getVersionHistory throws when no clinic', async () => {
      vi.mocked(useClinicContext).mockReturnValue({
        clinicId: null,
        userProfile: null,
      } as unknown as ReturnType<typeof useClinicContext>);

      const { result } = renderHook(() => useRecords('patient-1'));

      await expect(result.current.getVersionHistory('record-1')).rejects.toThrow('No clinic selected');
    });

    it('restoreVersion restores to previous version', async () => {
      vi.mocked(recordService.restoreVersion).mockResolvedValue(3);

      const { result } = renderHook(() => useRecords('patient-1'));

      let newVersion;
      await act(async () => {
        newVersion = await result.current.restoreVersion('record-1', 1);
      });

      expect(recordService.restoreVersion).toHaveBeenCalledWith(
        mockClinicId,
        'record-1',
        1,
        'Dr. Test'
      );
      expect(newVersion).toBe(3);
    });

    it('restoreVersion throws when no clinic', async () => {
      vi.mocked(useClinicContext).mockReturnValue({
        clinicId: null,
        userProfile: null,
      } as unknown as ReturnType<typeof useClinicContext>);

      const { result } = renderHook(() => useRecords('patient-1'));

      await expect(result.current.restoreVersion('record-1', 1)).rejects.toThrow('No clinic selected');
    });
  });
});

describe('useAllRecords', () => {
  let mockUnsubscribe: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUnsubscribe = vi.fn();

    vi.mocked(useClinicContext).mockReturnValue({
      clinicId: mockClinicId,
      userProfile: mockUserProfile,
    } as ReturnType<typeof useClinicContext>);

    vi.mocked(recordService.subscribe).mockReturnValue(mockUnsubscribe as () => void);
  });

  it('subscribes to all records', () => {
    renderHook(() => useAllRecords());

    expect(recordService.subscribe).toHaveBeenCalledWith(mockClinicId, expect.any(Function));
  });

  it('returns empty records when no clinicId', () => {
    vi.mocked(useClinicContext).mockReturnValue({
      clinicId: null,
      userProfile: null,
    } as unknown as ReturnType<typeof useClinicContext>);

    const { result } = renderHook(() => useAllRecords());

    expect(result.current.records).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it('receives all records from subscription', async () => {
    const mockRecords = [
      createMockRecord({ id: 'record-1', patientId: 'patient-1' }),
      createMockRecord({ id: 'record-2', patientId: 'patient-2' }),
    ];

    vi.mocked(recordService.subscribe).mockImplementation((_, callback) => {
      setTimeout(() => callback(mockRecords), 0);
      return mockUnsubscribe as () => void;
    });

    const { result } = renderHook(() => useAllRecords());

    await waitFor(() => {
      expect(result.current.records).toHaveLength(2);
    });
  });

  it('addRecord creates record', async () => {
    vi.mocked(recordService.create).mockResolvedValue('new-record-id');

    const { result } = renderHook(() => useAllRecords());

    const newRecord: CreateSoapRecordInput = {
      patientId: 'patient-1',
      type: RecordType.SOAP,
      specialty: 'medicina',
      subjective: 'Test',
      objective: 'Test',
      assessment: 'Test',
      plan: 'Test',
    };

    await act(async () => {
      await result.current.addRecord(newRecord as Parameters<typeof result.current.addRecord>[0]);
    });

    expect(recordService.create).toHaveBeenCalledWith(mockClinicId, newRecord, 'Dr. Test');
  });

  it('addRecord throws when no clinic', async () => {
    vi.mocked(useClinicContext).mockReturnValue({
      clinicId: null,
      userProfile: null,
    } as unknown as ReturnType<typeof useClinicContext>);

    const { result } = renderHook(() => useAllRecords());

    await expect(
      result.current.addRecord({} as Parameters<typeof result.current.addRecord>[0])
    ).rejects.toThrow('No clinic selected');
  });

  it('updateRecord throws when no clinic', async () => {
    vi.mocked(useClinicContext).mockReturnValue({
      clinicId: null,
      userProfile: null,
    } as unknown as ReturnType<typeof useClinicContext>);

    const { result } = renderHook(() => useAllRecords());

    await expect(result.current.updateRecord('record-1', {})).rejects.toThrow('No clinic selected');
  });

  it('deleteRecord throws when no clinic', async () => {
    vi.mocked(useClinicContext).mockReturnValue({
      clinicId: null,
      userProfile: null,
    } as unknown as ReturnType<typeof useClinicContext>);

    const { result } = renderHook(() => useAllRecords());

    await expect(result.current.deleteRecord('record-1')).rejects.toThrow('No clinic selected');
  });

  it('getVersionHistory returns version history', async () => {
    const mockHistory = [
      { versionNumber: 1, timestamp: '2025-01-01', changedBy: 'Dr. A' },
    ];
    vi.mocked(recordService.getVersionHistory).mockResolvedValue(mockHistory as never);

    const { result } = renderHook(() => useAllRecords());

    let history;
    await act(async () => {
      history = await result.current.getVersionHistory('record-1');
    });

    expect(recordService.getVersionHistory).toHaveBeenCalledWith(mockClinicId, 'record-1');
    expect(history).toEqual(mockHistory);
  });

  it('getVersionHistory throws when no clinic', async () => {
    vi.mocked(useClinicContext).mockReturnValue({
      clinicId: null,
      userProfile: null,
    } as unknown as ReturnType<typeof useClinicContext>);

    const { result } = renderHook(() => useAllRecords());

    await expect(result.current.getVersionHistory('record-1')).rejects.toThrow('No clinic selected');
  });

  it('restoreVersion restores to previous version', async () => {
    vi.mocked(recordService.restoreVersion).mockResolvedValue(2);

    const { result } = renderHook(() => useAllRecords());

    let newVersion;
    await act(async () => {
      newVersion = await result.current.restoreVersion('record-1', 1);
    });

    expect(recordService.restoreVersion).toHaveBeenCalledWith(
      mockClinicId,
      'record-1',
      1,
      'Dr. Test'
    );
    expect(newVersion).toBe(2);
  });

  it('restoreVersion throws when no clinic', async () => {
    vi.mocked(useClinicContext).mockReturnValue({
      clinicId: null,
      userProfile: null,
    } as unknown as ReturnType<typeof useClinicContext>);

    const { result } = renderHook(() => useAllRecords());

    await expect(result.current.restoreVersion('record-1', 1)).rejects.toThrow('No clinic selected');
  });

  it('unsubscribes on unmount', () => {
    const { unmount } = renderHook(() => useAllRecords());

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  it('updateRecord updates with versioning', async () => {
    vi.mocked(recordService.update).mockResolvedValue();

    const { result } = renderHook(() => useAllRecords());

    await act(async () => {
      await result.current.updateRecord('record-1', { plan: 'Updated' }, 'Reason');
    });

    expect(recordService.update).toHaveBeenCalledWith(
      mockClinicId,
      'record-1',
      { plan: 'Updated' },
      'Dr. Test',
      'Reason'
    );
  });

  it('deleteRecord deletes record', async () => {
    vi.mocked(recordService.delete).mockResolvedValue();

    const { result } = renderHook(() => useAllRecords());

    await act(async () => {
      await result.current.deleteRecord('record-1');
    });

    expect(recordService.delete).toHaveBeenCalledWith(mockClinicId, 'record-1');
  });
});
