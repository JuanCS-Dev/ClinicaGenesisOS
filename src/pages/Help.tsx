/**
 * Help Page
 *
 * Complete help center with FAQ, articles, and support contact.
 * Inspired by Intercom, Zendesk, and SimplePractice help centers.
 *
 * Features:
 * - Quick start guides
 * - Searchable FAQ
 * - Help articles by category
 * - Support contact form
 * - Quick links to documentation
 */

import React, { useState, useCallback } from 'react';
import {
  HelpCircle,
  BookOpen,
  MessageSquare,
  Sparkles,
  Calendar,
  FileText,
  Wallet,
  Settings,
  ChevronRight,
  ArrowLeft,
  ExternalLink,
} from 'lucide-react';
import {
  FAQAccordion,
  DEFAULT_FAQ_DATA,
  SearchableArticles,
  DEFAULT_HELP_ARTICLES,
  ContactSupport,
  type HelpArticle,
} from '../components/help';
import { useClinicContext } from '../contexts/ClinicContext';

/**
 * Quick access category cards.
 */
const QUICK_CATEGORIES = [
  {
    id: 'agenda',
    label: 'Agenda',
    description: 'Agendar, cancelar e gerenciar consultas',
    icon: Calendar,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-900/30',
  },
  {
    id: 'prontuario',
    label: 'Prontuário',
    description: 'Documentação, AI Scribe e histórico',
    icon: FileText,
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-900/30',
  },
  {
    id: 'financeiro',
    label: 'Financeiro',
    description: 'Faturamento, TISS e relatórios',
    icon: Wallet,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-900/30',
  },
  {
    id: 'configuracoes',
    label: 'Configurações',
    description: 'WhatsApp, equipe e preferências',
    icon: Settings,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-900/30',
  },
];

/**
 * Help page tabs.
 */
type HelpTab = 'home' | 'faq' | 'articles' | 'contact' | 'article-detail';

/**
 * Help Center Page
 *
 * Complete help system with multiple sections.
 */
