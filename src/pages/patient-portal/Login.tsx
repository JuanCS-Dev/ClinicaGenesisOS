/**
 * Patient Portal Login
 * ====================
 *
 * Magic Link authentication for patients.
 * No password required - just email verification.
 *
 * Inspired by Klara's frictionless patient access.
 *
 * @module pages/patient-portal/Login
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, CheckCircle2, Loader2, Shield } from 'lucide-react';
import { usePatientAuth } from '../../contexts/PatientAuthContext';
import { DEMO_CONFIG } from '@/config/demo';

export function PatientLogin(): React.ReactElement {
  const { sendMagicLink, loading, error, clearError } = usePatientAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      // TODO: In production, determine clinic from URL/subdomain or email lookup
      // For now using the demo clinic
      await sendMagicLink(email, DEMO_CONFIG.clinicId);
      setSent(true);
    } catch {
      // Error handled by context
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-genesis-soft to-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-genesis-surface rounded-3xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-success-soft flex items-center justify-center mb-6">
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
            <h1 className="text-2xl font-bold text-genesis-dark mb-2">
              Link enviado!
            </h1>
            <p className="text-genesis-muted mb-6">
              Enviamos um link de acesso para{' '}
              <strong className="text-genesis-dark">{email}</strong>
            </p>
            <div className="bg-genesis-soft rounded-xl p-4 text-sm text-genesis-medium">
              <p>
                Verifique sua caixa de entrada e clique no link para acessar
                seu portal.
              </p>
              <p className="mt-2 text-genesis-muted text-xs">
                O link expira em 1 hora. Não recebeu? Verifique o spam.
              </p>
            </div>
            <button
              onClick={() => {
                setSent(false);
                setEmail('');
              }}
              className="mt-6 text-genesis-primary hover:underline text-sm font-medium"
            >
              Usar outro email
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-genesis-soft to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-genesis-primary flex items-center justify-center mb-4 shadow-lg shadow-genesis-primary/20">
            <span className="text-white font-bold text-2xl">G</span>
          </div>
          <h1 className="text-2xl font-bold text-genesis-dark">
            Portal do Paciente
          </h1>
          <p className="text-genesis-muted mt-1">Clínica Genesis</p>
        </div>

        {/* Login Card */}
        <div className="bg-genesis-surface rounded-3xl shadow-xl p-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-genesis-dark">
              Acesse seu portal
            </h2>
            <p className="text-sm text-genesis-muted mt-1">
              Digite seu email para receber um link de acesso
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-genesis-dark mb-1.5"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-genesis-muted" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-genesis-border bg-genesis-soft text-genesis-dark placeholder:text-genesis-muted focus:outline-none focus:ring-2 focus:ring-genesis-primary focus:border-transparent transition-all"
                />
              </div>
              <p className="text-xs text-genesis-muted mt-1.5">
                Use o mesmo email cadastrado na clínica
              </p>
            </div>

            {error && (
              <div className="bg-danger-soft text-danger text-sm rounded-xl p-3 border border-danger/20">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-genesis-primary text-white font-medium hover:bg-genesis-primary-dark hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:translate-y-0"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  Enviar link de acesso
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Security Badge */}
          <div className="mt-6 pt-6 border-t border-genesis-border">
            <div className="flex items-center justify-center gap-2 text-xs text-genesis-muted">
              <Shield className="w-4 h-4" />
              <span>Acesso seguro sem senha</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-genesis-muted">
            Não tem cadastro?{' '}
            <Link
              to="/"
              className="text-genesis-primary hover:underline font-medium"
            >
              Entre em contato com a clínica
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default PatientLogin;
