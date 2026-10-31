<script setup lang="ts">
import { Check, Clock, Key, Loader2, MessageSquareReply, Plus, Sparkles } from '@lucide/vue'
import { computed, onMounted, ref } from 'vue'

import { fetchCsrfCookie } from '@/api/auth'
import {
  createKeywordRule,
  deleteKeywordRule,
  fetchKeywordRules,
  fetchOutOfHoursAutoReply,
  fetchWelcomeAutoReply,
  updateKeywordRule,
  updateOutOfHoursAutoReply,
  updateWelcomeAutoReply,
} from '@/api/autoReplies'
import FormSwitch from '@/components/auto-replies/FormSwitch.vue'
import MessageFieldMeta from '@/components/auto-replies/MessageFieldMeta.vue'
import KeywordRuleDeleteDialog from '@/components/auto-replies/KeywordRuleDeleteDialog.vue'
import KeywordRuleFormModal from '@/components/auto-replies/KeywordRuleFormModal.vue'
import AppPageFooter from '@/components/layout/AppPageFooter.vue'
import AppPageShell from '@/components/layout/AppPageShell.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiCard from '@/components/ui/UiCard.vue'
import UiInput from '@/components/ui/UiInput.vue'
import UiSubNav from '@/components/ui/UiSubNav.vue'
import { panelBreadcrumbs } from '@/constants/panelBreadcrumbs'
import type {
  BusinessHourSlot,
  KeywordRule,
  KeywordRuleWrite,
  OutOfHoursAutoReply,
  WelcomeAutoReply,
} from '@/types/autoReplies'
import { AutoRepliesParseError } from '@/api/autoRepliesParsing'
import { getErrorMessage, getValidationErrors } from '@/utils/errors'
import { pluralizePt } from '@/utils/pluralize'
import { BRAZIL_TIMEZONE_IDS, formatTimezoneLabel } from '@/utils/timezoneLabels'

type SectionKey = 'welcome' | 'out-of-hours' | 'keywords'

function formatLoadError(error: unknown): string {
  if (error instanceof AutoRepliesParseError) {
    return error.message
  }
  return getErrorMessage(error)
}

function cloneWelcome(payload: WelcomeAutoReply): WelcomeAutoReply {
  return {
    enabled: payload.enabled,
    message: payload.message,
    inactivity_hours: payload.inactivity_hours,
    updated_at: payload.updated_at,
  }
}

function cloneOutOfHours(payload: OutOfHoursAutoReply): OutOfHoursAutoReply {
  return {
    enabled: payload.enabled,
    timezone: payload.timezone,
    message: payload.message,
    cooldown_minutes: payload.cooldown_minutes,
    business_hours: payload.business_hours.map((slot) => ({ ...slot })),
    updated_at: payload.updated_at,
  }
}

const headerBreadcrumbs = panelBreadcrumbs(
  { label: 'Automação' },
  { label: 'Respostas automáticas' },
)

const SECTION_ICONS = {
  welcome: Sparkles,
  'out-of-hours': Clock,
  keywords: Key,
} as const

const activeSection = ref<SectionKey>('welcome')

const welcome = ref<WelcomeAutoReply>({
  enabled: false,
  message: null,
  inactivity_hours: null,
  updated_at: null,
})
const welcomeBaseline = ref<WelcomeAutoReply | null>(null)

const outOfHours = ref<OutOfHoursAutoReply>({
  enabled: false,
  timezone: 'America/Sao_Paulo',
  message: null,
  cooldown_minutes: 60,
  business_hours: [],
  updated_at: null,
})
const outOfHoursBaseline = ref<OutOfHoursAutoReply | null>(null)

const keywordRules = ref<KeywordRule[]>([])

const welcomeLoading = ref(true)
const outOfHoursLoading = ref(true)
const keywordsLoading = ref(true)

const welcomeSaving = ref(false)
const outOfHoursSaving = ref(false)

