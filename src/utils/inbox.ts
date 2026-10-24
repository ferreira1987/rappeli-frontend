import type { Conversation, InboxContact } from '@/types/conversations'
import { formatBrazilPhone } from '@/utils/phone'

const MESSAGING_WINDOW_MS = 24 * 60 * 60 * 1000

export function contactHasDisplayName(contact: InboxContact): boolean {
  return Boolean(contact.display_name?.trim())
}

export function inboxContactPrimaryLabel(contact: InboxContact): string {
  if (contact.display_name?.trim()) {
    return contact.display_name.trim()
  }
  const formatted = formatBrazilPhone(contact.phone)
  return formatted || 'Contato'
}

export function inboxContactSecondaryPhone(contact: InboxContact): string | null {
  if (!contactHasDisplayName(contact)) {
    return null
  }
  const formatted = formatBrazilPhone(contact.phone)
  return formatted || null
}

/** @deprecated Prefer inboxContactPrimaryLabel */
export function inboxContactDisplayName(contact: InboxContact): string {
  return inboxContactPrimaryLabel(contact)
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
