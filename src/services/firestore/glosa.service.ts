/**
 * Glosa Service
 *
 * Firestore service for managing glosas (billing denials).
 *
 * @module services/firestore/glosa
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
  limit,
  onSnapshot,
  type QueryConstraint,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { Glosa } from '@/types/tiss/glosas';

// =============================================================================
// TYPES
// =============================================================================

export interface GlosaFirestore extends Glosa {
  clinicId: string;
  guiaId: string;
  loteId?: string;
  operadoraId: string;
}

export interface GlosaFilters {
  status?: Glosa['status'];
  operadoraId?: string;
  prazoProximo?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface GlosaStats {
  totalGlosas: number;
  valorTotalGlosado: number;
  valorRecuperado: number;
  taxaRecuperacao: number;
  glosasPerStatus: Record<string, number>;
  principaisMotivos: Array<{ motivo: string; quantidade: number; valor: number }>;
  glosasProximoPrazo: number;
}

// =============================================================================
// COLLECTION REFERENCE
// =============================================================================

function getGlosasCollection(clinicId: string) {
  return collection(db, 'clinics', clinicId, 'glosas');
}

// =============================================================================
// READ OPERATIONS
// =============================================================================

/**
 * Get all glosas for a clinic with optional filters.
 */
export async function getGlosas(
  clinicId: string,
  filters?: GlosaFilters
): Promise<GlosaFirestore[]> {
  const glosasRef = getGlosasCollection(clinicId);
  const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')];

  if (filters?.status) {
    constraints.unshift(where('status', '==', filters.status));
  }

  if (filters?.operadoraId) {
    constraints.unshift(where('operadoraId', '==', filters.operadoraId));
  }

  const q = query(glosasRef, ...constraints);
  const snapshot = await getDocs(q);

  let glosas = snapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        clinicId,
        ...doc.data(),
      }) as GlosaFirestore
  );

  // Apply date filters in memory
  if (filters?.startDate) {
    glosas = glosas.filter((g) => g.createdAt >= filters.startDate!);
  }
  if (filters?.endDate) {
    glosas = glosas.filter((g) => g.createdAt <= filters.endDate!);
  }

  // Filter by approaching deadline (7 days)
  if (filters?.prazoProximo) {
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    const today = new Date().toISOString().split('T')[0];
    const limit = sevenDaysFromNow.toISOString().split('T')[0];

    glosas = glosas.filter(
      (g) =>
        g.status === 'pendente' && g.prazoRecurso >= today && g.prazoRecurso <= limit
    );
  }

  return glosas;
}

/**
 * Get a single glosa by ID.
 */
export async function getGlosaById(
  clinicId: string,
  glosaId: string
): Promise<GlosaFirestore | null> {
  const docRef = doc(db, 'clinics', clinicId, 'glosas', glosaId);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) return null;

  return {
    id: snapshot.id,
    clinicId,
    ...snapshot.data(),
  } as GlosaFirestore;
}

/**
 * Subscribe to glosas with real-time updates.
 */
export function subscribeToGlosas(
  clinicId: string,
  callback: (glosas: GlosaFirestore[]) => void,
  filters?: GlosaFilters
): Unsubscribe {
  const glosasRef = getGlosasCollection(clinicId);
  const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')];

  if (filters?.status) {
    constraints.unshift(where('status', '==', filters.status));
  }

  const q = query(glosasRef, ...constraints, limit(100));

  return onSnapshot(q, (snapshot) => {
    const glosas = snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          clinicId,
          ...doc.data(),
        }) as GlosaFirestore
    );
    callback(glosas);
  });
}

// =============================================================================
// WRITE OPERATIONS
// =============================================================================

/**
 * Update glosa status.
 */
export async function updateGlosaStatus(
  clinicId: string,
  glosaId: string,
  status: Glosa['status'],
  recursoId?: string
): Promise<void> {
  const docRef = doc(db, 'clinics', clinicId, 'glosas', glosaId);
  await updateDoc(docRef, {
    status,
    recursoId,
    updatedAt: new Date().toISOString(),
  });
}

// =============================================================================
// STATISTICS
// =============================================================================

/**
 * Calculate glosa statistics.
 */
export function calculateGlosaStats(glosas: GlosaFirestore[]): GlosaStats {
  const glosasPerStatus: Record<string, number> = {
    pendente: 0,
    em_recurso: 0,
    resolvida: 0,
  };

  const motivoMap = new Map<string, { quantidade: number; valor: number }>();
  let valorTotalGlosado = 0;
  let valorRecuperado = 0;
  let glosasProximoPrazo = 0;

  const today = new Date();
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(today.getDate() + 7);
  const todayStr = today.toISOString().split('T')[0];
  const limitStr = sevenDaysFromNow.toISOString().split('T')[0];

  glosas.forEach((glosa) => {
    glosasPerStatus[glosa.status]++;
    valorTotalGlosado += glosa.valorGlosado;

    if (glosa.status === 'resolvida') {
      valorRecuperado += glosa.valorAprovado;
    }

    // Check approaching deadline
    if (
      glosa.status === 'pendente' &&
      glosa.prazoRecurso >= todayStr &&
      glosa.prazoRecurso <= limitStr
    ) {
      glosasProximoPrazo++;
    }

    // Count motivos
    glosa.itensGlosados?.forEach((item) => {
      const existing = motivoMap.get(item.codigoGlosa) || { quantidade: 0, valor: 0 };
      existing.quantidade++;
      existing.valor += item.valorGlosado;
      motivoMap.set(item.codigoGlosa, existing);
    });
  });

  const principaisMotivos = Array.from(motivoMap.entries())
    .map(([motivo, stats]) => ({ motivo, ...stats }))
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 10);

  return {
    totalGlosas: glosas.length,
    valorTotalGlosado,
    valorRecuperado,
    taxaRecuperacao: valorTotalGlosado > 0 ? (valorRecuperado / valorTotalGlosado) * 100 : 0,
    glosasPerStatus,
    principaisMotivos,
    glosasProximoPrazo,
  };
}
