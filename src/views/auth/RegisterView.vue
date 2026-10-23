<script setup lang="ts">
import { ArrowRight, Eye, EyeOff, Lock, Mail, User } from '@lucide/vue'
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

import { registerRequest } from '@/api/auth'
import AuthMarketingPanel from '@/components/auth/AuthMarketingPanel.vue'
import AuthPageChrome from '@/components/auth/AuthPageChrome.vue'
import { getErrorMessage } from '@/utils/errors'

const router = useRouter()

const name = ref('')
const email = ref('')
const password = ref('')
const passwordConfirmation = ref('')
const acceptedTerms = ref(false)
const showPassword = ref(false)
const showPasswordConfirm = ref(false)
const loading = ref(false)
const formError = ref<string | null>(null)

const termsUrl = 'https://rappeli.com.br/termos'
const privacyUrl = 'https://rappeli.com.br/privacidade'

async function onSubmit(): Promise<void> {
  formError.value = null

  if (password.value !== passwordConfirmation.value) {
    formError.value = 'As senhas não coincidem. Verifique e tente novamente.'
    return
  }

  if (!acceptedTerms.value) {
    formError.value = 'Aceite os Termos de Uso e a Política de Privacidade para continuar.'
    return
  }

  loading.value = true

  try {
    await registerRequest({
      name: name.value.trim(),
      email: email.value.trim(),
      password: password.value,
      password_confirmation: passwordConfirmation.value,
    })
    await router.push({ name: 'login', query: { registered: '1' } })
  } catch (error) {
    formError.value =
      getErrorMessage(error) ||
      'Não foi possível criar sua conta. O cadastro ainda pode não estar disponível no servidor — tente novamente mais tarde.'
  } finally {
    loading.value = false
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

          <button
            type="button"
            disabled
            class="mt-8 flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 opacity-60"
          >
            <span class="text-base font-bold text-slate-500">G</span>
            Continuar com Google
          </button>

          <div
            class="my-6 flex items-center gap-3 text-[11px] font-semibold tracking-wide text-slate-400"
          >
            <span class="h-px flex-1 bg-slate-200" />
            OU CONTINUE COM E-MAIL
            <span class="h-px flex-1 bg-slate-200" />
          </div>

          <form class="space-y-4" @submit.prevent="onSubmit">
            <div v-if="formError" class="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
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
                  class="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none ring-brand-indigo focus:border-brand-indigo focus:ring-2"
                />
              </div>
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
                  class="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none ring-brand-indigo focus:border-brand-indigo focus:ring-2"
                />
              </div>
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
                  class="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-11 text-sm outline-none ring-brand-indigo focus:border-brand-indigo focus:ring-2"
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
                  class="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-11 text-sm outline-none ring-brand-indigo focus:border-brand-indigo focus:ring-2"
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
            </div>

            <label class="flex cursor-pointer items-start gap-2 text-sm text-slate-600">
              <input
                v-model="acceptedTerms"
                type="checkbox"
                required
                class="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-indigo focus:ring-brand-indigo"
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

            <button
              type="submit"
              :disabled="loading"
              class="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-indigo px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-indigo-hover disabled:opacity-60"
            >
              {{ loading ? 'Criando conta…' : 'Criar conta grátis' }}
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
