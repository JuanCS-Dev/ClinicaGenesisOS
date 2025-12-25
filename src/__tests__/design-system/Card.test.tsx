/**
 * Card Component Tests
 * ====================
 * 
 * Unit tests for the Design System Card component.
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Card, CardHeader, CardBody, CardFooter } from '@/design-system';

describe('Card', () => {
  describe('rendering', () => {
    it('renders children correctly', () => {
      render(<Card>Card content</Card>);
      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('renders as div by default', () => {
      const { container } = render(<Card>Test</Card>);
      expect(container.querySelector('div')).toBeInTheDocument();
    });
  });

  describe('variants', () => {
    it('applies default variant', () => {
      const { container } = render(<Card>Default</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain('bg-genesis-surface');
    });

    it('applies elevated variant', () => {
      const { container } = render(<Card variant="elevated">Elevated</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain('shadow');
    });

    it('applies outlined variant', () => {
      const { container } = render(<Card variant="outlined">Outlined</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain('border');
    });
  });

  describe('padding', () => {
    it('applies small padding', () => {
      const { container } = render(<Card padding="sm">Small</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain('p-4');
    });

    it('applies medium padding by default', () => {
      const { container } = render(<Card>Medium</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain('p-6');
    });

    it('applies large padding', () => {
      const { container } = render(<Card padding="lg">Large</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain('p-8');
    });
  });

  describe('interactive', () => {
    it('adds hover effects when interactive', () => {
      const { container } = render(<Card interactive>Interactive</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain('hover:shadow');
      expect(card.className).toContain('cursor-pointer');
    });

    it('makes card focusable when interactive', () => {
      render(<Card interactive>Interactive</Card>);
      const card = screen.getByRole('button');
      expect(card).toHaveAttribute('tabIndex', '0');
    });

    it('calls onClick when clicked', () => {
      const onClick = vi.fn();
      render(<Card interactive onClick={onClick}>Click me</Card>);
      fireEvent.click(screen.getByRole('button'));
      expect(onClick).toHaveBeenCalled();
    });
  });

  describe('custom className', () => {
    it('merges custom className', () => {
      const { container } = render(<Card className="custom-card">Custom</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain('custom-card');
    });
  });
});

describe('CardHeader', () => {
  it('renders children', () => {
    render(<CardHeader>Header content</CardHeader>);
    expect(screen.getByText('Header content')).toBeInTheDocument();
  });
});

describe('CardBody', () => {
  it('renders children', () => {
    render(<CardBody>Body content</CardBody>);
    expect(screen.getByText('Body content')).toBeInTheDocument();
  });
});

describe('CardFooter', () => {
  it('renders children', () => {
    render(<CardFooter>Footer content</CardFooter>);
    expect(screen.getByText('Footer content')).toBeInTheDocument();
  });
});

describe('Card composition', () => {
  it('renders complete card with all sections', () => {
    render(
      <Card>
        <CardHeader>Header</CardHeader>
        <CardBody>Body</CardBody>
        <CardFooter>Footer</CardFooter>
      </Card>
    );
    
    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('Body')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });
});
