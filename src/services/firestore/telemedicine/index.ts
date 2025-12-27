/**
 * Telemedicine Service Module
 *
 * Handles CRUD operations for teleconsultation sessions in Firestore.
 * Sessions are stored as subcollections under clinics for multi-tenancy.
 * Supports Google Meet (primary) and Jitsi Meet (legacy).
 *
 * Collection: /clinics/{clinicId}/teleconsultations/{sessionId}
 * Logs: /clinics/{clinicId}/teleconsultations/{sessionId}/logs/{logId}
 *
 * @module services/firestore/telemedicine
 */

// Import all operations
import {
  getAll,
  getById,
  getByAppointment,
  getActiveByPatient,
  getLogs,
} from './queries';

import {
  create,
  updateStatus,
  addParticipant,
  removeParticipant,
  endSession,
  addNotes,
  reportTechnicalIssue,
  addLog,
  // Google Meet functions
  createWithMeet,
  setMeetLink,
  cancelWithMeet,
  type CreateWithMeetInput,
} from './mutations';

import { subscribe, subscribeActive } from './subscriptions';

/**
 * Telemedicine service for Firestore operations.
 */
export const telemedicineService = {
  // Query operations
  getAll,
  getById,
  getByAppointment,
  getActiveByPatient,
  getLogs,

  // Mutation operations (legacy Jitsi)
  create,
  updateStatus,
  addParticipant,
  removeParticipant,
  endSession,
  addNotes,
  reportTechnicalIssue,
  addLog,

  // Google Meet operations (primary)
  createWithMeet,
  setMeetLink,
  cancelWithMeet,

  // Subscription operations
  subscribe,
  subscribeActive,
};

// Re-export individual functions for direct imports
export {
  // Queries
  getAll,
  getById,
  getByAppointment,
  getActiveByPatient,
  getLogs,
  // Mutations (legacy Jitsi)
  create,
  updateStatus,
  addParticipant,
  removeParticipant,
  endSession,
  addNotes,
  reportTechnicalIssue,
  addLog,
  // Google Meet operations (primary)
  createWithMeet,
  setMeetLink,
  cancelWithMeet,
  type CreateWithMeetInput,
  // Subscriptions
  subscribe,
  subscribeActive,
};

// Re-export helpers for advanced usage
export {
  getTelemedicineCollection,
  getSessionDoc,
  getLogsCollection,
  generateRoomName,
} from './helpers';

// Re-export converters for advanced usage
export { toSession, toLogEntry } from './converters';
