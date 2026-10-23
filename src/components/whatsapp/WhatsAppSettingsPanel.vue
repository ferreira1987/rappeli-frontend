<script setup lang="ts">
import { CheckCircle2, Loader2, MessageCircle, Unplug } from '@lucide/vue'
import { computed, onMounted, ref } from 'vue'

import { fetchCsrfCookie } from '@/api/auth'
import {
  connectWhatsAppAccount,
  disconnectWhatsAppAccount,
  fetchWhatsAppAccount,
} from '@/api/whatsapp'
import WhatsAppDisconnectDialog from '@/components/whatsapp/WhatsAppDisconnectDialog.vue'
import WhatsAppPinModal from '@/components/whatsapp/WhatsAppPinModal.vue'
import { useWhatsAppEmbeddedSignup } from '@/composables/useWhatsAppEmbeddedSignup'
import type { ConnectWhatsAppPayload, WhatsAppAccount } from '@/types/whatsapp'
import { formatDateTime } from '@/utils/datetime'
import { getErrorMessage } from '@/utils/errors'
import { formatAccountStatus, formatQualityRating, getWhatsAppConnectError } from '@/utils/whatsapp'

const account = ref<WhatsAppAccount | null>(null)
const loading = ref(true)
const loadError = ref<string | null>(null)
const actionError = ref<string | null>(null)

const pinModalOpen = ref(false)
const pinError = ref<string | null>(null)
const connecting = ref(false)
const disconnectDialogOpen = ref(false)
const disconnecting = ref(false)

const pendingConnect = ref<ConnectWhatsAppPayload | null>(null)

const { launching, lastError: signupError, launchEmbeddedSignup } = useWhatsAppEmbeddedSignup()

const isConnected = computed(() => account.value?.connected === true)

async function loadAccount(): Promise<void> {
  loading.value = true
  loadError.value = null
  try {
    account.value = await fetchWhatsAppAccount()
  } catch (error) {
    loadError.value = getErrorMessage(error)
    account.value = null
  } finally {
    loading.value = false
  }
}

async function onConnectClick(): Promise<void> {
  actionError.value = null

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
    pinModalOpen.value = false
    pendingConnect.value = null
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
  try {
    await fetchCsrfCookie()
    await disconnectWhatsAppAccount()
    account.value = null
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
  <section class="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
    <div class="border-b border-slate-100 px-6 py-5">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div class="flex items-start gap-3">
          <div
            class="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-mist text-brand-indigo"
          >
            <MessageCircle class="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 class="font-display text-lg font-semibold text-brand-ink">WhatsApp Business</h2>
            <p class="mt-1 text-sm text-brand-gray">
              Conecte o número da sua empresa para atender clientes e enviar mensagens pelo painel.
            </p>
          </div>
        </div>
        <span
          class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
          :class="
            isConnected
              ? 'bg-emerald-50 text-emerald-800'
              : 'bg-slate-100 text-brand-gray'
          "
        >
          <CheckCircle2 v-if="isConnected" class="h-3.5 w-3.5" aria-hidden="true" />
          {{ isConnected ? 'Conectado' : 'Não conectado' }}
        </span>
      </div>
    </div>

    <div class="px-6 py-6">
      <div v-if="loading" class="flex items-center justify-center py-12">
        <Loader2 class="h-7 w-7 animate-spin text-brand-indigo" aria-label="Carregando" />
      </div>

      <div v-else-if="loadError" class="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
        <p>{{ loadError }}</p>
        <button
          type="button"
          class="mt-3 text-sm font-semibold text-red-800 underline"
          @click="loadAccount()"
        >
          Tentar novamente
        </button>
      </div>

      <template v-else-if="isConnected && account">
        <dl class="grid gap-4 sm:grid-cols-2">
          <div>
            <dt class="text-xs font-medium uppercase tracking-wide text-brand-gray">Número</dt>
            <dd class="mt-1 text-sm font-semibold text-brand-ink">
              {{ account.display_phone_number ?? '—' }}
            </dd>
          </div>
          <div>
            <dt class="text-xs font-medium uppercase tracking-wide text-brand-gray">Nome verificado</dt>
            <dd class="mt-1 text-sm text-brand-ink">{{ account.verified_name ?? '—' }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium uppercase tracking-wide text-brand-gray">Qualidade</dt>
            <dd class="mt-1 text-sm text-brand-ink">
              {{ formatQualityRating(account.quality_rating) }}
            </dd>
          </div>
          <div>
            <dt class="text-xs font-medium uppercase tracking-wide text-brand-gray">Status</dt>
            <dd class="mt-1 text-sm text-brand-ink">{{ formatAccountStatus(account.status) }}</dd>
          </div>
          <div class="sm:col-span-2">
            <dt class="text-xs font-medium uppercase tracking-wide text-brand-gray">Conectado em</dt>
            <dd class="mt-1 text-sm text-brand-ink">
              {{ formatDateTime(account.connected_at) }}
            </dd>
          </div>
        </dl>

        <button
          type="button"
          class="mt-8 inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50"
          @click="disconnectDialogOpen = true"
        >
          <Unplug class="h-4 w-4" aria-hidden="true" />
          Desconectar
        </button>
      </template>

      <template v-else>
        <p class="text-sm text-brand-gray">
          Nenhum número vinculado. Use o cadastro incorporado da Meta para conectar sua conta do
          WhatsApp Business de forma segura.
        </p>
        <button
          type="button"
          class="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-indigo px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-indigo-hover disabled:opacity-60"
          :disabled="launching"
          @click="onConnectClick()"
        >
          <Loader2 v-if="launching" class="h-4 w-4 animate-spin" aria-hidden="true" />
          Conectar WhatsApp
        </button>
      </template>

      <p v-if="actionError" class="mt-4 text-sm text-red-600" role="alert">{{ actionError }}</p>
    </div>
  </section>

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
