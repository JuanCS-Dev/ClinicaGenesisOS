/**
 * Message Service
 *
 * Handles CRUD operations for secure messaging between patients and providers.
 * Supports real-time conversation updates.
 *
 * Collections:
 *   - /clinics/{clinicId}/conversations/{conversationId}
 *   - /clinics/{clinicId}/conversations/{conversationId}/messages/{messageId}
 */

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  limit,
  Timestamp,
  type UpdateData,
  type DocumentData,
  increment,
  writeBatch,
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '../firebase'
import type { Conversation, Message, ConversationWithMessages, SendMessageInput } from '@/types'
import { auditHelper, type AuditUserContext } from './lgpd/audit-helper'

/**
 * Audit context for message operations.
 */
export interface MessageAuditContext {
  userId: string
  userName: string
}

/**
 * Build audit context for message operations.
 */
function buildAuditContext(clinicId: string, ctx?: MessageAuditContext): AuditUserContext | null {
  if (!ctx) return null
  return { clinicId, userId: ctx.userId, userName: ctx.userName }
}

/**
 * Get conversations collection reference.
 */
function getConversationsCollection(clinicId: string) {
  return collection(db, 'clinics', clinicId, 'conversations')
}

/**
 * Get conversation document reference.
 */
function getConversationDoc(clinicId: string, conversationId: string) {
  return doc(db, 'clinics', clinicId, 'conversations', conversationId)
}

/**
 * Get messages collection reference for a conversation.
 */
function getMessagesCollection(clinicId: string, conversationId: string) {
  return collection(db, 'clinics', clinicId, 'conversations', conversationId, 'messages')
}

/**
 * Convert Firestore document to Conversation.
 */
function toConversation(id: string, data: Record<string, unknown>): Conversation {
  return {
    id,
    patientId: data.patientId as string,
    patientName: data.patientName as string,
    providerId: data.providerId as string,
    providerName: data.providerName as string,
    providerSpecialty: data.providerSpecialty as string | undefined,
    lastMessage: data.lastMessage as string,
    lastMessageAt:
      data.lastMessageAt instanceof Timestamp
        ? data.lastMessageAt.toDate().toISOString()
        : (data.lastMessageAt as string),
    lastMessageSender: data.lastMessageSender as Conversation['lastMessageSender'],
    unreadCountPatient: (data.unreadCountPatient as number) || 0,
    unreadCountProvider: (data.unreadCountProvider as number) || 0,
    status: data.status as Conversation['status'],
    appointmentId: data.appointmentId as string | undefined,
    clinicId: data.clinicId as string,
    createdAt:
      data.createdAt instanceof Timestamp
        ? data.createdAt.toDate().toISOString()
        : (data.createdAt as string),
    updatedAt:
      data.updatedAt instanceof Timestamp
        ? data.updatedAt.toDate().toISOString()
        : (data.updatedAt as string),
  }
}

/**
 * Convert Firestore document to Message.
 */
function toMessage(id: string, data: Record<string, unknown>): Message {
  return {
    id,
    conversationId: data.conversationId as string,
    content: data.content as string,
    sender: data.sender as Message['sender'],
    senderId: data.senderId as string,
    senderName: data.senderName as string,
    status: data.status as Message['status'],
    attachmentUrl: data.attachmentUrl as string | undefined,
    attachmentName: data.attachmentName as string | undefined,
    attachmentType: data.attachmentType as string | undefined,
    createdAt:
      data.createdAt instanceof Timestamp
        ? data.createdAt.toDate().toISOString()
        : (data.createdAt as string),
    readAt:
      data.readAt instanceof Timestamp
        ? data.readAt.toDate().toISOString()
        : (data.readAt as string | undefined),
  }
}

/**
 * Message service for Firestore operations.
 */
