<script setup lang="ts">
import { ArrowRight, Eye, EyeOff, Lock, Mail } from '@lucide/vue'
import { ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import AuthMarketingPanel from '@/components/auth/AuthMarketingPanel.vue'
import AuthPageChrome from '@/components/auth/AuthPageChrome.vue'
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
  <div class="flex min-h-screen flex-col lg:flex-row">
    <AuthMarketingPanel />

    <section class="flex flex-1 flex-col bg-white">
      <AuthPageChrome>
        <div class="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 pb-10 lg:px-10">
          <h1 class="font-display text-2xl font-bold text-brand-ink">Acesse sua conta</h1>
          <p class="mt-2 text-sm text-slate-500">
            Gerencie suas confirmações, mensagens e automações ativas.
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

          <form class="space-y-5" @submit.prevent="onSubmit">
            <div v-if="formError" class="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {{ formError }}
            </div>

            <div>
              <label for="email" class="text-xs font-semibold tracking-wide text-slate-500">
                E-MAIL PROFISSIONAL
              </label>
              <div class="relative mt-2">
                <Mail
                  class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  id="email"
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
              <div class="flex items-center justify-between">
                <label for="password" class="text-xs font-semibold tracking-wide text-slate-500">
                  SENHA
                </label>
                <a href="#" class="text-xs font-medium text-brand-indigo hover:underline" @click.prevent>
                  Esqueci minha senha
                </a>
              </div>
              <div class="relative mt-2">
                <Lock
                  class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  id="password"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="current-password"
                  required
                  placeholder="Digite sua senha de acesso"
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

            <label class="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
              <input
                v-model="remember"
                type="checkbox"
                class="h-4 w-4 rounded border-slate-300 text-brand-indigo focus:ring-brand-indigo"
              />
              Lembrar de mim por 30 dias
            </label>

            <button
              type="submit"
              :disabled="auth.loading"
              class="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-indigo px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-indigo-hover disabled:opacity-60"
            >
              {{ auth.loading ? 'Entrando…' : 'Entrar na plataforma' }}
              <ArrowRight class="h-4 w-4" aria-hidden="true" />
            </button>
          </form>

          <p class="mt-6 text-center text-sm text-slate-500">
            Ainda não tem conta?
            <RouterLink to="/cadastro" class="font-medium text-brand-indigo hover:underline">
              Crie sua conta grátis
            </RouterLink>
          </p>
        </div>
      </AuthPageChrome>
    </section>
  </div>
</template>
