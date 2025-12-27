/**
 * AI Scribe Cloud Function
 * ========================
 *
 * Processa gravações de áudio usando Gemini via Vertex AI.
 * Gera transcrição e notas SOAP em uma única chamada.
 *
 * IMPORTANTE: Usa SOMENTE Vertex AI (ADC) - não usa API keys.
 *
 * Trigger: Firestore onCreate on /clinics/{clinicId}/aiScribeSessions/{sessionId}
 */

import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { logger } from 'firebase-functions';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { getVertexAIClient, isFeatureEnabled } from '../utils/config.js';
import {
  MEDICAL_SCRIBE_SYSTEM_PROMPT,
  TRANSCRIPTION_AND_SOAP_PROMPT,
  PROMPT_VERSION,
} from './prompts.js';

interface AIScribeResult {
  transcription: string;
  soap: {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
  };
  extractedData?: {
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
  };
  confidence?: number;
  processingTimeMs?: number;
}

interface AIMetadata {
  generated: boolean;
  provider: 'vertex-ai';
  model: string;
  promptVersion: string;
  generatedAt: string;
}

const GEMINI_MODEL = 'gemini-2.5-flash';

/**
 * Download audio file from Cloud Storage.
 */
async function downloadAudioFile(audioPath: string): Promise<Buffer> {
  const storage = getStorage();
  // Use explicit bucket name to ensure correct bucket
  const bucket = storage.bucket('clinica-genesis-os-e689e.firebasestorage.app');
  const file = bucket.file(audioPath);

  const [exists] = await file.exists();
  if (!exists) {
    throw new Error(`Audio file not found: ${audioPath}`);
  }

  const [buffer] = await file.download();
  return buffer;
}

/**
 * Process audio with Gemini via Vertex AI and generate SOAP.
 */
async function processAudioWithGemini(
  audioBuffer: Buffer
): Promise<AIScribeResult> {
  const startTime = Date.now();

  const client = await getVertexAIClient();

  // Convert audio to base64 for inline data
  const audioBase64 = audioBuffer.toString('base64');

  const response = await client.models.generateContent({
    model: GEMINI_MODEL,
    config: {
      systemInstruction: MEDICAL_SCRIBE_SYSTEM_PROMPT,
    },
    contents: [
      {
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType: 'audio/webm',
              data: audioBase64,
            },
          },
          { text: TRANSCRIPTION_AND_SOAP_PROMPT },
        ],
      },
    ],
  });

  const text = response.text;
  if (!text) {
    throw new Error('Empty response from Gemini');
  }

  // Parse JSON response
  let parsed: AIScribeResult;
  try {
    // Remove markdown code blocks if present
    const jsonStr = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new Error(`Failed to parse Gemini response: ${text.slice(0, 200)}`);
  }

  parsed.processingTimeMs = Date.now() - startTime;

  return parsed;
}

/**
 * Cloud Function: Process AI Scribe Session
 *
 * Triggered when a new session document is created.
 * Downloads audio, processes with Gemini via Vertex AI, updates session with result.
 */
export const processAudioScribe = onDocumentCreated(
  {
    document: 'clinics/{clinicId}/aiScribeSessions/{sessionId}',
    region: 'southamerica-east1',
    memory: '1GiB',
    timeoutSeconds: 120,
  },
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
      logger.error('No data in event');
      return;
    }

    const { clinicId, sessionId } = event.params;
    const session = snapshot.data();
    const db = getFirestore();
    const sessionRef = db
      .collection('clinics')
      .doc(clinicId)
      .collection('aiScribeSessions')
      .doc(sessionId);

    try {
      // Check if feature is enabled
      const enabled = await isFeatureEnabled(clinicId, 'ai-scribe');
      if (!enabled) {
        await sessionRef.update({
          status: 'error',
          error: 'AI Scribe not enabled for this clinic',
          completedAt: new Date().toISOString(),
        });
        return;
      }

      // Get audio path
      const audioUrl = session.audioUrl as string | undefined;
      if (!audioUrl) {
        await sessionRef.update({
          status: 'error',
          error: 'No audio URL in session',
          completedAt: new Date().toISOString(),
        });
        return;
      }

      logger.info(`Processing audio for session ${sessionId}: ${audioUrl}`);

      // Download audio
      const audioBuffer = await downloadAudioFile(audioUrl);
      logger.info(`Downloaded audio: ${audioBuffer.length} bytes`);

      // Process with Gemini via Vertex AI
      const result = await processAudioWithGemini(audioBuffer);
      logger.info(`Processed in ${result.processingTimeMs}ms`);

      // Create AI metadata
      const aiMetadata: AIMetadata = {
        generated: true,
        provider: 'vertex-ai',
        model: GEMINI_MODEL,
        promptVersion: PROMPT_VERSION,
        generatedAt: new Date().toISOString(),
      };

      // Update session with result
      await sessionRef.update({
        status: 'ready',
        result,
        aiMetadata,
        completedAt: new Date().toISOString(),
      });

      logger.info(`Session ${sessionId} completed successfully`);
    } catch (error) {
      logger.error(`Error processing session ${sessionId}:`, { error });

      await sessionRef.update({
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        completedAt: new Date().toISOString(),
      });
    }
  }
);
