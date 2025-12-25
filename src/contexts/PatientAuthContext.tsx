/**
 * Patient Authentication Context
 * ===============================
 *
 * Separate authentication flow for patients accessing the portal.
 * Supports Magic Link (passwordless) and traditional email/password.
 *
 * @module contexts/PatientAuthContext
 * @version 1.0.0
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  signInWithEmailLink,
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

// ============================================================================
// Types
// ============================================================================

export interface PatientProfile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  birthDate?: string;
  clinicId: string;
  patientId: string; // Reference to patients collection
  createdAt: Date;
  lastLogin?: Date;
}

interface PatientAuthState {
  user: User | null;
  profile: PatientProfile | null;
  loading: boolean;
  error: string | null;
}

interface PatientAuthContextValue extends PatientAuthState {
  sendMagicLink: (email: string, clinicId: string) => Promise<void>;
  completeMagicLinkSignIn: (url: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

// ============================================================================
// Context
// ============================================================================

export const PatientAuthContext = createContext<PatientAuthContextValue | undefined>(undefined);

// Action settings for magic link
const actionCodeSettings = {
  url: `${window.location.origin}/#/portal/complete-signin`,
  handleCodeInApp: true,
};

// ============================================================================
// Provider
// ============================================================================

export function PatientAuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PatientAuthState>({
    user: null,
    profile: null,
    loading: true,
    error: null,
  });

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Check if this is a patient user
        try {
          const profileDoc = await getDoc(doc(db, 'patientPortalUsers', user.uid));
          if (profileDoc.exists()) {
            setState({
              user,
              profile: { id: user.uid, ...profileDoc.data() } as PatientProfile,
              loading: false,
              error: null,
            });
          } else {
            // User exists but no patient profile
            setState({
              user,
              profile: null,
              loading: false,
              error: null,
            });
          }
        } catch {
          setState({
            user: null,
            profile: null,
            loading: false,
            error: 'Erro ao carregar perfil',
          });
        }
      } else {
        setState({
          user: null,
          profile: null,
          loading: false,
          error: null,
        });
      }
    });

    return () => unsubscribe();
  }, []);

  // Send magic link email
  const sendMagicLink = useCallback(async (email: string, clinicId: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      // Store email and clinicId for completing sign-in
      window.localStorage.setItem('patientEmailForSignIn', email);
      window.localStorage.setItem('patientClinicId', clinicId);
      setState((prev) => ({ ...prev, loading: false }));
    } catch (error) {
      // Log real error for debugging
      console.error('sendMagicLink error:', error);

      // Map Firebase error codes to Portuguese messages
      const firebaseError = error as { code?: string };
      let errorMessage = 'Erro ao enviar link de acesso';

      switch (firebaseError.code) {
        case 'auth/invalid-email':
          errorMessage = 'Email inválido';
          break;
        case 'auth/missing-email':
          errorMessage = 'Email é obrigatório';
          break;
        case 'auth/unauthorized-domain':
          errorMessage = 'Domínio não autorizado. Verifique as configurações do Firebase.';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Login por email não está habilitado. Contate o suporte.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Muitas tentativas. Aguarde alguns minutos.';
          break;
      }

      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  // Complete magic link sign-in
  const completeMagicLinkSignIn = useCallback(async (url: string) => {
    if (!isSignInWithEmailLink(auth, url)) {
      throw new Error('Link inválido');
    }

    const email = window.localStorage.getItem('patientEmailForSignIn');
    const clinicId = window.localStorage.getItem('patientClinicId');

    if (!email || !clinicId) {
      throw new Error('Dados de login não encontrados');
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const result = await signInWithEmailLink(auth, email, url);

      // Create or update patient portal profile
      const profileRef = doc(db, 'patientPortalUsers', result.user.uid);
      const existingProfile = await getDoc(profileRef);

      if (!existingProfile.exists()) {
        // Find patient by email in the clinic
        // This links the portal user to their patient record
        await setDoc(profileRef, {
          email,
          clinicId,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
        });
      } else {
        await setDoc(profileRef, { lastLogin: serverTimestamp() }, { merge: true });
      }

      // Clean up localStorage
      window.localStorage.removeItem('patientEmailForSignIn');
      window.localStorage.removeItem('patientClinicId');

      setState((prev) => ({ ...prev, loading: false }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: 'Erro ao completar login',
      }));
      throw error;
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    await signOut(auth);
    setState({
      user: null,
      profile: null,
      loading: false,
      error: null,
    });
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const value: PatientAuthContextValue = {
    ...state,
    sendMagicLink,
    completeMagicLinkSignIn,
    logout,
    clearError,
  };

  return (
    <PatientAuthContext.Provider value={value}>
      {children}
    </PatientAuthContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

export function usePatientAuth(): PatientAuthContextValue {
  const context = useContext(PatientAuthContext);
  if (!context) {
    throw new Error('usePatientAuth must be used within PatientAuthProvider');
  }
  return context;
}

export default PatientAuthContext;
