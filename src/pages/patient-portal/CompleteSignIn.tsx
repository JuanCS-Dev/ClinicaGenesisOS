/**
 * Complete Sign In Page
 * =====================
 *
 * Handles the magic link callback when patient clicks the email link.
 * Validates the link and completes the authentication flow.
 *
 * @module pages/patient-portal/CompleteSignIn
 */

import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/services/firebase'
import { Loader2, CheckCircle2, XCircle, Mail } from 'lucide-react'

type Status = 'validating' | 'need-email' | 'success' | 'error'

export function CompleteSignIn(): React.ReactElement {
  const navigate = useNavigate()
  const [status, setStatus] = useState<Status>('validating')
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const processedRef = useRef(false)

  const completeSignIn = useCallback(async (userEmail: string, url: string) => {
    setStatus('validating')

    try {
      // Complete the sign-in
      const result = await signInWithEmailLink(auth, userEmail, url)

      // Get clinicId from localStorage (saved when sending the link)
      const clinicId = window.localStorage.getItem('patientClinicId')

      // Create/update patient portal user profile
      const profileRef = doc(db, 'patientPortalUsers', result.user.uid)
      await setDoc(profileRef, {
        email: userEmail,
        clinicId: clinicId || null,
        lastLogin: serverTimestamp(),
      }, { merge: true })

      // Clean up localStorage
      window.localStorage.removeItem('patientEmailForSignIn')
      window.localStorage.removeItem('patientClinicId')

      setStatus('success')

      // Redirect to portal after short delay
      setTimeout(() => {
        navigate('/portal', { replace: true })
      }, 1500)
    } catch (err) {
      console.error('Error completing sign-in:', err)
      setStatus('error')

      // Map Firebase errors to Portuguese
      const firebaseError = err as { code?: string }
      switch (firebaseError.code) {
        case 'auth/invalid-action-code':
          setError('Link expirado ou já utilizado. Solicite um novo link.')
          break
        case 'auth/invalid-email':
          setError('Email inválido. Use o mesmo email que recebeu o link.')
          break
        case 'auth/user-disabled':
          setError('Esta conta foi desativada. Entre em contato com a clínica.')
          break
        default:
          setError('Erro ao completar login. Tente novamente.')
      }
    }
  }, [navigate])

  useEffect(() => {
    // Prevent double processing in StrictMode
    if (processedRef.current) return
    processedRef.current = true

    const url = window.location.href

    // Check if this is a valid sign-in link
    if (!isSignInWithEmailLink(auth, url)) {
      setStatus('error')
      setError('Link inválido ou expirado')
      return
    }

    // Try to get email from localStorage
    const storedEmail = window.localStorage.getItem('patientEmailForSignIn')

    if (storedEmail) {
      completeSignIn(storedEmail, url)
    } else {
      // Email not in localStorage - need to ask user
      setStatus('need-email')
    }
  }, [completeSignIn])

  function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (email) {
      completeSignIn(email, window.location.href)
    }
  }

  return (
    <div className="min-h-screen bg-genesis-soft flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-genesis-surface rounded-3xl shadow-xl p-8 text-center">

          {/* Validating */}
          {status === 'validating' && (
            <>
              <Loader2 className="w-16 h-16 mx-auto text-genesis-primary animate-spin mb-6" />
              <h1 className="text-xl font-bold text-genesis-dark mb-2">
                Validando seu acesso...
              </h1>
              <p className="text-genesis-muted">
                Aguarde enquanto confirmamos sua identidade
              </p>
            </>
          )}

          {/* Need Email */}
          {status === 'need-email' && (
            <>
              <div className="w-16 h-16 mx-auto rounded-full bg-genesis-primary/10 flex items-center justify-center mb-6">
                <Mail className="w-8 h-8 text-genesis-primary" />
              </div>
              <h1 className="text-xl font-bold text-genesis-dark mb-2">
                Confirme seu email
              </h1>
              <p className="text-genesis-muted mb-6">
                Por segurança, confirme o email usado para solicitar o acesso
              </p>
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-genesis-border bg-genesis-soft text-genesis-dark placeholder:text-genesis-muted focus:outline-none focus:ring-2 focus:ring-genesis-primary"
                />
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-genesis-primary text-white font-medium hover:bg-genesis-primary-dark transition-colors"
                >
                  Confirmar e entrar
                </button>
              </form>
            </>
          )}

          {/* Success */}
          {status === 'success' && (
            <>
              <div className="w-16 h-16 mx-auto rounded-full bg-success-soft flex items-center justify-center mb-6">
                <CheckCircle2 className="w-8 h-8 text-success" />
              </div>
              <h1 className="text-xl font-bold text-genesis-dark mb-2">
                Login realizado!
              </h1>
              <p className="text-genesis-muted">
                Redirecionando para seu portal...
              </p>
            </>
          )}

          {/* Error */}
          {status === 'error' && (
            <>
              <div className="w-16 h-16 mx-auto rounded-full bg-danger-soft flex items-center justify-center mb-6">
                <XCircle className="w-8 h-8 text-danger" />
              </div>
              <h1 className="text-xl font-bold text-genesis-dark mb-2">
                Erro no acesso
              </h1>
              <p className="text-danger mb-6">{error}</p>
              <button
                onClick={() => navigate('/portal/login')}
                className="w-full py-3 rounded-xl bg-genesis-primary text-white font-medium hover:bg-genesis-primary-dark transition-colors"
              >
                Solicitar novo link
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  )
}

export default CompleteSignIn