const welcomeLoadError = ref<string | null>(null)
const outOfHoursLoadError = ref<string | null>(null)
const keywordsLoadError = ref<string | null>(null)

const welcomeFormError = ref<string | null>(null)
const welcomeFieldErrors = ref<Record<string, string>>({})
const welcomeSuccess = ref<string | null>(null)

const outOfHoursFormError = ref<string | null>(null)
const outOfHoursFieldErrors = ref<Record<string, string>>({})
const outOfHoursSuccess = ref<string | null>(null)

const keywordsActionError = ref<string | null>(null)
const keywordsSuccess = ref<string | null>(null)

const ruleModalOpen = ref(false)
const ruleModalSaving = ref(false)
const ruleModalErrors = ref<Record<string, string> | null>(null)
const editingRule = ref<KeywordRule | null>(null)

const deleteDialogOpen = ref(false)
const deleteTarget = ref<KeywordRule | null>(null)
const deleteLoading = ref(false)

const timezoneOptions = BRAZIL_TIMEZONE_IDS

const weekdayLabels = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

const sortedKeywordRules = computed(() =>
  [...keywordRules.value].sort((a, b) => a.priority - b.priority || a.id - b.id),
)

const keywordRulesCount = computed(() => keywordRules.value.length)

const sectionNavItems = computed(() => {
  const count = keywordRulesCount.value
  const rulesHint =
    count > 0 ? pluralizePt(count, 'regra') : undefined

  return [
    { key: 'welcome' as const, label: 'Boas-vindas', icon: SECTION_ICONS.welcome },
    { key: 'out-of-hours' as const, label: 'Fora do horário', icon: SECTION_ICONS['out-of-hours'] },
    {
      key: 'keywords' as const,
      label: 'Palavras-chave',
      icon: SECTION_ICONS.keywords,
      hint: rulesHint,
    },
  ]
})

const welcomeMessageDraft = computed({
  get: () => welcome.value.message ?? '',
  set: (value: string) => {
    welcome.value.message = value === '' ? null : value
  },
})

const welcomeUsesInactivity = computed({
  get: () => welcome.value.inactivity_hours !== null,
  set: (enabled: boolean) => {
    welcome.value.inactivity_hours = enabled ? (welcome.value.inactivity_hours ?? 24) : null
  },
})

const outOfHoursMessageDraft = computed({
  get: () => outOfHours.value.message ?? '',
  set: (value: string) => {
    outOfHours.value.message = value === '' ? null : value
  },
})

function setBusinessDayOpen(slot: BusinessHourSlot, open: boolean): void {
  slot.is_closed = !open
  if (slot.is_closed) {
    slot.opens_at = null
    slot.closes_at = null
    return
  }
  slot.opens_at = slot.opens_at ?? '09:00'
  slot.closes_at = slot.closes_at ?? '18:00'
}

function validateWelcome(): boolean {
  const errors: Record<string, string> = {}
  if (!welcomeMessageDraft.value.trim()) {
    errors.message = 'Informe a mensagem de boas-vindas.'
  }
  if (welcome.value.enabled) {
    const hours = welcome.value.inactivity_hours
    if (hours !== null && (!Number.isFinite(hours) || hours < 1 || hours > 720)) {
      errors.inactivity_hours = 'Use entre 1 e 720 horas, ou desative o reenvio por inatividade.'
    }
  }
  welcomeFieldErrors.value = errors
  return Object.keys(errors).length === 0
}

