import { http } from '@/api/http'
import type {
  ConnectWhatsAppPayload,
  WhatsAppAccount,
  WhatsAppAccountResponse,
  WhatsAppEmbeddedSignupConfig,
} from '@/types/whatsapp'

export async function fetchWhatsAppEmbeddedSignupConfig(): Promise<WhatsAppEmbeddedSignupConfig> {
  const { data } = await http.get<WhatsAppEmbeddedSignupConfig>(
    '/api/whatsapp/embedded-signup-config',
  )
  return data
}

export async function fetchWhatsAppAccount(): Promise<WhatsAppAccount | null> {
  const { data } = await http.get<WhatsAppAccountResponse>('/api/whatsapp/account')
  return data.whatsapp_account ?? null
}

export async function connectWhatsAppAccount(
  payload: ConnectWhatsAppPayload,
): Promise<WhatsAppAccount> {
  const { data } = await http.post<{ whatsapp_account: WhatsAppAccount }>(
    '/api/whatsapp/connect',
    payload,
  )
  return data.whatsapp_account
}

export async function disconnectWhatsAppAccount(): Promise<void> {
  await http.delete('/api/whatsapp/account')
}
