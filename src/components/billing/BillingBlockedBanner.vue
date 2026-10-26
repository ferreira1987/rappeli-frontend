<script setup lang="ts">
import { AlertTriangle, X } from '@lucide/vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import { useBillingNoticeStore } from '@/stores/billingNotice'

const route = useRoute()
const notice = useBillingNoticeStore()

const visible = computed(
  () =>
    notice.blockedMessage != null ||
    route.query.bloqueio === '1' ||
    route.query.bloqueio === 'true',
)

const message = computed(
  () =>
    notice.blockedMessage ??
    'Seu acesso ao painel está bloqueado por pendência de pagamento. Regularize a assinatura para continuar.',
)

function dismiss(): void {
  notice.clearBlocked()
}
</script>

<template>
  <div
    v-if="visible"
    class="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
    role="alert"
  >
    <AlertTriangle class="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
    <p class="flex-1">{{ message }}</p>
    <button
      type="button"
      class="rounded-lg p-1 text-amber-700 hover:bg-amber-100/80"
      aria-label="Fechar aviso"
      @click="dismiss"
    >
      <X class="h-4 w-4" />
    </button>
  </div>
</template>
