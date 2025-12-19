/**
 * Record Version Service
 *
 * Handles version history operations for medical records.
 * Supports retrieving version history, specific versions, and restoring.
 *
 * Version subcollection: /clinics/{clinicId}/records/{recordId}/versions/{versionId}
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
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { MedicalRecord, RecordVersion } from '@/types';

/**
 * Get the versions subcollection reference for a record.
 */
function getVersionsCollection(clinicId: string, recordId: string) {
  return collection(db, 'clinics', clinicId, 'records', recordId, 'versions');
}

/**
 * Record version service for Firestore operations.
 */
export const recordVersionService = {
  /**
   * Save current record state as a new version.
   *
   * @param clinicId - The clinic ID
   * @param recordId - The record ID
   * @param currentData - Current record data to save
   * @param currentVersion - Current version number
   * @param savedBy - Name of the professional
   * @param changeReason - Optional reason for the change
   */
  async saveVersion(
    clinicId: string,
    recordId: string,
    currentData: Record<string, unknown>,
    currentVersion: number,
    savedBy: string,
    changeReason?: string
  ): Promise<void> {
    const versionsRef = getVersionsCollection(clinicId, recordId);
    const versionData = {
      version: currentVersion,
      data: currentData,
      savedAt: serverTimestamp(),
      savedBy,
      changeReason,
    };
    await addDoc(versionsRef, versionData);
  },

  /**
   * Get version history for a record.
   *
   * @param clinicId - The clinic ID
   * @param recordId - The record ID
   * @returns Array of versions sorted by version number (descending)
   */
  async getHistory(clinicId: string, recordId: string): Promise<RecordVersion[]> {
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
  async restore(
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

    // Get current record state
    const docRef = doc(db, 'clinics', clinicId, 'records', recordId);
    const currentDoc = await getDoc(docRef);
    if (!currentDoc.exists()) {
      throw new Error('Record not found');
    }

    const currentData = currentDoc.data();
    const currentVersion = (currentData.version as number) || 1;

    // Save current state as a version
    await this.saveVersion(
      clinicId,
      recordId,
      currentData,
      currentVersion,
      restoredBy,
      `Restaurado da versão ${versionNumber}`
    );

    // Prepare restored data
    const { ...restoreData } = versionToRestore.data as Record<string, unknown>;
    const newVersion = currentVersion + 1;

    // Update record with restored data
    await updateDoc(docRef, {
      ...restoreData,
      version: newVersion,
      updatedAt: serverTimestamp(),
      updatedBy: restoredBy,
    });

    return newVersion;
  },
};
