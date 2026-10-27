export function downloadCsv(filename: string, headers: string[], rows: string[][]): void {
  const escape = (value: string) => {
    const needsQuotes = /[",\n\r]/.test(value)
    const normalized = value.replace(/"/g, '""')
    return needsQuotes ? `"${normalized}"` : normalized
  }

  const lines = [headers.map(escape).join(','), ...rows.map((row) => row.map(escape).join(','))]
  const blob = new Blob([`\uFEFF${lines.join('\n')}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
