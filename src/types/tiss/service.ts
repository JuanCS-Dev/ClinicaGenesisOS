/**
 * TISS Service Types - Padrão TISS 4.02.00
 * Service interface and XML-related types
 */

import type { StatusGuia } from './enums';
import type { CodigoTUSS } from './base';
import type {
  CreateGuiaConsultaInput,
  CreateGuiaSADTInput,
  GuiaConsulta,
  GuiaFirestore,
  GuiaSADT,
} from './guias';
import type { Glosa, RecursoGlosa } from './glosas';
import type { AnaliseGlosas, ResumoFaturamento } from './reports';

/**
 * Options for generating TISS XML
 */
export interface TissXmlOptions {
  includeDeclaration?: boolean;
  prettyPrint?: boolean;
  validate?: boolean;
}

/**
 * Result of XML validation
 */
export interface TissValidationResult {
  valid: boolean;
  errors: Array<{
    path: string;
    message: string;
    severity: 'error' | 'warning';
  }>;
  warnings: Array<{
    path: string;
    message: string;
  }>;
}

/**
 * TISS service interface
 */
export interface TissServiceInterface {
  // Guia operations
  createGuiaConsulta(clinicId: string, input: CreateGuiaConsultaInput): Promise<string>;
  createGuiaSADT(clinicId: string, input: CreateGuiaSADTInput): Promise<string>;
  getGuiaById(clinicId: string, guiaId: string): Promise<GuiaFirestore | null>;
  getGuiasByPatient(clinicId: string, patientId: string): Promise<GuiaFirestore[]>;
  getGuiasByStatus(clinicId: string, status: StatusGuia): Promise<GuiaFirestore[]>;
  updateGuiaStatus(clinicId: string, guiaId: string, status: StatusGuia): Promise<void>;

  // XML operations
  generateXmlConsulta(guia: GuiaConsulta, options?: TissXmlOptions): string;
  generateXmlSADT(guia: GuiaSADT, options?: TissXmlOptions): string;
  validateXml(xml: string): TissValidationResult;

  // Glosa operations
  importGlosa(
    clinicId: string,
    guiaId: string,
    glosaData: Omit<Glosa, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string>;
  createRecurso(
    clinicId: string,
    glosaId: string,
    recurso: Omit<RecursoGlosa, 'id' | 'status'>
  ): Promise<string>;

  // TUSS codes
  searchTussCodes(query: string, limit?: number): CodigoTUSS[];
  getTussCodeByCode(codigo: string): CodigoTUSS | null;

  // Reports
  getResumoFaturamento(
    clinicId: string,
    inicio: string,
    fim: string
  ): Promise<ResumoFaturamento>;
  getAnaliseGlosas(
    clinicId: string,
    inicio: string,
    fim: string
  ): Promise<AnaliseGlosas>;
}
