/**
 * TISS Glosa Operations
 *
 * Import glosas and create recursos (appeals).
 *
 * @module services/tiss/service/glosa-operations
 */

import { updateDoc, serverTimestamp } from 'firebase/firestore';
import type { Glosa, RecursoGlosa } from '@/types';
import { getGuiaDoc } from './helpers';
import { getGuiaById } from './guia-crud';

/**
 * Import a glosa received from operadora.
 */
export async function importGlosa(
  clinicId: string,
  guiaId: string,
  glosaData: Omit<Glosa, 'id' | 'createdAt' | 'updatedAt'>,
  userId: string
): Promise<string> {
  const guia = await getGuiaById(clinicId, guiaId);
  if (!guia) {
    throw new Error('Guia não encontrada');
  }

  const glosa: Glosa = {
    ...glosaData,
    id: `glosa-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const existingGlosas = guia.glosas || [];
  existingGlosas.push(glosa);

  // Update guia with glosa
  await updateDoc(getGuiaDoc(clinicId, guiaId), {
    glosas: existingGlosas,
    valorGlosado: glosaData.valorGlosado,
    status: glosaData.valorGlosado >= guia.valorTotal ? 'glosada_total' : 'glosada_parcial',
    updatedAt: serverTimestamp(),
    updatedBy: userId,
  });

  return glosa.id;
}

/**
 * Create a recurso (appeal) for a glosa.
 */
export async function createRecurso(
  clinicId: string,
  guiaId: string,
  glosaId: string,
  recursoData: Omit<RecursoGlosa, 'id' | 'status'>,
  userId: string
): Promise<string> {
  const guia = await getGuiaById(clinicId, guiaId);
  if (!guia) {
    throw new Error('Guia não encontrada');
  }

  const glosaIndex = guia.glosas?.findIndex((g) => g.id === glosaId);
  if (glosaIndex === undefined || glosaIndex === -1) {
    throw new Error('Glosa não encontrada');
  }

  const recurso: RecursoGlosa = {
    ...recursoData,
    id: `recurso-${Date.now()}`,
    status: 'enviado',
  };

  // Update glosa status
  const glosas = [...(guia.glosas || [])];
  glosas[glosaIndex] = {
    ...glosas[glosaIndex],
    status: 'em_recurso',
    updatedAt: new Date().toISOString(),
  };

  await updateDoc(getGuiaDoc(clinicId, guiaId), {
    glosas,
    status: 'recurso',
    updatedAt: serverTimestamp(),
    updatedBy: userId,
  });

  return recurso.id;
}
