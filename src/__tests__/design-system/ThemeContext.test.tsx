/**
 * ThemeContext Tests
 * ==================
 * 
 * Unit tests for the Design System ThemeContext.
 * Coverage target: 95%+
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ThemeProvider, useTheme } from '@/design-system';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

// Mock matchMedia
const matchMediaMock = (matches: boolean) => ({
  matches,
  media: '(prefers-color-scheme: dark)',
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
});

// Test component that uses theme
const ThemeConsumer: React.FC = () => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="resolved">{resolvedTheme}</span>
      <button onClick={() => setTheme('light')}>Light</button>
      <button onClick={() => setTheme('dark')}>Dark</button>
      <button onClick={() => setTheme('system')}>System</button>
    </div>
  );
};

describe('ThemeContext', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
    });
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(() => matchMediaMock(false)),
    });
    localStorageMock.clear();
    document.documentElement.classList.remove('dark');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('default behavior', () => {
    it('defaults to system theme', () => {
      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      );
      expect(screen.getByTestId('theme').textContent).toBe('system');
    });

    it('resolves to light when system prefers light', () => {
      window.matchMedia = vi.fn().mockImplementation(() => matchMediaMock(false));
      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      );
      expect(screen.getByTestId('resolved').textContent).toBe('light');
    });

    it('resolves to dark when system prefers dark', () => {
      window.matchMedia = vi.fn().mockImplementation(() => matchMediaMock(true));
      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      );
      expect(screen.getByTestId('resolved').textContent).toBe('dark');
    });
  });

  describe('theme switching', () => {
    it('switches to light theme', () => {
      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      );
      
      fireEvent.click(screen.getByText('Light'));
      expect(screen.getByTestId('theme').textContent).toBe('light');
      expect(screen.getByTestId('resolved').textContent).toBe('light');
    });

    it('switches to dark theme', () => {
      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      );
      
      fireEvent.click(screen.getByText('Dark'));
      expect(screen.getByTestId('theme').textContent).toBe('dark');
      expect(screen.getByTestId('resolved').textContent).toBe('dark');
    });

    it('switches to system theme', () => {
      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      );
      
      fireEvent.click(screen.getByText('Dark'));
      fireEvent.click(screen.getByText('System'));
      expect(screen.getByTestId('theme').textContent).toBe('system');
    });
  });

  describe('localStorage persistence', () => {
    it('saves theme to localStorage', () => {
      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      );
      
      fireEvent.click(screen.getByText('Dark'));
      expect(localStorageMock.getItem('genesis-theme')).toBe('dark');
    });

    it('loads theme from localStorage', () => {
      localStorageMock.setItem('genesis-theme', 'dark');
      
      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      );
      
      expect(screen.getByTestId('theme').textContent).toBe('dark');
    });
  });

  describe('DOM manipulation', () => {
    it('adds dark class to html when dark theme', () => {
      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      );
      
      fireEvent.click(screen.getByText('Dark'));
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('removes dark class when switching to light', () => {
      document.documentElement.classList.add('dark');
      
      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      );
      
      fireEvent.click(screen.getByText('Light'));
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });

  describe('useTheme hook outside provider', () => {
    it('throws error when used outside ThemeProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        render(<ThemeConsumer />);
      }).toThrow('useTheme must be used within a ThemeProvider');
      
      consoleSpy.mockRestore();
    });
  });

  describe('initial theme prop', () => {
    it('accepts defaultTheme prop', () => {
      render(
        <ThemeProvider defaultTheme="dark">
          <ThemeConsumer />
        </ThemeProvider>
      );

      expect(screen.getByTestId('theme').textContent).toBe('dark');
    });
  });

  describe('meta theme-color', () => {
    it('updates meta theme-color for dark theme', () => {
      // Add meta theme-color element
      const meta = document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      meta.setAttribute('content', '#F8FAFC');
      document.head.appendChild(meta);

      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      );

      fireEvent.click(screen.getByText('Dark'));
      expect(meta.getAttribute('content')).toBe('#0F172A');

      // Cleanup
      document.head.removeChild(meta);
    });

    it('updates meta theme-color for light theme', () => {
      // Add meta theme-color element
      const meta = document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      meta.setAttribute('content', '#0F172A');
      document.head.appendChild(meta);

      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      );

      fireEvent.click(screen.getByText('Light'));
      expect(meta.getAttribute('content')).toBe('#F8FAFC');

      // Cleanup
      document.head.removeChild(meta);
    });
  });

  describe('system preference change', () => {
    it('responds to system preference change when theme is system', () => {
      let changeHandler: ((e: MediaQueryListEvent) => void) | null = null;

      const mediaQueryMock = {
        matches: false,
        media: '(prefers-color-scheme: dark)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn((event: string, handler: (e: MediaQueryListEvent) => void) => {
          if (event === 'change') changeHandler = handler;
        }),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      };

      window.matchMedia = vi.fn().mockImplementation(() => mediaQueryMock);

      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      );

      // Initially light (system preference is false = light)
      expect(screen.getByTestId('resolved').textContent).toBe('light');

      // Simulate system preference change to dark
      act(() => {
        if (changeHandler) {
          changeHandler({ matches: true } as MediaQueryListEvent);
        }
      });

      expect(screen.getByTestId('resolved').textContent).toBe('dark');
    });

    it('ignores system preference change when theme is explicit', () => {
      let changeHandler: ((e: MediaQueryListEvent) => void) | null = null;

      const mediaQueryMock = {
        matches: false,
        media: '(prefers-color-scheme: dark)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn((event: string, handler: (e: MediaQueryListEvent) => void) => {
          if (event === 'change') changeHandler = handler;
        }),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      };

      window.matchMedia = vi.fn().mockImplementation(() => mediaQueryMock);

      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      );

      // Set explicit light theme
      fireEvent.click(screen.getByText('Light'));
      expect(screen.getByTestId('theme').textContent).toBe('light');

      // Simulate system preference change to dark
      act(() => {
        if (changeHandler) {
          changeHandler({ matches: true } as MediaQueryListEvent);
        }
      });

      // Should still be light because theme is explicit
      expect(screen.getByTestId('resolved').textContent).toBe('light');
    });

    it('cleans up event listener on unmount', () => {
      const removeEventListenerMock = vi.fn();
      const mediaQueryMock = {
        matches: false,
        media: '(prefers-color-scheme: dark)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: removeEventListenerMock,
        dispatchEvent: vi.fn(),
      };

      window.matchMedia = vi.fn().mockImplementation(() => mediaQueryMock);

      const { unmount } = render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      );

      unmount();
      expect(removeEventListenerMock).toHaveBeenCalledWith('change', expect.any(Function));
    });
  });

  describe('toggleTheme', () => {
    const ToggleConsumer: React.FC = () => {
      const { resolvedTheme, toggleTheme } = useTheme();
      return (
        <div>
          <span data-testid="resolved">{resolvedTheme}</span>
          <button onClick={toggleTheme}>Toggle</button>
        </div>
      );
    };

    it('toggles from light to dark', () => {
      window.matchMedia = vi.fn().mockImplementation(() => matchMediaMock(false));

      render(
        <ThemeProvider>
          <ToggleConsumer />
        </ThemeProvider>
      );

      expect(screen.getByTestId('resolved').textContent).toBe('light');
      fireEvent.click(screen.getByText('Toggle'));
      expect(screen.getByTestId('resolved').textContent).toBe('dark');
    });

    it('toggles from dark to light', () => {
      window.matchMedia = vi.fn().mockImplementation(() => matchMediaMock(true));

      render(
        <ThemeProvider>
          <ToggleConsumer />
        </ThemeProvider>
      );

      expect(screen.getByTestId('resolved').textContent).toBe('dark');
      fireEvent.click(screen.getByText('Toggle'));
      expect(screen.getByTestId('resolved').textContent).toBe('light');
    });
  });

  describe('isDark', () => {
    const IsDarkConsumer: React.FC = () => {
      const { isDark } = useTheme();
      return <span data-testid="is-dark">{isDark.toString()}</span>;
    };

    it('returns true when dark theme', () => {
      render(
        <ThemeProvider defaultTheme="dark">
          <IsDarkConsumer />
        </ThemeProvider>
      );
      expect(screen.getByTestId('is-dark').textContent).toBe('true');
    });

    it('returns false when light theme', () => {
      render(
        <ThemeProvider defaultTheme="light">
          <IsDarkConsumer />
        </ThemeProvider>
      );
      expect(screen.getByTestId('is-dark').textContent).toBe('false');
    });
  });

  describe('localStorage errors', () => {
    it('handles localStorage getItem error gracefully', () => {
      const originalLocalStorage = window.localStorage;
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: () => { throw new Error('Storage error'); },
          setItem: vi.fn(),
        },
        configurable: true,
      });

      // Should not throw, defaults to system
      const { container } = render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      );
      expect(container).toBeDefined();
      expect(screen.getByTestId('theme').textContent).toBe('system');

      // Restore
      Object.defineProperty(window, 'localStorage', {
        value: originalLocalStorage,
        configurable: true,
      });
    });

    it('handles localStorage setItem error gracefully', () => {
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: () => null,
          setItem: () => { throw new Error('Storage error'); },
        },
        configurable: true,
      });

      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      );

      // Should not throw when setting theme
      expect(() => {
        fireEvent.click(screen.getByText('Dark'));
      }).not.toThrow();
    });
  });
});