function validateOutOfHours(): boolean {
  const errors: Record<string, string> = {}
  if (!outOfHoursMessageDraft.value.trim()) {
    errors.message = 'Informe a mensagem fora do horário.'
  }
  if (outOfHours.value.enabled) {
    if (
      outOfHours.value.cooldown_minutes < 5 ||
      outOfHours.value.cooldown_minutes > 1440
    ) {
      errors.cooldown_minutes = 'O intervalo mínimo deve ser entre 5 e 1440 minutos.'
    }
    if (!outOfHours.value.timezone) {
      errors.timezone = 'Selecione o fuso horário.'
    }
    for (const slot of outOfHours.value.business_hours) {
      if (slot.is_closed) {
        continue
      }
      if (!slot.opens_at || !slot.closes_at) {
        errors.business_hours = 'Informe abertura e fechamento nos dias em que não está fechado.'
        break
      }
      if (slot.opens_at >= slot.closes_at) {
        errors.business_hours = 'O horário de abertura deve ser anterior ao de fechamento em cada dia.'
        break
      }
    }
  }
  outOfHoursFieldErrors.value = errors
  return Object.keys(errors).length === 0
}

async function loadWelcome(): Promise<void> {
  welcomeLoading.value = true
  welcomeLoadError.value = null
  try {
    welcome.value = await fetchWelcomeAutoReply()
    welcomeBaseline.value = cloneWelcome(welcome.value)
  } catch (error) {
    welcomeLoadError.value = formatLoadError(error)
  } finally {
    welcomeLoading.value = false
  }
}

async function loadOutOfHours(): Promise<void> {
  outOfHoursLoading.value = true
  outOfHoursLoadError.value = null
  try {
    outOfHours.value = await fetchOutOfHoursAutoReply()
    outOfHoursBaseline.value = cloneOutOfHours(outOfHours.value)
  } catch (error) {
    outOfHoursLoadError.value = formatLoadError(error)
  } finally {
    outOfHoursLoading.value = false
  }
}

async function loadKeywordRules(): Promise<void> {
  keywordsLoading.value = true
  keywordsLoadError.value = null
  try {
    keywordRules.value = await fetchKeywordRules()
  } catch (error) {
    keywordsLoadError.value = formatLoadError(error)
  } finally {
    keywordsLoading.value = false
  }
}

function onCancelWelcome(): void {
  if (welcomeBaseline.value) {
    welcome.value = cloneWelcome(welcomeBaseline.value)
  }
  welcomeFormError.value = null
  welcomeFieldErrors.value = {}
  welcomeSuccess.value = null
}

function onCancelOutOfHours(): void {
  if (outOfHoursBaseline.value) {
    outOfHours.value = cloneOutOfHours(outOfHoursBaseline.value)
  }
  outOfHoursFormError.value = null
  outOfHoursFieldErrors.value = {}
  outOfHoursSuccess.value = null
}

async function onSaveWelcome(): Promise<void> {
  welcomeFormError.value = null
  welcomeSuccess.value = null
  if (!validateWelcome()) {
    return
  }
  welcomeSaving.value = true
  try {
    await fetchCsrfCookie()
    welcome.value = await updateWelcomeAutoReply(welcome.value)
    welcomeBaseline.value = cloneWelcome(welcome.value)
    welcomeSuccess.value = 'Alterações salvas.'
  } catch (error) {
    welcomeFieldErrors.value = getValidationErrors(error) ?? {}
    welcomeFormError.value = getErrorMessage(error)
  } finally {
    welcomeSaving.value = false
  }
}

async function onSaveOutOfHours(): Promise<void> {
  outOfHoursFormError.value = null
  outOfHoursSuccess.value = null
  if (!validateOutOfHours()) {
    return
  }
  outOfHoursSaving.value = true
  try {
    await fetchCsrfCookie()
    outOfHours.value = await updateOutOfHoursAutoReply(outOfHours.value)
    outOfHoursBaseline.value = cloneOutOfHours(outOfHours.value)
    outOfHoursSuccess.value = 'Alterações salvas.'
  } catch (error) {
    outOfHoursFieldErrors.value = getValidationErrors(error) ?? {}
    outOfHoursFormError.value = getErrorMessage(error)
  } finally {
    outOfHoursSaving.value = false
  }
}

function openCreateRule(): void {
  editingRule.value = null
  ruleModalErrors.value = null
  ruleModalOpen.value = true
}

