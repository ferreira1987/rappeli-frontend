<script setup lang="ts">
import { AlertTriangle, Clock, Loader2, Share2 } from '@lucide/vue'
import { ref } from 'vue'

import { fetchCsrfCookie } from '@/api/auth'
import { connectWhatsAppAccount } from '@/api/whatsapp'
import WhatsAppPinModal from '@/components/whatsapp/WhatsAppPinModal.vue'
import { UiButton } from '@/components/ui'
import { useWhatsAppEmbeddedSignup } from '@/composables/useWhatsAppEmbeddedSignup'
import type { ConnectWhatsAppPayload } from '@/types/whatsapp'
import { getErrorMessage } from '@/utils/errors'
import { getWhatsAppConnectError } from '@/utils/whatsapp'

withDefaults(
  defineProps<{
    layout?: 'default' | 'activation-v5'
  }>(),
  {
    layout: 'default',
  },
)

const { launching, lastError: signupError, launchEmbeddedSignup } = useWhatsAppEmbeddedSignup()

const actionError = ref<string | null>(null)
const pinModalOpen = ref(false)
const pinError = ref<string | null>(null)
const connecting = ref(false)
const pendingConnect = ref<ConnectWhatsAppPayload | null>(null)
const connected = ref(false)

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
    await connectWhatsAppAccount({ ...pendingConnect.value, pin })
    connected.value = true
    pinModalOpen.value = false
  } catch (error) {
    pinError.value = getWhatsAppConnectError(error) ?? getErrorMessage(error)
  } finally {
    connecting.value = false
  }
}
</script>

<template>
  <section
    v-if="layout === 'activation-v5'"
    class="relative rounded-xl border-2 border-[#4338CA] bg-white p-6"
  >
    <div class="mb-3 flex items-center justify-between gap-3">
      <span
        class="inline-flex items-center gap-1.5 rounded-full border border-[#C7C4D7] bg-[#EEF0FF] px-2.5 py-0.5 text-xs font-semibold text-[#4338CA]"
      >
        <span class="h-1.5 w-1.5 rounded-full bg-[#4338CA]" aria-hidden="true" />
        Passo 1 • Obrigatório
      </span>
      <span class="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
        <Clock class="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        ~2 min
      </span>
    </div>

    <div class="flex items-center gap-2">
      <div
        class="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EEF0FF] text-[#4338CA]"
      >
        <Share2 class="h-4 w-4" aria-hidden="true" />
      </div>
      <h2 class="text-base font-bold text-slate-900">Conecte seu número de WhatsApp</h2>
    </div>
    <p class="mt-2 text-sm leading-relaxed text-slate-600">
      A conexão é feita pela API oficial do WhatsApp, pelo cadastro incorporado da Meta. Você entra com sua
      conta do Facebook, escolhe ou cria sua conta empresarial e verifica o número.
    </p>

    <UiButton
      type="button"
      class="mt-4 w-full bg-[#4338CA] hover:bg-brand-indigo-hover sm:w-auto"
      size="lg"
      :disabled="launching || connecting || connected"
      @click="onConnectClick"
    >
      <Loader2 v-if="launching || connecting" class="h-4 w-4 animate-spin" aria-hidden="true" />
      <Share2 v-else class="h-4 w-4" aria-hidden="true" />
      {{ connected ? 'WhatsApp conectado' : 'Conectar com Facebook/Meta' }}
    </UiButton>

    <p v-if="actionError" class="mt-3 text-sm text-red-600" role="alert">{{ actionError }}</p>

    <div
      class="mt-4 flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-xs leading-relaxed text-amber-950"
      role="note"
    >
      <AlertTriangle class="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
      <p>
        O número não pode estar em uso no aplicativo WhatsApp ou WhatsApp Business no celular. Use um número
        dedicado à API oficial.
      </p>
    </div>

    <div class="mt-5 rounded-lg border border-slate-100 bg-slate-50 p-4">
      <p class="text-xs font-semibold text-slate-500">Como funciona o cadastro oficial</p>
      <ol class="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-3">
        <li class="rounded-lg bg-white px-3 py-2">
          <strong class="text-[#4338CA]">1.</strong> Login na Meta
        </li>
        <li class="rounded-lg bg-white px-3 py-2">
          <strong class="text-[#4338CA]">2.</strong> Conta empresarial
        </li>
        <li class="rounded-lg bg-white px-3 py-2">
          <strong class="text-[#4338CA]">3.</strong> Verificação do número
        </li>
      </ol>
    </div>

    <WhatsAppPinModal
      :open="pinModalOpen"
      :error="pinError"
      :loading="connecting"
      @close="pinModalOpen = false"
      @submit="onPinSubmit"
    />
  </section>

  <section v-else class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
    <div class="flex items-center gap-2">
      <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-mist text-brand-indigo">
        <Share2 class="h-5 w-5" aria-hidden="true" />
      </div>
      <h2 class="text-lg font-semibold text-brand-ink">Conecte seu número de WhatsApp</h2>
    </div>
    <p class="mt-3 text-sm text-brand-gray">
      A conexão é feita pela API oficial do WhatsApp, pelo cadastro incorporado da Meta. Você entra com sua
      conta do Facebook, escolhe ou cria sua conta empresarial e verifica o número.
    </p>

    <button
      type="button"
      class="mt-4 inline-flex h-11 items-center gap-2 rounded-lg bg-brand-indigo px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-indigo-hover disabled:opacity-60"
      :disabled="launching || connecting || connected"
      @click="onConnectClick"
    >
      <Loader2 v-if="launching || connecting" class="h-4 w-4 animate-spin" aria-hidden="true" />
      <Share2 v-else class="h-5 w-5" aria-hidden="true" />
      {{ connected ? 'WhatsApp conectado' : 'Conectar com Facebook/Meta' }}
    </button>

    <p v-if="actionError" class="mt-3 text-sm text-red-600" role="alert">{{ actionError }}</p>

    <div
      class="mt-4 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
      role="note"
    >
      <AlertTriangle class="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
      <p>
        O número não pode estar em uso no aplicativo WhatsApp ou WhatsApp Business no celular. Use um número
        dedicado à API oficial.
      </p>
    </div>

    <div class="mt-5 rounded-lg border border-slate-100 bg-slate-50 p-4">
      <p class="text-[11px] font-semibold uppercase tracking-wide text-brand-gray">
        Como funciona o cadastro oficial
      </p>
      <ol class="mt-3 grid gap-2 text-sm text-brand-gray sm:grid-cols-3">
        <li class="rounded-lg bg-white px-3 py-2"><strong class="text-brand-indigo">1.</strong> Login na Meta</li>
        <li class="rounded-lg bg-white px-3 py-2">
          <strong class="text-brand-indigo">2.</strong> Conta empresarial
        </li>
        <li class="rounded-lg bg-white px-3 py-2">
          <strong class="text-brand-indigo">3.</strong> Verificação do número
        </li>
      </ol>
    </div>

    <WhatsAppPinModal
      :open="pinModalOpen"
      :error="pinError"
      :loading="connecting"
      @close="pinModalOpen = false"
      @submit="onPinSubmit"
    />
  </section>
</template>
