<script setup lang="ts">
import {
  Check,
  CheckCircle2,
  Copy,
  Loader2,
  RefreshCw,
  Unlink,
  RefreshCcw,
} from '@lucide/vue'
import { computed, onMounted, ref } from 'vue'

import { fetchCsrfCookie } from '@/api/auth'
import { syncMessageTemplates } from '@/api/messageTemplates'
import {
  connectWhatsAppAccount,
  disconnectWhatsAppAccount,
  fetchWhatsAppAccount,
} from '@/api/whatsapp'
import WhatsAppDisconnectDialog from '@/components/whatsapp/WhatsAppDisconnectDialog.vue'
import WhatsAppPinModal from '@/components/whatsapp/WhatsAppPinModal.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiCard from '@/components/ui/UiCard.vue'
import { useWhatsAppEmbeddedSignup } from '@/composables/useWhatsAppEmbeddedSignup'
import { useWhatsAppStore } from '@/stores/whatsapp'
import type { ConnectWhatsAppPayload, WhatsAppAccount } from '@/types/whatsapp'
import { formatDateTime } from '@/utils/datetime'
import { getErrorMessage } from '@/utils/errors'
import { formatBrazilPhone } from '@/utils/phone'
import {
  formatAccountStatus,
  formatQualityRatingDisplay,
  getWhatsAppConnectError,
  maskWhatsAppIdentifier,
} from '@/utils/whatsapp'

const whatsappStore = useWhatsAppStore()
const account = ref<WhatsAppAccount | null>(null)
const loading = ref(true)
const loadError = ref<string | null>(null)
const actionError = ref<string | null>(null)
const actionNotice = ref<string | null>(null)

const pinModalOpen = ref(false)
const pinError = ref<string | null>(null)
const connecting = ref(false)
const disconnectDialogOpen = ref(false)
const disconnecting = ref(false)
const refreshingStatus = ref(false)
const syncingTemplates = ref(false)

const copiedField = ref<string | null>(null)

const pendingConnect = ref<ConnectWhatsAppPayload | null>(null)

const { launching, lastError: signupError, launchEmbeddedSignup } = useWhatsAppEmbeddedSignup()

const isConnected = computed(() => account.value?.connected === true)

const qualityDisplay = computed(() => formatQualityRatingDisplay(account.value?.quality_rating))

const formattedPhone = computed(() => {
  const raw = account.value?.display_phone_number
  if (!raw) {
    return '—'
  }
  return formatBrazilPhone(raw) || raw
})

const tokenExpiryNotice = computed(() => {
  const expiresAt = account.value?.token_expires_at
  if (!expiresAt || !isConnected.value) {
    return null
  }
  const expiresMs = Date.parse(expiresAt)
  if (Number.isNaN(expiresMs)) {
    return null
  }
  const formatted = formatDateTime(expiresAt)
  if (expiresMs <= Date.now()) {
    return `O token de acesso expirou em ${formatted}. Reconecte o canal para restaurar o envio.`
  }
  const daysLeft = Math.ceil((expiresMs - Date.now()) / (1000 * 60 * 60 * 24))
  if (daysLeft <= 14) {
    return `O token de acesso expira em ${formatted} (${daysLeft} dia(s)). Planeje a reconexão para evitar interrupções.`
  }
  return null
})

const qualityDotClass = computed(() => {
  const tone = qualityDisplay.value.tone
  if (tone === 'green') return 'bg-emerald-500'
  if (tone === 'yellow') return 'bg-amber-500'
  if (tone === 'red') return 'bg-red-500'
  return 'bg-slate-300'
})

async function loadAccount(): Promise<void> {
  loading.value = true
  loadError.value = null
  try {
    account.value = await fetchWhatsAppAccount()
    whatsappStore.setAccount(account.value)
  } catch (error) {
    loadError.value = getErrorMessage(error)
    account.value = null
    whatsappStore.setAccount(null)
  } finally {
    loading.value = false
  }
}

