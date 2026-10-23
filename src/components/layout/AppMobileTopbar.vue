<script setup lang="ts">
import { Menu, X } from '@lucide/vue'

import RappeliLogo from '@/components/brand/RappeliLogo.vue'
import { useAppSidebar } from '@/composables/useAppSidebar'

const { isOpen, toggle, menuButtonId } = useAppSidebar()
</script>

<template>
  <header
    class="flex shrink-0 items-center gap-3 border-b border-slate-200/80 bg-white px-4 py-3 lg:hidden"
  >
    <button
      :id="menuButtonId"
      type="button"
      class="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-brand-ink transition hover:bg-slate-50"
      :aria-expanded="isOpen"
      aria-controls="app-sidebar"
      :aria-label="isOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'"
      @click="toggle()"
    >
      <Menu v-if="!isOpen" class="h-5 w-5" aria-hidden="true" />
      <X v-else class="h-5 w-5" aria-hidden="true" />
    </button>
    <RappeliLogo variant="dark" class="min-w-0 flex-1" />
  </header>
</template>
