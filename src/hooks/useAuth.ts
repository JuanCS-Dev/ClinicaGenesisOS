import { useState, useEffect, useCallback } from 'react'
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth'
import { auth } from '../services/firebase'

export interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

/**
 * Auth event callbacks for LGPD audit logging.
 * These are called AFTER successful auth events to allow the caller
 * (which has clinic context) to log the event.
 */
export interface AuthEventCallbacks {
  onLoginSuccess?: (user: User, method: 'email' | 'google') => void
  onLogoutSuccess?: (userId: string) => void
  onSignUpSuccess?: (user: User) => void
}

export interface UseAuthReturn extends AuthState {
  signIn: (email: string, password: string, callbacks?: AuthEventCallbacks) => Promise<void>
  signUp: (
    email: string,
    password: string,
    displayName: string,
    callbacks?: AuthEventCallbacks
  ) => Promise<void>
  signInWithGoogle: (callbacks?: AuthEventCallbacks) => Promise<void>
  logout: (callbacks?: AuthEventCallbacks) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  clearError: () => void
}

export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setState(prev => ({ ...prev, user, loading: false }))
    })

    return () => unsubscribe()
  }, [])

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }))
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [setError])

  const handleAuthError = useCallback((error: unknown): string => {
    if (error instanceof Error) {
      const firebaseError = error as { code?: string }
      switch (firebaseError.code) {
        case 'auth/invalid-email':
          return 'Email inválido.'
        case 'auth/user-disabled':
          return 'Esta conta foi desativada.'
        case 'auth/user-not-found':
          return 'Usuário não encontrado.'
        case 'auth/wrong-password':
          return 'Senha incorreta.'
        case 'auth/invalid-credential':
          return 'Credenciais inválidas.'
        case 'auth/email-already-in-use':
          return 'Este email já está em uso.'
        case 'auth/weak-password':
          return 'A senha deve ter pelo menos 6 caracteres.'
        case 'auth/popup-closed-by-user':
          return 'Login cancelado.'
        case 'auth/too-many-requests':
          return 'Muitas tentativas. Tente novamente mais tarde.'
        default:
          return error.message || 'Erro desconhecido.'
      }
    }
    return 'Erro desconhecido.'
  }, [])

  const signIn = useCallback(
    async (email: string, password: string, callbacks?: AuthEventCallbacks) => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }))
        const { user } = await signInWithEmailAndPassword(auth, email, password)
        // Callback for LGPD audit logging
        callbacks?.onLoginSuccess?.(user, 'email')
      } catch (error) {
        const errorMessage = handleAuthError(error)
        setState(prev => ({ ...prev, error: errorMessage, loading: false }))
        throw error
      }
    },
    [handleAuthError]
  )

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      displayName: string,
      callbacks?: AuthEventCallbacks
    ) => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }))
        const { user } = await createUserWithEmailAndPassword(auth, email, password)
        await updateProfile(user, { displayName })
        // Callback for LGPD audit logging
        callbacks?.onSignUpSuccess?.(user)
      } catch (error) {
        const errorMessage = handleAuthError(error)
        setState(prev => ({ ...prev, error: errorMessage, loading: false }))
        throw error
      }
    },
    [handleAuthError]
  )

  const signInWithGoogle = useCallback(
    async (callbacks?: AuthEventCallbacks) => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }))
        const provider = new GoogleAuthProvider()
        const { user } = await signInWithPopup(auth, provider)
        // Callback for LGPD audit logging
        callbacks?.onLoginSuccess?.(user, 'google')
      } catch (error) {
        const errorMessage = handleAuthError(error)
        setState(prev => ({ ...prev, error: errorMessage, loading: false }))
        throw error
      }
    },
    [handleAuthError]
  )

  const logout = useCallback(
    async (callbacks?: AuthEventCallbacks) => {
      const userId = auth.currentUser?.uid
      try {
        await signOut(auth)
        // Callback for LGPD audit logging
        if (userId) {
          callbacks?.onLogoutSuccess?.(userId)
        }
      } catch (error) {
        const errorMessage = handleAuthError(error)
        setState(prev => ({ ...prev, error: errorMessage }))
        throw error
      }
    },
    [handleAuthError]
  )

  const resetPassword = useCallback(
    async (email: string) => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }))
        await sendPasswordResetEmail(auth, email)
        setState(prev => ({ ...prev, loading: false }))
      } catch (error) {
        const errorMessage = handleAuthError(error)
        setState(prev => ({ ...prev, error: errorMessage, loading: false }))
        throw error
      }
    },
    [handleAuthError]
  )

  return {
    ...state,
    signIn,
    signUp,
    signInWithGoogle,
    logout,
    resetPassword,
    clearError,
  }
}
