<script setup lang="ts">
import { ArrowRight, Bell, Eye, EyeOff, Group, Share2, ShieldCheck } from '@lucide/vue'
import { ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import OnboardingShell from '@/components/onboarding/OnboardingShell.vue'
import { useAuthStore } from '@/stores/auth'
import { useCheckoutFlowStore } from '@/stores/checkoutFlow'
import { maskPhoneBr } from '@/utils/billingFormat'
import { getErrorMessage, getValidationErrors } from '@/utils/errors'

const auth = useAuthStore()
const checkoutFlow = useCheckoutFlowStore()
const router = useRouter()
const route = useRoute()

const name = ref('')
const email = ref('')
const whatsapp = ref('')
const companyName = ref('')
const password = ref('')
const acceptedTerms = ref(false)
const showPassword = ref(false)
const formError = ref<string | null>(null)
const fieldErrors = ref<Record<string, string>>({})

const termsUrl = 'https://rappeli.com.br/termos'
const privacyUrl = 'https://rappeli.com.br/privacidade'

function inputClass(field: string): string {
  return fieldErrors.value[field]
    ? 'border-red-300 focus:border-red-400 focus:ring-red-200'
    : 'border-slate-200 focus:border-brand-indigo focus:ring-brand-indigo'
}

function onWhatsappInput(event: Event): void {
  whatsapp.value = maskPhoneBr((event.target as HTMLInputElement).value)
}

async function onSubmit(): Promise<void> {
  formError.value = null
  fieldErrors.value = {}

  if (!acceptedTerms.value) {
    fieldErrors.value = {
      terms_accepted: 'Você precisa aceitar os Termos de Uso e a Política de Privacidade.',
    }
    return
  }

  try {
    checkoutFlow.setRegistrationExtras({
      whatsapp: whatsapp.value,
      companyName: companyName.value.trim(),
    })

    await auth.register({
      name: name.value.trim(),
      email: email.value.trim(),
      password: password.value,
      password_confirmation: password.value,
      terms_accepted: true,
    })

    const redirect =
      typeof route.query.redirect === 'string' ? route.query.redirect : '/contratacao/plano'
    await router.replace(redirect)
  } catch (error) {
    const validation = getValidationErrors(error)
    if (validation) {
      fieldErrors.value = validation
      return
    }
    formError.value = getErrorMessage(error)
  }
}
</script>

<template>
  <OnboardingShell :step="1">
    <div class="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
      <section
        class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-7 md:p-8"
      >
        <div class="mb-6">
          <h1 class="text-2xl font-semibold tracking-tight text-brand-ink">Crie sua conta no Rappeli</h1>
          <p class="mt-1 text-sm text-brand-gray">
            Automatize atendimentos, lembretes e confirmações pelo WhatsApp com a API oficial.
          </p>
        </div>

        <form class="space-y-4" novalidate @submit.prevent="onSubmit">
          <p
            v-if="formError"
            class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            role="alert"
          >
            {{ formError }}
          </p>

          <div>
            <label for="name" class="text-[11px] font-semibold uppercase tracking-wide text-brand-gray">
              Nome completo
            </label>
            <input
              id="name"
              v-model="name"
              type="text"
              autocomplete="name"
              placeholder="Seu nome completo"
              class="mt-1 h-[42px] w-full rounded-lg border px-3 text-sm outline-none ring-0 focus:ring-2"
              :class="inputClass('name')"
            />
            <p v-if="fieldErrors.name" class="mt-1 text-xs text-red-600">{{ fieldErrors.name }}</p>
          </div>

          <div>
            <label for="email" class="text-[11px] font-semibold uppercase tracking-wide text-brand-gray">
              E-mail
            </label>
            <input
              id="email"
              v-model="email"
              type="email"
              autocomplete="email"
              placeholder="nome@empresa.com.br"
              class="mt-1 h-[42px] w-full rounded-lg border px-3 text-sm outline-none ring-0 focus:ring-2"
              :class="inputClass('email')"
            />
            <p v-if="fieldErrors.email" class="mt-1 text-xs text-red-600">{{ fieldErrors.email }}</p>
          </div>

          <div>
            <label for="whatsapp" class="text-[11px] font-semibold uppercase tracking-wide text-brand-gray">
              WhatsApp
            </label>
            <input
              id="whatsapp"
              :value="whatsapp"
              type="tel"
              autocomplete="tel"
              placeholder="(00) 00000-0000"
              class="mt-1 h-[42px] w-full rounded-lg border px-3 text-sm outline-none ring-0 focus:ring-2"
              @input="onWhatsappInput"
            />
          </div>

          <div>
            <label for="company" class="text-[11px] font-semibold uppercase tracking-wide text-brand-gray">
              Nome da empresa
            </label>
            <input
              id="company"
              v-model="companyName"
              type="text"
              placeholder="Nome do seu negócio ou clínica"
              class="mt-1 h-[42px] w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-brand-indigo focus:ring-2 focus:ring-brand-indigo/20"
            />
          </div>

          <div>
            <div class="mb-1 flex items-center justify-between">
              <label for="password" class="text-[11px] font-semibold uppercase tracking-wide text-brand-gray">
                Senha
              </label>
              <span class="text-xs text-slate-400">(mínimo 8 caracteres)</span>
            </div>
            <div class="relative">
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="new-password"
                minlength="8"
                placeholder="Mínimo de 8 caracteres"
                class="mt-0 h-[42px] w-full rounded-lg border px-3 pr-10 text-sm outline-none ring-0 focus:ring-2"
                :class="inputClass('password')"
              />
              <button
                type="button"
                class="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400"
                :aria-label="showPassword ? 'Ocultar senha' : 'Mostrar senha'"
                @click="showPassword = !showPassword"
              >
                <EyeOff v-if="showPassword" class="h-4 w-4" />
                <Eye v-else class="h-4 w-4" />
              </button>
            </div>
            <p v-if="fieldErrors.password" class="mt-1 text-xs text-red-600">{{ fieldErrors.password }}</p>
          </div>

          <label class="flex cursor-pointer items-start gap-2 text-sm text-brand-gray">
            <input
              v-model="acceptedTerms"
              type="checkbox"
              class="mt-1 h-4 w-4 rounded border-slate-300 text-brand-indigo"
            />
            <span>
              Li e concordo com os
              <a :href="termsUrl" target="_blank" rel="noopener noreferrer" class="font-semibold text-brand-indigo hover:underline">
                Termos de Uso
              </a>
              e a
              <a :href="privacyUrl" target="_blank" rel="noopener noreferrer" class="font-semibold text-brand-indigo hover:underline">
                Política de Privacidade
              </a>.
            </span>
          </label>
          <p v-if="fieldErrors.terms_accepted" class="text-xs text-red-600">{{ fieldErrors.terms_accepted }}</p>

          <div class="mt-6 flex items-center justify-between border-t border-slate-200 pt-6">
            <p class="text-sm text-brand-gray">
              Já tem conta?
              <RouterLink :to="{ name: 'login' }" class="font-semibold text-brand-indigo hover:underline">
                Entrar
              </RouterLink>
            </p>
            <button
              type="submit"
              :disabled="auth.loading"
              class="inline-flex h-[42px] items-center gap-2 rounded-lg bg-brand-indigo px-6 text-sm font-semibold text-white shadow-sm hover:bg-brand-indigo-hover disabled:opacity-60"
            >
              {{ auth.loading ? 'Aguarde…' : 'Continuar' }}
              <ArrowRight class="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </form>
      </section>

      <section
        class="flex flex-col justify-between rounded-xl border border-brand-indigo/30 bg-gradient-to-br from-brand-indigo to-[#312e81] p-6 text-white shadow-sm lg:col-span-5 md:p-8"
      >
        <div>
          <p class="text-[11px] font-semibold uppercase tracking-wider text-indigo-200">Visão geral</p>
          <h2 class="mt-1 text-xl font-bold">Por que escolher o Rappeli</h2>
          <ul class="mt-6 space-y-4">
            <li class="flex gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10">
                <Share2 class="h-5 w-5 text-indigo-200" aria-hidden="true" />
              </div>
              <div>
                <p class="font-semibold">API oficial do WhatsApp (Meta)</p>
                <p class="mt-0.5 text-sm text-indigo-100">
                  Conexão pela API oficial da Meta, sem aplicativos não oficiais.
                </p>
              </div>
            </li>
            <li class="flex gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10">
                <Bell class="h-5 w-5 text-indigo-200" aria-hidden="true" />
              </div>
              <div>
                <p class="font-semibold">Lembretes e confirmações automáticos</p>
                <p class="mt-0.5 text-sm text-indigo-100">
                  Fluxos automáticos que notificam clientes e agilizam rotinas operacionais.
                </p>
              </div>
            </li>
            <li class="flex gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10">
                <Group class="h-5 w-5 text-indigo-200" aria-hidden="true" />
              </div>
              <div>
                <p class="font-semibold">Vários atendentes no mesmo número</p>
                <p class="mt-0.5 text-sm text-indigo-100">
                  Centralize toda a sua equipe em um único canal integrado de atendimento.
                </p>
              </div>
            </li>
          </ul>
        </div>
        <p class="mt-8 flex items-center gap-2 border-t border-white/10 pt-4 text-sm text-indigo-100">
          <ShieldCheck class="h-4 w-4" aria-hidden="true" />
          Sem fidelidade. Cancele quando quiser.
        </p>
      </section>
    </div>
  </OnboardingShell>
</template>
