/**
 * TISS Lotes - Padrão TISS 4.02.00
 * Batch (lote) interfaces for bulk guide submission
 */

import type { StatusLote } from './enums';

/**
 * Lote de guias para envio à operadora
 */
export interface LoteGuias {
  id: string;
  clinicId: string;
  registroANS: string;
  nomeOperadora: string;
  numeroLote: string;
  dataGeracao: string;
  guiaIds: string[];
  quantidadeGuias: number;
  valorTotal: number;
  status: StatusLote;
  xmlContent?: string;
  protocoloOperadora?: string;
  dataEnvio?: string;
  dataProcessamento?: string;
  erros?: Array<{ guiaId: string; mensagem: string }>;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}
