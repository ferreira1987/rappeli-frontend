<script setup lang="ts">
import {
  ArrowRight,
  Bell,
  Calendar,
  Check,
  Filter,
  Send,
  Users,
  BadgeCheck,
} from '@lucide/vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import OnboardingMetaConnect from '@/components/onboarding/OnboardingMetaConnect.vue'
import OnboardingShell from '@/components/onboarding/OnboardingShell.vue'
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
</script>

<template>
  <OnboardingShell :step="4">
    <section class="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-mist text-emerald-700">
        <BadgeCheck class="h-6 w-6" aria-hidden="true" />
      </div>
      <div>
        <h1 class="text-2xl font-semibold text-brand-ink">
          Pagamento confirmado! Sua assinatura {{ checkoutFlow.planName }} está ativa.
        </h1>
        <p class="mt-2 text-sm text-brand-gray">
          Conclua os passos essenciais abaixo para iniciar suas conversas automatizadas e disponibilizar a
          plataforma para a sua equipe.
        </p>
      </div>
    </section>

    <div class="mt-6 space-y-6">
      <OnboardingMetaConnect />

      <section class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="flex items-center gap-2">
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-mist text-brand-indigo">
            <Users class="h-4 w-4" aria-hidden="true" />
          </div>
          <h2 class="text-lg font-semibold text-brand-ink">Convide sua equipe</h2>
        </div>
        <p class="mt-2 text-sm text-brand-gray">
          Adicione secretárias, atendentes e gestores para gerenciar os atendimentos em conjunto.
        </p>
        <div class="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            v-model="inviteEmail"
            type="email"
            placeholder="nome@empresa.com.br"
            class="h-[42px] flex-1 rounded-lg border border-slate-200 px-3 text-sm"
          />
          <select
            v-model="inviteRole"
            class="h-[42px] rounded-lg border border-slate-200 px-3 text-sm text-brand-ink"
          >
            <option>Atendente</option>
            <option>Gestor</option>
          </select>
          <button
            type="button"
            class="inline-flex h-[42px] items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 text-sm font-semibold text-brand-ink hover:bg-slate-50"
          >
            <Send class="h-4 w-4" aria-hidden="true" />
            Enviar convite
          </button>
        </div>
        <p class="mt-2 text-xs text-brand-gray">Convites por e-mail estarão disponíveis em breve no painel.</p>
      </section>

      <section class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="flex flex-wrap items-center gap-2">
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-mist text-brand-indigo">
            <Filter class="h-4 w-4" aria-hidden="true" />
          </div>
          <h2 class="text-lg font-semibold text-brand-ink">Ative um fluxo pronto para clínicas</h2>
          <span class="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-brand-gray">
            Você pode personalizar depois
          </span>
        </div>
        <div class="mt-4 grid gap-3 sm:grid-cols-3">
          <button
            v-for="flow in clinicFlows"
            :key="flow.id"
            type="button"
            class="relative rounded-xl border p-4 text-left transition"
            :class="
              selectedFlow === flow.id
                ? 'border-brand-indigo bg-brand-mist/40 ring-2 ring-brand-indigo/20'
                : 'border-slate-200 hover:border-slate-300'
            "
            @click="selectedFlow = flow.id"
          >
            <component :is="flow.icon" class="h-5 w-5 text-brand-indigo" aria-hidden="true" />
            <p class="mt-2 text-sm font-semibold text-brand-ink">{{ flow.label }}</p>
            <Check
              v-if="selectedFlow === flow.id"
              class="absolute right-3 top-3 h-4 w-4 text-brand-indigo"
              aria-hidden="true"
            />
          </button>
        </div>
      </section>

      <div class="flex justify-end pt-2">
        <button
          type="button"
          class="inline-flex h-11 items-center gap-2 rounded-lg bg-brand-indigo px-6 text-sm font-semibold text-white shadow-sm hover:bg-brand-indigo-hover"
          @click="goToPanel"
        >
          Ir para o painel
          <ArrowRight class="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  </OnboardingShell>
</template>
