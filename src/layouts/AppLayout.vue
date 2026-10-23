<script setup lang="ts">
import { Bell, ChevronDown, Search } from '@lucide/vue'
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'

import AppSidebar from '@/components/app/AppSidebar.vue'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const auth = useAuthStore()

const pageTitle = computed(() => {
  const title = route.meta.title
  return typeof title === 'string' ? title : 'Rappeli'
})
</script>

<template>
  <div class="flex min-h-screen bg-rappeli-surface">
    <AppSidebar />

    <div class="flex min-w-0 flex-1 flex-col">
      <header
        class="sticky top-0 z-10 flex flex-wrap items-center gap-4 border-b border-slate-200 bg-white/90 px-6 py-4 backdrop-blur"
      >
        <h1 class="text-xl font-semibold text-slate-900">{{ pageTitle }}</h1>

        <div class="relative ml-auto min-w-[200px] flex-1 max-w-xl">
          <Search
            class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="search"
            disabled
            placeholder="Buscar conversas, telefones ou contatos"
            class="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-500"
          />
        </div>

        <div class="flex items-center gap-3">
          <span
            class="hidden items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-600 sm:inline-flex"
          >
            <span class="h-2 w-2 rounded-full bg-rappeli-success" aria-hidden="true" />
            WhatsApp
          </span>
          <button
            type="button"
            class="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Notificações"
            disabled
          >
            <Bell class="h-5 w-5" />
          </button>
          <button
            type="button"
            class="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-1.5 text-sm text-slate-700"
            disabled
          >
            <span class="max-w-[120px] truncate">{{ auth.user?.name }}</span>
            <ChevronDown class="h-4 w-4 text-slate-400" />
          </button>
        </div>
      </header>

      <main class="flex-1 px-6 py-6">
        <RouterView />
      </main>

      <footer class="border-t border-slate-200 px-6 py-4 text-xs text-slate-500">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <span>© {{ new Date().getFullYear() }} Rappeli</span>
          <span class="inline-flex items-center gap-1.5">
            <span class="h-2 w-2 rounded-full bg-rappeli-success" aria-hidden="true" />
            Sistemas operando normalmente
          </span>
        </div>
      </footer>
    </div>
  </div>
</template>
