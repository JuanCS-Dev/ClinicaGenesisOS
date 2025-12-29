/**
 * i18n Configuration
 *
 * Internationalization setup using i18next with React bindings.
 * Supports pt-BR (default), en-US, and es-ES.
 *
 * @module lib/i18n/config
 */

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import { ptBR } from './locales/pt-BR'
import { enUS } from './locales/en-US'
import { esES } from './locales/es-ES'

/** Supported languages */
export const SUPPORTED_LANGUAGES = ['pt-BR', 'en-US', 'es-ES'] as const
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]

/** Language display names */
export const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  'pt-BR': 'Português (Brasil)',
  'en-US': 'English (US)',
  'es-ES': 'Español',
}

/** Language flags (emoji) */
export const LANGUAGE_FLAGS: Record<SupportedLanguage, string> = {
  'pt-BR': '🇧🇷',
  'en-US': '🇺🇸',
  'es-ES': '🇪🇸',
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      'pt-BR': { translation: ptBR },
      'en-US': { translation: enUS },
      'es-ES': { translation: esES },
    },
    fallbackLng: 'pt-BR',
    supportedLngs: SUPPORTED_LANGUAGES,
    interpolation: {
      escapeValue: false, // React already escapes
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'genesis-language',
    },
  })

export default i18n
