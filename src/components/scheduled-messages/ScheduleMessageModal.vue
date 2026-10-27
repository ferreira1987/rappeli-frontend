<script setup lang="ts">
import { Calendar, Clock, Info, Send, X } from '@lucide/vue'
import { computed, ref, watch } from 'vue'

import { useEscapeKey } from '@/composables/useEscapeKey'
import { scheduleMessageTemplateVariables } from '@/services/example'
import { formatRelativeScheduleDay } from '@/utils/scheduleRelative'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
  scheduled: []
}>()

const messageType = ref<'free' | 'template'>('free')
const scheduleDate = ref('2026-10-27')
const scheduleTime = ref('14:30')

function defaultMessageBody(): string {
  const dayLabel = formatRelativeScheduleDay(scheduleDate.value)
  return `Olá, {{nome}}! Lembrando da sua consulta de avaliação ${dayLabel} às {{horario}}. Podemos confirmar sua presença?`
}

const messageBody = ref(defaultMessageBody())
const repeat = ref('none')

const previewText = computed(() => {
  const dayLabel = formatRelativeScheduleDay(scheduleDate.value)
  return messageBody.value
    .replace(/\{\{nome\}\}/gi, 'Mariana')
    .replace(/\{\{data\}\}/gi, dayLabel)
    .replace(/\{\{horario\}\}/gi, scheduleTime.value)
})

const charCount = computed(() => messageBody.value.length)

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    messageType.value = 'free'
    messageBody.value = defaultMessageBody()
  },
)

watch(scheduleDate, () => {
  if (messageBody.value.includes('consulta de avaliação')) {
    messageBody.value = defaultMessageBody()
  }
})

useEscapeKey(
  () => props.open,
  () => onClose(),
)

function insertVariable(variable: string): void {
  messageBody.value = `${messageBody.value}${variable}`
}

function onClose(): void {
  emit('close')
}

function onSubmit(): void {
  emit('scheduled')
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="schedule-message-title"
      @click.self="onClose"
    >
      <div class="my-8 flex w-full max-w-xl flex-col gap-5 rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-center gap-2">
            <Calendar class="h-5 w-5 text-brand-indigo" />
            <h2 id="schedule-message-title" class="font-display text-lg font-bold text-brand-ink">
              Agendar mensagem
            </h2>
          </div>
          <button
            type="button"
            class="rounded-lg p-1.5 text-brand-gray hover:bg-slate-100"
            aria-label="Fechar"
            @click="onClose"
          >
            <X class="h-5 w-5" />
          </button>
        </div>

        <div>
          <p class="mb-1 text-[11px] font-semibold uppercase tracking-wide text-brand-gray">Contato</p>
          <div
            class="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
          >
            <span>Mariana Costa (+55 62 99876-1234)</span>
            <button type="button" class="text-brand-gray hover:text-brand-ink" aria-label="Remover contato">
              <X class="h-4 w-4" />
            </button>
          </div>
        </div>

        <div>
          <p class="mb-2 text-[11px] font-semibold uppercase tracking-wide text-brand-gray">Tipo de mensagem</p>
          <div class="flex rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              class="flex-1 rounded-md py-2 text-xs font-semibold"
              :class="messageType === 'free' ? 'bg-brand-indigo text-white' : 'text-brand-gray'"
              @click="messageType = 'free'"
            >
              Texto livre
            </button>
            <button
              type="button"
              class="flex-1 rounded-md py-2 text-xs font-medium text-brand-gray"
              @click="messageType = 'template'"
            >
              Template aprovado
            </button>
          </div>
        </div>

        <div>
          <div class="mb-1 flex items-center justify-between">
            <p class="text-[11px] font-semibold uppercase tracking-wide text-brand-gray">Mensagem</p>
            <button type="button" class="text-xs font-semibold text-brand-indigo hover:underline">
              + Inserir variável
            </button>
          </div>
          <textarea
            v-model="messageBody"
            rows="4"
            class="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-indigo focus:outline-none focus:ring-2 focus:ring-brand-indigo/20"
          />
          <div class="mt-2 flex flex-wrap gap-1.5">
            <button
              v-for="variable in scheduleMessageTemplateVariables"
              :key="variable"
              type="button"
              class="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-brand-gray hover:bg-slate-200"
              @click="insertVariable(variable)"
            >
              {{ variable }}
            </button>
          </div>
          <p class="mt-1 text-right text-[11px] text-brand-gray">{{ charCount }} / 1024 caracteres</p>
        </div>

        <div class="flex gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-blue-900">
          <Info class="h-4 w-4 shrink-0 text-blue-600" />
          <p>
            Fora da janela de 24h de atendimento do WhatsApp, é necessário usar um template aprovado pela Meta.
          </p>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="mb-1 block text-[11px] font-semibold uppercase text-brand-gray">Data</label>
            <div class="relative">
              <Calendar class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-gray" />
              <input
                v-model="scheduleDate"
                type="date"
                class="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm"
              />
            </div>
          </div>
          <div>
            <label class="mb-1 block text-[11px] font-semibold uppercase text-brand-gray">Hora</label>
            <div class="relative">
              <Clock class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-gray" />
              <input
                v-model="scheduleTime"
                type="time"
                class="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm"
              />
            </div>
          </div>
        </div>

        <div>
          <label class="mb-1 block text-[11px] font-semibold uppercase text-brand-gray">Repetir</label>
          <select v-model="repeat" class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
            <option value="none">Não repetir</option>
            <option value="weekly">Semanalmente</option>
          </select>
        </div>

        <div>
          <p class="mb-2 text-xs font-semibold text-brand-ink">Pré-visualização no WhatsApp</p>
          <div class="rounded-lg bg-[#e5ddd5] p-3">
            <div class="max-w-[90%] rounded-lg rounded-tl-none bg-white p-3 text-sm text-brand-ink shadow-xs">
              {{ previewText }}
              <div class="mt-1 flex justify-end gap-1 text-[10px] text-brand-gray">
                <span>{{ scheduleTime }}</span>
                <span class="text-blue-500">✓✓</span>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-2 border-t border-slate-100 pt-2">
          <button
            type="button"
            class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-50"
            @click="onClose"
          >
            Cancelar
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg bg-brand-indigo px-4 py-2 text-sm font-semibold text-white hover:bg-brand-indigo-hover"
            @click="onSubmit"
          >
            <Send class="h-4 w-4" />
            Agendar
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
