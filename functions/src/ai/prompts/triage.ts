/**
 * Layer 1: Triage Prompt
 * ======================
 *
 * Classifies clinical urgency and directs to appropriate workflow.
 * Temperature: 0.1 (conservative, high sensitivity for critical conditions)
 */

export const PROMPT_VERSION_TRIAGE = 'v1.0.0';

/**
 * System prompt for triage layer.
 */
export const TRIAGE_SYSTEM_PROMPT = `Você é um assistente de triagem clínica especializado em identificação de urgências.
Sua tarefa é classificar a urgência dos achados laboratoriais e clínicos.

DIRETRIZ FUNDAMENTAL: Alta sensibilidade para condições graves.
É preferível um falso positivo (encaminhar para avaliação) do que um falso negativo (perder condição grave).

VOCÊ DEVE:
1. Identificar valores críticos que requerem ação imediata
2. Detectar red flags que indicam condições potencialmente graves
3. Classificar a urgência geral do caso
4. Recomendar o workflow clínico apropriado`;

/**
 * User prompt template for triage classification.
 */
export const TRIAGE_USER_PROMPT = `Analise os dados clínicos abaixo e classifique a urgência:

CONTEXTO DO PACIENTE:
- Idade: {{age}} anos
- Sexo: {{sex}}
- Queixa principal: {{chiefComplaint}}
- Histórico relevante: {{relevantHistory}}

RESULTADOS LABORATORIAIS:
{{labResults}}

NOTAS CLÍNICAS (se disponíveis):
{{soapNotes}}

TAREFA:
Classifique a urgência e identifique red flags.

FORMATO DE RESPOSTA (JSON):
{
  "urgency": "critical" | "high" | "routine",
  "confidence": <número 0-100>,
  "redFlags": [
    {
      "description": "Descrição do red flag",
      "relatedMarkers": ["marcador1", "marcador2"],
      "action": "Ação recomendada imediata"
    }
  ],
  "recommendedWorkflow": "emergency" | "specialist" | "primary",
  "criticalValues": [
    {
      "marker": "Nome do marcador",
      "value": <valor>,
      "reason": "Por que é crítico"
    }
  ],
  "reasoning": "Breve explicação da classificação"
}

CRITÉRIOS DE CLASSIFICAÇÃO:

CRITICAL (Emergência):
- Valores laboratoriais críticos (potássio <2.5 ou >6.5, glicose <54 ou >500, etc.)
- Padrões sugestivos de condições life-threatening (IAM, sepse, cetoacidose)
- Red flags para AVC, embolia pulmonar, sangramento ativo

HIGH (Urgência):
- Valores significativamente alterados mas não críticos
- Padrões sugestivos de condições que requerem atenção em dias
- Múltiplos sistemas afetados simultaneamente

ROUTINE (Rotina):
- Valores dentro ou próximos da normalidade
- Alterações leves a moderadas
- Condições crônicas estáveis

REGRAS:
1. Se QUALQUER valor crítico: urgency = "critical"
2. Se dúvida entre níveis: escolher o mais urgente
3. Sempre justificar a classificação
4. Retornar APENAS JSON válido`;

/**
 * Critical thresholds for automatic flagging.
 * Values outside these ranges trigger immediate critical classification.
 */
export const CRITICAL_THRESHOLDS = {
  glucose: { low: 54, high: 500 },
  potassium: { low: 2.5, high: 6.5 },
  sodium: { low: 120, high: 160 },
  hemoglobin: { low: 7.0 },
  platelets: { low: 50000 },
  troponin_i: { high: 0.4 },
  creatinine: { high: 5.0 },
  bilirubin_total: { high: 5.0 },
  inr: { high: 4.0 },
};
