/**
 * AI Service Tests
 *
 * Tests for AI configuration and utility functions.
 *
 * @module __tests__/services/ai.service
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Store original env values
const originalEnv = { ...import.meta.env }

describe('AI Service', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    // Restore env
    Object.assign(import.meta.env, originalEnv)
  })

  describe('getAIConfig', () => {
    it('should return shared config in MVP mode', async () => {
      import.meta.env.VITE_MVP_MODE = 'true'
      import.meta.env.VITE_GOOGLE_AI_API_KEY = 'test-shared-key'

      const { getAIConfig } = await import('../../services/ai.service')

      const config = getAIConfig()

      expect(config.provider).toBe('google-ai-studio')
      expect(config.apiKey).toBe('test-shared-key')
      expect(config.isShared).toBe(true)
    })

    it('should return shared config when useSharedKey is true', async () => {
      import.meta.env.VITE_MVP_MODE = 'false'
      import.meta.env.VITE_GOOGLE_AI_API_KEY = 'test-shared-key'

      const { getAIConfig } = await import('../../services/ai.service')

      const config = getAIConfig({ useSharedKey: true })

      expect(config.isShared).toBe(true)
    })

    it('should return shared config when no clinic config provided', async () => {
      import.meta.env.VITE_MVP_MODE = 'false'
      import.meta.env.VITE_GOOGLE_AI_API_KEY = 'test-shared-key'

      const { getAIConfig } = await import('../../services/ai.service')

      const config = getAIConfig()

      expect(config.isShared).toBe(true)
    })

    it('should return clinic config in production mode', async () => {
      import.meta.env.VITE_MVP_MODE = 'false'
      import.meta.env.VITE_GOOGLE_AI_API_KEY = 'shared-key'

      const { getAIConfig } = await import('../../services/ai.service')

      const clinicConfig = {
        provider: 'vertex-ai' as const,
        apiKey: 'clinic-api-key',
        enabled: true,
        useSharedKey: false,
      }

      const config = getAIConfig(clinicConfig)

      expect(config.provider).toBe('vertex-ai')
      expect(config.apiKey).toBe('clinic-api-key')
      expect(config.isShared).toBe(false)
    })

    it('should handle empty API key', async () => {
      import.meta.env.VITE_MVP_MODE = 'false'
      import.meta.env.VITE_GOOGLE_AI_API_KEY = ''

      const { getAIConfig } = await import('../../services/ai.service')

      const clinicConfig = {
        provider: 'vertex-ai' as const,
        enabled: true,
        useSharedKey: false,
      }

      const config = getAIConfig(clinicConfig)

      expect(config.apiKey).toBe('')
    })
  })

  describe('createAIMetadata', () => {
    it('should create metadata with google-ai-studio in MVP mode', async () => {
      import.meta.env.VITE_MVP_MODE = 'true'

      const { createAIMetadata } = await import('../../services/ai.service')

      const metadata = createAIMetadata('gemini-flash', 'v1.0.0')

      expect(metadata.generated).toBe(true)
      expect(metadata.provider).toBe('google-ai-studio')
      expect(metadata.model).toBe('gemini-flash')
      expect(metadata.promptVersion).toBe('v1.0.0')
      expect(metadata.generatedAt).toBeDefined()
    })

    it('should create metadata with vertex-ai in production mode', async () => {
      import.meta.env.VITE_MVP_MODE = 'false'

      const { createAIMetadata } = await import('../../services/ai.service')

      const metadata = createAIMetadata('gemini-pro', 'v2.0.0')

      expect(metadata.provider).toBe('vertex-ai')
      expect(metadata.model).toBe('gemini-pro')
      expect(metadata.promptVersion).toBe('v2.0.0')
    })

    it('should include timestamp in ISO format', async () => {
      const { createAIMetadata } = await import('../../services/ai.service')

      const beforeTime = new Date().toISOString()
      const metadata = createAIMetadata('test-model', 'v1.0')
      const afterTime = new Date().toISOString()

      expect(metadata.generatedAt >= beforeTime).toBe(true)
      expect(metadata.generatedAt <= afterTime).toBe(true)
    })
  })

  describe('isAIAvailable', () => {
    it('should return true in MVP mode with shared key', async () => {
      import.meta.env.VITE_MVP_MODE = 'true'
      import.meta.env.VITE_GOOGLE_AI_API_KEY = 'test-key'

      const { isAIAvailable } = await import('../../services/ai.service')

      expect(isAIAvailable()).toBe(true)
    })

    it('should return false in MVP mode without shared key', async () => {
      import.meta.env.VITE_MVP_MODE = 'true'
      import.meta.env.VITE_GOOGLE_AI_API_KEY = ''

      const { isAIAvailable } = await import('../../services/ai.service')

      expect(isAIAvailable()).toBe(false)
    })

    it('should check clinic config in production mode', async () => {
      import.meta.env.VITE_MVP_MODE = 'false'

      const { isAIAvailable } = await import('../../services/ai.service')

      expect(isAIAvailable({ enabled: true })).toBe(true)
      expect(isAIAvailable({ enabled: false })).toBe(false)
    })

    it('should return false when no clinic config in production', async () => {
      import.meta.env.VITE_MVP_MODE = 'false'

      const { isAIAvailable } = await import('../../services/ai.service')

      expect(isAIAvailable()).toBe(false)
    })
  })

  describe('isFeatureEnabled', () => {
    it('should return false when AI is not available', async () => {
      import.meta.env.VITE_MVP_MODE = 'true'
      import.meta.env.VITE_GOOGLE_AI_API_KEY = ''

      const { isFeatureEnabled } = await import('../../services/ai.service')

      expect(isFeatureEnabled('scribe')).toBe(false)
      expect(isFeatureEnabled('diagnosticHelper')).toBe(false)
    })

    it('should return true for all features in MVP mode with key', async () => {
      import.meta.env.VITE_MVP_MODE = 'true'
      import.meta.env.VITE_GOOGLE_AI_API_KEY = 'test-key'

      const { isFeatureEnabled } = await import('../../services/ai.service')

      expect(isFeatureEnabled('scribe')).toBe(true)
      expect(isFeatureEnabled('diagnosticHelper')).toBe(true)
    })

    it('should check clinic features in production mode', async () => {
      import.meta.env.VITE_MVP_MODE = 'false'

      const { isFeatureEnabled } = await import('../../services/ai.service')

      const clinicConfig = {
        enabled: true,
        features: {
          scribe: true,
          diagnosticHelper: false,
        },
      }

      expect(isFeatureEnabled('scribe', clinicConfig)).toBe(true)
      expect(isFeatureEnabled('diagnosticHelper', clinicConfig)).toBe(false)
    })

    it('should return false for undefined features', async () => {
      import.meta.env.VITE_MVP_MODE = 'false'

      const { isFeatureEnabled } = await import('../../services/ai.service')

      const clinicConfig = {
        enabled: true,
        features: {},
      }

      expect(isFeatureEnabled('scribe', clinicConfig)).toBe(false)
    })
  })

  describe('constants', () => {
    it('should export PROMPT_VERSIONS', async () => {
      const { PROMPT_VERSIONS } = await import('../../services/ai.service')

      expect(PROMPT_VERSIONS.SOAP_GENERATOR).toBe('v1.0.0')
      expect(PROMPT_VERSIONS.INFO_EXTRACTOR).toBe('v1.0.0')
      expect(PROMPT_VERSIONS.EXAM_ANALYZER).toBe('v1.0.0')
    })

    it('should export AI_MODELS', async () => {
      const { AI_MODELS } = await import('../../services/ai.service')

      expect(AI_MODELS.GEMINI_FLASH).toBe('gemini-2.5-flash-preview-05-20')
      expect(AI_MODELS.GEMINI_FLASH_AUDIO).toBe('gemini-2.5-flash-native-audio-preview-12-2025')
    })
  })
})