export function Help(): React.ReactElement {
  const { userProfile } = useClinicContext();
  const [activeTab, setActiveTab] = useState<HelpTab>('home');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);
  const [faqSearchQuery, setFaqSearchQuery] = useState('');

  // Handle category selection
  const handleCategoryClick = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
    setActiveTab('faq');
  }, []);

  // Handle article selection
  const handleArticleSelect = useCallback((article: HelpArticle) => {
    setSelectedArticle(article);
    setActiveTab('article-detail');
  }, []);

  // Go back to home
  const handleBack = useCallback(() => {
    if (activeTab === 'article-detail') {
      setActiveTab('articles');
      setSelectedArticle(null);
    } else {
      setActiveTab('home');
      setSelectedCategory(null);
    }
  }, [activeTab]);

  // Render article detail view
  if (activeTab === 'article-detail' && selectedArticle) {
    return (
      <div className="max-w-3xl mx-auto animate-enter">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-genesis-muted hover:text-genesis-dark mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Voltar aos Artigos</span>
        </button>

        {/* Article Header */}
        <div className="mb-8">
          <span className="text-xs font-semibold text-genesis-primary uppercase tracking-wider">
            {selectedArticle.category}
          </span>
          <h1 className="text-2xl font-bold text-genesis-dark mt-2 mb-3">
            {selectedArticle.title}
          </h1>
          <p className="text-genesis-medium">{selectedArticle.excerpt}</p>
        </div>

        {/* Article Content */}
        <div className="bg-genesis-surface rounded-2xl border border-genesis-border-subtle p-8">
          <article className="prose prose-sm max-w-none text-genesis-dark prose-headings:text-genesis-dark prose-p:text-genesis-medium prose-strong:text-genesis-dark prose-li:text-genesis-medium">
            <div
              dangerouslySetInnerHTML={{
                __html: selectedArticle.content
                  .split('\n')
                  .map((line) => {
                    if (line.startsWith('# ')) {
                      return `<h1 class="text-xl font-bold mt-6 mb-4">${line.slice(2)}</h1>`;
                    }
                    if (line.startsWith('## ')) {
                      return `<h2 class="text-lg font-semibold mt-5 mb-3">${line.slice(3)}</h2>`;
                    }
                    if (line.startsWith('- ')) {
                      return `<li class="ml-4">${line.slice(2)}</li>`;
                    }
                    if (line.match(/^\d+\./)) {
                      return `<li class="ml-4 list-decimal">${line.replace(/^\d+\.\s*/, '')}</li>`;
                    }
                    if (line.trim()) {
                      return `<p class="my-3">${line}</p>`;
                    }
                    return '';
                  })
                  .join(''),
              }}
            />
          </article>
        </div>

        {/* Related Articles */}
        <div className="mt-8">
          <h3 className="font-semibold text-genesis-dark mb-4">Artigos Relacionados</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {DEFAULT_HELP_ARTICLES.filter(
              (a) => a.category === selectedArticle.category && a.id !== selectedArticle.id
            )
              .slice(0, 2)
              .map((article) => (
                <button
                  key={article.id}
                  onClick={() => handleArticleSelect(article)}
                  className="text-left p-4 bg-genesis-surface rounded-xl border border-genesis-border-subtle hover:border-genesis-primary/30 transition-all group"
                >
                  <h4 className="font-medium text-genesis-dark text-sm group-hover:text-genesis-primary transition-colors">
                    {article.title}
                  </h4>
                  <p className="text-xs text-genesis-muted mt-1 line-clamp-2">
                    {article.excerpt}
                  </p>
                </button>
              ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto animate-enter">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-genesis-primary/10 mb-4">
          <HelpCircle className="w-8 h-8 text-genesis-primary" />
        </div>
        <h1 className="text-2xl font-bold text-genesis-dark mb-2">Central de Ajuda</h1>
        <p className="text-genesis-medium">
          Como podemos ajudar você hoje, {userProfile?.displayName?.split(' ')[0] || 'Profissional'}?
        </p>
      </div>

      {/* Navigation Tabs */}
      {activeTab !== 'home' && (
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-genesis-muted hover:text-genesis-dark transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Voltar</span>
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('faq')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'faq'
                  ? 'bg-genesis-primary text-white'
                  : 'text-genesis-medium hover:bg-genesis-hover'
              }`}
            >
              FAQ
            </button>
            <button
              onClick={() => setActiveTab('articles')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'articles'
                  ? 'bg-genesis-primary text-white'
                  : 'text-genesis-medium hover:bg-genesis-hover'
              }`}
            >
              Artigos
            </button>
            <button
              onClick={() => setActiveTab('contact')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'contact'
                  ? 'bg-genesis-primary text-white'
                  : 'text-genesis-medium hover:bg-genesis-hover'
              }`}
            >
              Contato
            </button>
          </div>
        </div>
      )}

      {/* Home View */}
      {activeTab === 'home' && (
        <>
          {/* Quick Access Categories */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {QUICK_CATEGORIES.map((cat) => {
              const IconComponent = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  className="
                    text-left p-5 rounded-2xl
                    bg-genesis-surface border border-genesis-border-subtle
                    hover:border-genesis-primary/30 hover:shadow-md
                    transition-all group
                  "
                >
                  <div className={`p-3 rounded-xl ${cat.bg} w-fit mb-4`}>
                    <IconComponent className={`w-5 h-5 ${cat.color}`} />
                  </div>
                  <h3 className="font-semibold text-genesis-dark mb-1 group-hover:text-genesis-primary transition-colors">
                    {cat.label}
                  </h3>
                  <p className="text-xs text-genesis-muted">{cat.description}</p>
                </button>
              );
            })}
          </div>

          {/* Main Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <button
              onClick={() => setActiveTab('faq')}
              className="
                flex items-center gap-4 p-6 rounded-2xl
                bg-genesis-surface border border-genesis-border-subtle
                hover:border-genesis-primary/30 hover:shadow-md
                transition-all group text-left
              "
            >
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/30">
                <HelpCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-genesis-dark group-hover:text-genesis-primary transition-colors">
                  Perguntas Frequentes
                </h3>
                <p className="text-sm text-genesis-muted">Respostas rápidas para dúvidas comuns</p>
              </div>
              <ChevronRight className="w-5 h-5 text-genesis-muted" />
            </button>

            <button
              onClick={() => setActiveTab('articles')}
              className="
                flex items-center gap-4 p-6 rounded-2xl
                bg-genesis-surface border border-genesis-border-subtle
                hover:border-genesis-primary/30 hover:shadow-md
                transition-all group text-left
              "
            >
              <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-900/30">
                <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-genesis-dark group-hover:text-genesis-primary transition-colors">
                  Guias e Tutoriais
                </h3>
                <p className="text-sm text-genesis-muted">Aprenda a usar todas as funcionalidades</p>
              </div>
              <ChevronRight className="w-5 h-5 text-genesis-muted" />
            </button>

            <button
              onClick={() => setActiveTab('contact')}
              className="
                flex items-center gap-4 p-6 rounded-2xl
                bg-genesis-surface border border-genesis-border-subtle
                hover:border-genesis-primary/30 hover:shadow-md
                transition-all group text-left
              "
            >
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/30">
                <MessageSquare className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-genesis-dark group-hover:text-genesis-primary transition-colors">
                  Fale Conosco
                </h3>
                <p className="text-sm text-genesis-muted">Entre em contato com o suporte</p>
              </div>
              <ChevronRight className="w-5 h-5 text-genesis-muted" />
            </button>
          </div>

          {/* Quick Start */}
          <div className="bg-gradient-to-r from-genesis-primary/10 to-clinical-soft rounded-2xl p-6 mb-10">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-genesis-surface/80">
                <Sparkles className="w-6 h-6 text-genesis-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-genesis-dark mb-1">Novo no Genesis OS?</h3>
                <p className="text-sm text-genesis-medium mb-4">
                  Comece com nosso guia de primeiros passos e aprenda a configurar sua clínica em
                  minutos.
                </p>
                <button
                  onClick={() => {
                    const startArticle = DEFAULT_HELP_ARTICLES.find((a) => a.id === 'start-1');
                    if (startArticle) handleArticleSelect(startArticle);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-genesis-primary text-white rounded-lg text-sm font-medium hover:bg-genesis-primary-dark transition-colors"
                >
                  Começar Agora
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Popular Articles */}
          <div>
            <h2 className="font-semibold text-genesis-dark mb-4">Artigos Populares</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DEFAULT_HELP_ARTICLES.slice(0, 4).map((article) => (
                <button
                  key={article.id}
                  onClick={() => handleArticleSelect(article)}
                  className="
                    text-left p-4 rounded-xl
                    bg-genesis-surface border border-genesis-border-subtle
                    hover:border-genesis-primary/30 hover:shadow-md
                    transition-all group flex items-center gap-4
                  "
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-genesis-dark text-sm group-hover:text-genesis-primary transition-colors">
                      {article.title}
                    </h4>
                    <p className="text-xs text-genesis-muted mt-1 line-clamp-1">
                      {article.excerpt}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-genesis-muted flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* External Links */}
          <div className="mt-10 pt-8 border-t border-genesis-border-subtle">
            <div className="flex flex-wrap gap-4 justify-center text-sm">
              <a
                href="#"
                className="flex items-center gap-1.5 text-genesis-muted hover:text-genesis-primary transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Documentação API
              </a>
              <span className="text-genesis-border">|</span>
              <a
                href="#"
                className="flex items-center gap-1.5 text-genesis-muted hover:text-genesis-primary transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Status do Sistema
              </a>
              <span className="text-genesis-border">|</span>
              <a
                href="#"
                className="flex items-center gap-1.5 text-genesis-muted hover:text-genesis-primary transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Comunidade
              </a>
            </div>
          </div>
        </>
      )}

      {/* FAQ View */}
      {activeTab === 'faq' && (
        <div className="space-y-6">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar nas perguntas frequentes..."
              value={faqSearchQuery}
              onChange={(e) => setFaqSearchQuery(e.target.value)}
              className="
                w-full pl-12 pr-4 py-3 rounded-xl
                bg-genesis-surface border border-genesis-border
                text-genesis-dark placeholder-genesis-muted
                focus:outline-none focus:ring-2 focus:ring-genesis-primary focus:border-transparent
              "
            />
            <HelpCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-genesis-muted" />
          </div>

          {/* Category Filter */}
          {selectedCategory && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-genesis-muted">Filtrado por:</span>
              <span className="px-3 py-1 bg-genesis-primary/10 text-genesis-primary rounded-full text-sm font-medium capitalize">
                {selectedCategory}
              </span>
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-xs text-genesis-muted hover:text-genesis-dark"
              >
                Limpar
              </button>
            </div>
          )}

          {/* FAQ Accordion */}
          <FAQAccordion
            items={DEFAULT_FAQ_DATA}
            category={selectedCategory || undefined}
            searchQuery={faqSearchQuery}
          />
        </div>
      )}

      {/* Articles View */}
      {activeTab === 'articles' && (
        <SearchableArticles articles={DEFAULT_HELP_ARTICLES} onSelectArticle={handleArticleSelect} />
      )}

      {/* Contact View */}
      {activeTab === 'contact' && <ContactSupport userEmail={userProfile?.email || ''} />}
    </div>
  );
}

export default Help;
