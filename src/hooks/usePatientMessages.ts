/**
 * usePatientMessages Hook
 *
 * Provides real-time access to patient's messaging conversations.
 * Includes message sending and conversation management.
 *
 * @module hooks/usePatientMessages
 * @version 2.0.0 - Refactored for maintainability
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { usePatientPortal } from '@/contexts/PatientPortalContext'
import { messageService } from '@/services/firestore'
import type {
  Conversation,
  ConversationWithMessages,
  Message,
  UsePatientMessagesReturn,
} from '@/types'

// ============================================================================
// Error Helper
// ============================================================================

/**
 * Wrap an async operation with error handling.
 */
function handleError(err: unknown, fallbackMessage: string): Error {
  return err instanceof Error ? err : new Error(fallbackMessage)
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook for managing patient messages with real-time updates.
 */
export function usePatientMessages(): UsePatientMessagesReturn {
  const { patientId, patientData, clinicId } = usePatientPortal()
  const patientName = patientData?.name || 'Paciente'

  // State
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] = useState<ConversationWithMessages | null>(
    null
  )
  const [messages, setMessages] = useState<Message[]>([])
  const [error, setError] = useState<Error | null>(null)
  const [hasReceived, setHasReceived] = useState(false)

  // Ref to avoid stale closure in cleanup
  const messagesUnsubscribeRef = useRef<(() => void) | null>(null)

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
    setActiveConversation(prev => (prev ? { ...prev, messages } : null))
  }, [messages])

  // Cleanup messages subscription on unmount
  useEffect(() => {
    return () => messagesUnsubscribeRef.current?.()
  }, [])

  // Calculated values
  const totalUnread = useMemo(
    () => conversations.reduce((sum, conv) => sum + conv.unreadCountPatient, 0),
    [conversations]
  )
  const loading = !hasReceived && Boolean(clinicId && patientId)

  // ============================================================================
  // Actions
  // ============================================================================

  const selectConversation = useCallback(
    async (conversationId: string): Promise<void> => {
      if (!clinicId) throw new Error('No clinic selected')

      messagesUnsubscribeRef.current?.()

      try {
        const conversation = conversations.find(c => c.id === conversationId)
        if (!conversation) throw new Error('Conversation not found')

        const unsubscribe = messageService.subscribeToMessages(clinicId, conversationId, msgs => {
          setMessages(msgs)
          setActiveConversation({ ...conversation, messages: msgs })
        })
        messagesUnsubscribeRef.current = unsubscribe

        if (conversation.unreadCountPatient > 0) {
          await messageService.markAsRead(clinicId, conversationId, 'patient')
        }
      } catch (err) {
        const e = handleError(err, 'Failed to load conversation')
        setError(e)
        throw e
      }
    },
    [clinicId, conversations]
  )

  const sendMessage = useCallback(
    async (content: string, attachment?: File): Promise<void> => {
      if (!clinicId || !patientId || !activeConversation) {
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
        const e = handleError(err, 'Failed to send message')
        setError(e)
        throw e
      }
    },
    [clinicId, patientId, patientName, activeConversation]
  )

  const startConversation = useCallback(
    async (
      providerId: string,
      providerName: string,
      providerSpecialty: string,
      message: string
    ): Promise<string> => {
      if (!clinicId || !patientId) throw new Error('No patient context')

      try {
        return await messageService.createConversation(clinicId, {
          patientId,
          patientName,
          providerId,
          providerName,
          providerSpecialty,
          initialMessage: message,
        })
      } catch (err) {
        const e = handleError(err, 'Failed to start conversation')
        setError(e)
        throw e
      }
    },
    [clinicId, patientId, patientName]
  )

  const markAsRead = useCallback(
    async (conversationId: string): Promise<void> => {
      if (!clinicId) throw new Error('No clinic selected')

      try {
        await messageService.markAsRead(clinicId, conversationId, 'patient')
      } catch (err) {
        const e = handleError(err, 'Failed to mark as read')
        setError(e)
        throw e
      }
    },
    [clinicId]
  )

  const archiveConversation = useCallback(
    async (conversationId: string): Promise<void> => {
      if (!clinicId) throw new Error('No clinic selected')

      try {
        await messageService.archiveConversation(clinicId, conversationId)

        if (activeConversation?.id === conversationId) {
          setActiveConversation(null)
          messagesUnsubscribeRef.current?.()
          messagesUnsubscribeRef.current = null
        }
      } catch (err) {
        const e = handleError(err, 'Failed to archive conversation')
        setError(e)
        throw e
      }
    },
    [clinicId, activeConversation]
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
