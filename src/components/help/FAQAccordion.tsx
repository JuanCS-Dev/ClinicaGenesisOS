/**
 * FAQAccordion Component
 *
 * Accordion-style FAQ display for help center.
 * Inspired by Intercom and Zendesk help centers.
 *
 * Features:
 * - Animated expand/collapse
 * - Category grouping
 * - Search filtering
 * - Keyboard navigation
 */

import React, { useState, useCallback } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

/**
 * FAQ item structure.
 */
export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface FAQAccordionProps {
  /** Array of FAQ items to display */
  items: FAQItem[];
  /** Optional filter by category */
  category?: string;
  /** Search query to filter items */
  searchQuery?: string;
}

interface FAQAccordionItemProps {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
}

/**
 * Individual FAQ item with expand/collapse animation.
 */
const FAQAccordionItem: React.FC<FAQAccordionItemProps> = ({ item, isOpen, onToggle }) => {
  return (
    <div className="border-b border-genesis-border-subtle last:border-0">
      <button
        className={`
          w-full flex items-center justify-between gap-4 p-4 text-left
          transition-colors duration-200
          hover:bg-genesis-hover
          focus:outline-none focus-visible:ring-2 focus-visible:ring-genesis-primary focus-visible:ring-inset
        `}
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span className="font-medium text-genesis-dark text-sm pr-4">{item.question}</span>
        <ChevronDown
          className={`
            w-4 h-4 text-genesis-muted flex-shrink-0
            transition-transform duration-200
            ${isOpen ? 'rotate-180' : ''}
          `}
        />
      </button>

      <div
        className={`
          overflow-hidden transition-all duration-300 ease-out
          ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        <div className="p-4 pt-0 text-sm text-genesis-medium leading-relaxed">{item.answer}</div>
      </div>
    </div>
  );
};

/**
 * Accordion container for FAQ items.
 *
 * @example
 * <FAQAccordion
 *   items={[
 *     { id: '1', question: 'Como agendar?', answer: '...', category: 'agenda' }
 *   ]}
 *   category="agenda"
 * />
 */
export function FAQAccordion({
  items,
  category,
  searchQuery = '',
}: FAQAccordionProps): React.ReactElement {
  const [openId, setOpenId] = useState<string | null>(null);

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesCategory = !category || item.category === category;
    const matchesSearch =
      !searchQuery ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleToggle = useCallback((id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  }, []);

  if (filteredItems.length === 0) {
    return (
      <div className="p-8 text-center">
        <HelpCircle className="w-12 h-12 text-genesis-muted mx-auto mb-3 opacity-50" />
        <p className="text-genesis-muted text-sm">Nenhuma pergunta encontrada.</p>
      </div>
    );
  }

  return (
    <div className="bg-genesis-surface rounded-xl border border-genesis-border-subtle overflow-hidden">
      {filteredItems.map((item) => {
        const isOpen = openId === item.id;
        return (
          <FAQAccordionItem
            key={item.id}
            item={item}
            isOpen={isOpen}
            onToggle={() => handleToggle(item.id)}
          />
        );
      })}
    </div>
  );
}

/**
 * Default FAQ data for the clinic system.
 */
export const DEFAULT_FAQ_DATA: FAQItem[] = [
  // Agendamento
  {
    id: 'agenda-1',
    category: 'agenda',
    question: 'Como agendar uma nova consulta?',
    answer:
      'Acesse o menu "Agenda" e clique no horário desejado. Preencha os dados do paciente, selecione o procedimento e confirme o agendamento. O paciente receberá uma confirmação automática se o WhatsApp estiver configurado.',
  },
  {
    id: 'agenda-2',
    category: 'agenda',
    question: 'Como cancelar ou reagendar uma consulta?',
    answer:
      'Na agenda, clique sobre a consulta desejada. No painel lateral, você encontra as opções de "Reagendar" e "Cancelar". O paciente será notificado automaticamente sobre a mudança.',
  },
  {
    id: 'agenda-3',
    category: 'agenda',
    question: 'Como configurar horários de atendimento?',
    answer:
      'Acesse "Configurações > Agenda" para definir seus horários de trabalho, duração padrão das consultas e dias de atendimento. Você também pode bloquear horários específicos para compromissos pessoais.',
  },
  // Prontuário
  {
    id: 'prontuario-1',
    category: 'prontuario',
    question: 'Como usar o AI Scribe para transcrever consultas?',
    answer:
      'Durante a consulta, clique em "Iniciar Gravação" no prontuário. O sistema irá transcrever a conversa e gerar automaticamente a nota SOAP. Revise e ajuste o texto antes de salvar.',
  },
  {
    id: 'prontuario-2',
    category: 'prontuario',
    question: 'Como acessar o histórico de um paciente?',
    answer:
      'Acesse "Pacientes", busque pelo nome e clique para abrir o perfil. Na aba "Histórico" você encontra todas as consultas anteriores, exames, prescrições e evolução do paciente.',
  },
  {
    id: 'prontuario-3',
    category: 'prontuario',
    question: 'Como emitir uma prescrição digital?',
    answer:
      'No prontuário do paciente, clique em "Nova Prescrição". Adicione os medicamentos, posologia e orientações. O sistema gera um PDF com QR Code para validação. Você pode enviar por e-mail ou WhatsApp.',
  },
  // Financeiro
  {
    id: 'financeiro-1',
    category: 'financeiro',
    question: 'Como gerar uma guia TISS para convênios?',
    answer:
      'Após finalizar a consulta, vá em "Faturamento > Nova Guia TISS". Selecione o paciente, convênio e procedimento. O sistema preenche automaticamente os dados e gera o XML para envio à operadora.',
  },
  {
    id: 'financeiro-2',
    category: 'financeiro',
    question: 'Como emitir um recibo para pacientes particulares?',
    answer:
      'Em "Financeiro > Receitas", clique em "Novo Recibo". Informe o paciente, valor e descrição do serviço. O recibo pode ser enviado por e-mail ou impresso diretamente.',
  },
  {
    id: 'financeiro-3',
    category: 'financeiro',
    question: 'Como visualizar relatórios financeiros?',
    answer:
      'Acesse "Relatórios > Financeiro" para ver faturamento por período, ticket médio, comparativos e projeções. Os dados podem ser exportados para Excel ou PDF.',
  },
  // Configurações
  {
    id: 'config-1',
    category: 'configuracoes',
    question: 'Como configurar notificações por WhatsApp?',
    answer:
      'Em "Configurações > WhatsApp", conecte sua conta do WhatsApp Business. Configure os templates de mensagem para lembretes de consulta (24h, 2h antes) e confirmações automáticas.',
  },
  {
    id: 'config-2',
    category: 'configuracoes',
    question: 'Como adicionar um novo profissional?',
    answer:
      'Acesse "Configurações > Equipe" e clique em "Adicionar Profissional". Informe os dados, especialidade e permissões. O novo usuário receberá um convite por e-mail para criar sua senha.',
  },
  {
    id: 'config-3',
    category: 'configuracoes',
    question: 'Como alterar o tema (modo escuro)?',
    answer:
      'Clique no ícone de sol/lua no canto superior direito para alternar entre modo claro e escuro. O sistema também pode seguir automaticamente as configurações do seu dispositivo.',
  },
];

export default FAQAccordion;
