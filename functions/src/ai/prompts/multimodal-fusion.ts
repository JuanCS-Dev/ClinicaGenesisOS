/**
 * Layer 3: Multimodal Fusion Prompt
 * =================================
 *
 * Cross-attention between modalities + Grounding in guidelines.
 * Temperature: 0.2 (controlled creativity with evidence grounding)
 */

export const PROMPT_VERSION_FUSION = 'v1.0.0';

/**
 * System prompt for multimodal fusion layer.
 */
export const FUSION_SYSTEM_PROMPT = `Você é um assistente de raciocínio clínico multimodal.
Sua tarefa é integrar dados de múltiplas fontes (labs, anamnese, exame físico)
para gerar diagnósticos diferenciais fundamentados.

PRINCÍPIOS:
1. EVIDENCE LINKING: Cada conclusão deve citar a fonte (lab, SOAP, história)
2. GROUNDING: Usar guidelines quando aplicável (SBD, SBC, SBEM, ESC)
3. UNCERTAINTY: Explicitar quando dados são insuficientes
4. DIFFERENTIAL: Ranquear por probabilidade com justificativa`;

/**
 * User prompt template for multimodal fusion.
 */
export const FUSION_USER_PROMPT = `Integre todas as informações disponíveis para gerar análise clínica.

DADOS DO PACIENTE:
{{patientSummary}}

RESULTADOS LABORATORIAIS:
{{labResults}}

NOTAS CLÍNICAS (SOAP):
{{soapNotes}}

ANÁLISES ANTERIORES:
- Triagem: {{triageResult}}
- Análise especializada: {{specialtyAnalysis}}

CORRELAÇÕES JÁ IDENTIFICADAS:
{{correlations}}

TAREFA:
Gere diagnóstico diferencial ranqueado com fundamentação.

FORMATO DE RESPOSTA (JSON):
{
  "clinicalSummary": "Resumo integrado do caso em 3-5 sentenças",
  "differentialDiagnosis": [
    {
      "rank": 1,
      "name": "Nome do diagnóstico",
      "icd10": "Código CID-10 se aplicável",
      "confidence": <porcentagem 0-100>,
      "supportingEvidence": [
        {
          "source": "lab" | "soap" | "history",
          "finding": "Achado específico",
          "reference": "Referência ao dado original"
        }
      ],
      "contradictingEvidence": [
        {
          "source": "lab" | "soap" | "history",
          "finding": "Achado que não suporta"
        }
      ],
      "suggestedTests": [
        {
          "name": "Nome do exame",
          "rationale": "Por que solicitar"
        }
      ],
      "guidelines": "Guideline de referência se aplicável"
    }
  ],
  "keyCorrelations": [
    {
      "markers": ["marcador1", "marcador2"],
      "pattern": "Descrição do padrão",
      "clinicalSignificance": "Significado clínico",
      "evidence": "Citação da evidência"
    }
  ],
  "investigativeQuestions": [
    {
      "question": "Pergunta para aprofundar",
      "rationale": "Por que perguntar",
      "relatedTo": ["diagnóstico ou achado relacionado"]
    }
  ],
  "additionalTests": [
    {
      "test": "Nome do exame",
      "rationale": "Por que solicitar",
      "urgency": "urgent" | "routine" | "follow-up",
      "investigates": "O que ajuda a esclarecer"
    }
  ],
  "uncertainties": [
    "Incerteza 1 - dado insuficiente",
    "Incerteza 2 - requer mais investigação"
  ]
}

REGRAS:
1. Máximo 5 diagnósticos diferenciais (ranqueados por probabilidade)
2. Cada diagnóstico DEVE ter pelo menos 2 evidências de suporte
3. Nunca afirmar diagnóstico definitivo - usar "sugestivo de", "considerar"
4. Explicitar dados faltantes como incertezas
5. Citar guidelines quando recomendações forem baseadas nelas
6. Retornar APENAS JSON válido`;

/**
 * Guidelines database for grounding.
 */
export const CLINICAL_GUIDELINES = {
  metabolic_syndrome: {
    name: 'Síndrome Metabólica - ATP III / IDF',
    criteria: [
      'Circunferência abdominal: H >102cm / M >88cm',
      'Triglicerídeos ≥150 mg/dL',
      'HDL: H <40 / M <50 mg/dL',
      'Pressão arterial ≥130/85 mmHg',
      'Glicemia jejum ≥100 mg/dL',
    ],
    diagnosis: '3 ou mais critérios = Síndrome Metabólica',
  },
  diabetes: {
    name: 'Diabetes Mellitus - SBD 2024',
    criteria: [
      'Glicemia jejum ≥126 mg/dL (2 ocasiões)',
      'TOTG 2h ≥200 mg/dL',
      'HbA1c ≥6.5%',
      'Glicemia aleatória ≥200 + sintomas',
    ],
    prediabetes: [
      'Glicemia jejum 100-125 mg/dL',
      'TOTG 2h 140-199 mg/dL',
      'HbA1c 5.7-6.4%',
    ],
  },
  dyslipidemia: {
    name: 'Dislipidemia - SBC 2017',
    targets: {
      very_high_risk: 'LDL <50 mg/dL',
      high_risk: 'LDL <70 mg/dL',
      intermediate_risk: 'LDL <100 mg/dL',
      low_risk: 'LDL <130 mg/dL',
    },
  },
  hypothyroidism: {
    name: 'Hipotireoidismo - ATA/SBEM',
    overt: 'TSH elevado + T4L baixo',
    subclinical: 'TSH elevado + T4L normal',
    treatment_threshold: 'TSH >10 ou sintomas',
  },
  anemia: {
    name: 'Anemia - OMS',
    definition: {
      male: 'Hemoglobina <13 g/dL',
      female: 'Hemoglobina <12 g/dL',
      pregnant: 'Hemoglobina <11 g/dL',
    },
    classification: {
      microcytic: 'VCM <80 fL',
      normocytic: 'VCM 80-100 fL',
      macrocytic: 'VCM >100 fL',
    },
  },
};
