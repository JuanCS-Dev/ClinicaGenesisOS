/**
 * SearchableArticles Component
 *
 * Searchable help articles with category filtering.
 * Inspired by SimplePractice and Intercom help centers.
 *
 * Features:
 * - Full-text search
 * - Category tabs
 * - Reading time estimates
 * - Expandable content
 */

import React, { useState, useMemo } from 'react';
import { Search, Clock, ArrowRight, FileText } from 'lucide-react';

/**
 * Article structure.
 */
export interface HelpArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  readTime: number; // in minutes
  tags?: string[];
}

interface SearchableArticlesProps {
  /** Array of articles to display */
  articles: HelpArticle[];
  /** Callback when article is selected */
  onSelectArticle?: (article: HelpArticle) => void;
}

interface ArticleCardProps {
  article: HelpArticle;
  onSelect: () => void;
}

/**
 * Article card with hover effects.
 */
const ArticleCard: React.FC<ArticleCardProps> = ({ article, onSelect }) => {
  return (
    <button
      onClick={onSelect}
      className="
        w-full text-left p-4 bg-genesis-surface rounded-xl
        border border-genesis-border-subtle
        hover:border-genesis-primary/30 hover:shadow-md
        transition-all duration-200 group
        focus:outline-none focus-visible:ring-2 focus-visible:ring-genesis-primary
      "
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-genesis-dark text-sm mb-1 group-hover:text-genesis-primary transition-colors">
            {article.title}
          </h3>
          <p className="text-xs text-genesis-muted line-clamp-2">{article.excerpt}</p>
        </div>
        <ArrowRight className="w-4 h-4 text-genesis-muted group-hover:text-genesis-primary transition-colors flex-shrink-0 mt-1" />
      </div>

      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-genesis-border-subtle">
        <span className="text-[10px] text-genesis-muted flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {article.readTime} min de leitura
        </span>
        <span className="text-[10px] text-genesis-muted capitalize px-2 py-0.5 bg-genesis-soft rounded-full">
          {article.category}
        </span>
      </div>
    </button>
  );
};

/**
 * Searchable articles component with category filtering.
 *
 * @example
 * <SearchableArticles
 *   articles={helpArticles}
 *   onSelectArticle={(article) => setSelectedArticle(article)}
 * />
 */
