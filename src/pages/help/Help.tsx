/**
 * Help Page
 * =========
 *
 * Complete help center with FAQ, articles, and support contact.
 * Modular architecture for maintainability.
 *
 * @module pages/help/Help
 * @version 2.0.0
 */

import React from 'react';
import { SearchableArticles, ContactSupport, DEFAULT_HELP_ARTICLES } from '@/components/help';
import { useClinicContext } from '@/contexts/ClinicContext';
import { useHelpNavigation } from './hooks/useHelpNavigation';
import {
  ArticleDetailView,
  ExternalLinks,
  FAQView,
  HelpHeader,
  HelpNavTabs,
  MainNavCards,
  PopularArticles,
  QuickCategories,
  QuickStartBanner,
} from './components';

/**
 * Help Center Page.
 *
 * Features:
 * - Quick start guides
 * - Searchable FAQ
 * - Help articles by category
 * - Support contact form
 * - Quick links to documentation
 */
export function Help(): React.ReactElement {
  const { userProfile } = useClinicContext();
  const {
    activeTab,
    selectedCategory,
    selectedArticle,
    faqSearchQuery,
    setActiveTab,
    handleCategoryClick,
    handleArticleSelect,
    handleBack,
    setFaqSearchQuery,
  } = useHelpNavigation();

  // Article Detail View
  if (activeTab === 'article-detail' && selectedArticle) {
    return (
      <ArticleDetailView
        article={selectedArticle}
        onBack={handleBack}
        onArticleSelect={handleArticleSelect}
      />
    );
  }

  return (
    <div className="max-w-5xl mx-auto animate-enter">
      {/* Header */}
      <HelpHeader userName={userProfile?.displayName} />

      {/* Navigation Tabs (when not on home) */}
      {activeTab !== 'home' && (
        <HelpNavTabs
          activeTab={activeTab}
          onBack={handleBack}
          onTabChange={setActiveTab}
        />
      )}

      {/* Home View */}
      {activeTab === 'home' && (
        <>
          <QuickCategories onCategoryClick={handleCategoryClick} />
          <MainNavCards onTabChange={setActiveTab} />
          <QuickStartBanner onArticleSelect={handleArticleSelect} />
          <PopularArticles onArticleSelect={handleArticleSelect} />
          <ExternalLinks />
        </>
      )}

      {/* FAQ View */}
      {activeTab === 'faq' && (
        <FAQView
          searchQuery={faqSearchQuery}
          onSearchChange={setFaqSearchQuery}
          selectedCategory={selectedCategory}
          onClearCategory={() => handleCategoryClick('')}
        />
      )}

      {/* Articles View */}
      {activeTab === 'articles' && (
        <SearchableArticles
          articles={DEFAULT_HELP_ARTICLES}
          onSelectArticle={handleArticleSelect}
        />
      )}

      {/* Contact View */}
      {activeTab === 'contact' && (
        <ContactSupport userEmail={userProfile?.email || ''} />
      )}
    </div>
  );
}

export default Help;
