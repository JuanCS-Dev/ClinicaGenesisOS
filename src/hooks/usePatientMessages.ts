/**
 * usePatientMessages Hook
 *
 * Provides real-time access to patient's messaging conversations.
 * Includes message sending and conversation management.
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { usePatientPortal } from '@/contexts/PatientPortalContext'
import { messageService } from '@/services/firestore'
import type {
  Conversation,
  ConversationWithMessages,
  Message,
  UsePatientMessagesReturn,
} from '@/types'

/**
 * Hook for managing patient messages with real-time updates.
 *
 * @returns Messages data and operations
 *
 * @example
 * const { conversations, activeConversation, sendMessage } = usePatientMessages();
 */
export function usePatientMessages(): UsePatientMessagesReturn {
  const { patientId, patientData, clinicId } = usePatientPortal()
  const patientName = patientData?.name || 'Paciente'

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] = useState<ConversationWithMessages | null>(
    null
  )
  const [messages, setMessages] = useState<Message[]>([])
  const [error, setError] = useState<Error | null>(null)
  const [hasReceived, setHasReceived] = useState(false)
  const [messagesUnsubscribe, setMessagesUnsubscribe] = useState<(() => void) | null>(null)

  // Subscribe to conversations
  useEffect(() => {
    if (!clinicId || !patientId) {
      setConversations([])
      setHasReceived(true)
      return
    }

    let isActive = true

    const unsubscribe = messageService.subscribeByPatient(clinicId, patientId, data => {
      if (isActive) {
        setConversations(data)
        setHasReceived(true)
        setError(null)
      }
    })

    return () => {
      isActive = false
      unsubscribe()
    }
  }, [clinicId, patientId])

  // Update active conversation when messages change
  useEffect(() => {
    setActiveConversation(prev =>
      prev
        ? {
            ...prev,
            messages,
          }
        : null
    )
  }, [messages])

  // Cleanup messages subscription on unmount
  useEffect(() => {
    return () => {
      if (messagesUnsubscribe) {
        messagesUnsubscribe()
      }
    }
  }, [messagesUnsubscribe])

  // Calculate total unread count
  const totalUnread = useMemo(() => {
    return conversations.reduce((sum, conv) => sum + conv.unreadCountPatient, 0)
  }, [conversations])

  // Loading state
  const loading = !hasReceived && Boolean(clinicId && patientId)

  /**
   * Select a conversation and load its messages.
   */
  const selectConversation = useCallback(
    async (conversationId: string): Promise<void> => {
      if (!clinicId) {
        throw new Error('No clinic selected')
      }

      // Unsubscribe from previous messages
      if (messagesUnsubscribe) {
        messagesUnsubscribe()
      }

      try {
        // Get conversation details
        const conversation = conversations.find(c => c.id === conversationId)
        if (!conversation) {
          throw new Error('Conversation not found')
        }

        // Subscribe to messages
        const unsubscribe = messageService.subscribeToMessages(clinicId, conversationId, msgs => {
          setMessages(msgs)
          setActiveConversation({
            ...conversation,
            messages: msgs,
          })
        })

        setMessagesUnsubscribe(() => unsubscribe)

        // Mark as read
        if (conversation.unreadCountPatient > 0) {
          await messageService.markAsRead(clinicId, conversationId, 'patient')
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to load conversation')
        setError(error)
        throw error
      }
    },
    [clinicId, conversations, messagesUnsubscribe]
  )

  /**
   * Send a message in the active conversation.
   */
  const sendMessage = useCallback(
    async (content: string, attachment?: File): Promise<void> => {
      if (!clinicId || !patientId || !patientName || !activeConversation) {
        throw new Error('No active conversation')
      }

      try {
        await messageService.sendMessage(clinicId, {
          conversationId: activeConversation.id,
          content,
          sender: 'patient',
          senderId: patientId,
          senderName: patientName,
          attachment,
        })
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to send message')
        setError(error)
        throw error
      }
    },
    [clinicId, patientId, patientName, activeConversation]
  )

  /**
   * Start a new conversation with a provider.
   */
  const startConversation = useCallback(
    async (
      providerId: string,
      providerName: string,
      providerSpecialty: string,
      message: string
    ): Promise<string> => {
      if (!clinicId || !patientId || !patientName) {
        throw new Error('No patient context')
      }

      try {
        const conversationId = await messageService.createConversation(clinicId, {
          patientId,
          patientName,
          providerId,
          providerName,
          providerSpecialty,
          initialMessage: message,
        })

        return conversationId
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to start conversation')
        setError(error)
        throw error
      }
    },
    [clinicId, patientId, patientName]
  )

  /**
   * Mark conversation as read.
   */
  const markAsRead = useCallback(
    async (conversationId: string): Promise<void> => {
      if (!clinicId) {
        throw new Error('No clinic selected')
      }

      try {
        await messageService.markAsRead(clinicId, conversationId, 'patient')
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to mark as read')
        setError(error)
        throw error
      }
    },
    [clinicId]
  )

  /**
   * Archive a conversation.
   */
  const archiveConversation = useCallback(
    async (conversationId: string): Promise<void> => {
      if (!clinicId) {
        throw new Error('No clinic selected')
      }

      try {
        await messageService.archiveConversation(clinicId, conversationId)

        // Clear active if it was the archived one
        if (activeConversation?.id === conversationId) {
          setActiveConversation(null)
          if (messagesUnsubscribe) {
            messagesUnsubscribe()
            setMessagesUnsubscribe(null)
          }
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to archive conversation')
        setError(error)
        throw error
      }
    },
    [clinicId, activeConversation, messagesUnsubscribe]
  )

  return {
    conversations,
    activeConversation,
    totalUnread,
    loading,
    error,
    selectConversation,
    sendMessage,
    startConversation,
    markAsRead,
    archiveConversation,
  }
}
