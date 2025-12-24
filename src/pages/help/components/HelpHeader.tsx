/**
 * Help Header Component
 * =====================
 *
 * Header section with greeting.
 *
 * @module pages/help/components/HelpHeader
 */

import React from 'react';
import { HelpCircle } from 'lucide-react';

interface HelpHeaderProps {
  userName?: string;
}

/**
 * Help center header with personalized greeting.
 */
export function HelpHeader({ userName }: HelpHeaderProps): React.ReactElement {
  const displayName = userName?.split(' ')[0] || 'Profissional';

  return (
    <div className="text-center mb-10">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-genesis-primary/10 mb-4">
        <HelpCircle className="w-8 h-8 text-genesis-primary" />
      </div>
      <h1 className="text-2xl font-bold text-genesis-dark mb-2">Central de Ajuda</h1>
      <p className="text-genesis-medium">
        Como podemos ajudar você hoje, {displayName}?
      </p>
    </div>
  );
}

export default HelpHeader;
