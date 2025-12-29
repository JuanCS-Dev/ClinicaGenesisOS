/**
 * useLabResults Hook Tests
 *
 * Tests for the lab results hook.
 *
 * @module __tests__/hooks/useLabResults
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useLabResults, useClinicLabResults } from '../../hooks/useLabResults'
import { labResultService } from '../../services/firestore'
import { usePatientPortal } from '../../contexts/PatientPortalContext'
import { useClinicContext } from '../../contexts/ClinicContext'
import type { LabResult } from '@/types'

vi.mock('../../contexts/PatientPortalContext', () => ({
  usePatientPortal: vi.fn(),
}))

vi.mock('../../contexts/ClinicContext', () => ({
  useClinicContext: vi.fn(),
}))

vi.mock('../../services/firestore', () => ({
  labResultService: {
    subscribeByPatient: vi.fn(),
    subscribe: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateStatus: vi.fn(),
    uploadFile: vi.fn(),
    delete: vi.fn(),
    markAsViewed: vi.fn(),
  },
}))

describe('useLabResults', () => {
  const mockClinicId = 'clinic-123'
  const mockPatientId = 'patient-456'
  let mockUnsubscribe: ReturnType<typeof vi.fn>

  const mockResults: LabResult[] = [
    {
      id: 'result-1',
      clinicId: mockClinicId,
      patientId: mockPatientId,
      patientName: 'John Doe',
      examType: 'blood',
      examName: 'Hemograma Completo',
      status: 'ready',
      requestedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'result-2',
      clinicId: mockClinicId,
      patientId: mockPatientId,
      patientName: 'John Doe',
      examType: 'imaging',
      examName: 'Raio-X',
      status: 'pending',
      requestedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    mockUnsubscribe = vi.fn()

    vi.mocked(usePatientPortal).mockReturnValue({
      patientId: mockPatientId,
      clinicId: mockClinicId,
    } as ReturnType<typeof usePatientPortal>)

    vi.mocked(useClinicContext).mockReturnValue({
      clinicId: mockClinicId,
    } as ReturnType<typeof useClinicContext>)

    vi.mocked(labResultService.subscribeByPatient).mockImplementation((_, __, onData) => {
      setTimeout(() => onData(mockResults), 0)
      return mockUnsubscribe
    })

    vi.mocked(labResultService.subscribe).mockImplementation((_, onData) => {
      setTimeout(() => onData(mockResults), 0)
      return mockUnsubscribe
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('initialization', () => {
    it('should initialize with empty results', () => {
      vi.mocked(labResultService.subscribeByPatient).mockReturnValue(mockUnsubscribe)

      const { result } = renderHook(() => useLabResults())

      expect(result.current.results).toEqual([])
      expect(result.current.loading).toBe(true)
    })

    it('should not subscribe without clinicId', () => {
      vi.mocked(usePatientPortal).mockReturnValue({
        patientId: mockPatientId,
        clinicId: null,
      } as unknown as ReturnType<typeof usePatientPortal>)

      renderHook(() => useLabResults())

      expect(labResultService.subscribeByPatient).not.toHaveBeenCalled()
    })

    it('should not subscribe without patientId', () => {
      vi.mocked(usePatientPortal).mockReturnValue({
        patientId: null,
        clinicId: mockClinicId,
      } as unknown as ReturnType<typeof usePatientPortal>)

      renderHook(() => useLabResults())

      expect(labResultService.subscribeByPatient).not.toHaveBeenCalled()
    })
  })

  describe('subscription', () => {
    it('should subscribe to lab results', () => {
      renderHook(() => useLabResults())

      expect(labResultService.subscribeByPatient).toHaveBeenCalledWith(
        mockClinicId,
        mockPatientId,
        expect.any(Function)
      )
    })

    it('should unsubscribe on unmount', () => {
      const { unmount } = renderHook(() => useLabResults())

      unmount()

      expect(mockUnsubscribe).toHaveBeenCalled()
    })

    it('should receive results from subscription', async () => {
      vi.useFakeTimers()

      const { result } = renderHook(() => useLabResults())

      await act(async () => {
        vi.runAllTimers()
      })

      expect(result.current.results.length).toBe(2)
      expect(result.current.loading).toBe(false)
    })
  })

  describe('derived states', () => {
    it('should compute pending results', async () => {
      vi.useFakeTimers()

      const { result } = renderHook(() => useLabResults())

      await act(async () => {
        vi.runAllTimers()
      })

      expect(result.current.pendingResults.length).toBe(1)
      expect(result.current.pendingResults[0].status).toBe('pending')
    })

    it('should compute ready results', async () => {
      vi.useFakeTimers()

      const { result } = renderHook(() => useLabResults())

      await act(async () => {
        vi.runAllTimers()
      })

      expect(result.current.readyResults.length).toBe(1)
      expect(result.current.readyResults[0].status).toBe('ready')
    })
  })

  describe('filtering', () => {
    it('should filter by exam type', async () => {
      vi.useFakeTimers()

      const { result } = renderHook(() => useLabResults({ examType: 'blood' }))

      await act(async () => {
        vi.runAllTimers()
      })

      expect(result.current.results.every(r => r.examType === 'blood')).toBe(true)
    })

    it('should filter by status', async () => {
      vi.useFakeTimers()

      const { result } = renderHook(() => useLabResults({ status: 'pending' }))

      await act(async () => {
        vi.runAllTimers()
      })

      expect(result.current.results.every(r => r.status === 'pending')).toBe(true)
    })

    it('should get results by type', async () => {
      vi.useFakeTimers()

      const { result } = renderHook(() => useLabResults())

      await act(async () => {
        vi.runAllTimers()
      })

      const bloodResults = result.current.getByType('blood')
      expect(bloodResults.length).toBe(1)
      expect(bloodResults[0].examType).toBe('blood')
    })

    it('should clear filters', async () => {
      vi.useFakeTimers()

      const { result } = renderHook(() => useLabResults({ status: 'pending' }))

      await act(async () => {
        vi.runAllTimers()
      })

      act(() => {
        result.current.clearFilters()
      })

      // Filters cleared, subscription will re-fetch
      expect(result.current.results).toBeDefined()
    })
  })

  describe('CRUD operations', () => {
    it('should add result', async () => {
      vi.mocked(labResultService.create).mockResolvedValue('new-result-id')

      const { result } = renderHook(() => useLabResults())

      const newResult = {
        patientId: mockPatientId,
        patientName: 'John Doe',
        examType: 'blood' as const,
        examName: 'New Exam',
        status: 'pending' as const,
        requestedAt: new Date().toISOString(),
      }

      await act(async () => {
        const id = await result.current.addResult(newResult)
        expect(id).toBe('new-result-id')
      })

      expect(labResultService.create).toHaveBeenCalledWith(mockClinicId, newResult)
    })

    it('should throw error when adding without clinic', async () => {
      vi.mocked(usePatientPortal).mockReturnValue({
        patientId: mockPatientId,
        clinicId: null,
      } as unknown as ReturnType<typeof usePatientPortal>)

      const { result } = renderHook(() => useLabResults())

      await expect(
        result.current.addResult({
          patientId: mockPatientId,
          patientName: 'Test',
          examType: 'blood',
          examName: 'Test',
          status: 'pending',
          requestedAt: new Date().toISOString(),
        })
      ).rejects.toThrow('No clinic selected')
    })

    it('should update result', async () => {
      vi.mocked(labResultService.update).mockResolvedValue()

      const { result } = renderHook(() => useLabResults())

      await act(async () => {
        await result.current.updateResult('result-1', { examName: 'Updated' })
      })

      expect(labResultService.update).toHaveBeenCalledWith(mockClinicId, 'result-1', {
        examName: 'Updated',
      })
    })

    it('should update status', async () => {
      vi.mocked(labResultService.updateStatus).mockResolvedValue()

      const { result } = renderHook(() => useLabResults())

      await act(async () => {
        await result.current.updateStatus('result-1', 'ready')
      })

      expect(labResultService.updateStatus).toHaveBeenCalledWith(mockClinicId, 'result-1', 'ready')
    })

    it('should upload file', async () => {
      const mockUploadResult = {
        fileUrl: 'https://example.com/file.pdf',
        fileName: 'result.pdf',
        fileSize: 1024,
      }
      vi.mocked(labResultService.uploadFile).mockResolvedValue(mockUploadResult)

      const { result } = renderHook(() => useLabResults())

      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })

      await act(async () => {
        const uploadResult = await result.current.uploadFile('result-1', file)
        expect(uploadResult).toEqual(mockUploadResult)
      })
    })

    it('should delete result', async () => {
      vi.mocked(labResultService.delete).mockResolvedValue()

      const { result } = renderHook(() => useLabResults())

      await act(async () => {
        await result.current.deleteResult('result-1')
      })

      expect(labResultService.delete).toHaveBeenCalledWith(mockClinicId, 'result-1')
    })

    it('should mark as viewed', async () => {
      vi.mocked(labResultService.markAsViewed).mockResolvedValue()

      const { result } = renderHook(() => useLabResults())

      await act(async () => {
        await result.current.markAsViewed('result-1')
      })

      expect(labResultService.markAsViewed).toHaveBeenCalledWith(mockClinicId, 'result-1')
    })
  })
})

describe('useClinicLabResults', () => {
  const mockClinicId = 'clinic-123'
  let mockUnsubscribe: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
    mockUnsubscribe = vi.fn()

    vi.mocked(useClinicContext).mockReturnValue({
      clinicId: mockClinicId,
    } as ReturnType<typeof useClinicContext>)

    vi.mocked(labResultService.subscribe).mockImplementation((_, onData) => {
      setTimeout(() => onData([]), 0)
      return mockUnsubscribe
    })
  })

  it('should subscribe using clinic context', () => {
    renderHook(() => useClinicLabResults())

    expect(labResultService.subscribe).toHaveBeenCalledWith(mockClinicId, expect.any(Function))
  })

  it('should not subscribe without clinicId', () => {
    vi.mocked(useClinicContext).mockReturnValue({
      clinicId: null,
    } as unknown as ReturnType<typeof useClinicContext>)

    renderHook(() => useClinicLabResults())

    expect(labResultService.subscribe).not.toHaveBeenCalled()
  })
})
