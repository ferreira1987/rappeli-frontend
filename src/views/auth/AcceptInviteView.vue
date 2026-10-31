<script setup lang="ts">
import { ArrowRight, Eye, EyeOff, Loader2 } from '@lucide/vue'
import axios from 'axios'
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import { acceptTeamInvitation, fetchTeamInvitationPreview } from '@/api/team'
import AuthPageChrome from '@/components/auth/AuthPageChrome.vue'
import InviteMarketingPanel from '@/components/auth/InviteMarketingPanel.vue'
import RappeliLogo from '@/components/brand/RappeliLogo.vue'
import { UiButton, UiCard, UiInput } from '@/components/ui'
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
  <div class="flex min-h-screen flex-col overflow-hidden lg:flex-row">
    <InviteMarketingPanel placement="sidebar" />

    <main class="flex min-h-screen flex-1 flex-col bg-[#F8FAFC]">
      <header
        class="flex shrink-0 items-center justify-end gap-4 px-6 py-5 text-sm text-slate-600 sm:px-10 lg:px-12"
      >
        <a href="#" class="hover:text-[#4338CA]" @click.prevent>Central de Ajuda</a>
        <span class="h-4 w-px bg-slate-300" aria-hidden="true" />
        <a href="#" class="font-medium hover:text-[#4338CA]" @click.prevent>Suporte</a>
      </header>

      <div class="flex flex-1 flex-col justify-center px-6 pb-6 sm:px-10 lg:px-12">
        <div class="mx-auto mb-6 flex w-full max-w-[460px] items-center gap-3 lg:hidden">
          <RappeliLogo mode="symbol" class="h-9 w-9 shrink-0" />
          <span class="font-display text-xl font-bold leading-none tracking-tight text-slate-900">
            Rappeli
          </span>
        </div>

        <div class="mx-auto w-full max-w-[460px]">
        <UiCard
          :bordered="false"
          padding="none"
          class="w-full !rounded-xl border border-slate-200/90 p-7 shadow-sm sm:p-8"
        >
          <header class="mb-6 text-left">
            <h1 class="text-2xl font-bold tracking-tight text-slate-900">Aceitar convite</h1>
            <p class="mt-2 text-sm leading-relaxed text-slate-500">
              Crie sua senha para entrar na equipe.
            </p>
          </header>

          <div
            v-if="missingToken"
            class="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
            role="alert"
          >
            Este link está incompleto. Abra o convite enviado por e-mail ou peça um novo link ao administrador.
          </div>

          <div
            v-else-if="previewLoading"
            class="flex flex-col items-center gap-3 py-8 text-sm text-slate-600"
          >
            <Loader2 class="h-8 w-8 animate-spin text-[#4338CA]" aria-label="Validando convite" />
            Validando convite…
          </div>

          <div
            v-else-if="(inviteInvalid || previewLoadError) && !missingToken"
            class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            role="alert"
          >
            <p class="font-medium">{{ invalidPreviewMessage }}</p>
          </div>

          <form v-else-if="previewReady" class="space-y-5" novalidate @submit.prevent="onSubmit">
            <div class="rounded-xl border border-slate-200/90 bg-slate-50/50 p-4">
              <div class="flex items-center justify-between border-b border-slate-200/80 pb-2">
                <span class="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Detalhes do acesso
                </span>
                <span
                  class="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-900"
                >
                  Convite pendente
                </span>
              </div>
              <div class="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                <div>
                  <p class="text-[11px] font-semibold uppercase text-slate-500">Nome</p>
                  <p class="font-semibold text-slate-900">{{ preview?.name || 'Novo membro' }}</p>
                </div>
                <div>
                  <p class="text-[11px] font-semibold uppercase text-slate-500">E-mail</p>
                  <p class="truncate font-semibold text-slate-900">{{ preview?.email }}</p>
                </div>
                <div v-if="preview?.company_name">
                  <p class="text-[11px] font-semibold uppercase text-slate-500">Empresa</p>
                  <p class="font-semibold text-slate-900">{{ preview.company_name }}</p>
                </div>
                <div v-if="preview?.role">
                  <p class="text-[11px] font-semibold uppercase text-slate-500">Papel</p>
                  <span
                    class="mt-0.5 inline-flex rounded-full border border-slate-200 bg-[#EEF2FF] px-2 py-0.5 text-xs font-semibold text-[#4338CA]"
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

            <div class="space-y-1.5">
              <label class="text-sm font-medium text-slate-700" for="invite-password">Senha *</label>
              <div class="relative">
                <UiInput
                  id="invite-password"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="new-password"
                  placeholder="Digite sua senha"
                  input-class="pr-10"
                  :invalid="Boolean(fieldErrors.password)"
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
              <p v-if="fieldErrors.password" class="text-xs text-red-600">{{ fieldErrors.password }}</p>
            </div>

            <div class="space-y-1.5">
              <label class="text-sm font-medium text-slate-700" for="invite-password-confirm">
                Confirmar senha *
              </label>
              <UiInput
                id="invite-password-confirm"
                v-model="passwordConfirmation"
                type="password"
                autocomplete="new-password"
                placeholder="Repita sua senha"
                :invalid="Boolean(fieldErrors.password_confirmation)"
              />
              <p v-if="fieldErrors.password_confirmation" class="text-xs text-red-600">
                {{ fieldErrors.password_confirmation }}
              </p>
            </div>

            <label class="flex cursor-pointer items-start gap-2.5 text-sm leading-snug text-slate-600">
              <input
                v-model="acceptedTerms"
                type="checkbox"
                class="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-[#4338CA] focus:ring-[#4338CA]"
              />
              <span>
                Aceito os
                <a
                  :href="termsUrl"
                  class="font-semibold text-[#4338CA] hover:underline"
                  target="_blank"
                  rel="noopener"
                >
                  Termos de Uso
                </a>
                e a
                <a
                  :href="privacyUrl"
                  class="font-semibold text-[#4338CA] hover:underline"
                  target="_blank"
                  rel="noopener"
                >
                  Política de Privacidade
                </a>.
              </span>
            </label>
            <p v-if="fieldErrors.terms_accepted" class="text-xs text-red-600">
              {{ fieldErrors.terms_accepted }}
            </p>

            <UiButton
              type="submit"
              variant="primary"
              size="lg"
              class="!w-full !bg-[#4338CA] py-3 hover:!bg-brand-indigo-hover"
              :disabled="submitting"
            >
              {{ submitting ? 'Ativando…' : 'Ativar conta' }}
              <ArrowRight v-if="!submitting" class="h-4 w-4" aria-hidden="true" />
            </UiButton>

            <p class="text-center text-sm text-slate-500">
              Já tem conta?
              <RouterLink
                :to="{ name: 'login' }"
                class="ml-1 font-semibold text-[#4338CA] hover:underline"
              >
                Entrar
              </RouterLink>
            </p>
          </form>
        </UiCard>

          <InviteMarketingPanel placement="below" class="mt-8" />
        </div>
      </div>

      <AuthPageChrome hide-top>
        <p class="px-4 pb-2 text-center text-xs text-slate-500 sm:px-10 lg:px-12">
          © {{ new Date().getFullYear() }} Rappeli. Todos os direitos reservados.
        </p>
      </AuthPageChrome>
    </main>
  </div>
</template>
