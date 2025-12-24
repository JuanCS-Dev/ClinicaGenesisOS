/**
 * External Links Component
 * ========================
 *
 * Footer links to external resources.
 *
 * @module pages/help/components/ExternalLinks
 */

import React from 'react';
import { ExternalLink } from 'lucide-react';

/**
 * Link configuration.
 */
const LINKS = [
  { label: 'Documentação API', href: '#' },
  { label: 'Status do Sistema', href: '#' },
  { label: 'Comunidade', href: '#' },
];

/**
 * External resource links footer.
 */
export function ExternalLinks(): React.ReactElement {
  return (
    <div className="mt-10 pt-8 border-t border-genesis-border-subtle">
      <div className="flex flex-wrap gap-4 justify-center text-sm">
        {LINKS.map((link, index) => (
          <React.Fragment key={link.label}>
            <a
              href={link.href}
              className="flex items-center gap-1.5 text-genesis-muted hover:text-genesis-primary transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              {link.label}
            </a>
            {index < LINKS.length - 1 && (
              <span className="text-genesis-border">|</span>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export default ExternalLinks;
