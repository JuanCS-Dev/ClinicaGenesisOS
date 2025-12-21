/**
 * TISS Service
 *
 * Main service for TISS billing operations.
 * Handles Firestore CRUD, XML generation, and glosa management.
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
import { db } from '@/services/firebase';
import type {
  GuiaConsulta,
  GuiaSADT,
  GuiaFirestore,
  StatusGuia,
  TipoGuia,
  CreateGuiaConsultaInput,
  CreateGuiaSADTInput,
  Glosa,
  RecursoGlosa,
  ResumoFaturamento,
  AnaliseGlosas,
  TissValidationResult,
  DadosContratado,
  DadosProfissional,
  ProcedimentoRealizado,
} from '@/types';
import { generateXmlConsulta, validateGuiaConsulta } from './xml-consulta';
import { generateXmlSADT, validateGuiaSADT, calculateSADTTotals } from './xml-sadt';
import { searchTussCodes, getTussCodeByCode } from './tuss-codes';

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get the guias collection reference for a clinic.
 */
function getGuiasCollection(clinicId: string) {
  return collection(db, 'clinics', clinicId, 'guias');
}

/**
 * Get a guia document reference.
 */
function getGuiaDoc(clinicId: string, guiaId: string) {
  return doc(db, 'clinics', clinicId, 'guias', guiaId);
}

/**
 * Convert Firestore document to GuiaFirestore.
 */
function docToGuia(docSnap: { id: string; data: () => Record<string, unknown> }): GuiaFirestore {
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
    glosas: data.glosas as Glosa[] | undefined,
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
function generateGuiaNumber(clinicId: string): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  const clinicPrefix = clinicId.substring(0, 4).toUpperCase();
  return `${clinicPrefix}-${timestamp}-${random}`;
}

// =============================================================================
// GUIA CRUD OPERATIONS
// =============================================================================

/**
 * Create a new Guia de Consulta.
 */
