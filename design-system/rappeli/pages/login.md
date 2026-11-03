# Página: Login (`/login`)

> Override do [MASTER](../MASTER.md). Em conflito, **este arquivo prevalece**.

---

## Objetivo

Entrada rápida e confiável para contas existentes, com prova de valor no painel marketing (desktop) e formulário enxuto na coluna clara.

---

## Layout

| Viewport | Comportamento                                                                                                                         |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `< lg`   | Ocultar `AuthMarketingPanel`; logo + “Rappeli” acima do card; `max-w-[420px]` na faixa do logo                                        |
| `≥ lg`   | Split 42% marketing (`AuthMarketingPanel`: `hidden lg:flex`, `bg-brand-indigo`, `lg:w-[min(42%,600px)]`) / form em `bg-brand-surface` |
| Card     | `max-w-[500px]`, `rounded-2xl`, `p-8 sm:p-10`, borda `slate-200/90`                                                                   |

Header superior direito: links secundários (`text-slate-600`, hover `text-brand-indigo`), não competir com o CTA “Entrar”.

---

## Formulário

| Campo   | Regras                                                                                         |
| ------- | ---------------------------------------------------------------------------------------------- |
| E-mail  | Label “E-mail profissional”, `type="email"`, `autocomplete="email"`, placeholder complementar  |
| Senha   | Label visível; `autocomplete="current-password"`; toggle mostrar/ocultar                       |
| Lembrar | Checkbox + copy “Lembrar de mim por 30 dias”; área de toque confortável na linha inteira       |
| Submit  | `UiButton` primary `size="lg"`, largura total; desabilitado + copy “Entrando…” durante loading |

### Erro de login

- Banner `bg-red-50` / `text-red-700`.
- **`role="alert"`** (anunciar falha para leitores de tela).
- Limpar erro ao novo submit.

### Estado de loading

- `:disabled="auth.loading"` no botão.
- **`aria-busy="true"`** no `<form>` enquanto `auth.loading`.

---

## Acessibilidade (obrigatório nesta página)

- Toggle de senha: **`aria-label`** “Mostrar senha” / “Ocultar senha”; ícone `aria-hidden`.
- Alvo do toggle: **≥ 44×44 px** (`min-h-11 min-w-11`, centralizado à direita do input).
- Input senha: padding direito extra (`pr-12`) para não sobrepor o botão.
- Checkbox: label clicável com altura mínima confortável (`min-h-11` na linha).
- Sem bloquear colar no campo senha.

---

## Links e navegação

| Elemento          | Destino atual                           | Futuro                                           |
| ----------------- | --------------------------------------- | ------------------------------------------------ |
| Central de Ajuda  | `brandSiteUrl` (`brandUrls.ts`)         | URL de help center quando existir                |
| Suporte           | `brandSupportMailto`                    | Pode virar chat/WhatsApp                         |
| Esqueceu a senha? | `brandPasswordRecoveryMailto`           | Rota `/recuperar-senha` quando o backend existir |
| Criar conta       | `RouterLink` → `cadastro`               | —                                                |

**Proibido:** `href="#"` + `@click.prevent` nesta página.

---

## Tokens (usar classes, não hex)

- Fundo coluna: `bg-brand-surface`
- Links e acentos: `text-brand-indigo`, hover `hover:text-brand-indigo` / `hover:underline`
- Checkbox: `text-brand-indigo focus:ring-brand-indigo`

---

## Componentes

- `AuthMarketingPanel`, `AuthPageChrome` (`hide-top` no rodapé)
- `UiCard`, `UiInput`, `UiButton`
- Ícones: Lucide `Eye` / `EyeOff`

---

## Checklist antes de merge

Referência: `src/views/auth/LoginView.vue` + `AuthMarketingPanel.vue`.

- [x] Erro com `role="alert"`
- [x] Form com `aria-busy` no loading
- [x] Toggle 44px e tokens `brand-*`
- [x] Links reais (sem `#`)
- [x] Contraste e foco visível no teclado
- [x] 375px sem scroll horizontal (`overflow-hidden` no shell; card `max-w-[500px]` + padding responsivo)
