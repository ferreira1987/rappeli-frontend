<script setup lang="ts">
import {
  ArrowRight,
  CalendarClock,
  Car,
  CircleHelp,
  Eye,
  EyeOff,
  Headphones,
  Lock,
  Mail,
} from '@lucide/vue'
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import RappeliLogo from '@/components/brand/RappeliLogo.vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const activeTab = ref<'login' | 'register'>('login')
const email = ref('')
const password = ref('')
const remember = ref(true)
const showPassword = ref(false)
const formError = ref<string | null>(null)

async function onSubmit(): Promise<void> {
  if (activeTab.value !== 'login') {
    return
  }

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
    <section
      class="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-ink via-[#14123a] to-brand-indigo px-10 py-10 text-white lg:flex lg:w-[42%] xl:w-[40%]"
    >
      <div>
        <div class="flex items-center gap-3">
          <RappeliLogo mode="symbol" />
          <span class="font-display text-2xl font-semibold tracking-tight text-white">rappeli</span>
        </div>
        <p
          class="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold tracking-wider text-indigo-100"
        >
          <span class="h-2 w-2 rounded-full bg-brand-coral" aria-hidden="true" />
          WHATSAPP AUTOMATION PLATFORM
        </p>
        <h2 class="mt-8 max-w-md font-display text-3xl font-bold leading-tight">
          Automatize os atendimentos e avisos da sua oficina mecânica
        </h2>
        <p class="mt-4 max-w-md text-sm leading-relaxed text-indigo-100/90">
          Reduza o esforço manual da sua recepção, envie atualizações de serviços em tempo real e
          mantenha o pátio da oficina sempre em movimento.
        </p>

        <ul class="mt-10 space-y-6">
          <li class="flex gap-4">
            <span
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-indigo-200"
            >
              <CalendarClock class="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p class="font-semibold">Lembretes de revisão automáticos</p>
              <p class="mt-1 text-sm text-indigo-100/80">
                Dispare avisos preventivos para manutenções programadas sem planilhas manuais.
              </p>
            </div>
          </li>
          <li class="flex gap-4">
            <span
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-indigo-200"
            >
              <Car class="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p class="font-semibold">Aviso de orçamento pronto e veículo pronto para retirada</p>
              <p class="mt-1 text-sm text-indigo-100/80">
                Notifique clientes no momento certo para aprovar serviços e retirar o veículo.
              </p>
            </div>
          </li>
          <li class="flex gap-4">
            <span
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-indigo-200"
            >
              <Headphones class="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p class="font-semibold">Equipe livre de respostas repetitivas</p>
              <p class="mt-1 text-sm text-indigo-100/80">
                Atendimento inicial dinâmico e confirmações automáticas para a recepção focar no
                pátio.
              </p>
            </div>
          </li>
        </ul>
      </div>
    </section>

    <section class="flex flex-1 flex-col bg-white">
      <div class="flex items-center justify-between px-6 py-5 lg:px-10">
        <RappeliLogo variant="dark" class="lg:hidden" />
        <div class="ml-auto flex items-center gap-4 text-sm text-slate-500">
          <a href="#" class="inline-flex items-center gap-1 hover:text-slate-800" @click.prevent>
            <CircleHelp class="h-4 w-4" />
            Ajuda
          </a>
          <a href="#" class="inline-flex items-center gap-1 hover:text-slate-800" @click.prevent>
            Falar com suporte
            <ArrowRight class="h-4 w-4" />
          </a>
        </div>
      </div>

      <div class="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 pb-10 lg:px-10">
        <h1 class="font-display text-2xl font-bold text-brand-ink">Acesse sua conta</h1>
        <p class="mt-2 text-sm text-slate-500">
          Gerencie suas confirmações, mensagens e automações ativas.
        </p>

        <div
          class="mt-8 grid grid-cols-2 rounded-xl bg-slate-100 p-1 text-sm font-medium text-slate-600"
        >
          <button
            type="button"
            class="rounded-lg px-4 py-2 transition"
            :class="activeTab === 'login' ? 'bg-white text-slate-900 shadow-sm' : ''"
            @click="activeTab = 'login'"
          >
            Entrar
          </button>
          <button
            type="button"
            class="rounded-lg px-4 py-2 transition"
            :class="activeTab === 'register' ? 'bg-white text-slate-900 shadow-sm' : ''"
            @click="activeTab = 'register'"
          >
            Criar conta
          </button>
        </div>

        <template v-if="activeTab === 'login'">
          <button
            type="button"
            disabled
            class="mt-6 flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 opacity-60"
          >
            <span class="text-base font-bold text-slate-500">G</span>
            Continuar com Google
          </button>

          <div class="my-6 flex items-center gap-3 text-[11px] font-semibold tracking-wide text-slate-400">
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
            <button
              type="button"
              class="font-medium text-brand-indigo hover:underline"
              @click="activeTab = 'register'"
            >
              Crie sua conta grátis
            </button>
          </p>
        </template>

        <div
          v-else
          class="mt-8 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center"
        >
          <p class="text-sm font-medium text-slate-900">Cadastro em breve</p>
          <p class="mt-2 text-sm text-slate-500">
            O fluxo de criação de conta será disponibilizado em uma fase futura. Use suas credenciais
            para entrar.
          </p>
          <button
            type="button"
            class="mt-4 text-sm font-medium text-rappeli-primary hover:underline"
            @click="activeTab = 'login'"
          >
            Voltar para entrar
          </button>
        </div>

      </div>

      <footer
        class="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-6 py-4 text-[11px] text-slate-400 lg:px-10"
      >
        <span>© {{ new Date().getFullYear() }} Rappeli. Todos os direitos reservados.</span>
        <div class="flex gap-4">
          <a href="#" @click.prevent>Termos de Uso</a>
          <a href="#" @click.prevent>Privacidade</a>
          <a href="#" @click.prevent>Contato</a>
        </div>
      </footer>
    </section>
  </div>
</template>
