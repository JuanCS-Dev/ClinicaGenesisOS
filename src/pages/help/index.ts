/**
 * Help Page Module
 * ================
 *
 * Modular help center page.
 *
 * @module pages/help
 */

// Main component
export { Help, default } from './Help';

// Types
export type { HelpTab, QuickCategory, HelpNavigationState, HelpNavigationActions } from './types';

// Constants
export { QUICK_CATEGORIES } from './constants';

// Hooks
export { useHelpNavigation } from './hooks/useHelpNavigation';

// Sub-components (for advanced usage)
export {
  ArticleContent,
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
