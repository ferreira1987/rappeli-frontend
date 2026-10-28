<script setup lang="ts">
import { ArrowRight, Eye, EyeOff, Loader2, Lock } from '@lucide/vue'
import axios from 'axios'
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import { acceptTeamInvitation, fetchTeamInvitationPreview } from '@/api/team'
import InviteMarketingPanel from '@/components/auth/InviteMarketingPanel.vue'
import { useAuthStore } from '@/stores/auth'
import type { TeamAgentRole, TeamInvitationPreview } from '@/types/team'
import { getErrorMessage, getValidationErrors } from '@/utils/errors'
import { inviteInvalidDisplayMessage } from '@/utils/inviteMessage'
import { roleLabels } from '@/utils/teamLabels'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

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

const previewLoading = ref(false)
const preview = ref<TeamInvitationPreview | null>(null)
const previewLoadError = ref<string | null>(null)

const INVITE_INVALID_MESSAGE = 'Convite inválido ou expirado'

function isInviteTokenError(status: number | undefined, validation: Record<string, string> | null): boolean {
  if (validation?.token) return true
  return status === 404 || status === 403 || status === 410 || status === 400
}

const termsUrl = 'https://rappeli.com.br/termos'
const privacyUrl = 'https://rappeli.com.br/privacidade'

const missingToken = computed(() => token.value.trim() === '')

const previewReady = computed(() => preview.value?.valid === true && !previewLoading.value)

const invalidPreviewMessage = computed(() => {
  if (previewLoadError.value) {
    return inviteInvalidDisplayMessage(previewLoadError.value, INVITE_INVALID_MESSAGE)
  }
  if (preview.value && !preview.value.valid) {
    return inviteInvalidDisplayMessage(preview.value.message, INVITE_INVALID_MESSAGE)
  }
  return INVITE_INVALID_MESSAGE
})

function roleLabel(role: string | null): string {
  if (!role) return '—'
  return roleLabels[role as TeamAgentRole] ?? role
}

async function loadPreview(): Promise<void> {
  if (missingToken.value) {
    preview.value = null
    previewLoadError.value = null
    inviteInvalid.value = false
    return
  }
  previewLoading.value = true
  previewLoadError.value = null
  preview.value = null
  inviteInvalid.value = false
  try {
    preview.value = await fetchTeamInvitationPreview(token.value)
    if (!preview.value.valid) {
      inviteInvalid.value = true
    }
  } catch (error) {
    previewLoadError.value = getErrorMessage(error)
    inviteInvalid.value = true
  } finally {
    previewLoading.value = false
  }
}

onMounted(() => {
  void loadPreview()
})

watch(token, () => {
  void loadPreview()
})

async function onSubmit(): Promise<void> {
  formError.value = null
  fieldErrors.value = {}

  if (missingToken.value || !previewReady.value) {
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
    auth.user = user
    auth.bootstrapped = true
    await router.replace('/painel')
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
    <InviteMarketingPanel />
    <main class="flex min-h-screen flex-1 flex-col justify-between bg-white">
      <header
        class="flex items-center justify-between border-b border-slate-200/60 px-4 py-4 md:px-8 lg:justify-end"
      >
        <div class="flex items-center gap-2 lg:hidden">
          <span class="font-display text-lg font-bold text-brand-indigo">Rappeli</span>
        </div>
        <a href="#" class="text-sm font-semibold text-brand-gray hover:text-brand-indigo" @click.prevent>
          Suporte
        </a>
      </header>

      <div class="flex flex-1 items-center justify-center px-4 py-8 md:px-8">
        <div class="w-full max-w-lg space-y-6">
          <h1 class="font-display text-2xl font-bold text-brand-ink">Aceitar convite</h1>
          <p class="mt-2 text-sm text-slate-500">Crie sua senha para entrar na equipe.</p>

          <div
            v-if="missingToken"
            class="mt-8 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
            role="alert"
          >
            Este link está incompleto. Abra o convite enviado por e-mail ou peça um novo link ao administrador.
          </div>

          <div v-else-if="previewLoading" class="mt-12 flex flex-col items-center gap-3 text-sm text-brand-gray">
            <Loader2 class="h-8 w-8 animate-spin text-brand-indigo" aria-label="Validando convite" />
            Validando convite…
          </div>

          <div
            v-else-if="(inviteInvalid || previewLoadError) && !missingToken"
            class="mt-8 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            role="alert"
          >
            <p class="font-medium">{{ invalidPreviewMessage }}</p>
          </div>

          <form v-else-if="previewReady" class="space-y-4" novalidate @submit.prevent="onSubmit">
            <div
              class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div class="flex items-center justify-between border-b border-slate-100 pb-2">
                <span class="text-[11px] font-semibold uppercase tracking-wider text-brand-gray">
                  Detalhes do acesso
                </span>
                <span
                  class="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-900"
                >
                  Convite pendente
                </span>
              </div>
              <div class="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 text-sm">
                <div>
                  <p class="text-[11px] font-semibold uppercase text-brand-gray">Nome</p>
                  <p class="font-semibold text-brand-ink">{{ preview?.name || 'Novo membro' }}</p>
                </div>
                <div>
                  <p class="text-[11px] font-semibold uppercase text-brand-gray">E-mail</p>
                  <p class="truncate font-semibold text-brand-ink">{{ preview?.email }}</p>
                </div>
                <div v-if="preview?.company_name">
                  <p class="text-[11px] font-semibold uppercase text-brand-gray">Empresa</p>
                  <p class="font-semibold text-brand-ink">{{ preview.company_name }}</p>
                </div>
                <div v-if="preview?.role">
                  <p class="text-[11px] font-semibold uppercase text-brand-gray">Papel</p>
                  <span
                    class="mt-0.5 inline-flex rounded-full border border-slate-200 bg-brand-mist px-2 py-0.5 text-xs font-semibold text-brand-indigo"
                  >
                    {{ roleLabel(preview.role) }}
                  </span>
                </div>
              </div>
            </div>

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
              class="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-indigo py-2.5 text-sm font-semibold text-white hover:bg-brand-indigo-hover disabled:opacity-60"
              :disabled="submitting"
            >
              {{ submitting ? 'Ativando…' : 'Ativar conta' }}
              <ArrowRight v-if="!submitting" class="h-4 w-4" />
            </button>

            <p class="text-center text-sm text-brand-gray">
              Já tem conta?
              <RouterLink :to="{ name: 'login' }" class="font-semibold text-brand-indigo hover:underline">Entrar</RouterLink>
            </p>
          </form>
        </div>
      </div>

      <footer class="border-t border-slate-200/60 px-4 py-4 text-center text-xs text-brand-gray md:px-8">
        © {{ new Date().getFullYear() }} Rappeli. Todos os direitos reservados.
      </footer>
    </main>
  </div>
</template>
