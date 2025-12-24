/**
 * Exam Analysis Types
 *
 * Types for AI-powered exam analysis.
 */

import type { AIMetadata } from './providers';

/**
 * Exam analysis result from AI Diagnostic Helper.
 */
export interface ExamAnalysis {
  id: string;
  patientId: string;
  examType: string;
  analyzedAt: string;
  analyzedBy: string; // userId who requested
  aiMetadata: AIMetadata;
  values: Array<{
    name: string;
    value: string;
    unit: string;
    referenceRange: string;
    status: 'normal' | 'altered' | 'critical';
    note?: string;
  }>;
  summary: string;
  attentionPoints: string[];
  suggestedQuestions: string[];
  attachmentId?: string; // Reference to uploaded exam image/PDF
}
