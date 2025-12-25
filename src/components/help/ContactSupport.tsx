/**
 * ContactSupport Component
 *
 * Support contact form with multiple channels.
 * Inspired by Intercom and Zendesk contact forms.
 *
 * Features:
 * - Category selection
 * - Priority indication
 * - File attachments (UI only)
 * - Multiple contact channels
 */

import React, { useState, useCallback } from 'react'
import { Send, Mail, MessageCircle, Phone, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

interface ContactFormData {
  category: string
  priority: 'low' | 'medium' | 'high'
  subject: string
  message: string
  email: string
}

interface ContactSupportProps {
  /** User's email (pre-filled if available) */
  userEmail?: string
  /** Callback when form is submitted */
  onSubmit?: (data: ContactFormData) => Promise<void>
}

/**
 * Support categories for routing.
 */
const SUPPORT_CATEGORIES = [
  { value: 'tecnico', label: 'Problema Técnico' },
  { value: 'faturamento', label: 'Dúvida de Faturamento' },
  { value: 'agenda', label: 'Problema com Agenda' },
  { value: 'prontuario', label: 'Prontuário/Documentação' },
  { value: 'whatsapp', label: 'Integração WhatsApp' },
  { value: 'sugestao', label: 'Sugestão de Melhoria' },
  { value: 'outro', label: 'Outro Assunto' },
]

/**
 * Priority levels.
 */
const PRIORITY_LEVELS = [
  { value: 'low', label: 'Baixa', description: 'Pode esperar alguns dias' },
  { value: 'medium', label: 'Média', description: 'Preciso de ajuda em breve' },
  { value: 'high', label: 'Alta', description: 'Urgente, afeta meu trabalho' },
]

/**
 * Contact support form with multiple channels.
 *
 * @example
 * <ContactSupport
 *   userEmail="doctor@clinic.com"
 *   onSubmit={async (data) => {
 *     await sendSupportRequest(data);
 *   }}
 * />
 */
export function ContactSupport({
  userEmail = '',
  onSubmit,
}: ContactSupportProps): React.ReactElement {
  const [formData, setFormData] = useState<ContactFormData>({
    category: '',
    priority: 'medium',
    subject: '',
    message: '',
    email: userEmail,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleChange = useCallback((field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setIsSubmitting(true)
      setSubmitStatus('idle')

      try {
        if (onSubmit) {
          await onSubmit(formData)
        }
        setSubmitStatus('success')
        setFormData(prev => ({
          ...prev,
          subject: '',
          message: '',
        }))
      } catch {
        setSubmitStatus('error')
      } finally {
        setIsSubmitting(false)
      }
    },
    [formData, onSubmit]
  )

  const isValid = formData.category && formData.subject && formData.message && formData.email

  return (
    <div className="space-y-8">
      {/* Contact Channels */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <a
          href={`mailto:${import.meta.env.VITE_SUPPORT_EMAIL || 'suporte@clinicagenesis.com.br'}`}
          className="
            flex items-center gap-3 p-4 rounded-xl
            bg-genesis-surface border border-genesis-border-subtle
            hover:border-genesis-primary/30 hover:shadow-md
            transition-all group
          "
        >
          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30">
            <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="font-medium text-genesis-dark text-sm group-hover:text-genesis-primary transition-colors">
              E-mail
            </p>
            <p className="text-xs text-genesis-muted">
              {import.meta.env.VITE_SUPPORT_EMAIL || 'suporte@clinicagenesis.com.br'}
            </p>
          </div>
        </a>

        <a
          href={`https://wa.me/${import.meta.env.VITE_SUPPORT_WHATSAPP || ''}`}
          target="_blank"
          rel="noopener noreferrer"
          className="
            flex items-center gap-3 p-4 rounded-xl
            bg-genesis-surface border border-genesis-border-subtle
            hover:border-genesis-primary/30 hover:shadow-md
            transition-all group
          "
        >
          <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/30">
            <MessageCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="font-medium text-genesis-dark text-sm group-hover:text-genesis-primary transition-colors">
              WhatsApp
            </p>
            <p className="text-xs text-genesis-muted">
              {import.meta.env.VITE_SUPPORT_WHATSAPP_DISPLAY || 'Configurar em .env'}
            </p>
          </div>
        </a>

        <a
          href={`tel:${import.meta.env.VITE_SUPPORT_PHONE || ''}`}
          className="
            flex items-center gap-3 p-4 rounded-xl
            bg-genesis-surface border border-genesis-border-subtle
            hover:border-genesis-primary/30 hover:shadow-md
            transition-all group
          "
        >
          <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/30">
            <Phone className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="font-medium text-genesis-dark text-sm group-hover:text-genesis-primary transition-colors">
              Telefone
            </p>
            <p className="text-xs text-genesis-muted">
              {import.meta.env.VITE_SUPPORT_PHONE_DISPLAY || 'Configurar em .env'}
            </p>
          </div>
        </a>
      </div>

      {/* Contact Form */}
      <div className="bg-genesis-surface rounded-xl border border-genesis-border-subtle p-6">
        <h3 className="font-semibold text-genesis-dark mb-6">Enviar Mensagem</h3>

        {submitStatus === 'success' ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
            <h4 className="font-semibold text-genesis-dark mb-2">Mensagem Enviada!</h4>
            <p className="text-sm text-genesis-muted mb-4">
              Recebemos sua mensagem e responderemos em breve.
            </p>
            <button
              onClick={() => setSubmitStatus('idle')}
              className="text-sm text-genesis-primary font-medium hover:underline"
            >
              Enviar outra mensagem
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-genesis-dark mb-2">
                Categoria *
              </label>
              <select
                value={formData.category}
                onChange={e => handleChange('category', e.target.value)}
                className="
                  w-full px-4 py-2.5 rounded-lg
                  bg-genesis-bg border border-genesis-border
                  text-genesis-dark
                  focus:outline-none focus:ring-2 focus:ring-genesis-primary focus:border-transparent
                "
                required
              >
                <option value="">Selecione uma categoria</option>
                {SUPPORT_CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-genesis-dark mb-2">Prioridade</label>
              <div className="grid grid-cols-3 gap-3">
                {PRIORITY_LEVELS.map(level => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => handleChange('priority', level.value)}
                    className={`
                      p-3 rounded-lg text-center transition-all
                      ${
                        formData.priority === level.value
                          ? 'bg-genesis-primary/10 border-2 border-genesis-primary text-genesis-primary'
                          : 'bg-genesis-soft border-2 border-transparent text-genesis-medium hover:bg-genesis-hover'
                      }
                    `}
                  >
                    <span className="block text-sm font-medium">{level.label}</span>
                    <span className="block text-[10px] opacity-70 mt-0.5">{level.description}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-genesis-dark mb-2">
                Seu E-mail *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={e => handleChange('email', e.target.value)}
                placeholder="seu@email.com"
                className="
                  w-full px-4 py-2.5 rounded-lg
                  bg-genesis-bg border border-genesis-border
                  text-genesis-dark placeholder-genesis-muted
                  focus:outline-none focus:ring-2 focus:ring-genesis-primary focus:border-transparent
                "
                required
              />
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-genesis-dark mb-2">Assunto *</label>
              <input
                type="text"
                value={formData.subject}
                onChange={e => handleChange('subject', e.target.value)}
                placeholder="Descreva brevemente o assunto"
                className="
                  w-full px-4 py-2.5 rounded-lg
                  bg-genesis-bg border border-genesis-border
                  text-genesis-dark placeholder-genesis-muted
                  focus:outline-none focus:ring-2 focus:ring-genesis-primary focus:border-transparent
                "
                required
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-genesis-dark mb-2">Mensagem *</label>
              <textarea
                value={formData.message}
                onChange={e => handleChange('message', e.target.value)}
                placeholder="Descreva seu problema ou dúvida em detalhes..."
                rows={5}
                className="
                  w-full px-4 py-2.5 rounded-lg resize-none
                  bg-genesis-bg border border-genesis-border
                  text-genesis-dark placeholder-genesis-muted
                  focus:outline-none focus:ring-2 focus:ring-genesis-primary focus:border-transparent
                "
                required
              />
            </div>

            {/* Error message */}
            {submitStatus === 'error' && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>Erro ao enviar mensagem. Tente novamente.</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="
                w-full flex items-center justify-center gap-2
                px-6 py-3 rounded-xl font-medium
                bg-genesis-primary text-white
                hover:bg-genesis-primary-dark
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all
              "
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Enviar Mensagem
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default ContactSupport
