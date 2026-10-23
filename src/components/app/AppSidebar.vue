<script setup lang="ts">
import {
  Bot,
  CircleHelp,
  LayoutGrid,
  MessageCircle,
  Plus,
  Settings,
  Users,
} from '@lucide/vue'
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import RappeliLogo from '@/components/brand/RappeliLogo.vue'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const auth = useAuthStore()

const navItems = [
  { name: 'painel', label: 'Painel', to: '/painel', icon: LayoutGrid },
  { name: 'conversas', label: 'Conversas', to: '/conversas', icon: MessageCircle },
  { name: 'automacoes', label: 'Automações', to: '/automacoes', icon: Bot },
  { name: 'contatos', label: 'Contatos', to: '/contatos', icon: Users },
  { name: 'configuracoes', label: 'Configurações', to: '/configuracoes', icon: Settings },
] as const

const initials = computed(() => {
  const name = auth.user?.name?.trim()
  if (!name) {
    return '—'
  }
  const parts = name.split(/\s+/).filter(Boolean)
  if (parts.length === 1) {
    return (parts[0] ?? '').slice(0, 2).toUpperCase()
  }
  const first = parts[0] ?? ''
  const last = parts[parts.length - 1] ?? ''
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase()
})
</script>

<template>
  <aside
    class="flex h-full w-64 shrink-0 flex-col border-r border-slate-200 bg-white px-4 py-5"
  >
    <div class="px-2">
      <RappeliLogo variant="dark" />
      <span
        class="mt-3 inline-flex rounded-full bg-sky-50 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-sky-700"
      >
        ECO PLATAFORMA
      </span>
    </div>

    <button
      type="button"
      disabled
      class="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-rappeli-primary px-4 py-2.5 text-sm font-semibold text-white opacity-60"
      title="Disponível em uma fase futura"
    >
      <Plus class="h-4 w-4" aria-hidden="true" />
      Nova Automação
    </button>

    <nav class="mt-6 flex flex-1 flex-col gap-1" aria-label="Principal">
      <RouterLink
        v-for="item in navItems"
        :key="item.name"
        :to="item.to"
        class="relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors"
        :class="
          route.name === item.name
            ? 'bg-indigo-50 text-rappeli-primary'
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        "
      >
        <span
          v-if="route.name === item.name"
          class="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-rappeli-primary"
          aria-hidden="true"
        />
        <component :is="item.icon" class="h-5 w-5 shrink-0" aria-hidden="true" />
        {{ item.label }}
      </RouterLink>
    </nav>

    <div class="mt-auto space-y-3 border-t border-slate-100 pt-4">
      <a
        href="#"
        class="flex items-center gap-2 px-2 text-sm text-slate-500 hover:text-slate-800"
        @click.prevent
      >
        <CircleHelp class="h-4 w-4" aria-hidden="true" />
        Ajuda e Suporte
      </a>

      <div class="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-3">
        <div
          class="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700"
        >
          {{ initials }}
        </div>
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-medium text-slate-900">
            {{ auth.user?.name ?? 'Conta' }}
          </p>
          <p class="flex items-center gap-1.5 text-xs text-slate-500">
            <span class="h-2 w-2 rounded-full bg-rappeli-success" aria-hidden="true" />
            Online
          </p>
        </div>
      </div>
    </div>
  </aside>
</template>
