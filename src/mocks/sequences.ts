/** Dados de exemplo — substituir por API quando disponível. */

import { EXAMPLE_SEQUENCE_ELIGIBLE_CONTACTS } from '@/mocks/sharedExampleMetrics'

export type SequenceFlowStep =
  | {
      kind: 'message'
      order: number
      label: string
      title: string
      templateName: string
      preview: string
      waitLabel?: string
    }
  | {
      kind: 'condition'
      order: number
      label: string
      title: string
      yesAction: string
      noAction: string
      waitLabel?: string
    }

export const exampleFollowUpSequence = {
  name: 'Pós-consulta e retorno',
  trigger: "Quando a tag 'Consulta realizada' for aplicada",
  eligibleCount: EXAMPLE_SEQUENCE_ELIGIBLE_CONTACTS,
  filters: ['Tag: Consulta realizada', 'Opt-in WhatsApp: Ativo'],
  stopOnReply: true,
  optInOnly: true,
  windowStart: '08:00',
  windowEnd: '18:00',
  sectorOnReply: 'Recepção & Agendamento',
  totalCycleDays: 8,
  steps: [
    {
      kind: 'message' as const,
      order: 1,
      label: 'DISPARO INICIAL • IMEDIATO',
      title: 'Enviar template: agradecimento_pos_consulta',
      templateName: 'agradecimento_pos_consulta',
      preview:
        'Olá, {{nome}}! Agradecemos sua confiança na consulta de hoje com a {{profissional}}…',
      waitLabel: 'Aguardar 1 dia | envio às 10:00',
    },
    {
      kind: 'message' as const,
      order: 2,
      label: 'PESQUISA DE QUALIDADE NPS',
      title: 'Enviar template: pesquisa_satisfacao',
      templateName: 'pesquisa_satisfacao',
      preview: 'Como você avalia o atendimento de hoje? Responda de 1 a 5.',
      waitLabel: 'Aguardar 7 dias | intervalo de resposta',
    },
    {
      kind: 'condition' as const,
      order: 3,
      label: 'CONDIÇÃO LÓGICA',
      title: 'Condição: O contato respondeu à mensagem anterior?',
      yesAction: 'Encerrar sequência e encaminhar para atendimento humano.',
      noAction: 'Avançar: Seguir normalmente para o agendamento preventivo de retorno.',
    },
  ] satisfies SequenceFlowStep[],
}
