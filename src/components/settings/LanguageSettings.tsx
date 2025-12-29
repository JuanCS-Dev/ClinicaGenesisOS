/**
 * Language Settings Component
 *
 * Allows users to select their preferred language.
 * Persists selection to localStorage and updates i18n.
 *
 * @module components/settings/LanguageSettings
 */

import React from 'react'
import { useTranslation } from 'react-i18next'
import { Globe, Check } from 'lucide-react'
import {
  SUPPORTED_LANGUAGES,
  LANGUAGE_NAMES,
  LANGUAGE_FLAGS,
  type SupportedLanguage,
} from '@/lib/i18n'

export const LanguageSettings: React.FC = () => {
  const { t, i18n } = useTranslation()
  const currentLanguage = i18n.language as SupportedLanguage

  const handleLanguageChange = (lang: SupportedLanguage) => {
    i18n.changeLanguage(lang)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-genesis-primary/10 rounded-xl">
          <Globe className="w-5 h-5 text-genesis-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-genesis-dark">{t('settings.language')}</h3>
          <p className="text-sm text-genesis-muted">
            {t('common.select')} {t('settings.language').toLowerCase()}
          </p>
        </div>
      </div>

      {/* Language Options */}
      <div className="grid gap-3">
        {SUPPORTED_LANGUAGES.map(lang => {
          const isSelected =
            currentLanguage === lang || currentLanguage.startsWith(lang.split('-')[0])

          return (
            <button
              key={lang}
              onClick={() => handleLanguageChange(lang)}
              className={`
                flex items-center justify-between p-4 rounded-xl border-2 transition-all
                ${
                  isSelected
                    ? 'border-genesis-primary bg-genesis-primary/5'
                    : 'border-genesis-border-subtle hover:border-genesis-border hover:bg-genesis-hover'
                }
              `}
              aria-pressed={isSelected}
              aria-label={`${t('common.select')} ${LANGUAGE_NAMES[lang]}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl" role="img" aria-hidden="true">
                  {LANGUAGE_FLAGS[lang]}
                </span>
                <span
                  className={`font-medium ${isSelected ? 'text-genesis-primary' : 'text-genesis-dark'}`}
                >
                  {LANGUAGE_NAMES[lang]}
                </span>
              </div>
              {isSelected && (
                <div className="p-1 bg-genesis-primary rounded-full">
                  <Check className="w-4 h-4 text-white" aria-hidden="true" />
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Info */}
      <p className="text-xs text-genesis-muted">
        A alteração de idioma é aplicada imediatamente e salva automaticamente.
      </p>
    </div>
  )
}

export default LanguageSettings
