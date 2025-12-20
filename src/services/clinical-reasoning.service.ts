/**
 * Clinical Reasoning Service
 * ==========================
 *
 * Handles lab analysis sessions with the Clinical Reasoning Engine.
 * Creates sessions that trigger the Cloud Function for AI analysis.
 *
 * Collection: /clinics/{clinicId}/labAnalysisSessions/{sessionId}
 */

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
  onSnapshot,
  Timestamp,
  limit,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import type {
  LabAnalysisSession,
  LabAnalysisResult,
  CreateLabAnalysisInput,
  PatientContext,
  RawLabResult,
  LabAnalysisStatus,
} from '@/types';

/**
 * Get the lab analysis sessions collection reference for a clinic.
 */
function getSessionsCollection(clinicId: string) {
  return collection(db, 'clinics', clinicId, 'labAnalysisSessions');
}

/**
 * Converts Firestore document to LabAnalysisSession.
 */
function toSession(
  id: string,
  data: Record<string, unknown>
): LabAnalysisSession {
  return {
    id,
    clinicId: data.clinicId as string,
    patientId: data.patientId as string,
    physicianId: data.physicianId as string,
    status: data.status as LabAnalysisStatus,
    patientContext: data.patientContext as PatientContext,
    labResults: data.labResults as RawLabResult[],
    source: data.source as 'ocr' | 'manual' | 'hl7',
    documentUrl: data.documentUrl as string | undefined,
    result: data.result as LabAnalysisResult | undefined,
    validated: data.validated as boolean | undefined,
    error: data.error as string | undefined,
    createdAt:
      data.createdAt instanceof Timestamp
        ? data.createdAt.toDate().toISOString()
        : (data.createdAt as string),
    completedAt: data.completedAt as string | undefined,
  };
}

/**
 * Maximum file size for lab documents (15MB).
 */
const LAB_DOCUMENT_MAX_SIZE = 15 * 1024 * 1024;

/**
 * Allowed MIME types for lab documents.
 */
const LAB_DOCUMENT_ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
];

/**
 * Validate a lab document file before upload.
 */
function validateLabDocument(file: File): void {
  if (!LAB_DOCUMENT_ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Tipo de arquivo inválido. Use JPG, PNG, WebP ou PDF.');
  }

  if (file.size > LAB_DOCUMENT_MAX_SIZE) {
    throw new Error('Arquivo muito grande. Máximo 15MB.');
  }
}

/**
 * Clinical Reasoning Service for lab analysis operations.
 */
