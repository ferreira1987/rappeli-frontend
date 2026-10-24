import type { AutomatedReplyKind, ConversationMessage } from '@/types/conversations'

export function automatedReplyKindLabel(kind: AutomatedReplyKind | null | undefined): string {
  switch (kind) {
    case 'welcome':
      return 'Boas-vindas'
    case 'out_of_hours':
      return 'Fora do horário'
    case 'keyword':
      return 'Palavra-chave'
    default:
      return 'Automática'
  }
}

export function automatedMessageLabel(message: ConversationMessage): string | null {
  if (!message.is_automated) {
    return null
  }
  return `Automação: ${automatedReplyKindLabel(message.automated_reply_kind)}`
}
