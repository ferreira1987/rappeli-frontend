import { inject, onMounted, onUnmounted, provide, ref, type InjectionKey, type Ref } from 'vue'

export type AppSidebarContext = {
  isOpen: Ref<boolean>
  open: () => void
  close: () => void
  toggle: () => void
  menuButtonId: string
}

const appSidebarKey: InjectionKey<AppSidebarContext> = Symbol('appSidebar')

export function provideAppSidebar(): AppSidebarContext {
  const isOpen = ref(false)
  const menuButtonId = 'app-mobile-menu-button'

  function open(): void {
    isOpen.value = true
  }

  function close(): void {
    isOpen.value = false
  }

  function toggle(): void {
    isOpen.value = !isOpen.value
  }

  function onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && isOpen.value) {
      event.preventDefault()
      close()
      document.getElementById(menuButtonId)?.focus()
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', onKeydown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', onKeydown)
  })

  const ctx: AppSidebarContext = {
    isOpen,
    open,
    close,
    toggle,
    menuButtonId,
  }

  provide(appSidebarKey, ctx)

  return ctx
}

export function useAppSidebar(): AppSidebarContext {
  const ctx = inject(appSidebarKey)
  if (!ctx) {
    throw new Error('useAppSidebar must be used within AppLayout')
  }
  return ctx
}

export function useAppSidebarOptional(): AppSidebarContext | null {
  return inject(appSidebarKey, null)
}