async function createGuiaConsulta(
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
async function createGuiaSADT(
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
async function getGuiaById(clinicId: string, guiaId: string): Promise<GuiaFirestore | null> {
  const docSnap = await getDoc(getGuiaDoc(clinicId, guiaId));
  if (!docSnap.exists()) {
    return null;
  }
  return docToGuia(docSnap as { id: string; data: () => Record<string, unknown> });
}

/**
 * Get all guias for a patient.
 */
async function getGuiasByPatient(clinicId: string, patientId: string): Promise<GuiaFirestore[]> {
  const q = query(
    getGuiasCollection(clinicId),
    where('patientId', '==', patientId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => docToGuia(d as { id: string; data: () => Record<string, unknown> }));
}

/**
 * Get all guias by status.
 */
async function getGuiasByStatus(clinicId: string, status: StatusGuia): Promise<GuiaFirestore[]> {
  const q = query(
    getGuiasCollection(clinicId),
    where('status', '==', status),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => docToGuia(d as { id: string; data: () => Record<string, unknown> }));
}

/**
 * Get all guias within a date range.
 */
async function getGuiasByDateRange(
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
  return snapshot.docs.map((d) => docToGuia(d as { id: string; data: () => Record<string, unknown> }));
}

/**
 * Update guia status.
 */
async function updateGuiaStatus(
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
async function updateGuiaOperadora(
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

// =============================================================================
// XML OPERATIONS
// =============================================================================

/**
 * Regenerate XML for a guia.
 */
async function regenerateXml(
  clinicId: string,
  guiaId: string,
  userId: string
): Promise<string> {
  const guia = await getGuiaById(clinicId, guiaId);
  if (!guia) {
    throw new Error('Guia não encontrada');
  }

  let xmlContent: string;
  if (guia.tipo === 'consulta') {
    xmlContent = generateXmlConsulta(guia.dadosGuia as GuiaConsulta);
  } else if (guia.tipo === 'sadt') {
    xmlContent = generateXmlSADT(guia.dadosGuia as GuiaSADT);
  } else {
    throw new Error(`Tipo de guia não suportado: ${guia.tipo}`);
  }

  await updateDoc(getGuiaDoc(clinicId, guiaId), {
    xmlContent,
    updatedAt: serverTimestamp(),
    updatedBy: userId,
  });

  return xmlContent;
}

/**
 * Validate XML against XSD schema (simplified).
 */
function validateXml(xml: string): TissValidationResult {
  const errors: TissValidationResult['errors'] = [];
  const warnings: TissValidationResult['warnings'] = [];

  // Basic structure validation
  if (!xml.includes('<?xml version')) {
    errors.push({
      path: 'root',
      message: 'XML declaration missing',
      severity: 'error',
    });
  }

  if (!xml.includes('mensagemTISS')) {
    errors.push({
      path: 'root',
      message: 'Root element mensagemTISS not found',
      severity: 'error',
    });
  }

  if (!xml.includes('ans:cabecalho')) {
    errors.push({
      path: 'cabecalho',
      message: 'Cabecalho element required',
      severity: 'error',
    });
  }

  if (!xml.includes('versaoPadrao')) {
    warnings.push({
      path: 'cabecalho.versaoPadrao',
      message: 'Version not specified',
    });
  }

  if (!xml.includes('epilogo')) {
    errors.push({
      path: 'epilogo',
      message: 'Epilogo with hash required',
      severity: 'error',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// =============================================================================
// GLOSA OPERATIONS
// =============================================================================

/**
 * Import a glosa received from operadora.
 */
async function importGlosa(
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
async function createRecurso(
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

// =============================================================================
// REPORTS
// =============================================================================

/**
 * Get billing summary for a period.
 */
async function getResumoFaturamento(
  clinicId: string,
  inicio: string,
  fim: string
): Promise<ResumoFaturamento> {
  const guias = await getGuiasByDateRange(clinicId, inicio, fim);

  const guiasPorTipo: Record<TipoGuia, number> = {
    consulta: 0,
    sadt: 0,
    internacao: 0,
    honorarios: 0,
    anexo: 0,
  };

  const guiasPorStatus: Record<StatusGuia, number> = {
    rascunho: 0,
    enviada: 0,
    em_analise: 0,
    autorizada: 0,
    glosada_parcial: 0,
    glosada_total: 0,
    paga: 0,
    recurso: 0,
  };

  const porOperadora = new Map<string, {
    registroANS: string;
    nomeOperadora: string;
    valorFaturado: number;
    valorGlosado: number;
    valorRecebido: number;
    quantidadeGuias: number;
  }>();

  let valorTotalFaturado = 0;
  let valorTotalGlosado = 0;
  let valorTotalRecebido = 0;

  guias.forEach((guia) => {
    // Count by type
    guiasPorTipo[guia.tipo]++;

    // Count by status
    guiasPorStatus[guia.status]++;

    // Sum values
    valorTotalFaturado += guia.valorTotal;
    valorTotalGlosado += guia.valorGlosado || 0;
    valorTotalRecebido += guia.valorPago || 0;

    // Group by operadora
    const operadoraKey = guia.registroANS;
    const existing = porOperadora.get(operadoraKey) || {
      registroANS: guia.registroANS,
      nomeOperadora: guia.nomeOperadora,
      valorFaturado: 0,
      valorGlosado: 0,
      valorRecebido: 0,
      quantidadeGuias: 0,
    };
    existing.valorFaturado += guia.valorTotal;
    existing.valorGlosado += guia.valorGlosado || 0;
    existing.valorRecebido += guia.valorPago || 0;
    existing.quantidadeGuias++;
    porOperadora.set(operadoraKey, existing);
  });

  return {
    periodo: { inicio, fim },
    totalGuias: guias.length,
    guiasPorTipo,
    guiasPorStatus,
    valorTotalFaturado,
    valorTotalGlosado,
    valorTotalRecebido,
    taxaGlosa: valorTotalFaturado > 0 ? (valorTotalGlosado / valorTotalFaturado) * 100 : 0,
    porOperadora: Array.from(porOperadora.values()),
  };
}

/**
 * Get glosa analysis for a period.
 */
async function getAnaliseGlosas(
  clinicId: string,
  inicio: string,
  fim: string
): Promise<AnaliseGlosas> {
  const guias = await getGuiasByDateRange(clinicId, inicio, fim);

  const glosasFlat = guias.flatMap((g) => g.glosas || []);

  const porMotivo = new Map<string, {
    motivo: string;
    descricao: string;
    quantidade: number;
    valor: number;
  }>();

  const porOperadora = new Map<string, {
    registroANS: string;
    nomeOperadora: string;
    quantidade: number;
    valor: number;
  }>();

  let valorTotalGlosado = 0;
  let valorRecuperado = 0;

  glosasFlat.forEach((glosa) => {
    valorTotalGlosado += glosa.valorGlosado;

    // Check for recovered value from recursos
    if (glosa.status === 'resolvida') {
      valorRecuperado += glosa.valorAprovado - (glosa.valorOriginal - glosa.valorGlosado);
    }

    // Group by motivo
    glosa.itensGlosados.forEach((item) => {
      const existing = porMotivo.get(item.codigoGlosa) || {
        motivo: item.codigoGlosa,
        descricao: item.descricaoGlosa,
        quantidade: 0,
        valor: 0,
      };
      existing.quantidade++;
      existing.valor += item.valorGlosado;
      porMotivo.set(item.codigoGlosa, existing);
    });
  });

  // Group by operadora from guias that have glosas
  guias
    .filter((g) => g.glosas && g.glosas.length > 0)
    .forEach((guia) => {
      const existing = porOperadora.get(guia.registroANS) || {
        registroANS: guia.registroANS,
        nomeOperadora: guia.nomeOperadora,
        quantidade: 0,
        valor: 0,
      };
      existing.quantidade += guia.glosas?.length || 0;
      existing.valor += guia.valorGlosado || 0;
      porOperadora.set(guia.registroANS, existing);
    });

  const totalPorMotivo = Array.from(porMotivo.values());
  const totalValorMotivos = totalPorMotivo.reduce((sum, m) => sum + m.valor, 0);

  return {
    periodo: { inicio, fim },
    totalGlosas: glosasFlat.length,
    valorTotalGlosado,
    valorRecuperado,
    taxaRecuperacao: valorTotalGlosado > 0 ? (valorRecuperado / valorTotalGlosado) * 100 : 0,
    porMotivo: totalPorMotivo.map((m) => ({
      ...m,
      motivo: m.motivo as 'A1' | 'A2' | 'A3' | 'A4' | 'A5' | 'A6' | 'A7' | 'A8' | 'A9' | 'A10' | 'B1' | 'B2' | 'C1' | 'outros',
      percentual: totalValorMotivos > 0 ? (m.valor / totalValorMotivos) * 100 : 0,
    })),
    porOperadora: Array.from(porOperadora.values()),
  };
}

// =============================================================================
// EXPORT SERVICE
// =============================================================================

export const tissService = {
  // Guia CRUD
  createGuiaConsulta,
  createGuiaSADT,
  getGuiaById,
  getGuiasByPatient,
  getGuiasByStatus,
  getGuiasByDateRange,
  updateGuiaStatus,
  updateGuiaOperadora,

  // XML Operations
  regenerateXml,
  validateXml,
  generateXmlConsulta,
  generateXmlSADT,

  // Glosa Operations
  importGlosa,
  createRecurso,

  // TUSS Codes
  searchTussCodes,
  getTussCodeByCode,

  // Reports
  getResumoFaturamento,
  getAnaliseGlosas,
};
