<script setup lang="ts">
import { CheckCircle2, Eye, EyeOff, Lock } from '@lucide/vue'
import axios from 'axios'
import { computed, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import { acceptTeamInvitation } from '@/api/team'
import AuthMarketingPanel from '@/components/auth/AuthMarketingPanel.vue'
import AuthPageChrome from '@/components/auth/AuthPageChrome.vue'
import { getErrorMessage, getValidationErrors } from '@/utils/errors'

const route = useRoute()

const token = computed(() => {
  const value = route.query.token
  return typeof value === 'string' ? value : ''
})

const password = ref('')
const passwordConfirmation = ref('')
const acceptedTerms = ref(false)
const showPassword = ref(false)
const submitting = ref(false)
const formError = ref<string | null>(null)
const fieldErrors = ref<Record<string, string>>({})
const inviteInvalid = ref(false)
const success = ref<{ name: string; email: string } | null>(null)

const INVITE_INVALID_MESSAGE = 'Convite inválido ou expirado'

function isInviteTokenError(status: number | undefined, validation: Record<string, string> | null): boolean {
  if (validation?.token) return true
  return status === 404 || status === 403 || status === 410 || status === 400
}

const termsUrl = 'https://rappeli.com.br/termos'
const privacyUrl = 'https://rappeli.com.br/privacidade'

const missingToken = computed(() => token.value.trim() === '')

async function onSubmit(): Promise<void> {
  formError.value = null
  fieldErrors.value = {}

  if (missingToken.value) {
    formError.value = 'Link de convite inválido. Verifique o token na URL.'
    return
  }

  if (!acceptedTerms.value) {
    fieldErrors.value = {
      terms_accepted: 'Você precisa aceitar os Termos de Uso e a Política de Privacidade.',
    }
    return
  }

  submitting.value = true
  try {
    const user = await acceptTeamInvitation({
      token: token.value,
      password: password.value,
      password_confirmation: passwordConfirmation.value,
      terms_accepted: true,
    })
    success.value = { name: user.name, email: user.email }
  } catch (error) {
    const validation = getValidationErrors(error)
    const status = axios.isAxiosError(error) ? error.response?.status : undefined

    if (validation) {
      fieldErrors.value = validation
      if (isInviteTokenError(status, validation)) {
        inviteInvalid.value = true
        formError.value = INVITE_INVALID_MESSAGE
      } else {
        formError.value = null
      }
    } else if (isInviteTokenError(status, null)) {
      inviteInvalid.value = true
      formError.value = INVITE_INVALID_MESSAGE
      fieldErrors.value = {}
    } else {
      formError.value = getErrorMessage(error)
    }
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen flex-col lg:flex-row">
    <AuthMarketingPanel />
    <section class="flex flex-1 flex-col bg-white">
      <AuthPageChrome>
        <div class="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 pb-10 lg:px-10">
          <h1 class="font-display text-2xl font-bold text-brand-ink">Aceitar convite</h1>
          <p class="mt-2 text-sm text-slate-500">Crie sua senha para entrar na equipe.</p>

      <div v-if="missingToken && !success" class="mt-8 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900" role="alert">
        Este link está incompleto. Abra o convite enviado por e-mail ou peça um novo link ao administrador.
      </div>

      <div
        v-else-if="success"
        class="mt-8 space-y-4 text-center"
        role="status"
      >
        <CheckCircle2 class="mx-auto h-12 w-12 text-emerald-600" aria-hidden="true" />
        <h2 class="font-display text-xl font-bold text-brand-ink">Conta ativada</h2>
        <p class="text-sm text-brand-gray">
          {{ success.name }}, sua conta <strong class="text-brand-ink">{{ success.email }}</strong> está pronta.
        </p>
        <RouterLink
          :to="{ name: 'login' }"
          class="inline-flex w-full items-center justify-center rounded-lg bg-brand-indigo px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-indigo-hover"
        >
          Ir para o login
        </RouterLink>
      </div>

      <form v-else class="mt-8 space-y-4" novalidate @submit.prevent="onSubmit">
        <div
          v-if="inviteInvalid"
          class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          <p class="font-medium">{{ INVITE_INVALID_MESSAGE }}</p>
          <p v-if="fieldErrors.token" class="mt-1 text-red-700">{{ fieldErrors.token }}</p>
        </div>
        <p
          v-else-if="formError"
          class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {{ formError }}
        </p>
        <ul
          v-if="Object.keys(fieldErrors).length && !inviteInvalid"
          class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          <li v-for="(message, key) in fieldErrors" :key="key">{{ message }}</li>
        </ul>

        <div>
          <label class="mb-1 block text-sm font-medium text-brand-ink" for="invite-password">Senha *</label>
          <div class="relative">
            <Lock class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-gray" />
            <input
              id="invite-password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="new-password"
              class="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-10 text-sm"
            />
            <button
              type="button"
              class="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-brand-gray hover:text-brand-ink"
              :aria-label="showPassword ? 'Ocultar senha' : 'Mostrar senha'"
              @click="showPassword = !showPassword"
            >
              <EyeOff v-if="showPassword" class="h-4 w-4" />
              <Eye v-else class="h-4 w-4" />
            </button>
          </div>
          <p v-if="fieldErrors.password" class="mt-1 text-xs text-red-600">{{ fieldErrors.password }}</p>
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-brand-ink" for="invite-password-confirm">Confirmar senha *</label>
          <input
            id="invite-password-confirm"
            v-model="passwordConfirmation"
            type="password"
            autocomplete="new-password"
            class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <p v-if="fieldErrors.password_confirmation" class="mt-1 text-xs text-red-600">
            {{ fieldErrors.password_confirmation }}
          </p>
        </div>

        <label class="flex items-start gap-2 text-sm text-brand-gray">
          <input v-model="acceptedTerms" type="checkbox" class="mt-1 rounded text-brand-indigo" />
          <span>
            Aceito os
            <a :href="termsUrl" class="font-medium text-brand-indigo hover:underline" target="_blank" rel="noopener">Termos de Uso</a>
            e a
            <a :href="privacyUrl" class="font-medium text-brand-indigo hover:underline" target="_blank" rel="noopener">Política de Privacidade</a>.
          </span>
        </label>
        <p v-if="fieldErrors.terms_accepted" class="text-xs text-red-600">{{ fieldErrors.terms_accepted }}</p>

        <button
          type="submit"
          class="w-full rounded-lg bg-brand-indigo py-2.5 text-sm font-semibold text-white hover:bg-brand-indigo-hover disabled:opacity-60"
          :disabled="submitting"
        >
          {{ submitting ? 'Ativando…' : 'Ativar conta' }}
        </button>

        <p class="text-center text-sm text-brand-gray">
          Já tem conta?
          <RouterLink :to="{ name: 'login' }" class="font-semibold text-brand-indigo hover:underline">Entrar</RouterLink>
        </p>
      </form>
        </div>
      </AuthPageChrome>
    </section>
  </div>
</template>
