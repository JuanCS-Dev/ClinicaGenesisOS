/**
 * Medical Record Service
 *
 * Handles CRUD operations for medical records in Firestore.
 * Records are polymorphic (SOAP, Prescription, etc.) and stored as
 * subcollections under clinics for multi-tenancy.
 *
 * Collection: /clinics/{clinicId}/records/{recordId}
 */

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import type {
  MedicalRecord,
  RecordType,
  SpecialtyType,
  CreateRecordInput,
  SoapRecord,
  TextRecord,
  PrescriptionRecord,
  ExamRequestRecord,
  PsychoSessionRecord,
  AnthropometryRecord,
  RecordVersion,
  RecordAttachment,
} from '@/types';

/**
 * Get the records collection reference for a clinic.
 */
function getRecordsCollection(clinicId: string) {
  return collection(db, 'clinics', clinicId, 'records');
}

/**
 * Get the versions subcollection reference for a record.
 */
function getVersionsCollection(clinicId: string, recordId: string) {
  return collection(db, 'clinics', clinicId, 'records', recordId, 'versions');
}

/**
 * Converts Firestore document data to MedicalRecord type.
 * Handles polymorphic record types and versioning fields.
 */
function toRecord(id: string, data: Record<string, unknown>): MedicalRecord {
  const baseRecord = {
    id,
    patientId: data.patientId as string,
    date:
      data.date instanceof Timestamp
        ? data.date.toDate().toISOString()
        : (data.date as string),
    professional: data.professional as string,
    type: data.type as RecordType,
    specialty: data.specialty as SpecialtyType,
    // Versioning fields
    version: (data.version as number) || 1,
    updatedAt: data.updatedAt instanceof Timestamp
      ? data.updatedAt.toDate().toISOString()
      : (data.updatedAt as string | undefined),
    updatedBy: data.updatedBy as string | undefined,
    // Attachments
    attachments: data.attachments as RecordAttachment[] | undefined,
  };

  switch (data.type as RecordType) {
    case 'soap':
      return {
        ...baseRecord,
        type: 'soap' as const,
        subjective: data.subjective as string,
        objective: data.objective as string,
        assessment: data.assessment as string,
        plan: data.plan as string,
      } as SoapRecord;

    case 'note':
      return {
        ...baseRecord,
        type: 'note' as const,
        title: data.title as string,
        content: data.content as string,
      } as TextRecord;

    case 'prescription':
      return {
        ...baseRecord,
        type: 'prescription' as const,
        medications: data.medications as PrescriptionRecord['medications'],
      } as PrescriptionRecord;

    case 'exam_request':
      return {
        ...baseRecord,
        type: 'exam_request' as const,
        exams: data.exams as string[],
        justification: data.justification as string,
      } as ExamRequestRecord;

    case 'psycho_session':
      return {
        ...baseRecord,
        type: 'psycho_session' as const,
        mood: data.mood as PsychoSessionRecord['mood'],
        summary: data.summary as string,
        privateNotes: data.privateNotes as string,
      } as PsychoSessionRecord;

    case 'anthropometry':
      return {
        ...baseRecord,
        type: 'anthropometry' as const,
        weight: data.weight as number,
        height: data.height as number,
        imc: data.imc as number,
        waist: data.waist as number,
        hip: data.hip as number,
      } as AnthropometryRecord;

    default:
      return {
        ...baseRecord,
        type: 'note' as const,
        title: 'Unknown Record',
        content: JSON.stringify(data),
      } as TextRecord;
  }
}

/**
 * Medical record service for Firestore operations.
 */
