import { onUnmounted, ref } from 'vue'

import { fetchWhatsAppEmbeddedSignupConfig } from '@/api/whatsapp'
import { loadFacebookSdk } from '@/lib/facebookSdk'

const FACEBOOK_ORIGINS = new Set([
  'https://www.facebook.com',
  'https://web.facebook.com',
  'https://facebook.com',
])

export type EmbeddedSignupFinishPayload = {
  waba_id: string
  phone_number_id: string
}

type PendingSignup = {
  code: string | null
  waba_id: string | null
  phone_number_id: string | null
}

export function useWhatsAppEmbeddedSignup() {
  const launching = ref(false)
  const lastError = ref<string | null>(null)

  let messageListener: ((event: MessageEvent) => void) | null = null
  let pending: PendingSignup = {
    code: null,
    waba_id: null,
    phone_number_id: null,
  }

  function resetPending(): void {
    pending = { code: null, waba_id: null, phone_number_id: null }
  }

  function detachMessageListener(): void {
    if (messageListener) {
      window.removeEventListener('message', messageListener)
      messageListener = null
    }
  }

  function isSignupComplete(): boolean {
    return Boolean(pending.code && pending.waba_id && pending.phone_number_id)
  }

  function buildResult(): EmbeddedSignupFinishPayload & { code: string } | null {
    if (!isSignupComplete()) {
      return null
    }
    return {
      code: pending.code as string,
      waba_id: pending.waba_id as string,
      phone_number_id: pending.phone_number_id as string,
    }
  }

  async function launchEmbeddedSignup(): Promise<
    (EmbeddedSignupFinishPayload & { code: string }) | null
  > {
    launching.value = true
    lastError.value = null
    resetPending()
    detachMessageListener()

    try {
      const config = await fetchWhatsAppEmbeddedSignupConfig()
      if (!config.meta_app_id || !config.embedded_signup_config_id) {
        throw new Error('Configuração do cadastro incorporado indisponível. Tente novamente mais tarde.')
      }

      const FB = await loadFacebookSdk(config.meta_app_id)

      return await new Promise((resolve, reject) => {
        messageListener = (event: MessageEvent) => {
          if (!FACEBOOK_ORIGINS.has(event.origin)) {
            return
          }

          let payload: unknown = event.data
          if (typeof payload === 'string') {
            try {
              payload = JSON.parse(payload)
            } catch {
              return
            }
          }

          if (!payload || typeof payload !== 'object') {
            return
          }

          const message = payload as {
            type?: string
            event?: string
            data?: { waba_id?: string; phone_number_id?: string }
          }

          if (message.type !== 'WA_EMBEDDED_SIGNUP') {
            return
          }

          if (message.event === 'FINISH') {
            pending.waba_id = message.data?.waba_id ?? null
            pending.phone_number_id = message.data?.phone_number_id ?? null
            const result = buildResult()
            if (result) {
              detachMessageListener()
              resolve(result)
            }
            return
          }

          if (message.event === 'CANCEL') {
            detachMessageListener()
            reject(new Error('Conexão cancelada. Você pode tentar novamente quando quiser.'))
          }
        }

        window.addEventListener('message', messageListener)

        FB.login(
          (response) => {
            if (response.status === 'connected' && response.authResponse?.code) {
              pending.code = response.authResponse.code
              const result = buildResult()
              if (result) {
                detachMessageListener()
                resolve(result)
              }
              return
            }

            if (response.status === 'not_authorized' || response.status === 'unknown') {
              detachMessageListener()
              reject(new Error('Não foi possível autorizar o cadastro no Facebook. Tente novamente.'))
            }
          },
          {
            config_id: config.embedded_signup_config_id,
            response_type: 'code',
            override_default_response_type: true,
            extras: {
              setup: {},
              featureType: '',
              sessionInfoVersion: '3',
            },
          },
        )
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Não foi possível iniciar a conexão com o WhatsApp.'
      lastError.value = message
      detachMessageListener()
      return null
    } finally {
      launching.value = false
    }
  }

  onUnmounted(() => {
    detachMessageListener()
  })

  return {
    launching,
    lastError,
    launchEmbeddedSignup,
  }
}
