import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

import { http } from '@/api/http'

import { warnIfReverbNotConfigured } from '@/realtime/config'

type ReverbEcho = Echo<'reverb'>

let echoInstance: ReverbEcho | null = null

function resolveWsPort(): number {
  const configured = import.meta.env.VITE_REVERB_PORT
  if (configured) {
    return Number(configured)
  }
  if (import.meta.env.DEV) {
    return Number(window.location.port || 5173)
  }
  return window.location.protocol === 'https:' ? 443 : 80
}

function resolveWsHost(): string {
  if (import.meta.env.VITE_REVERB_HOST) {
    return import.meta.env.VITE_REVERB_HOST
  }
  return window.location.hostname
}

function resolveScheme(): 'http' | 'https' {
  const scheme = import.meta.env.VITE_REVERB_SCHEME
  if (scheme === 'http' || scheme === 'https') {
    return scheme
  }
  return window.location.protocol === 'https:' ? 'https' : 'http'
}

export function getEcho(): ReverbEcho | null {
  const key = import.meta.env.VITE_REVERB_APP_KEY?.trim()
  if (!key) {
    warnIfReverbNotConfigured()
    return null
  }

  if (!echoInstance) {
    window.Pusher = Pusher

    const scheme = resolveScheme()
    const wsPort = resolveWsPort()

    echoInstance = new Echo({
      broadcaster: 'reverb',
      key,
      wsHost: resolveWsHost(),
      wsPort,
      wssPort: wsPort,
      forceTLS: scheme === 'https',
      enabledTransports: ['ws', 'wss'],
      authEndpoint: '/broadcasting/auth',
      auth: {
        headers: {
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
      },
      authorizer: (channel) => ({
        authorize: (socketId, callback) => {
          http
            .post('/broadcasting/auth', {
              socket_id: socketId,
              channel_name: channel.name,
            })
            .then((response) =>
              callback(null, response.data as { auth: string; channel_data?: string }),
            )
            .catch((error: Error) => callback(error, null))
        },
      }),
    })
  }

  return echoInstance
}

export function disconnectEcho(): void {
  if (echoInstance) {
    echoInstance.disconnect()
    echoInstance = null
  }
}

declare global {
  interface Window {
    Pusher: typeof Pusher
  }
}
