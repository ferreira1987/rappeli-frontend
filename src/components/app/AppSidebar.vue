<script setup lang="ts">
import {
  BarChart3,
  Bot,
  CalendarClock,
  CircleHelp,
  GitBranch,
  Kanban,
  LayoutGrid,
  LogOut,
  MessageCircle,
  MessageSquareReply,
  Settings,
  UserCog,
  Users,
  X,
  type LucideIcon,
} from '@lucide/vue'
import { computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import RappeliLogo from '@/components/brand/RappeliLogo.vue'
import { useAppSidebar } from '@/composables/useAppSidebar'
import { useInitials } from '@/composables/useInitials'
import { useMediaQuery } from '@/composables/useMediaQuery'
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

type NavItem = {
  name: string
  label: string
  to: string
  icon: LucideIcon
  soon?: boolean
  badge?: number | (() => number)
}

const navItems: NavItem[] = [
  { name: 'painel', label: 'Painel', to: '/painel', icon: LayoutGrid },
  {
    name: 'conversas',
    label: 'Conversas',
    to: '/conversas',
    icon: MessageCircle,
    badge: () => inboxNav.unreadCount,
  },
  { name: 'funil-atendimento', label: 'Funil de atendimento', to: '/funil-atendimento', icon: Kanban },
  {
    name: 'mensagens-agendadas',
    label: 'Mensagens agendadas',
    to: '/mensagens-agendadas',
    icon: CalendarClock,
  },
  { name: 'automacoes', label: 'Automações', to: '/automacoes', icon: Bot },
  {
    name: 'respostas-automaticas',
    label: 'Respostas automáticas',
    to: '/respostas-automaticas',
    icon: MessageSquareReply,
  },
  { name: 'campanhas', label: 'Campanhas', to: '/campanhas', icon: GitBranch },
  { name: 'contatos', label: 'Contatos', to: '/contatos', icon: Users },
  { name: 'relatorios', label: 'Relatórios', to: '/relatorios', icon: BarChart3 },
  { name: 'equipe', label: 'Equipe', to: '/equipe', icon: UserCog },
  { name: 'configuracoes', label: 'Configurações', to: '/configuracoes', icon: Settings },
]

function navBadge(item: NavItem): number {
  if (item.badge == null) {
    return 0
  }
  return typeof item.badge === 'function' ? item.badge() : item.badge
}

function isNavActive(item: NavItem): boolean {
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
    class="fixed inset-y-0 left-0 z-50 flex h-screen w-[min(280px,88vw)] shrink-0 flex-col border-r border-slate-200/80 bg-white px-4 py-5 text-brand-ink shadow-xl transition-transform duration-200 ease-out lg:static lg:z-auto lg:w-[260px] lg:translate-x-0 lg:shadow-none"
    :class="isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
    :aria-hidden="isDrawerHidden ? true : undefined"
    :inert="isDrawerHidden ? true : undefined"
  >
    <div class="flex items-start justify-between gap-2 px-1 lg:block">
      <div>
        <RappeliLogo variant="dark" />
        <p class="mt-2 text-xs font-medium text-brand-gray">Mensagens &amp; automações</p>
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

    <p class="mt-6 px-2 text-[10px] font-semibold uppercase tracking-wider text-brand-gray">
      Menu principal
    </p>

    <nav class="mt-2 flex flex-1 flex-col gap-0.5 overflow-y-auto" aria-label="Principal">
      <RouterLink
        v-for="item in navItems"
        :key="item.name"
        :to="item.to"
        class="relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors"
        :class="
          isNavActive(item)
            ? 'bg-brand-mist text-brand-indigo'
            : 'text-brand-gray hover:bg-slate-50 hover:text-brand-ink'
        "
        @click="onNavigate"
      >
        <span
          v-if="isNavActive(item)"
          class="absolute -left-4 top-2 bottom-2 w-1 rounded-full bg-brand-indigo"
          aria-hidden="true"
        />
        <component :is="item.icon" class="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
        <span class="min-w-0 truncate">{{ item.label }}</span>
        <span
          v-if="navBadge(item) > 0"
          class="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white"
        >
          {{ navBadge(item) }}
        </span>
        <span
          v-else-if="item.soon"
          class="ml-auto shrink-0 rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-brand-gray"
        >
          Em breve
        </span>
      </RouterLink>
    </nav>

    <div class="mt-auto space-y-2 border-t border-slate-100 pt-4">
      <RouterLink
        :to="{ name: 'configuracoes-whatsapp' }"
        class="flex items-center justify-between rounded-full border px-3 py-1.5 text-xs font-medium transition hover:border-slate-300"
        :class="
          whatsappStore.connected
            ? 'border-emerald-200 bg-emerald-50/80 text-emerald-900'
            : 'border-slate-200 bg-slate-50 text-brand-ink'
        "
      >
        <span class="flex items-center gap-2">
          <span class="relative flex h-2 w-2">
            <span
              v-if="whatsappStore.connected"
              class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"
            />
            <span
              class="relative inline-flex h-2 w-2 rounded-full"
              :class="whatsappStore.connected ? 'bg-emerald-500' : 'bg-slate-400'"
            />
          </span>
          WhatsApp: {{ whatsappStore.connected ? 'Conectado' : 'Não conectado' }}
        </span>
      </RouterLink>
      <a
        href="mailto:contato@rappeli.com.br"
        class="flex items-center gap-2 px-2 py-1.5 text-sm text-brand-gray transition hover:text-brand-ink"
      >
        <CircleHelp class="h-4 w-4" aria-hidden="true" />
        Ajuda e suporte
      </a>

      <div class="flex items-center gap-3 rounded-xl bg-brand-mist/60 px-2 py-2">
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-brand-indigo shadow-sm"
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
