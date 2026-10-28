import { computed, nextTick, onUnmounted, ref, watch } from 'vue'

import { useInboxNavStore } from '@/stores/inboxNav'

import {
  fetchInboxConversations,
  fetchInboxMessagesPage,
  markInboxConversationRead,
  sendInboxMessage,
} from '@/api/inbox'
import { subscribeCompanyInbox } from '@/realtime/companyChannel'
import { isRealtimeConfigured } from '@/realtime/config'
import type {
  Conversation,
  ConversationMessage,
  InboxConversationCounts,
  InboxMessageStatusEvent,
} from '@/types/conversations'
import {
  type ConversationFilterTab,
  inboxFilterFromTab,
} from '@/utils/conversationFilters'
import {
  mergeMessagePages,
  pageToChronological,
  upsertMessage,
} from '@/utils/conversationMessages'
import { mergeMessageStatusFromEvent } from '@/utils/messageDeliveryStatus'
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
  const inboxNav = useInboxNavStore()
  const listConversations = ref<Conversation[]>([])
  const messages = ref<ConversationMessage[]>([])
  const selectedId = ref<number | null>(null)
  const searchQuery = ref('')
  const listFilter = ref<ConversationFilterTab>('all')
  const listCounts = ref<InboxConversationCounts>({
    all: 0,
    unread: 0,
    automated: 0,
    human: 0,
  })
  const listLoading = ref(false)
  const messagesLoading = ref(false)
  const loadingOlderMessages = ref(false)
  const messagesCurrentPage = ref(1)
  const messagesLastPage = ref(1)
  const sending = ref(false)
  const listError = ref<string | null>(null)
  const threadError = ref<string | null>(null)
  const composerError = ref<string | null>(null)
  const windowClosed = ref(false)
  const scrollToBottomAfterLoad = ref(false)

  const hasOlderMessages = computed(() => messagesCurrentPage.value < messagesLastPage.value)

  const totalUnread = computed(() => listCounts.value.unread)

  const conversations = computed(() => {
    const q = searchQuery.value.trim().toLowerCase()
    if (!q) {
      return listConversations.value
    }
    return listConversations.value.filter((conversation) => {
      const name = inboxContactDisplayName(conversation.contact).toLowerCase()
      const phone = conversation.contact.phone ?? ''
      return name.includes(q) || phone.includes(q)
    })
  })

  const selectedConversation = computed(() =>
    listConversations.value.find((c) => c.id === selectedId.value) ?? null,
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

  async function loadConversations(options?: { silent?: boolean }): Promise<void> {
    if (!options?.silent) {
      listLoading.value = true
    }
    listError.value = null
    try {
      const page = await fetchInboxConversations({
        filter: inboxFilterFromTab(listFilter.value),
      })
      listConversations.value = page.conversations
      listCounts.value = page.counts
      void inboxNav.refresh()
    } catch (error) {
      listError.value = getErrorMessage(error)
      listConversations.value = []
      listCounts.value = { all: 0, unread: 0, automated: 0, human: 0 }
    } finally {
      if (!options?.silent) {
        listLoading.value = false
      }
    }
  }

  function setListFilter(tab: ConversationFilterTab): void {
    if (listFilter.value === tab) {
      return
    }
    listFilter.value = tab
    void loadConversations()
  }

  function resetMessagesState(): void {
    messages.value = []
    messagesCurrentPage.value = 1
    messagesLastPage.value = 1
    loadingOlderMessages.value = false
  }

  async function loadMessages(conversationId: number): Promise<void> {
    messagesLoading.value = true
    threadError.value = null
    composerError.value = null
    windowClosed.value = false
    resetMessagesState()
    try {
      const { messages: pageMessages, meta } = await fetchInboxMessagesPage(conversationId, {
        page: 1,
      })
      messages.value = pageToChronological(pageMessages)
      messagesCurrentPage.value = meta.current_page
      messagesLastPage.value = meta.last_page
      scrollToBottomAfterLoad.value = true

      const updated = await markInboxConversationRead(conversationId)
      listConversations.value = mergeConversation(listConversations.value, updated)
      void loadConversations({ silent: true })
    } catch (error) {
      threadError.value = getErrorMessage(error)
      resetMessagesState()
    } finally {
      messagesLoading.value = false
    }
  }

  async function loadOlderMessages(scrollEl: HTMLElement | null): Promise<void> {
    const conversationId = selectedId.value
    if (
      conversationId == null ||
      !hasOlderMessages.value ||
      loadingOlderMessages.value ||
      messagesLoading.value
    ) {
      return
    }

    const previousHeight = scrollEl?.scrollHeight ?? 0
    const previousTop = scrollEl?.scrollTop ?? 0

    loadingOlderMessages.value = true
    try {
      const nextPage = messagesCurrentPage.value + 1
      const { messages: olderPage, meta } = await fetchInboxMessagesPage(conversationId, {
        page: nextPage,
      })
      messages.value = mergeMessagePages(olderPage, messages.value)
      messagesCurrentPage.value = meta.current_page
      messagesLastPage.value = meta.last_page

      await nextTick()
      if (scrollEl) {
        scrollEl.scrollTop = scrollEl.scrollHeight - previousHeight + previousTop
      }
    } catch (error) {
      threadError.value = getErrorMessage(error)
    } finally {
      loadingOlderMessages.value = false
    }
  }

  function selectConversation(id: number | null): void {
    selectedId.value = id
    scrollToBottomAfterLoad.value = id != null
    if (id == null) {
      resetMessagesState()
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
      messages.value = upsertMessage(messages.value, message)
      scrollToBottomAfterLoad.value = true
      const existing = selectedConversation.value
      if (existing) {
        listConversations.value = mergeConversation(
          listConversations.value,
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
    const existing = listConversations.value.find((c) => c.id === conversationId)

    if (!existing) {
      void loadConversations()
      return
    }

    if (selectedId.value === conversationId) {
      const hadMessage = messages.value.some(
        (item) =>
          item.id === message.id ||
          (message.wa_message_id != null &&
            item.wa_message_id != null &&
            item.wa_message_id === message.wa_message_id),
      )
      messages.value = upsertMessage(messages.value, message)
      if (!hadMessage) {
        scrollToBottomAfterLoad.value = true
      }
      if (message.direction === 'inbound') {
        void markInboxConversationRead(conversationId)
          .then((updated) => {
            listConversations.value = mergeConversation(listConversations.value, updated)
          })
          .catch(() => undefined)
      }
    }

    const unreadBump =
      message.direction === 'inbound' && selectedId.value !== conversationId
        ? (existing.unread_count ?? 0) + 1
        : selectedId.value === conversationId
          ? 0
          : existing.unread_count ?? 0

    listConversations.value = mergeConversation(
      listConversations.value,
      conversationFromMessage(existing, message, unreadBump),
    )
  }

  function applyRealtimeStatus(event: InboxMessageStatusEvent): void {
    const { conversation_id: conversationId, message_id: messageId } = event

    if (selectedId.value === conversationId) {
      messages.value = messages.value.map((m) => mergeMessageStatusFromEvent(m, event))
    }

    listConversations.value = listConversations.value.map((conversation) => {
      if (conversation.id !== conversationId) {
        return conversation
      }
      const last = conversation.last_message
      if (!last || last.id !== messageId) {
        return conversation
      }
      return {
        ...conversation,
        last_message: mergeMessageStatusFromEvent(last, event),
      }
    })
  }

  function consumeScrollToBottomRequest(): boolean {
    if (!scrollToBottomAfterLoad.value) {
      return false
    }
    scrollToBottomAfterLoad.value = false
    return true
  }

  function requestScrollToBottom(): void {
    scrollToBottomAfterLoad.value = true
  }

  let unsubscribeRealtime: (() => void) | null = null

  watch(
    companyId,
    (id) => {
      unsubscribeRealtime?.()
      unsubscribeRealtime = null
      if (id != null && isRealtimeConfigured()) {
        unsubscribeRealtime = subscribeCompanyInbox(id, {
          onMessageCreated: applyRealtimeMessage,
          onMessageStatusUpdated: applyRealtimeStatus,
        })
      }
    },
    { immediate: true },
  )

  onUnmounted(() => {
    unsubscribeRealtime?.()
  })

  void loadConversations()

  return {
    conversations,
    selectedId,
    selectedConversation,
    searchQuery,
    listFilter,
    listCounts,
    setListFilter,
    listLoading,
    messagesLoading,
    loadingOlderMessages,
    hasOlderMessages,
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
    loadOlderMessages,
    messages,
    consumeScrollToBottomRequest,
    requestScrollToBottom,
  }
}
