/**
 * ConsultationTimer Component Tests
 *
 * Tests for the consultation timer component that tracks elapsed time.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { ConsultationTimer } from '@/components/telemedicine/ConsultationTimer';

describe('ConsultationTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders initial time as 00:00', () => {
    const now = new Date();
    render(<ConsultationTimer startTime={now.toISOString()} />);

    expect(screen.getByText('00:00')).toBeInTheDocument();
  });

  it('updates time every second', () => {
    const startTime = new Date();
    render(<ConsultationTimer startTime={startTime.toISOString()} />);

    // Initially 00:00
    expect(screen.getByText('00:00')).toBeInTheDocument();

    // Advance 30 seconds
    act(() => {
      vi.advanceTimersByTime(30000);
    });

    expect(screen.getByText('00:30')).toBeInTheDocument();

    // Advance to 1 minute
    act(() => {
      vi.advanceTimersByTime(30000);
    });

    expect(screen.getByText('01:00')).toBeInTheDocument();
  });

  it('formats hours correctly when elapsed time exceeds 1 hour', () => {
    const startTime = new Date(Date.now() - 3661000); // 1 hour, 1 minute, 1 second ago
    render(<ConsultationTimer startTime={startTime.toISOString()} />);

    // Should show HH:MM:SS format
    expect(screen.getByText(/01:01:0/)).toBeInTheDocument();
  });

  it('applies warning style after threshold', () => {
    const startTime = new Date(Date.now() - 45 * 60 * 1000); // 45 minutes ago
    const { container } = render(
      <ConsultationTimer startTime={startTime.toISOString()} warningThreshold={45} />
    );

    // Should have warning background color
    expect(container.firstChild).toHaveClass('bg-amber-600/80');
  });

  it('applies critical style after threshold + 15 minutes', () => {
    const startTime = new Date(Date.now() - 60 * 60 * 1000); // 60 minutes ago (45 + 15)
    const { container } = render(
      <ConsultationTimer startTime={startTime.toISOString()} warningThreshold={45} />
    );

    // Should have critical background color
    expect(container.firstChild).toHaveClass('bg-red-600/80');
  });

  it('calls onThresholdReached when threshold is reached', () => {
    const onThresholdReached = vi.fn();
    const startTime = new Date();

    render(
      <ConsultationTimer
        startTime={startTime.toISOString()}
        warningThreshold={1} // 1 minute
        onThresholdReached={onThresholdReached}
      />
    );

    // Initially not called
    expect(onThresholdReached).not.toHaveBeenCalled();

    // Advance past threshold
    act(() => {
      vi.advanceTimersByTime(61000); // 61 seconds
    });

    expect(onThresholdReached).toHaveBeenCalledTimes(1);
  });

  it('only calls onThresholdReached once', () => {
    const onThresholdReached = vi.fn();
    const startTime = new Date();

    render(
      <ConsultationTimer
        startTime={startTime.toISOString()}
        warningThreshold={1}
        onThresholdReached={onThresholdReached}
      />
    );

    // Advance past threshold multiple times
    act(() => {
      vi.advanceTimersByTime(120000); // 2 minutes
    });

    // Should only be called once
    expect(onThresholdReached).toHaveBeenCalledTimes(1);
  });

  it('displays clock icon', () => {
    const startTime = new Date();
    render(<ConsultationTimer startTime={startTime.toISOString()} />);

    // Should have the Clock icon (check for svg)
    const clockIcon = document.querySelector('svg');
    expect(clockIcon).toBeInTheDocument();
  });
});
