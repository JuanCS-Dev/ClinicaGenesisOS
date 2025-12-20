/**
 * Layer 2: Specialty Investigation Prompts
 * ========================================
 *
 * Specialty-specific analysis with structured chain-of-thought.
 * Temperature: 0.3 (balanced creativity for clinical reasoning)
 */

import { ClinicalSpecialty, SpecialtyTemplate } from '../types.js';

export const PROMPT_VERSION_SPECIALTY = 'v1.0.0';

/**
 * Specialty templates for chain-of-thought prompting.
 */
export const SPECIALTY_TEMPLATES: Record<ClinicalSpecialty, SpecialtyTemplate> = {
  general_practice: {
    specialty: 'general_practice',
    reasoningSteps: [
      'Revisar queixa principal e história',
      'Analisar sinais vitais e exame físico',
      'Correlacionar achados laboratoriais',
      'Identificar diagnósticos diferenciais',
      'Sugerir exames complementares',
      'Definir conduta inicial',
    ],
    keyBiomarkers: [
      'hemoglobin', 'wbc', 'platelets', 'glucose_fasting', 'creatinine',
      'alt', 'ast', 'tsh', 'crp', 'uric_acid',
    ],
    commonPatterns: ['infection_pattern', 'metabolic_syndrome', 'chronic_inflammation'],
    redFlags: [
      'Perda de peso inexplicada',
      'Febre persistente',
      'Alteração do nível de consciência',
      'Sangramento ativo',
    ],
  },

  cardiology: {
    specialty: 'cardiology',
    reasoningSteps: [
      'Avaliar fatores de risco cardiovascular (HAS, DM, dislipidemia, tabagismo)',
      'Analisar perfil lipídico completo',
      'Verificar marcadores cardíacos (troponina, BNP)',
      'Calcular escores de risco (Framingham, SCORE2)',
      'Correlacionar com sintomas cardíacos',
      'Estratificar risco e definir conduta',
    ],
    keyBiomarkers: [
      'cholesterol_total', 'hdl', 'ldl', 'triglycerides', 'apolipoprotein_b',
      'lp_a', 'bnp', 'nt_probnp', 'troponin_i', 'crp_high_sensitivity',
      'homocysteine', 'glucose_fasting', 'hba1c',
    ],
    commonPatterns: ['metabolic_syndrome', 'cardiovascular_risk', 'diabetes_type2'],
    redFlags: [
      'Troponina elevada',
      'BNP > 400 pg/mL',
      'Dor torácica típica',
      'Dispneia progressiva',
      'Síncope',
    ],
  },

  endocrinology: {
    specialty: 'endocrinology',
    reasoningSteps: [
      'Identificar sintomas metabólicos/hormonais',
      'Analisar eixo glicêmico (glicose, HbA1c, insulina, HOMA)',
      'Avaliar função tireoideana completa',
      'Verificar perfil hormonal (cortisol, DHEA, sexual)',
      'Identificar padrões de resistência insulínica',
      'Correlacionar com composição corporal',
      'Definir metas terapêuticas',
    ],
    keyBiomarkers: [
      'glucose_fasting', 'hba1c', 'insulin_fasting', 'homa_ir',
      'tsh', 't4_free', 't3_free', 'anti_tpo',
      'cortisol_am', 'dhea_s', 'testosterone_total', 'estradiol',
      'vitamin_d',
    ],
    commonPatterns: [
      'metabolic_syndrome', 'insulin_resistance', 'diabetes_type2',
      'hypothyroidism', 'hyperthyroidism',
    ],
    redFlags: [
      'HbA1c > 10%',
      'Glicose > 500 mg/dL',
      'TSH < 0.01 ou > 10',
      'Cetoacidose diabética',
      'Crise tireotóxica',
    ],
  },

  nephrology: {
    specialty: 'nephrology',
    reasoningSteps: [
      'Calcular TFG estimada',
      'Classificar estágio de DRC',
      'Avaliar albuminúria/proteinúria',
      'Verificar eletrólitos e equilíbrio ácido-base',
      'Identificar causas reversíveis',
      'Avaliar complicações (anemia, metabolismo ósseo)',
    ],
    keyBiomarkers: [
      'creatinine', 'urea', 'gfr', 'microalbumin',
      'potassium', 'sodium', 'phosphorus', 'calcium',
      'pth', 'vitamin_d', 'hemoglobin',
    ],
    commonPatterns: ['kidney_dysfunction', 'diabetes_type2'],
    redFlags: [
      'TFG < 15 mL/min',
      'Potássio > 6.0 mEq/L',
      'Acidose metabólica grave',
      'Síndrome urêmica',
    ],
  },

  hematology: {
    specialty: 'hematology',
    reasoningSteps: [
      'Analisar hemograma completo',
      'Classificar tipo de anemia (VCM, RDW)',
      'Avaliar perfil de ferro',
      'Verificar marcadores de hemólise',
      'Avaliar linhagem branca',
      'Verificar coagulação',
    ],
    keyBiomarkers: [
      'hemoglobin', 'hematocrit', 'rbc', 'mcv', 'mch', 'mchc', 'rdw',
      'wbc', 'neutrophils', 'lymphocytes', 'platelets',
      'iron', 'ferritin', 'transferrin_saturation', 'vitamin_b12', 'folate',
    ],
    commonPatterns: ['iron_deficiency_anemia', 'b12_deficiency', 'chronic_inflammation'],
    redFlags: [
      'Hemoglobina < 7 g/dL',
      'Plaquetas < 50.000',
      'Leucócitos < 2.000 ou > 30.000',
      'Blastos em sangue periférico',
    ],
  },

  hepatology: {
    specialty: 'hepatology',
    reasoningSteps: [
      'Avaliar padrão de lesão (hepatocelular vs colestático)',
      'Calcular relação AST/ALT',
      'Verificar função sintética (albumina, TP)',
      'Avaliar bilirrubinas',
      'Identificar etiologia',
      'Estratificar gravidade',
    ],
    keyBiomarkers: [
      'alt', 'ast', 'ggt', 'alkaline_phosphatase',
      'bilirubin_total', 'bilirubin_direct', 'bilirubin_indirect',
      'albumin', 'total_protein', 'globulin',
      'ferritin', 'iron',
    ],
    commonPatterns: ['liver_dysfunction'],
    redFlags: [
      'ALT/AST > 10x normal',
      'Bilirrubina > 5 mg/dL',
      'Albumina < 2.5 g/dL',
      'INR > 1.5 espontâneo',
      'Encefalopatia hepática',
    ],
  },

  neurology: {
    specialty: 'neurology',
    reasoningSteps: [
      'Caracterizar sintomas neurológicos (focais vs difusos)',
      'Avaliar fatores de risco vascular',
      'Verificar marcadores inflamatórios',
      'Correlacionar com exame neurológico',
      'Identificar diagnósticos diferenciais',
      'Definir necessidade de imagem',
    ],
    keyBiomarkers: [
      'glucose_fasting', 'hba1c', 'vitamin_b12', 'folate',
      'tsh', 't4_free', 'crp', 'vitamin_d',
      'sodium', 'calcium', 'magnesium',
    ],
    commonPatterns: ['b12_deficiency', 'hypothyroidism'],
    redFlags: [
      'Déficit neurológico agudo',
      'Cefaleia explosiva',
      'Alteração súbita de consciência',
      'Hiponatremia grave',
    ],
  },

  functional_medicine: {
    specialty: 'functional_medicine',
    reasoningSteps: [
      'Avaliar sintomas sistêmicos (fadiga, cognição, energia)',
      'Analisar todos marcadores com ranges funcionais ótimos',
      'Identificar deficiências subclínicas',
      'Correlacionar múltiplos sistemas',
      'Identificar root causes',
      'Sugerir otimizações',
    ],
    keyBiomarkers: [
      'glucose_fasting', 'insulin_fasting', 'homa_ir',
      'tsh', 't4_free', 't3_free', 'reverse_t3',
      'ferritin', 'iron', 'vitamin_d', 'vitamin_b12',
      'homocysteine', 'crp_high_sensitivity',
      'cortisol_am', 'dhea_s',
    ],
    commonPatterns: [
      'insulin_resistance', 'hypothyroidism', 'chronic_inflammation',
      'iron_deficiency_anemia', 'b12_deficiency',
    ],
    redFlags: [
      'Fadiga incapacitante persistente',
      'Múltiplos sistemas subótimos',
      'Declínio cognitivo progressivo',
    ],
  },
};

