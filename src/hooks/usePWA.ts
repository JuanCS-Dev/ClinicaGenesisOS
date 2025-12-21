/**
 * usePWA Hook
 *
 * Manages Progressive Web App functionality including:
 * - Install prompt handling
 * - Service worker registration and updates
 * - Online/offline status
 */

import { useState, useEffect, useCallback } from 'react';
import { registerSW } from 'virtual:pwa-register';

/**
 * PWA installation state
 */
export interface PWAState {
  /** Whether the app can be installed */
  canInstall: boolean;
  /** Whether the app is already installed */
  isInstalled: boolean;
  /** Whether we're currently online */
  isOnline: boolean;
  /** Whether a service worker update is available */
  needsUpdate: boolean;
  /** Whether the service worker is ready */
  isReady: boolean;
}

/**
 * PWA hook return type
 */
export interface UsePWAReturn extends PWAState {
  /** Trigger the install prompt */
  promptInstall: () => Promise<boolean>;
  /** Apply pending service worker update */
  applyUpdate: () => void;
  /** Dismiss the install prompt */
  dismissInstall: () => void;
}

/** BeforeInstallPromptEvent interface (not in standard TypeScript lib) */
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

/**
 * Hook for managing PWA installation and updates.
 *
 * @returns PWA state and control functions
 *
 * @example
 * ```tsx
 * function App() {
 *   const { canInstall, promptInstall, isOnline } = usePWA();
 *
 *   return (
 *     <div>
 *       {!isOnline && <OfflineBanner />}
 *       {canInstall && (
 *         <button onClick={promptInstall}>
 *           Instalar App
 *         </button>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function usePWA(): UsePWAReturn {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [needsUpdate, setNeedsUpdate] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [updateSW, setUpdateSW] = useState<(() => Promise<void>) | null>(null);
  const [dismissed, setDismissed] = useState(false);

  // Check if already installed
  useEffect(() => {
    const checkInstalled = () => {
      // Check if running in standalone mode (installed PWA)
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

      setIsInstalled(isStandalone);
    };

    checkInstalled();

    // Listen for display mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handler = () => checkInstalled();
    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Handle beforeinstallprompt event
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Handle successful installation
    const installHandler = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };
    window.addEventListener('appinstalled', installHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installHandler);
    };
  }, []);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Register service worker
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const update = registerSW({
      immediate: true,
      onRegisteredSW(swUrl, registration) {
        if (registration) {
          setIsReady(true);

          // Check for updates periodically (every hour)
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000);
        }
      },
      onNeedRefresh() {
        setNeedsUpdate(true);
      },
      onOfflineReady() {
        setIsReady(true);
      },
    });

    setUpdateSW(() => update);
  }, []);

  /**
   * Trigger the installation prompt.
   *
   * @returns Whether the user accepted the installation
   */
  const promptInstall = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) {
      return false;
    }

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      return true;
    }

    return false;
  }, [deferredPrompt]);

  /**
   * Apply pending service worker update.
   * This will reload the page with the new version.
   */
  const applyUpdate = useCallback(() => {
    if (updateSW) {
      updateSW();
    }
  }, [updateSW]);

  /**
   * Dismiss the install prompt (hides it for this session).
   */
  const dismissInstall = useCallback(() => {
    setDismissed(true);
  }, []);

  return {
    canInstall: Boolean(deferredPrompt) && !isInstalled && !dismissed,
    isInstalled,
    isOnline,
    needsUpdate,
    isReady,
    promptInstall,
    applyUpdate,
    dismissInstall,
  };
}
