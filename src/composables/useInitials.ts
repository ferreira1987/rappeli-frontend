import { computed, type Ref } from 'vue'

export function initialsFromName(name: string | undefined | null): string {
  const trimmed = name?.trim()
  if (!trimmed) {
    return '—'
  }
  const parts = trimmed.split(/\s+/).filter(Boolean)
  if (parts.length === 1) {
    return (parts[0] ?? '').slice(0, 2).toUpperCase()
  }
  const first = parts[0] ?? ''
  const last = parts[parts.length - 1] ?? ''
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase()
}

export function useInitials(nameSource: Ref<string | undefined | null>) {
  return computed(() => initialsFromName(nameSource.value))
}
