import type { ConversationMessage, InboxMessageStatusEvent } from '@/types/conversations'

import { realtimeConfig } from './config'
import { disconnectEcho, getEcho } from './echo'

export type InboxRealtimeHandlers = {
  onMessageCreated?: (message: ConversationMessage) => void
  onMessageStatusUpdated?: (payload: InboxMessageStatusEvent) => void
}

let activeCompanyId: number | null = null

export function subscribeCompanyInbox(
  companyId: number,
  handlers: InboxRealtimeHandlers,
): () => void {
  const echo = getEcho()
  if (!echo) {
    return () => undefined
  }

  if (activeCompanyId !== null && activeCompanyId !== companyId) {
    disconnectEcho()
  }
  activeCompanyId = companyId

  const channelName = realtimeConfig.companyInboxChannelName(companyId)
  const channel = echo.private(channelName)

  channel
    .listen(realtimeConfig.events.messageCreated, (payload: { message: ConversationMessage }) => {
      handlers.onMessageCreated?.(payload.message)
    })
    .listen(realtimeConfig.events.messageStatus, (payload: InboxMessageStatusEvent) => {
      handlers.onMessageStatusUpdated?.(payload)
    })

  return () => {
    channel.stopListening(realtimeConfig.events.messageCreated)
    channel.stopListening(realtimeConfig.events.messageStatus)
    echo.leave(channelName)
    if (activeCompanyId === companyId) {
      activeCompanyId = null
    }
  }
}
