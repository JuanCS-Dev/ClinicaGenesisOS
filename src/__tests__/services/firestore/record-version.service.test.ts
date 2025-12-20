/**
 * Record Version Service Tests
 *
 * Tests for medical record version history operations.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock Firebase
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  getDocs: vi.fn(),
  getDoc: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  serverTimestamp: vi.fn(() => ({ _serverTimestamp: true })),
  Timestamp: class MockTimestamp {
    seconds: number;
    nanoseconds: number;
    constructor(seconds: number, nanoseconds: number) {
      this.seconds = seconds;
      this.nanoseconds = nanoseconds;
    }
    toDate() {
      return new Date(this.seconds * 1000);
    }
    static fromDate(date: Date) {
      return new MockTimestamp(Math.floor(date.getTime() / 1000), 0);
    }
  },
}));

vi.mock('../../../services/firebase', () => ({
  db: {},
}));

// Import after mocks
import { recordVersionService } from '../../../services/firestore/record-version.service';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';

describe('recordVersionService', () => {
  const mockClinicId = 'clinic-123';
  const mockRecordId = 'record-456';
  const mockVersionId = 'version-789';
  const mockProfessional = 'Dr. Maria Silva';

  // Helper to create Timestamp instances
  const createTimestamp = (isoString: string) => {
    return Timestamp.fromDate(new Date(isoString));
  };

  const mockRecordData = {
    patientId: 'patient-001',
    appointmentId: 'appt-001',
    specialty: 'nutricao',
    status: 'in_progress',
    content: { notes: 'Patient consultation notes' },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('saveVersion', () => {
    it('should save a new version of the record', async () => {
      vi.mocked(collection).mockReturnValue({} as never);
      vi.mocked(addDoc).mockResolvedValue({ id: 'new-version-id' } as never);

      await recordVersionService.saveVersion(
        mockClinicId,
        mockRecordId,
        mockRecordData,
        2,
        mockProfessional,
        'Updated diagnosis'
      );

      expect(collection).toHaveBeenCalled();
      expect(addDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          version: 2,
          data: mockRecordData,
          savedBy: mockProfessional,
          changeReason: 'Updated diagnosis',
        })
      );
      expect(serverTimestamp).toHaveBeenCalled();
    });

    it('should save version without change reason', async () => {
      vi.mocked(collection).mockReturnValue({} as never);
      vi.mocked(addDoc).mockResolvedValue({ id: 'new-version-id' } as never);

      await recordVersionService.saveVersion(
        mockClinicId,
        mockRecordId,
        mockRecordData,
        1,
        mockProfessional
      );

      expect(addDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          version: 1,
          changeReason: undefined,
        })
      );
    });
  });

  describe('getHistory', () => {
    it('should return version history sorted by version descending', async () => {
      const mockDocs = [
        {
          id: 'v3',
          data: () => ({
            version: 3,
            data: { ...mockRecordData, content: { notes: 'Version 3' } },
            savedAt: createTimestamp('2024-01-15T12:00:00.000Z'),
            savedBy: mockProfessional,
            changeReason: 'Final update',
          }),
        },
        {
          id: 'v2',
          data: () => ({
            version: 2,
            data: { ...mockRecordData, content: { notes: 'Version 2' } },
            savedAt: createTimestamp('2024-01-15T10:00:00.000Z'),
            savedBy: mockProfessional,
          }),
        },
        {
          id: 'v1',
          data: () => ({
            version: 1,
            data: mockRecordData,
            savedAt: createTimestamp('2024-01-15T08:00:00.000Z'),
            savedBy: mockProfessional,
          }),
        },
      ];

      vi.mocked(collection).mockReturnValue({} as never);
      vi.mocked(query).mockReturnValue({} as never);
      vi.mocked(orderBy).mockReturnValue({} as never);
      vi.mocked(getDocs).mockResolvedValue({ docs: mockDocs } as never);

      const result = await recordVersionService.getHistory(
        mockClinicId,
        mockRecordId
      );

      expect(result).toHaveLength(3);
      expect(result[0].version).toBe(3);
      expect(result[0].changeReason).toBe('Final update');
      expect(result[1].version).toBe(2);
      expect(result[2].version).toBe(1);
      expect(orderBy).toHaveBeenCalledWith('version', 'desc');
    });

    it('should return empty array when no versions exist', async () => {
      vi.mocked(collection).mockReturnValue({} as never);
      vi.mocked(query).mockReturnValue({} as never);
      vi.mocked(orderBy).mockReturnValue({} as never);
      vi.mocked(getDocs).mockResolvedValue({ docs: [] } as never);

      const result = await recordVersionService.getHistory(
        mockClinicId,
        mockRecordId
      );

      expect(result).toHaveLength(0);
    });
  });

  describe('getVersion', () => {
    it('should return a specific version by version number', async () => {
      const mockDocs = [
        {
          id: mockVersionId,
          data: () => ({
            version: 2,
            data: mockRecordData,
            savedAt: createTimestamp('2024-01-15T10:00:00.000Z'),
            savedBy: mockProfessional,
            changeReason: 'Updated treatment plan',
          }),
        },
      ];

      vi.mocked(collection).mockReturnValue({} as never);
      vi.mocked(query).mockReturnValue({} as never);
      vi.mocked(where).mockReturnValue({} as never);
      vi.mocked(getDocs).mockResolvedValue({
        empty: false,
        docs: mockDocs,
      } as never);

      const result = await recordVersionService.getVersion(
        mockClinicId,
        mockRecordId,
        2
      );

      expect(result).not.toBeNull();
      expect(result?.id).toBe(mockVersionId);
      expect(result?.version).toBe(2);
      expect(result?.changeReason).toBe('Updated treatment plan');
      expect(where).toHaveBeenCalledWith('version', '==', 2);
    });

    it('should return null when version is not found', async () => {
      vi.mocked(collection).mockReturnValue({} as never);
      vi.mocked(query).mockReturnValue({} as never);
      vi.mocked(where).mockReturnValue({} as never);
      vi.mocked(getDocs).mockResolvedValue({
        empty: true,
        docs: [],
      } as never);

      const result = await recordVersionService.getVersion(
        mockClinicId,
        mockRecordId,
        999
      );

      expect(result).toBeNull();
    });
  });

  describe('restore', () => {
    it('should restore a record to a previous version', async () => {
      const versionToRestore = {
        version: 1,
        data: { ...mockRecordData, content: { notes: 'Original notes' } },
        savedAt: createTimestamp('2024-01-15T08:00:00.000Z'),
        savedBy: mockProfessional,
      };

      const currentRecordData = {
        ...mockRecordData,
        content: { notes: 'Current notes' },
        version: 3,
      };

      // Mock getVersion (returns the version to restore)
      vi.mocked(collection).mockReturnValue({} as never);
      vi.mocked(query).mockReturnValue({} as never);
      vi.mocked(where).mockReturnValue({} as never);
      vi.mocked(getDocs).mockResolvedValue({
        empty: false,
        docs: [
          {
            id: 'v1',
            data: () => versionToRestore,
          },
        ],
      } as never);

      // Mock getDoc (returns current record)
      vi.mocked(doc).mockReturnValue({} as never);
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        data: () => currentRecordData,
      } as never);

      // Mock addDoc (saves current state as version)
      vi.mocked(addDoc).mockResolvedValue({ id: 'new-version-id' } as never);

      // Mock updateDoc (restores to previous version)
      vi.mocked(updateDoc).mockResolvedValue(undefined);

      const newVersion = await recordVersionService.restore(
        mockClinicId,
        mockRecordId,
        1,
        mockProfessional
      );

      expect(newVersion).toBe(4); // 3 + 1
      expect(addDoc).toHaveBeenCalled(); // Save current state
      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          version: 4,
        })
      );
    });

    it('should throw error when version to restore is not found', async () => {
      vi.mocked(collection).mockReturnValue({} as never);
      vi.mocked(query).mockReturnValue({} as never);
      vi.mocked(where).mockReturnValue({} as never);
      vi.mocked(getDocs).mockResolvedValue({
        empty: true,
        docs: [],
      } as never);

      await expect(
        recordVersionService.restore(
          mockClinicId,
          mockRecordId,
          999,
          mockProfessional
        )
      ).rejects.toThrow('Version 999 not found');
    });

    it('should throw error when record is not found', async () => {
      const versionToRestore = {
        version: 1,
        data: mockRecordData,
        savedAt: createTimestamp('2024-01-15T08:00:00.000Z'),
        savedBy: mockProfessional,
      };

      vi.mocked(collection).mockReturnValue({} as never);
      vi.mocked(query).mockReturnValue({} as never);
      vi.mocked(where).mockReturnValue({} as never);
      vi.mocked(getDocs).mockResolvedValue({
        empty: false,
        docs: [
          {
            id: 'v1',
            data: () => versionToRestore,
          },
        ],
      } as never);

      vi.mocked(doc).mockReturnValue({} as never);
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
      } as never);

      await expect(
        recordVersionService.restore(
          mockClinicId,
          mockRecordId,
          1,
          mockProfessional
        )
      ).rejects.toThrow('Record not found');
    });

    it('should handle record without version field', async () => {
      const versionToRestore = {
        version: 1,
        data: mockRecordData,
        savedAt: createTimestamp('2024-01-15T08:00:00.000Z'),
        savedBy: mockProfessional,
      };

      // Record without version field defaults to 1
      const currentRecordData = {
        ...mockRecordData,
        content: { notes: 'Current notes' },
        // No version field
      };

      vi.mocked(collection).mockReturnValue({} as never);
      vi.mocked(query).mockReturnValue({} as never);
      vi.mocked(where).mockReturnValue({} as never);
      vi.mocked(getDocs).mockResolvedValue({
        empty: false,
        docs: [
          {
            id: 'v1',
            data: () => versionToRestore,
          },
        ],
      } as never);

      vi.mocked(doc).mockReturnValue({} as never);
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        data: () => currentRecordData,
      } as never);

      vi.mocked(addDoc).mockResolvedValue({ id: 'new-version-id' } as never);
      vi.mocked(updateDoc).mockResolvedValue(undefined);

      const newVersion = await recordVersionService.restore(
        mockClinicId,
        mockRecordId,
        1,
        mockProfessional
      );

      // Default version 1 + 1 = 2
      expect(newVersion).toBe(2);
    });
  });
});
