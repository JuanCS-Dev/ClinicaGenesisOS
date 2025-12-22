/**
 * SpecialtyTemplates Component
 *
 * Pre-defined SOAP templates organized by medical specialty.
 * Allows quick population of SOAP fields with common structures.
 *
 * Features:
 * - Templates by specialty (Cardiologia, Neurologia, etc.)
 * - One-click template application
 * - Preview before applying
 * - Customizable per clinic (future)
 */

import React, { useState, useCallback } from 'react';
import {
  FileText,
  Heart,
  Brain,
  Stethoscope,
  Baby,
  Activity,
  Apple,
  ChevronRight,
  Check,
  X,
} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

export interface SOAPTemplate {
  id: string;
  name: string;
  specialty: string;
  icon: React.ElementType;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

interface SpecialtyTemplatesProps {
  /** Callback when template is selected */
  onSelectTemplate: (template: Omit<SOAPTemplate, 'id' | 'name' | 'specialty' | 'icon'>) => void;
  /** Current SOAP has content (show warning) */
  hasExistingContent?: boolean;
}

// ============================================================================
// Template Database
// ============================================================================

const TEMPLATES: SOAPTemplate[] = [
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
];

// Group templates by specialty
const SPECIALTIES = [...new Set(TEMPLATES.map((t) => t.specialty))];

// ============================================================================
// Sub-Components
// ============================================================================

interface TemplateCardProps {
  template: SOAPTemplate;
  onSelect: () => void;
  onPreview: () => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onSelect, onPreview }) => {
  const Icon = template.icon;
  return (
    <div className="p-3 bg-genesis-surface rounded-xl border border-genesis-border-subtle hover:border-genesis-primary/30 hover:shadow-md transition-all">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-genesis-primary/10 rounded-lg">
          <Icon className="w-5 h-5 text-genesis-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-genesis-dark text-sm">{template.name}</h4>
          <p className="text-xs text-genesis-muted">{template.specialty}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onPreview}
            className="p-1.5 text-genesis-muted hover:text-genesis-primary hover:bg-genesis-hover rounded-lg transition-colors"
            title="Visualizar"
          >
            <FileText className="w-4 h-4" />
          </button>
          <button
            onClick={onSelect}
            className="p-1.5 bg-genesis-primary text-white rounded-lg hover:bg-genesis-primary-dark transition-colors"
            title="Aplicar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

export function SpecialtyTemplates({
  onSelectTemplate,
  hasExistingContent = false,
}: SpecialtyTemplatesProps): React.ReactElement {
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<SOAPTemplate | null>(null);
  const [confirmOverwrite, setConfirmOverwrite] = useState<SOAPTemplate | null>(null);

  const filteredTemplates = selectedSpecialty
    ? TEMPLATES.filter((t) => t.specialty === selectedSpecialty)
    : TEMPLATES;

  const handleSelectTemplate = useCallback(
    (template: SOAPTemplate) => {
      if (hasExistingContent) {
        setConfirmOverwrite(template);
      } else {
        onSelectTemplate({
          subjective: template.subjective,
          objective: template.objective,
          assessment: template.assessment,
          plan: template.plan,
        });
      }
    },
    [hasExistingContent, onSelectTemplate]
  );

  const handleConfirmOverwrite = useCallback(() => {
    if (confirmOverwrite) {
      onSelectTemplate({
        subjective: confirmOverwrite.subjective,
        objective: confirmOverwrite.objective,
        assessment: confirmOverwrite.assessment,
        plan: confirmOverwrite.plan,
      });
      setConfirmOverwrite(null);
    }
  }, [confirmOverwrite, onSelectTemplate]);

  return (
    <div className="space-y-4">
      {/* Specialty Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedSpecialty(null)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            !selectedSpecialty
              ? 'bg-genesis-primary text-white'
              : 'bg-genesis-soft text-genesis-medium hover:bg-genesis-hover'
          }`}
        >
          Todos
        </button>
        {SPECIALTIES.map((specialty) => (
          <button
            key={specialty}
            onClick={() => setSelectedSpecialty(specialty)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              selectedSpecialty === specialty
                ? 'bg-genesis-primary text-white'
                : 'bg-genesis-soft text-genesis-medium hover:bg-genesis-hover'
            }`}
          >
            {specialty}
          </button>
        ))}
      </div>

      {/* Template Grid */}
      <div className="grid gap-3 sm:grid-cols-2">
        {filteredTemplates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onSelect={() => handleSelectTemplate(template)}
            onPreview={() => setPreviewTemplate(template)}
          />
        ))}
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-genesis-surface rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div>
                <h3 className="font-semibold text-genesis-dark">{previewTemplate.name}</h3>
                <p className="text-sm text-genesis-muted">{previewTemplate.specialty}</p>
              </div>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="p-2 hover:bg-genesis-hover rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
              {['S - Subjetivo', 'O - Objetivo', 'A - Avaliação', 'P - Plano'].map((label, i) => {
                const fields = ['subjective', 'objective', 'assessment', 'plan'] as const;
                return (
                  <div key={label}>
                    <h4 className="text-xs font-bold text-blue-600 uppercase mb-1">{label}</h4>
                    <pre className="text-sm text-genesis-medium whitespace-pre-wrap bg-genesis-soft p-3 rounded-lg">
                      {previewTemplate[fields[i]]}
                    </pre>
                  </div>
                );
              })}
            </div>
            <div className="px-6 py-4 border-t flex justify-end gap-3">
              <button
                onClick={() => setPreviewTemplate(null)}
                className="px-4 py-2 text-genesis-medium hover:bg-genesis-hover rounded-lg"
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  handleSelectTemplate(previewTemplate);
                  setPreviewTemplate(null);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-genesis-primary text-white rounded-lg hover:bg-genesis-primary-dark"
              >
                <Check className="w-4 h-4" />
                Aplicar Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Overwrite Modal */}
      {confirmOverwrite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-genesis-surface rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="font-semibold text-genesis-dark mb-2">Substituir conteúdo?</h3>
            <p className="text-sm text-genesis-muted mb-4">
              Os campos SOAP já possuem conteúdo. Aplicar o template irá substituir o texto
              existente.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmOverwrite(null)}
                className="px-4 py-2 text-genesis-medium hover:bg-genesis-hover rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmOverwrite}
                className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
              >
                Substituir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SpecialtyTemplates;
