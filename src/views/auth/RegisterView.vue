<script setup lang="ts">
import { ArrowRight, Eye, EyeOff, Lock, Mail, User } from '@lucide/vue'
import { ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import AuthMarketingPanel from '@/components/auth/AuthMarketingPanel.vue'
import AuthPageChrome from '@/components/auth/AuthPageChrome.vue'
import { useAuthStore } from '@/stores/auth'
import { getErrorMessage, getValidationErrors } from '@/utils/errors'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const name = ref('')
const email = ref('')
const password = ref('')
const passwordConfirmation = ref('')
const acceptedTerms = ref(false)
const showPassword = ref(false)
const showPasswordConfirm = ref(false)
const formError = ref<string | null>(null)
const fieldErrors = ref<Record<string, string>>({})

const termsUrl = 'https://rappeli.com.br/termos'
const privacyUrl = 'https://rappeli.com.br/privacidade'

function inputBorderClass(field: string): string {
  return fieldErrors.value[field]
    ? 'border-red-300 focus:border-red-400 focus:ring-red-200'
    : 'border-slate-200 focus:border-brand-indigo focus:ring-brand-indigo'
}

async function onSubmit(): Promise<void> {
  formError.value = null
  fieldErrors.value = {}

  if (password.value !== passwordConfirmation.value) {
    fieldErrors.value = {
      password_confirmation: 'As senhas não coincidem.',
    }
    return
  }

  if (!acceptedTerms.value) {
    fieldErrors.value = {
      terms_accepted: 'Você precisa aceitar os Termos de Uso e a Política de Privacidade.',
    }
    return
  }

  try {
    await auth.register({
      name: name.value.trim(),
      email: email.value.trim(),
      password: password.value,
      password_confirmation: passwordConfirmation.value,
      terms_accepted: true,
    })

    const redirect =
      typeof route.query.redirect === 'string' ? route.query.redirect : '/assinatura/planos'
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
  <div class="flex min-h-screen flex-col lg:flex-row">
    <AuthMarketingPanel />

    <section class="flex flex-1 flex-col bg-white">
      <AuthPageChrome>
        <div class="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 pb-10 lg:px-10">
          <h1 class="font-display text-2xl font-bold text-brand-ink">Crie sua conta grátis</h1>
          <p class="mt-2 text-sm text-slate-500">
            Comece a automatizar confirmações, lembretes e avisos da sua empresa pelo WhatsApp.
          </p>

          <form class="mt-8 space-y-4" novalidate @submit.prevent="onSubmit">
            <div v-if="formError" class="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
              {{ formError }}
            </div>

            <div>
              <label for="name" class="text-xs font-semibold tracking-wide text-slate-500">NOME</label>
              <div class="relative mt-2">
                <User
                  class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  id="name"
                  v-model="name"
                  type="text"
                  autocomplete="name"
                  required
                  placeholder="Seu nome completo"
                  :aria-invalid="fieldErrors.name ? 'true' : undefined"
                  :class="[
                    'w-full rounded-xl border py-3 pl-10 pr-4 text-sm outline-none ring-2 ring-transparent',
                    inputBorderClass('name'),
                  ]"
                />
              </div>
              <p v-if="fieldErrors.name" class="mt-1.5 text-xs text-red-600" role="alert">
                {{ fieldErrors.name }}
              </p>
            </div>

            <div>
              <label for="register-email" class="text-xs font-semibold tracking-wide text-slate-500">
                E-MAIL PROFISSIONAL
              </label>
              <div class="relative mt-2">
                <Mail
                  class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  id="register-email"
                  v-model="email"
                  type="email"
                  autocomplete="email"
                  required
                  placeholder="contato@exemplo.com.br"
                  :aria-invalid="fieldErrors.email ? 'true' : undefined"
                  :class="[
                    'w-full rounded-xl border py-3 pl-10 pr-4 text-sm outline-none ring-2 ring-transparent',
                    inputBorderClass('email'),
                  ]"
                />
              </div>
              <p v-if="fieldErrors.email" class="mt-1.5 text-xs text-red-600" role="alert">
                {{ fieldErrors.email }}
              </p>
            </div>

            <div>
              <label for="register-password" class="text-xs font-semibold tracking-wide text-slate-500">
                SENHA
              </label>
              <div class="relative mt-2">
                <Lock
                  class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  id="register-password"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="new-password"
                  required
                  minlength="8"
                  placeholder="Crie uma senha de acesso"
                  :aria-invalid="fieldErrors.password ? 'true' : undefined"
                  :class="[
                    'w-full rounded-xl border py-3 pl-10 pr-11 text-sm outline-none ring-2 ring-transparent',
                    inputBorderClass('password'),
                  ]"
                />
                <button
                  type="button"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  :aria-label="showPassword ? 'Ocultar senha' : 'Mostrar senha'"
                  @click="showPassword = !showPassword"
                >
                  <EyeOff v-if="showPassword" class="h-4 w-4" />
                  <Eye v-else class="h-4 w-4" />
                </button>
              </div>
              <p v-if="fieldErrors.password" class="mt-1.5 text-xs text-red-600" role="alert">
                {{ fieldErrors.password }}
              </p>
            </div>

            <div>
              <label
                for="register-password-confirm"
                class="text-xs font-semibold tracking-wide text-slate-500"
              >
                CONFIRMAR SENHA
              </label>
              <div class="relative mt-2">
                <Lock
                  class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  id="register-password-confirm"
                  v-model="passwordConfirmation"
                  :type="showPasswordConfirm ? 'text' : 'password'"
                  autocomplete="new-password"
                  required
                  minlength="8"
                  placeholder="Repita a senha"
                  :aria-invalid="fieldErrors.password_confirmation ? 'true' : undefined"
                  :class="[
                    'w-full rounded-xl border py-3 pl-10 pr-11 text-sm outline-none ring-2 ring-transparent',
                    inputBorderClass('password_confirmation'),
                  ]"
                />
                <button
                  type="button"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  :aria-label="showPasswordConfirm ? 'Ocultar senha' : 'Mostrar senha'"
                  @click="showPasswordConfirm = !showPasswordConfirm"
                >
                  <EyeOff v-if="showPasswordConfirm" class="h-4 w-4" />
                  <Eye v-else class="h-4 w-4" />
                </button>
              </div>
              <p
                v-if="fieldErrors.password_confirmation"
                class="mt-1.5 text-xs text-red-600"
                role="alert"
              >
                {{ fieldErrors.password_confirmation }}
              </p>
            </div>

            <div>
              <label class="flex cursor-pointer items-start gap-2 text-sm text-slate-600">
                <input
                  v-model="acceptedTerms"
                  type="checkbox"
                  required
                  class="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-indigo focus:ring-brand-indigo"
                  :aria-invalid="fieldErrors.terms_accepted ? 'true' : undefined"
                />
                <span>
                  Li e aceito os
                  <a
                    :href="termsUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="font-medium text-brand-indigo hover:underline"
                  >
                    Termos de Uso
                  </a>
                  e a
                  <a
                    :href="privacyUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="font-medium text-brand-indigo hover:underline"
                  >
                    Política de Privacidade
                  </a>.
                </span>
              </label>
              <p v-if="fieldErrors.terms_accepted" class="mt-1.5 text-xs text-red-600" role="alert">
                {{ fieldErrors.terms_accepted }}
              </p>
            </div>

            <button
              type="submit"
              :disabled="auth.loading"
              class="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-indigo px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-indigo-hover disabled:opacity-60"
            >
              {{ auth.loading ? 'Criando conta…' : 'Criar conta grátis' }}
              <ArrowRight class="h-4 w-4" aria-hidden="true" />
            </button>
          </form>

          <p class="mt-6 text-center text-sm text-slate-500">
            Já tem conta?
            <RouterLink :to="{ name: 'login' }" class="font-medium text-brand-indigo hover:underline">
              Entrar
            </RouterLink>
          </p>
        </div>
      </AuthPageChrome>
    </section>
  </div>
</template>