function openEditRule(rule: KeywordRule): void {
  editingRule.value = rule
  ruleModalErrors.value = null
  ruleModalOpen.value = true
}

function openDeleteRule(rule: KeywordRule): void {
  deleteTarget.value = rule
  deleteDialogOpen.value = true
}

async function onRuleSubmit(payload: KeywordRuleWrite): Promise<void> {
  keywordsActionError.value = null
  keywordsSuccess.value = null
  ruleModalErrors.value = null
  ruleModalSaving.value = true
  try {
    await fetchCsrfCookie()
    if (editingRule.value != null) {
      const updated = await updateKeywordRule(editingRule.value.id, payload)
      keywordRules.value = keywordRules.value.map((rule) => (rule.id === updated.id ? updated : rule))
      keywordsSuccess.value = 'Regra atualizada com sucesso.'
    } else {
      const created = await createKeywordRule(payload)
      keywordRules.value = [...keywordRules.value, created]
      keywordsSuccess.value = 'Regra criada com sucesso.'
    }
    ruleModalOpen.value = false
    editingRule.value = null
  } catch (error) {
    ruleModalErrors.value = getValidationErrors(error)
    keywordsActionError.value = getErrorMessage(error)
  } finally {
    ruleModalSaving.value = false
  }
}

async function onConfirmDeleteRule(): Promise<void> {
  if (!deleteTarget.value) {
    return
  }
  deleteLoading.value = true
  keywordsActionError.value = null
  keywordsSuccess.value = null
  try {
    await fetchCsrfCookie()
    await deleteKeywordRule(deleteTarget.value.id)
    keywordRules.value = keywordRules.value.filter((rule) => rule.id !== deleteTarget.value?.id)
    keywordsSuccess.value = 'Regra excluída.'
    deleteDialogOpen.value = false
    deleteTarget.value = null
  } catch (error) {
    keywordsActionError.value = getErrorMessage(error)
  } finally {
    deleteLoading.value = false
  }
}

async function toggleRuleActive(rule: KeywordRule): Promise<void> {
  keywordsActionError.value = null
  keywordsSuccess.value = null
  const payload: KeywordRuleWrite = {
    keyword: rule.keyword,
    match_type: rule.match_type,
    response_body: rule.response_body,
    priority: rule.priority,
    is_active: !rule.is_active,
  }
  try {
    await fetchCsrfCookie()
    const updated = await updateKeywordRule(rule.id, payload)
    keywordRules.value = keywordRules.value.map((item) => (item.id === updated.id ? updated : item))
  } catch (error) {
    keywordsActionError.value = getErrorMessage(error)
  }
}

function selectSection(key: SectionKey): void {
  activeSection.value = key
}

onMounted(() => {
  void loadWelcome()
  void loadOutOfHours()
  void loadKeywordRules()
})
</script>

