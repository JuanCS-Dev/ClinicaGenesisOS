/**
 * PageContext - Contextual Header System
 * =======================================
 *
 * Allows pages to customize header content (title, actions, breadcrumbs).
 * Inspired by Linear and Notion adaptive headers.
 *
 * @example
 * ```tsx
 * // In a page component:
 * const { setPageContext } = usePageContext();
 *
 * useEffect(() => {
 *   setPageContext({
 *     title: 'Paciente: João Silva',
 *     subtitle: 'Última consulta: 15/12/2024',
 *     actions: <Button>Nova Consulta</Button>,
 *   });
 *   return () => setPageContext({});
 * }, []);
 * ```
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface Breadcrumb {
  label: string;
  href?: string;
}

export interface PageContextValue {
  /** Page title displayed in header */
  title?: string;
  /** Subtitle or description */
  subtitle?: string;
  /** Action buttons/elements to display */
  actions?: ReactNode;
  /** Breadcrumb navigation */
  breadcrumbs?: Breadcrumb[];
}

interface PageContextState extends PageContextValue {
  setPageContext: (context: PageContextValue) => void;
  clearPageContext: () => void;
}

const defaultContext: PageContextState = {
  title: undefined,
  subtitle: undefined,
  actions: undefined,
  breadcrumbs: undefined,
  setPageContext: () => {},
  clearPageContext: () => {},
};

const PageContext = createContext<PageContextState>(defaultContext);

export interface PageProviderProps {
  children: ReactNode;
}

/**
 * PageProvider - Wrap your app layout to enable contextual headers
 */
export const PageProvider: React.FC<PageProviderProps> = ({ children }) => {
  const [pageContext, setPageContextState] = useState<PageContextValue>({});

  const setPageContext = useCallback((context: PageContextValue) => {
    setPageContextState(context);
  }, []);

  const clearPageContext = useCallback(() => {
    setPageContextState({});
  }, []);

  return (
    <PageContext.Provider
      value={{
        ...pageContext,
        setPageContext,
        clearPageContext,
      }}
    >
      {children}
    </PageContext.Provider>
  );
};

/**
 * usePageContext - Hook to access and modify page context
 *
 * @example
 * ```tsx
 * const { title, actions, setPageContext } = usePageContext();
 * ```
 */
export const usePageContext = (): PageContextState => {
  const context = useContext(PageContext);
  if (!context) {
    throw new Error('usePageContext must be used within a PageProvider');
  }
  return context;
};

/**
 * usePageHeader - Convenience hook for setting page header
 *
 * Automatically clears context on unmount.
 *
 * @example
 * ```tsx
 * usePageHeader({
 *   title: 'Dashboard',
 *   subtitle: 'Bem-vindo de volta!',
 *   actions: <Button>Novo</Button>,
 * });
 * ```
 */
export const usePageHeader = (context: PageContextValue, deps: React.DependencyList = []) => {
  const { setPageContext, clearPageContext } = usePageContext();

  React.useEffect(() => {
    setPageContext(context);
    return () => clearPageContext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};

export default PageContext;
