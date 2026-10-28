<script setup lang="ts">
import { Eye, EyeOff, Handshake, LockOpen, Share2, Users } from '@lucide/vue'
import { ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import OnboardingActionBar from '@/components/onboarding/OnboardingActionBar.vue'
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

function clearFieldError(field: string): void {
  delete fieldErrors.value[field]
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

    const whatsappDigits = whatsapp.value.replace(/\D/g, '')
    await auth.register({
      name: name.value.trim(),
      email: email.value.trim(),
      password: password.value,
      password_confirmation: password.value,
      terms_accepted: true,
      company_name: companyName.value.trim() || null,
      business_whatsapp: whatsappDigits || null,
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
          <h1 class="text-2xl font-extrabold tracking-tight text-brand-ink sm:text-3xl">
            Crie sua conta
          </h1>
          <p class="mt-1 text-sm text-brand-gray">
            Preencha os dados abaixo para iniciar sua configuração no Rappeli.
          </p>
        </div>

        <form id="register-form" class="space-y-4" novalidate @submit.prevent="onSubmit">
          <p
            v-if="formError"
            class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            role="alert"
          >
            {{ formError }}
          </p>

          <div>
            <label
              for="name"
              class="text-[11px] font-semibold uppercase tracking-wide text-brand-gray"
            >
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
              @input="clearFieldError('name')"
            />
            <p v-if="fieldErrors.name" class="mt-1 text-xs text-red-600">{{ fieldErrors.name }}</p>
          </div>

          <div>
            <label
              for="email"
              class="text-[11px] font-semibold uppercase tracking-wide text-brand-gray"
            >
              E-mail de trabalho *
            </label>
            <input
              id="email"
              v-model="email"
              type="email"
              autocomplete="email"
              placeholder="nome@empresa.com.br"
              class="mt-1 h-[42px] w-full rounded-lg border px-3 text-sm outline-none ring-0 focus:ring-2"
              :class="inputClass('email')"
              @input="clearFieldError('email')"
            />
            <p v-if="fieldErrors.email" class="mt-1 text-xs text-red-600">
              {{ fieldErrors.email }}
            </p>
          </div>

          <div>
            <div class="mb-1 flex items-center justify-between">
              <label
                for="password"
                class="text-[11px] font-semibold uppercase tracking-wide text-brand-gray"
              >
                Senha *
              </label>
              <span class="text-xs text-slate-400">Mínimo de 8 caracteres</span>
            </div>
            <div class="relative">
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="new-password"
                minlength="8"
                placeholder="Crie uma senha segura"
                class="h-[42px] w-full rounded-lg border bg-slate-50 px-3.5 pr-10 text-sm outline-none ring-0 focus:bg-white focus:ring-2"
                :class="inputClass('password')"
                @input="clearFieldError('password')"
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
            <p v-if="fieldErrors.password" class="mt-1 text-xs text-red-600">
              {{ fieldErrors.password }}
            </p>
          </div>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                for="company"
                class="text-[11px] font-semibold uppercase tracking-wide text-brand-gray"
              >
                Nome da empresa / clínica *
              </label>
              <input
                id="company"
                v-model="companyName"
                type="text"
                placeholder="Ex: Clínica Sorriso & Saúde"
                class="mt-1 h-[42px] w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 text-sm outline-none focus:border-brand-indigo focus:bg-white focus:ring-2 focus:ring-brand-indigo/20"
              />
            </div>

            <div>
              <label
                for="whatsapp"
                class="text-[11px] font-semibold uppercase tracking-wide text-brand-gray"
              >
                WhatsApp *
              </label>
              <input
                id="whatsapp"
                :value="whatsapp"
                type="tel"
                autocomplete="tel"
                placeholder="(11) 98765-4321"
                class="mt-1 h-[42px] w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 text-sm outline-none focus:border-brand-indigo focus:bg-white focus:ring-2 focus:ring-brand-indigo/20"
                @input="onWhatsappInput"
              />
            </div>
          </div>

          <label class="flex cursor-pointer items-start gap-2 text-sm text-brand-gray">
            <input
              v-model="acceptedTerms"
              type="checkbox"
              class="mt-1 h-4 w-4 rounded border-slate-300 text-brand-indigo"
              @change="clearFieldError('terms_accepted')"
            />
            <span>
              Li e concordo com os
              <a
                :href="termsUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="font-semibold text-brand-indigo hover:underline"
              >
                Termos de Uso
              </a>
              e a
              <a
                :href="privacyUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="font-semibold text-brand-indigo hover:underline"
              >
                Política de Privacidade </a
              >.
            </span>
          </label>
          <p v-if="fieldErrors.terms_accepted" class="text-xs text-red-600">
            {{ fieldErrors.terms_accepted }}
          </p>

          <p class="border-t border-slate-200 pt-6 text-sm text-brand-gray">
            Já tem conta?
            <RouterLink
              :to="{ name: 'login' }"
              class="font-semibold text-brand-indigo hover:underline"
            >
              Entrar
            </RouterLink>
          </p>
        </form>
      </section>

      <section
        class="flex flex-col justify-between rounded-2xl bg-brand-indigo p-6 text-white shadow-sm lg:col-span-5 md:p-8 lg:p-10"
        style="background-color: #4338ca"
      >
        <div>
          <p
            class="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white/90"
          >
            Vantagens do ecossistema
          </p>
          <h2 class="mt-4 text-2xl font-bold tracking-tight">Por que escolher o Rappeli</h2>
          <ul class="mt-6 space-y-3.5">
            <li class="flex gap-3.5 rounded-xl border border-white/10 bg-white/10 p-4">
              <div
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15 text-white"
              >
                <Share2 class="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p class="text-sm font-bold">API Oficial WhatsApp</p>
                <p class="mt-0.5 text-xs leading-relaxed text-white/80">
                  Conexão oficial Cloud API sem risco de bloqueio e com estabilidade profissional.
                </p>
              </div>
            </li>
            <li class="flex gap-3.5 rounded-xl border border-white/10 bg-white/10 p-4">
              <div
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15 text-white"
              >
                <Users class="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p class="text-sm font-bold">Usuários ilimitados</p>
                <p class="mt-0.5 text-xs leading-relaxed text-white/80">
                  Toda a sua equipe na mesma conta sem custos adicionais por operador.
                </p>
              </div>
            </li>
            <li class="flex gap-3.5 rounded-xl border border-white/10 bg-white/10 p-4">
              <div
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15 text-white"
              >
                <Handshake class="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p class="text-sm font-bold">Implantação inclusa</p>
                <p class="mt-0.5 text-xs leading-relaxed text-white/80">
                  Acompanhamento humanizado na configuração inicial sem taxa extra.
                </p>
              </div>
            </li>
            <li class="flex gap-3.5 rounded-xl border border-white/10 bg-white/10 p-4">
              <div
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15 text-white"
              >
                <LockOpen class="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p class="text-sm font-bold">Sem fidelidade</p>
                <p class="mt-0.5 text-xs leading-relaxed text-white/80">
                  Altere de plano ou cancele sua assinatura a qualquer momento com 1 clique.
                </p>
              </div>
            </li>
          </ul>
        </div>
        <p class="mt-8 flex items-center justify-between border-t border-white/15 pt-6 text-xs text-white/75">
          <span>Criptografia de ponta a ponta</span>
          <span>Suporte em português</span>
        </p>
      </section>
    </div>

    <template #action-bar>
      <OnboardingActionBar
        :show-back="false"
        primary-label="Continuar"
        :primary-loading="auth.loading"
        @primary="onSubmit"
      />
    </template>
  </OnboardingShell>
</template>
