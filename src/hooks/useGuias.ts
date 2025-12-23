/**
 * useGuias Hook
 *
 * Provides real-time access to TISS guides (guias) in the current clinic.
 * Includes CRUD operations, filtering, and stats.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useClinicContext } from '../contexts/ClinicContext';
import { useAuth } from './useAuth';
import { guiaService } from '../services/firestore';
import type { GuiaFirestore, StatusGuia, TipoGuia } from '@/types';

type CreateGuiaInput = Omit<
  GuiaFirestore,
  'id' | 'clinicId' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'numeroGuiaPrestador'
>;

export interface GuiaStats {
  total: number;
  pendentes: number;
  aprovadas: number;
  glosadas: number;
  valorTotal: number;
  valorGlosado: number;
  valorRecebido: number;
}

export interface UseGuiasReturn {
  guias: GuiaFirestore[];
  loading: boolean;
  error: Error | null;
  stats: GuiaStats;
  addGuia: (data: CreateGuiaInput) => Promise<string>;
  updateStatus: (guiaId: string, status: StatusGuia) => Promise<void>;
  getGuiasByStatus: (status: StatusGuia) => GuiaFirestore[];
  getGuiasByPatient: (patientId: string) => GuiaFirestore[];
  getGuiasByOperadora: (registroANS: string) => GuiaFirestore[];
  getGuiasByTipo: (tipo: TipoGuia) => GuiaFirestore[];
  refresh: () => Promise<void>;
}

/**
 * Hook for managing TISS guides with real-time updates.
 */
export function useGuias(): UseGuiasReturn {
  const { clinicId } = useClinicContext();
  const { user } = useAuth();

  const [guias, setGuias] = useState<GuiaFirestore[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [hasReceived, setHasReceived] = useState(false);

  useEffect(() => {
    if (!clinicId) {
      return;
    }

    let isActive = true;

    const unsubscribe = guiaService.subscribe(
      clinicId,
      (data) => {
        if (isActive) {
          setGuias(data);
          setHasReceived(true);
          setError(null);
        }
      },
      (err) => {
        if (isActive) {
          setError(err);
        }
      }
    );

    return () => {
      isActive = false;
      setHasReceived(false);
      unsubscribe();
    };
  }, [clinicId]);

  const effectiveGuias = useMemo(() => (clinicId ? guias : []), [clinicId, guias]);
  const effectiveLoading = clinicId ? !hasReceived : false;

  const stats = useMemo<GuiaStats>(() => {
    const result: GuiaStats = {
      total: effectiveGuias.length,
      pendentes: 0,
      aprovadas: 0,
      glosadas: 0,
      valorTotal: 0,
      valorGlosado: 0,
      valorRecebido: 0,
    };

    for (const guia of effectiveGuias) {
      result.valorTotal += guia.valorTotal;
      result.valorGlosado += guia.valorGlosado || 0;
      result.valorRecebido += guia.valorPago || 0;

      if (guia.status === 'rascunho' || guia.status === 'enviada' || guia.status === 'em_analise') {
        result.pendentes++;
      } else if (guia.status === 'autorizada' || guia.status === 'paga') {
        result.aprovadas++;
      } else if (guia.status === 'glosada_parcial' || guia.status === 'glosada_total') {
        result.glosadas++;
      }
    }

    return result;
  }, [effectiveGuias]);

  const addGuia = useCallback(
    async (data: CreateGuiaInput): Promise<string> => {
      if (!clinicId || !user) {
        throw new Error('No clinic or user selected');
      }
      return guiaService.create(clinicId, user.uid, data);
    },
    [clinicId, user]
  );

  const updateStatus = useCallback(
    async (guiaId: string, status: StatusGuia): Promise<void> => {
      if (!clinicId || !user) {
        throw new Error('No clinic or user selected');
      }
      await guiaService.updateStatus(clinicId, guiaId, user.uid, status);
    },
    [clinicId, user]
  );

  const getGuiasByStatus = useCallback(
    (status: StatusGuia): GuiaFirestore[] => {
      return effectiveGuias.filter((g) => g.status === status);
    },
    [effectiveGuias]
  );

  const getGuiasByPatient = useCallback(
    (patientId: string): GuiaFirestore[] => {
      return effectiveGuias.filter((g) => g.patientId === patientId);
    },
    [effectiveGuias]
  );

  const getGuiasByOperadora = useCallback(
    (registroANS: string): GuiaFirestore[] => {
      return effectiveGuias.filter((g) => g.registroANS === registroANS);
    },
    [effectiveGuias]
  );

  const getGuiasByTipo = useCallback(
    (tipo: TipoGuia): GuiaFirestore[] => {
      return effectiveGuias.filter((g) => g.tipo === tipo);
    },
    [effectiveGuias]
  );

  const refresh = useCallback(async (): Promise<void> => {
    if (!clinicId) {
      return;
    }
    const data = await guiaService.getAll(clinicId);
    setGuias(data);
  }, [clinicId]);

  return {
    guias: effectiveGuias,
    loading: effectiveLoading,
    error,
    stats,
    addGuia,
    updateStatus,
    getGuiasByStatus,
    getGuiasByPatient,
    getGuiasByOperadora,
    getGuiasByTipo,
    refresh,
  };
}
