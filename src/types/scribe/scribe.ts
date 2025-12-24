/**
 * AI Scribe Types
 *
 * Types for the AI Scribe audio transcription system.
 */

import type { AIMetadata } from '../ai/providers';
import type { SoapRecord } from '../records/medical';

/**
 * Status of an AI Scribe recording/processing session.
 */
export type AIScribeStatus =
  | 'idle'
  | 'recording'
  | 'paused'
  | 'uploading'
  | 'processing'
  | 'ready'
  | 'error';

/**
 * Extracted data from audio transcription.
 */
export interface AIScribeExtractedData {
  chiefComplaint?: string;
  symptoms?: string[];
  medications?: string[];
  allergies?: string[];
  vitalSigns?: {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    weight?: number;
    height?: number;
  };
}

/**
 * Result from AI Scribe processing.
 */
export interface AIScribeResult {
  transcription: string;
  soap: {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
  };
  extractedData?: AIScribeExtractedData;
  confidence?: number;
  processingTimeMs?: number;
}

/**
 * AI Scribe session tracking.
 */
export interface AIScribeSession {
  id: string;
  patientId: string;
  clinicId: string;
  status: AIScribeStatus;
  audioUrl?: string;
  audioDurationSec?: number;
  result?: AIScribeResult;
  error?: string;
  aiMetadata?: AIMetadata;
  createdAt: string;
  completedAt?: string;
}

/**
 * Extended SOAP record with AI generation support.
 */
export interface AISoapRecord extends SoapRecord {
  aiMetadata?: AIMetadata;
  transcription?: string; // Original audio transcription
}
