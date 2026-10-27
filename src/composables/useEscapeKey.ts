import { onUnmounted, watch, type WatchSource } from 'vue'

export function useEscapeKey(
  active: WatchSource<boolean>,
  onEscape: () => void,
): void {
  function onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      onEscape()
    }
  }

  watch(
    active,
    (isActive) => {
      if (isActive) {
        window.addEventListener('keydown', onKeydown)
      } else {
        window.removeEventListener('keydown', onKeydown)
      }
    },
    { immediate: true },
  )

  onUnmounted(() => {
    window.removeEventListener('keydown', onKeydown)
  })
}
