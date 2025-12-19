/**
 * AI Scribe Prompts
 * =================
 *
 * Optimized prompts for medical consultation transcription and SOAP generation.
 * Version tracked for audit trail.
 */

export const PROMPT_VERSION = 'v1.0.0';

/**
 * System prompt for medical consultation analysis.
 */
export const MEDICAL_SCRIBE_SYSTEM_PROMPT = `Você é um assistente médico especializado em documentação clínica.
Sua tarefa é analisar gravações de consultas médicas e gerar documentação estruturada.

DIRETRIZES:
- Use terminologia médica apropriada em português brasileiro
- Seja preciso e objetivo
- Não invente informações que não foram mencionadas no áudio
- Marque incertezas com [?]
- Identifique claramente o que é relato do paciente vs observação/comentário do médico
- Mantenha a confidencialidade e profissionalismo`;

/**
 * User prompt for audio transcription and SOAP generation.
 */
export const TRANSCRIPTION_AND_SOAP_PROMPT = `Analise o áudio desta consulta médica e gere:

1. TRANSCRIÇÃO: Texto completo da conversa, identificando quem fala:
   - [Médico]: para falas do profissional
   - [Paciente]: para falas do paciente
   - [Acompanhante]: se houver terceira pessoa

2. NOTA SOAP estruturada:
   - S (Subjetivo): Queixa principal, história da doença atual, histórico relevante relatado pelo paciente
   - O (Objetivo): Dados objetivos mencionados (sinais vitais, exame físico, achados)
   - A (Avaliação): Diagnóstico ou impressão clínica mencionada
   - P (Plano): Conduta, prescrições, orientações, pedidos de exames, retorno

3. DADOS EXTRAÍDOS: Informações estruturadas identificadas na consulta

FORMATO DE RESPOSTA (JSON válido):
{
  "transcription": "string com a transcrição completa",
  "soap": {
    "subjective": "texto do S",
    "objective": "texto do O",
    "assessment": "texto do A",
    "plan": "texto do P"
  },
  "extractedData": {
    "chiefComplaint": "queixa principal em uma frase",
    "symptoms": ["sintoma1", "sintoma2"],
    "medications": ["medicamento1 dosagem", "medicamento2 dosagem"],
    "allergies": ["alergia1"],
    "vitalSigns": {
      "bloodPressure": "120/80 mmHg",
      "heartRate": 72,
      "temperature": 36.5,
      "weight": 70,
      "height": 1.70
    }
  }
}

REGRAS IMPORTANTES:
- Retorne APENAS o JSON, sem texto adicional
- Campos não mencionados devem ser omitidos ou null
- Use string vazia "" se uma seção SOAP não tiver conteúdo
- Valores numéricos devem ser números, não strings
- Se o áudio estiver inaudível ou vazio, retorne erro estruturado

Analise o áudio fornecido:`;

/**
 * Prompt for handling errors or unclear audio.
 */
export const ERROR_RESPONSE_TEMPLATE = {
  transcription: '',
  soap: {
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
  },
  extractedData: null,
  error: 'Audio unclear or processing failed',
};