async function onRefreshStatus(): Promise<void> {
  refreshingStatus.value = true
  actionError.value = null
  actionNotice.value = null
  try {
    account.value = await fetchWhatsAppAccount()
    whatsappStore.setAccount(account.value)
    actionNotice.value = 'Status do canal atualizado.'
  } catch (error) {
    actionError.value = getErrorMessage(error)
  } finally {
    refreshingStatus.value = false
  }
}

async function onSyncTemplates(): Promise<void> {
  if (!isConnected.value) {
    return
  }
  syncingTemplates.value = true
  actionError.value = null
  actionNotice.value = null
  try {
    await fetchCsrfCookie()
    const result = await syncMessageTemplates()
    const count = result.synced ?? 0
    actionNotice.value =
      count > 0
        ? `${count} modelo(s) sincronizado(s) com a Meta.`
        : 'Nenhum modelo novo para sincronizar.'
  } catch (error) {
    actionError.value = getErrorMessage(error)
  } finally {
    syncingTemplates.value = false
  }
}

async function copyIdentifier(fieldKey: string, value: string | null | undefined): Promise<void> {
  const trimmed = value?.trim()
  if (!trimmed) {
    return
  }
  try {
    await navigator.clipboard.writeText(trimmed)
    copiedField.value = fieldKey
    window.setTimeout(() => {
      if (copiedField.value === fieldKey) {
        copiedField.value = null
      }
    }, 2000)
  } catch {
    actionError.value = 'Não foi possível copiar para a área de transferência.'
  }
}

async function onConnectClick(): Promise<void> {
  actionError.value = null
  actionNotice.value = null

  const signup = await launchEmbeddedSignup()
  if (!signup) {
    if (signupError.value) {
      actionError.value = signupError.value
    }
    return
  }

  pendingConnect.value = {
    code: signup.code,
    waba_id: signup.waba_id,
    phone_number_id: signup.phone_number_id,
    pin: '',
  }
  pinError.value = null
  pinModalOpen.value = true
}

async function onPinSubmit(pin: string): Promise<void> {
  if (!pendingConnect.value) {
    return
  }

  connecting.value = true
  pinError.value = null

  try {
    await fetchCsrfCookie()
    const payload: ConnectWhatsAppPayload = {
      ...pendingConnect.value,
      pin,
    }
    account.value = await connectWhatsAppAccount(payload)
    whatsappStore.setAccount(account.value)
    pinModalOpen.value = false
    pendingConnect.value = null
    actionNotice.value = 'WhatsApp conectado com sucesso.'
  } catch (error) {
    pinError.value = getWhatsAppConnectError(error)
  } finally {
    connecting.value = false
  }
}

function closePinModal(): void {
  if (connecting.value) {
    return
  }
  pinModalOpen.value = false
  pendingConnect.value = null
  pinError.value = null
}

async function onDisconnectConfirm(): Promise<void> {
  disconnecting.value = true
  actionError.value = null
  actionNotice.value = null
  try {
    await fetchCsrfCookie()
    await disconnectWhatsAppAccount()
    account.value = null
    whatsappStore.setAccount(null)
    disconnectDialogOpen.value = false
  } catch (error) {
    actionError.value = getErrorMessage(error)
  } finally {
    disconnecting.value = false
  }
}

onMounted(() => {
  void loadAccount()
})
</script>

