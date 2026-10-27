/** Dados de exemplo — substituir por API quando disponível. */

export type ScheduledMessageStatus = 'scheduled' | 'sent' | 'failed'

export type ScheduledMessageRow = {
  id: string
  contactName: string
  phone: string
  messagePreview: string
  scheduledAt: string
  status: ScheduledMessageStatus
  assignee?: string
}

export const exampleScheduledMessages: ScheduledMessageRow[] = [
  {
    id: 's1',
    contactName: 'Mariana Costa',
    phone: '+55 62 99876-1234',
    messagePreview: 'Olá, Mariana! Lembrando da sua consulta de avaliação hoje às 14:30…',
    scheduledAt: '27/10/2026 às 14:30',
    status: 'scheduled',
    assignee: 'Adão F.',
  },
  {
    id: 's2',
    contactName: 'Roberto Silva',
    phone: '+55 62 99188-2200',
    messagePreview: 'Bom dia! Segue confirmação do horário agendado…',
    scheduledAt: '28/10/2026 às 09:00',
    status: 'scheduled',
  },
  {
    id: 's3',
    contactName: 'Carlos Eduardo',
    phone: '+55 62 99655-1200',
    messagePreview: 'Olá! Tudo certo para sua visita na terça-feira?',
    scheduledAt: '26/10/2026 às 16:00',
    status: 'sent',
  },
  {
    id: 's4',
    contactName: 'Ana Paula M.',
    phone: '+55 62 98765-4321',
    messagePreview: 'Não foi possível entregar — janela de 24h expirada.',
    scheduledAt: '24/10/2026 às 11:00',
    status: 'failed',
  },
]

export const scheduleMessageTemplateVariables = ['{{nome}}', '{{data}}', '{{horario}}'] as const
