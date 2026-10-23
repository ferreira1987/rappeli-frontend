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

const props = withDefaults(
  defineProps<{
    theme?: 'light' | 'ink'
  }>(),
  { theme: 'light' },
)

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

const isInk = computed(() => props.theme === 'ink')

async function onLogout(): Promise<void> {
  await auth.logout()
  await router.push({ name: 'login' })
}
</script>

<template>
  <aside
    class="flex h-screen w-[260px] shrink-0 flex-col border-r px-4 py-5"
    :class="
      isInk
        ? 'border-white/10 bg-brand-ink text-white'
        : 'border-slate-200/80 bg-white text-brand-ink'
    "
  >
    <div class="px-1">
      <RappeliLogo :variant="isInk ? 'light' : 'dark'" />
      <p
        v-if="!isInk"
        class="mt-2 text-xs font-medium text-brand-gray"
      >
        Mensagens &amp; automações
      </p>
    </div>

    <RouterLink
      :to="{ name: 'automacoes' }"
      class="mt-6 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
      :class="isInk ? 'bg-brand-indigo' : 'bg-brand-indigo hover:bg-brand-indigo-hover'"
    >
      <Plus class="h-4 w-4" aria-hidden="true" />
      Nova automação
    </RouterLink>

    <p
      class="mt-6 px-2 text-[10px] font-semibold uppercase tracking-wider"
      :class="isInk ? 'text-white/40' : 'text-brand-gray'"
    >
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
            ? isInk
              ? 'bg-white/10 text-white'
              : 'bg-brand-mist text-brand-indigo'
            : isInk
              ? 'text-white/70 hover:bg-white/5 hover:text-white'
              : 'text-brand-gray hover:bg-slate-50 hover:text-brand-ink'
        "
      >
        <span
          v-if="route.name === item.name && !isInk"
          class="absolute -left-4 top-2 bottom-2 w-1 rounded-full bg-brand-indigo"
          aria-hidden="true"
        />
        <component :is="item.icon" class="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
        {{ item.label }}
      </RouterLink>
    </nav>

    <div class="mt-auto space-y-2 border-t pt-4" :class="isInk ? 'border-white/10' : 'border-slate-100'">
      <a
        href="#"
        class="flex items-center gap-2 px-2 py-1.5 text-sm transition"
        :class="isInk ? 'text-white/60 hover:text-white' : 'text-brand-gray hover:text-brand-ink'"
        @click.prevent
      >
        <CircleHelp class="h-4 w-4" aria-hidden="true" />
        Ajuda e suporte
      </a>

      <div
        class="flex items-center gap-3 rounded-xl px-2 py-2"
        :class="isInk ? 'bg-white/5' : 'bg-brand-mist/60'"
      >
        <div
          class="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold"
          :class="isInk ? 'bg-brand-indigo text-white' : 'bg-white text-brand-indigo shadow-sm'"
        >
          {{ initials }}
        </div>
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-medium" :class="isInk ? 'text-white' : 'text-brand-ink'">
            {{ auth.user?.name ?? 'Sua conta' }}
          </p>
          <p class="truncate text-xs" :class="isInk ? 'text-white/50' : 'text-brand-gray'">
            {{ auth.user?.email ?? '—' }}
          </p>
        </div>
        <button
          type="button"
          class="rounded-lg p-1.5 transition"
          :class="isInk ? 'text-white/50 hover:bg-white/10 hover:text-white' : 'text-brand-gray hover:bg-white hover:text-brand-ink'"
          aria-label="Sair"
          @click="onLogout"
        >
          <LogOut class="h-4 w-4" />
        </button>
      </div>
    </div>
  </aside>
</template>
