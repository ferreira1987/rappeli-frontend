export type MessageTemplateStatus = 'APPROVED' | 'PENDING' | 'REJECTED'

export type MessageTemplateCategory = 'MARKETING' | 'UTILITY' | 'AUTHENTICATION'

export interface MessageTemplateComponent {
  type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS'
  text?: string | null
  format?: string | null
  buttons?: unknown[] | null
}

export interface MessageTemplate {
  id: number
  external_id?: string | null
  name: string
  category: string | null
  locale: string | null
  status: MessageTemplateStatus | string | null
  approved: boolean
  body: string | null
  footer: string | null
  marketing: boolean
  components?: MessageTemplateComponent[] | null
  variables?: number[]
}

export interface CreateMessageTemplatePayload {
  name: string
  language: string
  category: MessageTemplateCategory
  components: MessageTemplateComponent[]
}