export const clinicalReasoningService = {
  /**
   * Upload a lab document and create an analysis session.
   * This triggers the Cloud Function to process with OCR + AI.
   *
   * @param clinicId - The clinic ID
   * @param patientId - The patient ID
   * @param physicianId - The requesting physician ID
   * @param file - The lab document file (image or PDF)
   * @param patientContext - Patient context for analysis
   * @returns The created session ID
   */
  async uploadAndAnalyze(
    clinicId: string,
    patientId: string,
    physicianId: string,
    file: File,
    patientContext: PatientContext
  ): Promise<string> {
    // Validate file
    validateLabDocument(file);

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop() || 'bin';
    const filename = `lab_${timestamp}.${extension}`;
    const storagePath = `clinics/${clinicId}/labDocuments/${patientId}/${filename}`;

    // Upload to Storage
    const storageRef = ref(storage, storagePath);
    await uploadBytes(storageRef, file, {
      contentType: file.type,
      customMetadata: {
        originalName: file.name,
        uploadedBy: physicianId,
      },
    });

    // Get storage URL (path, not download URL - Cloud Function can access directly)
    const documentUrl = storagePath;

    // Create session document (triggers Cloud Function)
    const sessionsRef = getSessionsCollection(clinicId);
    const sessionData = {
      clinicId,
      patientId,
      physicianId,
      status: 'uploading' as LabAnalysisStatus,
      patientContext,
      labResults: [], // Will be populated by OCR
      source: 'ocr' as const,
      documentUrl,
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(sessionsRef, sessionData);

    return docRef.id;
  },

  /**
   * Create an analysis session with manually entered lab results.
   * This triggers the Cloud Function for AI analysis (no OCR needed).
   *
   * @param clinicId - The clinic ID
   * @param input - The analysis input with lab results
   * @param physicianId - The requesting physician ID
   * @returns The created session ID
   */
  async analyzeManual(
    clinicId: string,
    input: CreateLabAnalysisInput,
    physicianId: string
  ): Promise<string> {
    const sessionsRef = getSessionsCollection(clinicId);

    const sessionData = {
      clinicId,
      patientId: input.patientId,
      physicianId,
      status: 'processing' as LabAnalysisStatus,
      patientContext: input.patientContext,
      labResults: input.labResults,
      source: input.source,
      documentUrl: input.documentUrl,
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(sessionsRef, sessionData);

    return docRef.id;
  },

  /**
   * Get a lab analysis session by ID.
   *
   * @param clinicId - The clinic ID
   * @param sessionId - The session ID
   * @returns The session or null if not found
   */
  async getSession(
    clinicId: string,
    sessionId: string
  ): Promise<LabAnalysisSession | null> {
    const docRef = doc(db, 'clinics', clinicId, 'labAnalysisSessions', sessionId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return toSession(docSnap.id, docSnap.data());
  },

  /**
   * Get all lab analysis sessions for a patient.
   *
   * @param clinicId - The clinic ID
   * @param patientId - The patient ID
   * @returns Array of sessions sorted by date (descending)
   */
  async getByPatient(
    clinicId: string,
    patientId: string
  ): Promise<LabAnalysisSession[]> {
    const sessionsRef = getSessionsCollection(clinicId);
    const q = query(
      sessionsRef,
      where('patientId', '==', patientId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((docSnap) =>
      toSession(docSnap.id, docSnap.data())
    );
  },

  /**
   * Get the latest analysis for a patient.
   *
   * @param clinicId - The clinic ID
   * @param patientId - The patient ID
   * @returns The latest session or null
   */
  async getLatestByPatient(
    clinicId: string,
    patientId: string
  ): Promise<LabAnalysisSession | null> {
    const sessionsRef = getSessionsCollection(clinicId);
    const q = query(
      sessionsRef,
      where('patientId', '==', patientId),
      where('status', '==', 'ready'),
      orderBy('createdAt', 'desc'),
      limit(1)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const docSnap = querySnapshot.docs[0];
    return toSession(docSnap.id, docSnap.data());
  },

  /**
   * Subscribe to real-time updates for a session.
   * Useful for showing processing progress.
   *
   * @param clinicId - The clinic ID
   * @param sessionId - The session ID
   * @param callback - Function called with updated session
   * @returns Unsubscribe function
   */
  subscribeToSession(
    clinicId: string,
    sessionId: string,
    callback: (session: LabAnalysisSession | null) => void
  ): () => void {
    const docRef = doc(db, 'clinics', clinicId, 'labAnalysisSessions', sessionId);

    return onSnapshot(
      docRef,
      (docSnap) => {
        if (!docSnap.exists()) {
          callback(null);
          return;
        }
        callback(toSession(docSnap.id, docSnap.data()));
      },
      (error) => {
        console.error('Error subscribing to session:', error);
        callback(null);
      }
    );
  },

  /**
   * Subscribe to patient's analysis sessions.
   *
   * @param clinicId - The clinic ID
   * @param patientId - The patient ID
   * @param callback - Function called with updated sessions
   * @returns Unsubscribe function
   */
  subscribeByPatient(
    clinicId: string,
    patientId: string,
    callback: (sessions: LabAnalysisSession[]) => void
  ): () => void {
    const sessionsRef = getSessionsCollection(clinicId);
    const q = query(
      sessionsRef,
      where('patientId', '==', patientId),
      orderBy('createdAt', 'desc'),
      limit(10)
    );

    return onSnapshot(
      q,
      (querySnapshot) => {
        const sessions = querySnapshot.docs.map((docSnap) =>
          toSession(docSnap.id, docSnap.data())
        );
        callback(sessions);
      },
      (error) => {
        console.error('Error subscribing to patient sessions:', error);
        callback([]);
      }
    );
  },

  /**
   * Get the download URL for a lab document.
   *
   * @param storagePath - The storage path
   * @returns The download URL
   */
  async getDocumentUrl(storagePath: string): Promise<string> {
    const storageRef = ref(storage, storagePath);
    return getDownloadURL(storageRef);
  },

  /**
   * Mark analysis as reviewed by physician.
   *
   * @param clinicId - The clinic ID
   * @param sessionId - The session ID
   * @param feedback - Optional feedback
   */
  async markReviewed(
    clinicId: string,
    sessionId: string,
    feedback?: 'helpful' | 'not_helpful' | 'incorrect'
  ): Promise<void> {
    const docRef = doc(db, 'clinics', clinicId, 'labAnalysisSessions', sessionId);

    await updateDoc(docRef, {
      reviewed: true,
      reviewedAt: new Date().toISOString(),
      feedback,
    });
  },
};
