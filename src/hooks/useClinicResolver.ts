/**
 * useClinicResolver Hook
 *
 * Resolves the clinic ID for the patient portal from multiple sources.
 * Used to identify which clinic the patient is trying to access.
 *
 * Resolution order:
 * 1. Subdomain: clinica-abc.clinicagenesis.com.br → 'clinica-abc'
 * 2. Query param: /portal/login?clinic=abc123
 * 3. Returns null (caller must handle email lookup)
 *
 * @module hooks/useClinicResolver
 */

import { useState, useCallback } from 'react';
import { clinicService } from '@/services/firestore/clinic.service';
import type { Clinic } from '@/types';

/**
 * Result of clinic resolution.
 */
export interface ClinicResolverResult {
  /** The resolved clinic (null if not found) */
  clinic: Clinic | null;
  /** The clinic ID (null if not resolved) */
  clinicId: string | null;
  /** Loading state */
  loading: boolean;
  /** Error message */
  error: string | null;
  /** Method used to resolve the clinic */
  method: 'subdomain' | 'query' | 'manual' | null;
}

/**
 * Extracts subdomain from current hostname.
 *
 * @returns The subdomain or null if not applicable
 *
 * @example
 * // For 'clinica-abc.clinicagenesis.com.br'
 * getSubdomain() // returns 'clinica-abc'
 *
 * // For 'localhost:5173'
 * getSubdomain() // returns null
 */
function getSubdomain(): string | null {
  const hostname = window.location.hostname;

  // Skip localhost and IP addresses
  if (
    hostname === 'localhost' ||
    hostname.startsWith('127.') ||
    hostname.startsWith('192.168.') ||
    /^\d+\.\d+\.\d+\.\d+$/.test(hostname)
  ) {
    return null;
  }

  // Extract subdomain from hostname
  const parts = hostname.split('.');

  // Need at least 3 parts for a subdomain (e.g., 'sub.domain.com')
  if (parts.length < 3) {
    return null;
  }

  const subdomain = parts[0].toLowerCase();

  // Skip common non-clinic subdomains
  if (['www', 'app', 'api', 'portal', 'admin'].includes(subdomain)) {
    return null;
  }

  return subdomain;
}

/**
 * Gets clinic ID from URL query parameter.
 *
 * @returns The clinic ID from query param or null
 *
 * @example
 * // For URL: /portal/login?clinic=abc123
 * getClinicFromQuery() // returns 'abc123'
 */
function getClinicFromQuery(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get('clinic');
}

/**
 * Hook for resolving clinic ID in the patient portal.
 *
 * Attempts to identify the clinic from subdomain or query param.
 * If neither is available, returns null and the caller should
 * handle manual identification (e.g., after email lookup).
 *
 * @returns Clinic resolver functions and state
 *
 * @example
 * function PatientLogin() {
 *   const { resolveClinic, clinic, loading, error } = useClinicResolver();
 *
 *   useEffect(() => {
 *     resolveClinic();
 *   }, [resolveClinic]);
 *
 *   if (loading) return <Loading />;
 *   if (!clinic) return <ClinicNotFound />;
 *
 *   return <LoginForm clinicId={clinic.id} />;
 * }
 */
export function useClinicResolver() {
  const [result, setResult] = useState<ClinicResolverResult>({
    clinic: null,
    clinicId: null,
    loading: false,
    error: null,
    method: null,
  });

  /**
   * Attempts to resolve the clinic from available sources.
   *
   * @returns The resolved clinic or null
   */
  const resolveClinic = useCallback(async (): Promise<Clinic | null> => {
    setResult(prev => ({ ...prev, loading: true, error: null }));

    try {
      // 1. Try subdomain first
      const subdomain = getSubdomain();
      if (subdomain) {
        const clinic = await clinicService.getBySubdomain(subdomain);
        if (clinic) {
          setResult({
            clinic,
            clinicId: clinic.id,
            loading: false,
            error: null,
            method: 'subdomain',
          });
          return clinic;
        }
      }

      // 2. Try query param
      const queryClinicId = getClinicFromQuery();
      if (queryClinicId) {
        const clinic = await clinicService.getById(queryClinicId);
        if (clinic) {
          setResult({
            clinic,
            clinicId: clinic.id,
            loading: false,
            error: null,
            method: 'query',
          });
          return clinic;
        }
      }

      // 3. No clinic found from automatic methods
      setResult({
        clinic: null,
        clinicId: null,
        loading: false,
        error: null,
        method: null,
      });
      return null;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Erro ao buscar clínica';
      setResult({
        clinic: null,
        clinicId: null,
        loading: false,
        error,
        method: null,
      });
      return null;
    }
  }, []);

  /**
   * Manually set the clinic (after email lookup, for example).
   *
   * @param clinicId - The clinic ID to set
   */
  const setClinicManually = useCallback(async (clinicId: string): Promise<Clinic | null> => {
    setResult(prev => ({ ...prev, loading: true, error: null }));

    try {
      const clinic = await clinicService.getById(clinicId);
      if (clinic) {
        setResult({
          clinic,
          clinicId: clinic.id,
          loading: false,
          error: null,
          method: 'manual',
        });
        return clinic;
      }

      setResult({
        clinic: null,
        clinicId: null,
        loading: false,
        error: 'Clínica não encontrada',
        method: null,
      });
      return null;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Erro ao buscar clínica';
      setResult({
        clinic: null,
        clinicId: null,
        loading: false,
        error,
        method: null,
      });
      return null;
    }
  }, []);

  /**
   * Clear any error state.
   */
  const clearError = useCallback(() => {
    setResult(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...result,
    resolveClinic,
    setClinicManually,
    clearError,
  };
}

export default useClinicResolver;