/**
 * Generate specialty-specific analysis prompt.
 */
export function generateSpecialtyPrompt(
  specialty: ClinicalSpecialty,
  patientContext: string,
  labResults: string
): string {
  const template = SPECIALTY_TEMPLATES[specialty];

  return `Você é um especialista em ${template.specialty.replace('_', ' ')}.
Analise os dados do paciente seguindo o raciocínio clínico estruturado.

CHAIN-OF-THOUGHT OBRIGATÓRIO:
${template.reasoningSteps.map((step, i) => `${i + 1}. ${step}`).join('\n')}

BIOMARCADORES-CHAVE PARA ESTA ESPECIALIDADE:
${template.keyBiomarkers.join(', ')}

RED FLAGS A MONITORAR:
${template.redFlags.map(rf => `- ${rf}`).join('\n')}

${patientContext}

${labResults}

FORMATO DE RESPOSTA (JSON):
{
  "specialty": "${specialty}",
  "chainOfThought": [
    {
      "step": <número>,
      "title": "Título do passo",
      "analysis": "Análise detalhada",
      "findings": ["achado1", "achado2"]
    }
  ],
  "specialtyFindings": {
    "keyMarkers": [
      {
        "marker": "nome",
        "value": <valor>,
        "interpretation": "interpretação especializada"
      }
    ],
    "patterns": ["padrão identificado"],
    "concerns": ["preocupação específica da especialidade"]
  },
  "recommendations": ["recomendação1", "recomendação2"]
}

Retorne APENAS JSON válido.`;
}
