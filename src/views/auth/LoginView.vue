<script setup lang="ts">
import { Eye, EyeOff } from '@lucide/vue'
import { ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import AuthMarketingPanel from '@/components/auth/AuthMarketingPanel.vue'
import AuthPageChrome from '@/components/auth/AuthPageChrome.vue'
import RappeliLogo from '@/components/brand/RappeliLogo.vue'
import { UiButton, UiCard, UiInput } from '@/components/ui'
import {
  brandPasswordRecoveryMailto,
  brandSiteUrl,
  brandSupportMailto,
} from '@/constants/brandUrls'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const remember = ref(true)
const showPassword = ref(false)
const formError = ref<string | null>(null)

async function onSubmit(): Promise<void> {
  formError.value = null

  try {
    await auth.login({
      email: email.value.trim(),
      password: password.value,
      remember: remember.value,
    })

    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/painel'
    await router.replace(redirect)
  } catch {
    formError.value = auth.lastError
  }
}
</script>

<template>
  <div class="flex min-h-screen flex-col overflow-hidden lg:flex-row">
    <AuthMarketingPanel />

    <main class="flex min-h-screen flex-1 flex-col bg-brand-surface">
      <header
        class="flex shrink-0 items-center justify-end gap-4 px-6 py-5 text-sm text-slate-600 sm:px-10 lg:px-12"
      >
        <a
          :href="brandSiteUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="transition-colors hover:text-brand-indigo"
        >
          Central de Ajuda
        </a>
        <span class="h-4 w-px bg-slate-300" aria-hidden="true" />
        <a :href="brandSupportMailto" class="font-medium transition-colors hover:text-brand-indigo">
          Suporte
        </a>
      </header>

      <div class="flex flex-1 flex-col justify-center px-6 pb-6 sm:px-10 lg:px-12">
        <div class="mx-auto mb-6 flex w-full max-w-[420px] items-center gap-3 lg:hidden">
          <RappeliLogo mode="symbol" class="h-9 w-9 shrink-0" />
          <span class="font-display text-xl font-bold leading-none tracking-tight text-slate-900">
            Rappeli
          </span>
        </div>

        <UiCard
          :bordered="false"
          padding="none"
          class="mx-auto w-full max-w-[500px] !rounded-2xl border border-slate-200/90 p-8 shadow-sm sm:p-10"
        >
          <header class="mb-8 text-left">
            <h1 class="text-2xl font-bold tracking-tight text-slate-900">Entrar</h1>
            <p class="mt-2 text-sm leading-relaxed text-slate-500">
              Acesse sua conta para gerenciar mensagens, lembretes e atendimentos.
            </p>
          </header>

          <form class="space-y-5" :aria-busy="auth.loading || undefined" @submit.prevent="onSubmit">
            <div
              v-if="formError"
              role="alert"
              class="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {{ formError }}
            </div>

            <div class="space-y-1.5">
              <label for="login-email" class="text-sm font-medium text-slate-700">
                E-mail profissional
              </label>
              <UiInput
                id="login-email"
                v-model="email"
                type="email"
                autocomplete="email"
                required
                placeholder="seu@email.com"
              />
            </div>

            <div class="space-y-1.5">
              <div class="flex items-center justify-between gap-3">
                <label for="login-password" class="text-sm font-medium text-slate-700">
                  Senha
                </label>
                <a
                  :href="brandPasswordRecoveryMailto"
                  class="text-sm font-semibold text-brand-indigo hover:underline"
                >
                  Esqueceu a senha?
                </a>
              </div>
              <div class="relative">
                <UiInput
                  id="login-password"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="current-password"
                  required
                  placeholder="••••••••"
                  input-class="pr-12"
                />
                <button
                  type="button"
                  class="absolute inset-y-0 right-0 flex min-h-11 min-w-11 items-center justify-center text-slate-400 transition-colors hover:text-slate-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-indigo"
                  :aria-label="showPassword ? 'Ocultar senha' : 'Mostrar senha'"
                  @click="showPassword = !showPassword"
                >
                  <EyeOff v-if="showPassword" class="h-4 w-4" aria-hidden="true" />
                  <Eye v-else class="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            <label class="flex min-h-11 cursor-pointer items-center gap-2.5 text-sm text-slate-600">
              <input
                v-model="remember"
                type="checkbox"
                class="h-4 w-4 shrink-0 rounded border-slate-300 text-brand-indigo focus:ring-brand-indigo"
              />
              Lembrar de mim por 30 dias
            </label>

            <UiButton
              type="submit"
              variant="primary"
              size="lg"
              :disabled="auth.loading"
              class="!w-full py-3"
            >
              {{ auth.loading ? 'Entrando…' : 'Entrar' }}
            </UiButton>
          </form>

          <p class="mt-8 text-center text-sm text-slate-500">
            Ainda não tem conta?
            <RouterLink
              :to="{ name: 'cadastro' }"
              class="ml-1 font-semibold text-brand-indigo hover:underline"
            >
              Criar conta
            </RouterLink>
          </p>
        </UiCard>
      </div>

      <AuthPageChrome hide-top />
    </main>
  </div>
</template>
