/**
 * Workflows Index
 *
 * Exports all workflow Cloud Functions.
 *
 * @module functions/workflows
 */

// Follow-up workflow
export { sendFollowUpMessages } from './follow-up.js';

// NPS Survey workflow
export { sendNPSSurveys, npsResponseWebhook, calculateNPSScore } from './nps.js';

// Patient return reminder workflow
export { sendPatientReturnReminders, getPatientReturnStats } from './patient-return.js';

// Labs integration webhook
export { labsResultWebhook, getLabResultsStats } from './labs-webhook.js';

// Types
export * from './types.js';
