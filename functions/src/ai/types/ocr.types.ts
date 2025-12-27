/**
 * OCR Types
 *
 * Type definitions for OCR extraction results.
 *
 * @module ai/types/ocr
 */

import type { RawLabResult } from './input.types.js';

/**
 * OCR extraction result.
 */
export interface OCRExtractionResult {
  /** Whether extraction was successful */
  success: boolean;
  /** Extracted lab results */
  labResults: RawLabResult[];
  /** Lab name (if detected) */
  laboratoryName?: string;
  /** Collection date (if detected) */
  collectionDate?: string;
  /** Patient name (if detected) */
  patientName?: string;
  /** Raw text (for debugging) */
  rawText?: string;
  /** Confidence score */
  confidence: number;
  /** Errors encountered */
  errors?: string[];
}
