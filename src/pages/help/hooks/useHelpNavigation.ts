/**
 * Help Navigation Hook
 * ====================
 *
 * Manages help center navigation state.
 *
 * @module pages/help/hooks/useHelpNavigation
 */

import { useState, useCallback } from 'react';
import type { HelpTab, HelpNavigationState, HelpNavigationActions, HelpArticle } from '../types';

type UseHelpNavigationReturn = HelpNavigationState & HelpNavigationActions;

/**
 * Hook for managing help center navigation.
 *
 * Handles:
 * - Tab navigation
 * - Category filtering
 * - Article selection
 * - Search state
 *
 * @example
 * ```tsx
 * const { activeTab, handleCategoryClick, handleArticleSelect } = useHelpNavigation();
 * ```
 */
export function useHelpNavigation(): UseHelpNavigationReturn {
  const [activeTab, setActiveTab] = useState<HelpTab>('home');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);
  const [faqSearchQuery, setFaqSearchQuery] = useState('');

  // Handle category selection
  const handleCategoryClick = useCallback((categoryId: string): void => {
    setSelectedCategory(categoryId);
    setActiveTab('faq');
  }, []);

  // Handle article selection
  const handleArticleSelect = useCallback((article: HelpArticle): void => {
    setSelectedArticle(article);
    setActiveTab('article-detail');
  }, []);

  // Go back
  const handleBack = useCallback((): void => {
    if (activeTab === 'article-detail') {
      setActiveTab('articles');
      setSelectedArticle(null);
    } else {
      setActiveTab('home');
      setSelectedCategory(null);
    }
  }, [activeTab]);

  return {
    // State
    activeTab,
    selectedCategory,
    selectedArticle,
    faqSearchQuery,
    // Actions
    setActiveTab,
    handleCategoryClick,
    handleArticleSelect,
    handleBack,
    setFaqSearchQuery,
  };
}

export default useHelpNavigation;
