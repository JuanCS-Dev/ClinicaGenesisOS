/**
 * ThemeToggle Component Tests
 * ===========================
 * 
 * Unit tests for the Design System ThemeToggle component.
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, ThemeToggle, ThemeSegmented } from '@/design-system';

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

describe('ThemeToggle', () => {
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

  describe('rendering', () => {
    it('renders toggle button', () => {
      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      );
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('theme cycling', () => {
    it('cycles through themes on click', () => {
      render(
        <ThemeProvider defaultTheme="light">
          <ThemeToggle />
        </ThemeProvider>
      );
      
      const button = screen.getByRole('button');
      
      // Start at light, click to go to dark
      fireEvent.click(button);
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
  });

  describe('icon display', () => {
    it('shows icon in light mode', () => {
      render(
        <ThemeProvider defaultTheme="light">
          <ThemeToggle />
        </ThemeProvider>
      );
      const button = screen.getByRole('button');
      expect(button.querySelector('svg')).toBeInTheDocument();
    });

    it('shows icon in dark mode', () => {
      render(
        <ThemeProvider defaultTheme="dark">
          <ThemeToggle />
        </ThemeProvider>
      );
      const button = screen.getByRole('button');
      expect(button.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('custom className', () => {
    it('merges custom className', () => {
      render(
        <ThemeProvider>
          <ThemeToggle className="custom-toggle" />
        </ThemeProvider>
      );
      const button = screen.getByRole('button');
      expect(button.className).toContain('custom-toggle');
    });
  });

  describe('showSystemOption cycling', () => {
    it('cycles light -> dark -> system -> light when showSystemOption true', () => {
      render(
        <ThemeProvider defaultTheme="light">
          <ThemeToggle showSystemOption />
        </ThemeProvider>
      );

      const button = screen.getByRole('button');

      // Start at light, click to go to dark
      fireEvent.click(button);
      expect(document.documentElement.classList.contains('dark')).toBe(true);

      // Click again to go to system
      fireEvent.click(button);
      // In system mode, theme follows system preference (mocked as light)
      expect(document.documentElement.classList.contains('dark')).toBe(false);

      // Click again to go back to light
      fireEvent.click(button);
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('shows Monitor icon when theme is system', () => {
      render(
        <ThemeProvider defaultTheme="system">
          <ThemeToggle showSystemOption />
        </ThemeProvider>
      );

      const button = screen.getByRole('button');
      const svg = button.querySelector('svg');
      expect(svg).toBeInTheDocument();
      // Monitor icon should be shown (has class lucide-monitor)
      expect(svg?.classList.contains('lucide-monitor')).toBe(true);
    });
  });

  describe('showLabel prop', () => {
    it('shows label when showLabel is true', () => {
      render(
        <ThemeProvider defaultTheme="light">
          <ThemeToggle showLabel />
        </ThemeProvider>
      );

      expect(screen.getByText('Claro')).toBeInTheDocument();
    });

    it('shows Escuro label in dark mode', () => {
      render(
        <ThemeProvider defaultTheme="dark">
          <ThemeToggle showLabel />
        </ThemeProvider>
      );

      expect(screen.getByText('Escuro')).toBeInTheDocument();
    });

    it('shows Sistema label in system mode', () => {
      render(
        <ThemeProvider defaultTheme="system">
          <ThemeToggle showLabel />
        </ThemeProvider>
      );

      expect(screen.getByText('Sistema')).toBeInTheDocument();
    });
  });

  describe('size variants', () => {
    it('renders sm size', () => {
      render(
        <ThemeProvider>
          <ThemeToggle size="sm" />
        </ThemeProvider>
      );

      const button = screen.getByRole('button');
      expect(button.className).toContain('p-1.5');
    });

    it('renders lg size', () => {
      render(
        <ThemeProvider>
          <ThemeToggle size="lg" />
        </ThemeProvider>
      );

      const button = screen.getByRole('button');
      expect(button.className).toContain('p-2.5');
    });
  });

  describe('aria attributes', () => {
    it('has correct aria-label', () => {
      render(
        <ThemeProvider defaultTheme="light">
          <ThemeToggle />
        </ThemeProvider>
      );

      const button = screen.getByRole('button');
      expect(button.getAttribute('aria-label')).toContain('Tema atual: Claro');
    });

    it('has title attribute', () => {
      render(
        <ThemeProvider defaultTheme="dark">
          <ThemeToggle />
        </ThemeProvider>
      );

      const button = screen.getByRole('button');
      expect(button.getAttribute('title')).toBe('Tema: Escuro');
    });
  });
});

describe('ThemeSegmented', () => {
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

  describe('rendering', () => {
    it('renders three radio buttons for light, dark, system', () => {
      render(
        <ThemeProvider>
          <ThemeSegmented />
        </ThemeProvider>
      );
      const radios = screen.getAllByRole('radio');
      expect(radios.length).toBe(3);
    });
  });

  describe('theme selection', () => {
    it('selects light theme', () => {
      render(
        <ThemeProvider>
          <ThemeSegmented />
        </ThemeProvider>
      );
      
      const radios = screen.getAllByRole('radio');
      fireEvent.click(radios[0]); // Light
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('selects dark theme', () => {
      render(
        <ThemeProvider>
          <ThemeSegmented />
        </ThemeProvider>
      );
      
      const radios = screen.getAllByRole('radio');
      fireEvent.click(radios[1]); // Dark
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
  });

  describe('custom className', () => {
    it('merges custom className', () => {
      const { container } = render(
        <ThemeProvider>
          <ThemeSegmented className="custom-segmented" />
        </ThemeProvider>
      );
      expect(container.querySelector('.custom-segmented')).toBeInTheDocument();
    });
  });
});
