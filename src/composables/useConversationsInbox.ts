import { computed, onUnmounted, ref, watch } from 'vue'

import {
  fetchInboxConversations,
  fetchInboxMessages,
  markInboxConversationRead,
  sendInboxMessage,
} from '@/api/inbox'
import { subscribeCompanyInbox } from '@/realtime/companyChannel'
import { isRealtimeConfigured } from '@/realtime/config'
import type { Conversation, ConversationMessage } from '@/types/conversations'
import { getErrorMessage } from '@/utils/errors'
import { inboxContactDisplayName, isMessagingWindowOpen } from '@/utils/inbox'
import { isMessagingWindowClosedError, MESSAGING_WINDOW_CLOSED_MESSAGE } from '@/utils/messaging'

function mergeConversation(list: Conversation[], updated: Conversation): Conversation[] {
  const index = list.findIndex((c) => c.id === updated.id)
  if (index === -1) {
    return [updated, ...list]
  }
  const next = [...list]
  next[index] = { ...next[index], ...updated }
  next.sort((a, b) => {
    const aTime = a.last_message_at ? Date.parse(a.last_message_at) : 0
    const bTime = b.last_message_at ? Date.parse(b.last_message_at) : 0
    return bTime - aTime
  })
  return next
}

function conversationFromMessage(
  existing: Conversation | undefined,
  message: ConversationMessage,
  unreadCount: number,
): Conversation {
  return {
    id: message.conversation_id,
    unread_count: unreadCount,
    whatsapp_phone_number_id: existing?.whatsapp_phone_number_id ?? '',
    last_message_at: message.created_at ?? existing?.last_message_at ?? null,
    last_customer_message_at:
      message.direction === 'inbound'
        ? message.created_at ?? existing?.last_customer_message_at ?? null
        : existing?.last_customer_message_at ?? null,
    contact: existing?.contact ?? {
      id: 0,
      phone: '',
      display_name: null,
    },
    last_message: message,
  }
}

export function useConversationsInbox(companyId: () => number | null | undefined) {
  const conversations = ref<Conversation[]>([])
  const messages = ref<ConversationMessage[]>([])
  const selectedId = ref<number | null>(null)
  const searchQuery = ref('')
  const listLoading = ref(false)
  const messagesLoading = ref(false)
  const sending = ref(false)
  const listError = ref<string | null>(null)
  const threadError = ref<string | null>(null)
  const composerError = ref<string | null>(null)
  const windowClosed = ref(false)

  const totalUnread = computed(() =>
    conversations.value.reduce((sum, item) => sum + (item.unread_count ?? 0), 0),
  )

  const selectedConversation = computed(() =>
    conversations.value.find((c) => c.id === selectedId.value) ?? null,
  )

  const canSendMessage = computed(() => {
    if (!selectedConversation.value) {
      return false
    }
    if (windowClosed.value) {
      return false
    }
    return isMessagingWindowOpen(selectedConversation.value)
  })

  async function loadConversations(): Promise<void> {
    listLoading.value = true
    listError.value = null
    try {
      const search = searchQuery.value.trim()
      conversations.value = await fetchInboxConversations({
        search: search || undefined,
      })
    } catch (error) {
      listError.value = getErrorMessage(error)
      conversations.value = []
    } finally {
      listLoading.value = false
    }
  }

  async function loadMessages(conversationId: number): Promise<void> {
    messagesLoading.value = true
    threadError.value = null
    composerError.value = null
    windowClosed.value = false
    try {
      messages.value = await fetchInboxMessages(conversationId)
      const updated = await markInboxConversationRead(conversationId)
      conversations.value = mergeConversation(conversations.value, updated)
    } catch (error) {
      threadError.value = getErrorMessage(error)
      messages.value = []
    } finally {
      messagesLoading.value = false
    }
  }

  function selectConversation(id: number | null): void {
    selectedId.value = id
    if (id == null) {
      messages.value = []
      threadError.value = null
      composerError.value = null
      windowClosed.value = false
      return
    }
    void loadMessages(id)
  }

  async function sendMessage(body: string): Promise<boolean> {
    const conversationId = selectedId.value
    if (!conversationId || !body.trim()) {
      return false
    }

    sending.value = true
    composerError.value = null
    windowClosed.value = false

    try {
      const message = await sendInboxMessage(conversationId, body.trim())
      messages.value = [...messages.value, message]
      const existing = selectedConversation.value
      if (existing) {
        conversations.value = mergeConversation(
          conversations.value,
          conversationFromMessage(existing, message, 0),
        )
      }
      return true
    } catch (error) {
      if (isMessagingWindowClosedError(error)) {
        windowClosed.value = true
        composerError.value = MESSAGING_WINDOW_CLOSED_MESSAGE
      } else {
        composerError.value = getErrorMessage(error)
      }
      return false
    } finally {
      sending.value = false
    }
  }

  function applyRealtimeMessage(message: ConversationMessage): void {
    const conversationId = message.conversation_id
    const existing = conversations.value.find((c) => c.id === conversationId)

    if (!existing) {
      void loadConversations()
      return
    }

    if (selectedId.value === conversationId) {
      const exists = messages.value.some((m) => m.id === message.id)
      if (!exists) {
        messages.value = [...messages.value, message]
      }
      if (message.direction === 'inbound') {
        void markInboxConversationRead(conversationId)
          .then((updated) => {
            conversations.value = mergeConversation(conversations.value, updated)
          })
          .catch(() => undefined)
      }
    }

    const unreadBump =
      message.direction === 'inbound' && selectedId.value !== conversationId
        ? (existing?.unread_count ?? 0) + 1
        : selectedId.value === conversationId
          ? 0
          : existing?.unread_count ?? 0

    conversations.value = mergeConversation(
      conversations.value,
      conversationFromMessage(existing, message, unreadBump),
    )
  }

  function applyRealtimeStatus(
    conversationId: number,
    messageId: number,
    status: ConversationMessage['status'],
  ): void {
    if (selectedId.value === conversationId) {
      messages.value = messages.value.map((m) =>
        m.id === messageId ? { ...m, status } : m,
      )
    }
  }

  let searchDebounce: ReturnType<typeof setTimeout> | null = null
  watch(searchQuery, () => {
    if (searchDebounce) {
      clearTimeout(searchDebounce)
    }
    searchDebounce = setTimeout(() => {
      void loadConversations()
    }, 300)
  })

  let unsubscribeRealtime: (() => void) | null = null

  watch(
    companyId,
    (id) => {
      unsubscribeRealtime?.()
      unsubscribeRealtime = null
      if (id != null && isRealtimeConfigured()) {
        unsubscribeRealtime = subscribeCompanyInbox(id, {
          onMessageCreated: applyRealtimeMessage,
          onMessageStatusUpdated: ({ conversation_id, message_id, status }) =>
            applyRealtimeStatus(conversation_id, message_id, status),
        })
      }
    },
    { immediate: true },
  )

  onUnmounted(() => {
    unsubscribeRealtime?.()
    if (searchDebounce) {
      clearTimeout(searchDebounce)
    }
  })

  void loadConversations()

  return {
    conversations,
    selectedId,
    selectedConversation,
    searchQuery,
    listLoading,
    messagesLoading,
    sending,
    listError,
    threadError,
    composerError,
    windowClosed,
    totalUnread,
    canSendMessage,
    displayName: inboxContactDisplayName,
    loadConversations,
    selectConversation,
    sendMessage,
    messages,
  }
}
