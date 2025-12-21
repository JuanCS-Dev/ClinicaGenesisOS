/**
 * Digital Prescription Service
 *
 * Handles CRUD operations for digital prescriptions in Firestore.
 * Supports Memed integration for medication database and digital signing.
 * Prescriptions are stored as subcollections under clinics for multi-tenancy.
 *
 * Collection: /clinics/{clinicId}/prescriptions/{prescriptionId}
 * Logs: /clinics/{clinicId}/prescriptions/{prescriptionId}/logs/{logId}
 */

import {
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  limit,
} from 'firebase/firestore';
import type {
  Prescription,
  PrescriptionStatus,
  CreatePrescriptionInput,
  UpdatePrescriptionInput,
  PrescriptionLogEntry,
} from '@/types';
import {
  getPrescriptionCollection,
  getLogsCollection,
  getPrescriptionDoc,
  generateValidationCode,
  calculateExpirationDate,
  toPrescription,
  toLogEntry,
  determinePrescriptionType,
  statusToEventType,
} from './prescription.utils';

/**
 * Digital Prescription service for Firestore operations.
 */
export const prescriptionService = {
  /**
   * Get all prescriptions for a clinic.
   *
   * @param clinicId - The clinic ID
   * @param options - Optional filters
   * @returns Array of prescriptions sorted by date (descending)
   */
  async getAll(
    clinicId: string,
    options?: {
      patientId?: string;
      professionalId?: string;
      status?: PrescriptionStatus;
      limitCount?: number;
    }
  ): Promise<Prescription[]> {
    const prescriptionsRef = getPrescriptionCollection(clinicId);
    let q = query(prescriptionsRef, orderBy('prescribedAt', 'desc'));

    if (options?.patientId) {
      q = query(q, where('patientId', '==', options.patientId));
    }
    if (options?.professionalId) {
      q = query(q, where('professionalId', '==', options.professionalId));
    }
    if (options?.status) {
      q = query(q, where('status', '==', options.status));
    }
    if (options?.limitCount) {
      q = query(q, limit(options.limitCount));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((docSnap) => toPrescription(docSnap.id, docSnap.data()));
  },

  /**
   * Get prescriptions for a specific patient.
   */
  async getByPatient(clinicId: string, patientId: string): Promise<Prescription[]> {
    return this.getAll(clinicId, { patientId });
  },

  /**
   * Get a prescription by ID.
   */
  async getById(clinicId: string, prescriptionId: string): Promise<Prescription | null> {
    const docRef = getPrescriptionDoc(clinicId, prescriptionId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    return toPrescription(docSnap.id, docSnap.data());
  },

  /**
   * Get prescription by validation code.
   */
  async getByValidationCode(
    clinicId: string,
    validationCode: string
  ): Promise<Prescription | null> {
    const prescriptionsRef = getPrescriptionCollection(clinicId);
    const q = query(prescriptionsRef, where('validationCode', '==', validationCode), limit(1));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;
    const docSnap = querySnapshot.docs[0];
    return toPrescription(docSnap.id, docSnap.data());
  },

  /**
   * Create a new prescription.
   */
  async create(
    clinicId: string,
    data: CreatePrescriptionInput,
    professional: { id: string; name: string; crm: string; crmState: string }
  ): Promise<string> {
    const prescriptionsRef = getPrescriptionCollection(clinicId);
    const prescribedAt = new Date().toISOString();
    const type = data.type || determinePrescriptionType(data.medications);
    const expiresAt = calculateExpirationDate(prescribedAt, type);
    const validationCode = generateValidationCode();

    const prescriptionData = {
      clinicId,
      patientId: data.patientId,
      patientName: data.patientName,
      patientCpf: data.patientCpf || null,
      professionalId: professional.id,
      professionalName: professional.name,
      professionalCrm: professional.crm,
      professionalCrmState: professional.crmState,
      type,
      status: 'draft' as PrescriptionStatus,
      medications: data.medications,
      observations: data.observations || null,
      validityDays: data.validityDays || 60,
      prescribedAt,
      expiresAt,
      validationCode,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(prescriptionsRef, prescriptionData);

    await this.addLog(clinicId, docRef.id, {
      prescriptionId: docRef.id,
      eventType: 'created',
      userId: professional.id,
      userName: professional.name,
      details: { medicationCount: data.medications.length },
    });

    return docRef.id;
  },

  /**
   * Update a prescription (only drafts can be updated).
   */
  async update(
    clinicId: string,
    prescriptionId: string,
    data: UpdatePrescriptionInput,
    userId: string,
    userName: string
  ): Promise<void> {
    const prescription = await this.getById(clinicId, prescriptionId);
    if (!prescription) throw new Error('Prescription not found');
    if (prescription.status !== 'draft') {
      throw new Error('Only draft prescriptions can be updated');
    }

    const docRef = getPrescriptionDoc(clinicId, prescriptionId);
    await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });

    await this.addLog(clinicId, prescriptionId, {
      prescriptionId,
      eventType: 'updated',
      userId,
      userName,
      details: { fields: Object.keys(data) },
    });
  },

  /**
   * Update prescription status with automatic timestamps.
   */
  async updateStatus(
    clinicId: string,
    prescriptionId: string,
    status: PrescriptionStatus,
    userId: string,
    userName: string,
    additionalData?: Partial<Prescription>
  ): Promise<void> {
    const docRef = getPrescriptionDoc(clinicId, prescriptionId);
    const updateData: Record<string, unknown> = {
      status,
      updatedAt: serverTimestamp(),
      ...additionalData,
    };

    if (status === 'sent' && !additionalData?.sentAt) {
      updateData.sentAt = new Date().toISOString();
    }
    if (status === 'viewed' && !additionalData?.viewedAt) {
      updateData.viewedAt = new Date().toISOString();
    }
    if (status === 'filled' && !additionalData?.filledAt) {
      updateData.filledAt = new Date().toISOString();
    }

    await updateDoc(docRef, updateData);

    await this.addLog(clinicId, prescriptionId, {
      prescriptionId,
      eventType: statusToEventType(status),
      userId,
      userName,
      details: additionalData,
    });
  },

  /**
   * Sign a prescription with digital certificate.
   */
  async sign(
    clinicId: string,
    prescriptionId: string,
    signature: NonNullable<Prescription['signature']>,
    userId: string,
    userName: string
  ): Promise<void> {
    const prescription = await this.getById(clinicId, prescriptionId);
    if (!prescription) throw new Error('Prescription not found');
    if (prescription.status !== 'draft' && prescription.status !== 'pending_signature') {
      throw new Error('Prescription cannot be signed in current status');
    }
    await this.updateStatus(clinicId, prescriptionId, 'signed', userId, userName, { signature });
  },

  /**
   * Send prescription to patient.
   */
  async sendToPatient(
    clinicId: string,
    prescriptionId: string,
    method: 'email' | 'sms' | 'whatsapp',
    userId: string,
    userName: string
  ): Promise<void> {
    const prescription = await this.getById(clinicId, prescriptionId);
    if (!prescription) throw new Error('Prescription not found');
    if (prescription.status !== 'signed') {
      throw new Error('Only signed prescriptions can be sent');
    }

    await this.updateStatus(clinicId, prescriptionId, 'sent', userId, userName);
    await this.addLog(clinicId, prescriptionId, {
      prescriptionId,
      eventType: 'sent',
      userId,
      userName,
      details: { method },
    });
  },

  /**
   * Mark prescription as viewed by patient.
   */
  async markAsViewed(clinicId: string, prescriptionId: string): Promise<void> {
    const prescription = await this.getById(clinicId, prescriptionId);
    if (!prescription) throw new Error('Prescription not found');
    if (prescription.status === 'sent') {
      await this.updateStatus(clinicId, prescriptionId, 'viewed', 'patient', 'Paciente');
    }
  },

  /**
   * Mark prescription as filled by pharmacy.
   */
  async markAsFilled(
    clinicId: string,
    prescriptionId: string,
    pharmacyName: string
  ): Promise<void> {
    const prescription = await this.getById(clinicId, prescriptionId);
    if (!prescription) throw new Error('Prescription not found');
    if (!['sent', 'viewed'].includes(prescription.status)) {
      throw new Error('Prescription cannot be marked as filled in current status');
    }
    await this.updateStatus(clinicId, prescriptionId, 'filled', 'pharmacy', pharmacyName, {
      filledByPharmacy: pharmacyName,
    });
  },

  /**
   * Cancel a prescription.
   */
  async cancel(
    clinicId: string,
    prescriptionId: string,
    reason: string,
    userId: string,
    userName: string
  ): Promise<void> {
    const prescription = await this.getById(clinicId, prescriptionId);
    if (!prescription) throw new Error('Prescription not found');
    if (prescription.status === 'filled') {
      throw new Error('Filled prescriptions cannot be canceled');
    }

    await this.updateStatus(clinicId, prescriptionId, 'canceled', userId, userName);
    await this.addLog(clinicId, prescriptionId, {
      prescriptionId,
      eventType: 'canceled',
      userId,
      userName,
      details: { reason },
    });
  },

  /**
   * Check and update expired prescriptions.
   */
  async checkExpiredPrescriptions(clinicId: string): Promise<number> {
    const prescriptionsRef = getPrescriptionCollection(clinicId);
    const now = new Date().toISOString();
    const q = query(
      prescriptionsRef,
      where('status', 'in', ['signed', 'sent', 'viewed']),
      where('expiresAt', '<', now)
    );

    const querySnapshot = await getDocs(q);
    let count = 0;

    for (const docSnap of querySnapshot.docs) {
      const docRef = getPrescriptionDoc(clinicId, docSnap.id);
      await updateDoc(docRef, { status: 'expired', updatedAt: serverTimestamp() });
      await this.addLog(clinicId, docSnap.id, {
        prescriptionId: docSnap.id,
        eventType: 'expired',
        userId: 'system',
        userName: 'Sistema',
      });
      count++;
    }
    return count;
  },

  /**
   * Add a log entry for audit purposes.
   */
  async addLog(
    clinicId: string,
    prescriptionId: string,
    log: Omit<PrescriptionLogEntry, 'id' | 'timestamp'>
  ): Promise<string> {
    const logsRef = getLogsCollection(clinicId, prescriptionId);
    const docRef = await addDoc(logsRef, { ...log, timestamp: serverTimestamp() });
    return docRef.id;
  },

  /**
   * Get all logs for a prescription.
   */
  async getLogs(clinicId: string, prescriptionId: string): Promise<PrescriptionLogEntry[]> {
    const logsRef = getLogsCollection(clinicId, prescriptionId);
    const q = query(logsRef, orderBy('timestamp', 'asc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((docSnap) => toLogEntry(docSnap.id, docSnap.data()));
  },

  /**
   * Subscribe to real-time updates for a prescription.
   */
  subscribe(
    clinicId: string,
    prescriptionId: string,
    callback: (prescription: Prescription | null) => void
  ): () => void {
    const docRef = getPrescriptionDoc(clinicId, prescriptionId);
    return onSnapshot(
      docRef,
      (docSnap) => {
        callback(docSnap.exists() ? toPrescription(docSnap.id, docSnap.data()) : null);
      },
      (error) => {
        console.error('Error subscribing to prescription:', error);
        callback(null);
      }
    );
  },

  /**
   * Subscribe to prescriptions for a patient.
   */
  subscribeByPatient(
    clinicId: string,
    patientId: string,
    callback: (prescriptions: Prescription[]) => void
  ): () => void {
    const prescriptionsRef = getPrescriptionCollection(clinicId);
    const q = query(
      prescriptionsRef,
      where('patientId', '==', patientId),
      orderBy('prescribedAt', 'desc')
    );

    return onSnapshot(
      q,
      (querySnapshot) => {
        callback(querySnapshot.docs.map((docSnap) => toPrescription(docSnap.id, docSnap.data())));
      },
      (error) => {
        console.error('Error subscribing to patient prescriptions:', error);
        callback([]);
      }
    );
  },

  /**
   * Get prescription statistics for a clinic.
   */
  async getStatistics(
    clinicId: string,
    startDate: string,
    endDate: string
  ): Promise<{
    total: number;
    byStatus: Record<PrescriptionStatus, number>;
    byType: Record<string, number>;
    controlled: number;
  }> {
    const prescriptionsRef = getPrescriptionCollection(clinicId);
    const q = query(
      prescriptionsRef,
      where('prescribedAt', '>=', startDate),
      where('prescribedAt', '<=', endDate)
    );

    const querySnapshot = await getDocs(q);
    const prescriptions = querySnapshot.docs.map((d) => toPrescription(d.id, d.data()));

    const byStatus: Record<string, number> = {};
    const byType: Record<string, number> = {};
    let controlled = 0;

    for (const p of prescriptions) {
      byStatus[p.status] = (byStatus[p.status] || 0) + 1;
      byType[p.type] = (byType[p.type] || 0) + 1;
      if (p.type !== 'common') controlled++;
    }

    return {
      total: prescriptions.length,
      byStatus: byStatus as Record<PrescriptionStatus, number>,
      byType,
      controlled,
    };
  },
};
