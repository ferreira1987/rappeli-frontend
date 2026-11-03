# Página: Cadastro (`/cadastro`)

> Override do [MASTER](../MASTER.md). Em conflito, **este arquivo prevalece**.

---

## Objetivo

Capturar dados mínimos para criar conta e encaminhar ao fluxo de contratação (`/contratacao/plano`), com prova de valor na coluna lateral (desktop).

---

## Layout

- Shell: `OnboardingShell` (`shell-variant="cadastro-v5"`, step 1).
- Grid: formulário `lg:col-span-7` + card “Por que escolher” `lg:col-span-5`.
- Card form: `rounded-2xl`, footer fixo com borda superior (`bg-slate-50/50`).

---

## Formulário

| Campo | Regras |
|-------|--------|
| Nome | `autocomplete="name"`; erro inline |
| E-mail | `type="email"`, `autocomplete="email"` |
| Senha | `new-password`, mín. 8; helper “Mínimo de 8 caracteres”; toggle mostrar/ocultar |
| Empresa | Obrigatório no copy (`*`) |
| WhatsApp | Prefixo `+55` decorativo (`aria-hidden`); máscara BR; foco com ring `brand-indigo` |
| Termos | Checkbox + links externos Termos/Privacidade (nova aba, `rel="noopener noreferrer"`) |

### Erros

- Erro global: `role="alert"`.
- Validação API: mensagem **abaixo do campo** (`text-xs text-red-600`).
- Termos não aceitos: erro em `terms_accepted` abaixo do checkbox.

### Submit

- Botão no **footer** do card: `type="submit"` + `form="register-form"` (associado ao `<form id="register-form">`).
- Loading: “Aguarde…”, `:disabled="auth.loading"`, **`aria-busy`** no form.

---

## Acessibilidade

- Toggle senha: `aria-label`, ícone `aria-hidden`, alvo **≥ 44×44 px**, `pr-12` no input.
- Linha de termos: área clicável confortável (`min-h-11`, `items-start` para texto longo).
- Não bloquear colar senha.

---

## Tokens

- Links e acentos: `text-brand-indigo`, `focus:ring-brand-indigo`.
- WhatsApp: `focus-within:border-brand-indigo`, `focus-within:ring-brand-indigo/20`.
- Ícones do card lateral: `bg-brand-mist text-brand-indigo`.
- Badge “Vantagens”: `border-brand-indigo/15 text-brand-indigo`.
- **Evitar** `!bg-[#4338CA]` — usar `UiButton variant="primary"`.

---

## Navegação

- “Entrar” → `RouterLink` `login`.
- Termos: `brandTermsUrl` · Privacidade: `brandPrivacyUrl` (`@/constants/brandUrls`).

---

## Checklist

- [ ] `role="alert"` no erro global
- [ ] `aria-busy` no loading
- [ ] Submit via `form="register-form"`
- [ ] Toggle 44px + tokens `brand-*`
- [ ] Erros de campo adjacentes
- [ ] 375px sem scroll horizontal
