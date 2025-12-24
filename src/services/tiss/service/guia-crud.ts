/**
 * TISS Guia CRUD Operations
 *
 * Create, read, update operations for TISS guias.
 *
 * @module services/tiss/service/guia-crud
 */

import {
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import type {
  GuiaConsulta,
  GuiaSADT,
  GuiaFirestore,
  StatusGuia,
  CreateGuiaConsultaInput,
  CreateGuiaSADTInput,
  DadosContratado,
  DadosProfissional,
  ProcedimentoRealizado,
} from '@/types';
import { generateXmlConsulta, validateGuiaConsulta } from '../xml-consulta';
import { generateXmlSADT, validateGuiaSADT, calculateSADTTotals } from '../xml-sadt';
import {
  getGuiasCollection,
  getGuiaDoc,
  docToGuia,
  generateGuiaNumber,
} from './helpers';

/**
 * Create a new Guia de Consulta.
 */
export async function createGuiaConsulta(
  clinicId: string,
  input: CreateGuiaConsultaInput,
  contratado: DadosContratado,
  profissional: DadosProfissional,
  userId: string,
  nomeOperadora: string
): Promise<string> {
  const numeroGuiaPrestador = generateGuiaNumber(clinicId);

  const guia: GuiaConsulta = {
    registroANS: input.registroANS,
    numeroGuiaPrestador,
    dadosBeneficiario: input.dadosBeneficiario,
    contratadoSolicitante: contratado,
    profissionalSolicitante: profissional,
    tipoConsulta: input.tipoConsulta,
    dataAtendimento: input.dataAtendimento,
    codigoTabela: '22', // TUSS
    codigoProcedimento: input.codigoProcedimento,
    valorProcedimento: input.valorProcedimento,
    indicacaoClinica: input.indicacaoClinica,
  };

  // Validate
  const errors = validateGuiaConsulta(guia);
  if (errors.length > 0) {
    throw new Error(`Validação falhou: ${errors.join(', ')}`);
  }

  // Generate XML
  const xmlContent = generateXmlConsulta(guia);

  // Save to Firestore
  const guiaDoc: Omit<GuiaFirestore, 'id'> = {
    clinicId,
    patientId: '', // Should be passed from caller
    tipo: 'consulta',
    status: 'rascunho',
    numeroGuiaPrestador,
    registroANS: input.registroANS,
    nomeOperadora,
    dataAtendimento: input.dataAtendimento,
    valorTotal: input.valorProcedimento,
    xmlContent,
    dadosGuia: guia,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: userId,
    updatedBy: userId,
  };

  const docRef = await addDoc(getGuiasCollection(clinicId), {
    ...guiaDoc,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

/**
 * Create a new Guia SADT.
 */
export async function createGuiaSADT(
  clinicId: string,
  input: CreateGuiaSADTInput,
  contratadoSolicitante: DadosContratado,
  profissionalSolicitante: DadosProfissional,
  contratadoExecutante: DadosContratado,
  profissionalExecutante: DadosProfissional,
  userId: string,
  nomeOperadora: string
): Promise<string> {
  const numeroGuiaPrestador = generateGuiaNumber(clinicId);

  // Calculate procedure totals
  const procedimentosComTotal: ProcedimentoRealizado[] = input.procedimentos.map((proc) => ({
    ...proc,
    valorTotal: proc.quantidadeRealizada * proc.valorUnitario,
  }));

  const totals = calculateSADTTotals(procedimentosComTotal);

  const guia: GuiaSADT = {
    registroANS: input.registroANS,
    numeroGuiaPrestador,
    dadosBeneficiario: input.dadosBeneficiario,
    contratadoSolicitante,
    profissionalSolicitante,
    contratadoExecutante,
    profissionalExecutante,
    caraterAtendimento: input.caraterAtendimento,
    dataSolicitacao: input.dataSolicitacao,
    indicacaoClinica: input.indicacaoClinica,
    procedimentosRealizados: procedimentosComTotal,
    ...totals,
  };

  // Validate
  const errors = validateGuiaSADT(guia);
  if (errors.length > 0) {
    throw new Error(`Validação falhou: ${errors.join(', ')}`);
  }

  // Generate XML
  const xmlContent = generateXmlSADT(guia);

  // Save to Firestore
  const guiaDoc: Omit<GuiaFirestore, 'id'> = {
    clinicId,
    patientId: '', // Should be passed from caller
    tipo: 'sadt',
    status: 'rascunho',
    numeroGuiaPrestador,
    registroANS: input.registroANS,
    nomeOperadora,
    dataAtendimento: input.dataSolicitacao,
    valorTotal: totals.valorTotalGeral,
    xmlContent,
    dadosGuia: guia,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: userId,
    updatedBy: userId,
  };

  const docRef = await addDoc(getGuiasCollection(clinicId), {
    ...guiaDoc,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

/**
 * Get a guia by ID.
 */
export async function getGuiaById(
  clinicId: string,
  guiaId: string
): Promise<GuiaFirestore | null> {
  const docSnap = await getDoc(getGuiaDoc(clinicId, guiaId));
  if (!docSnap.exists()) {
    return null;
  }
  return docToGuia(docSnap as { id: string; data: () => Record<string, unknown> });
}

/**
 * Get all guias for a patient.
 */
export async function getGuiasByPatient(
  clinicId: string,
  patientId: string
): Promise<GuiaFirestore[]> {
  const q = query(
    getGuiasCollection(clinicId),
    where('patientId', '==', patientId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) =>
    docToGuia(d as { id: string; data: () => Record<string, unknown> })
  );
}

/**
 * Get all guias by status.
 */
export async function getGuiasByStatus(
  clinicId: string,
  status: StatusGuia
): Promise<GuiaFirestore[]> {
  const q = query(
    getGuiasCollection(clinicId),
    where('status', '==', status),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) =>
    docToGuia(d as { id: string; data: () => Record<string, unknown> })
  );
}

/**
 * Get all guias within a date range.
 */
export async function getGuiasByDateRange(
  clinicId: string,
  startDate: string,
  endDate: string
): Promise<GuiaFirestore[]> {
  const q = query(
    getGuiasCollection(clinicId),
    where('dataAtendimento', '>=', startDate),
    where('dataAtendimento', '<=', endDate),
    orderBy('dataAtendimento', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) =>
    docToGuia(d as { id: string; data: () => Record<string, unknown> })
  );
}

/**
 * Update guia status.
 */
export async function updateGuiaStatus(
  clinicId: string,
  guiaId: string,
  status: StatusGuia,
  userId: string
): Promise<void> {
  await updateDoc(getGuiaDoc(clinicId, guiaId), {
    status,
    updatedAt: serverTimestamp(),
    updatedBy: userId,
  });
}

/**
 * Update guia with operadora response.
 */
export async function updateGuiaOperadora(
  clinicId: string,
  guiaId: string,
  data: {
    numeroGuiaOperadora?: string;
    status: StatusGuia;
    valorGlosado?: number;
    valorPago?: number;
  },
  userId: string
): Promise<void> {
  await updateDoc(getGuiaDoc(clinicId, guiaId), {
    ...data,
    updatedAt: serverTimestamp(),
    updatedBy: userId,
  });
}
