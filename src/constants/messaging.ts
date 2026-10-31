/** Limite de caracteres para mensagens de resposta automática (API / WhatsApp). */
export const AUTO_REPLY_MESSAGE_MAX_LENGTH = 4096

/** Tags inseríveis nas mensagens de boas-vindas e fora do horário (substituídas no envio). */
export const AUTO_REPLY_MESSAGE_TEMPLATE_TAGS = [
  '{primeiro_nome}',
  '{nome_completo}',
  '{empresa}',
] as const
