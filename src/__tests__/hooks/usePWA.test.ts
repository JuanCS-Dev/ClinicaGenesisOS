/**
 * usePWA Hook Tests - Progressive Web App functionality.
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { usePWA } from '../../hooks/usePWA';

// Note: virtual:pwa-register is mocked globally in vitest.setup.ts

describe('usePWA', () => {
  let addEventListenerSpy: ReturnType<typeof vi.spyOn>;
  let removeEventListenerSpy: ReturnType<typeof vi.spyOn>;
  let matchMediaSpy: ReturnType<typeof vi.spyOn>;
  const eventListeners: Record<string, EventListener[]> = {};

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset event listeners storage
    Object.keys(eventListeners).forEach((key) => {
      eventListeners[key] = [];
    });

    // Mock addEventListener
    addEventListenerSpy = vi.spyOn(window, 'addEventListener').mockImplementation(
      (event: string, handler: EventListener) => {
        if (!eventListeners[event]) {
          eventListeners[event] = [];
        }
        eventListeners[event].push(handler);
      }
    );

    // Mock removeEventListener
    removeEventListenerSpy = vi.spyOn(window, 'removeEventListener').mockImplementation(
      (event: string, handler: EventListener) => {
        if (eventListeners[event]) {
          eventListeners[event] = eventListeners[event].filter((h) => h !== handler);
        }
      }
    );

    // Mock matchMedia
    const mockMediaQueryList = {
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    matchMediaSpy = vi.spyOn(window, 'matchMedia').mockReturnValue(
      mockMediaQueryList as unknown as MediaQueryList
    );

    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      value: true,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
    matchMediaSpy.mockRestore();
    vi.useRealTimers();
  });

  describe('initial state', () => {
    it('should start with default values', () => {
      const { result } = renderHook(() => usePWA());

      expect(result.current.canInstall).toBe(false);
      expect(result.current.isInstalled).toBe(false);
      expect(result.current.isOnline).toBe(true);
      expect(result.current.needsUpdate).toBe(false);
    });
  });

  describe('isOnline', () => {
    it('should detect online status', () => {
      const { result } = renderHook(() => usePWA());
      expect(result.current.isOnline).toBe(true);
    });

    it('should update when going offline', async () => {
      const { result } = renderHook(() => usePWA());

      act(() => {
        // Trigger offline event
        const offlineHandlers = eventListeners['offline'];
        offlineHandlers?.forEach((handler) => handler(new Event('offline')));
      });

      expect(result.current.isOnline).toBe(false);
    });

    it('should update when going online', async () => {
      const { result } = renderHook(() => usePWA());

      // First go offline
      act(() => {
        eventListeners['offline']?.forEach((handler) => handler(new Event('offline')));
      });

      expect(result.current.isOnline).toBe(false);

      // Then go online
      act(() => {
        eventListeners['online']?.forEach((handler) => handler(new Event('online')));
      });

      expect(result.current.isOnline).toBe(true);
    });
  });

  describe('isInstalled', () => {
    it('should detect standalone mode as installed', () => {
      matchMediaSpy.mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      } as unknown as MediaQueryList);

      const { result } = renderHook(() => usePWA());

      expect(result.current.isInstalled).toBe(true);
    });

    it('should detect non-standalone mode as not installed', () => {
      matchMediaSpy.mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      } as unknown as MediaQueryList);

      const { result } = renderHook(() => usePWA());

      expect(result.current.isInstalled).toBe(false);
    });
  });

  describe('canInstall', () => {
    it('should be false when no deferred prompt', () => {
      const { result } = renderHook(() => usePWA());
      expect(result.current.canInstall).toBe(false);
    });

    it('should be true when beforeinstallprompt is received', async () => {
      const { result } = renderHook(() => usePWA());

      const mockPromptEvent = {
        preventDefault: vi.fn(),
        platforms: ['web'],
        userChoice: Promise.resolve({ outcome: 'accepted' as const, platform: 'web' }),
        prompt: vi.fn().mockResolvedValue(undefined),
      };

      act(() => {
        eventListeners['beforeinstallprompt']?.forEach((handler) =>
          handler(mockPromptEvent as unknown as Event)
        );
      });

      expect(result.current.canInstall).toBe(true);
    });

    it('should be false when already installed', async () => {
      matchMediaSpy.mockReturnValue({
        matches: true, // Already installed
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      } as unknown as MediaQueryList);

      const { result } = renderHook(() => usePWA());

      const mockPromptEvent = {
        preventDefault: vi.fn(),
        platforms: ['web'],
        userChoice: Promise.resolve({ outcome: 'accepted' as const, platform: 'web' }),
        prompt: vi.fn(),
      };

      act(() => {
        eventListeners['beforeinstallprompt']?.forEach((handler) =>
          handler(mockPromptEvent as unknown as Event)
        );
      });

      expect(result.current.canInstall).toBe(false);
    });
  });

  describe('promptInstall', () => {
    it('should return false when no prompt available', async () => {
      const { result } = renderHook(() => usePWA());

      let installed: boolean = true;
      await act(async () => {
        installed = await result.current.promptInstall();
      });

      expect(installed).toBe(false);
    });

    it('should trigger prompt and return true on accept', async () => {
      const { result } = renderHook(() => usePWA());

      const mockPromptEvent = {
        preventDefault: vi.fn(),
        platforms: ['web'],
        userChoice: Promise.resolve({ outcome: 'accepted' as const, platform: 'web' }),
        prompt: vi.fn().mockResolvedValue(undefined),
      };

      act(() => {
        eventListeners['beforeinstallprompt']?.forEach((handler) =>
          handler(mockPromptEvent as unknown as Event)
        );
      });

      let installed: boolean = false;
      await act(async () => {
        installed = await result.current.promptInstall();
      });

      expect(mockPromptEvent.prompt).toHaveBeenCalled();
      expect(installed).toBe(true);
    });

    it('should return false on dismiss', async () => {
      const { result } = renderHook(() => usePWA());

      const mockPromptEvent = {
        preventDefault: vi.fn(),
        platforms: ['web'],
        userChoice: Promise.resolve({ outcome: 'dismissed' as const, platform: 'web' }),
        prompt: vi.fn().mockResolvedValue(undefined),
      };

      act(() => {
        eventListeners['beforeinstallprompt']?.forEach((handler) =>
          handler(mockPromptEvent as unknown as Event)
        );
      });

      let installed: boolean = true;
      await act(async () => {
        installed = await result.current.promptInstall();
      });

      expect(installed).toBe(false);
    });
  });

  describe('dismissInstall', () => {
    it('should hide install prompt', async () => {
      const { result } = renderHook(() => usePWA());

      const mockPromptEvent = {
        preventDefault: vi.fn(),
        platforms: ['web'],
        userChoice: Promise.resolve({ outcome: 'accepted' as const, platform: 'web' }),
        prompt: vi.fn(),
      };

      act(() => {
        eventListeners['beforeinstallprompt']?.forEach((handler) =>
          handler(mockPromptEvent as unknown as Event)
        );
      });

      expect(result.current.canInstall).toBe(true);

      act(() => {
        result.current.dismissInstall();
      });

      expect(result.current.canInstall).toBe(false);
    });
  });

  describe('service worker registration', () => {
    it('should initialize and set isReady when SW is registered', async () => {
      const { result } = renderHook(() => usePWA());

      // Hook should initialize without errors
      expect(result.current.canInstall).toBe(false);
      expect(result.current.isInstalled).toBe(false);

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      }, { timeout: 3000 });
    });
  });

  describe('appinstalled event', () => {
    it('should update isInstalled when app is installed', async () => {
      const { result } = renderHook(() => usePWA());

      act(() => {
        eventListeners['appinstalled']?.forEach((handler) =>
          handler(new Event('appinstalled'))
        );
      });

      expect(result.current.isInstalled).toBe(true);
    });
  });

  describe('cleanup', () => {
    it('should remove event listeners on unmount', () => {
      const { unmount } = renderHook(() => usePWA());

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'beforeinstallprompt',
        expect.any(Function)
      );
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'appinstalled',
        expect.any(Function)
      );
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'online',
        expect.any(Function)
      );
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'offline',
        expect.any(Function)
      );
    });
  });
});
