const BRAZIL_TIMEZONE_LABELS: Record<string, string> = {
  'America/Sao_Paulo': 'Brasília (UTC−3)',
  'America/Manaus': 'Manaus (UTC−4)',
  'America/Fortaleza': 'Fortaleza (UTC−3)',
  'America/Recife': 'Recife (UTC−3)',
  'America/Cuiaba': 'Cuiabá (UTC−4)',
  'America/Belem': 'Belém (UTC−3)',
  'America/Rio_Branco': 'Rio Branco (UTC−5)',
  'America/Noronha': 'Fernando de Noronha (UTC−2)',
}

export function formatTimezoneLabel(timezoneId: string): string {
  return BRAZIL_TIMEZONE_LABELS[timezoneId] ?? timezoneId.replace(/_/g, ' ')
}

export const BRAZIL_TIMEZONE_IDS = Object.keys(BRAZIL_TIMEZONE_LABELS)
