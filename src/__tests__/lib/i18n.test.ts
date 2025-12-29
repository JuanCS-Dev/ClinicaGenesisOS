/**
 * i18n Configuration Tests
 *
 * Tests for internationalization setup and translation files.
 *
 * @module __tests__/lib/i18n
 */

import { describe, it, expect, beforeEach } from 'vitest'
import i18n from '../../lib/i18n/config'
import { SUPPORTED_LANGUAGES, LANGUAGE_NAMES, LANGUAGE_FLAGS } from '../../lib/i18n'
import { ptBR } from '../../lib/i18n/locales/pt-BR'
import { enUS } from '../../lib/i18n/locales/en-US'
import { esES } from '../../lib/i18n/locales/es-ES'

describe('i18n Configuration', () => {
  beforeEach(() => {
    i18n.changeLanguage('pt-BR')
  })

  describe('setup', () => {
    it('should be initialized', () => {
      expect(i18n.isInitialized).toBe(true)
    })

    it('should have pt-BR as fallback language', () => {
      expect(i18n.options.fallbackLng).toContain('pt-BR')
    })

    it('should support all defined languages', () => {
      expect(i18n.options.supportedLngs).toEqual(expect.arrayContaining(SUPPORTED_LANGUAGES))
    })
  })

  describe('language switching', () => {
    it('should switch to English', async () => {
      await i18n.changeLanguage('en-US')
      expect(i18n.language).toBe('en-US')
    })

    it('should switch to Spanish', async () => {
      await i18n.changeLanguage('es-ES')
      expect(i18n.language).toBe('es-ES')
    })

    it('should switch back to Portuguese', async () => {
      await i18n.changeLanguage('en-US')
      await i18n.changeLanguage('pt-BR')
      expect(i18n.language).toBe('pt-BR')
    })
  })

  describe('translations', () => {
    it('should translate common.save in Portuguese', async () => {
      await i18n.changeLanguage('pt-BR')
      expect(i18n.t('common.save')).toBe('Salvar')
    })

    it('should translate common.save in English', async () => {
      await i18n.changeLanguage('en-US')
      expect(i18n.t('common.save')).toBe('Save')
    })

    it('should translate common.save in Spanish', async () => {
      await i18n.changeLanguage('es-ES')
      expect(i18n.t('common.save')).toBe('Guardar')
    })

    it('should handle interpolation', async () => {
      await i18n.changeLanguage('pt-BR')
      expect(i18n.t('dashboard.welcome', { name: 'João' })).toBe('Olá, João!')
    })
  })
})

describe('Language Constants', () => {
  describe('SUPPORTED_LANGUAGES', () => {
    it('should include pt-BR', () => {
      expect(SUPPORTED_LANGUAGES).toContain('pt-BR')
    })

    it('should include en-US', () => {
      expect(SUPPORTED_LANGUAGES).toContain('en-US')
    })

    it('should include es-ES', () => {
      expect(SUPPORTED_LANGUAGES).toContain('es-ES')
    })

    it('should have exactly 3 languages', () => {
      expect(SUPPORTED_LANGUAGES).toHaveLength(3)
    })
  })

  describe('LANGUAGE_NAMES', () => {
    it('should have names for all supported languages', () => {
      SUPPORTED_LANGUAGES.forEach(lang => {
        expect(LANGUAGE_NAMES[lang]).toBeDefined()
        expect(typeof LANGUAGE_NAMES[lang]).toBe('string')
      })
    })
  })

  describe('LANGUAGE_FLAGS', () => {
    it('should have flags for all supported languages', () => {
      SUPPORTED_LANGUAGES.forEach(lang => {
        expect(LANGUAGE_FLAGS[lang]).toBeDefined()
        expect(typeof LANGUAGE_FLAGS[lang]).toBe('string')
      })
    })
  })
})

describe('Translation Files Completeness', () => {
  // Get all keys from Portuguese (source of truth)
  const getKeys = (obj: Record<string, unknown>, prefix = ''): string[] => {
    return Object.entries(obj).flatMap(([key, value]) => {
      const fullKey = prefix ? `${prefix}.${key}` : key
      if (typeof value === 'object' && value !== null) {
        return getKeys(value as Record<string, unknown>, fullKey)
      }
      return [fullKey]
    })
  }

  const ptKeys = getKeys(ptBR)

  it('should have all Portuguese keys in English', () => {
    const enKeys = getKeys(enUS)
    ptKeys.forEach(key => {
      expect(enKeys).toContain(key)
    })
  })

  it('should have all Portuguese keys in Spanish', () => {
    const esKeys = getKeys(esES)
    ptKeys.forEach(key => {
      expect(esKeys).toContain(key)
    })
  })

  it('should have same number of keys in all languages', () => {
    const enKeys = getKeys(enUS)
    const esKeys = getKeys(esES)
    expect(enKeys.length).toBe(ptKeys.length)
    expect(esKeys.length).toBe(ptKeys.length)
  })
})

describe('Translation Categories', () => {
  it('should have common translations', () => {
    expect(ptBR.common).toBeDefined()
    expect(enUS.common).toBeDefined()
    expect(esES.common).toBeDefined()
  })

  it('should have navigation translations', () => {
    expect(ptBR.nav).toBeDefined()
    expect(enUS.nav).toBeDefined()
    expect(esES.nav).toBeDefined()
  })

  it('should have authentication translations', () => {
    expect(ptBR.auth).toBeDefined()
    expect(enUS.auth).toBeDefined()
    expect(esES.auth).toBeDefined()
  })

  it('should have patient translations', () => {
    expect(ptBR.patients).toBeDefined()
    expect(enUS.patients).toBeDefined()
    expect(esES.patients).toBeDefined()
  })

  it('should have accessibility translations', () => {
    expect(ptBR.a11y).toBeDefined()
    expect(enUS.a11y).toBeDefined()
    expect(esES.a11y).toBeDefined()
  })

  it('should have error translations', () => {
    expect(ptBR.errors).toBeDefined()
    expect(enUS.errors).toBeDefined()
    expect(esES.errors).toBeDefined()
  })
})
