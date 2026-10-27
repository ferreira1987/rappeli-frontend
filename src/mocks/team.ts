/** Dados de exemplo — substituir por API quando disponível. */

export type ExampleAgent = {
  id: string
  name: string
  email: string
  phone: string
  sectorId: string
  role: 'atendente' | 'supervisor' | 'administrador'
  whatsappStatus: 'online' | 'ausente' | 'offline'
  activeChats: number
  receivesChats: boolean
  isCurrentUser?: boolean
}

export type ExampleSector = {
  id: string
  name: string
  description: string
  memberCount: number
  isDefault?: boolean
}

export const exampleSectors: ExampleSector[] = [
  {
    id: 'recepcao',
    name: 'Recepção',
    description: 'Primeiro contato, triagem e agendamentos gerais.',
    memberCount: 3,
    isDefault: true,
  },
  {
    id: 'financeiro',
    name: 'Financeiro',
    description: 'Parcelamentos, convênios e cobranças.',
    memberCount: 1,
  },
  {
    id: 'clinico',
    name: 'Agendamentos & Clínico',
    description: 'Confirmações e retornos com a equipe clínica.',
    memberCount: 1,
  },
]

export const exampleAgents: ExampleAgent[] = [
  {
    id: 'mariana',
    name: 'Mariana Costa',
    email: 'mariana@rappeli.com.br',
    phone: '+55 62 99102-4455',
    sectorId: 'recepcao',
    role: 'atendente',
    whatsappStatus: 'online',
    activeChats: 6,
    receivesChats: true,
  },
  {
    id: 'roberto',
    name: 'Roberto Silva',
    email: 'roberto@rappeli.com.br',
    phone: '+55 62 99220-1188',
    sectorId: 'financeiro',
    role: 'atendente',
    whatsappStatus: 'online',
    activeChats: 4,
    receivesChats: true,
  },
  {
    id: 'carlos',
    name: 'Carlos Eduardo',
    email: 'carlos@rappeli.com.br',
    phone: '+55 62 99655-1200',
    sectorId: 'recepcao',
    role: 'supervisor',
    whatsappStatus: 'ausente',
    activeChats: 2,
    receivesChats: true,
  },
  {
    id: 'fernanda',
    name: 'Dra. Fernanda Lins',
    email: 'fernanda@rappeli.com.br',
    phone: '+55 62 99330-7722',
    sectorId: 'clinico',
    role: 'atendente',
    whatsappStatus: 'offline',
    activeChats: 0,
    receivesChats: false,
  },
  {
    id: 'adao',
    name: 'Adão Ferreira',
    email: 'adao@rappeli.com.br',
    phone: '+55 62 99800-0101',
    sectorId: 'recepcao',
    role: 'administrador',
    whatsappStatus: 'online',
    activeChats: 3,
    receivesChats: true,
    isCurrentUser: true,
  },
]

export function sectorNameById(id: string): string {
  return exampleSectors.find((s) => s.id === id)?.name ?? id
}

export const roleLabels: Record<ExampleAgent['role'], string> = {
  atendente: 'Atendente',
  supervisor: 'Supervisor',
  administrador: 'Administrador',
}
