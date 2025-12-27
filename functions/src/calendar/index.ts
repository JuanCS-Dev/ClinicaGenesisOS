/**
 * Calendar Module Exports
 * =======================
 *
 * Google Calendar + Meet integration for teleconsultations.
 *
 * @module functions/calendar
 */

export {
  createMeetSession,
  cancelMeetSession,
  updateMeetSession,
  type CreateMeetSessionInput,
  type CreateMeetSessionOutput,
  type CancelMeetSessionInput,
  type UpdateMeetSessionInput,
} from './google-meet.js'
