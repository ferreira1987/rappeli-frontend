<script setup lang="ts">
import { Plus, Upload, Users } from '@lucide/vue'
import { ref } from 'vue'

import EmptyState from '@/components/app/EmptyState.vue'
import AppPageFooter from '@/components/layout/AppPageFooter.vue'

const comingSoonMessage = ref<string | null>(null)

function showComingSoon(): void {
  comingSoonMessage.value = 'Esta função estará disponível em breve.'
  window.setTimeout(() => {
    comingSoonMessage.value = null
  }, 4000)
}
</script>

<template>
  <div class="min-h-full px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
    <header class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="font-display text-2xl font-semibold text-brand-ink">Contatos</h1>
        <p class="mt-1 text-sm text-brand-gray">Organize clientes, tags e importações em um só lugar.</p>
      </div>
      <div class="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
        <button
          type="button"
          class="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-brand-indigo/30 bg-white px-4 py-2 text-sm font-medium text-brand-indigo hover:bg-brand-mist sm:w-auto"
          @click="showComingSoon"
        >
          <Upload class="h-4 w-4" aria-hidden="true" />
          Importar CSV
        </button>
        <button
          type="button"
          class="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-indigo px-4 py-2 text-sm font-semibold text-white hover:bg-brand-indigo-hover sm:w-auto"
          @click="showComingSoon"
        >
          <Plus class="h-4 w-4" aria-hidden="true" />
          Novo contato
        </button>
      </div>
    </header>

    <p v-if="comingSoonMessage" class="mt-4 text-sm text-brand-indigo" role="status">
      {{ comingSoonMessage }}
    </p>

    <div class="mt-6 space-y-6">
      <EmptyState
        :icon="Users"
        title="Nenhum contato cadastrado"
        description="Importe uma planilha ou adicione contatos manualmente quando a listagem estiver ativa."
      >
        <template #actions>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-xl border border-brand-indigo/30 bg-white px-4 py-2 text-sm font-medium text-brand-indigo hover:bg-brand-mist"
            @click="showComingSoon"
          >
            <Upload class="h-4 w-4" aria-hidden="true" />
            Importar CSV
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-xl bg-brand-indigo px-4 py-2 text-sm font-semibold text-white hover:bg-brand-indigo-hover"
            @click="showComingSoon"
          >
            <Plus class="h-4 w-4" aria-hidden="true" />
            Novo contato
          </button>
        </template>
      </EmptyState>

      <AppPageFooter />
    </div>
  </div>
</template>
