# Página: Aceitar convite (`/aceitar-convite`)

> Override do [MASTER](../MASTER.md). Em conflito, **este arquivo prevalece**.

---

## Objetivo

Ativar conta de membro convidado: validar token, exibir preview do convite, definir senha e aceitar termos.

---

## Layout

- Mesmo split auth do login: `InviteMarketingPanel` (sidebar) + coluna clara.
- Mobile: logo + card; painel marketing também em `placement="below"` abaixo do card.
- Card: `max-w-[460px]`, `rounded-xl`, padding `p-7 sm:p-8`.

---

## Estados da tela

| Estado | UI |
|--------|-----|
| Token ausente | Alerta âmbar, `role="alert"`, copy orientando abrir link do e-mail |
| Carregando preview | Spinner + “Validando convite…” (`aria-label` no ícone) |
| Convite inválido | Alerta vermelho, `role="alert"` |
| Preview válido | Resumo do convite + formulário de senha |

---

## Formulário (preview válido)

- Bloco “Detalhes do acesso”: nome, e-mail, empresa, papel (badge `bg-brand-mist text-brand-indigo`).
- Senha + confirmar senha (`new-password`).
- Toggle apenas na senha principal (44px, `pr-12`).
- Termos com links externos (`rel="noopener noreferrer"`).
- CTA: “Ativar conta” / “Ativando…”, `:disabled="submitting"`.
- **`aria-busy="true"`** no `<form>` durante `submitting`.

### Erros

- `role="alert"` em erros globais, convite inválido e lista de validação.
- Erros de campo abaixo do input.

---

## Header (coluna clara)

- Central de Ajuda → `brandSiteUrl` (nova aba).
- Suporte → `brandSupportMailto`.
- **Sem** `href="#"`.

---

## Tokens

- Fundo: `bg-brand-surface`.
- Links, spinner, badges: `brand-indigo` / `brand-mist`.
- Botão: `UiButton primary` full width — sem override `!bg-[#4338CA]`.

---

## Navegação

- “Entrar” → `RouterLink` `login`.
- Sucesso → redirect `/painel`.

---

## Checklist

- [ ] Links de ajuda/suporte reais
- [ ] `aria-busy` no submit
- [ ] Toggle 44px
- [ ] Tokens `brand-*`
- [ ] Estados de token/preview/erro com `role="alert"` onde aplicável
