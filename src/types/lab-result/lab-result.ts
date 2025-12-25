/**
 * Lab Result Types
 *
 * Types for laboratory exam results in the patient portal.
 * Supports PDF uploads and various exam categories.
 */

/** Exam type categories. */
export type LabExamType = 'hemograma' | 'bioquimica' | 'hormonal' | 'urina' | 'imagem' | 'outros'

/** Lab result status. */
export type LabResultStatus = 'pending' | 'ready' | 'viewed'

/** File type for uploaded results. */
export type LabFileType = 'pdf' | 'image'

/**
 * Lab result entity.
 *
 * Stored at: /clinics/{clinicId}/lab-results/{resultId}
 */
export interface LabResult {
  /** Unique identifier */
  id: string
  /** Patient ID reference */
  patientId: string
  /** Patient name (denormalized) */
  patientName: string
  /** Exam name/description */
  examName: string
  /** Exam category */
  examType: LabExamType
  /** Result status */
  status: LabResultStatus
  /** When the exam was requested (ISO date) */
  requestedAt: string
  /** When results were ready (ISO date) */
  completedAt?: string
  /** When patient viewed (ISO date) */
  viewedAt?: string
  /** URL to the result file (PDF/image) */
  fileUrl?: string
  /** Type of uploaded file */
  fileType?: LabFileType
  /** File name for download */
  fileName?: string
  /** File size in bytes */
  fileSize?: number
  /** Professional who requested the exam */
  requestedBy: string
  /** Professional name (denormalized) */
  requestedByName?: string
  /** Additional notes */
  notes?: string
  /** Clinic ID (for multi-tenancy) */
  clinicId: string
  /** Created timestamp */
  createdAt: string
  /** Updated timestamp */
  updatedAt: string
}

/**
 * Input for creating a new lab result.
 */
export type CreateLabResultInput = Omit<LabResult, 'id' | 'createdAt' | 'updatedAt' | 'viewedAt'>

/**
 * Input for updating a lab result.
 */
export type UpdateLabResultInput = Partial<Omit<LabResult, 'id' | 'clinicId' | 'createdAt'>>

/**
 * Filter options for querying lab results.
 */
export interface LabResultFilters {
  /** Filter by patient ID */
  patientId?: string
  /** Filter by exam type */
  examType?: LabExamType
  /** Filter by status */
  status?: LabResultStatus
  /** Filter by requesting professional */
  requestedBy?: string
  /** Start date for date range filter */
  startDate?: string
  /** End date for date range filter */
  endDate?: string
  /** Limit number of results */
  limitCount?: number
}
