/**
 * useRecords Hook Tests
 *
 * Tests for the medical records hook.
 *
 * @module __tests__/hooks/useRecords
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useRecords, useAllRecords } from '../../hooks/useRecords'
import { recordService } from '../../services/firestore'
import { useClinicContext } from '../../contexts/ClinicContext'
import type { MedicalRecord, RecordVersion } from '@/types'

vi.mock('../../contexts/ClinicContext', () => ({
  useClinicContext: vi.fn(),
}))

vi.mock('../../services/firestore', () => ({
  recordService: {
    subscribeByPatient: vi.fn(),
    subscribe: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getVersionHistory: vi.fn(),
    restoreVersion: vi.fn(),
  },
}))

describe('useRecords', () => {
  const mockClinicId = 'clinic-123'
  const mockPatientId = 'patient-456'
  const mockUserProfile = {
    id: 'user-123',
    displayName: 'Dr. Silva',
  }
  let mockUnsubscribe: ReturnType<typeof vi.fn>

  const mockRecords: MedicalRecord[] = [
    {
      id: 'record-1',
      clinicId: mockClinicId,
      patientId: mockPatientId,
      type: 'consultation',
      content: { chief_complaint: 'Headache' },
      professional: 'Dr. Silva',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
    },
    {
      id: 'record-2',
      clinicId: mockClinicId,
      patientId: mockPatientId,
      type: 'exam',
      content: { exam_type: 'Blood test' },
      professional: 'Dr. Santos',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    mockUnsubscribe = vi.fn()

    vi.mocked(useClinicContext).mockReturnValue({
      clinicId: mockClinicId,
      userProfile: mockUserProfile,
    } as ReturnType<typeof useClinicContext>)

    vi.mocked(recordService.subscribeByPatient).mockImplementation((_, __, onData) => {
      setTimeout(() => onData(mockRecords), 0)
      return mockUnsubscribe
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('initialization', () => {
    it('should initialize with empty records', () => {
      vi.mocked(recordService.subscribeByPatient).mockReturnValue(mockUnsubscribe)

      const { result } = renderHook(() => useRecords(mockPatientId))

      expect(result.current.records).toEqual([])
      expect(result.current.loading).toBe(true)
    })

    it('should not subscribe without clinicId', () => {
      vi.mocked(useClinicContext).mockReturnValue({
        clinicId: null,
        userProfile: null,
      } as unknown as ReturnType<typeof useClinicContext>)

      const { result } = renderHook(() => useRecords(mockPatientId))

      expect(recordService.subscribeByPatient).not.toHaveBeenCalled()
      expect(result.current.records).toEqual([])
      expect(result.current.loading).toBe(false)
    })

    it('should not subscribe without patientId', () => {
      const { result } = renderHook(() => useRecords(undefined))

      expect(recordService.subscribeByPatient).not.toHaveBeenCalled()
      expect(result.current.records).toEqual([])
      expect(result.current.loading).toBe(false)
    })
  })

  describe('subscription', () => {
    it('should subscribe to patient records', () => {
      renderHook(() => useRecords(mockPatientId))

      expect(recordService.subscribeByPatient).toHaveBeenCalledWith(
        mockClinicId,
        mockPatientId,
        expect.any(Function)
      )
    })

    it('should receive records from subscription', async () => {
      vi.useFakeTimers()

      const { result } = renderHook(() => useRecords(mockPatientId))

      await act(async () => {
        vi.runAllTimers()
      })

      expect(result.current.records).toEqual(mockRecords)
      expect(result.current.loading).toBe(false)
    })

    it('should unsubscribe on unmount', () => {
      const { unmount } = renderHook(() => useRecords(mockPatientId))

      unmount()

      expect(mockUnsubscribe).toHaveBeenCalled()
    })
  })

  describe('addRecord', () => {
    it('should create a new record', async () => {
      vi.mocked(recordService.create).mockResolvedValue('new-record-id')

      const { result } = renderHook(() => useRecords(mockPatientId))

      const newRecord = {
        type: 'consultation' as const,
        content: { chief_complaint: 'Back pain' },
      }

      await act(async () => {
        const id = await result.current.addRecord(newRecord)
        expect(id).toBe('new-record-id')
      })

      expect(recordService.create).toHaveBeenCalledWith(
        mockClinicId,
        { ...newRecord, patientId: mockPatientId },
        mockUserProfile.displayName
      )
    })

    it('should throw error without clinic', async () => {
      vi.mocked(useClinicContext).mockReturnValue({
        clinicId: null,
        userProfile: null,
      } as unknown as ReturnType<typeof useClinicContext>)

      const { result } = renderHook(() => useRecords(mockPatientId))

      await expect(
        result.current.addRecord({
          type: 'consultation',
          content: {},
        })
      ).rejects.toThrow('No clinic selected')
    })

    it('should throw error without patient', async () => {
      const { result } = renderHook(() => useRecords(undefined))

      await expect(
        result.current.addRecord({
          type: 'consultation',
          content: {},
        })
      ).rejects.toThrow('No patient selected')
    })
  })

  describe('updateRecord', () => {
    it('should update a record', async () => {
      vi.mocked(recordService.update).mockResolvedValue()

      const { result } = renderHook(() => useRecords(mockPatientId))

      await act(async () => {
        await result.current.updateRecord(
          'record-1',
          { content: { chief_complaint: 'Updated complaint' } },
          'Updated diagnosis'
        )
      })

      expect(recordService.update).toHaveBeenCalledWith(
        mockClinicId,
        'record-1',
        { content: { chief_complaint: 'Updated complaint' } },
        mockUserProfile.displayName,
        'Updated diagnosis'
      )
    })

    it('should throw error without clinic', async () => {
      vi.mocked(useClinicContext).mockReturnValue({
        clinicId: null,
        userProfile: null,
      } as unknown as ReturnType<typeof useClinicContext>)

      const { result } = renderHook(() => useRecords(mockPatientId))

      await expect(result.current.updateRecord('record-1', { content: {} })).rejects.toThrow(
        'No clinic selected'
      )
    })
  })

  describe('deleteRecord', () => {
    it('should delete a record', async () => {
      vi.mocked(recordService.delete).mockResolvedValue()

      const { result } = renderHook(() => useRecords(mockPatientId))

      await act(async () => {
        await result.current.deleteRecord('record-1')
      })

      expect(recordService.delete).toHaveBeenCalledWith(mockClinicId, 'record-1')
    })

    it('should throw error without clinic', async () => {
      vi.mocked(useClinicContext).mockReturnValue({
        clinicId: null,
        userProfile: null,
      } as unknown as ReturnType<typeof useClinicContext>)

      const { result } = renderHook(() => useRecords(mockPatientId))

      await expect(result.current.deleteRecord('record-1')).rejects.toThrow('No clinic selected')
    })
  })

  describe('getVersionHistory', () => {
    it('should return version history', async () => {
      const mockVersions: RecordVersion[] = [
        {
          id: 'version-1',
          recordId: 'record-1',
          versionNumber: 1,
          content: { chief_complaint: 'Original' },
          updatedBy: 'Dr. Silva',
          changeReason: 'Initial',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'version-2',
          recordId: 'record-1',
          versionNumber: 2,
          content: { chief_complaint: 'Updated' },
          updatedBy: 'Dr. Silva',
          changeReason: 'Correction',
          createdAt: new Date().toISOString(),
        },
      ]
      vi.mocked(recordService.getVersionHistory).mockResolvedValue(mockVersions)

      const { result } = renderHook(() => useRecords(mockPatientId))

      await act(async () => {
        const versions = await result.current.getVersionHistory('record-1')
        expect(versions).toEqual(mockVersions)
      })

      expect(recordService.getVersionHistory).toHaveBeenCalledWith(mockClinicId, 'record-1')
    })

    it('should throw error without clinic', async () => {
      vi.mocked(useClinicContext).mockReturnValue({
        clinicId: null,
        userProfile: null,
      } as unknown as ReturnType<typeof useClinicContext>)

      const { result } = renderHook(() => useRecords(mockPatientId))

      await expect(result.current.getVersionHistory('record-1')).rejects.toThrow(
        'No clinic selected'
      )
    })
  })

  describe('restoreVersion', () => {
    it('should restore a version', async () => {
      vi.mocked(recordService.restoreVersion).mockResolvedValue(3)

      const { result } = renderHook(() => useRecords(mockPatientId))

      await act(async () => {
        const newVersion = await result.current.restoreVersion('record-1', 1)
        expect(newVersion).toBe(3)
      })

      expect(recordService.restoreVersion).toHaveBeenCalledWith(
        mockClinicId,
        'record-1',
        1,
        mockUserProfile.displayName
      )
    })

    it('should throw error without clinic', async () => {
      vi.mocked(useClinicContext).mockReturnValue({
        clinicId: null,
        userProfile: null,
      } as unknown as ReturnType<typeof useClinicContext>)

      const { result } = renderHook(() => useRecords(mockPatientId))

      await expect(result.current.restoreVersion('record-1', 1)).rejects.toThrow(
        'No clinic selected'
      )
    })
  })
})

describe('useAllRecords', () => {
  const mockClinicId = 'clinic-123'
  const mockUserProfile = {
    id: 'user-123',
    displayName: 'Dr. Silva',
  }
  let mockUnsubscribe: ReturnType<typeof vi.fn>

  const mockAllRecords: MedicalRecord[] = [
    {
      id: 'record-1',
      clinicId: mockClinicId,
      patientId: 'patient-1',
      type: 'consultation',
      content: {},
      professional: 'Dr. Silva',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
    },
    {
      id: 'record-2',
      clinicId: mockClinicId,
      patientId: 'patient-2',
      type: 'exam',
      content: {},
      professional: 'Dr. Santos',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    mockUnsubscribe = vi.fn()

    vi.mocked(useClinicContext).mockReturnValue({
      clinicId: mockClinicId,
      userProfile: mockUserProfile,
    } as ReturnType<typeof useClinicContext>)

    vi.mocked(recordService.subscribe).mockImplementation((_, onData) => {
      setTimeout(() => onData(mockAllRecords), 0)
      return mockUnsubscribe
    })
  })

  it('should subscribe to all records in clinic', () => {
    renderHook(() => useAllRecords())

    expect(recordService.subscribe).toHaveBeenCalledWith(mockClinicId, expect.any(Function))
  })

  it('should receive all records', async () => {
    vi.useFakeTimers()

    const { result } = renderHook(() => useAllRecords())

    await act(async () => {
      vi.runAllTimers()
    })

    expect(result.current.records).toEqual(mockAllRecords)
    expect(result.current.loading).toBe(false)

    vi.useRealTimers()
  })

  it('should not subscribe without clinicId', () => {
    vi.mocked(useClinicContext).mockReturnValue({
      clinicId: null,
      userProfile: null,
    } as unknown as ReturnType<typeof useClinicContext>)

    const { result } = renderHook(() => useAllRecords())

    expect(recordService.subscribe).not.toHaveBeenCalled()
    expect(result.current.records).toEqual([])
    expect(result.current.loading).toBe(false)
  })

  it('should create records without patientId in input', async () => {
    vi.mocked(recordService.create).mockResolvedValue('new-record-id')

    const { result } = renderHook(() => useAllRecords())

    const newRecord = {
      patientId: 'patient-1',
      type: 'consultation' as const,
      content: { chief_complaint: 'Test' },
    }

    await act(async () => {
      const id = await result.current.addRecord(newRecord)
      expect(id).toBe('new-record-id')
    })

    expect(recordService.create).toHaveBeenCalledWith(
      mockClinicId,
      newRecord,
      mockUserProfile.displayName
    )
  })
})
