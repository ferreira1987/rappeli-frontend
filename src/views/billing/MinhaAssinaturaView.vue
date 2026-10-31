<script setup lang="ts">
import {
  Building2,
  Calendar,
  CircleHelp,
  CreditCard,
  Loader2,
  MessageCircle,
  RefreshCw,
  Users,
} from '@lucide/vue'
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

import {
  cancelSubscription,
  fetchBillingPayments,
  fetchCurrentSubscription,
  updateSubscriptionPaymentMethod,
} from '@/api/billing'
import AppConfirmModal from '@/components/app/AppConfirmModal.vue'
import BillingBlockedBanner from '@/components/billing/BillingBlockedBanner.vue'
import BillingCheckoutForms from '@/components/billing/BillingCheckoutForms.vue'
import AppPageFooter from '@/components/layout/AppPageFooter.vue'
import AppPageShell from '@/components/layout/AppPageShell.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiCard from '@/components/ui/UiCard.vue'
import UiSubNav from '@/components/ui/UiSubNav.vue'
import UiTable from '@/components/ui/UiTable.vue'
import { useAuthStore } from '@/stores/auth'
import { useWhatsAppStore } from '@/stores/whatsapp'
import type { BillingPayment, PaymentStatus, Subscription } from '@/types/billing'
import {
  billingCycleLabel,
  formatBillingCurrency,
  formatPlanAmountCompact,
  paymentStatusLabel,
  subscriptionStatusLabel,
} from '@/utils/billingFormat'
import { emptyCheckoutForms, validateCheckoutForms } from '@/utils/billingCheckoutValidation'
import { getErrorMessage, getValidationErrors } from '@/utils/errors'
import {
  SETTINGS_TAB_KEYS,
  settingsSectionBreadcrumbs,
  settingsTabLabel,
  settingsTabQueryValue,
  type SettingsTabKey,
} from '@/utils/settingsTab'
import { formatBrazilPhone } from '@/utils/phone'

const docsUrl = 'https://rappeli.com.br'

const router = useRouter()
const auth = useAuthStore()
const whatsappStore = useWhatsAppStore()

const activeTab = 'plano' satisfies SettingsTabKey

const SETTINGS_NAV_ICONS = {
  empresa: Building2,
  equipe: Users,
  plano: CreditCard,
  whatsapp: MessageCircle,
} as const

const settingsNavItems = computed(() =>
  SETTINGS_TAB_KEYS.map((key) => ({
    key,
    label: settingsTabLabel(key),
    icon: SETTINGS_NAV_ICONS[key],
  })),
)

const showWhatsappDisconnectedBadge = computed(
  () => whatsappStore.hydrated && !whatsappStore.connected,
)

const whatsappHeaderLabel = computed(() => {
  if (!whatsappStore.hydrated || !whatsappStore.connected) {
    return null
  }
  const formatted = formatBrazilPhone(whatsappStore.displayPhoneNumber)
  return formatted || whatsappStore.displayPhoneNumber || 'WhatsApp conectado'
})

function selectTab(tab: SettingsTabKey): void {
  if (tab === 'plano') {
    return
  }
  if (tab === 'whatsapp') {
    void router.push({ name: 'configuracoes-whatsapp' })
    return
  }
  void router.push({ name: 'configuracoes', query: { tab: settingsTabQueryValue(tab) } })
}

const subscriptionLoading = ref(true)
const paymentsLoading = ref(true)
const subscription = ref<Subscription | null>(null)
const payments = ref<BillingPayment[]>([])
const subscriptionError = ref<string | null>(null)
const paymentsError = ref<string | null>(null)
const actionError = ref<string | null>(null)
const actionMessage = ref<string | null>(null)

const cancelLoading = ref(false)
const cancelConfirmOpen = ref(false)
const cardFormOpen = ref(false)
const cardSubmitting = ref(false)
const cardFieldErrors = ref<Record<string, string>>({})
const cardForms = reactive(emptyCheckoutForms())

