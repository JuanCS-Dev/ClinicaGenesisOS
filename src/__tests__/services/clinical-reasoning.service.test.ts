/**
 * Clinical Reasoning Service Tests
 *
 * Tests for the lab analysis AI service.
 *
 * @module __tests__/services/clinical-reasoning
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { clinicalReasoningService } from '../../services/clinical-reasoning.service'
import type { LabAnalysisSession, PatientContext, RawLabResult } from '@/types'

// Mock Firebase
vi.mock('../../services/firebase', () => ({
  db: {},
  storage: {},
}))

// Mock Firestore
const mockUnsubscribe = vi.fn()

vi.mock('firebase/firestore', () => {
  // Create a proper mock Timestamp class inside the factory
  class MockTimestamp {
    seconds: number
    nanoseconds: number

    constructor(seconds: number, nanoseconds: number) {
      this.seconds = seconds
      this.nanoseconds = nanoseconds
    }

    toDate() {
      return new Date(this.seconds * 1000)
    }

    static now() {
      return new MockTimestamp(Date.now() / 1000, 0)
    }
  }

  return {
    collection: vi.fn(() => 'collection-ref'),
    doc: vi.fn(() => 'doc-ref'),
    getDocs: vi.fn(),
    getDoc: vi.fn(),
    addDoc: vi.fn(),
    updateDoc: vi.fn(),
    query: vi.fn(() => 'query-ref'),
    where: vi.fn(),
    orderBy: vi.fn(),
    onSnapshot: vi.fn(() => vi.fn()), // Returns unsubscribe function
    Timestamp: MockTimestamp,
    limit: vi.fn(),
  }
})

// Mock Firebase Storage
vi.mock('firebase/storage', () => ({
  ref: vi.fn(() => 'storage-ref'),
  uploadBytes: vi.fn(),
  getDownloadURL: vi.fn(),
}))

describe('clinicalReasoningService', () => {
  const mockClinicId = 'clinic-123'
  const mockPatientId = 'patient-456'
  const mockPhysicianId = 'physician-789'
  const mockSessionId = 'session-abc'

  const mockPatientContext: PatientContext = {
    age: 45,
    sex: 'male',
    conditions: ['hypertension'],
    medications: ['losartan'],
    allergies: [],
  }

  const mockLabResults: RawLabResult[] = [
    {
      name: 'Hemoglobin',
      value: '14.5',
      unit: 'g/dL',
      referenceRange: '13.5-17.5',
    },
    {
      name: 'Glucose',
      value: '110',
      unit: 'mg/dL',
      referenceRange: '70-100',
    },
  ]

  const mockSession: LabAnalysisSession = {
    id: mockSessionId,
    clinicId: mockClinicId,
    patientId: mockPatientId,
    physicianId: mockPhysicianId,
    status: 'ready',
    patientContext: mockPatientContext,
    labResults: mockLabResults,
    source: 'manual',
    createdAt: new Date().toISOString(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getSession', () => {
    it('should return session when found', async () => {
      const { getDoc, Timestamp } = await import('firebase/firestore')
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        id: mockSessionId,
        data: () => ({
          ...mockSession,
          createdAt: new Timestamp(Date.now() / 1000, 0),
        }),
      } as ReturnType<typeof getDoc> extends Promise<infer T> ? T : never)

      const result = await clinicalReasoningService.getSession(mockClinicId, mockSessionId)

      expect(result).toBeDefined()
      expect(result?.id).toBe(mockSessionId)
      expect(result?.patientId).toBe(mockPatientId)
    })

    it('should return null when session not found', async () => {
      const { getDoc } = await import('firebase/firestore')
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
      } as ReturnType<typeof getDoc> extends Promise<infer T> ? T : never)

      const result = await clinicalReasoningService.getSession(mockClinicId, mockSessionId)

      expect(result).toBeNull()
    })
  })

  describe('getByPatient', () => {
    it('should return sessions for patient', async () => {
      const { getDocs } = await import('firebase/firestore')
      vi.mocked(getDocs).mockResolvedValue({
        docs: [
          {
            id: 'session-1',
            data: () => ({ ...mockSession, id: 'session-1', createdAt: new Date().toISOString() }),
          },
          {
            id: 'session-2',
            data: () => ({ ...mockSession, id: 'session-2', createdAt: new Date().toISOString() }),
          },
        ],
      } as ReturnType<typeof getDocs> extends Promise<infer T> ? T : never)

      const results = await clinicalReasoningService.getByPatient(mockClinicId, mockPatientId)

      expect(results).toHaveLength(2)
      expect(results[0].id).toBe('session-1')
    })
  })

  describe('getLatestByPatient', () => {
    it('should return latest session', async () => {
      const { getDocs } = await import('firebase/firestore')
      vi.mocked(getDocs).mockResolvedValue({
        empty: false,
        docs: [
          {
            id: mockSessionId,
            data: () => ({ ...mockSession, createdAt: new Date().toISOString() }),
          },
        ],
      } as ReturnType<typeof getDocs> extends Promise<infer T> ? T : never)

      const result = await clinicalReasoningService.getLatestByPatient(mockClinicId, mockPatientId)

      expect(result).toBeDefined()
      expect(result?.id).toBe(mockSessionId)
    })

    it('should return null when no sessions exist', async () => {
      const { getDocs } = await import('firebase/firestore')
      vi.mocked(getDocs).mockResolvedValue({
        empty: true,
        docs: [],
      } as ReturnType<typeof getDocs> extends Promise<infer T> ? T : never)

      const result = await clinicalReasoningService.getLatestByPatient(mockClinicId, mockPatientId)

      expect(result).toBeNull()
    })
  })

  describe('analyzeManual', () => {
    it('should create manual analysis session', async () => {
      const { addDoc } = await import('firebase/firestore')
      vi.mocked(addDoc).mockResolvedValue({ id: 'new-session-id' } as ReturnType<
        typeof addDoc
      > extends Promise<infer T>
        ? T
        : never)

      const input = {
        patientId: mockPatientId,
        patientContext: mockPatientContext,
        labResults: mockLabResults,
        source: 'manual' as const,
      }

      const sessionId = await clinicalReasoningService.analyzeManual(
        mockClinicId,
        input,
        mockPhysicianId
      )

      expect(sessionId).toBe('new-session-id')
      expect(addDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          clinicId: mockClinicId,
          patientId: mockPatientId,
          physicianId: mockPhysicianId,
          status: 'processing',
          source: 'manual',
        })
      )
    })
  })

  describe('uploadAndAnalyze', () => {
    it('should upload file and create session', async () => {
      const { addDoc } = await import('firebase/firestore')
      const { uploadBytes } = await import('firebase/storage')

      vi.mocked(addDoc).mockResolvedValue({ id: 'upload-session-id' } as ReturnType<
        typeof addDoc
      > extends Promise<infer T>
        ? T
        : never)
      vi.mocked(uploadBytes).mockResolvedValue(
        {} as ReturnType<typeof uploadBytes> extends Promise<infer T> ? T : never
      )

      const mockFile = new File(['test content'], 'lab-results.pdf', {
        type: 'application/pdf',
      })

      const sessionId = await clinicalReasoningService.uploadAndAnalyze(
        mockClinicId,
        mockPatientId,
        mockPhysicianId,
        mockFile,
        mockPatientContext
      )

      expect(sessionId).toBe('upload-session-id')
      expect(uploadBytes).toHaveBeenCalledWith(
        expect.anything(),
        mockFile,
        expect.objectContaining({
          contentType: 'application/pdf',
        })
      )
    })

    it('should reject invalid file types', async () => {
      const mockFile = new File(['test'], 'document.txt', {
        type: 'text/plain',
      })

      await expect(
        clinicalReasoningService.uploadAndAnalyze(
          mockClinicId,
          mockPatientId,
          mockPhysicianId,
          mockFile,
          mockPatientContext
        )
      ).rejects.toThrow('Tipo de arquivo inválido')
    })

    it('should reject files that are too large', async () => {
      // Create a mock file that's larger than 15MB
      const largeContent = new ArrayBuffer(16 * 1024 * 1024) // 16MB
      const mockFile = new File([largeContent], 'large.pdf', {
        type: 'application/pdf',
      })

      await expect(
        clinicalReasoningService.uploadAndAnalyze(
          mockClinicId,
          mockPatientId,
          mockPhysicianId,
          mockFile,
          mockPatientContext
        )
      ).rejects.toThrow('Arquivo muito grande')
    })

    it('should accept valid image types', async () => {
      const { addDoc } = await import('firebase/firestore')
      const { uploadBytes } = await import('firebase/storage')

      vi.mocked(addDoc).mockResolvedValue({ id: 'image-session-id' } as ReturnType<
        typeof addDoc
      > extends Promise<infer T>
        ? T
        : never)
      vi.mocked(uploadBytes).mockResolvedValue(
        {} as ReturnType<typeof uploadBytes> extends Promise<infer T> ? T : never
      )

      const mockFile = new File(['test'], 'lab.jpg', { type: 'image/jpeg' })

      const sessionId = await clinicalReasoningService.uploadAndAnalyze(
        mockClinicId,
        mockPatientId,
        mockPhysicianId,
        mockFile,
        mockPatientContext
      )

      expect(sessionId).toBe('image-session-id')
    })
  })

  describe('subscribeToSession', () => {
    it('should subscribe to session updates', async () => {
      const { onSnapshot } = await import('firebase/firestore')

      const callback = vi.fn()
      const unsubscribe = clinicalReasoningService.subscribeToSession(
        mockClinicId,
        mockSessionId,
        callback
      )

      expect(onSnapshot).toHaveBeenCalled()
      expect(typeof unsubscribe).toBe('function')
    })

    it('should call callback with session data', async () => {
      const { onSnapshot } = await import('firebase/firestore')

      vi.mocked(onSnapshot).mockImplementation((_, callback) => {
        if (typeof callback === 'function') {
          callback({
            exists: () => true,
            id: mockSessionId,
            data: () => ({ ...mockSession, createdAt: new Date().toISOString() }),
          } as never)
        }
        return mockUnsubscribe
      })

      const callback = vi.fn()
      clinicalReasoningService.subscribeToSession(mockClinicId, mockSessionId, callback)

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          id: mockSessionId,
        })
      )
    })

    it('should call callback with null when session not found', async () => {
      const { onSnapshot } = await import('firebase/firestore')

      vi.mocked(onSnapshot).mockImplementation((_, callback) => {
        if (typeof callback === 'function') {
          callback({
            exists: () => false,
          } as never)
        }
        return mockUnsubscribe
      })

      const callback = vi.fn()
      clinicalReasoningService.subscribeToSession(mockClinicId, mockSessionId, callback)

      expect(callback).toHaveBeenCalledWith(null)
    })
  })

  describe('subscribeByPatient', () => {
    it('should subscribe to patient sessions', async () => {
      const { onSnapshot } = await import('firebase/firestore')

      // Mock onSnapshot to not call callback immediately
      vi.mocked(onSnapshot).mockReturnValue(vi.fn())

      const callback = vi.fn()
      const unsubscribe = clinicalReasoningService.subscribeByPatient(
        mockClinicId,
        mockPatientId,
        callback
      )

      expect(onSnapshot).toHaveBeenCalled()
      expect(typeof unsubscribe).toBe('function')
    })
  })

  describe('getDocumentUrl', () => {
    it('should return download URL for storage path', async () => {
      const { getDownloadURL } = await import('firebase/storage')
      vi.mocked(getDownloadURL).mockResolvedValue('https://storage.example.com/document.pdf')

      const url = await clinicalReasoningService.getDocumentUrl('clinics/123/documents/test.pdf')

      expect(url).toBe('https://storage.example.com/document.pdf')
      expect(getDownloadURL).toHaveBeenCalled()
    })
  })

  describe('markReviewed', () => {
    it('should mark session as reviewed', async () => {
      const { updateDoc } = await import('firebase/firestore')
      vi.mocked(updateDoc).mockResolvedValue(undefined)

      await clinicalReasoningService.markReviewed(mockClinicId, mockSessionId, 'helpful')

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          reviewed: true,
          feedback: 'helpful',
        })
      )
    })

    it('should mark reviewed without feedback', async () => {
      const { updateDoc } = await import('firebase/firestore')
      vi.mocked(updateDoc).mockResolvedValue(undefined)

      await clinicalReasoningService.markReviewed(mockClinicId, mockSessionId)

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          reviewed: true,
          feedback: undefined,
        })
      )
    })
  })
})
