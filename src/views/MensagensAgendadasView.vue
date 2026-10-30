<script setup lang="ts">
import { Filter, Loader2, Trash2 } from '@lucide/vue'
import { computed, onMounted, ref, watch } from 'vue'

import {
  cancelScheduledMessage,
  deleteScheduledMessage,
  fetchScheduledMessages,
} from '@/api/scheduledMessages'
import AppPageHeader from '@/components/app/AppPageHeader.vue'
import AppPageTabs from '@/components/app/AppPageTabs.vue'
import UiFilterChip from '@/components/ui/UiFilterChip.vue'
import { panelBreadcrumbs } from '@/constants/panelBreadcrumbs'
import AppPageFooter from '@/components/layout/AppPageFooter.vue'
import ExampleFiltersModal from '@/components/app/ExampleFiltersModal.vue'
import ScheduleMessageModal from '@/components/scheduled-messages/ScheduleMessageModal.vue'
import type { ScheduledMessageStatus } from '@/types/scheduledMessages'
import { formatDateTime } from '@/utils/datetime'
import { formatBrazilPhone } from '@/utils/phone'
import { getErrorMessage } from '@/utils/errors'

const tab = ref<ScheduledMessageStatus>('scheduled')
const modalOpen = ref(false)
const filtersOpen = ref(false)
const loading = ref(true)
const error = ref<string | null>(null)
const statusMessage = ref<string | null>(null)

const counts = ref<Record<ScheduledMessageStatus, number>>({
  scheduled: 0,
  sent: 0,
  failed: 0,
  cancelled: 0,
})

const rowsByTab = ref<Record<ScheduledMessageStatus, Awaited<ReturnType<typeof fetchScheduledMessages>>['messages']>>({
  scheduled: [],
  sent: [],
  failed: [],
  cancelled: [],
})

const rows = computed(() => rowsByTab.value[tab.value] ?? [])

const tabLabels: { key: ScheduledMessageStatus; label: string }[] = [
  { key: 'scheduled', label: 'Agendadas' },
  { key: 'sent', label: 'Enviadas' },
  { key: 'failed', label: 'Falharam' },
]

async function loadTab(status: ScheduledMessageStatus): Promise<void> {
  const page = await fetchScheduledMessages({ status, per_page: 100 })
  rowsByTab.value[status] = page.messages
  counts.value[status] = page.meta.total ?? page.messages.length
}

async function loadAll(): Promise<void> {
  loading.value = true
  error.value = null
  try {
    await Promise.all(tabLabels.map((t) => loadTab(t.key)))
  } catch (err) {
    error.value = getErrorMessage(err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void loadAll()
})

watch(tab, (status) => {
  if (!rowsByTab.value[status]?.length && !loading.value) {
    void loadTab(status).catch(() => undefined)
  }
})

function contactLabel(row: { contact?: { display_name: string | null; phone: string } }): string {
  const name = row.contact?.display_name
  const phone = row.contact?.phone
  if (name && phone) {
    return `${name} (${formatBrazilPhone(phone) || phone})`
  }
  return name || formatBrazilPhone(phone ?? '') || 'Contato'
}

async function onScheduled(): Promise<void> {
  statusMessage.value = 'Mensagem agendada com sucesso.'
  await loadAll()
}

async function onCancel(id: number): Promise<void> {
  try {
    await cancelScheduledMessage(id)
    statusMessage.value = 'Agendamento cancelado.'
    await loadAll()
  } catch (err) {
    statusMessage.value = getErrorMessage(err)
  }
}

async function onDelete(id: number): Promise<void> {
  try {
    await deleteScheduledMessage(id)
    statusMessage.value = 'Registro removido.'
    await loadAll()
  } catch (err) {
    statusMessage.value = getErrorMessage(err)
  }
}
</script>

<template>
  <div class="flex min-h-full flex-col bg-brand-surface">
    <AppPageHeader
      title="Mensagens agendadas"
      :breadcrumbs="panelBreadcrumbs({ label: 'Mensagens agendadas' })"
    >
      <template #actions>
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50"
          @click="filtersOpen = true"
        >
          <Filter class="h-4 w-4 text-brand-gray" />
          Filtros
        </button>
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-lg bg-brand-indigo px-4 py-2 text-sm font-semibold text-white hover:bg-brand-indigo-hover"
          @click="modalOpen = true"
        >
          + Agendar mensagem
        </button>
      </template>
    </AppPageHeader>

    <AppPageTabs>
      <UiFilterChip
        v-for="item in tabLabels"
        :key="item.key"
        :active="tab === item.key"
        @click="tab = item.key"
      >
        {{ item.label }}
        <span
          v-if="counts[item.key] > 0"
          class="rounded-full px-1.5 text-[10px] font-bold"
          :class="tab === item.key ? 'bg-white/20 text-white' : 'bg-brand-mist text-brand-indigo'"
        >
          {{ counts[item.key] }}
        </span>
      </UiFilterChip>
    </AppPageTabs>

    <div class="flex-1 px-4 py-6 sm:px-6 lg:px-8">
      <p v-if="statusMessage" class="mb-4 text-sm text-brand-indigo" role="status">{{ statusMessage }}</p>

      <div v-if="loading" class="flex justify-center py-16">
        <Loader2 class="h-8 w-8 animate-spin text-brand-indigo" aria-label="Carregando" />
      </div>

      <div v-else-if="error" class="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p class="text-sm text-red-800">{{ error }}</p>
        <button type="button" class="mt-3 rounded-lg bg-brand-indigo px-4 py-2 text-sm font-semibold text-white" @click="loadAll">
          Tentar novamente
        </button>
      </div>

      <div v-else class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <table class="w-full text-left text-sm">
          <thead class="border-b border-slate-100 bg-slate-50 text-[11px] font-bold uppercase tracking-wide text-brand-gray">
            <tr>
              <th class="px-4 py-3">Contato</th>
              <th class="px-4 py-3">Mensagem</th>
              <th class="px-4 py-3">Agendamento</th>
              <th class="px-4 py-3">Status</th>
              <th class="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="row in rows" :key="row.id" class="hover:bg-slate-50/80">
              <td class="px-4 py-3 font-semibold text-brand-ink">{{ contactLabel(row) }}</td>
              <td class="max-w-md px-4 py-3 text-xs text-brand-gray">{{ row.body }}</td>
              <td class="px-4 py-3 text-xs text-brand-ink">
                {{ row.scheduled_at ? formatDateTime(row.scheduled_at) : '—' }}
              </td>
              <td class="px-4 py-3 text-xs capitalize text-brand-gray">{{ row.status }}</td>
              <td class="px-4 py-3 text-right">
                <button
                  v-if="row.status === 'scheduled'"
                  type="button"
                  class="mr-2 text-xs font-semibold text-amber-700 hover:underline"
                  @click="onCancel(row.id)"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  class="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:underline"
                  @click="onDelete(row.id)"
                >
                  <Trash2 class="h-3.5 w-3.5" />
                  Excluir
                </button>
              </td>
            </tr>
            <tr v-if="rows.length === 0">
              <td colspan="5" class="px-4 py-8 text-center text-sm text-brand-gray">
                Nenhum registro nesta aba.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <AppPageFooter />
    </div>

    <ScheduleMessageModal :open="modalOpen" @close="modalOpen = false" @scheduled="onScheduled" />
    <ExampleFiltersModal
      :open="filtersOpen"
      title="Filtros de mensagens agendadas"
      @close="filtersOpen = false"
      @apply="filtersOpen = false"
    />
  </div>
</template>
