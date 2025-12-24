/**
 * Help Page Types
 * ================
 *
 * Type definitions for the help center.
 *
 * @module pages/help/types
 */

import type React from 'react';
import type { HelpArticle } from '@/components/help';

/**
 * Help page navigation tabs.
 */
export type HelpTab = 'home' | 'faq' | 'articles' | 'contact' | 'article-detail';

/**
 * Quick access category definition.
 */
export interface QuickCategory {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}

/**
 * Help navigation state.
 */
export interface HelpNavigationState {
  activeTab: HelpTab;
  selectedCategory: string | null;
  selectedArticle: HelpArticle | null;
  faqSearchQuery: string;
}

/**
 * Help navigation actions.
 */
export interface HelpNavigationActions {
  setActiveTab: (tab: HelpTab) => void;
  handleCategoryClick: (categoryId: string) => void;
  handleArticleSelect: (article: HelpArticle) => void;
  handleBack: () => void;
  setFaqSearchQuery: (query: string) => void;
}

export type { HelpArticle };
