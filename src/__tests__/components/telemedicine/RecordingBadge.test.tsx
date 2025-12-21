/**
 * RecordingBadge Component Tests
 *
 * Tests for the recording badge indicator component.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RecordingBadge } from '@/components/telemedicine/RecordingBadge';

describe('RecordingBadge', () => {
  it('renders with default label "REC"', () => {
    render(<RecordingBadge />);

    expect(screen.getByText('REC')).toBeInTheDocument();
  });

  it('renders with custom label', () => {
    render(<RecordingBadge label="GRAVANDO" />);

    expect(screen.getByText('GRAVANDO')).toBeInTheDocument();
  });

  it('has correct aria-label for accessibility', () => {
    render(<RecordingBadge />);

    expect(screen.getByRole('status')).toHaveAttribute(
      'aria-label',
      'Gravação em andamento'
    );
  });

  it('applies small size classes', () => {
    const { container } = render(<RecordingBadge size="sm" />);

    expect(container.firstChild).toHaveClass('px-2', 'py-1', 'text-xs');
  });

  it('applies medium size classes by default', () => {
    const { container } = render(<RecordingBadge />);

    expect(container.firstChild).toHaveClass('px-3', 'py-1.5', 'text-sm');
  });

  it('applies large size classes', () => {
    const { container } = render(<RecordingBadge size="lg" />);

    expect(container.firstChild).toHaveClass('px-4', 'py-2', 'text-base');
  });

  it('has red background color', () => {
    const { container } = render(<RecordingBadge />);

    expect(container.firstChild).toHaveClass('bg-red-600');
  });

  it('has pulsing animation', () => {
    const { container } = render(<RecordingBadge />);

    expect(container.firstChild).toHaveClass('animate-pulse');
  });

  it('renders recording dot icon', () => {
    render(<RecordingBadge />);

    // Should have an SVG (Circle icon)
    const icon = document.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });
});
