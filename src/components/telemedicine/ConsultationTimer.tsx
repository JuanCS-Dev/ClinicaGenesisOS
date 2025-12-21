/**
 * ConsultationTimer Component
 *
 * Displays elapsed time during a teleconsultation.
 * Helps professionals track consultation duration for billing and scheduling.
 */

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface ConsultationTimerProps {
  /** ISO timestamp when the consultation started */
  startTime: string;
  /** Optional warning threshold in minutes (default: 45) */
  warningThreshold?: number;
  /** Optional callback when threshold is reached */
  onThresholdReached?: () => void;
}

/**
 * ConsultationTimer - Live elapsed time display.
 *
 * @param startTime - When the consultation started
 * @param warningThreshold - Minutes after which to show warning (default 45)
 * @param onThresholdReached - Callback when warning threshold is reached
 */
export function ConsultationTimer({
  startTime,
  warningThreshold = 45,
  onThresholdReached,
}: ConsultationTimerProps) {
  const [elapsed, setElapsed] = useState(0);
  const [thresholdNotified, setThresholdNotified] = useState(false);

  useEffect(() => {
    const startDate = new Date(startTime);

    const updateElapsed = () => {
      const now = new Date();
      const seconds = Math.floor((now.getTime() - startDate.getTime()) / 1000);
      setElapsed(seconds);
    };

    // Initial update
    updateElapsed();

    // Update every second
    const interval = setInterval(updateElapsed, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  // Check threshold
  useEffect(() => {
    const elapsedMinutes = elapsed / 60;
    if (elapsedMinutes >= warningThreshold && !thresholdNotified) {
      setThresholdNotified(true);
      if (onThresholdReached) {
        onThresholdReached();
      }
    }
  }, [elapsed, warningThreshold, thresholdNotified, onThresholdReached]);

  /**
   * Format seconds as HH:MM:SS or MM:SS.
   */
  const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  };

  const elapsedMinutes = elapsed / 60;
  const isWarning = elapsedMinutes >= warningThreshold;
  const isCritical = elapsedMinutes >= warningThreshold + 15;

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg backdrop-blur-sm text-sm font-mono transition-colors ${
        isCritical
          ? 'bg-red-600/80 text-white'
          : isWarning
          ? 'bg-amber-600/80 text-white'
          : 'bg-black/50 text-white'
      }`}
    >
      <Clock className={`w-4 h-4 ${isWarning ? 'animate-pulse' : ''}`} />
      <span>{formatTime(elapsed)}</span>
    </div>
  );
}
