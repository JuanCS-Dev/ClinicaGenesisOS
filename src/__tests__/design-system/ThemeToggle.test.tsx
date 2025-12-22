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
