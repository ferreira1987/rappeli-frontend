<script setup lang="ts">
import { ArrowRight, CircleHelp, Eye, EyeOff, Lock, Mail } from '@lucide/vue'
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
  <div class="flex min-h-screen flex-col overflow-hidden lg:flex-row lg:min-h-screen">
    <AuthMarketingPanel />

    <main class="flex flex-1 flex-col justify-between overflow-y-auto bg-[#f8fafc]">
      <header
        class="mb-6 flex items-center justify-end gap-6 px-6 py-4 text-xs text-slate-500 sm:text-sm lg:mb-0 lg:px-12"
      >
        <a href="#" class="inline-flex items-center gap-1.5 hover:text-slate-800" @click.prevent>
          <CircleHelp class="h-4 w-4 text-slate-400" aria-hidden="true" />
          Central de Ajuda
        </a>
        <a
          href="#"
          class="inline-flex items-center gap-1.5 font-semibold text-slate-600 hover:text-brand-indigo"
          @click.prevent
        >
          Suporte
          <ArrowRight class="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </header>

      <div class="mx-auto my-auto w-full max-w-md px-6 py-6 lg:px-12">
        <div class="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm lg:p-10">
          <header class="mb-6 text-left">
            <h1 class="font-display text-2xl font-bold tracking-tight text-slate-900">Entrar</h1>
            <p class="mt-1 text-sm text-slate-500">
              Acesse sua conta para gerenciar mensagens, lembretes e atendimentos.
            </p>
          </header>

          <form class="space-y-4" @submit.prevent="onSubmit">
            <div v-if="formError" class="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {{ formError }}
            </div>

            <div>
              <label for="email" class="text-xs font-semibold uppercase tracking-wider text-slate-700">
                E-mail profissional
              </label>
              <input
                id="email"
                v-model="email"
                type="email"
                autocomplete="email"
                required
                placeholder="seu@email.com"
                class="mt-1.5 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-brand-indigo focus:ring-1 focus:ring-brand-indigo"
              />
            </div>

            <div>
              <div class="mb-1.5 flex items-center justify-between">
                <label for="password" class="text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Senha
                </label>
                <a href="#" class="text-xs font-semibold text-brand-indigo hover:underline" @click.prevent>
                  Esqueceu a senha?
                </a>
              </div>
              <div class="relative">
                <input
                  id="password"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="current-password"
                  required
                  placeholder="••••••••"
                  class="w-full rounded-lg border border-slate-200 py-2.5 pl-3.5 pr-10 text-sm outline-none focus:border-brand-indigo focus:ring-1 focus:ring-brand-indigo"
                />
                <button
                  type="button"
                  class="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600"
                  :aria-label="showPassword ? 'Ocultar senha' : 'Mostrar senha'"
                  @click="showPassword = !showPassword"
                >
                  <EyeOff v-if="showPassword" class="h-4 w-4" />
                  <Eye v-else class="h-4 w-4" />
                </button>
              </div>
            </div>

            <label class="flex cursor-pointer items-center gap-2 pt-1 text-sm text-slate-600">
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
              class="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-indigo px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-brand-indigo-hover disabled:opacity-60"
            >
              {{ auth.loading ? 'Entrando…' : 'Entrar' }}
              <ArrowRight class="h-4 w-4" aria-hidden="true" />
            </button>
          </form>

          <p class="mt-6 text-center text-sm text-slate-500">
            Ainda não tem conta?
            <RouterLink :to="{ name: 'cadastro' }" class="ml-1 font-semibold text-brand-indigo hover:underline">
              Criar conta
            </RouterLink>
          </p>
        </div>
      </div>

      <AuthPageChrome hide-top />
    </main>
  </div>
</template>
