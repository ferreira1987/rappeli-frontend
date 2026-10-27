import { ref } from 'vue'

export function useExampleToast() {
  const message = ref<string | null>(null)
  let timer: ReturnType<typeof setTimeout> | null = null

  function show(text: string, durationMs = 4000): void {
    message.value = text
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      message.value = null
      timer = null
    }, durationMs)
  }

  return { message, show }
}
