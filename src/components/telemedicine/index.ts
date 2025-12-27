/**
 * Telemedicine Components
 *
 * Re-exports all telemedicine-related components.
 *
 * @example
 * import { MeetRoom, TelemedicineModal, VideoRoom, WaitingRoom } from '@/components/telemedicine';
 */

// Google Meet (primary)
export { MeetRoom } from './MeetRoom';

// Jitsi Meet (legacy)
export { VideoRoom } from './VideoRoom';
export { WaitingRoom } from './WaitingRoom';
export { ConsultationTimer } from './ConsultationTimer';
export { RecordingBadge } from './RecordingBadge';

// Shared
export { TelemedicineModal } from './TelemedicineModal';
export { TelemedicineButton } from './TelemedicineButton';
