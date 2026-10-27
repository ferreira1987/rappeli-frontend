<script setup lang="ts">
import { Loader2, Plus } from '@lucide/vue'
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

import { createSequence, fetchSequences } from '@/api/sequences'
import AppPageHeader from '@/components/app/AppPageHeader.vue'
import AppPageFooter from '@/components/layout/AppPageFooter.vue'
import { panelBreadcrumbs } from '@/constants/panelBreadcrumbs'
import type { Sequence } from '@/types/campaigns'
import { getErrorMessage } from '@/utils/errors'
import { pluralizePt } from '@/utils/pluralize'

const sequences = ref<Sequence[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const creating = ref(false)

async function load(): Promise<void> {
  loading.value = true
  error.value = null
  try {
    sequences.value = await fetchSequences()
  } catch (err) {
    error.value = getErrorMessage(err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void load()
})

async function addSequence(): Promise<void> {
  const name = window.prompt('Nome da nova sequência:')
  if (!name?.trim()) return
  creating.value = true
  try {
    await createSequence({ name: name.trim(), active: true })
    await load()
  } catch (err) {
    error.value = getErrorMessage(err)
  } finally {
    creating.value = false
  }
}

const breadcrumbs = panelBreadcrumbs({ label: 'Campanhas', to: { name: 'campanhas' } }, { label: 'Sequências' })
</script>

<template>
  <div class="flex min-h-full flex-col bg-brand-mist">
    <AppPageHeader title="Sequências" :breadcrumbs="breadcrumbs">
      <template #actions>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-lg bg-brand-indigo px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          :disabled="creating"
          @click="addSequence"
        >
          <Plus class="h-4 w-4" />
          Nova sequência
        </button>
      </template>
    </AppPageHeader>

    <div class="flex-1 px-4 py-6 sm:px-6 lg:px-8">
      <div v-if="loading" class="flex justify-center py-16">
        <Loader2 class="h-8 w-8 animate-spin text-brand-indigo" />
      </div>
      <div v-else-if="error" class="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p class="text-sm text-red-800">{{ error }}</p>
        <button type="button" class="mt-3 rounded-lg bg-brand-indigo px-4 py-2 text-sm font-semibold text-white" @click="load">
          Tentar novamente
        </button>
      </div>
      <template v-else>
        <p class="text-sm text-brand-gray">
          {{ pluralizePt(sequences.length, 'sequência') }} — enroll e passos via API.
        </p>
        <ul class="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white shadow-xs">
          <li v-for="seq in sequences" :key="seq.id" class="px-4 py-4">
            <RouterLink
              :to="{ name: 'campanhas-sequencia-detalhe', params: { id: seq.id } }"
              class="font-semibold text-brand-indigo hover:underline"
            >
              {{ seq.name }}
            </RouterLink>
            <p class="text-xs text-brand-gray">{{ seq.description || 'Sem descrição' }}</p>
            <p class="text-[11px] text-brand-gray">{{ seq.contacts_in_progress }} em andamento</p>
          </li>
          <li v-if="!sequences.length" class="px-4 py-8 text-center text-sm text-brand-gray">
            Nenhuma sequência cadastrada.
          </li>
        </ul>
      </template>
      <AppPageFooter />
    </div>
  </div>
</template>
