/**
 * useOperadoras Hook
 *
 * Provides real-time access to health insurance operators (operadoras) in the current clinic.
 * Includes CRUD operations and loading/error states.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useClinicContext } from '../contexts/ClinicContext';
import { useAuth } from './useAuth';
import { operadoraService } from '../services/firestore';
import type { OperadoraFirestore, CreateOperadoraInput } from '@/types';

export interface UseOperadorasReturn {
  operadoras: OperadoraFirestore[];
  operadorasAtivas: OperadoraFirestore[];
  loading: boolean;
  error: Error | null;
  addOperadora: (data: CreateOperadoraInput) => Promise<string>;
  updateOperadora: (id: string, data: Partial<CreateOperadoraInput>) => Promise<void>;
  toggleAtiva: (id: string, ativa: boolean) => Promise<void>;
  deleteOperadora: (id: string) => Promise<void>;
  getOperadoraByANS: (registroANS: string) => OperadoraFirestore | undefined;
  refresh: () => Promise<void>;
}

/**
 * Hook for managing health insurance operators with real-time updates.
 */
export function useOperadoras(): UseOperadorasReturn {
  const { clinicId } = useClinicContext();
  const { user } = useAuth();

  const [operadoras, setOperadoras] = useState<OperadoraFirestore[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [hasReceived, setHasReceived] = useState(false);

  useEffect(() => {
    if (!clinicId) {
      return;
    }

    let isActive = true;

    const unsubscribe = operadoraService.subscribe(
      clinicId,
      (data) => {
        if (isActive) {
          setOperadoras(data);
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

  const effectiveOperadoras = useMemo(() => (clinicId ? operadoras : []), [clinicId, operadoras]);
  const effectiveLoading = clinicId ? !hasReceived : false;
  const operadorasAtivas = useMemo(() => effectiveOperadoras.filter((op) => op.ativa), [effectiveOperadoras]);

  const addOperadora = useCallback(
    async (data: CreateOperadoraInput): Promise<string> => {
      if (!clinicId || !user) {
        throw new Error('No clinic or user selected');
      }
      return operadoraService.create(clinicId, user.uid, data);
    },
    [clinicId, user]
  );

  const updateOperadora = useCallback(
    async (id: string, data: Partial<CreateOperadoraInput>): Promise<void> => {
      if (!clinicId || !user) {
        throw new Error('No clinic or user selected');
      }
      await operadoraService.update(clinicId, id, user.uid, data);
    },
    [clinicId, user]
  );

  const toggleAtiva = useCallback(
    async (id: string, ativa: boolean): Promise<void> => {
      if (!clinicId || !user) {
        throw new Error('No clinic or user selected');
      }
      await operadoraService.toggleAtiva(clinicId, id, user.uid, ativa);
    },
    [clinicId, user]
  );

  const deleteOperadora = useCallback(
    async (id: string): Promise<void> => {
      if (!clinicId) {
        throw new Error('No clinic selected');
      }
      await operadoraService.delete(clinicId, id);
    },
    [clinicId]
  );

  const getOperadoraByANS = useCallback(
    (registroANS: string): OperadoraFirestore | undefined => {
      return effectiveOperadoras.find((op) => op.registroANS === registroANS);
    },
    [effectiveOperadoras]
  );

  const refresh = useCallback(async (): Promise<void> => {
    if (!clinicId) {
      return;
    }
    const data = await operadoraService.getAll(clinicId);
    setOperadoras(data);
  }, [clinicId]);

  return {
    operadoras: effectiveOperadoras,
    operadorasAtivas,
    loading: effectiveLoading,
    error,
    addOperadora,
    updateOperadora,
    toggleAtiva,
    deleteOperadora,
    getOperadoraByANS,
    refresh,
  };
}
