/**
 * AI Provider Types
 *
 * Types for AI providers and metadata.
 */

/**
 * AI provider options.
 * MVP uses google-ai-studio (free), production uses client's vertex-ai.
 */
export type AIProvider = 'google-ai-studio' | 'vertex-ai';

/**
 * AI-generated content metadata for audit trail.
 */
export interface AIMetadata {
  generated: boolean;
  provider: AIProvider;
  model: string;
  promptVersion: string;
  generatedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
}
