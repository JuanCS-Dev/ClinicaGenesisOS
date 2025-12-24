/**
 * Types Index (Barrel Export)
 *
 * Central re-export hub for all type modules.
 * Maintains backward compatibility: `import { X } from '@/types'`
 */

// ===== EXISTING MODULAR TYPES =====

// Clinical Reasoning Engine Types (3.3)
export * from './clinical-reasoning';

// Finance Types (4.1)
export * from './finance';

// Telemedicine Types (Phase 6)
export * from './telemedicine';

// TISS Billing Types (Phase 7)
export * from './tiss/index';

// Digital Prescription Types (Phase 8)
export * from './prescription';

// Payment Types (Phase 10)
export * from './payment';

// LGPD Types (Phase 11)
export * from './lgpd';

// Scribe Metrics Types (Phase 12)
export * from './scribe-metrics';

// ===== NEW MODULAR TYPES =====

// Appointment & Scheduling
export * from './appointment';

// Timeline
export * from './timeline';

// Medical Records & Plugin System
export * from './records';

// Clinic & Multi-tenancy
export * from './clinic';

// AI & Integrations
export * from './ai';

// AI Scribe
export * from './scribe';
