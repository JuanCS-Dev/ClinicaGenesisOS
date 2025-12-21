/**
 * OfflineIndicator Component
 *
 * Displays a banner when the user is offline.
 * Automatically shows/hides based on connection status.
 */

import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

/**
 * Offline status indicator banner.
 *
 * Shows at the top of the screen when offline.
 * Provides a retry button to check connection.
 */
export function OfflineIndicator(): React.ReactElement | null {
  const { isOnline } = usePWA();

  if (isOnline) {
    return null;
  }

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white px-4 py-2 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <WifiOff className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="font-medium text-sm">Voce esta offline</p>
            <p className="text-xs text-amber-100">
              Algumas funcoes podem estar limitadas
            </p>
          </div>
        </div>

        <button
          onClick={handleRetry}
          className="flex items-center gap-2 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 rounded-lg text-sm font-medium transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="hidden sm:inline">Tentar novamente</span>
        </button>
      </div>
    </div>
  );
}
