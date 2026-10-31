<script setup lang="ts">
import { ArrowRight, Eye, EyeOff, Handshake, LockOpen, Share2, Users } from '@lucide/vue'
import { ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import OnboardingShell from '@/components/onboarding/OnboardingShell.vue'
import { UiButton, UiCard, UiInput } from '@/components/ui'
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

function clearFieldError(field: string): void {
  delete fieldErrors.value[field]
}

function onWhatsappInput(value: string): void {
  whatsapp.value = maskPhoneBr(value)
  clearFieldError('business_whatsapp')
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
  <OnboardingShell :step="1" shell-variant="cadastro-v5">
    <div class="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8">
      <UiCard
        padding="none"
        class="overflow-hidden rounded-2xl border border-slate-200/90 shadow-sm lg:col-span-7"
      >
      <div class="p-6 sm:p-8">
        <header class="mb-6">
          <h1 class="text-2xl font-bold tracking-tight text-slate-900">Crie sua conta</h1>
          <p class="mt-2 text-sm leading-relaxed text-slate-500">
            Preencha os dados abaixo para iniciar sua configuração no Rappeli.
          </p>
        </header>

        <form id="register-form" class="space-y-5" novalidate @submit.prevent="onSubmit">
          <p
            v-if="formError"
            class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            role="alert"
          >
            {{ formError }}
          </p>

          <div class="space-y-1.5">
            <label for="name" class="text-sm font-medium text-slate-700"> Nome completo </label>
            <UiInput
              id="name"
              v-model="name"
              type="text"
              autocomplete="name"
              placeholder="Ex: Marina Silva"
              :invalid="Boolean(fieldErrors.name)"
              @update:model-value="clearFieldError('name')"
            />
            <p v-if="fieldErrors.name" class="text-xs text-red-600">{{ fieldErrors.name }}</p>
          </div>

          <div class="space-y-1.5">
            <label for="email" class="text-sm font-medium text-slate-700">
              E-mail de trabalho *
            </label>
            <UiInput
              id="email"
              v-model="email"
              type="email"
              autocomplete="email"
              placeholder="nome@suaempresa.com.br"
              :invalid="Boolean(fieldErrors.email)"
              @update:model-value="clearFieldError('email')"
            />
            <p v-if="fieldErrors.email" class="text-xs text-red-600">{{ fieldErrors.email }}</p>
          </div>

          <div class="space-y-1.5">
            <label for="password" class="text-sm font-medium text-slate-700"> Senha * </label>
            <div class="relative">
              <UiInput
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="new-password"
                :minlength="8"
                placeholder="Crie uma senha segura"
                input-class="pr-10"
                :invalid="Boolean(fieldErrors.password)"
                @update:model-value="clearFieldError('password')"
              />
              <button
                type="button"
                class="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-600"
                :aria-label="showPassword ? 'Ocultar senha' : 'Mostrar senha'"
                @click="showPassword = !showPassword"
              >
                <EyeOff v-if="showPassword" class="h-4 w-4" aria-hidden="true" />
                <Eye v-else class="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <p class="text-xs text-slate-400">Mínimo de 8 caracteres</p>
            <p v-if="fieldErrors.password" class="text-xs text-red-600">
              {{ fieldErrors.password }}
            </p>
          </div>

          <div class="space-y-1.5">
            <label for="company" class="text-sm font-medium text-slate-700">
              Nome da empresa / clínica *
            </label>
            <UiInput
              id="company"
              v-model="companyName"
              type="text"
              placeholder="Ex: Clínica São Lucas"
              :invalid="Boolean(fieldErrors.company_name)"
              @update:model-value="clearFieldError('company_name')"
            />
            <p v-if="fieldErrors.company_name" class="text-xs text-red-600">
              {{ fieldErrors.company_name }}
            </p>
          </div>

          <div class="space-y-1.5">
            <label for="whatsapp" class="text-sm font-medium text-slate-700"> WhatsApp * </label>
            <div class="flex overflow-hidden rounded-lg border border-slate-200 focus-within:border-[#4338CA] focus-within:ring-2 focus-within:ring-[#4338CA]/20">
              <span
                class="inline-flex shrink-0 items-center border-r border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-600"
                aria-hidden="true"
              >
                +55
              </span>
              <input
                id="whatsapp"
                :value="whatsapp"
                type="tel"
                autocomplete="tel"
                placeholder="(11) 99999-9999"
                class="min-w-0 flex-1 border-0 bg-white px-3 py-2 text-sm text-brand-ink placeholder:text-brand-gray/80 focus:outline-none focus:ring-0"
                :class="fieldErrors.business_whatsapp ? 'bg-red-50/30' : ''"
                @input="onWhatsappInput(($event.target as HTMLInputElement).value)"
              />
            </div>
            <p v-if="fieldErrors.business_whatsapp" class="text-xs text-red-600">
              {{ fieldErrors.business_whatsapp }}
            </p>
          </div>

          <label class="flex cursor-pointer items-start gap-2.5 text-sm leading-snug text-slate-600">
            <input
              v-model="acceptedTerms"
              type="checkbox"
              class="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-[#4338CA] focus:ring-[#4338CA]"
              @change="clearFieldError('terms_accepted')"
            />
            <span>
              Li e concordo com os
              <a
                :href="termsUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="font-semibold text-[#4338CA] hover:underline"
              >
                Termos de Uso
              </a>
              e a
              <a
                :href="privacyUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="font-semibold text-[#4338CA] hover:underline"
              >
                Política de Privacidade
              </a>
              .
            </span>
          </label>
          <p v-if="fieldErrors.terms_accepted" class="text-xs text-red-600">
            {{ fieldErrors.terms_accepted }}
          </p>
        </form>
      </div>

      <footer
        class="flex flex-col-reverse items-stretch justify-between gap-4 border-t border-slate-200 bg-slate-50/50 px-6 py-4 sm:flex-row sm:items-center sm:px-8"
      >
        <p class="text-sm text-slate-600">
          Já tem conta?
          <RouterLink
            :to="{ name: 'login' }"
            class="font-semibold text-[#4338CA] hover:underline"
          >
            Entrar
          </RouterLink>
        </p>
        <UiButton
          type="button"
          variant="primary"
          size="lg"
          class="!bg-[#4338CA] hover:!bg-brand-indigo-hover"
          :disabled="auth.loading"
          @click="onSubmit"
        >
          {{ auth.loading ? 'Aguarde…' : 'Continuar' }}
          <ArrowRight v-if="!auth.loading" class="h-4 w-4" aria-hidden="true" />
        </UiButton>
      </footer>
      </UiCard>

      <UiCard
        padding="lg"
        class="rounded-2xl border border-slate-200/90 bg-brand-mist/40 shadow-sm lg:col-span-5 lg:self-stretch"
      >
        <p
          class="inline-flex items-center gap-1.5 rounded-full border border-[#4338CA]/15 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#4338CA]"
        >
          Vantagens do ecossistema
        </p>
        <h2 class="mt-4 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          Por que escolher o Rappeli
        </h2>
        <ul class="mt-6 space-y-3">
          <li class="flex gap-3.5 rounded-xl border border-slate-200/80 bg-white p-4">
            <div
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-mist text-[#4338CA]"
            >
              <Share2 class="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p class="text-sm font-bold text-slate-900">API Oficial WhatsApp</p>
              <p class="mt-0.5 text-xs leading-relaxed text-slate-600">
                Conexão oficial Cloud API sem risco de bloqueio e com estabilidade profissional.
              </p>
            </div>
          </li>
          <li class="flex gap-3.5 rounded-xl border border-slate-200/80 bg-white p-4">
            <div
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-mist text-[#4338CA]"
            >
              <Users class="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p class="text-sm font-bold text-slate-900">Usuários ilimitados</p>
              <p class="mt-0.5 text-xs leading-relaxed text-slate-600">
                Toda a sua equipe na mesma conta sem custos adicionais por operador.
              </p>
            </div>
          </li>
          <li class="flex gap-3.5 rounded-xl border border-slate-200/80 bg-white p-4">
            <div
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-mist text-[#4338CA]"
            >
              <Handshake class="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p class="text-sm font-bold text-slate-900">Implantação inclusa</p>
              <p class="mt-0.5 text-xs leading-relaxed text-slate-600">
                Acompanhamento humanizado na configuração inicial sem taxa extra.
              </p>
            </div>
          </li>
          <li class="flex gap-3.5 rounded-xl border border-slate-200/80 bg-white p-4">
            <div
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-mist text-[#4338CA]"
            >
              <LockOpen class="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p class="text-sm font-bold text-slate-900">Sem fidelidade</p>
              <p class="mt-0.5 text-xs leading-relaxed text-slate-600">
                Altere de plano ou cancele sua assinatura a qualquer momento com 1 clique.
              </p>
            </div>
          </li>
        </ul>
        <p
          class="mt-8 flex flex-col gap-2 border-t border-slate-200/80 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between"
        >
          <span>Criptografia de ponta a ponta</span>
          <span>Suporte em português</span>
        </p>
      </UiCard>
    </div>
  </OnboardingShell>
</template>
