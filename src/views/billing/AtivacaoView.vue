<script setup lang="ts">
import {
  ArrowRight,
  Bell,
  Calendar,
  Check,
  CheckCircle2,
  Filter,
  Send,
  Users,
} from '@lucide/vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import OnboardingMetaConnect from '@/components/onboarding/OnboardingMetaConnect.vue'
import OnboardingShell from '@/components/onboarding/OnboardingShell.vue'
import { UiBadge, UiButton, UiCard, UiInput } from '@/components/ui'
import { useCheckoutFlowStore } from '@/stores/checkoutFlow'

const router = useRouter()
const checkoutFlow = useCheckoutFlowStore()

const inviteEmail = ref('')
const inviteRole = ref('Atendente')
const selectedFlow = ref('confirmacao')

const clinicFlows = [
  { id: 'confirmacao', label: 'Confirmação de consulta', icon: Calendar },
  { id: 'lembrete', label: 'Lembrete 24h antes', icon: Bell },
  { id: 'reagendamento', label: 'Reagendamento', icon: Filter },
]

function goToPanel(): void {
  void router.push({ name: 'painel' })
}

function goBack(): void {
  void router.push({ name: 'assinatura-checkout' })
}
</script>

<template>
  <OnboardingShell :step="4" shell-variant="cadastro-v5" @back="goBack">
    <div class="mx-auto w-full max-w-[720px]">
      <UiCard padding="none" class="mb-6 overflow-hidden rounded-xl border border-slate-200 shadow-sm">
        <div class="flex items-start gap-4 p-6">
          <div
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50"
          >
            <CheckCircle2 class="h-5 w-5 text-emerald-600" aria-hidden="true" />
          </div>
          <div class="min-w-0 pt-0.5">
            <h1 class="text-lg font-bold leading-tight text-slate-900 sm:text-xl">
              Pagamento confirmado! Sua assinatura {{ checkoutFlow.planName }} está ativa.
            </h1>
            <p class="mt-2 text-sm leading-relaxed text-slate-500">
              Conclua os passos essenciais abaixo para iniciar suas conversas automatizadas e disponibilizar a
              plataforma para a sua equipe.
            </p>
          </div>
        </div>
      </UiCard>

      <div class="space-y-4">
        <OnboardingMetaConnect layout="activation-v5" />

        <UiCard padding="none" class="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
          <div class="p-5 sm:p-6">
            <div class="mb-2 flex flex-wrap items-center justify-between gap-2">
              <span
                class="inline-flex items-center rounded border border-slate-200 bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600"
              >
                Passo 2 • Opcional
              </span>
            </div>
            <div class="flex items-center gap-2">
              <div
                class="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EEF0FF] text-[#4338CA]"
              >
                <Users class="h-4 w-4" aria-hidden="true" />
              </div>
              <h2 class="text-sm font-bold text-slate-900 sm:text-base">Convide sua equipe</h2>
            </div>
            <p class="mt-2 text-xs leading-relaxed text-slate-500 sm:text-sm">
              Adicione secretárias, atendentes e gestores para gerenciar os atendimentos em conjunto.
            </p>
            <div class="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-12">
              <div class="sm:col-span-6">
                <label for="invite-email" class="sr-only">E-mail do convite</label>
                <UiInput
                  id="invite-email"
                  v-model="inviteEmail"
                  type="email"
                  placeholder="nome@empresa.com.br"
                  class="text-xs sm:text-sm"
                />
              </div>
              <div class="sm:col-span-3">
                <label for="invite-role" class="sr-only">Função</label>
                <select
                  id="invite-role"
                  v-model="inviteRole"
                  class="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-800 focus:border-[#4338CA] focus:outline-none focus:ring-1 focus:ring-[#4338CA] sm:text-sm"
                >
                  <option>Atendente</option>
                  <option>Gestor</option>
                </select>
              </div>
              <div class="sm:col-span-3">
                <UiButton
                  type="button"
                  variant="outline"
                  class="h-10 w-full border-slate-300 text-slate-900"
                  size="md"
                >
                  <Send class="h-4 w-4 shrink-0" aria-hidden="true" />
                  Enviar convite
                </UiButton>
              </div>
            </div>
            <p class="mt-2 text-xs text-slate-500">
              Convites por e-mail estarão disponíveis em breve no painel.
            </p>
          </div>
        </UiCard>

        <UiCard padding="none" class="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
          <div class="p-5 sm:p-6">
            <div class="mb-2 flex flex-wrap items-center justify-between gap-2">
              <span
                class="inline-flex items-center rounded border border-slate-200 bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600"
              >
                Passo 3 • Opcional
              </span>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <div
                class="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EEF0FF] text-[#4338CA]"
              >
                <Filter class="h-4 w-4" aria-hidden="true" />
              </div>
              <h2 class="text-sm font-bold text-slate-900 sm:text-base">
                Ative um fluxo pronto para clínicas
              </h2>
              <UiBadge
                variant="neutral"
                size="md"
                class="!rounded-full border border-slate-200 bg-slate-100 !text-[11px] font-medium text-slate-600"
              >
                Você pode personalizar depois
              </UiBadge>
            </div>
            <div class="mt-4 grid gap-2.5 sm:grid-cols-3">
              <button
                v-for="flow in clinicFlows"
                :key="flow.id"
                type="button"
                class="relative rounded-lg border p-3 text-left transition"
                :class="
                  selectedFlow === flow.id
                    ? 'border-2 border-[#4338CA] bg-[#EEF0FF]/40'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                "
                @click="selectedFlow = flow.id"
              >
                <div class="flex items-start justify-between gap-2">
                  <component
                    :is="flow.icon"
                    class="h-5 w-5 shrink-0"
                    :class="selectedFlow === flow.id ? 'text-[#4338CA]' : 'text-slate-500'"
                    aria-hidden="true"
                  />
                  <Check
                    v-if="selectedFlow === flow.id"
                    class="h-4 w-4 shrink-0 text-[#4338CA]"
                    aria-hidden="true"
                  />
                </div>
                <p
                  class="mt-2.5 text-xs font-semibold"
                  :class="selectedFlow === flow.id ? 'text-slate-900' : 'text-slate-700'"
                >
                  {{ flow.label }}
                </p>
              </button>
            </div>
          </div>
        </UiCard>
      </div>

      <div class="mt-8 text-center">
        <UiButton
          type="button"
          variant="ghost"
          class="inline-flex text-sm font-medium text-slate-600 hover:bg-transparent hover:text-slate-900"
          @click="goToPanel"
        >
          Ir para o painel
          <ArrowRight class="h-4 w-4 shrink-0" aria-hidden="true" />
        </UiButton>
      </div>
    </div>
  </OnboardingShell>
</template>
