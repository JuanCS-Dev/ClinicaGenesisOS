/**
 * TISS XML Operations
 *
 * XML regeneration and validation for TISS guias.
 *
 * @module services/tiss/service/xml-operations
 */

import { updateDoc, serverTimestamp } from 'firebase/firestore';
import type {
  GuiaConsulta,
  GuiaSADT,
  TissValidationResult,
} from '@/types';
import { generateXmlConsulta } from '../xml-consulta';
import { generateXmlSADT } from '../xml-sadt';
import { getGuiaDoc } from './helpers';
import { getGuiaById } from './guia-crud';

/**
 * Regenerate XML for a guia.
 */
export async function regenerateXml(
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
export function validateXml(xml: string): TissValidationResult {
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
