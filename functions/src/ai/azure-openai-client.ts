/**
 * Azure OpenAI Client for GPT-4o-mini
 *
 * Multi-LLM Consensus Engine - Fase 3.3.8
 *
 * Usado como "Challenger" no pipeline de diagnóstico diferencial.
 * GPT-4o-mini revisa e valida os diagnósticos do Gemini 2.5 Flash.
 *
 * Referência: NEJM AI 2024 - "Good answers are common to many LLMs"
 *
 * SECURITY: API key stored in Firebase Secret Manager
 *
 * @module functions/ai/azure-openai-client
 */

import { logger } from 'firebase-functions'
import { AZURE_OPENAI_KEY, getSecretOrUndefined } from '../config/secrets.js'

/**
 * Azure OpenAI configuration
 */
export interface AzureOpenAIConfig {
  endpoint: string
  apiKey: string
  deployment: string
  apiVersion: string
}

/**
 * Response from Azure OpenAI API
 */
export interface AzureOpenAIResponse {
  content: string
  tokensUsed: {
    prompt: number
    completion: number
    total: number
  }
  model: string
}

/**
 * Options for callAzureOpenAI
 */
export interface AzureOpenAIOptions {
  temperature?: number
  maxTokens?: number
  responseFormat?: 'json' | 'text'
  timeoutMs?: number
}

// =============================================================================
// DEFAULT CONFIGURATION
// =============================================================================

/**
 * Default Azure OpenAI configuration.
 * API key is loaded from Secret Manager at runtime.
 */
const DEFAULT_CONFIG: Omit<AzureOpenAIConfig, 'apiKey'> = {
  endpoint: 'https://eastus2.api.cognitive.microsoft.com/',
  deployment: 'gpt4o-mini',
  apiVersion: '2024-10-21',
}

// Lazy-loaded config singleton
let azureConfig: AzureOpenAIConfig | null = null

/**
 * Get Azure OpenAI configuration (lazy initialization).
 *
 * Configuration sources:
 * - AZURE_OPENAI_KEY: Firebase Secret Manager (required)
 * - AZURE_OPENAI_ENDPOINT: Environment variable (optional, has default)
 * - AZURE_OPENAI_DEPLOYMENT: Environment variable (optional, has default)
 * - AZURE_OPENAI_API_VERSION: Environment variable (optional, has default)
 *
 * IMPORTANT: Only call this inside a Cloud Function that has
 * AZURE_OPENAI_SECRETS declared in its secrets array.
 */
export function getAzureOpenAIConfig(): AzureOpenAIConfig {
  if (!azureConfig) {
    // API key from Secret Manager (optional - graceful fallback if not set)
    const apiKey = getSecretOrUndefined(AZURE_OPENAI_KEY) || ''

    azureConfig = {
      endpoint: process.env.AZURE_OPENAI_ENDPOINT || DEFAULT_CONFIG.endpoint,
      apiKey,
      deployment: process.env.AZURE_OPENAI_DEPLOYMENT || DEFAULT_CONFIG.deployment,
      apiVersion: process.env.AZURE_OPENAI_API_VERSION || DEFAULT_CONFIG.apiVersion,
    }
  }
  return azureConfig
}

/**
 * Check if Azure OpenAI is configured
 */
export function isAzureOpenAIConfigured(): boolean {
  const config = getAzureOpenAIConfig()
  return !!config.apiKey && !!config.endpoint
}

/**
 * Sleep utility for retry logic
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Call Azure OpenAI API with retry logic and error handling.
 *
 * Features:
 * - Exponential backoff retry (429, 500, 503)
 * - Configurable timeout (default 60s)
 * - Graceful fallback on failure (returns null, doesn't break pipeline)
 * - JSON mode support
 *
 * @param systemPrompt - System message for the model
 * @param userPrompt - User message with the query
 * @param options - Optional configuration
 * @returns Response content or null on failure
 */
export async function callAzureOpenAI(
  systemPrompt: string,
  userPrompt: string,
  options: AzureOpenAIOptions = {}
): Promise<AzureOpenAIResponse | null> {
  const config = getAzureOpenAIConfig()

  if (!config.apiKey) {
    logger.warn('[AzureOpenAI] API key not configured, skipping call')
    return null
  }

  const {
    temperature = 0.2,
    maxTokens = 4096,
    responseFormat = 'json',
    timeoutMs = 60000,
  } = options

  const url = `${config.endpoint}openai/deployments/${config.deployment}/chat/completions?api-version=${config.apiVersion}`

  const body = {
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature,
    max_tokens: maxTokens,
    ...(responseFormat === 'json' && {
      response_format: { type: 'json_object' },
    }),
  }

  const maxRetries = 3
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

      const startTime = Date.now()

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': config.apiKey,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      const elapsed = Date.now() - startTime

      if (response.ok) {
        const data = await response.json()
        const content = data.choices?.[0]?.message?.content || ''
        const usage = data.usage || {}

        logger.info(`[AzureOpenAI] Success in ${elapsed}ms, tokens: ${usage.total_tokens || 'N/A'}`)

        return {
          content,
          tokensUsed: {
            prompt: usage.prompt_tokens || 0,
            completion: usage.completion_tokens || 0,
            total: usage.total_tokens || 0,
          },
          model: data.model || config.deployment,
        }
      }

      // Handle retryable errors
      if ([429, 500, 502, 503].includes(response.status)) {
        const retryAfter = response.headers.get('Retry-After')
        const waitMs = retryAfter ? parseInt(retryAfter, 10) * 1000 : Math.pow(2, attempt) * 1000 // Exponential backoff

        logger.warn(
          `[AzureOpenAI] Retryable error ${response.status}, attempt ${attempt}/${maxRetries}, waiting ${waitMs}ms`
        )

        if (attempt < maxRetries) {
          await sleep(waitMs)
          continue
        }
      }

      // Non-retryable error
      const errorBody = await response.text()
      logger.error(`[AzureOpenAI] Error ${response.status}: ${errorBody.slice(0, 200)}`)
      lastError = new Error(`Azure OpenAI error: ${response.status}`)
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          logger.error(`[AzureOpenAI] Timeout after ${timeoutMs}ms`)
          lastError = new Error('Azure OpenAI timeout')
        } else {
          logger.error(`[AzureOpenAI] Network error: ${error.message}`)
          lastError = error
        }
      }

      // Retry on network errors
      if (attempt < maxRetries) {
        const waitMs = Math.pow(2, attempt) * 1000
        logger.warn(`[AzureOpenAI] Retrying in ${waitMs}ms, attempt ${attempt}/${maxRetries}`)
        await sleep(waitMs)
        continue
      }
    }
  }

  // All retries exhausted - return null for graceful fallback
  logger.error(`[AzureOpenAI] All ${maxRetries} attempts failed: ${lastError?.message}`)
  return null
}

/**
 * Parse JSON from Azure OpenAI response safely.
 *
 * Handles cases where model returns markdown code blocks.
 */
export function parseAzureResponse<T>(response: AzureOpenAIResponse | null): T | null {
  if (!response?.content) {
    return null
  }

  let content = response.content.trim()

  // Remove markdown code blocks if present
  if (content.startsWith('```json')) {
    content = content.slice(7)
  } else if (content.startsWith('```')) {
    content = content.slice(3)
  }
  if (content.endsWith('```')) {
    content = content.slice(0, -3)
  }

  try {
    return JSON.parse(content.trim()) as T
  } catch (error) {
    logger.error('[AzureOpenAI] Failed to parse JSON response:', { error })
    return null
  }
}
