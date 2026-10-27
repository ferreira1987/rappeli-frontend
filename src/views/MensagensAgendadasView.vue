<script setup lang="ts">
import { Filter } from '@lucide/vue'
import { computed, ref } from 'vue'

import AppPageHeader from '@/components/app/AppPageHeader.vue'
import AppPageTabs from '@/components/app/AppPageTabs.vue'
import { panelBreadcrumbs } from '@/constants/panelBreadcrumbs'
import AppPageFooter from '@/components/layout/AppPageFooter.vue'
import ExampleFiltersModal from '@/components/app/ExampleFiltersModal.vue'
import ScheduleMessageModal from '@/components/scheduled-messages/ScheduleMessageModal.vue'
import { useExampleToast } from '@/composables/useExampleToast'
import type { ScheduledMessageStatus } from '@/mocks/scheduledMessages'
import { exampleScheduledMessages } from '@/services/example'

const tab = ref<ScheduledMessageStatus>('scheduled')
const modalOpen = ref(false)
const filtersOpen = ref(false)
const { message: toast, show: showToast } = useExampleToast()

const rows = computed(() => exampleScheduledMessages.filter((r) => r.status === tab.value))

const tabLabels: { key: ScheduledMessageStatus; label: string }[] = [
  { key: 'scheduled', label: 'Agendadas' },
  { key: 'sent', label: 'Enviadas' },
  { key: 'failed', label: 'Falharam' },
]

function countFor(status: ScheduledMessageStatus): number {
  return exampleScheduledMessages.filter((r) => r.status === status).length
}

function onScheduled(): void {
  showToast('Mensagem agendada (exemplo). Integração com API em breve.')
}
</script>

<template>
  <div class="flex min-h-full flex-col bg-brand-mist">
    <AppPageHeader
      title="Mensagens agendadas"
      :breadcrumbs="panelBreadcrumbs({ label: 'Mensagens agendadas' })"
      show-example-badge
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
      <button
        v-for="item in tabLabels"
        :key="item.key"
        type="button"
        class="flex items-center gap-2 border-b-2 py-3 text-sm font-semibold transition"
        :class="
          tab === item.key
            ? 'border-brand-indigo text-brand-indigo'
            : 'border-transparent text-brand-gray hover:text-brand-ink'
        "
        @click="tab = item.key"
      >
        {{ item.label }}
        <span
          v-if="countFor(item.key) > 0"
          class="rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-bold text-brand-indigo"
        >
          {{ countFor(item.key) }}
        </span>
      </button>
    </AppPageTabs>

    <div class="flex-1 px-4 py-6 sm:px-6 lg:px-8">
      <p v-if="toast" class="mb-4 text-sm text-brand-indigo" role="status">{{ toast }}</p>

      <div class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <table class="w-full text-left text-sm">
          <thead class="border-b border-slate-100 bg-slate-50 text-[11px] font-bold uppercase tracking-wide text-brand-gray">
            <tr>
              <th class="px-4 py-3">Contato</th>
              <th class="px-4 py-3">Mensagem</th>
              <th class="px-4 py-3">Agendamento</th>
              <th class="px-4 py-3">Responsável</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="row in rows" :key="row.id" class="hover:bg-slate-50/80">
              <td class="px-4 py-3">
                <p class="font-semibold text-brand-ink">{{ row.contactName }}</p>
                <p class="text-xs text-brand-gray">{{ row.phone }}</p>
              </td>
              <td class="max-w-md px-4 py-3 text-xs text-brand-gray">{{ row.messagePreview }}</td>
              <td class="px-4 py-3 text-xs text-brand-ink">{{ row.scheduledAt }}</td>
              <td class="px-4 py-3 text-xs text-brand-gray">{{ row.assignee ?? '—' }}</td>
            </tr>
            <tr v-if="rows.length === 0">
              <td colspan="4" class="px-4 py-8 text-center text-sm text-brand-gray">
                Nenhum registro nesta aba (exemplo).
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
      @apply="
        () => {
          filtersOpen = false
          showToast('Filtros aplicados (exemplo).')
        }
      "
    />
  </div>
</template>
