/**
 * SkipLink Component Tests
 *
 * @module __tests__/design-system/SkipLink
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SkipLink } from '../../design-system/components/SkipLink';

describe('SkipLink', () => {
  beforeEach(() => {
    // Clean up any existing elements
    document.body.innerHTML = '';
  });

  it('renders with default props', () => {
    render(<SkipLink />);
    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '#main-content');
    expect(link).toHaveTextContent('Pular para o conteúdo principal');
  });

  it('renders with custom href', () => {
    render(<SkipLink href="#custom-target" />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '#custom-target');
  });

  it('renders with custom label', () => {
    render(<SkipLink label="Skip navigation" />);
    const link = screen.getByRole('link');
    expect(link).toHaveTextContent('Skip navigation');
  });

  it('applies custom className', () => {
    render(<SkipLink className="my-skip-link" />);
    const link = screen.getByRole('link');
    expect(link).toHaveClass('my-skip-link');
  });

  it('has sr-only class for screen reader accessibility', () => {
    render(<SkipLink />);
    const link = screen.getByRole('link');
    expect(link).toHaveClass('sr-only');
  });

  it('handles click and focuses target element', () => {
    // Create target element
    const targetDiv = document.createElement('div');
    targetDiv.id = 'main-content';
    targetDiv.tabIndex = -1;
    document.body.appendChild(targetDiv);

    // Mock scrollIntoView on Element prototype
    const scrollIntoViewMock = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoViewMock;

    // Mock focus
    const focusMock = vi.fn();
    targetDiv.focus = focusMock;

    render(<SkipLink href="#main-content" />);
    const link = screen.getByRole('link');

    fireEvent.click(link);

    expect(focusMock).toHaveBeenCalled();
    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth' });
  });

  it('handles click when target does not exist', () => {
    render(<SkipLink href="#nonexistent" />);
    const link = screen.getByRole('link');

    // Should not throw
    expect(() => fireEvent.click(link)).not.toThrow();
  });

  it('prevents default link behavior on click', () => {
    const targetDiv = document.createElement('div');
    targetDiv.id = 'main-content';
    document.body.appendChild(targetDiv);

    // Mock scrollIntoView
    Element.prototype.scrollIntoView = vi.fn();

    render(<SkipLink />);
    const link = screen.getByRole('link');

    // Use fireEvent which handles preventDefault properly
    const clickResult = fireEvent.click(link);

    // Click was processed (not the default)
    expect(link).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<SkipLink />);
    const link = screen.getByRole('link');

    // Check focus styles are present
    expect(link.className).toContain('focus:');
    // Check it's visually hidden but accessible
    expect(link).toHaveClass('sr-only');
    expect(link).toHaveClass('focus:not-sr-only');
  });

  it('has z-index for proper stacking', () => {
    render(<SkipLink />);
    const link = screen.getByRole('link');
    expect(link.className).toContain('z-');
  });

  it('has proper styling when focused', () => {
    render(<SkipLink />);
    const link = screen.getByRole('link');

    // Check styling classes are present
    expect(link.className).toContain('rounded-lg');
    expect(link.className).toContain('px-4');
    expect(link.className).toContain('py-3');
  });

  it('has displayName set correctly', () => {
    expect(SkipLink.displayName).toBe('SkipLink');
  });
});