export const messageService = {
  /**
   * Get all conversations for a patient.
   */
  async getByPatient(clinicId: string, patientId: string): Promise<Conversation[]> {
    const conversationsRef = getConversationsCollection(clinicId)
    const q = query(
      conversationsRef,
      where('patientId', '==', patientId),
      where('status', '==', 'active'),
      orderBy('lastMessageAt', 'desc')
    )

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(docSnap => toConversation(docSnap.id, docSnap.data()))
  },

  /**
   * Get all conversations for a provider.
   */
  async getByProvider(clinicId: string, providerId: string): Promise<Conversation[]> {
    const conversationsRef = getConversationsCollection(clinicId)
    const q = query(
      conversationsRef,
      where('providerId', '==', providerId),
      where('status', '==', 'active'),
      orderBy('lastMessageAt', 'desc')
    )

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(docSnap => toConversation(docSnap.id, docSnap.data()))
  },

  /**
   * Get a conversation by ID.
   */
  async getById(clinicId: string, conversationId: string): Promise<Conversation | null> {
    const docRef = getConversationDoc(clinicId, conversationId)
    const docSnap = await getDoc(docRef)
    if (!docSnap.exists()) return null
    return toConversation(docSnap.id, docSnap.data())
  },

  /**
   * Get messages for a conversation.
   */
  async getMessages(clinicId: string, conversationId: string, limitCount = 50): Promise<Message[]> {
    const messagesRef = getMessagesCollection(clinicId, conversationId)
    const q = query(messagesRef, orderBy('createdAt', 'asc'), limit(limitCount))

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(docSnap => toMessage(docSnap.id, docSnap.data()))
  },

  /**
   * Get conversation with messages.
   */
  async getWithMessages(
    clinicId: string,
    conversationId: string
  ): Promise<ConversationWithMessages | null> {
    const conversation = await this.getById(clinicId, conversationId)
    if (!conversation) return null

    const messages = await this.getMessages(clinicId, conversationId)

    return {
      ...conversation,
      messages,
    }
  },

  /**
   * Create a new conversation with initial message.
   *
   * @param clinicId - Clinic ID
   * @param data - Conversation data
   * @param auditCtx - Optional audit context
   */
  async createConversation(
    clinicId: string,
    data: {
      patientId: string
      patientName: string
      providerId: string
      providerName: string
      providerSpecialty?: string
      initialMessage: string
      appointmentId?: string
    },
    auditCtx?: MessageAuditContext
  ): Promise<string> {
    const conversationsRef = getConversationsCollection(clinicId)

    const conversationData = {
      patientId: data.patientId,
      patientName: data.patientName,
      providerId: data.providerId,
      providerName: data.providerName,
      providerSpecialty: data.providerSpecialty || null,
      lastMessage: data.initialMessage,
      lastMessageAt: serverTimestamp(),
      lastMessageSender: 'patient' as const,
      unreadCountPatient: 0,
      unreadCountProvider: 1,
      status: 'active',
      appointmentId: data.appointmentId || null,
      clinicId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    const conversationRef = await addDoc(conversationsRef, conversationData)

    // Add the initial message
    const messagesRef = getMessagesCollection(clinicId, conversationRef.id)
    await addDoc(messagesRef, {
      conversationId: conversationRef.id,
      content: data.initialMessage,
      sender: 'patient',
      senderId: data.patientId,
      senderName: data.patientName,
      status: 'sent',
      createdAt: serverTimestamp(),
    })

    // LGPD audit log - new conversation with patient
    const ctx = buildAuditContext(clinicId, auditCtx)
    if (ctx) {
      await auditHelper.logCreate(ctx, 'conversation', conversationRef.id, {
        patientId: data.patientId,
        providerId: data.providerId,
        appointmentId: data.appointmentId,
      })
    }

    return conversationRef.id
  },

  /**
   * Send a message in a conversation.
   *
   * @param clinicId - Clinic ID
   * @param input - Message input
   * @param auditCtx - Optional audit context
   */
  async sendMessage(
    clinicId: string,
    input: SendMessageInput,
    auditCtx?: MessageAuditContext
  ): Promise<string> {
    const messagesRef = getMessagesCollection(clinicId, input.conversationId)

    let attachmentUrl: string | undefined
    let attachmentName: string | undefined
    let attachmentType: string | undefined

    // Handle attachment upload
    if (input.attachment) {
      const fileName = `${input.conversationId}_${Date.now()}_${input.attachment.name}`
      const storagePath = `clinics/${clinicId}/messages/${fileName}`
      const storageRef = ref(storage, storagePath)
      await uploadBytes(storageRef, input.attachment)
      attachmentUrl = await getDownloadURL(storageRef)
      attachmentName = input.attachment.name
      attachmentType = input.attachment.type
    }

    const messageData = {
      conversationId: input.conversationId,
      content: input.content,
      sender: input.sender,
      senderId: input.senderId,
      senderName: input.senderName,
      status: 'sent',
      attachmentUrl,
      attachmentName,
      attachmentType,
      createdAt: serverTimestamp(),
    }

    const messageRef = await addDoc(messagesRef, messageData)

    // Update conversation with last message info
    const conversationRef = getConversationDoc(clinicId, input.conversationId)
    const updateData = {
      lastMessage: input.content,
      lastMessageAt: serverTimestamp(),
      lastMessageSender: input.sender,
      updatedAt: serverTimestamp(),
    } as UpdateData<DocumentData>

    // Increment unread count for the other party
    if (input.sender === 'patient') {
      ;(updateData as Record<string, unknown>).unreadCountProvider = increment(1)
    } else {
      ;(updateData as Record<string, unknown>).unreadCountPatient = increment(1)
    }

    await updateDoc(conversationRef, updateData)

    // LGPD audit log - message sent (PHI communication)
    const ctx = buildAuditContext(clinicId, auditCtx)
    if (ctx) {
      await auditHelper.logCreate(ctx, 'message', messageRef.id, {
        conversationId: input.conversationId,
        sender: input.sender,
        hasAttachment: !!input.attachment,
      })
    }

    return messageRef.id
  },

  /**
   * Mark messages as read.
   */
  async markAsRead(
    clinicId: string,
    conversationId: string,
    reader: 'patient' | 'provider'
  ): Promise<void> {
    const conversationRef = getConversationDoc(clinicId, conversationId)

    const updateData = {
      updatedAt: serverTimestamp(),
    } as UpdateData<DocumentData>

    if (reader === 'patient') {
      ;(updateData as Record<string, unknown>).unreadCountPatient = 0
    } else {
      ;(updateData as Record<string, unknown>).unreadCountProvider = 0
    }

    await updateDoc(conversationRef, updateData)

    // Update message statuses to read
    const messagesRef = getMessagesCollection(clinicId, conversationId)
    const otherSender = reader === 'patient' ? 'provider' : 'patient'
    const q = query(messagesRef, where('sender', '==', otherSender), where('status', '!=', 'read'))

    const querySnapshot = await getDocs(q)
    const batch = writeBatch(db)

    querySnapshot.docs.forEach(docSnap => {
      batch.update(docSnap.ref, {
        status: 'read',
        readAt: serverTimestamp(),
      })
    })

    await batch.commit()
  },

  /**
   * Archive a conversation.
   *
   * @param clinicId - Clinic ID
   * @param conversationId - Conversation ID
   * @param auditCtx - Optional audit context
   */
  async archiveConversation(
    clinicId: string,
    conversationId: string,
    auditCtx?: MessageAuditContext
  ): Promise<void> {
    const conversationRef = getConversationDoc(clinicId, conversationId)

    // Get conversation data for audit before archiving
    const ctx = buildAuditContext(clinicId, auditCtx)
    let previousData: Record<string, unknown> | undefined
    if (ctx) {
      const docSnap = await getDoc(conversationRef)
      if (docSnap.exists()) {
        previousData = {
          patientId: docSnap.data().patientId,
          providerId: docSnap.data().providerId,
          status: docSnap.data().status,
        }
      }
    }

    await updateDoc(conversationRef, {
      status: 'archived',
      updatedAt: serverTimestamp(),
    })

    // LGPD audit log - conversation archived
    if (ctx && previousData) {
      await auditHelper.logUpdate(ctx, 'conversation', conversationId, previousData, {
        status: 'archived',
      })
    }
  },

  /**
   * Subscribe to patient's conversations.
   */
  subscribeByPatient(
    clinicId: string,
    patientId: string,
    callback: (conversations: Conversation[]) => void
  ): () => void {
    const conversationsRef = getConversationsCollection(clinicId)
    const q = query(
      conversationsRef,
      where('patientId', '==', patientId),
      where('status', '==', 'active'),
      orderBy('lastMessageAt', 'desc')
    )

    return onSnapshot(
      q,
      querySnapshot => {
        callback(querySnapshot.docs.map(docSnap => toConversation(docSnap.id, docSnap.data())))
      },
      error => {
        console.error('Error subscribing to conversations:', error)
        callback([])
      }
    )
  },

  /**
   * Subscribe to messages in a conversation.
   */
  subscribeToMessages(
    clinicId: string,
    conversationId: string,
    callback: (messages: Message[]) => void
  ): () => void {
    const messagesRef = getMessagesCollection(clinicId, conversationId)
    const q = query(messagesRef, orderBy('createdAt', 'asc'))

    return onSnapshot(
      q,
      querySnapshot => {
        callback(querySnapshot.docs.map(docSnap => toMessage(docSnap.id, docSnap.data())))
      },
      error => {
        console.error('Error subscribing to messages:', error)
        callback([])
      }
    )
  },
}
