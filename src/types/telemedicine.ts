/**
 * Telemedicine Module Types
 * =========================
 *
 * Type definitions for the telemedicine (teleconsultation) feature.
 * Integrates with Jitsi Meet for E2E encrypted video calls.
 *
 * @module types/telemedicine
 */

/**
 * Status of a teleconsultation session.
 */
export type TelemedicineStatus =
  | 'scheduled'
  | 'waiting'
  | 'in_progress'
  | 'completed'
  | 'canceled'
  | 'no_show';

/**
 * Participant role in a teleconsultation.
 */
export type ParticipantRole = 'professional' | 'patient';

/**
 * Participant in a teleconsultation session.
 */
export interface TelemedicineParticipant {
  /** Participant ID (userId or patientId) */
  id: string;
  /** Display name shown in video call */
  displayName: string;
  /** Role in the session */
  role: ParticipantRole;
  /** When they joined the session */
  joinedAt?: string;
  /** When they left the session */
  leftAt?: string;
  /** Whether audio is enabled */
  audioEnabled?: boolean;
  /** Whether video is enabled */
  videoEnabled?: boolean;
}

/**
 * Teleconsultation session stored in Firestore.
 * Path: /clinics/{clinicId}/teleconsultations/{sessionId}
 */
export interface TelemedicineSession {
  /** Session ID */
  id: string;
  /** Associated appointment ID */
  appointmentId: string;
  /** Patient ID */
  patientId: string;
  /** Patient name (denormalized) */
  patientName: string;
  /** Professional user ID */
  professionalId: string;
  /** Professional name (denormalized) */
  professionalName: string;
  /** Unique room name for Jitsi */
  roomName: string;
  /** Current session status */
  status: TelemedicineStatus;
  /** Session participants */
  participants: TelemedicineParticipant[];
  /** When session was scheduled */
  scheduledAt: string;
  /** When session actually started */
  startedAt?: string;
  /** When session ended */
  endedAt?: string;
  /** Duration in seconds (calculated on end) */
  durationSeconds?: number;
  /** Whether recording was enabled */
  recordingEnabled?: boolean;
  /** Recording URL (if recorded) */
  recordingUrl?: string;
  /** Notes added during/after session */
  notes?: string;
  /** Technical issues encountered */
  technicalIssues?: string[];
  /** Created timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
}

/**
 * Input for creating a new teleconsultation session.
 */
export type CreateTelemedicineSessionInput = Pick<
  TelemedicineSession,
  | 'appointmentId'
  | 'patientId'
  | 'patientName'
  | 'professionalId'
  | 'professionalName'
  | 'scheduledAt'
  | 'recordingEnabled'
>;

/**
 * Jitsi configuration options.
 */
export interface JitsiConfig {
  /** Jitsi server domain */
  domain: string;
  /** Room name prefix (for namespacing) */
  roomPrefix: string;
  /** Whether to start with audio muted */
  startWithAudioMuted: boolean;
  /** Whether to start with video muted */
  startWithVideoMuted: boolean;
  /** Whether to show pre-join page */
  prejoinPageEnabled: boolean;
  /** Whether to disable deep linking (mobile apps) */
  disableDeepLinking: boolean;
  /** Toolbar buttons to show */
  toolbarButtons: string[];
  /** Whether to show Jitsi watermark */
  showWatermark: boolean;
}

/**
 * Default Jitsi configuration for Genesis.
 */
export const DEFAULT_JITSI_CONFIG: JitsiConfig = {
  domain: 'meet.jit.si',
  roomPrefix: 'genesis-clinic',
  startWithAudioMuted: true,
  startWithVideoMuted: false,
  prejoinPageEnabled: true,
  disableDeepLinking: true,
  toolbarButtons: [
    'microphone',
    'camera',
    'desktop',
    'chat',
    'raisehand',
    'hangup',
  ],
  showWatermark: false,
};

/**
 * Props for VideoRoom component.
 */
export interface VideoRoomProps {
  /** Teleconsultation session */
  session: TelemedicineSession;
  /** Display name of current user */
  displayName: string;
  /** Whether current user is the professional */
  isProfessional: boolean;
  /** Callback when call ends */
  onCallEnd: (session: TelemedicineSession) => void;
  /** Callback when participant joins */
  onParticipantJoin?: (participant: TelemedicineParticipant) => void;
  /** Callback when participant leaves */
  onParticipantLeave?: (participant: TelemedicineParticipant) => void;
}

/**
 * Props for WaitingRoom component.
 */
export interface WaitingRoomProps {
  /** Teleconsultation session */
  session: TelemedicineSession;
  /** Display name of current user */
  displayName: string;
  /** Whether current user is the professional */
  isProfessional: boolean;
  /** Callback when user is ready to join */
  onReady: () => void;
  /** Callback to cancel/leave waiting room */
  onCancel: () => void;
}

/**
 * Return type for useTelemedicine hook.
 */
export interface UseTelemedicineReturn {
  /** Current active session (if any) */
  session: TelemedicineSession | null;
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: Error | null;
  /** Whether user is in waiting room */
  isInWaitingRoom: boolean;
  /** Whether user is in active call */
  isInCall: boolean;
  /** Start a new teleconsultation */
  startSession: (input: CreateTelemedicineSessionInput) => Promise<string>;
  /** Join waiting room for a session */
  joinWaitingRoom: (sessionId: string) => Promise<void>;
  /** Start the actual video call */
  startCall: () => Promise<void>;
  /** End the current call */
  endCall: () => Promise<void>;
  /** Cancel a scheduled session */
  cancelSession: (sessionId: string, reason?: string) => Promise<void>;
  /** Get session by appointment ID */
  getSessionByAppointment: (appointmentId: string) => Promise<TelemedicineSession | null>;
}

/**
 * Teleconsultation log entry for audit.
 */
export interface TelemedicineLogEntry {
  /** Log entry ID */
  id: string;
  /** Session ID */
  sessionId: string;
  /** Event type */
  eventType:
    | 'session_created'
    | 'participant_joined'
    | 'participant_left'
    | 'call_started'
    | 'call_ended'
    | 'recording_started'
    | 'recording_stopped'
    | 'technical_issue';
  /** User who triggered the event */
  userId: string;
  /** Event details */
  details?: Record<string, unknown>;
  /** Timestamp */
  timestamp: string;
}
