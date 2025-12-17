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
} from '@/types';

/**
 * Get the records collection reference for a clinic.
 */
function getRecordsCollection(clinicId: string) {
  return collection(db, 'clinics', clinicId, 'records');
}

/**
 * Converts Firestore document data to MedicalRecord type.
 * Handles polymorphic record types.
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
    };

    const docRef = await addDoc(recordsRef, recordData);

    return docRef.id;
  },

  /**
   * Update an existing record.
   *
   * @param clinicId - The clinic ID
   * @param recordId - The record ID
   * @param data - The fields to update
   */
  async update(
    clinicId: string,
    recordId: string,
    data: Partial<Omit<MedicalRecord, 'id' | 'date' | 'professional'>>
  ): Promise<void> {
    const docRef = doc(db, 'clinics', clinicId, 'records', recordId);

    const updateData: Record<string, unknown> = { ...data };

    // Remove undefined values
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

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
};
