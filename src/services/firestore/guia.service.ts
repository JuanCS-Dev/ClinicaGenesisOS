/**
 * Guia Service
 *
 * Handles CRUD operations for TISS guides (guias) in Firestore.
 * Guias are stored as subcollections under clinics for multi-tenancy.
 *
 * Collection: /clinics/{clinicId}/guias/{guiaId}
 */

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  orderBy,
  where,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  limit,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '../firebase'
import type { GuiaFirestore, StatusGuia, TipoGuia } from '@/types'
import { auditHelper, type AuditUserContext } from './lgpd/audit-helper'

function buildAuditContext(clinicId: string, userId: string): AuditUserContext {
  return { clinicId, userId, userName: userId }
}

/**
 * Get the guias collection reference for a clinic.
 */
function getGuiasCollection(clinicId: string) {
  return collection(db, 'clinics', clinicId, 'guias')
}

/**
 * Converts Firestore document data to GuiaFirestore type.
 */
function toGuia(id: string, clinicId: string, data: Record<string, unknown>): GuiaFirestore {
  const createdAt =
    data.createdAt instanceof Timestamp
      ? data.createdAt.toDate().toISOString()
      : (data.createdAt as string) || new Date().toISOString()

  const updatedAt =
    data.updatedAt instanceof Timestamp
      ? data.updatedAt.toDate().toISOString()
      : (data.updatedAt as string) || new Date().toISOString()

  return {
    id,
    clinicId,
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
    dadosGuia: data.dadosGuia as GuiaFirestore['dadosGuia'],
    glosas: data.glosas as GuiaFirestore['glosas'],
    createdAt,
    updatedAt,
    createdBy: data.createdBy as string,
    updatedBy: data.updatedBy as string,
  }
}

/**
 * Generate unique guia number for the clinic.
 */
async function generateGuiaNumber(clinicId: string): Promise<string> {
  const year = new Date().getFullYear()
  const month = String(new Date().getMonth() + 1).padStart(2, '0')
  const prefix = `${year}${month}`

  const guiasRef = getGuiasCollection(clinicId)
  const q = query(
    guiasRef,
    where('numeroGuiaPrestador', '>=', prefix),
    where('numeroGuiaPrestador', '<', `${prefix}Z`),
    orderBy('numeroGuiaPrestador', 'desc'),
    limit(1)
  )

  const snapshot = await getDocs(q)

  if (snapshot.empty) {
    return `${prefix}0001`
  }

  const lastNumber = snapshot.docs[0].data().numeroGuiaPrestador as string
  const sequence = parseInt(lastNumber.slice(-4), 10) + 1
  return `${prefix}${String(sequence).padStart(4, '0')}`
}

type CreateGuiaInput = Omit<
  GuiaFirestore,
  'id' | 'clinicId' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'numeroGuiaPrestador'
>

/**
 * Guia service for Firestore operations.
 */
