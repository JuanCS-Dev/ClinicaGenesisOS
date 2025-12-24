/**
 * WhatsApp Settings Domain Types
 * ===============================
 *
 * Type definitions for WhatsApp Business API integration.
 *
 * @module components/settings/whatsapp/types
 */

/**
 * Template approval status from Meta Business.
 */
export type TemplateApprovalStatus = 'approved' | 'pending' | 'rejected';

/**
 * WhatsApp message template configuration.
 */
export interface WhatsAppTemplate {
  /** Template name (must match Meta Business) */
  name: string;
  /** Current approval status */
  status: TemplateApprovalStatus;
  /** Template category (UTILITY, MARKETING, etc.) */
  category: string;
  /** Language code (pt_BR, en_US, etc.) */
  language: string;
}

/**
 * WhatsApp Business API connection status.
 */
export interface WhatsAppConnectionStatus {
  /** Whether the API is connected and functional */
  connected: boolean;
  /** Connected phone number in E.164 format */
  phoneNumber?: string;
  /** Business name from Meta */
  businessName?: string;
  /** Last successful sync timestamp */
  lastSync?: string;
}

/**
 * Result of a connection test.
 */
export type ConnectionTestResult = 'success' | 'error' | null;

/**
 * Configuration step for WhatsApp setup.
 */
export interface ConfigurationStep {
  /** Step number (1-based) */
  step: number;
  /** Step title */
  title: string;
  /** Step description or additional info */
  description?: string;
  /** External link for more info */
  link?: {
    url: string;
    label: string;
  };
  /** Code snippet to show */
  code?: string;
}

/**
 * Automatic feature provided by the integration.
 */
export interface AutomaticFeature {
  /** Feature title */
  title: string;
  /** Feature description */
  description: string;
  /** Whether the feature is enabled */
  enabled: boolean;
}
