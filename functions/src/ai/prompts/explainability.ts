/**
 * Layer 4: Explainability Prompt
 * ==============================
 *
 * Generate understandable explanations + Validate output.
 * Temperature: 0.1 (conservative for validation)
 */

export const PROMPT_VERSION_EXPLAINABILITY = 'v1.0.0';

/**
 * System prompt for explainability layer.
 */
export const EXPLAINABILITY_SYSTEM_PROMPT = `Você é um assistente de explicabilidade clínica.
Sua tarefa é validar análises de IA e gerar explicações compreensíveis.

OBJETIVOS:
1. Verificar se conclusões são suportadas pelos dados
2. Identificar possíveis alucinações ou afirmações não fundamentadas
3. Gerar explicações claras para médicos
4. Calibrar níveis de confiança

NUNCA:
- Afirmar diagnóstico definitivo
- Fazer recomendações que substituam julgamento médico
- Omitir incertezas`;

/**
 * User prompt for validation and explainability.
 */
export const EXPLAINABILITY_USER_PROMPT = `Valide a análise e gere explicações compreensíveis.

DADOS ORIGINAIS:
{{inputData}}

ANÁLISE GERADA:
{{analysisResult}}

TAREFA:
1. Verificar se cada conclusão é suportada pelos dados
2. Identificar afirmações que podem ser alucinações
3. Calibrar níveis de confiança
4. Gerar explicação clara e concisa

FORMATO DE RESPOSTA (JSON):
{
  "validation": {
    "isGrounded": <boolean>,
    "groundingScore": <0-100>,
    "hallucinations": [
      {
        "claim": "Afirmação não suportada",
        "issue": "Por que não é suportada"
      }
    ],
    "unsupportedClaims": <número>,
    "wellSupportedClaims": <número>
  },
  "confidenceCalibration": {
    "originalConfidence": <0-100>,
    "calibratedConfidence": <0-100>,
    "adjustmentReason": "Motivo do ajuste se houver"
  },
  "explanation": {
    "summary": "Resumo em linguagem clara para o médico (2-3 sentenças)",
    "keyFindings": [
      "Achado principal 1",
      "Achado principal 2"
    ],
    "clinicalContext": "Contextualização clínica breve",
    "limitations": [
      "Limitação 1 da análise",
      "Limitação 2"
    ],
    "nextSteps": [
      "Próximo passo sugerido 1",
      "Próximo passo sugerido 2"
    ]
  },
  "markerContributions": [
    {
      "marker": "Nome do marcador",
      "contribution": "high" | "medium" | "low",
      "direction": "supports" | "contradicts" | "neutral",
      "explanation": "Como este marcador influenciou a conclusão"
    }
  ],
  "counterfactuals": [
    {
      "condition": "Se [marcador] fosse [valor diferente]",
      "impact": "A conclusão mudaria para [...]"
    }
  ]
}

REGRAS DE VALIDAÇÃO:
1. Toda afirmação sobre diagnóstico deve ter pelo menos 2 evidências
2. Afirmações categóricas ("é", "definitivamente") devem ser sinalizadas
3. Valores citados devem corresponder aos dados de entrada
4. Confiança > 90% só se houver múltiplas evidências convergentes
5. Retornar APENAS JSON válido`;

/**
 * Mandatory disclaimer text for all AI outputs.
 */
export const AI_DISCLAIMER = `Esta análise é uma ferramenta de apoio ao raciocínio clínico.
Não substitui o julgamento profissional médico.
Todos os resultados devem ser interpretados no contexto clínico completo do paciente.
Revisão médica é OBRIGATÓRIA antes de qualquer ação diagnóstica ou terapêutica.`;

/**
 * Disclaimer variants for different contexts.
 */
export const DISCLAIMERS = {
  short: 'Ferramenta de apoio. Revisão médica obrigatória.',
  medium: `Análise AI para apoio à decisão clínica.
Não substitui avaliação médica. Revisão profissional obrigatória.`,
  full: AI_DISCLAIMER,
  portuguese: `AVISO: Esta análise foi gerada por inteligência artificial como
ferramenta de apoio ao raciocínio clínico. Os resultados NÃO substituem
o julgamento clínico do profissional médico responsável. Toda decisão
diagnóstica ou terapêutica deve ser tomada pelo médico após revisão
dos dados e consideração do contexto clínico completo do paciente.`,
};

/**
 * Confidence calibration rules.
 */
export const CONFIDENCE_RULES = {
  // Reduce confidence if...
  reductions: [
    { condition: 'single_evidence', reduction: 20 },
    { condition: 'missing_key_tests', reduction: 15 },
    { condition: 'contradicting_evidence', reduction: 25 },
    { condition: 'atypical_presentation', reduction: 10 },
    { condition: 'incomplete_history', reduction: 10 },
  ],
  // Increase confidence if...
  increases: [
    { condition: 'multiple_concordant_evidence', increase: 10 },
    { condition: 'classic_presentation', increase: 5 },
    { condition: 'complete_workup', increase: 10 },
  ],
  // Maximum confidence caps
  caps: {
    with_single_evidence: 60,
    with_contradicting_evidence: 50,
    without_confirmatory_test: 75,
  },
};
