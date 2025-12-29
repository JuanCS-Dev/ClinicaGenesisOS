import React, { useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Activity, Mail, Lock, Eye, EyeOff, AlertCircle, Building2 } from 'lucide-react'
import { useAuthContext } from '../../contexts/AuthContext'
import { getSSOConfigByDomain, signInWithSAML, type SSOConfig } from '@/services/auth'

export const Login: React.FC = () => {
  const navigate = useNavigate()
  const { signIn, signInWithGoogle, loading, error, clearError } = useAuthContext()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [ssoConfig, setSsoConfig] = useState<SSOConfig | null>(null)
  const [ssoLoading, setSsoLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    setIsSubmitting(true)

    try {
      await signIn(email, password)
      navigate('/dashboard')
    } catch (err) {
      console.error('Login failed:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleSignIn = async () => {
    clearError()
    try {
      await signInWithGoogle()
      navigate('/dashboard')
    } catch (err) {
      console.error('Google sign-in failed:', err)
    }
  }

  // Detect SSO when email domain changes
  const checkSSOForDomain = useCallback(async (emailValue: string) => {
    const domain = emailValue.split('@')[1]
    if (!domain || domain.length < 3) {
      setSsoConfig(null)
      return
    }

    setSsoLoading(true)
    try {
      const config = await getSSOConfigByDomain(domain)
      setSsoConfig(config)
    } catch {
      setSsoConfig(null)
    } finally {
      setSsoLoading(false)
    }
  }, [])

  const handleEmailBlur = () => {
    if (email) {
      checkSSOForDomain(email)
    }
  }

  const handleSSOLogin = async () => {
    if (!ssoConfig?.providerId) return

    clearError()
    setIsSubmitting(true)
    try {
      await signInWithSAML(ssoConfig.providerId)
      navigate('/dashboard')
    } catch (err) {
      console.error('SSO login failed:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-genesis-soft via-white to-blue-50 flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0f172a] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-genesis-primary/20 via-transparent to-green-500/10" />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-genesis-surface/10 backdrop-blur rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold tracking-tight">CLÍNICA GENESIS</span>
          </Link>

          <div className="space-y-6">
            <h1 className="text-4xl font-bold leading-tight">
              Gestão clínica
              <br />
              <span className="text-genesis-primary">inteligente</span> e<br />
              humanizada.
            </h1>
            <p className="text-white/60 text-lg max-w-md">
              Simplifique sua rotina, encante seus pacientes e foque no que realmente importa:
              cuidar de pessoas.
            </p>
          </div>

          <p className="text-white/40 text-sm">
            &copy; 2025 Clínica Genesis. Todos os direitos reservados.
          </p>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-genesis-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/4 -right-16 w-64 h-64 bg-green-500/10 rounded-full blur-3xl" />
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 bg-genesis-primary rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold text-genesis-dark">CLÍNICA GENESIS</span>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-bold text-genesis-dark">Bem-vindo de volta</h2>
            <p className="text-genesis-medium mt-2">Entre na sua conta para continuar</p>
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-genesis-dark">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-genesis-medium" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onBlur={handleEmailBlur}
                  placeholder="seu@email.com"
                  required
                  className="w-full pl-12 pr-4 py-3 bg-genesis-surface border border-genesis-border rounded-xl text-genesis-dark placeholder-genesis-medium/50 focus:outline-none focus:ring-2 focus:ring-genesis-primary/20 focus:border-genesis-primary transition-all"
                />
              </div>
            </div>

            {/* SSO Detection Banner */}
            {ssoConfig?.enabled && (
              <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-indigo-700">
                  <Building2 className="w-5 h-5" />
                  <span className="font-medium">SSO Corporativo Detectado</span>
                </div>
                <p className="text-sm text-indigo-600">
                  Sua organização usa login único. Clique abaixo para entrar com{' '}
                  <strong>{ssoConfig.providerName || 'SSO'}</strong>.
                </p>
                <button
                  type="button"
                  onClick={handleSSOLogin}
                  disabled={isSubmitting || ssoLoading}
                  className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Building2 className="w-5 h-5" />
                  {isSubmitting
                    ? 'Entrando...'
                    : `Entrar com ${ssoConfig.providerName || 'SSO Corporativo'}`}
                </button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-indigo-200" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-indigo-50 text-indigo-400">ou use email/senha</span>
                  </div>
                </div>
              </div>
            )}

            {ssoLoading && (
              <div className="flex items-center justify-center py-2 text-sm text-genesis-muted">
                <div className="w-4 h-4 border-2 border-genesis-primary border-t-transparent rounded-full animate-spin mr-2" />
                Verificando SSO...
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-semibold text-genesis-dark">
                  Senha
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-genesis-primary hover:text-blue-600 transition-colors"
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-genesis-medium" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-12 pr-12 py-3 bg-genesis-surface border border-genesis-border rounded-xl text-genesis-dark placeholder-genesis-medium/50 focus:outline-none focus:ring-2 focus:ring-genesis-primary/20 focus:border-genesis-primary transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-genesis-medium hover:text-genesis-dark transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="w-full py-3 bg-genesis-primary text-white font-semibold rounded-xl hover:bg-genesis-primary-dark focus:outline-none focus:ring-2 focus:ring-genesis-primary/20 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-genesis-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gradient-to-br from-genesis-soft via-white to-blue-50 text-genesis-medium">
                ou continue com
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-3 bg-genesis-surface border border-genesis-border rounded-xl font-medium text-genesis-dark hover:bg-genesis-soft focus:outline-none focus:ring-2 focus:ring-genesis-border transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google
          </button>

          <p className="text-center text-sm text-genesis-medium">
            Não tem uma conta?{' '}
            <Link
              to="/register"
              className="font-semibold text-genesis-primary hover:text-blue-600 transition-colors"
            >
              Criar conta
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
