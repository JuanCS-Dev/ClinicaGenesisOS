/**
 * InstallPrompt Component
 *
 * Displays a banner prompting the user to install the PWA.
 * Appears when the app is installable and not already installed.
 */

import React from 'react';
import { Download, X, Smartphone, Zap, WifiOff } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

/**
 * PWA install prompt banner.
 *
 * Shows installation benefits and provides install/dismiss actions.
 * Automatically hidden when app is already installed.
 */
export function InstallPrompt(): React.ReactElement | null {
  const { canInstall, promptInstall, dismissInstall } = usePWA();

  if (!canInstall) {
    return null;
  }

  const handleInstall = async () => {
    const accepted = await promptInstall();
    if (accepted) {
      // Analytics or toast could go here
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 pointer-events-none">
      <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden pointer-events-auto animate-slide-up">
        {/* Close button */}
        <button
          onClick={dismissInstall}
          className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Fechar"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>

        <div className="p-5">
          {/* Header */}
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 pr-6">
              <h3 className="font-semibold text-gray-900 text-lg">
                Instale o ClinicaGenesis
              </h3>
              <p className="text-sm text-gray-500 mt-0.5">
                Acesse mais rapido direto da sua tela inicial
              </p>
            </div>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Acesso instantaneo</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <WifiOff className="w-4 h-4 text-blue-500" />
              <span>Funciona offline</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={dismissInstall}
              className="flex-1 px-4 py-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors font-medium"
            >
              Agora nao
            </button>
            <button
              onClick={handleInstall}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-emerald-500/25"
            >
              <Download className="w-4 h-4" />
              Instalar
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(100%);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}
