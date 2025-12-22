/**
 * Consent Context
 * ===============
 *
 * React context for managing user consent state.
 * Provides consent status and actions to the app.
 *
 * Fase 11: LGPD Compliance
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { useClinicContext } from './ClinicContext';
import { useAuthContext } from './AuthContext';
import {
  getUserConsents,
  recordConsent,
  updateConsentStatus,
} from '../services/firestore/lgpd.service';
import type {
  ConsentRecord,
  ConsentInput,
  ProcessingPurpose,
  DataCategory,
} from '@/types/lgpd';

/**
 * Consent context value interface.
 */
export interface ConsentContextValue {
  /** Current user consents */
  consents: ConsentRecord[];
  /** Loading state */
  loading: boolean;
  /** Error message */
  error: string | null;
  /** Whether consent banner should be shown */
  showBanner: boolean;
  /** Whether all required consents are granted */
  hasRequiredConsents: boolean;
  /** Check if specific consent is granted */
  hasConsent: (purpose: ProcessingPurpose) => boolean;
  /** Grant consent for a purpose */
  grantConsent: (
    purpose: ProcessingPurpose,
    dataCategories: DataCategory[]
  ) => Promise<void>;
  /** Withdraw consent for a purpose */
  withdrawConsent: (consentId: string) => Promise<void>;
  /** Accept all consents */
  acceptAll: () => Promise<void>;
  /** Dismiss banner */
  dismissBanner: () => void;
  /** Refresh consents from server */
  refresh: () => Promise<void>;
}

/**
 * Default context value.
 */
const defaultValue: ConsentContextValue = {
  consents: [],
  loading: true,
  error: null,
  showBanner: false,
  hasRequiredConsents: false,
  hasConsent: () => false,
  grantConsent: async () => {},
  withdrawConsent: async () => {},
  acceptAll: async () => {},
  dismissBanner: () => {},
  refresh: async () => {},
};

/**
 * Consent context.
 */
const ConsentContext = createContext<ConsentContextValue>(defaultValue);

/**
 * Required purposes for basic app functionality.
 */
const REQUIRED_PURPOSES: ProcessingPurpose[] = [
  'healthcare_provision',
  'legal_obligation',
];

/**
 * Default data categories for each purpose.
 */
const PURPOSE_DATA_CATEGORIES: Record<ProcessingPurpose, DataCategory[]> = {
  healthcare_provision: ['identification', 'contact', 'health'],
  legal_obligation: ['identification', 'health'],
  vital_interests: ['identification', 'health'],
  legitimate_interest: ['identification', 'behavioral'],
  consent_based: ['identification'],
  marketing: ['contact'],
  analytics: ['behavioral'],
  research: ['health'],
};

/**
 * Props for ConsentProvider.
 */
interface ConsentProviderProps {
  children: ReactNode;
}

/**
 * Consent provider component.
 */
export function ConsentProvider({ children }: ConsentProviderProps): React.ReactElement {
  const { clinicId } = useClinicContext();
  const { user } = useAuthContext();

  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  // Load user consents
  const loadConsents = useCallback(async () => {
    if (!clinicId || !user?.uid) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const userConsents = await getUserConsents(clinicId, user.uid);
      setConsents(userConsents);

      // Check if required consents are missing
      const hasAllRequired = REQUIRED_PURPOSES.every((purpose) =>
        userConsents.some(
          (c) => c.purpose === purpose && c.status === 'granted'
        )
      );

      // Show banner if missing required consents
      if (!hasAllRequired && !localStorage.getItem('consent_banner_dismissed')) {
        setShowBanner(true);
      }
    } catch (err) {
      console.error('Failed to load consents:', err);
      setError('Erro ao carregar consentimentos');
    } finally {
      setLoading(false);
    }
  }, [clinicId, user?.uid]);

  // Load on mount
  useEffect(() => {
    loadConsents();
  }, [loadConsents]);

  // Check if specific consent is granted
  const hasConsent = useCallback(
    (purpose: ProcessingPurpose): boolean => {
      return consents.some(
        (c) => c.purpose === purpose && c.status === 'granted'
      );
    },
    [consents]
  );

  // Check if all required consents are granted
  const hasRequiredConsents = useMemo(() => {
    return REQUIRED_PURPOSES.every((purpose) => hasConsent(purpose));
  }, [hasConsent]);

  // Grant consent
  const grantConsent = useCallback(
    async (purpose: ProcessingPurpose, dataCategories: DataCategory[]) => {
      if (!clinicId || !user?.uid) return;

      try {
        setError(null);
        const input: ConsentInput = {
          purpose,
          dataCategories,
          status: 'granted',
          version: '1.0.0',
        };

        await recordConsent(clinicId, user.uid, input);
        await loadConsents();
      } catch (err) {
        console.error('Failed to grant consent:', err);
        setError('Erro ao registrar consentimento');
        throw err;
      }
    },
    [clinicId, user?.uid, loadConsents]
  );

  // Withdraw consent
  const withdrawConsent = useCallback(
    async (consentId: string) => {
      if (!clinicId) return;

      try {
        setError(null);
        await updateConsentStatus(clinicId, consentId, 'withdrawn');
        await loadConsents();
      } catch (err) {
        console.error('Failed to withdraw consent:', err);
        setError('Erro ao revogar consentimento');
        throw err;
      }
    },
    [clinicId, loadConsents]
  );

  // Accept all consents
  const acceptAll = useCallback(async () => {
    if (!clinicId || !user?.uid) return;

    try {
      setError(null);

      // Grant all required purposes
      for (const purpose of REQUIRED_PURPOSES) {
        if (!hasConsent(purpose)) {
          await recordConsent(clinicId, user.uid, {
            purpose,
            dataCategories: PURPOSE_DATA_CATEGORIES[purpose],
            status: 'granted',
            version: '1.0.0',
          });
        }
      }

      await loadConsents();
      setShowBanner(false);
    } catch (err) {
      console.error('Failed to accept all consents:', err);
      setError('Erro ao registrar consentimentos');
      throw err;
    }
  }, [clinicId, user?.uid, hasConsent, loadConsents]);

  // Dismiss banner
  const dismissBanner = useCallback(() => {
    setShowBanner(false);
    localStorage.setItem('consent_banner_dismissed', 'true');
  }, []);

  // Context value
  const value = useMemo<ConsentContextValue>(
    () => ({
      consents,
      loading,
      error,
      showBanner,
      hasRequiredConsents,
      hasConsent,
      grantConsent,
      withdrawConsent,
      acceptAll,
      dismissBanner,
      refresh: loadConsents,
    }),
    [
      consents,
      loading,
      error,
      showBanner,
      hasRequiredConsents,
      hasConsent,
      grantConsent,
      withdrawConsent,
      acceptAll,
      dismissBanner,
      loadConsents,
    ]
  );

  return (
    <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>
  );
}

/**
 * Hook to access consent context.
 */
export function useConsent(): ConsentContextValue {
  const context = useContext(ConsentContext);

  if (context === undefined) {
    throw new Error('useConsent must be used within a ConsentProvider');
  }

  return context;
}

export default ConsentContext;

