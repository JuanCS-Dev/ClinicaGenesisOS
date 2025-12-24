/**
 * UpdatePrompt Component
 *
 * Displays a notification when a new version of the app is available.
 * Prompts the user to refresh for the latest version.
 */

import React from 'react';
import { RefreshCw, Sparkles } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

/**
 * App update notification.
 *
 * Shows when a new service worker is available.
 * Provides a button to apply the update and refresh.
 */
export function UpdatePrompt(): React.ReactElement | null {
  const { needsUpdate, applyUpdate } = usePWA();

  if (!needsUpdate) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-slide-in">
      <div className="text-white rounded-xl shadow-2xl overflow-hidden" style={{ background: 'linear-gradient(to right, #2563eb, #4f46e5)' }}>
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-genesis-surface/20 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold">Nova versao disponivel</h4>
              <p className="text-sm text-blue-100 mt-0.5">
                Atualize para obter as ultimas melhorias
              </p>
            </div>
          </div>

          <button
            onClick={applyUpdate}
            className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 bg-genesis-surface text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Atualizar agora
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}
