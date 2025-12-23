/**
 * Recurso XML Generator Module
 *
 * Generates TISS-compliant XML for recurso de glosa (appeal) documents.
 * Implements TISS 4.02.00 standard for billing appeals.
 *
 * @module functions/tiss/recurso-xml
 */

import * as crypto from 'crypto';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Item being contested in the appeal.
 */
export interface ItemContestado {
  sequencialItem: number;
  codigoProcedimento: string;
  valorOriginal: number;
  valorGlosado: number;
  codigoGlosa: string;
  justificativa: string;
  documentosAnexos?: string[];
}

/**
 * Recurso document structure for XML generation.
 */
export interface RecursoForXml {
  id: string;
  numeroGuiaPrestador: string;
  itensContestados: ItemContestado[];
  justificativaGeral?: string;
}

// =============================================================================
// XML TEMPLATES
// =============================================================================

/**
 * TISS recurso XML template (4.02.00 standard).
 */
const RECURSO_XML_TEMPLATE = `<?xml version="1.0" encoding="UTF-8"?>
<ans:mensagemTISS xmlns:ans="http://www.ans.gov.br/padroes/tiss/schemas"
                  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <ans:cabecalho>
    <ans:identificacaoTransacao>
      <ans:tipoTransacao>RECURSO_GLOSA</ans:tipoTransacao>
      <ans:sequencialTransacao>{{sequencial}}</ans:sequencialTransacao>
      <ans:dataRegistroTransacao>{{dataRegistro}}</ans:dataRegistroTransacao>
      <ans:horaRegistroTransacao>{{horaRegistro}}</ans:horaRegistroTransacao>
    </ans:identificacaoTransacao>
    <ans:origem>
      <ans:identificacaoPrestador>
        <ans:codigoPrestadorNaOperadora>{{codigoPrestador}}</ans:codigoPrestadorNaOperadora>
      </ans:identificacaoPrestador>
    </ans:origem>
    <ans:destino>
      <ans:registroANS>{{registroANS}}</ans:registroANS>
    </ans:destino>
    <ans:versaoPadrao>4.02.00</ans:versaoPadrao>
  </ans:cabecalho>
  <ans:prestadorParaOperadora>
    <ans:recursoGlosa>
      <ans:guiaRecursoGlosa>
        <ans:registroANS>{{registroANS}}</ans:registroANS>
        <ans:numeroGuiaRecursoGlosa>{{numeroRecurso}}</ans:numeroGuiaRecursoGlosa>
        <ans:objetoRecurso>
          <ans:numeroGuiaPrestador>{{numeroGuiaPrestador}}</ans:numeroGuiaPrestador>
          {{itensRecurso}}
        </ans:objetoRecurso>
        <ans:justificativaRecurso>{{justificativaGeral}}</ans:justificativaRecurso>
      </ans:guiaRecursoGlosa>
    </ans:recursoGlosa>
  </ans:prestadorParaOperadora>
  <ans:epilogo>
    <ans:hash>{{hash}}</ans:hash>
  </ans:epilogo>
</ans:mensagemTISS>`;

/**
 * Item recurso XML template.
 */
const ITEM_RECURSO_TEMPLATE = `
          <ans:itemRecurso>
            <ans:sequencialItem>{{sequencialItem}}</ans:sequencialItem>
            <ans:codigoProcedimento>{{codigoProcedimento}}</ans:codigoProcedimento>
            <ans:valorRecursado>{{valorRecursado}}</ans:valorRecursado>
            <ans:justificativa>{{justificativa}}</ans:justificativa>
          </ans:itemRecurso>`;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Generate sequential number for recurso (10 digits).
 *
 * @returns 10-digit sequential string based on timestamp
 */
export function generateSequencial(): string {
  const now = Date.now();
  return now.toString().slice(-10);
}

/**
 * Generate unique recurso number.
 *
 * @param _clinicId - Clinic ID (prefix not used, kept for consistency)
 * @returns Unique recurso ID in format RECxxxxxxxx
 */
export function generateNumeroRecurso(_clinicId: string): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `REC${timestamp}${random}`;
}

/**
 * Calculate MD5 hash of content.
 *
 * @param content - Content to hash
 * @returns MD5 hash as hex string
 */
export function calculateHash(content: string): string {
  return crypto.createHash('md5').update(content, 'utf8').digest('hex');
}

/**
 * Format date for TISS (YYYY-MM-DD).
 *
 * @param date - Date to format
 * @returns ISO date string (YYYY-MM-DD)
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Format time for TISS (HH:MM:SS).
 *
 * @param date - Date to extract time from
 * @returns Time string (HH:MM:SS)
 */
export function formatTime(date: Date): string {
  return date.toISOString().split('T')[1].split('.')[0];
}

/**
 * Escape XML special characters.
 *
 * @param text - Text to escape
 * @returns XML-safe escaped text
 */
export function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// =============================================================================
// XML GENERATION
// =============================================================================

/**
 * Generate item recurso XML fragment.
 *
 * @param item - Item contestado data
 * @returns XML fragment for the item
 */
export function generateItemXml(item: ItemContestado): string {
  return ITEM_RECURSO_TEMPLATE
    .replace('{{sequencialItem}}', item.sequencialItem.toString())
    .replace('{{codigoProcedimento}}', item.codigoProcedimento)
    .replace('{{valorRecursado}}', item.valorGlosado.toFixed(2))
    .replace('{{justificativa}}', escapeXml(item.justificativa));
}

/**
 * Generate complete XML for recurso de glosa.
 *
 * Creates a TISS 4.02.00 compliant XML document for appealing
 * billing denials (glosas). The XML includes:
 * - Transaction header with provider/operator identification
 * - List of contested items with justifications
 * - MD5 hash for integrity verification
 *
 * @param recurso - Recurso document data
 * @param codigoPrestador - Provider code at the operator
 * @param registroANS - Operator's ANS registry number
 * @returns Complete XML string ready for signing
 */
export function generateRecursoXml(
  recurso: RecursoForXml,
  codigoPrestador: string,
  registroANS: string
): string {
  const now = new Date();

  // Generate items XML
  const itensXml = recurso.itensContestados.map(generateItemXml).join('');

  // Generate main XML (without hash first)
  let xml = RECURSO_XML_TEMPLATE
    .replace('{{sequencial}}', generateSequencial())
    .replace('{{dataRegistro}}', formatDate(now))
    .replace('{{horaRegistro}}', formatTime(now))
    .replace('{{codigoPrestador}}', codigoPrestador)
    .replace(/\{\{registroANS\}\}/g, registroANS)
    .replace('{{numeroRecurso}}', recurso.id)
    .replace('{{numeroGuiaPrestador}}', recurso.numeroGuiaPrestador)
    .replace('{{itensRecurso}}', itensXml)
    .replace('{{justificativaGeral}}', escapeXml(recurso.justificativaGeral || ''))
    .replace('{{hash}}', '');

  // Calculate hash of content (excluding the hash element itself)
  const contentForHash = xml.replace(/<ans:hash>.*<\/ans:hash>/, '');
  const hash = calculateHash(contentForHash);

  // Insert hash
  xml = xml.replace('<ans:hash></ans:hash>', `<ans:hash>${hash}</ans:hash>`);

  return xml;
}
