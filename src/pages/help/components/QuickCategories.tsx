/**
 * Quick Categories Component
 * ==========================
 *
 * Quick access category cards.
 *
 * @module pages/help/components/QuickCategories
 */

import React from 'react';
import { QUICK_CATEGORIES } from '../constants';

interface QuickCategoriesProps {
  onCategoryClick: (categoryId: string) => void;
}

/**
 * Grid of quick access category cards.
 */
export function QuickCategories({
  onCategoryClick,
}: QuickCategoriesProps): React.ReactElement {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
      {QUICK_CATEGORIES.map((cat) => {
        const IconComponent = cat.icon;
        return (
          <button
            key={cat.id}
            onClick={() => onCategoryClick(cat.id)}
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
  );
}

export default QuickCategories;
