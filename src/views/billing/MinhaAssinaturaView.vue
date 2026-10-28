<script setup lang="ts">
import { CreditCard, Loader2, RefreshCw } from '@lucide/vue'
import { onMounted, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'

import {
  cancelSubscription,
  fetchSubscription,
  fetchSubscriptionPayments,
  updateSubscriptionCard,
} from '@/api/subscription'
import AppConfirmModal from '@/components/app/AppConfirmModal.vue'
import AppPageHeader from '@/components/app/AppPageHeader.vue'
import BillingBlockedBanner from '@/components/billing/BillingBlockedBanner.vue'
import BillingCheckoutForms from '@/components/billing/BillingCheckoutForms.vue'
import AppPageFooter from '@/components/layout/AppPageFooter.vue'
import { panelBreadcrumbs } from '@/constants/panelBreadcrumbs'
import { useAuthStore } from '@/stores/auth'
import type { BillingPayment, Subscription } from '@/types/billing'
import {
  billingCycleLabel,
  formatBillingCurrency,
  formatBillingDate,
  paymentStatusLabel,
  subscriptionStatusLabel,
} from '@/utils/billingFormat'
import { emptyCheckoutForms, validateCheckoutForms } from '@/utils/billingCheckoutValidation'
import { getErrorMessage, getValidationErrors } from '@/utils/errors'

const auth = useAuthStore()

const loading = ref(true)
const subscription = ref<Subscription | null>(null)
const payments = ref<BillingPayment[]>([])
const pageError = ref<string | null>(null)
const actionError = ref<string | null>(null)
const actionMessage = ref<string | null>(null)

const cancelLoading = ref(false)
const cancelConfirmOpen = ref(false)
const cardFormOpen = ref(false)
const cardSubmitting = ref(false)
const cardFieldErrors = ref<Record<string, string>>({})
const cardForms = reactive(emptyCheckoutForms())

onMounted(() => {
  void load()
})

async function load(): Promise<void> {
  loading.value = true
  pageError.value = null
  try {
    subscription.value = await fetchSubscription()
    payments.value = await fetchSubscriptionPayments()
  } catch (error) {
    pageError.value = getErrorMessage(error)
  } finally {
    loading.value = false
  }
}

function openCardForm(): void {
  cardFormOpen.value = true
  cardFieldErrors.value = {}
  actionError.value = null
  const base = emptyCheckoutForms()
  cardForms.holder = {
    ...base.holder,
    name: auth.user?.name ?? '',
    email: auth.user?.email ?? '',
  }
  cardForms.creditCard = base.creditCard
}

function clearCardSensitive(): void {
  cardForms.creditCard.number = ''
  cardForms.creditCard.cvv = ''
  cardForms.creditCard.expiry_month = ''
  cardForms.creditCard.expiry_year = ''
}

async function submitCardUpdate(): Promise<void> {
  cardFieldErrors.value = validateCheckoutForms(cardForms.holder, cardForms.creditCard)
  if (Object.keys(cardFieldErrors.value).length > 0) {
    return
  }

  cardSubmitting.value = true
  actionError.value = null
  try {
    subscription.value = await updateSubscriptionCard({
      holder: { ...cardForms.holder },
      credit_card: { ...cardForms.creditCard },
    })
    actionMessage.value = 'Cartão atualizado com sucesso.'
    cardFormOpen.value = false
  } catch (error) {
    const validation = getValidationErrors(error)
    if (validation) {
      cardFieldErrors.value = validation
      return
    }
    actionError.value = getErrorMessage(error)
  } finally {
    cardSubmitting.value = false
    clearCardSensitive()
  }
}

async function onCancel(): Promise<void> {
  if (!subscription.value || subscription.value.status === 'CANCELED') {
    return
  }

  cancelLoading.value = true
  actionError.value = null
  actionMessage.value = null
  try {
    subscription.value = await cancelSubscription()
    actionMessage.value = 'Assinatura cancelada. Você pode assinar novamente quando quiser.'
    payments.value = await fetchSubscriptionPayments()
    cancelConfirmOpen.value = false
  } catch (error) {
    actionError.value = getErrorMessage(error)
  } finally {
    cancelLoading.value = false
  }
}

function requestCancel(): void {
  cancelConfirmOpen.value = true
}

function maskedCard(sub: Subscription): string {
  const digits = sub.payment_method.last_digits
  const brand = sub.payment_method.brand
  if (!digits) {
    return 'Cartão cadastrado'
  }
  const label = brand ?? 'Cartão'
  return `${label} •••• ${digits}`
}
</script>

<template>
  <div class="flex min-h-full flex-col bg-brand-mist">
    <AppPageHeader
      title="Minha assinatura"
      subtitle="Plano, pagamentos e forma de cobrança."
      :breadcrumbs="panelBreadcrumbs({ label: 'Minha assinatura' })"
    >
      <template #actions>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-brand-ink hover:bg-slate-50 disabled:opacity-60"
          :disabled="loading"
          @click="load"
        >
          <RefreshCw class="h-4 w-4 text-brand-gray" :class="loading ? 'animate-spin' : ''" aria-hidden="true" />
          Atualizar
        </button>
      </template>
    </AppPageHeader>

    <div class="flex-1 px-4 py-6 sm:px-6 lg:px-8">
    <BillingBlockedBanner class="mb-6" />

    <p v-if="loading" class="text-sm text-brand-gray">Carregando…</p>
    <p
      v-else-if="pageError"
      class="mt-10 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
    >
      {{ pageError }}
    </p>

    <template v-else>
      <p
        v-if="actionMessage"
        class="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
      >
        {{ actionMessage }}
      </p>
      <p
        v-if="actionError"
        class="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
      >
        {{ actionError }}
      </p>

      <div
        v-if="!subscription"
        class="mt-8 rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-sm"
      >
        <h2 class="font-display text-lg font-semibold text-brand-ink">Nenhuma assinatura ativa</h2>
        <p class="mt-2 text-sm text-brand-gray">
          Escolha um plano para começar a usar o painel sem interrupções.
        </p>
        <RouterLink
          :to="{ name: 'assinatura-planos' }"
          class="mt-6 inline-flex rounded-xl bg-brand-indigo px-5 py-2.5 text-sm font-semibold text-white"
        >
          Ver planos
        </RouterLink>
      </div>

      <div v-else class="mt-8 grid gap-6 lg:grid-cols-3">
        <section class="space-y-6 lg:col-span-2">
          <article class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p class="text-xs font-semibold uppercase tracking-wide text-brand-gray">
                  Plano atual
                </p>
                <h2 class="mt-1 font-display text-xl font-semibold text-brand-ink">
                  {{ subscription.plan_name }}
                </h2>
                <p class="mt-1 text-sm text-brand-gray">{{ subscription.modality_label }}</p>
              </div>
              <span
                class="rounded-full bg-brand-mist px-2.5 py-1 text-xs font-medium text-brand-indigo"
              >
                {{ subscriptionStatusLabel(subscription.status) }}
              </span>
            </div>

            <dl class="mt-6 grid gap-4 sm:grid-cols-2 text-sm">
              <div>
                <dt class="text-brand-gray">Valor</dt>
                <dd class="mt-1 font-medium text-brand-ink">
                  {{ formatBillingCurrency(subscription.value) }}
                  / {{ billingCycleLabel(subscription.cycle).toLowerCase() }}
                </dd>
              </div>
              <div>
                <dt class="text-brand-gray">Próxima cobrança</dt>
                <dd class="mt-1 font-medium text-brand-ink">
                  {{ formatBillingDate(subscription.next_due_date) }}
                </dd>
              </div>
            </dl>

            <div class="mt-6 flex flex-wrap gap-3">
              <RouterLink
                :to="{ name: 'assinatura-planos' }"
                class="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-brand-ink"
              >
                Trocar plano
              </RouterLink>
              <button
                v-if="subscription.status !== 'CANCELED'"
                type="button"
                class="rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                :disabled="cancelLoading"
                @click="requestCancel"
              >
                <Loader2
                  v-if="cancelLoading"
                  class="inline h-4 w-4 animate-spin"
                  aria-hidden="true"
                />
                Cancelar assinatura
              </button>
            </div>
            <p v-if="subscription.status !== 'CANCELED'" class="mt-3 text-xs text-brand-gray">
              O cancelamento é imediato e interrompe novas cobranças recorrentes.
            </p>
          </article>

          <article class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <h2 class="font-display text-lg font-semibold text-brand-ink">
              Histórico de pagamentos
            </h2>
            <div v-if="payments.length === 0" class="mt-8 text-center text-sm text-brand-gray">
              Nenhum pagamento registrado ainda.
            </div>
            <div v-else class="mt-4 overflow-x-auto">
              <table class="min-w-full text-left text-sm">
                <thead>
                  <tr
                    class="border-b border-slate-100 text-xs uppercase tracking-wide text-brand-gray"
                  >
                    <th class="pb-2 pr-4 font-semibold">Vencimento</th>
                    <th class="pb-2 pr-4 font-semibold">Valor</th>
                    <th class="pb-2 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="payment in payments"
                    :key="payment.id"
                    class="border-b border-slate-50 last:border-0"
                  >
                    <td class="py-3 pr-4 text-brand-ink">
                      {{ formatBillingDate(payment.due_date) }}
                    </td>
                    <td class="py-3 pr-4 text-brand-ink">
                      {{ formatBillingCurrency(payment.value) }}
                    </td>
                    <td class="py-3 text-brand-gray">{{ paymentStatusLabel(payment.status) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </article>
        </section>

        <aside class="space-y-4">
          <article class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div class="flex items-center gap-2">
              <CreditCard class="h-4 w-4 text-brand-gray" aria-hidden="true" />
              <h2 class="font-display text-sm font-semibold text-brand-ink">Cartão de cobrança</h2>
            </div>
            <p class="mt-4 text-sm text-brand-ink">{{ maskedCard(subscription) }}</p>
            <button
              v-if="subscription.status !== 'CANCELED'"
              type="button"
              class="mt-4 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-brand-ink"
              @click="openCardForm"
            >
              Atualizar cartão
            </button>
          </article>
        </aside>
      </div>

      <div
        v-if="cardFormOpen"
        class="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
        role="dialog"
        aria-modal="true"
        aria-labelledby="card-modal-title"
      >
        <div
          class="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
        >
          <h2 id="card-modal-title" class="font-display text-lg font-semibold text-brand-ink">
            Atualizar cartão
          </h2>
          <form class="mt-4" @submit.prevent="submitCardUpdate">
            <BillingCheckoutForms
              v-model:holder="cardForms.holder"
              v-model:credit-card="cardForms.creditCard"
              :field-errors="cardFieldErrors"
              :disabled="cardSubmitting"
            />
            <div class="mt-6 flex gap-3">
              <button
                type="button"
                class="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium"
                @click="cardFormOpen = false"
              >
                Fechar
              </button>
              <button
                type="submit"
                class="flex-1 rounded-xl bg-brand-indigo py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                :disabled="cardSubmitting"
              >
                Salvar cartão
              </button>
            </div>
          </form>
        </div>
      </div>
    </template>

    <AppConfirmModal
      :open="cancelConfirmOpen"
      title="Cancelar assinatura"
      message="Tem certeza? O cancelamento interrompe novas cobranças recorrentes. Você continua com acesso até o fim do período já pago, conforme seu plano."
      confirm-label="Cancelar assinatura"
      :loading="cancelLoading"
      @close="cancelConfirmOpen = false"
      @confirm="onCancel"
    />

    <AppPageFooter class="mt-12" />
    </div>
  </div>
</template>
