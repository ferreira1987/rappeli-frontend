<script setup lang="ts">
import { Calendar, Clock, Info, Loader2, Send, X } from '@lucide/vue'
import { computed, ref, watch } from 'vue'

import { fetchContacts } from '@/api/contacts'
import { createScheduledMessage } from '@/api/scheduledMessages'
import { useEscapeKey } from '@/composables/useEscapeKey'
import type { Contact } from '@/types/contacts'
import { formatRelativeScheduleDay } from '@/utils/scheduleRelative'
import { formatBrazilPhone } from '@/utils/phone'
import { getErrorMessage, getValidationErrors } from '@/utils/errors'

const scheduleMessageTemplateVariables = ['{{nome}}', '{{data}}', '{{horario}}']

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
  scheduled: []
}>()

const messageType = ref<'free'>('free')
const scheduleDate = ref(new Date().toISOString().slice(0, 10))
const scheduleTime = ref('14:30')

const contactSearch = ref('')
const contactResults = ref<Contact[]>([])
const selectedContact = ref<Contact | null>(null)
const contactLoading = ref(false)
const submitting = ref(false)
const formError = ref<string | null>(null)
const fieldErrors = ref<Record<string, string>>({})

function defaultMessageBody(): string {
  const dayLabel = formatRelativeScheduleDay(scheduleDate.value)
  return `Olá, {{nome}}! Lembrando da sua consulta de avaliação ${dayLabel} às {{horario}}. Podemos confirmar sua presença?`
}

const messageBody = ref(defaultMessageBody())
const repeat = ref<'none' | 'daily' | 'weekly'>('none')

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
    messageBody.value = defaultMessageBody()
    selectedContact.value = null
    contactSearch.value = ''
    contactResults.value = []
    formError.value = null
    fieldErrors.value = {}
  },
)

watch(contactSearch, async (query) => {
  const q = query.trim()
  if (q.length < 2) {
    contactResults.value = []
    return
  }
  contactLoading.value = true
  try {
    const page = await fetchContacts({ search: q, per_page: 8 })
    contactResults.value = page.contacts
  } catch {
    contactResults.value = []
  } finally {
    contactLoading.value = false
  }
})

function selectContact(contact: Contact): void {
  selectedContact.value = contact
  contactSearch.value = contact.display_name || formatBrazilPhone(contact.phone) || contact.phone
  contactResults.value = []
}

function scheduledAtIso(): string {
  return new Date(`${scheduleDate.value}T${scheduleTime.value}:00`).toISOString()
}

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

async function onSubmit(): Promise<void> {
  if (!selectedContact.value) {
    fieldErrors.value = { contact_id: 'Selecione um contato.' }
    return
  }
  if (!messageBody.value.trim()) {
    fieldErrors.value = { body: 'Informe a mensagem.' }
    return
  }
  submitting.value = true
  formError.value = null
  fieldErrors.value = {}
  try {
    await createScheduledMessage({
      contact_id: selectedContact.value.id,
      body: messageBody.value,
      scheduled_at: scheduledAtIso(),
      repeat_rule: repeat.value === 'none' ? undefined : repeat.value,
    })
    emit('scheduled')
    emit('close')
  } catch (error) {
    const validation = getValidationErrors(error)
    if (validation) {
      fieldErrors.value = validation
    } else {
      formError.value = getErrorMessage(error)
    }
  } finally {
    submitting.value = false
  }
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

        <p v-if="formError" class="text-sm text-red-600" role="alert">{{ formError }}</p>

        <div>
          <p class="mb-1 text-[11px] font-semibold uppercase tracking-wide text-brand-gray">Contato</p>
          <input
            v-model="contactSearch"
            type="search"
            placeholder="Buscar contato por nome ou telefone…"
            class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <p v-if="fieldErrors.contact_id" class="mt-1 text-xs text-red-600">{{ fieldErrors.contact_id }}</p>
          <ul v-if="contactResults.length" class="mt-1 max-h-32 overflow-y-auto rounded-lg border border-slate-200 text-sm">
            <li v-for="contact in contactResults" :key="contact.id">
              <button
                type="button"
                class="w-full px-3 py-2 text-left hover:bg-slate-50"
                @click="selectContact(contact)"
              >
                {{ contact.display_name || 'Sem nome' }} — {{ formatBrazilPhone(contact.phone) || contact.phone }}
              </button>
            </li>
          </ul>
          <p v-if="contactLoading" class="mt-1 flex items-center gap-1 text-xs text-brand-gray">
            <Loader2 class="h-3 w-3 animate-spin" /> Buscando…
          </p>
        </div>

        <div>
          <div class="mb-1 flex items-center justify-between">
            <p class="text-[11px] font-semibold uppercase tracking-wide text-brand-gray">Mensagem</p>
            <button
              type="button"
              class="text-xs font-semibold text-brand-indigo hover:underline"
              @click="insertVariable('{{nome}}')"
            >
              + Inserir variável
            </button>
          </div>
          <textarea
            v-model="messageBody"
            rows="4"
            class="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-indigo focus:outline-none focus:ring-2 focus:ring-brand-indigo/20"
            @input="delete fieldErrors.body"
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
          <p class="mt-1 text-xs text-brand-gray">
            Use variáveis como
            <code v-pre>{{nome}}</code>,
            <code v-pre>{{data}}</code> e
            <code v-pre>{{horario}}</code> — substituídas na prévia e no envio.
          </p>
          <p v-if="fieldErrors.body" class="mt-1 text-xs text-red-600">{{ fieldErrors.body }}</p>
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
            <option value="daily">Diariamente</option>
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
            :disabled="submitting"
            @click="onSubmit"
          >
            <Send class="h-4 w-4" />
            {{ submitting ? 'Agendando…' : 'Agendar' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
