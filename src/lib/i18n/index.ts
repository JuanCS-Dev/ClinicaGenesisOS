/**
 * i18n Module
 *
 * Internationalization for Clínica Genesis OS.
 * Supports pt-BR, en-US, and es-ES.
 *
 * @module lib/i18n
 */

export { default as i18n } from './config'
export {
  SUPPORTED_LANGUAGES,
  LANGUAGE_NAMES,
  LANGUAGE_FLAGS,
  type SupportedLanguage,
} from './config'
export { ptBR } from './locales/pt-BR'
export { enUS } from './locales/en-US'
export { esES } from './locales/es-ES'
