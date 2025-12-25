/**
 * Message Types
 *
 * Types for secure messaging between patients and healthcare providers.
 * Supports conversation threads with real-time updates.
 */

/** Message sender type. */
export type MessageSender = 'patient' | 'provider'

/** Message status. */
export type MessageStatus = 'sent' | 'delivered' | 'read'

/** Conversation status. */
export type ConversationStatus = 'active' | 'archived' | 'closed'

/**
 * Individual message within a conversation.
 */
export interface Message {
  /** Unique identifier */
  id: string
  /** Conversation this message belongs to */
  conversationId: string
  /** Message content */
  content: string
  /** Who sent the message */
  sender: MessageSender
  /** Sender user ID */
  senderId: string
  /** Sender display name */
  senderName: string
  /** Message status */
  status: MessageStatus
  /** Attachment URL if any */
  attachmentUrl?: string
  /** Attachment file name */
  attachmentName?: string
  /** Attachment file type */
  attachmentType?: string
  /** Created timestamp (ISO date) */
  createdAt: string
  /** Read timestamp (ISO date) */
  readAt?: string
}

/**
 * Conversation thread between patient and provider.
 *
 * Stored at: /clinics/{clinicId}/conversations/{conversationId}
 */
export interface Conversation {
  /** Unique identifier */
  id: string
  /** Patient ID */
  patientId: string
  /** Patient name (denormalized) */
  patientName: string
  /** Provider/Professional ID */
  providerId: string
  /** Provider name (denormalized) */
  providerName: string
  /** Provider specialty (denormalized) */
  providerSpecialty?: string
  /** Last message preview */
  lastMessage: string
  /** Last message timestamp (ISO date) */
  lastMessageAt: string
  /** Last message sender */
  lastMessageSender: MessageSender
  /** Unread count for patient */
  unreadCountPatient: number
  /** Unread count for provider */
  unreadCountProvider: number
  /** Conversation status */
  status: ConversationStatus
  /** Related appointment ID if any */
  appointmentId?: string
  /** Clinic ID (for multi-tenancy) */
  clinicId: string
  /** Created timestamp */
  createdAt: string
  /** Updated timestamp */
  updatedAt: string
}

/**
 * Conversation with messages loaded.
 */
export interface ConversationWithMessages extends Conversation {
  /** Messages in this conversation (loaded separately) */
  messages: Message[]
}

/**
 * Input for creating a new conversation.
 */
export type CreateConversationInput = Omit<
  Conversation,
  | 'id'
  | 'createdAt'
  | 'updatedAt'
  | 'lastMessage'
  | 'lastMessageAt'
  | 'lastMessageSender'
  | 'unreadCountPatient'
  | 'unreadCountProvider'
> & {
  /** Initial message content */
  initialMessage: string
}

/**
 * Input for sending a new message.
 */
export interface SendMessageInput {
  /** Conversation ID */
  conversationId: string
  /** Message content */
  content: string
  /** Sender type */
  sender: MessageSender
  /** Sender user ID */
  senderId: string
  /** Sender display name */
  senderName: string
  /** Optional attachment */
  attachment?: File
}

/**
 * Filter options for querying conversations.
 */
export interface ConversationFilters {
  /** Filter by patient ID */
  patientId?: string
  /** Filter by provider ID */
  providerId?: string
  /** Filter by status */
  status?: ConversationStatus
  /** Only show unread */
  unreadOnly?: boolean
  /** Limit number of results */
  limitCount?: number
}

/**
 * Return type for usePatientMessages hook.
 */
export interface UsePatientMessagesReturn {
  /** List of conversations */
  conversations: Conversation[]
  /** Currently selected conversation with messages */
  activeConversation: ConversationWithMessages | null
  /** Total unread count */
  totalUnread: number
  /** Loading state */
  loading: boolean
  /** Error state */
  error: Error | null
  /** Select a conversation and load its messages */
  selectConversation: (conversationId: string) => Promise<void>
  /** Send a message in active conversation */
  sendMessage: (content: string, attachment?: File) => Promise<void>
  /** Start a new conversation */
  startConversation: (
    providerId: string,
    providerName: string,
    providerSpecialty: string,
    message: string
  ) => Promise<string>
  /** Mark messages as read */
  markAsRead: (conversationId: string) => Promise<void>
  /** Archive a conversation */
  archiveConversation: (conversationId: string) => Promise<void>
}
