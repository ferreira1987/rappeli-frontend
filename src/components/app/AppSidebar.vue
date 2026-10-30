<script setup lang="ts">
import { CircleHelp, LogOut, X } from '@lucide/vue'
import { computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import RappeliLogo from '@/components/brand/RappeliLogo.vue'
import { useAppSidebar } from '@/composables/useAppSidebar'
import { useInitials } from '@/composables/useInitials'
import { useMediaQuery } from '@/composables/useMediaQuery'
import { appNavGroups, type AppNavItem } from '@/constants/appNavGroups'
import { useAuthStore } from '@/stores/auth'
import { useInboxNavStore } from '@/stores/inboxNav'
import { useWhatsAppStore } from '@/stores/whatsapp'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const whatsappStore = useWhatsAppStore()
const inboxNav = useInboxNavStore()
const { isOpen, close, menuButtonId } = useAppSidebar()
const isLgViewport = useMediaQuery('(min-width: 1024px)')
const initials = useInitials(computed(() => auth.user?.name))

const isDrawerHidden = computed(() => !isLgViewport.value && !isOpen.value)

function navBadge(item: AppNavItem): number {
  if (item.name === 'conversas') {
    return inboxNav.unreadCount
  }
  if (item.badge == null) {
    return 0
  }
  return typeof item.badge === 'function' ? item.badge() : item.badge
}

function showNavBadge(item: AppNavItem): boolean {
  const count = navBadge(item)
  if (count > 0) {
    return true
  }
  return item.showBadgeWhenZero === true && item.name === 'conversas'
}

function isNavActive(item: AppNavItem): boolean {
  const activeNav = route.meta.activeNav
  if (typeof activeNav === 'string') {
    return activeNav === item.name
  }
  return route.name === item.name
}

async function onLogout(): Promise<void> {
  await auth.logout()
  await router.push({ name: 'login' })
}

function onNavigate(): void {
  close()
}

function closeAndFocusMenu(): void {
  close()
  document.getElementById(menuButtonId)?.focus()
}
</script>

<template>
  <aside
    id="app-sidebar"
    class="fixed inset-y-0 left-0 z-50 flex h-screen w-[min(280px,88vw)] shrink-0 flex-col border-r border-slate-200 bg-white px-3 py-4 text-brand-ink transition-transform duration-200 ease-out lg:static lg:z-auto lg:w-[260px] lg:translate-x-0"
    :class="isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
    :aria-hidden="isDrawerHidden ? true : undefined"
    :inert="isDrawerHidden ? true : undefined"
  >
    <div class="flex items-start justify-between gap-2 px-2 lg:block">
      <div>
        <RappeliLogo variant="dark" />
        <p class="mt-1.5 text-xs font-medium text-brand-gray">Mensagens &amp; automações</p>
      </div>
      <button
        type="button"
        class="inline-flex h-9 w-9 items-center justify-center rounded-lg text-brand-gray hover:bg-slate-100 lg:hidden"
        aria-label="Fechar menu"
        @click="closeAndFocusMenu"
      >
        <X class="h-5 w-5" aria-hidden="true" />
      </button>
    </div>

    <div class="mt-5 flex flex-1 flex-col gap-5 overflow-y-auto px-1 pb-2">
      <section v-for="group in appNavGroups" :key="group.id">
        <p class="px-2 text-[10px] font-semibold uppercase tracking-wider text-brand-gray">
          {{ group.label }}
        </p>
        <nav class="mt-1.5 flex flex-col gap-0.5" :aria-label="group.label">
          <RouterLink
            v-for="item in group.items"
            :key="item.name"
            :to="item.to"
            class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
            :class="
              isNavActive(item)
                ? 'bg-brand-mist text-brand-indigo'
                : 'text-brand-gray hover:bg-slate-50 hover:text-brand-ink'
            "
            @click="onNavigate"
          >
            <component :is="item.icon" class="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
            <span class="min-w-0 truncate">{{ item.label }}</span>
            <span
              v-if="showNavBadge(item)"
              class="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold"
              :class="
                navBadge(item) > 0
                  ? 'bg-brand-indigo text-white'
                  : 'bg-brand-mist text-brand-indigo ring-1 ring-brand-indigo/20'
              "
            >
              {{ navBadge(item) }}
            </span>
            <span
              v-else-if="item.soon"
              class="ml-auto shrink-0 rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-brand-gray"
            >
              Em breve
            </span>
          </RouterLink>
        </nav>
      </section>
    </div>

    <div class="mt-auto space-y-2 border-t border-slate-100 px-1 pt-3">
      <div
        class="rounded-lg border px-3 py-2 text-xs"
        :class="
          whatsappStore.connected
            ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
            : 'border-red-200 bg-red-50 text-red-900'
        "
      >
        <div class="flex items-center gap-2 font-medium">
          <span
            class="h-2 w-2 shrink-0 rounded-full"
            :class="whatsappStore.connected ? 'bg-emerald-500' : 'bg-red-500'"
          />
          WhatsApp: {{ whatsappStore.connected ? 'Conectado' : 'Não conectado' }}
        </div>
        <RouterLink
          v-if="!whatsappStore.connected"
          :to="{ name: 'configuracoes-whatsapp' }"
          class="mt-1 inline-block text-xs font-semibold text-brand-indigo hover:underline"
          @click="onNavigate"
        >
          Conectar
        </RouterLink>
      </div>

      <a
        href="mailto:contato@rappeli.com.br"
        class="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-brand-gray transition hover:bg-slate-50 hover:text-brand-ink"
      >
        <CircleHelp class="h-4 w-4" aria-hidden="true" />
        Ajuda e suporte
      </a>

      <div class="flex items-center gap-3 rounded-lg border border-slate-100 bg-brand-surface px-2 py-2">
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-brand-indigo ring-1 ring-slate-200"
        >
          {{ initials }}
        </div>
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-medium text-brand-ink">
            {{ auth.user?.name ?? 'Sua conta' }}
          </p>
          <p class="truncate text-xs text-brand-gray">
            {{ auth.user?.email ?? '—' }}
          </p>
        </div>
        <button
          type="button"
          class="rounded-lg p-1.5 text-brand-gray transition hover:bg-white hover:text-brand-ink"
          aria-label="Sair"
          @click="onLogout"
        >
          <LogOut class="h-4 w-4" />
        </button>
      </div>
    </div>
  </aside>
</template>
