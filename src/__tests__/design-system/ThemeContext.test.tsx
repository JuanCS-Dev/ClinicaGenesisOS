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
});

