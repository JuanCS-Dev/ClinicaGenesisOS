/**
 * useLabResults Hook
 *
 * Provides real-time access to lab results with filtering options.
 * Includes CRUD operations and file upload capabilities.
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { usePatientPortal } from '@/contexts/PatientPortalContext'
import { useClinicContext } from '@/contexts/ClinicContext'
import { labResultService } from '@/services/firestore'
import type {
  LabResult,
  CreateLabResultInput,
  UpdateLabResultInput,
  LabResultFilters,
  LabExamType,
  LabResultStatus,
} from '@/types'

/**
 * Return type for useLabResults hook.
 */
export interface UseLabResultsReturn {
  /** Array of lab results */
  results: LabResult[]
  /** Pending results */
  pendingResults: LabResult[]
  /** Ready results (not yet viewed) */
  readyResults: LabResult[]
  /** Loading state */
  loading: boolean
  /** Error state */
  error: Error | null
  /** Create a new lab result */
  addResult: (data: CreateLabResultInput) => Promise<string>
  /** Update a lab result */
  updateResult: (id: string, data: UpdateLabResultInput) => Promise<void>
  /** Update result status */
  updateStatus: (id: string, status: LabResultStatus) => Promise<void>
  /** Upload file for a result */
  uploadFile: (
    id: string,
    file: File
  ) => Promise<{ fileUrl: string; fileName: string; fileSize: number }>
  /** Delete a lab result */
  deleteResult: (id: string) => Promise<void>
  /** Mark result as viewed */
  markAsViewed: (id: string) => Promise<void>
  /** Set filters */
  setFilters: (filters: LabResultFilters) => void
  /** Clear filters */
  clearFilters: () => void
  /** Get results by exam type */
  getByType: (type: LabExamType) => LabResult[]
}

/**
 * Hook for managing lab results with real-time updates.
 * Uses PatientPortalContext for patient-scoped access.
 *
 * @param initialFilters - Optional initial filter settings
 * @returns Lab results data and operations
 *
 * @example
 * const { results, pendingResults, markAsViewed } = useLabResults();
 */
