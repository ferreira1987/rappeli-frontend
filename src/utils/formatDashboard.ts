export function formatDashboardCount(value: number | null | undefined): string {
  if (value == null) {
    return '—'
  }
  return value.toLocaleString('pt-BR')
}

export function formatAverageResponseTime(seconds: number | null | undefined): string {
  if (seconds == null) {
    return '—'
  }
  if (seconds < 60) {
    return `${seconds}s`
  }
  const minutes = Math.floor(seconds / 60)
  const remainder = seconds % 60
  if (remainder === 0) {
    return `${minutes} min`
  }
  return `${minutes}m ${remainder}s`
}
