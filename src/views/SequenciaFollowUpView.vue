<script setup lang="ts">
import { Loader2 } from '@lucide/vue'
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import { enrollSequence, fetchSequence } from '@/api/sequences'
import AppPageHeader from '@/components/app/AppPageHeader.vue'
import AppPageFooter from '@/components/layout/AppPageFooter.vue'
import { panelBreadcrumbs } from '@/constants/panelBreadcrumbs'
import type { Sequence } from '@/types/campaigns'
import { getErrorMessage } from '@/utils/errors'

const route = useRoute()
const sequence = ref<Sequence | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const enrollIds = ref('')
const enrollMessage = ref<string | null>(null)

const sequenceId = computed(() => {
  const raw = route.params.id
  const id = typeof raw === 'string' ? Number(raw) : Number(raw?.[0])
  return Number.isFinite(id) ? id : 0
})

async function load(): Promise<void> {
  loading.value = true
  error.value = null
  try {
    sequence.value = await fetchSequence(sequenceId.value)
  } catch (err) {
    error.value = getErrorMessage(err)
    sequence.value = null
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void load()
})

const breadcrumbs = computed(() =>
  panelBreadcrumbs(
    { label: 'Campanhas', to: { name: 'campanhas' } },
    { label: 'Sequências', to: { name: 'campanhas-sequencias' } },
    { label: sequence.value?.name ?? 'Sequência' },
  ),
)

async function onEnroll(): Promise<void> {
  const ids = enrollIds.value
    .split(',')
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n) && n > 0)
  if (!ids.length) {
    enrollMessage.value = 'Informe IDs de contato separados por vírgula.'
    return
  }
  try {
    const count = await enrollSequence(sequenceId.value, ids)
    enrollMessage.value = `${count} contato(s) inscritos na sequência.`
    await load()
  } catch (err) {
    enrollMessage.value = getErrorMessage(err)
  }
}
</script>

<template>
  <div class="flex min-h-full flex-col bg-brand-mist">
    <AppPageHeader :title="sequence?.name ?? 'Sequência'" :breadcrumbs="breadcrumbs" />

    <div class="flex-1 space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div v-if="loading" class="flex justify-center py-16">
        <Loader2 class="h-8 w-8 animate-spin text-brand-indigo" />
      </div>
      <div v-else-if="error" class="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-800">
        {{ error }}
      </div>
      <template v-else-if="sequence">
        <p class="text-sm text-brand-gray">{{ sequence.description || 'Sem descrição' }}</p>
        <p class="text-xs text-brand-gray">
          Gatilho: {{ sequence.trigger ?? '—' }} · Ativa: {{ sequence.active ? 'Sim' : 'Não' }}
        </p>

        <section class="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <h2 class="font-display text-base font-bold text-brand-ink">Passos</h2>
          <ol class="mt-3 list-decimal space-y-2 pl-5 text-sm">
            <li v-for="step in sequence.steps ?? []" :key="step.id">
              {{ step.label || step.kind }} — {{ step.wait_minutes ?? 0 }} min
              <span v-if="step.preview" class="block text-xs text-brand-gray">{{ step.preview }}</span>
            </li>
            <li v-if="!(sequence.steps?.length)" class="list-none pl-0 text-brand-gray">Nenhum passo cadastrado.</li>
          </ol>
        </section>

        <section class="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <h2 class="font-display text-base font-bold text-brand-ink">Inscrever contatos (enroll)</h2>
          <input
            v-model="enrollIds"
            type="text"
            placeholder="IDs dos contatos, ex.: 12, 15, 20"
            class="mt-2 w-full max-w-md rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <button
            type="button"
            class="mt-3 rounded-lg bg-brand-indigo px-4 py-2 text-sm font-semibold text-white"
            @click="onEnroll"
          >
            Inscrever
          </button>
          <p v-if="enrollMessage" class="mt-2 text-sm text-brand-indigo" role="status">{{ enrollMessage }}</p>
        </section>
      </template>
      <AppPageFooter />
    </div>
  </div>
</template>
