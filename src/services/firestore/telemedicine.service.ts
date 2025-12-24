/**
 * Telemedicine Service - Re-export
 *
 * This file re-exports from the modular telemedicine/ directory.
 * Maintains backward compatibility with existing imports.
 *
 * @module services/firestore/telemedicine.service
 * @see services/firestore/telemedicine
 */

export {
  // Main service object
  telemedicineService,
  // Query operations
  getAll,
  getById,
  getByAppointment,
  getActiveByPatient,
  getLogs,
  // Mutation operations
  create,
  updateStatus,
  addParticipant,
  removeParticipant,
  endSession,
  addNotes,
  reportTechnicalIssue,
  addLog,
  // Subscription operations
  subscribe,
  subscribeActive,
  // Helpers
  getTelemedicineCollection,
  getSessionDoc,
  getLogsCollection,
  generateRoomName,
  // Converters
  toSession,
  toLogEntry,
} from './telemedicine';
