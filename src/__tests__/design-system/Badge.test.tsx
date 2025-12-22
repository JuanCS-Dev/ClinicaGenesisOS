/**
 * Badge Component Tests
 * =====================
 * 
 * Unit tests for the Design System Badge component.
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '@/design-system';

describe('Badge', () => {
  describe('rendering', () => {
    it('renders children correctly', () => {
      render(<Badge>Status</Badge>);
      expect(screen.getByText('Status')).toBeInTheDocument();
    });
  });

  describe('variants', () => {
    it('applies default variant', () => {
      const { container } = render(<Badge>Default</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain('bg-[var(--color-genesis-hover)]');
    });

    it('applies primary variant', () => {
      const { container } = render(<Badge variant="primary">Primary</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain('bg-[var(--color-genesis-primary-soft)]');
    });

    it('applies success variant', () => {
      const { container } = render(<Badge variant="success">Success</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain('bg-[var(--color-success-soft)]');
    });

    it('applies danger variant', () => {
      const { container } = render(<Badge variant="danger">Danger</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain('bg-[var(--color-danger-soft)]');
    });

    it('applies warning variant', () => {
      const { container } = render(<Badge variant="warning">Warning</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain('bg-[var(--color-warning-soft)]');
    });

    it('applies info variant', () => {
      const { container } = render(<Badge variant="info">Info</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain('bg-[var(--color-info-soft)]');
    });

    it('applies clinical variant', () => {
      const { container } = render(<Badge variant="clinical">Clinical</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain('bg-[var(--color-clinical-soft)]');
    });
  });

  describe('sizes', () => {
    it('applies small size', () => {
      const { container } = render(<Badge size="sm">Small</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain('px-2');
    });

    it('applies medium size by default', () => {
      const { container } = render(<Badge>Medium</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain('px-2.5');
    });

    it('applies large size', () => {
      const { container } = render(<Badge size="lg">Large</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain('px-3');
    });
  });

  describe('dot indicator', () => {
    it('renders dot when dot prop is true', () => {
      const { container } = render(<Badge dot>With Dot</Badge>);
      const dot = container.querySelector('.rounded-full');
      expect(dot).toBeInTheDocument();
    });
  });

  describe('custom className', () => {
    it('merges custom className', () => {
      const { container } = render(<Badge className="custom-badge">Custom</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain('custom-badge');
    });
  });
});