<template>
  <div class="space-y-6">
    <header>
      <h2 class="text-xl font-semibold text-brand-ink">WhatsApp Business</h2>
      <p class="mt-2 max-w-3xl text-sm text-brand-gray">
        Gerencie a conexão com a API oficial da Meta, acompanhe a qualidade do canal e mantenha
        modelos e webhooks alinhados ao painel.
      </p>
    </header>

    <div v-if="loading" class="space-y-4">
      <div class="h-48 animate-pulse rounded-lg border border-slate-200 bg-white" />
      <div class="h-40 animate-pulse rounded-lg border border-slate-200 bg-white" />
    </div>

    <div
      v-else-if="loadError"
      class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
      role="alert"
    >
      {{ loadError }}
      <button type="button" class="ml-2 font-semibold underline" @click="loadAccount()">
        Tentar novamente
      </button>
    </div>

    <template v-else>
      <p
        v-if="tokenExpiryNotice"
        class="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
        role="status"
      >
        {{ tokenExpiryNotice }}
      </p>

      <p
        v-if="actionNotice"
        class="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
        role="status"
      >
        {{ actionNotice }}
      </p>
      <p v-if="actionError" class="text-sm text-red-600" role="alert">{{ actionError }}</p>

      <UiCard padding="none" class="overflow-hidden">
        <div class="border-b border-slate-100 px-5 py-5 sm:px-6">
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div class="min-w-0">
              <h3 class="text-lg font-semibold text-brand-ink">Canal de WhatsApp oficial</h3>
              <p class="mt-1 text-sm text-brand-gray">
                Parâmetros operacionais e chave de comunicação direta com a Cloud API.
              </p>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <UiBadge :variant="isConnected ? 'success' : 'neutral'" size="md">
                <CheckCircle2 v-if="isConnected" class="mr-1 h-3.5 w-3.5" aria-hidden="true" />
                {{ isConnected ? 'Conectado' : 'Não conectado' }}
              </UiBadge>
              <UiBadge variant="neutral" size="md">API Oficial Cloud da Meta</UiBadge>
            </div>
          </div>
        </div>

        <div class="px-5 py-6 sm:px-6">
          <template v-if="isConnected && account">
            <dl class="grid gap-5 sm:grid-cols-2">
              <div>
                <dt class="text-xs font-medium text-brand-gray">Número conectado</dt>
                <dd class="mt-1.5 flex flex-wrap items-center gap-2">
                  <span class="text-sm font-semibold text-brand-ink">{{ formattedPhone }}</span>
                  <UiBadge v-if="account.verified_name" variant="success" size="sm">
                    <Check class="mr-0.5 h-3 w-3" aria-hidden="true" />
                    Verificado
                  </UiBadge>
                </dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-brand-gray">Nome de exibição no WhatsApp</dt>
                <dd class="mt-1.5 text-sm text-brand-ink">{{ account.verified_name ?? '—' }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-brand-gray">
                  Identificador do número (Phone Number ID)
                </dt>
                <dd class="mt-1.5 flex items-center gap-2">
                  <span class="font-mono text-sm text-brand-ink">
                    {{ maskWhatsAppIdentifier(account.phone_number_id) }}
                  </span>
                  <button
                    type="button"
                    class="inline-flex rounded-md p-1 text-brand-gray hover:bg-slate-100 hover:text-brand-indigo"
                    :aria-label="
                      copiedField === 'phone_number_id'
                        ? 'Copiado'
                        : 'Copiar Phone Number ID'
                    "
                    :disabled="!account.phone_number_id"
                    @click="copyIdentifier('phone_number_id', account.phone_number_id)"
                  >
                    <Copy class="h-4 w-4" aria-hidden="true" />
                  </button>
                </dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-brand-gray">ID da conta comercial (WABA ID)</dt>
                <dd class="mt-1.5 flex items-center gap-2">
                  <span class="font-mono text-sm text-brand-ink">
                    {{ maskWhatsAppIdentifier(account.waba_id) }}
                  </span>
                  <button
                    type="button"
                    class="inline-flex rounded-md p-1 text-brand-gray hover:bg-slate-100 hover:text-brand-indigo"
                    :aria-label="
                      copiedField === 'waba_id' ? 'Copiado' : 'Copiar WABA ID'
                    "
                    :disabled="!account.waba_id"
                    @click="copyIdentifier('waba_id', account.waba_id)"
                  >
                    <Copy class="h-4 w-4" aria-hidden="true" />
                  </button>
                </dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-brand-gray">Qualidade do canal</dt>
                <dd class="mt-1.5 flex items-center gap-2 text-sm text-brand-ink">
                  <span
                    class="h-2 w-2 shrink-0 rounded-full"
                    :class="qualityDotClass"
                    aria-hidden="true"
                  />
                  {{ qualityDisplay.label }}
                </dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-brand-gray">Limite de mensagens</dt>
                <dd class="mt-1.5 text-sm text-brand-ink">—</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-brand-gray">Status do número</dt>
                <dd class="mt-1.5 text-sm text-brand-ink">
                  {{ formatAccountStatus(account.status) }}
                </dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-brand-gray">Conectado em</dt>
                <dd class="mt-1.5 text-sm text-brand-ink">
                  {{ formatDateTime(account.connected_at) }}
                </dd>
              </div>
            </dl>
          </template>

          <template v-else>
            <p class="text-sm text-brand-gray">
              Nenhum número vinculado. Use o cadastro incorporado da Meta para conectar sua conta do
              WhatsApp Business de forma segura.
            </p>
            <UiButton type="button" class="mt-6" :disabled="launching" @click="onConnectClick()">
              <Loader2 v-if="launching" class="h-4 w-4 animate-spin" aria-hidden="true" />
              Conectar WhatsApp
            </UiButton>
          </template>
        </div>

        <div
          v-if="isConnected"
          class="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
        >
          <UiButton
            type="button"
            variant="ghost"
            class="justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
            @click="disconnectDialogOpen = true"
          >
            <Unlink class="h-4 w-4" aria-hidden="true" />
            Desconectar canal
          </UiButton>
          <div class="flex flex-wrap gap-2 sm:justify-end">
            <UiButton
              type="button"
              variant="outline"
              size="sm"
              :disabled="refreshingStatus"
              @click="onRefreshStatus()"
            >
              <Loader2 v-if="refreshingStatus" class="h-4 w-4 animate-spin" aria-hidden="true" />
              <RefreshCw v-else class="h-4 w-4" aria-hidden="true" />
              Atualizar status
            </UiButton>
            <UiButton
              type="button"
              variant="outline"
              size="sm"
              :disabled="syncingTemplates"
              @click="onSyncTemplates()"
            >
              <Loader2 v-if="syncingTemplates" class="h-4 w-4 animate-spin" aria-hidden="true" />
              <RefreshCcw v-else class="h-4 w-4" aria-hidden="true" />
              Sincronizar templates
            </UiButton>
          </div>
        </div>
      </UiCard>

      <UiCard padding="lg">
        <h3 class="text-lg font-semibold text-brand-ink">Dados da conta Meta</h3>
        <p class="mt-1 text-sm text-brand-gray">
          Informações vinculadas ao Gerenciador de Negócios da Meta.
        </p>

        <dl class="mt-6 grid gap-5 sm:grid-cols-2">
          <div>
            <dt class="text-xs font-medium text-brand-gray">Nome da conta comercial</dt>
            <dd class="mt-1.5 text-sm text-brand-ink">—</dd>
          </div>
          <div>
            <dt class="text-xs font-medium text-brand-gray">ID do Gerenciador de Negócios</dt>
            <dd class="mt-1.5 text-sm font-mono text-brand-ink">—</dd>
          </div>
          <div>
            <dt class="text-xs font-medium text-brand-gray">Verificação da empresa</dt>
            <dd class="mt-1.5">
              <span class="text-sm text-brand-ink">—</span>
            </dd>
          </div>
          <div>
            <dt class="text-xs font-medium text-brand-gray">Webhook de mensagens</dt>
            <dd class="mt-1.5 text-sm text-brand-ink">—</dd>
          </div>
        </dl>
        <p v-if="!isConnected" class="mt-4 text-xs text-brand-gray">
          Conecte o canal de WhatsApp para visualizar os dados operacionais disponíveis pela API.
        </p>
      </UiCard>
    </template>
  </div>

  <WhatsAppPinModal
    :open="pinModalOpen"
    :loading="connecting"
    :error="pinError"
    @close="closePinModal"
    @submit="onPinSubmit"
  />

  <WhatsAppDisconnectDialog
    :open="disconnectDialogOpen"
    :loading="disconnecting"
    @close="disconnectDialogOpen = false"
    @confirm="onDisconnectConfirm"
  />
</template>
