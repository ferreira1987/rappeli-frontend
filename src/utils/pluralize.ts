type PluralForms = { one: string; other: string }

const DEFAULT_FORMS: Record<string, PluralForms> = {
  campanha: { one: 'campanha', other: 'campanhas' },
  membro: { one: 'membro', other: 'membros' },
  atendente: { one: 'atendente', other: 'atendentes' },
  contato: { one: 'contato', other: 'contatos' },
  regra: { one: 'regra', other: 'regras' },
  colaborador: { one: 'colaborador', other: 'colaboradores' },
  etapa: { one: 'etapa', other: 'etapas' },
  sequência: { one: 'sequência', other: 'sequências' },
  sequencia: { one: 'sequência', other: 'sequências' },
  convite: { one: 'convite pendente', other: 'convites pendentes' },
  setor: { one: 'setor', other: 'setores' },
  mensagem: { one: 'mensagem', other: 'mensagens' },
  lembrete: { one: 'lembrete', other: 'lembretes' },
  modelo: { one: 'modelo', other: 'modelos' },
  caractere: { one: 'caractere', other: 'caracteres' },
}

export function pluralizePt(count: number, word: string, forms?: PluralForms): string {
  const resolved = forms ?? DEFAULT_FORMS[word.toLowerCase()]
  if (!resolved) {
    return count === 1 ? word : `${word}s`
  }
  const label = count === 1 ? resolved.one : resolved.other
  return `${count.toLocaleString('pt-BR')} ${label}`
}

export function pluralWordPt(count: number, word: string, forms?: PluralForms): string {
  const resolved = forms ?? DEFAULT_FORMS[word.toLowerCase()]
  if (!resolved) {
    return count === 1 ? word : `${word}s`
  }
  return count === 1 ? resolved.one : resolved.other
}
