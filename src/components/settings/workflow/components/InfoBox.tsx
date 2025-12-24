/**
 * InfoBox Component
 * =================
 *
 * Informational callout box for workflow descriptions.
 *
 * @module components/settings/workflow/components/InfoBox
 */

import React from 'react';
import { Info } from 'lucide-react';

interface InfoBoxProps {
  children: React.ReactNode;
}

/**
 * Blue informational callout box.
 */
export function InfoBox({ children }: InfoBoxProps): React.ReactElement {
  return (
    <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
      <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
      <p className="text-sm text-blue-700 dark:text-blue-300">{children}</p>
    </div>
  );
}

export default InfoBox;
