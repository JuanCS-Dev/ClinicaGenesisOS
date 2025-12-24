/**
 * Plugin System Types
 *
 * Types for the specialty plugin system.
 */

import type React from 'react';
import type { SpecialtyType } from './base';

export interface PluginDefinition {
  id: SpecialtyType;
  name: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
  features: string[];
}
