/** Formata telefones brasileiros para exibição (E.164 sem espaços na entrada). */
export function formatBrazilPhone(raw: string | null | undefined): string {
  const digits = (raw ?? '').replace(/\D/g, '')
  if (!digits) {
    return ''
  }

  let country = ''
  let national = digits

  if (digits.startsWith('55') && digits.length >= 12) {
    country = '+55'
    national = digits.slice(2)
  }

  if (national.length < 10) {
    return country ? `${country} ${national}` : national
  }

  const ddd = national.slice(0, 2)
  const subscriber = national.slice(2)

  if (subscriber.length === 9) {
    const formatted = `${subscriber.slice(0, 5)}-${subscriber.slice(5)}`
    return country ? `${country} ${ddd} ${formatted}` : `(${ddd}) ${formatted}`
  }

  if (subscriber.length === 8) {
    const formatted = `${subscriber.slice(0, 4)}-${subscriber.slice(4)}`
    return country ? `${country} ${ddd} ${formatted}` : `(${ddd}) ${formatted}`
  }

  const fallback = national
  return country ? `${country} ${fallback}` : fallback
}
