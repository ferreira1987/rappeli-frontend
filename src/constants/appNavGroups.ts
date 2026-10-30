import type { LucideIcon } from '@lucide/vue'
import {
  BarChart3,
  Bot,
  CalendarClock,
  GitBranch,
  Kanban,
  LayoutGrid,
  MessageCircle,
  MessageSquareReply,
  Settings,
  UserCog,
  Users,
} from '@lucide/vue'

export type AppNavItem = {
  name: string
  label: string
  to: string
  icon: LucideIcon
  soon?: boolean
  badge?: number | (() => number)
  showBadgeWhenZero?: boolean
}

export type AppNavGroup = {
  id: 'principal' | 'automacao' | 'gestao'
  label: string
  items: AppNavItem[]
}

export const appNavGroups: AppNavGroup[] = [
  {
    id: 'principal',
    label: 'Principal',
    items: [
      { name: 'painel', label: 'Painel', to: '/painel', icon: LayoutGrid },
      {
        name: 'conversas',
        label: 'Conversas',
        to: '/conversas',
        icon: MessageCircle,
        showBadgeWhenZero: true,
      },
    ],
  },
  {
    id: 'automacao',
    label: 'Automação',
    items: [
      { name: 'funil-atendimento', label: 'Funil de atendimento', to: '/funil-atendimento', icon: Kanban },
      {
        name: 'mensagens-agendadas',
        label: 'Mensagens agendadas',
        to: '/mensagens-agendadas',
        icon: CalendarClock,
      },
      { name: 'automacoes', label: 'Automações', to: '/automacoes', icon: Bot },
      {
        name: 'respostas-automaticas',
        label: 'Respostas automáticas',
        to: '/respostas-automaticas',
        icon: MessageSquareReply,
      },
      { name: 'campanhas', label: 'Campanhas', to: '/campanhas', icon: GitBranch },
    ],
  },
  {
    id: 'gestao',
    label: 'Gestão',
    items: [
      { name: 'contatos', label: 'Contatos', to: '/contatos', icon: Users },
      { name: 'relatorios', label: 'Relatórios', to: '/relatorios', icon: BarChart3 },
      { name: 'equipe', label: 'Equipe', to: '/equipe', icon: UserCog },
      { name: 'configuracoes', label: 'Configurações', to: '/configuracoes', icon: Settings },
    ],
  },
]
