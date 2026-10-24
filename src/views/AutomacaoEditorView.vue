<script setup lang="ts">
import { Bot } from '@lucide/vue'
import { RouterLink } from 'vue-router'

import EmptyState from '@/components/app/EmptyState.vue'
import AppPageFooter from '@/components/layout/AppPageFooter.vue'
</script>

<template>
  <div class="min-h-full px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
    <nav class="text-sm text-brand-gray">
      <RouterLink :to="{ name: 'automacoes' }" class="hover:text-brand-indigo">Automações</RouterLink>
      <span class="mx-1">/</span>
      <span class="text-brand-ink">Editor</span>
    </nav>

    <header class="mt-4">
      <span
        class="inline-flex items-center gap-1 rounded-full bg-brand-mist px-2.5 py-1 text-xs font-medium text-brand-indigo"
      >
        Em breve
      </span>
      <h1 class="mt-2 font-display text-2xl font-semibold text-brand-ink">Editor de automação</h1>
      <p class="mt-1 text-sm text-brand-gray">
        O construtor visual de fluxos ainda não está disponível nesta versão.
      </p>
    </header>

    <div class="mt-6 space-y-6">
      <EmptyState
        :icon="Bot"
        title="Em breve"
        description="Você poderá montar fluxos arrastando blocos. Por enquanto, configure respostas automáticas pelo menu lateral."
      >
        <template #actions>
          <RouterLink
            :to="{ name: 'automacoes' }"
            class="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-brand-ink hover:bg-slate-50"
          >
            Voltar
          </RouterLink>
          <RouterLink
            :to="{ name: 'respostas-automaticas' }"
            class="rounded-xl bg-brand-indigo px-4 py-2 text-sm font-semibold text-white hover:bg-brand-indigo-hover"
          >
            Respostas automáticas
          </RouterLink>
        </template>
      </EmptyState>

      <AppPageFooter />
    </div>
  </div>
</template>
