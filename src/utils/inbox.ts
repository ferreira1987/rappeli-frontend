import type { Conversation } from '@/types/conversations'

const MESSAGING_WINDOW_MS = 24 * 60 * 60 * 1000

export function inboxContactDisplayName(contact: Conversation['contact']): string {
  if (contact.display_name?.trim()) {
    return contact.display_name.trim()
  }
  if (contact.phone?.trim()) {
    return contact.phone.trim()
  }
  return 'Contato'
}

export function isMessagingWindowOpen(conversation: Conversation): boolean {
  const at = conversation.last_customer_message_at
  if (!at) {
    return false
  }
  const lastCustomer = Date.parse(at)
  if (Number.isNaN(lastCustomer)) {
    return false
  }
  return Date.now() - lastCustomer < MESSAGING_WINDOW_MS
}
