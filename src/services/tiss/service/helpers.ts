/**
 * TISS Service Helpers
 *
 * Firestore collection references, document converters,
 * and utility functions for TISS operations.
 *
 * @module services/tiss/service/helpers
 */

import {
  collection,
  doc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/services/firebase';
import type {
  GuiaConsulta,
  GuiaSADT,
  GuiaFirestore,
  StatusGuia,
  TipoGuia,
} from '@/types';

/**
 * Get the guias collection reference for a clinic.
 */
export function getGuiasCollection(clinicId: string) {
  return collection(db, 'clinics', clinicId, 'guias');
}

/**
 * Get a guia document reference.
 */
export function getGuiaDoc(clinicId: string, guiaId: string) {
  return doc(db, 'clinics', clinicId, 'guias', guiaId);
}

/**
 * Convert Firestore document to GuiaFirestore.
 */
export function docToGuia(
  docSnap: { id: string; data: () => Record<string, unknown> }
): GuiaFirestore {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    clinicId: data.clinicId as string,
    patientId: data.patientId as string,
    appointmentId: data.appointmentId as string | undefined,
    tipo: data.tipo as TipoGuia,
    status: data.status as StatusGuia,
    numeroGuiaPrestador: data.numeroGuiaPrestador as string,
    numeroGuiaOperadora: data.numeroGuiaOperadora as string | undefined,
    registroANS: data.registroANS as string,
    nomeOperadora: data.nomeOperadora as string,
    dataAtendimento: data.dataAtendimento as string,
    valorTotal: data.valorTotal as number,
    valorGlosado: data.valorGlosado as number | undefined,
    valorPago: data.valorPago as number | undefined,
    xmlContent: data.xmlContent as string | undefined,
    dadosGuia: data.dadosGuia as GuiaConsulta | GuiaSADT,
    glosas: data.glosas as GuiaFirestore['glosas'],
    createdAt: data.createdAt instanceof Timestamp
      ? data.createdAt.toDate().toISOString()
      : (data.createdAt as string),
    updatedAt: data.updatedAt instanceof Timestamp
      ? data.updatedAt.toDate().toISOString()
      : (data.updatedAt as string),
    createdBy: data.createdBy as string,
    updatedBy: data.updatedBy as string,
  };
}

/**
 * Generate unique guia number for prestador.
 */
export function generateGuiaNumber(clinicId: string): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  const clinicPrefix = clinicId.substring(0, 4).toUpperCase();
  return `${clinicPrefix}-${timestamp}-${random}`;
}
