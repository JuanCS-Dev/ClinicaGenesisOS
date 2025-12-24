/**
 * Mock for virtual:pwa-register module (vite-plugin-pwa)
 * This file is used by vitest to resolve the virtual module import.
 */

type RegisterSWOptions = {
  immediate?: boolean;
  onRegisteredSW?: (swUrl: string, registration: ServiceWorkerRegistration | undefined) => void;
  onRegisterError?: (error: Error) => void;
  onNeedRefresh?: () => void;
  onOfflineReady?: () => void;
};

export function registerSW(options?: RegisterSWOptions): () => Promise<void> {
  // Simulate async registration callback
  if (options?.onRegisteredSW) {
    Promise.resolve().then(() => {
      options.onRegisteredSW?.('sw.js', undefined);
    });
  }

  if (options?.onOfflineReady) {
    Promise.resolve().then(() => {
      options.onOfflineReady?.();
    });
  }

  // Return update function
  return async () => {
    // Mock update - does nothing in tests
  };
}