onMounted(() => {
  void loadSubscription()
  void loadPayments()
  if (!whatsappStore.hydrated) {
    void whatsappStore.refresh()
  }
})

async function loadSubscription(): Promise<void> {
  subscriptionLoading.value = true
  subscriptionError.value = null
  try {
    subscription.value = await fetchCurrentSubscription()
  } catch (error) {
    subscriptionError.value = getErrorMessage(error)
  } finally {
    subscriptionLoading.value = false
  }
}

async function loadPayments(): Promise<void> {
  paymentsLoading.value = true
  paymentsError.value = null
  try {
    payments.value = await fetchBillingPayments()
  } catch (error) {
    paymentsError.value = getErrorMessage(error)
  } finally {
    paymentsLoading.value = false
  }
}

async function load(): Promise<void> {
  await loadSubscription()
  void loadPayments()
}

const isRefreshing = computed(
  () => subscriptionLoading.value || paymentsLoading.value,
)

function formatBillingDateShort(isoOrDate: string | null | undefined): string | null {
  if (!isoOrDate) {
    return null
  }
  const date = new Date(isoOrDate.includes('T') ? isoOrDate : `${isoOrDate}T12:00:00`)
  if (Number.isNaN(date.getTime())) {
    return isoOrDate
  }
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

function billingTypeLabel(billingType: string): string {
  if (billingType === 'CREDIT_CARD') {
    return 'Cartão de crédito'
  }
  return billingType
}

function paymentInvoiceDescription(sub: Subscription | null): string | null {
  if (!sub?.plan_name) {
    return null
  }
  const cycle = billingCycleLabel(sub.cycle).toLowerCase()
  return `Assinatura ${sub.plan_name} ${cycle}`
}

function isPaymentSettled(status: PaymentStatus): boolean {
  return status === 'RECEIVED' || status === 'CONFIRMED'
}

function paymentDisplayDate(payment: BillingPayment): string | null {
  return formatBillingDateShort(payment.due_date) ?? formatBillingDateShort(payment.paid_at)
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
    subscription.value = await updateSubscriptionPaymentMethod({
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
    payments.value = await fetchBillingPayments()
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

const showRegisteredCard = computed(() => {
  const sub = subscription.value
  if (!sub) {
    return false
  }
  return Boolean(sub.payment_method.last_digits || sub.payment_method.brand)
})
</script>

<template>
  <AppPageShell
    title="Minha assinatura"
    subtitle="Gerencie seu plano atual, forma de pagamento e histórico de faturas."
    :breadcrumbs="settingsSectionBreadcrumbs('Plano e cobrança')"
  >
    <template #actions>
      <span
        v-if="showWhatsappDisconnectedBadge"
        class="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-brand-ink"
      >
        <span class="h-2 w-2 shrink-0 rounded-full bg-red-500" aria-hidden="true" />
        WhatsApp Desconectado
      </span>
      <span
        v-else-if="whatsappHeaderLabel"
        class="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-brand-ink"
      >
        <span class="h-2 w-2 shrink-0 rounded-full bg-emerald-500" aria-hidden="true" />
        {{ whatsappHeaderLabel }}
      </span>
      <UiButton
        variant="secondary"
        size="sm"
        class="gap-2 font-medium"
        :disabled="isRefreshing"
        @click="load"
      >
        <RefreshCw class="h-4 w-4 text-brand-gray" :class="isRefreshing ? 'animate-spin' : ''" aria-hidden="true" />
        <span class="hidden sm:inline">Atualizar</span>
      </UiButton>
      <a :href="docsUrl" target="_blank" rel="noopener noreferrer" class="inline-flex">
        <UiButton variant="secondary" size="sm" class="gap-2 font-medium">
          <CircleHelp class="h-4 w-4 text-brand-gray" aria-hidden="true" />
          <span class="hidden sm:inline">Ver documentação</span>
          <span class="sm:hidden">Docs</span>
        </UiButton>
      </a>
    </template>

    <div class="flex min-h-0 flex-1 flex-col lg:flex-row">
      <UiSubNav :items="settingsNavItems" :active="activeTab" @select="selectTab" />

      <div class="flex min-w-0 flex-1 flex-col">
        <div class="flex-1 space-y-6 px-4 py-6 sm:px-6 lg:px-8">
          <BillingBlockedBanner />

          <p
            v-if="actionMessage"
            class="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
          >
            {{ actionMessage }}
          </p>
          <p
            v-if="actionError"
            class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            {{ actionError }}
          </p>

          <UiCard
            v-if="subscriptionLoading"
            padding="lg"
            aria-busy="true"
            aria-label="Carregando assinatura"
          >
            <div class="h-4 w-24 animate-pulse rounded bg-slate-100" />
            <div class="mt-4 h-8 w-56 animate-pulse rounded bg-slate-100" />
            <div class="mt-6 grid gap-4 sm:grid-cols-2">
              <div class="h-14 animate-pulse rounded-lg bg-slate-50" />
              <div class="h-14 animate-pulse rounded-lg bg-slate-50" />
            </div>
          </UiCard>

          <UiCard v-else-if="subscriptionError" padding="lg">
            <p class="text-sm text-red-800">
              {{ subscriptionError }}
              <button type="button" class="ml-2 font-semibold underline" @click="loadSubscription">
                Tentar novamente
              </button>
            </p>
          </UiCard>

          <UiCard v-else-if="!subscription" padding="lg" class="text-center">
            <h2 class="text-lg font-semibold text-brand-ink">Nenhuma assinatura ativa</h2>
            <p class="mt-2 text-sm text-brand-gray">
              Escolha um plano para começar a usar o painel sem interrupções.
            </p>
            <RouterLink :to="{ name: 'assinatura-planos' }" class="mt-6 inline-flex">
              <UiButton size="lg">Ver planos</UiButton>
            </RouterLink>
          </UiCard>

          <div v-else class="grid gap-6 lg:grid-cols-12 lg:items-start">
            <div class="space-y-6 lg:col-span-8">
              <UiCard padding="lg">
                <div class="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5">
                  <div class="min-w-0">
                    <div class="flex flex-wrap items-center gap-3">
                      <h2 class="text-xl font-bold text-brand-ink">
                        {{ subscription.plan_name }}
                      </h2>
                      <UiBadge v-if="subscription.status === 'ACTIVE'" variant="success" size="md">
                        <span
                          class="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500"
                          aria-hidden="true"
                        />
                        Ativa
                      </UiBadge>
                      <UiBadge v-else variant="neutral" size="md">
                        {{ subscriptionStatusLabel(subscription.status) }}
                      </UiBadge>
                    </div>
                    <p v-if="subscription.modality_label" class="mt-2 text-sm text-brand-gray">
                      {{ subscription.modality_label }}
                    </p>
                  </div>
                  <div class="text-right">
                    <p class="text-2xl font-bold text-brand-ink">
                      {{ formatPlanAmountCompact(subscription.value) }}
                      <span class="text-sm font-semibold text-brand-gray">
                        / {{ billingCycleLabel(subscription.cycle).toLowerCase() }}
                      </span>
                    </p>
                    <p v-if="subscription.status === 'ACTIVE'" class="mt-1 text-xs text-brand-gray">
                      Renovação automática
                    </p>
                  </div>
                </div>

                <ul class="mt-6 grid gap-4 sm:grid-cols-2">
                  <li
                    v-if="formatBillingDateShort(subscription.next_due_date)"
                    class="flex gap-3 rounded-lg border border-slate-100 bg-brand-surface px-4 py-3"
                  >
                    <Calendar class="mt-0.5 h-5 w-5 shrink-0 text-brand-indigo" aria-hidden="true" />
                    <div>
                      <p class="text-xs font-semibold text-brand-gray">Próxima cobrança</p>
                      <p class="mt-0.5 text-sm font-semibold text-brand-ink">
                        {{ formatBillingDateShort(subscription.next_due_date) }}
                      </p>
                    </div>
                  </li>
                  <li
                    v-if="showRegisteredCard"
                    class="flex gap-3 rounded-lg border border-slate-100 bg-brand-surface px-4 py-3"
                  >
                    <CreditCard class="mt-0.5 h-5 w-5 shrink-0 text-brand-indigo" aria-hidden="true" />
                    <div>
                      <p class="text-xs font-semibold text-brand-gray">Cartão cadastrado</p>
                      <p class="mt-0.5 text-sm font-semibold text-brand-ink">
                        {{ maskedCard(subscription) }}
                      </p>
                    </div>
                  </li>
                </ul>

                <section
                  class="mt-6 rounded-lg border border-slate-100 bg-brand-surface p-4"
                  aria-labelledby="plan-included-heading"
                >
                  <h3
                    id="plan-included-heading"
                    class="text-[11px] font-semibold uppercase tracking-wider text-brand-gray"
                  >
                    O que está incluído
                  </h3>
                  <dl class="mt-4 grid gap-4 sm:grid-cols-2 text-sm">
                    <div>
                      <dt class="text-[11px] font-semibold uppercase tracking-wider text-brand-gray">
                        Franquia de mensagens
                      </dt>
                      <dd class="mt-1 font-semibold text-brand-ink">Conforme plano contratado</dd>
                    </div>
                    <div>
                      <dt class="text-[11px] font-semibold uppercase tracking-wider text-brand-gray">
                        Atendentes
                      </dt>
                      <dd class="mt-1 font-semibold text-brand-indigo">Usuários ilimitados</dd>
                    </div>
                    <div>
                      <dt class="text-[11px] font-semibold uppercase tracking-wider text-brand-gray">
                        Excedente
                      </dt>
                      <dd class="mt-1 font-semibold text-brand-ink">R$ 0,05 por mensagem</dd>
                    </div>
                  </dl>
                </section>

                <div class="mt-6 flex flex-wrap items-center gap-3">
                  <RouterLink :to="{ name: 'assinatura-planos' }" class="inline-flex">
                    <UiButton>Alterar plano</UiButton>
                  </RouterLink>
                  <UiButton
                    v-if="subscription.status !== 'CANCELED'"
                    variant="outline"
                    @click="openCardForm"
                  >
                    Atualizar cartão
                  </UiButton>
                  <UiButton
                    v-if="subscription.status !== 'CANCELED'"
                    variant="ghost"
                    class="ml-auto text-red-600 hover:bg-red-50 hover:text-red-700"
                    :disabled="cancelLoading"
                    @click="requestCancel"
                  >
                    <Loader2 v-if="cancelLoading" class="h-4 w-4 animate-spin" aria-hidden="true" />
                    Cancelar assinatura
                  </UiButton>
                </div>
                <p v-if="subscription.status !== 'CANCELED'" class="mt-3 text-xs text-brand-gray">
                  O cancelamento é imediato e interrompe novas cobranças recorrentes.
                </p>
              </UiCard>

              <section class="space-y-4">
            <div>
              <h2 class="text-lg font-semibold text-brand-ink">Histórico de faturas</h2>
              <p class="mt-1 text-sm text-brand-gray">
                Comprovantes e cobranças registradas pelo Asaas.
              </p>
            </div>

            <div
              v-if="paymentsLoading"
              class="space-y-3"
              aria-busy="true"
              aria-label="Carregando histórico de pagamentos"
            >
              <div v-for="row in 4" :key="row" class="h-10 animate-pulse rounded-lg bg-slate-100" />
            </div>

            <UiCard v-else-if="paymentsError" padding="md">
              <p class="text-sm text-red-700">
                {{ paymentsError }}
                <button type="button" class="ml-2 font-semibold underline" @click="loadPayments">
                  Tentar novamente
                </button>
              </p>
            </UiCard>

            <UiCard v-else-if="payments.length === 0" padding="lg" class="text-center">
              <p class="text-sm text-brand-gray">Nenhum pagamento registrado ainda.</p>
            </UiCard>

            <UiTable v-else>
              <thead>
                <tr>
                  <th scope="col">Data</th>
                  <th v-if="paymentInvoiceDescription(subscription)" scope="col">Descrição</th>
                  <th scope="col">Valor</th>
                  <th scope="col">Forma de pagamento</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="payment in payments" :key="payment.id">
                  <td v-if="paymentDisplayDate(payment)" class="whitespace-nowrap text-brand-ink">
                    {{ paymentDisplayDate(payment) }}
                  </td>
                  <td v-else class="whitespace-nowrap text-brand-gray" />
                  <td v-if="paymentInvoiceDescription(subscription)" class="text-brand-ink">
                    {{ paymentInvoiceDescription(subscription) }}
                  </td>
                  <td class="whitespace-nowrap font-medium text-brand-ink">
                    {{ formatBillingCurrency(payment.value) }}
                  </td>
                  <td class="text-brand-gray">
                    {{ billingTypeLabel(payment.billing_type) }}
                  </td>
                  <td>
                    <UiBadge
                      :variant="isPaymentSettled(payment.status) ? 'success' : 'neutral'"
                      size="md"
                    >
                      <span
                        v-if="isPaymentSettled(payment.status)"
                        class="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500"
                        aria-hidden="true"
                      />
                      {{ paymentStatusLabel(payment.status) }}
                    </UiBadge>
                  </td>
                </tr>
              </tbody>
            </UiTable>
              </section>
            </div>

            <aside class="lg:col-span-4">
              <UiCard padding="md">
                <div class="flex items-center justify-between">
                  <h2 class="text-sm font-semibold text-brand-ink">Forma de pagamento</h2>
                  <CreditCard class="h-4 w-4 text-brand-gray" aria-hidden="true" />
                </div>
                <div
                  class="mt-4 rounded-lg border border-slate-200 bg-brand-surface p-4"
                >
                  <div
                    class="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-brand-gray"
                  >
                    <span>Cartão de cobrança</span>
                    <span class="text-brand-ink">
                      {{ subscription.payment_method.brand ?? 'Cartão' }}
                    </span>
                  </div>
                  <p class="mt-3 font-mono text-base tracking-widest text-brand-ink">
                    •••• •••• •••• {{ subscription.payment_method.last_digits ?? '••••' }}
                  </p>
                </div>
                <p class="mt-3 text-xs text-brand-gray">{{ maskedCard(subscription) }}</p>
                <UiButton
                  v-if="subscription.status !== 'CANCELED'"
                  variant="secondary"
                  class="mt-4 w-full"
                  @click="openCardForm"
                >
                  Atualizar cartão
                </UiButton>
              </UiCard>
            </aside>
          </div>

          <AppPageFooter />
        </div>
      </div>
    </div>

    <div
      v-if="cardFormOpen"
      class="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="card-modal-title"
    >
      <UiCard padding="lg" class="max-h-[90vh] w-full max-w-lg overflow-y-auto shadow-xl">
        <h2 id="card-modal-title" class="text-lg font-semibold text-brand-ink">Atualizar cartão</h2>
        <form class="mt-4" @submit.prevent="submitCardUpdate">
          <BillingCheckoutForms
            v-model:holder="cardForms.holder"
            v-model:credit-card="cardForms.creditCard"
            :field-errors="cardFieldErrors"
            :disabled="cardSubmitting"
          />
          <div class="mt-6 flex gap-3">
            <UiButton type="button" variant="secondary" class="flex-1" @click="cardFormOpen = false">
              Fechar
            </UiButton>
            <UiButton type="submit" class="flex-1" :disabled="cardSubmitting">
              Salvar cartão
            </UiButton>
          </div>
        </form>
      </UiCard>
    </div>

    <AppConfirmModal
      :open="cancelConfirmOpen"
      title="Cancelar assinatura"
      message="Tem certeza? O cancelamento interrompe novas cobranças recorrentes. Você continua com acesso até o fim do período já pago, conforme seu plano."
      confirm-label="Cancelar assinatura"
      :loading="cancelLoading"
      @close="cancelConfirmOpen = false"
      @confirm="onCancel"
    />
  </AppPageShell>
</template>
