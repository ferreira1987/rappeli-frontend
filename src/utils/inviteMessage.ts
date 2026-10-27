const GENERIC_INVITE_MESSAGE_PATTERNS = [
  /^server error$/i,
  /^internal server error$/i,
  /^error$/i,
  /^http error$/i,
  /something went wrong/i,
]

export function inviteInvalidDisplayMessage(
  message: string | null | undefined,
  fallback = 'Convite inválido ou expirado',
): string {
  const trimmed = message?.trim()
  if (!trimmed) {
    return fallback
  }
  if (GENERIC_INVITE_MESSAGE_PATTERNS.some((pattern) => pattern.test(trimmed))) {
    return fallback
  }
  return trimmed
}