export function SearchableArticles({
  articles,
  onSelectArticle,
}: SearchableArticlesProps): React.ReactElement {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = [...new Set(articles.map((a) => a.category))];
    return cats.sort();
  }, [articles]);

  // Filter articles
  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const matchesCategory = !selectedCategory || article.category === selectedCategory;
      const matchesSearch =
        !searchQuery ||
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [articles, selectedCategory, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-genesis-muted" />
        <input
          type="text"
          placeholder="Buscar artigos de ajuda..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="
            w-full pl-12 pr-4 py-3 rounded-xl
            bg-genesis-surface border border-genesis-border
            text-genesis-dark placeholder-genesis-muted
            focus:outline-none focus:ring-2 focus:ring-genesis-primary focus:border-transparent
            transition-all
          "
        />
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`
            px-4 py-2 rounded-full text-xs font-semibold transition-all
            ${
              !selectedCategory
                ? 'bg-genesis-primary text-white'
                : 'bg-genesis-soft text-genesis-medium hover:bg-genesis-hover'
            }
          `}
        >
          Todos
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`
              px-4 py-2 rounded-full text-xs font-semibold capitalize transition-all
              ${
                selectedCategory === cat
                  ? 'bg-genesis-primary text-white'
                  : 'bg-genesis-soft text-genesis-medium hover:bg-genesis-hover'
              }
            `}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredArticles.length === 0 ? (
          <div className="col-span-full p-8 text-center">
            <FileText className="w-12 h-12 text-genesis-muted mx-auto mb-3 opacity-50" />
            <p className="text-genesis-muted text-sm">Nenhum artigo encontrado.</p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-2 text-sm text-genesis-primary hover:underline"
              >
                Limpar busca
              </button>
            )}
          </div>
        ) : (
          filteredArticles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              onSelect={() => onSelectArticle?.(article)}
            />
          ))
        )}
      </div>

      {/* Results count */}
      {filteredArticles.length > 0 && (
        <p className="text-xs text-genesis-muted text-center">
          {filteredArticles.length} artigo{filteredArticles.length !== 1 ? 's' : ''} encontrado
          {filteredArticles.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}

/**
 * Default help articles for the clinic system.
 */
export const DEFAULT_HELP_ARTICLES: HelpArticle[] = [
  // Quick Start
  {
    id: 'start-1',
    category: 'inicio',
    title: 'Primeiros Passos com o Genesis OS',
    excerpt:
      'Aprenda a configurar sua clínica e começar a atender em minutos.',
    content: `
# Bem-vindo ao Genesis OS

Este guia irá ajudá-lo a configurar sua clínica e começar a usar o sistema em poucos minutos.

## 1. Configure seu Perfil

Acesse Configurações > Meu Perfil e complete suas informações profissionais.

## 2. Configure a Agenda

Defina seus horários de atendimento em Configurações > Agenda.

## 3. Cadastre seus Pacientes

Importe sua base de pacientes ou cadastre manualmente em Pacientes > Novo.

## 4. Comece a Atender

Agende consultas, use o AI Scribe e gere prescrições digitais!
    `,
    readTime: 3,
    tags: ['inicio', 'configuracao', 'tutorial'],
  },
  // Agenda
  {
    id: 'agenda-guide-1',
    category: 'agenda',
    title: 'Guia Completo da Agenda',
    excerpt: 'Domine todas as funcionalidades da agenda digital.',
    content: `
# Guia da Agenda

A agenda do Genesis OS foi projetada para maximizar sua produtividade.

## Visualizações

- **Dia**: Veja todos os compromissos do dia em formato de timeline
- **Semana**: Visão geral da semana com todos os profissionais
- **Mês**: Planejamento mensal com indicadores de ocupação

## Agendamento Rápido

Clique em qualquer horário vago para criar um novo agendamento. O sistema sugere pacientes conforme você digita.

## Confirmação Automática

Com WhatsApp configurado, os pacientes recebem lembretes automáticos 24h e 2h antes da consulta.
    `,
    readTime: 5,
    tags: ['agenda', 'agendamento', 'consultas'],
  },
  // Prontuário
  {
    id: 'ehr-guide-1',
    category: 'prontuario',
    title: 'Prontuário Eletrônico e AI Scribe',
    excerpt: 'Use inteligência artificial para documentar consultas.',
    content: `
# Prontuário com AI Scribe

O AI Scribe transforma suas consultas em documentação estruturada automaticamente.

## Como Usar

1. Abra o prontuário do paciente
2. Clique em "Iniciar Gravação"
3. Conduza a consulta normalmente
4. O sistema transcreve e estrutura em formato SOAP
5. Revise e salve

## Dicas

- Fale claramente para melhor transcrição
- Confirme medicamentos e dosagens
- Revise sempre antes de salvar
    `,
    readTime: 4,
    tags: ['prontuario', 'ai', 'scribe', 'soap'],
  },
  // Financeiro
  {
    id: 'finance-guide-1',
    category: 'financeiro',
    title: 'Faturamento e Guias TISS',
    excerpt: 'Gerencie pagamentos e fature convênios corretamente.',
    content: `
# Gestão Financeira

Controle receitas, despesas e faturamento de convênios em um só lugar.

## Guias TISS

O Genesis OS gera guias TISS automaticamente no padrão ANS 4.01.00.

1. Finalize a consulta
2. Acesse Faturamento > Nova Guia
3. Selecione paciente e convênio
4. Baixe XML para envio

## Relatórios

- Faturamento por período
- Ticket médio
- Comparativo mensal
- Projeção de receita
    `,
    readTime: 6,
    tags: ['financeiro', 'tiss', 'convenio', 'faturamento'],
  },
  // WhatsApp
  {
    id: 'whatsapp-guide-1',
    category: 'configuracoes',
    title: 'Configurando WhatsApp Business',
    excerpt: 'Envie lembretes automáticos e comunique-se com pacientes.',
    content: `
# WhatsApp Business

Automatize a comunicação com seus pacientes via WhatsApp.

## Configuração

1. Acesse Configurações > WhatsApp
2. Conecte sua conta do WhatsApp Business
3. Configure os templates de mensagem
4. Ative lembretes automáticos

## Templates Disponíveis

- **Confirmação**: Enviado ao agendar
- **Lembrete 24h**: Um dia antes
- **Lembrete 2h**: Duas horas antes

## Respostas Automáticas

O sistema processa respostas como "SIM" ou "NÃO" e atualiza o status automaticamente.
    `,
    readTime: 4,
    tags: ['whatsapp', 'notificacoes', 'configuracao'],
  },
];

export default SearchableArticles;
