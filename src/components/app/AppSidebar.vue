<script setup lang="ts">
import {
  Bot,
  CircleHelp,
  LayoutGrid,
  LogOut,
  MessageCircle,
  Plus,
  Settings,
  Users,
} from '@lucide/vue'
import { computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import RappeliLogo from '@/components/brand/RappeliLogo.vue'
import { useInitials } from '@/composables/useInitials'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const initials = useInitials(computed(() => auth.user?.name))

const navItems = [
  { name: 'painel', label: 'Painel', to: '/painel', icon: LayoutGrid },
  { name: 'conversas', label: 'Conversas', to: '/conversas', icon: MessageCircle },
  { name: 'automacoes', label: 'Automações', to: '/automacoes', icon: Bot },
  { name: 'contatos', label: 'Contatos', to: '/contatos', icon: Users },
  { name: 'configuracoes', label: 'Configurações', to: '/configuracoes', icon: Settings },
] as const

async function onLogout(): Promise<void> {
  await auth.logout()
  await router.push({ name: 'login' })
}
</script>

<template>
  <aside
    class="flex h-screen w-[260px] shrink-0 flex-col border-r border-slate-200/80 bg-white px-4 py-5 text-brand-ink"
  >
    <div class="px-1">
      <RappeliLogo variant="dark" />
      <p class="mt-2 text-xs font-medium text-brand-gray">Mensagens &amp; automações</p>
    </div>

    <RouterLink
      :to="{ name: 'automacoes' }"
      class="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-indigo px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-indigo-hover"
    >
      <Plus class="h-4 w-4" aria-hidden="true" />
      Nova automação
    </RouterLink>

    <p class="mt-6 px-2 text-[10px] font-semibold uppercase tracking-wider text-brand-gray">
      Menu principal
    </p>

    <nav class="mt-2 flex flex-1 flex-col gap-0.5" aria-label="Principal">
      <RouterLink
        v-for="item in navItems"
        :key="item.name"
        :to="item.to"
        class="relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors"
        :class="
          route.name === item.name
            ? 'bg-brand-mist text-brand-indigo'
            : 'text-brand-gray hover:bg-slate-50 hover:text-brand-ink'
        "
      >
        <span
          v-if="route.name === item.name"
          class="absolute -left-4 top-2 bottom-2 w-1 rounded-full bg-brand-indigo"
          aria-hidden="true"
        />
        <component :is="item.icon" class="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
        {{ item.label }}
      </RouterLink>
    </nav>

    <div class="mt-auto space-y-2 border-t border-slate-100 pt-4">
      <a
        href="#"
        class="flex items-center gap-2 px-2 py-1.5 text-sm text-brand-gray transition hover:text-brand-ink"
        @click.prevent
      >
        <CircleHelp class="h-4 w-4" aria-hidden="true" />
        Ajuda e suporte
      </a>

      <div class="flex items-center gap-3 rounded-xl bg-brand-mist/60 px-2 py-2">
        <div
          class="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-semibold text-brand-indigo shadow-sm"
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
