import React from 'react';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  isActive: boolean;
  isCompleted: boolean;
  number: number;
  title: string;
}

export function StepIndicator({ isActive, isCompleted, number, title }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
          isCompleted
            ? 'bg-green-500 text-white'
            : isActive
              ? 'bg-genesis-primary text-white'
              : 'bg-genesis-border-subtle text-genesis-muted'
        }`}
      >
        {isCompleted ? <Check className="w-5 h-5" /> : number}
      </div>
      <span
        className={`hidden sm:block font-medium transition-colors ${
          isActive ? 'text-genesis-dark' : 'text-genesis-subtle'
        }`}
      >
        {title}
      </span>
    </div>
  );
}
