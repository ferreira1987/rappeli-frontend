export interface WhatsAppEmbeddedSignupConfig {
  meta_app_id: string
  embedded_signup_config_id: string
}

export interface WhatsAppAccount {
  connected: boolean
  waba_id: string | null
  phone_number_id: string | null
  display_phone_number: string | null
  verified_name: string | null
  quality_rating: string | null
  status: string | null
  token_expires_at: string | null
  connected_at: string | null
}

export interface WhatsAppAccountResponse {
  whatsapp_account: WhatsAppAccount | null
}

export interface ConnectWhatsAppPayload {
  code: string
  waba_id: string
  phone_number_id: string
  pin: string
}
