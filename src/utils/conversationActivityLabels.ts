const FALLBACK_LABELS: Record<string, string> = {
  transfer: 'Transferida',
  transferred: 'Transferida',
  resolve: 'Resolvida',
  resolved: 'Resolvida',
  assign: 'Atribuída',
  assigned: 'Atribuída',
  reopen: 'Reaberta',
  reopened: 'Reaberta',
  message: 'Mensagem',
  note: 'Anotação',
}

/** Rótulo em PT-BR: usa o valor da API se já estiver legível; senão mapa local. */
export function formatConversationActivityLabel(type: string | null | undefined): string {
  if (!type?.trim()) {
    return 'Atividade'
  }
  const trimmed = type.trim()
  const mapped = FALLBACK_LABELS[trimmed.toLowerCase()]
  if (mapped) {
    return mapped
  }
  if (/^[a-z_]+$/.test(trimmed)) {
    return trimmed
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ')
  }
  return trimmed
}