<template>
  <AppPageShell
    title="Respostas automáticas"
    subtitle="Defina textos enviados automaticamente pelo WhatsApp da empresa."
    :breadcrumbs="headerBreadcrumbs"
  >
    <template #badges>
      <UiBadge variant="primary" size="md" class="gap-1">
        <MessageSquareReply class="h-3.5 w-3.5" aria-hidden="true" />
        Atendimento automático
      </UiBadge>
    </template>

    <div class="flex min-h-0 flex-1 flex-col lg:flex-row">
      <div class="flex min-w-0 flex-1 flex-col">
        <div class="flex-1 space-y-6 px-4 py-6 sm:px-6 lg:px-8">
          <UiCard padding="none" class="overflow-hidden lg:flex lg:min-h-[520px]">
            <UiSubNav
              :items="sectionNavItems"
              :active="activeSection"
              @select="selectSection"
            />

            <div class="min-w-0 flex-1 border-t border-slate-100 lg:border-t-0">
              <section v-show="activeSection === 'welcome'" class="flex h-full flex-col">
                <div
                  v-if="welcomeLoading"
                  class="flex flex-1 items-center justify-center gap-2 px-6 py-16 text-sm text-brand-gray"
                >
                  <Loader2 class="h-5 w-5 animate-spin" aria-hidden="true" />
                  Carregando…
                </div>
                <div v-else-if="welcomeLoadError" class="px-6 py-8">
                  <p class="text-sm text-red-600" role="alert">{{ welcomeLoadError }}</p>
                  <UiButton variant="secondary" class="mt-4" @click="loadWelcome">
                    Tentar novamente
                  </UiButton>
                </div>
                <form v-else class="flex min-h-0 flex-1 flex-col" @submit.prevent="onSaveWelcome">
                  <div class="space-y-6 px-5 py-6 sm:px-6">
                    <div
                      class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
                    >
                      <div>
                        <h2 class="text-lg font-semibold text-brand-ink">Mensagem de boas-vindas</h2>
                        <p class="mt-1 text-sm text-brand-gray">
                          Envie uma mensagem quando o cliente entrar em contato após um período sem conversa.
                        </p>
                      </div>
                      <FormSwitch
                        v-model="welcome.enabled"
                        label="Ativado"
                        description="Quando ligado, clientes elegíveis recebem a mensagem configurada."
                        class="sm:max-w-xs"
                      />
                    </div>

                    <MessageFieldMeta
                      id="welcome-message"
                      v-model="welcomeMessageDraft"
                      label="Mensagem"
                      layout="panel"
                      :error="welcomeFieldErrors.message ?? null"
                      placeholder="Olá! Obrigado por entrar em contato. Em breve nossa equipe responde."
                    />

                    <div class="rounded-lg border border-slate-200 bg-slate-50/60 p-4">
                      <label class="flex cursor-pointer items-start gap-3 text-sm text-brand-ink">
                        <input
                          v-model="welcomeUsesInactivity"
                          type="checkbox"
                          class="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-indigo focus:ring-brand-indigo"
                        />
                        <span>
                          <span class="font-medium">Reenviar após inatividade</span>
                          <span class="mt-0.5 block text-xs text-brand-gray">
                            Se desligado, a boas-vindas é enviada apenas na primeira mensagem da conversa.
                          </span>
                        </span>
                      </label>
                      <div
                        v-if="welcomeUsesInactivity"
                        class="mt-4 flex flex-wrap items-center gap-2 sm:pl-7"
                      >
                        <label class="text-sm font-medium text-brand-ink" for="welcome-inactivity">
                          Horas de inatividade:
                        </label>
                        <input
                          id="welcome-inactivity"
                          v-model.number="welcome.inactivity_hours"
                          type="number"
                          min="1"
                          max="720"
                          step="1"
                          class="w-20 rounded-lg border border-slate-200 px-3 py-2 text-sm text-brand-ink focus:border-brand-indigo focus:outline-none focus:ring-2 focus:ring-brand-indigo/20"
                          :class="welcomeFieldErrors.inactivity_hours ? 'border-red-300' : ''"
                        />
                        <span class="text-sm text-brand-gray">horas</span>
                      </div>
                      <p v-if="welcomeFieldErrors.inactivity_hours" class="mt-2 text-xs text-red-600 sm:pl-7">
                        {{ welcomeFieldErrors.inactivity_hours }}
                      </p>
                    </div>

                    <p v-if="welcomeFormError" class="text-sm text-red-600" role="alert">
                      {{ welcomeFormError }}
                    </p>
                  </div>

                  <div
                    class="mt-auto flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                  >
                    <p
                      v-if="welcomeSuccess"
                      class="inline-flex items-center gap-2 text-sm text-emerald-700"
                      role="status"
                    >
                      <Check class="h-4 w-4 shrink-0" aria-hidden="true" />
                      {{ welcomeSuccess }}
                    </p>
                    <span v-else class="hidden text-sm text-brand-gray sm:inline" aria-hidden="true" />
                    <div class="flex flex-wrap justify-end gap-2 sm:ml-auto">
                      <UiButton type="button" variant="secondary" @click="onCancelWelcome">
                        Cancelar
                      </UiButton>
                      <UiButton type="submit" :disabled="welcomeSaving">
                        <Loader2
                          v-if="welcomeSaving"
                          class="h-4 w-4 animate-spin"
                          aria-hidden="true"
                        />
                        {{ welcomeSaving ? 'Salvando…' : 'Salvar boas-vindas' }}
                      </UiButton>
                    </div>
                  </div>
                </form>
              </section>

              <section v-show="activeSection === 'out-of-hours'" class="flex h-full flex-col">
                <div
                  v-if="outOfHoursLoading"
                  class="flex flex-1 items-center justify-center gap-2 px-6 py-16 text-sm text-brand-gray"
                >
                  <Loader2 class="h-5 w-5 animate-spin" aria-hidden="true" />
                  Carregando…
                </div>
                <div v-else-if="outOfHoursLoadError" class="px-6 py-8">
                  <p class="text-sm text-red-600" role="alert">{{ outOfHoursLoadError }}</p>
                  <UiButton variant="secondary" class="mt-4" @click="loadOutOfHours">
                    Tentar novamente
                  </UiButton>
                </div>
                <form v-else class="flex min-h-0 flex-1 flex-col" @submit.prevent="onSaveOutOfHours">
                  <div class="space-y-6 px-5 py-6 sm:px-6">
                    <div
                      class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
                    >
                      <div>
                        <h2 class="text-lg font-semibold text-brand-ink">Fora do horário</h2>
                        <p class="mt-1 text-sm text-brand-gray">
                          Responda automaticamente quando a mensagem chegar fora do expediente configurado.
                        </p>
                      </div>
                      <FormSwitch
                        v-model="outOfHours.enabled"
                        label="Ativado"
                        description="Mensagens recebidas fora do expediente disparam a resposta automática."
                        class="sm:max-w-xs"
                      />
                    </div>

                    <div class="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label class="text-sm font-medium text-brand-ink" for="ooh-timezone">
                          Fuso horário
                        </label>
                        <select
                          id="ooh-timezone"
                          v-model="outOfHours.timezone"
                          class="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-brand-ink focus:border-brand-indigo focus:outline-none focus:ring-2 focus:ring-brand-indigo/20"
                        >
                          <option v-for="tz in timezoneOptions" :key="tz" :value="tz">
                            {{ formatTimezoneLabel(tz) }}
                          </option>
                        </select>
                        <p v-if="outOfHoursFieldErrors.timezone" class="mt-1 text-xs text-red-600">
                          {{ outOfHoursFieldErrors.timezone }}
                        </p>
                      </div>
                      <div>
                        <label class="text-sm font-medium text-brand-ink" for="ooh-cooldown">
                          Intervalo mínimo (minutos)
                        </label>
                        <UiInput
                          id="ooh-cooldown"
                          :model-value="String(outOfHours.cooldown_minutes ?? '')"
                          type="number"
                          inputmode="numeric"
                          class="mt-1.5"
                          :invalid="Boolean(outOfHoursFieldErrors.cooldown_minutes)"
                          @update:model-value="
                            outOfHours.cooldown_minutes =
                              $event === '' ? 0 : Number.parseInt($event, 10)
                          "
                        />
                        <p class="mt-1 text-xs text-brand-gray">
                          Entre 5 e 1440 minutos entre respostas automáticas na mesma conversa.
                        </p>
                        <p v-if="outOfHoursFieldErrors.cooldown_minutes" class="mt-1 text-xs text-red-600">
                          {{ outOfHoursFieldErrors.cooldown_minutes }}
                        </p>
                      </div>
                    </div>

                    <MessageFieldMeta
                      id="ooh-message"
                      v-model="outOfHoursMessageDraft"
                      label="Mensagem"
                      layout="panel"
                      :error="outOfHoursFieldErrors.message ?? null"
                      placeholder="Recebemos sua mensagem fora do nosso horário. Retornaremos em breve."
                    />

                    <div>
                      <p class="text-sm font-medium text-brand-ink">Horário por dia da semana</p>
                      <p class="mt-1 text-xs text-brand-gray">
                        Defina o expediente em que a equipe está disponível. Fora desses intervalos, a resposta
                        automática pode ser enviada.
                      </p>
                      <p v-if="outOfHoursFieldErrors.business_hours" class="mt-2 text-xs text-red-600">
                        {{ outOfHoursFieldErrors.business_hours }}
                      </p>
                      <ul class="mt-4 space-y-3">
                        <li
                          v-for="slot in outOfHours.business_hours"
                          :key="slot.day_of_week"
                          class="flex flex-col gap-3 rounded-lg border border-slate-100 bg-slate-50/60 p-3 sm:flex-row sm:items-center"
                        >
                          <label
                            class="flex min-w-[7rem] items-center gap-2 text-sm font-medium text-brand-ink sm:w-36"
                          >
                            <input
                              type="checkbox"
                              class="h-4 w-4 rounded border-slate-300 text-brand-indigo focus:ring-brand-indigo"
                              :checked="!slot.is_closed"
                              @change="setBusinessDayOpen(slot, ($event.target as HTMLInputElement).checked)"
                            />
                            {{ weekdayLabels[slot.day_of_week] }}
                          </label>
                          <div class="flex flex-1 flex-wrap items-center gap-2">
                            <input
                              v-model="slot.opens_at"
                              type="time"
                              class="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-brand-ink disabled:opacity-50"
                              :disabled="slot.is_closed"
                              :aria-label="`${weekdayLabels[slot.day_of_week]}, horário de abertura`"
                            />
                            <span class="text-xs text-brand-gray">até</span>
                            <input
                              v-model="slot.closes_at"
                              type="time"
                              class="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-brand-ink disabled:opacity-50"
                              :disabled="slot.is_closed"
                              :aria-label="`${weekdayLabels[slot.day_of_week]}, horário de fechamento`"
                            />
                          </div>
                        </li>
                      </ul>
                    </div>

                    <p v-if="outOfHoursFormError" class="text-sm text-red-600" role="alert">
                      {{ outOfHoursFormError }}
                    </p>
                  </div>

                  <div
                    class="mt-auto flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                  >
                    <p
                      v-if="outOfHoursSuccess"
                      class="inline-flex items-center gap-2 text-sm text-emerald-700"
                      role="status"
                    >
                      <Check class="h-4 w-4 shrink-0" aria-hidden="true" />
                      {{ outOfHoursSuccess }}
                    </p>
                    <span v-else class="hidden text-sm text-brand-gray sm:inline" aria-hidden="true" />
                    <div class="flex flex-wrap justify-end gap-2 sm:ml-auto">
                      <UiButton type="button" variant="secondary" @click="onCancelOutOfHours">
                        Cancelar
                      </UiButton>
                      <UiButton type="submit" :disabled="outOfHoursSaving">
                        <Loader2
                          v-if="outOfHoursSaving"
                          class="h-4 w-4 animate-spin"
                          aria-hidden="true"
                        />
                        {{ outOfHoursSaving ? 'Salvando…' : 'Salvar fora do horário' }}
                      </UiButton>
                    </div>
                  </div>
                </form>
              </section>

              <section v-show="activeSection === 'keywords'" class="px-5 py-6 sm:px-6">
                <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 class="text-lg font-semibold text-brand-ink">Palavras-chave</h2>
                    <p class="mt-1 text-sm text-brand-gray">
                      Crie respostas automáticas quando a mensagem do cliente corresponder a uma palavra ou frase.
                    </p>
                  </div>
                  <UiButton class="w-full shrink-0 sm:w-auto" @click="openCreateRule">
                    <Plus class="h-4 w-4" aria-hidden="true" />
                    Nova regra
                  </UiButton>
                </div>

                <p v-if="keywordsActionError" class="mt-4 text-sm text-red-600" role="alert">
                  {{ keywordsActionError }}
                </p>
                <p v-if="keywordsSuccess" class="mt-4 text-sm text-emerald-700" role="status">
                  {{ keywordsSuccess }}
                </p>

                <div
                  v-if="keywordsLoading"
                  class="mt-6 flex items-center justify-center gap-2 rounded-lg border border-slate-200 py-16 text-sm text-brand-gray"
                >
                  <Loader2 class="h-5 w-5 animate-spin" aria-hidden="true" />
                  Carregando regras…
                </div>
                <div
                  v-else-if="keywordsLoadError"
                  class="mt-6 rounded-lg border border-slate-200 px-6 py-8"
                >
                  <p class="text-sm text-red-600" role="alert">{{ keywordsLoadError }}</p>
                  <UiButton variant="secondary" class="mt-4" @click="loadKeywordRules">
                    Tentar novamente
                  </UiButton>
                </div>
                <div
                  v-else-if="sortedKeywordRules.length === 0"
                  class="mt-6 rounded-lg border border-dashed border-slate-200 px-6 py-12 text-center"
                >
                  <p class="font-medium text-brand-ink">Nenhuma regra cadastrada</p>
                  <p class="mt-1 text-sm text-brand-gray">
                    Adicione palavras-chave para responder perguntas frequentes.
                  </p>
                </div>
                <ul v-else class="mt-6 space-y-3">
                  <li
                    v-for="rule in sortedKeywordRules"
                    :key="rule.id"
                    class="rounded-lg border border-slate-200 p-4 sm:p-5"
                  >
                    <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div class="min-w-0 flex-1">
                        <div class="flex flex-wrap items-center gap-2">
                          <p class="font-semibold text-brand-ink">{{ rule.keyword }}</p>
                          <UiBadge :variant="rule.is_active ? 'success' : 'neutral'" size="md">
                            {{ rule.is_active ? 'Ativa' : 'Inativa' }}
                          </UiBadge>
                          <UiBadge variant="primary" size="sm">
                            {{ rule.match_type === 'exact' ? 'Texto exato' : 'Contém' }}
                          </UiBadge>
                          <span class="text-xs font-medium text-brand-gray">
                            Prioridade {{ rule.priority }}
                          </span>
                        </div>
                        <p class="mt-2 line-clamp-3 text-sm text-brand-gray">{{ rule.response_body }}</p>
                      </div>
                      <div class="flex flex-wrap gap-2 sm:shrink-0">
                        <UiButton variant="secondary" size="sm" @click="toggleRuleActive(rule)">
                          {{ rule.is_active ? 'Desativar' : 'Ativar' }}
                        </UiButton>
                        <UiButton variant="secondary" size="sm" @click="openEditRule(rule)">
                          Editar
                        </UiButton>
                        <UiButton variant="danger" size="sm" @click="openDeleteRule(rule)">
                          Excluir
                        </UiButton>
                      </div>
                    </div>
                  </li>
                </ul>
              </section>
            </div>
          </UiCard>

          <p class="text-xs text-brand-gray">
            As mensagens respeitam o limite da API e podem usar formatação simples (*negrito*, _itálico_).
          </p>

          <AppPageFooter />
        </div>
      </div>
    </div>

    <KeywordRuleFormModal
      :open="ruleModalOpen"
      :initial="editingRule"
      :saving="ruleModalSaving"
      :server-errors="ruleModalErrors"
      @close="ruleModalOpen = false"
      @submit="onRuleSubmit"
    />

    <KeywordRuleDeleteDialog
      :open="deleteDialogOpen"
      :keyword="deleteTarget?.keyword"
      :loading="deleteLoading"
      @close="deleteDialogOpen = false"
      @confirm="onConfirmDeleteRule"
    />
  </AppPageShell>
</template>
