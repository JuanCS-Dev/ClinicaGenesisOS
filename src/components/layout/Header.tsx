import React from 'react';
import { Bell, Search, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CommandPalette, useCommandPalette } from '../search';
import { ThemeToggle } from '@/design-system';
import { usePageContext } from '@/contexts/PageContext';
import { UserDropdown } from './UserDropdown';

export const Header: React.FC = () => {
  const { isOpen, open, close } = useCommandPalette();
  const { title, subtitle, actions, breadcrumbs } = usePageContext();

  return (
    <>
    <header className="h-16 px-8 flex items-center justify-between sticky top-0 z-10 bg-genesis-soft/80 backdrop-blur-xl border-b border-genesis-border/50 transition-all duration-300">
      {/* Left side: Contextual content or Search */}
      <div className="flex items-center flex-1 gap-4">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1 text-sm">
            {breadcrumbs.map((crumb, i) => (
              <React.Fragment key={i}>
                {i > 0 && <ChevronRight className="w-3 h-3 text-genesis-muted" />}
                {crumb.href ? (
                  <Link
                    to={crumb.href}
                    className="text-genesis-muted hover:text-genesis-primary transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-genesis-text font-medium">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}

        {/* Contextual Title & Subtitle */}
        {title && !breadcrumbs?.length && (
          <div className="hidden md:block">
            <h1 className="text-sm font-semibold text-genesis-dark">{title}</h1>
            {subtitle && (
              <p className="text-xs text-genesis-muted">{subtitle}</p>
            )}
          </div>
        )}

        {/* Search Trigger - Shows when no contextual title */}
        {!title && !breadcrumbs?.length && (
          <button
            onClick={open}
            className="relative group w-96 hidden md:flex items-center gap-2 px-3 py-2 bg-genesis-surface/60 border border-transparent rounded-xl text-sm text-genesis-medium/70 shadow-sm hover:bg-genesis-surface/80 hover:shadow-glow transition-all duration-300"
          >
            <Search className="w-4 h-4 text-genesis-medium" />
            <span className="flex-1 text-left">Buscar...</span>
            <kbd className="px-1.5 py-0.5 text-[10px] font-medium bg-genesis-hover rounded border border-genesis-border">
              {navigator.platform.includes('Mac') ? '⌘K' : 'Ctrl+K'}
            </kbd>
          </button>
        )}

        {/* Contextual Actions */}
        {actions && (
          <div className="flex items-center gap-2 ml-auto mr-4">
            {actions}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <ThemeToggle size="md" />
        
        <button className="relative p-2 text-genesis-medium hover:text-genesis-dark hover:bg-genesis-surface rounded-full transition-all duration-200">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white shadow-sm"></span>
        </button>
        
        <div className="h-6 w-px bg-genesis-medium/20"></div>

        <UserDropdown />
      </div>
    </header>
    
    {/* Command Palette Modal */}
    <CommandPalette isOpen={isOpen} onClose={close} />
    </>
  );
};