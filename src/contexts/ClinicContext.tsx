/**
 * Clinic Context
 *
 * Provides clinic and user profile data to the application.
 * Handles multi-tenancy by managing the clinicId for all operations.
 *
 * PERF: Uses getDoc with manual refresh instead of real-time listeners.
 * This reduces Firestore reads by ~80% since clinic/user data rarely changes.
 * Data is refreshed after mutations (create, update) ensuring consistency.
 */
 

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { useAuthContext } from './AuthContext';
import { userService, clinicService, seedClinicData } from '../services/firestore';
import type {
  Clinic,
  UserProfile,
  CreateClinicInput,
  ClinicSettings,
  SpecialtyType,
} from '@/types';

/**
 * Clinic context state and methods.
 */
export interface ClinicContextValue {
  /** The current user's profile from Firestore */
  userProfile: UserProfile | null;
  /** The current clinic data */
  clinic: Clinic | null;
  /** The clinic ID (shortcut for clinic?.id) */
  clinicId: string | null;
  /** Loading state for initial data fetch */
  loading: boolean;
  /** Error state */
  error: Error | null;
  /** Whether the user needs to complete onboarding */
  needsOnboarding: boolean;
  /** Create a new clinic and associate the current user */
  createClinic: (data: CreateClinicInput, seedData?: boolean) => Promise<string>;
  /** Update clinic settings */
  updateClinicSettings: (settings: Partial<ClinicSettings>) => Promise<void>;
  /** Update user profile */
  updateUserProfile: (data: { displayName?: string; specialty?: SpecialtyType }) => Promise<void>;
  /** Refresh user profile data from Firestore */
  refreshUserProfile: () => Promise<void>;
  /** Refresh clinic data from Firestore */
  refreshClinic: () => Promise<void>;
}

const ClinicContext = createContext<ClinicContextValue | null>(null);

interface ClinicProviderProps {
  children: ReactNode;
}

/**
 * Provider component for clinic context.
 *
 * Must be wrapped inside AuthProvider to access the current user.
 */
export function ClinicProvider({ children }: ClinicProviderProps) {
  const { user, loading: authLoading } = useAuthContext();

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Load user profile and clinic data when user changes.
   *
   * PERF: Uses getDoc instead of onSnapshot listeners.
   * - Saves ~80% Firestore reads (no continuous listener costs)
   * - Data refreshes on mutations via refreshProfile/refreshClinic
   * - With IndexedDB persistence, subsequent loads are instant from cache
   */
  useEffect(() => {
    if (authLoading) {
      return;
    }

    // Early return without setState - state is derived below
    if (!user) {
      return;
    }

    let isMounted = true;

    const initializeProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check if user profile exists
        let profile = await userService.getById(user.uid);

        if (!profile) {
          // Create new profile for first-time users
          profile = await userService.create(user.uid, {
            email: user.email || '',
            displayName: user.displayName || user.email?.split('@')[0] || 'Usuário',
          });
        }

        if (!isMounted) return;
        setUserProfile(profile);

        // Load clinic data if user has one
        if (profile.clinicId) {
          const clinicData = await clinicService.getById(profile.clinicId);
          if (!isMounted) return;
          setClinic(clinicData);
        } else {
          setClinic(null);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error initializing profile:', err);
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to load profile'));
          setLoading(false);
        }
      }
    };

    initializeProfile();

    return () => {
      isMounted = false;
    };
  }, [user, authLoading]);

  /**
   * Create a new clinic and associate the current user as owner.
   */
  const createClinic = useCallback(
    async (data: CreateClinicInput, seedData = true): Promise<string> => {
      if (!user) {
        throw new Error('User must be logged in to create a clinic');
      }

      // Create the clinic
      const clinicId = await clinicService.create(user.uid, data);

      // Associate user with clinic as owner
      await userService.joinClinic(user.uid, clinicId, 'owner');

      // Seed demo data if requested
      if (seedData) {
        const professionalName = userProfile?.displayName || user.displayName || 'Dr. Demo';
        await seedClinicData(clinicId, professionalName);
      }

      // Fetch the updated profile and clinic to update state immediately
      const updatedProfile = await userService.getById(user.uid);
      if (updatedProfile) {
        setUserProfile(updatedProfile);
      }

      const newClinic = await clinicService.getById(clinicId);
      if (newClinic) {
        setClinic(newClinic);
      }

      return clinicId;
    },
    [user, userProfile]
  );

  /**
   * Update clinic settings.
   * Refreshes clinic data after update to ensure UI consistency.
   */
  const updateClinicSettings = useCallback(
    async (settings: Partial<ClinicSettings>): Promise<void> => {
      if (!clinic) {
        throw new Error('No clinic to update');
      }
      await clinicService.updateSettings(clinic.id, settings);
      // Refresh clinic data after update
      const updatedClinic = await clinicService.getById(clinic.id);
      if (updatedClinic) {
        setClinic(updatedClinic);
      }
    },
    [clinic]
  );

  /**
   * Update user profile.
   * Refreshes profile data after update to ensure UI consistency.
   */
  const updateUserProfile = useCallback(
    async (data: { displayName?: string; specialty?: SpecialtyType }): Promise<void> => {
      if (!user) {
        throw new Error('User must be logged in to update profile');
      }
      await userService.update(user.uid, data);
      // Refresh profile data after update
      const updatedProfile = await userService.getById(user.uid);
      if (updatedProfile) {
        setUserProfile(updatedProfile);
      }
    },
    [user]
  );

  /**
   * Refresh user profile data from Firestore.
   */
  const refreshUserProfile = useCallback(async (): Promise<void> => {
    if (!user) {
      return;
    }
    const profile = await userService.getById(user.uid);
    setUserProfile(profile);
  }, [user]);

  /**
   * Refresh clinic data from Firestore.
   */
  const refreshClinic = useCallback(async (): Promise<void> => {
    if (!userProfile?.clinicId) {
      return;
    }
    const clinicData = await clinicService.getById(userProfile.clinicId);
    setClinic(clinicData);
  }, [userProfile]);

  // Derive final values when user is null (no auth)
  const hasUser = !!user && !authLoading;
  const effectiveUserProfile = hasUser ? userProfile : null;
  const effectiveClinic = hasUser ? clinic : null;
  const effectiveLoading = authLoading ? true : hasUser ? loading : false;

  const value: ClinicContextValue = {
    userProfile: effectiveUserProfile,
    clinic: effectiveClinic,
    clinicId: effectiveClinic?.id || null,
    loading: effectiveLoading,
    error,
    needsOnboarding: !effectiveLoading && hasUser && !effectiveUserProfile?.clinicId,
    createClinic,
    updateClinicSettings,
    updateUserProfile,
    refreshUserProfile,
    refreshClinic,
  };

  return <ClinicContext.Provider value={value}>{children}</ClinicContext.Provider>;
}

/**
 * Hook to access clinic context.
 *
 * @throws Error if used outside of ClinicProvider
 */
export function useClinicContext(): ClinicContextValue {
  const context = useContext(ClinicContext);
  if (!context) {
    throw new Error('useClinicContext must be used within a ClinicProvider');
  }
  return context;
}
