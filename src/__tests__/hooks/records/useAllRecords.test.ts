/**
 * useAllRecords Hook Tests
 *
 * Tests for all records listing and operations.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { RecordType, type CreateSoapRecordInput } from '@/types';

// Mock the ClinicContext
vi.mock('@/contexts/ClinicContext', () => ({
  useClinicContext: vi.fn(() => ({
    clinicId: 'test-clinic-123',
    userProfile: { displayName: 'Dr. Test' },
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

import { useAllRecords } from '@/hooks/useRecords';
import { recordService } from '@/services/firestore';
import { useClinicContext } from '@/contexts/ClinicContext';
import { mockClinicId, mockUserProfile, createMockRecord } from './setup';

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

  afterEach(() => {
    vi.clearAllMocks();
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
