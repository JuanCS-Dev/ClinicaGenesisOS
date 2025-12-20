/**
 * Lab Values Extraction via Gemini Vision
 * ========================================
 *
 * OCR and structured extraction of lab results from PDF/image uploads.
 * Uses Gemini Vision for multimodal processing.
 */

import { getVertexAIClient } from '../utils/config.js';
import { OCRExtractionResult, RawLabResult } from './types.js';

const PROMPT_VERSION = 'v1.0.0';
const GEMINI_MODEL = 'gemini-2.5-flash';

/**
 * System prompt for lab value extraction.
 */
const EXTRACTION_SYSTEM_PROMPT = `Você é um especialista em extração de dados de exames laboratoriais.
Sua tarefa é extrair TODOS os valores laboratoriais de imagens/PDFs de exames.

DIRETRIZES:
1. Extraia TODOS os marcadores, mesmo parcialmente legíveis
2. Mantenha exatamente os nomes como aparecem no documento
3. Inclua unidades e valores de referência quando disponíveis
4. Marque com [?] valores ilegíveis ou incertos
5. Identifique o laboratório e data de coleta se visíveis`;

/**
 * User prompt for extraction.
 */
const EXTRACTION_USER_PROMPT = `Analise esta imagem de exame laboratorial e extraia:

1. TODOS os valores laboratoriais encontrados
2. Nome do laboratório (se visível)
3. Data de coleta (se visível)
4. Nome do paciente (se visível - para verificação)

FORMATO DE RESPOSTA (JSON):
{
  "success": true,
  "laboratoryName": "Nome do Lab" | null,
  "collectionDate": "YYYY-MM-DD" | null,
  "patientName": "Nome" | null,
  "labResults": [
    {
      "name": "Nome do Exame (exatamente como aparece)",
      "value": "valor numérico ou texto",
      "unit": "unidade" | null,
      "referenceRange": "X - Y" | null
    }
  ],
  "confidence": 0.95,
  "rawText": "Texto bruto extraído (primeiras 500 chars)" | null,
  "errors": ["erro1", "erro2"] | null
}

REGRAS:
1. Extraia TODOS os exames, mesmo se alguns campos estiverem faltando
2. Para valores com duas medições, liste ambas
3. Se houver múltiplas páginas, extraia de todas
4. Retorne APENAS JSON válido

Analise a imagem:`;

/**
 * Parse extraction result from response text.
 */
function parseExtractionResult(text: string): OCRExtractionResult {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return {
      success: false,
      labResults: [],
      confidence: 0,
      errors: ['Failed to parse JSON from model response'],
    };
  }

  const parsed = JSON.parse(jsonMatch[0]) as {
    success: boolean;
    laboratoryName?: string;
    collectionDate?: string;
    patientName?: string;
    labResults: RawLabResult[];
    confidence: number;
    rawText?: string;
    errors?: string[];
  };

  return {
    success: parsed.success,
    labResults: parsed.labResults || [],
    laboratoryName: parsed.laboratoryName ?? undefined,
    collectionDate: parsed.collectionDate ?? undefined,
    patientName: parsed.patientName ?? undefined,
    rawText: parsed.rawText ?? undefined,
    confidence: parsed.confidence || 0.5,
    errors: parsed.errors ?? undefined,
  };
}

/**
 * Extract lab values from an image using Gemini Vision.
 *
 * @param imageData - Base64 encoded image or URL
 * @param mimeType - MIME type of the image
 * @returns Extraction result with structured lab values
 */
export async function extractLabValuesFromImage(
  imageData: string,
  mimeType: string = 'image/jpeg'
): Promise<OCRExtractionResult> {
  try {
    const client = await getVertexAIClient();

    const result = await client.models.generateContent({
      model: GEMINI_MODEL,
      config: {
        systemInstruction: EXTRACTION_SYSTEM_PROMPT,
      },
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                data: imageData,
                mimeType,
              },
            },
            { text: EXTRACTION_USER_PROMPT },
          ],
        },
      ],
    });

    const text = result.text || '';
    return parseExtractionResult(text);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      labResults: [],
      confidence: 0,
      errors: [`Extraction failed: ${errorMessage}`],
    };
  }
}

/**
 * Extract lab values from a PDF document.
 *
 * @param pdfData - Base64 encoded PDF
 * @returns Extraction result with structured lab values
 */
export async function extractLabValuesFromPDF(
  pdfData: string
): Promise<OCRExtractionResult> {
  try {
    const client = await getVertexAIClient();

    const result = await client.models.generateContent({
      model: GEMINI_MODEL,
      config: {
        systemInstruction: EXTRACTION_SYSTEM_PROMPT,
      },
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                data: pdfData,
                mimeType: 'application/pdf',
              },
            },
            { text: EXTRACTION_USER_PROMPT },
          ],
        },
      ],
    });

    const text = result.text || '';
    return parseExtractionResult(text);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      labResults: [],
      confidence: 0,
      errors: [`PDF extraction failed: ${errorMessage}`],
    };
  }
}

/**
 * Extract lab values from a Cloud Storage URL.
 *
 * @param storageUrl - gs:// URL to the file
 * @param mimeType - MIME type of the file
 * @returns Extraction result with structured lab values
 */
export async function extractLabValuesFromStorage(
  storageUrl: string,
  mimeType: string
): Promise<OCRExtractionResult> {
  try {
    const client = await getVertexAIClient();

    const result = await client.models.generateContent({
      model: GEMINI_MODEL,
      config: {
        systemInstruction: EXTRACTION_SYSTEM_PROMPT,
      },
      contents: [
        {
          role: 'user',
          parts: [
            {
              fileData: {
                fileUri: storageUrl,
                mimeType,
              },
            },
            { text: EXTRACTION_USER_PROMPT },
          ],
        },
      ],
    });

    const text = result.text || '';
    return parseExtractionResult(text);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      labResults: [],
      confidence: 0,
      errors: [`Storage extraction failed: ${errorMessage}`],
    };
  }
}

/**
 * Prompt version for audit trail.
 */
export function getExtractionPromptVersion(): string {
  return PROMPT_VERSION;
}
