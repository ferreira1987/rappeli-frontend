import { inject, onMounted, onUnmounted, provide, ref, watch, type InjectionKey, type Ref } from 'vue'

const SIDEBAR_COLLAPSED_STORAGE_KEY = 'rappeli-app-sidebar-collapsed'

function readSidebarCollapsedFromStorage(): boolean {
  try {
    return window.localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

function writeSidebarCollapsedToStorage(collapsed: boolean): void {
  try {
    window.localStorage.setItem(SIDEBAR_COLLAPSED_STORAGE_KEY, collapsed ? '1' : '0')
  } catch {
    // ignore quota / private mode
  }
}

export type AppSidebarContext = {
  isOpen: Ref<boolean>
  isCollapsed: Ref<boolean>
  open: () => void
  close: () => void
  toggle: () => void
  toggleCollapsed: () => void
  menuButtonId: string
}

const appSidebarKey: InjectionKey<AppSidebarContext> = Symbol('appSidebar')

export function provideAppSidebar(): AppSidebarContext {
  const isOpen = ref(false)
  const isCollapsed = ref(false)
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

  function toggleCollapsed(): void {
    isCollapsed.value = !isCollapsed.value
  }

  function onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && isOpen.value) {
      event.preventDefault()
      close()
      document.getElementById(menuButtonId)?.focus()
    }
  }

  onMounted(() => {
    isCollapsed.value = readSidebarCollapsedFromStorage()
    window.addEventListener('keydown', onKeydown)
  })

  watch(isCollapsed, (collapsed) => {
    writeSidebarCollapsedToStorage(collapsed)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', onKeydown)
  })

  const ctx: AppSidebarContext = {
    isOpen,
    isCollapsed,
    open,
    close,
    toggle,
    toggleCollapsed,
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