export function useLabResults(initialFilters: LabResultFilters = {}): UseLabResultsReturn {
  const { patientId, clinicId } = usePatientPortal()

  const [results, setResults] = useState<LabResult[]>([])
  const [error, setError] = useState<Error | null>(null)
  const [filters, setFilters] = useState<LabResultFilters>(initialFilters)
  const [hasReceived, setHasReceived] = useState(false)

  // Subscribe to real-time updates
  useEffect(() => {
    if (!clinicId || !patientId) {
      setResults([])
      setHasReceived(true)
      return
    }

    let isActive = true

    const handleData = (data: LabResult[]) => {
      if (isActive) {
        // Apply client-side filters
        let filtered = data
        if (filters.examType) {
          filtered = filtered.filter(r => r.examType === filters.examType)
        }
        if (filters.status) {
          filtered = filtered.filter(r => r.status === filters.status)
        }
        setResults(filtered)
        setHasReceived(true)
        setError(null)
      }
    }

    const unsubscribe = labResultService.subscribeByPatient(clinicId, patientId, handleData)

    return () => {
      isActive = false
      unsubscribe()
    }
  }, [clinicId, patientId, filters.examType, filters.status])

  // Derived states
  const effectiveResults = useMemo(
    () => (clinicId && patientId ? results : []),
    [clinicId, patientId, results]
  )

  const pendingResults = useMemo(
    () => effectiveResults.filter(r => r.status === 'pending'),
    [effectiveResults]
  )

  const readyResults = useMemo(
    () => effectiveResults.filter(r => r.status === 'ready'),
    [effectiveResults]
  )

  const loading = !hasReceived && Boolean(clinicId && patientId)

  /**
   * Get results filtered by exam type.
   */
  const getByType = useCallback(
    (type: LabExamType): LabResult[] => {
      return effectiveResults.filter(r => r.examType === type)
    },
    [effectiveResults]
  )

  /**
   * Create a new lab result.
   */
  const addResult = useCallback(
    async (data: CreateLabResultInput): Promise<string> => {
      if (!clinicId) {
        throw new Error('No clinic selected')
      }
      return labResultService.create(clinicId, data)
    },
    [clinicId]
  )

  /**
   * Update a lab result.
   */
  const updateResult = useCallback(
    async (id: string, data: UpdateLabResultInput): Promise<void> => {
      if (!clinicId) {
        throw new Error('No clinic selected')
      }
      await labResultService.update(clinicId, id, data)
    },
    [clinicId]
  )

  /**
   * Update result status.
   */
  const updateStatus = useCallback(
    async (id: string, status: LabResultStatus): Promise<void> => {
      if (!clinicId) {
        throw new Error('No clinic selected')
      }
      await labResultService.updateStatus(clinicId, id, status)
    },
    [clinicId]
  )

  /**
   * Upload file for a result.
   */
  const uploadFile = useCallback(
    async (
      id: string,
      file: File
    ): Promise<{ fileUrl: string; fileName: string; fileSize: number }> => {
      if (!clinicId) {
        throw new Error('No clinic selected')
      }
      return labResultService.uploadFile(clinicId, id, file)
    },
    [clinicId]
  )

  /**
   * Delete a lab result.
   */
  const deleteResult = useCallback(
    async (id: string): Promise<void> => {
      if (!clinicId) {
        throw new Error('No clinic selected')
      }
      await labResultService.delete(clinicId, id)
    },
    [clinicId]
  )

  /**
   * Mark result as viewed.
   */
  const markAsViewed = useCallback(
    async (id: string): Promise<void> => {
      if (!clinicId) {
        throw new Error('No clinic selected')
      }
      await labResultService.markAsViewed(clinicId, id)
    },
    [clinicId]
  )

  /**
   * Clear all filters.
   */
  const clearFilters = useCallback(() => {
    setFilters({})
  }, [])

  return {
    results: effectiveResults,
    pendingResults,
    readyResults,
    loading,
    error,
    addResult,
    updateResult,
    updateStatus,
    uploadFile,
    deleteResult,
    markAsViewed,
    setFilters,
    clearFilters,
    getByType,
  }
}

/**
 * Hook for clinic-side lab results management.
 * Uses ClinicContext instead of PatientPortalContext.
 */
export function useClinicLabResults(initialFilters: LabResultFilters = {}) {
  const { clinicId } = useClinicContext()

  const [results, setResults] = useState<LabResult[]>([])
  const [error, setError] = useState<Error | null>(null)
  const [filters, setFilters] = useState<LabResultFilters>(initialFilters)
  const [hasReceived, setHasReceived] = useState(false)

  useEffect(() => {
    if (!clinicId) {
      setResults([])
      setHasReceived(true)
      return
    }

    let isActive = true

    const handleData = (data: LabResult[]) => {
      if (isActive) {
        setResults(data)
        setHasReceived(true)
        setError(null)
      }
    }

    const unsubscribe = labResultService.subscribe(clinicId, handleData)

    return () => {
      isActive = false
      unsubscribe()
    }
  }, [clinicId])

  const loading = !hasReceived && Boolean(clinicId)

  const addResult = useCallback(
    async (data: CreateLabResultInput): Promise<string> => {
      if (!clinicId) throw new Error('No clinic selected')
      return labResultService.create(clinicId, data)
    },
    [clinicId]
  )

  const uploadFile = useCallback(
    async (
      id: string,
      file: File
    ): Promise<{ fileUrl: string; fileName: string; fileSize: number }> => {
      if (!clinicId) throw new Error('No clinic selected')
      return labResultService.uploadFile(clinicId, id, file)
    },
    [clinicId]
  )

  return {
    results,
    loading,
    error,
    addResult,
    uploadFile,
    setFilters,
  }
}