export const guiaService = {
  /**
   * Get all guias for a clinic.
   */
  async getAll(clinicId: string): Promise<GuiaFirestore[]> {
    const guiasRef = getGuiasCollection(clinicId)
    const q = query(guiasRef, orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map(docSnap => toGuia(docSnap.id, clinicId, docSnap.data()))
  },

  /**
   * Get guias by status.
   */
  async getByStatus(clinicId: string, status: StatusGuia): Promise<GuiaFirestore[]> {
    const guiasRef = getGuiasCollection(clinicId)
    const q = query(guiasRef, where('status', '==', status), orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map(docSnap => toGuia(docSnap.id, clinicId, docSnap.data()))
  },

  /**
   * Get guias by patient.
   */
  async getByPatient(clinicId: string, patientId: string): Promise<GuiaFirestore[]> {
    const guiasRef = getGuiasCollection(clinicId)
    const q = query(guiasRef, where('patientId', '==', patientId), orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map(docSnap => toGuia(docSnap.id, clinicId, docSnap.data()))
  },

  /**
   * Get guias by operadora (ANS registry).
   */
  async getByOperadora(clinicId: string, registroANS: string): Promise<GuiaFirestore[]> {
    const guiasRef = getGuiasCollection(clinicId)
    const q = query(guiasRef, where('registroANS', '==', registroANS), orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map(docSnap => toGuia(docSnap.id, clinicId, docSnap.data()))
  },

  /**
   * Get a guia by ID.
   */
  async getById(clinicId: string, guiaId: string): Promise<GuiaFirestore | null> {
    const docRef = doc(db, 'clinics', clinicId, 'guias', guiaId)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      return null
    }

    return toGuia(docSnap.id, clinicId, docSnap.data())
  },

  /**
   * Create a new guia.
   */
  async create(clinicId: string, userId: string, data: CreateGuiaInput): Promise<string> {
    const guiasRef = getGuiasCollection(clinicId)
    const numeroGuiaPrestador = await generateGuiaNumber(clinicId)

    const docData = {
      ...data,
      numeroGuiaPrestador,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: userId,
      updatedBy: userId,
    }

    const docRef = await addDoc(guiasRef, docData)

    // LGPD audit: Guia creation (financial/insurance data)
    await auditHelper.logCreate(buildAuditContext(clinicId, userId), 'guia', docRef.id, {
      tipo: data.tipo,
      patientId: data.patientId,
      valorTotal: data.valorTotal,
    })

    return docRef.id
  },

  /**
   * Update guia status.
   */
  async updateStatus(
    clinicId: string,
    guiaId: string,
    userId: string,
    status: StatusGuia
  ): Promise<void> {
    const docRef = doc(db, 'clinics', clinicId, 'guias', guiaId)

    // Get previous status for audit
    const guia = await this.getById(clinicId, guiaId)
    const previousStatus = guia?.status

    await updateDoc(docRef, {
      status,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    })

    // LGPD audit: Status change
    await auditHelper.logUpdate(
      buildAuditContext(clinicId, userId),
      'guia',
      guiaId,
      { status: previousStatus },
      { status }
    )
  },

  /**
   * Update guia with operadora response.
   */
  async updateOperadoraResponse(
    clinicId: string,
    guiaId: string,
    userId: string,
    data: {
      numeroGuiaOperadora?: string
      status: StatusGuia
      valorGlosado?: number
      valorPago?: number
    }
  ): Promise<void> {
    const docRef = doc(db, 'clinics', clinicId, 'guias', guiaId)

    // Get previous values for audit
    const guia = await this.getById(clinicId, guiaId)

    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    })

    // LGPD audit: Operadora response (financial data)
    await auditHelper.logUpdate(
      buildAuditContext(clinicId, userId),
      'guia',
      guiaId,
      { status: guia?.status, valorGlosado: guia?.valorGlosado, valorPago: guia?.valorPago },
      data
    )
  },

  /**
   * Subscribe to real-time guia updates.
   */
  subscribe(
    clinicId: string,
    onData: (guias: GuiaFirestore[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe {
    const guiasRef = getGuiasCollection(clinicId)
    const q = query(guiasRef, orderBy('createdAt', 'desc'))

    return onSnapshot(
      q,
      snapshot => {
        const guias = snapshot.docs.map(docSnap => toGuia(docSnap.id, clinicId, docSnap.data()))
        onData(guias)
      },
      error => {
        console.error('Error subscribing to guias:', error)
        onError?.(error)
      }
    )
  },

  /**
   * Get guias stats for dashboard.
   */
  async getStats(clinicId: string): Promise<{
    total: number
    pendentes: number
    aprovadas: number
    glosadas: number
    valorTotal: number
    valorGlosado: number
    valorRecebido: number
  }> {
    const guias = await this.getAll(clinicId)

    const stats = {
      total: guias.length,
      pendentes: 0,
      aprovadas: 0,
      glosadas: 0,
      valorTotal: 0,
      valorGlosado: 0,
      valorRecebido: 0,
    }

    for (const guia of guias) {
      stats.valorTotal += guia.valorTotal
      stats.valorGlosado += guia.valorGlosado || 0
      stats.valorRecebido += guia.valorPago || 0

      if (guia.status === 'rascunho' || guia.status === 'enviada' || guia.status === 'em_analise') {
        stats.pendentes++
      } else if (guia.status === 'autorizada' || guia.status === 'paga') {
        stats.aprovadas++
      } else if (guia.status === 'glosada_parcial' || guia.status === 'glosada_total') {
        stats.glosadas++
      }
    }

    return stats
  },
}
