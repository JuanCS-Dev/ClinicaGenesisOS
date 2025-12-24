/**
 * SOAP Template Data
 *
 * Pre-defined templates organized by medical specialty.
 *
 * @module components/ai/specialty-templates/templates.data
 */

import { Heart, Brain, Stethoscope, Baby, Activity, Apple } from 'lucide-react'
import type { SOAPTemplate } from './types'

/**
 * Template database organized by specialty.
 */
export const TEMPLATES: SOAPTemplate[] = [
  // Clínica Geral
  {
    id: 'general-checkup',
    name: 'Consulta de Rotina',
    specialty: 'Clínica Geral',
    icon: Stethoscope,
    subjective: `Paciente comparece para consulta de rotina.
Queixa principal:
Histórico:
Medicações em uso:
Alergias: `,
    objective: `PA: mmHg | FC: bpm | FR: irpm | Tax: °C | SpO2: %
Peso: kg | Altura: cm | IMC: kg/m²

Exame físico:
- Geral:
- Cabeça/Pescoço:
- Cardiovascular:
- Respiratório:
- Abdome:
- Extremidades: `,
    assessment: `1.
2. `,
    plan: `1. Orientações:
2. Prescrições:
3. Exames solicitados:
4. Retorno: `,
  },

  // Cardiologia
  {
    id: 'cardio-followup',
    name: 'Seguimento Cardiológico',
    specialty: 'Cardiologia',
    icon: Heart,
    subjective: `Paciente em seguimento cardiológico.
Queixa atual:
Dispneia: ( ) Ausente ( ) Aos esforços ( ) Repouso
Dor torácica: ( ) Ausente ( ) Típica ( ) Atípica
Palpitações: ( ) Sim ( ) Não
Edema MMII: ( ) Sim ( ) Não
Aderência medicamentosa: `,
    objective: `PA: mmHg | FC: bpm | FR: irpm
Peso: kg (variação: kg)

Cardiovascular:
- Ritmo: ( ) Regular ( ) Irregular
- Bulhas: ( ) Normofonéticas ( ) Hipofonéticas
- Sopros:
- Estase jugular: ( ) Presente ( ) Ausente
- Edema periférico:

ECG (se realizado):
Ecocardiograma recente: `,
    assessment: `1.
- FEVE: %
- Classe funcional NYHA: `,
    plan: `1. Ajuste medicamentoso:
2. Orientações dietéticas:
3. Atividade física:
4. Exames:
5. Retorno: `,
  },

  // Neurologia
  {
    id: 'neuro-headache',
    name: 'Cefaleia',
    specialty: 'Neurologia',
    icon: Brain,
    subjective: `Queixa de cefaleia.
Localização:
Intensidade (0-10):
Frequência:
Duração:
Característica: ( ) Pulsátil ( ) Pressão ( ) Pontada
Fatores desencadeantes:
Sintomas associados:
- Náuseas/vômitos:
- Fotofobia:
- Fonofobia:
- Aura:
Medicações utilizadas: `,
    objective: `Exame neurológico:
- Consciência: ( ) Alerta ( ) Sonolento
- Pupilas: ( ) Isocóricas ( ) Fotorreagentes
- Pares cranianos:
- Força muscular:
- Sensibilidade:
- Coordenação:
- Marcha:
- Sinais meníngeos: ( ) Ausentes ( ) Presentes`,
    assessment: `1. Cefaleia - tipo:
   ( ) Tensional ( ) Migrânea ( ) Em salvas ( ) Secundária`,
    plan: `1. Tratamento agudo:
2. Profilaxia (se indicada):
3. Orientações:
4. Sinais de alarme:
5. Exames (se necessário):
6. Retorno: `,
  },

  // Pediatria
  {
    id: 'peds-puericulture',
    name: 'Puericultura',
    specialty: 'Pediatria',
    icon: Baby,
    subjective: `Consulta de puericultura - ___ meses/anos
Alimentação: ( ) AME ( ) Fórmula ( ) Alimentação complementar
Sono:
Evacuações:
Diurese:
Desenvolvimento:
- Motor:
- Linguagem:
- Social:
Vacinação em dia: ( ) Sim ( ) Não
Intercorrências desde última consulta: `,
    objective: `Peso: kg (Percentil: )
Estatura: cm (Percentil: )
PC: cm (Percentil: )
IMC: (Percentil: )

Exame físico:
- Estado geral:
- Fontanelas:
- Orofaringe:
- Otoscopia:
- Ausculta cardíaca:
- Ausculta pulmonar:
- Abdome:
- Genitália:
- Reflexos: `,
    assessment: `1. Crescimento: ( ) Adequado ( ) Investigar
2. Desenvolvimento: ( ) Adequado ( ) Investigar`,
    plan: `1. Orientações alimentares:
2. Suplementação:
3. Vacinas pendentes:
4. Próxima consulta: `,
  },

  // Endocrinologia/Nutrição
  {
    id: 'endo-diabetes',
    name: 'Seguimento Diabetes',
    specialty: 'Endocrinologia',
    icon: Activity,
    subjective: `Paciente diabético em seguimento.
Tipo de diabetes: ( ) DM1 ( ) DM2
Tempo de diagnóstico:
Controle glicêmico:
- Glicemias capilares:
- Hipoglicemias: ( ) Sim ( ) Não - Frequência:
Aderência ao tratamento:
Dieta:
Atividade física:
Complicações conhecidas: `,
    objective: `PA: mmHg | Peso: kg | IMC: kg/m²

Exames laboratoriais recentes:
- HbA1c: % (data: )
- Glicemia jejum: mg/dL
- Perfil lipídico:
- Creatinina/TFG:
- Microalbuminúria:

Exame de pés:
- Pulsos:
- Sensibilidade:
- Lesões: `,
    assessment: `1. Diabetes mellitus tipo ___ - controle:
   HbA1c atual: % | Meta: %`,
    plan: `1. Ajuste terapêutico:
2. Metas glicêmicas:
3. Orientações:
4. Exames solicitados:
5. Encaminhamentos:
6. Retorno: `,
  },

  // Nutrição
  {
    id: 'nutri-evaluation',
    name: 'Avaliação Nutricional',
    specialty: 'Nutrição',
    icon: Apple,
    subjective: `Objetivo da consulta:
Histórico alimentar:
- Café da manhã:
- Almoço:
- Jantar:
- Lanches:
Preferências alimentares:
Aversões:
Alergias/Intolerâncias:
Hidratação diária:
Suplementos em uso:
Atividade física: `,
    objective: `Antropometria:
- Peso: kg | Altura: cm
- IMC: kg/m² - Classificação:
- Circunferência abdominal: cm
- % Gordura corporal:
- Massa magra: kg

Bioimpedância (se realizada):
- Água corporal:
- Taxa metabólica basal: kcal`,
    assessment: `1. Estado nutricional:
2. Necessidades calóricas estimadas: kcal/dia
3. Distribuição de macronutrientes:
   - PTN: g ( %)
   - CHO: g ( %)
   - LIP: g ( %)`,
    plan: `1. Plano alimentar:
2. Metas:
3. Orientações:
4. Suplementação:
5. Reavaliação: `,
  },
]

/**
 * Unique specialties extracted from templates.
 */
export const SPECIALTIES = [...new Set(TEMPLATES.map(t => t.specialty))]