export const recordService = {
  /**
   * Get all records for a clinic.
   *
   * @param clinicId - The clinic ID
   * @returns Array of records sorted by date (descending)
   */
  async getAll(clinicId: string): Promise<MedicalRecord[]> {
    const recordsRef = getRecordsCollection(clinicId);
    const q = query(recordsRef, orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((docSnap) => toRecord(docSnap.id, docSnap.data()));
  },

  /**
   * Get records for a specific patient.
   *
   * @param clinicId - The clinic ID
   * @param patientId - The patient ID
   * @returns Array of records sorted by date (descending)
   */
  async getByPatient(clinicId: string, patientId: string): Promise<MedicalRecord[]> {
    const recordsRef = getRecordsCollection(clinicId);
    const q = query(
      recordsRef,
      where('patientId', '==', patientId),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((docSnap) => toRecord(docSnap.id, docSnap.data()));
  },

  /**
   * Get a record by ID.
   *
   * @param clinicId - The clinic ID
   * @param recordId - The record ID
   * @returns The record or null if not found
   */
  async getById(clinicId: string, recordId: string): Promise<MedicalRecord | null> {
    const docRef = doc(db, 'clinics', clinicId, 'records', recordId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return toRecord(docSnap.id, docSnap.data());
  },

  /**
   * Create a new medical record.
   *
   * @param clinicId - The clinic ID
   * @param data - The record data
   * @param professional - The name of the professional creating the record
   * @returns The created record ID
   */
  async create(
    clinicId: string,
    data: CreateRecordInput,
    professional: string
  ): Promise<string> {
    const recordsRef = getRecordsCollection(clinicId);

    const recordData = {
      ...data,
      professional,
      date: serverTimestamp(),
      version: 1, // Initial version
    };

    const docRef = await addDoc(recordsRef, recordData);

    return docRef.id;
  },

  /**
   * Update an existing record with versioning.
   * Saves current state to versions subcollection before applying changes.
   *
   * @param clinicId - The clinic ID
   * @param recordId - The record ID
   * @param data - The fields to update
   * @param updatedBy - Name of the professional making the update
   * @param changeReason - Optional reason for the change (for audit trail)
   */
  async update(
    clinicId: string,
    recordId: string,
    data: Partial<Omit<MedicalRecord, 'id' | 'date' | 'professional'>>,
    updatedBy?: string,
    changeReason?: string
  ): Promise<void> {
    const docRef = doc(db, 'clinics', clinicId, 'records', recordId);

    // Get current record state before update
    const currentDoc = await getDoc(docRef);
    if (!currentDoc.exists()) {
      throw new Error('Record not found');
    }

    const currentData = currentDoc.data();
    const currentVersion = (currentData.version as number) || 1;

    // Save current state to versions subcollection
    const versionsRef = getVersionsCollection(clinicId, recordId);
    const versionData = {
      version: currentVersion,
      data: currentData,
      savedAt: serverTimestamp(),
      savedBy: updatedBy || currentData.professional,
      changeReason,
    };
    await addDoc(versionsRef, versionData);

    // Prepare update data
    const updateData: Record<string, unknown> = { ...data };

    // Remove undefined values
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    // Add versioning metadata
    updateData.version = currentVersion + 1;
    updateData.updatedAt = serverTimestamp();
    if (updatedBy) {
      updateData.updatedBy = updatedBy;
    }

    await updateDoc(docRef, updateData);
  },

  /**
   * Delete a record.
   *
   * @param clinicId - The clinic ID
   * @param recordId - The record ID
   */
  async delete(clinicId: string, recordId: string): Promise<void> {
    const docRef = doc(db, 'clinics', clinicId, 'records', recordId);
    await deleteDoc(docRef);
  },

  /**
   * Subscribe to real-time updates for all records.
   *
   * @param clinicId - The clinic ID
   * @param callback - Function called with updated records array
   * @returns Unsubscribe function
   */
  subscribe(clinicId: string, callback: (records: MedicalRecord[]) => void): () => void {
    const recordsRef = getRecordsCollection(clinicId);
    const q = query(recordsRef, orderBy('date', 'desc'));

    return onSnapshot(
      q,
      (querySnapshot) => {
        const records = querySnapshot.docs.map((docSnap) =>
          toRecord(docSnap.id, docSnap.data())
        );
        callback(records);
      },
      (error) => {
        console.error('Error subscribing to records:', error);
        callback([]);
      }
    );
  },

  /**
   * Subscribe to real-time updates for a patient's records.
   *
   * @param clinicId - The clinic ID
   * @param patientId - The patient ID
   * @param callback - Function called with updated records array
   * @returns Unsubscribe function
   */
  subscribeByPatient(
    clinicId: string,
    patientId: string,
    callback: (records: MedicalRecord[]) => void
  ): () => void {
    const recordsRef = getRecordsCollection(clinicId);
    const q = query(
      recordsRef,
      where('patientId', '==', patientId),
      orderBy('date', 'desc')
    );

    return onSnapshot(
      q,
      (querySnapshot) => {
        const records = querySnapshot.docs.map((docSnap) =>
          toRecord(docSnap.id, docSnap.data())
        );
        callback(records);
      },
      (error) => {
        console.error('Error subscribing to patient records:', error);
        callback([]);
      }
    );
  },

  /**
   * Get records of a specific type for a patient.
   *
   * @param clinicId - The clinic ID
   * @param patientId - The patient ID
   * @param recordType - The type of records to fetch
   * @returns Array of records of the specified type
   */
  async getByPatientAndType(
    clinicId: string,
    patientId: string,
    recordType: RecordType
  ): Promise<MedicalRecord[]> {
    const recordsRef = getRecordsCollection(clinicId);
    const q = query(
      recordsRef,
      where('patientId', '==', patientId),
      where('type', '==', recordType),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((docSnap) => toRecord(docSnap.id, docSnap.data()));
  },

  // --- ATTACHMENT METHODS ---

  /**
   * Add an attachment to a record.
   *
   * @param clinicId - The clinic ID
   * @param recordId - The record ID
   * @param attachment - The attachment metadata
   */
  async addAttachment(
    clinicId: string,
    recordId: string,
    attachment: RecordAttachment
  ): Promise<void> {
    const docRef = doc(db, 'clinics', clinicId, 'records', recordId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error('Record not found');
    }

    const currentData = docSnap.data();
    const currentAttachments = (currentData.attachments as RecordAttachment[]) || [];

    await updateDoc(docRef, {
      attachments: [...currentAttachments, attachment],
    });
  },

  /**
   * Remove an attachment from a record.
   *
   * @param clinicId - The clinic ID
   * @param recordId - The record ID
   * @param attachmentId - The attachment ID to remove
   */
  async removeAttachment(
    clinicId: string,
    recordId: string,
    attachmentId: string
  ): Promise<void> {
    const docRef = doc(db, 'clinics', clinicId, 'records', recordId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error('Record not found');
    }

    const currentData = docSnap.data();
    const currentAttachments = (currentData.attachments as RecordAttachment[]) || [];
    const updatedAttachments = currentAttachments.filter((a) => a.id !== attachmentId);

    await updateDoc(docRef, {
      attachments: updatedAttachments,
    });
  },

  // --- VERSION HISTORY METHODS ---

  /**
   * Get version history for a record.
   *
   * @param clinicId - The clinic ID
   * @param recordId - The record ID
   * @returns Array of versions sorted by version number (descending)
   */
  async getVersionHistory(
    clinicId: string,
    recordId: string
  ): Promise<RecordVersion[]> {
    const versionsRef = getVersionsCollection(clinicId, recordId);
    const q = query(versionsRef, orderBy('version', 'desc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        version: data.version as number,
        data: data.data as Omit<MedicalRecord, 'id'>,
        savedAt:
          data.savedAt instanceof Timestamp
            ? data.savedAt.toDate().toISOString()
            : (data.savedAt as string),
        savedBy: data.savedBy as string,
        changeReason: data.changeReason as string | undefined,
      };
    });
  },

  /**
   * Get a specific version of a record.
   *
   * @param clinicId - The clinic ID
   * @param recordId - The record ID
   * @param versionNumber - The version number to retrieve
   * @returns The version data or null if not found
   */
  async getVersion(
    clinicId: string,
    recordId: string,
    versionNumber: number
  ): Promise<RecordVersion | null> {
    const versionsRef = getVersionsCollection(clinicId, recordId);
    const q = query(versionsRef, where('version', '==', versionNumber));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const docSnap = querySnapshot.docs[0];
    const data = docSnap.data();

    return {
      id: docSnap.id,
      version: data.version as number,
      data: data.data as Omit<MedicalRecord, 'id'>,
      savedAt:
        data.savedAt instanceof Timestamp
          ? data.savedAt.toDate().toISOString()
          : (data.savedAt as string),
      savedBy: data.savedBy as string,
      changeReason: data.changeReason as string | undefined,
    };
  },

  /**
   * Restore a record to a previous version.
   *
   * @param clinicId - The clinic ID
   * @param recordId - The record ID
   * @param versionNumber - The version number to restore
   * @param restoredBy - Name of the professional restoring the version
   * @returns The new version number
   */
  async restoreVersion(
    clinicId: string,
    recordId: string,
    versionNumber: number,
    restoredBy: string
  ): Promise<number> {
    // Get the version to restore
    const versionToRestore = await this.getVersion(clinicId, recordId, versionNumber);
    if (!versionToRestore) {
      throw new Error(`Version ${versionNumber} not found`);
    }

    // Get current record to save as new version
    const currentRecord = await this.getById(clinicId, recordId);
    if (!currentRecord) {
      throw new Error('Record not found');
    }

    // Update record with restored data (this will save current state to versions)
    const { id: _id, ...restoreData } = versionToRestore.data as MedicalRecord;
    await this.update(
      clinicId,
      recordId,
      restoreData,
      restoredBy,
      `Restaurado da versão ${versionNumber}`
    );

    return currentRecord.version + 1;
  },
};
