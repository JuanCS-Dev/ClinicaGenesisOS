/**
 * Operadora Service
 *
 * Handles CRUD operations for health insurance operators (operadoras) in Firestore.
 * Operadoras are stored as subcollections under clinics for multi-tenancy.
 *
 * Collection: /clinics/{clinicId}/operadoras/{operadoraId}
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
  orderBy,
  where,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { OperadoraFirestore, CreateOperadoraInput } from '@/types';

/**
 * Get the operadoras collection reference for a clinic.
 */
function getOperadorasCollection(clinicId: string) {
  return collection(db, 'clinics', clinicId, 'operadoras');
}

/**
 * Converts Firestore document data to OperadoraFirestore type.
 */
function toOperadora(
  id: string,
  clinicId: string,
  data: Record<string, unknown>
): OperadoraFirestore {
  const createdAt =
    data.createdAt instanceof Timestamp
      ? data.createdAt.toDate().toISOString()
      : (data.createdAt as string) || new Date().toISOString();

  const updatedAt =
    data.updatedAt instanceof Timestamp
      ? data.updatedAt.toDate().toISOString()
      : (data.updatedAt as string) || new Date().toISOString();

  return {
    id,
    clinicId,
    registroANS: data.registroANS as string,
    nomeFantasia: data.nomeFantasia as string,
    razaoSocial: data.razaoSocial as string | undefined,
    cnpj: data.cnpj as string | undefined,
    codigoPrestador: data.codigoPrestador as string,
    tabelaPrecos: data.tabelaPrecos as OperadoraFirestore['tabelaPrecos'],
    ativa: data.ativa as boolean,
    configuracoes: data.configuracoes as OperadoraFirestore['configuracoes'],
    webservice: data.webservice as OperadoraFirestore['webservice'],
    contatos: data.contatos as OperadoraFirestore['contatos'],
    observacoes: data.observacoes as string | undefined,
    createdAt,
    updatedAt,
    createdBy: data.createdBy as string,
    updatedBy: data.updatedBy as string,
  };
}

/**
 * Operadora service for Firestore operations.
 */
export const operadoraService = {
  /**
   * Get all operadoras for a clinic.
   */
  async getAll(clinicId: string): Promise<OperadoraFirestore[]> {
    const operadorasRef = getOperadorasCollection(clinicId);
    const q = query(operadorasRef, orderBy('nomeFantasia', 'asc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((docSnap) =>
      toOperadora(docSnap.id, clinicId, docSnap.data())
    );
  },

  /**
   * Get only active operadoras for a clinic.
   */
  async getAtivas(clinicId: string): Promise<OperadoraFirestore[]> {
    const operadorasRef = getOperadorasCollection(clinicId);
    const q = query(
      operadorasRef,
      where('ativa', '==', true),
      orderBy('nomeFantasia', 'asc')
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((docSnap) =>
      toOperadora(docSnap.id, clinicId, docSnap.data())
    );
  },

  /**
   * Get an operadora by ID.
   */
  async getById(
    clinicId: string,
    operadoraId: string
  ): Promise<OperadoraFirestore | null> {
    const docRef = doc(db, 'clinics', clinicId, 'operadoras', operadoraId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return toOperadora(docSnap.id, clinicId, docSnap.data());
  },

  /**
   * Get an operadora by ANS registry number.
   */
  async getByRegistroANS(
    clinicId: string,
    registroANS: string
  ): Promise<OperadoraFirestore | null> {
    const operadorasRef = getOperadorasCollection(clinicId);
    const q = query(operadorasRef, where('registroANS', '==', registroANS));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const docSnap = querySnapshot.docs[0];
    return toOperadora(docSnap.id, clinicId, docSnap.data());
  },

  /**
   * Create a new operadora.
   */
  async create(
    clinicId: string,
    userId: string,
    data: CreateOperadoraInput
  ): Promise<string> {
    const operadorasRef = getOperadorasCollection(clinicId);

    const docData = {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: userId,
      updatedBy: userId,
    };

    const docRef = await addDoc(operadorasRef, docData);
    return docRef.id;
  },

  /**
   * Update an existing operadora.
   */
  async update(
    clinicId: string,
    operadoraId: string,
    userId: string,
    data: Partial<CreateOperadoraInput>
  ): Promise<void> {
    const docRef = doc(db, 'clinics', clinicId, 'operadoras', operadoraId);

    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    });
  },

  /**
   * Toggle operadora active status.
   */
  async toggleAtiva(
    clinicId: string,
    operadoraId: string,
    userId: string,
    ativa: boolean
  ): Promise<void> {
    const docRef = doc(db, 'clinics', clinicId, 'operadoras', operadoraId);

    await updateDoc(docRef, {
      ativa,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    });
  },

  /**
   * Delete an operadora.
   */
  async delete(clinicId: string, operadoraId: string): Promise<void> {
    const docRef = doc(db, 'clinics', clinicId, 'operadoras', operadoraId);
    await deleteDoc(docRef);
  },

  /**
   * Subscribe to real-time operadora updates.
   */
  subscribe(
    clinicId: string,
    onData: (operadoras: OperadoraFirestore[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe {
    const operadorasRef = getOperadorasCollection(clinicId);
    const q = query(operadorasRef, orderBy('nomeFantasia', 'asc'));

    return onSnapshot(
      q,
      (snapshot) => {
        const operadoras = snapshot.docs.map((docSnap) =>
          toOperadora(docSnap.id, clinicId, docSnap.data())
        );
        onData(operadoras);
      },
      (error) => {
        console.error('Error subscribing to operadoras:', error);
        onError?.(error);
      }
    );
  },

  /**
   * Subscribe to only active operadoras.
   */
  subscribeAtivas(
    clinicId: string,
    onData: (operadoras: OperadoraFirestore[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe {
    const operadorasRef = getOperadorasCollection(clinicId);
    const q = query(
      operadorasRef,
      where('ativa', '==', true),
      orderBy('nomeFantasia', 'asc')
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const operadoras = snapshot.docs.map((docSnap) =>
          toOperadora(docSnap.id, clinicId, docSnap.data())
        );
        onData(operadoras);
      },
      (error) => {
        console.error('Error subscribing to active operadoras:', error);
        onError?.(error);
      }
    );
  },
};
