# Design System — Rappeli (Master)

> **Regra de precedência:** ao implementar uma página, leia primeiro `design-system/rappeli/pages/[nome-da-pagina].md`.
> Se existir, as regras da página **substituem** este Master. Caso contrário, siga este arquivo.

---

**Projeto:** Rappeli  
**Atualizado:** 2026-11-02  
**Stack:** Vue 3 + Vite + Tailwind CSS v4 + Pinia + Lucide  
**Produto:** SaaS B2B — mensagens, lembretes, confirmações e atendimento (WhatsApp)

---

## Direção visual

| Eixo          | Decisão                                                                                                          |
| ------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Estilo**    | Profissional, acessível, conteúdo em primeiro lugar — **não** glassmorphism, **não** gradientes “AI purple/pink” |
| **Modo**      | **Light first** — superfície clara (`brand-surface`); dark mode não é padrão do app                              |
| **Confiança** | Painéis de marketing em auth, prova de valor (features), formulários de baixo atrito                             |
| **Ícones**    | **Lucide** (`@lucide/vue`) — nunca emoji como ícone de UI                                                        |

---

## Cores (fonte de verdade: `src/assets/main.css`)

Use **classes Tailwind** `brand-*` e `slate-*` semânticos. Evite hex cru (`#4338CA`) em views novas — prefira tokens.

| Token Tailwind       | Hex       | Uso                                                  |
| -------------------- | --------- | ---------------------------------------------------- |
| `brand-indigo`       | `#4338CA` | Primary, links, painel marketing auth, focus ring    |
| `brand-indigo-hover` | `#3730A3` | Hover de botão primary                               |
| `brand-ink`          | `#1E1B4B` | Texto principal, títulos                             |
| `brand-gray`         | `#64748B` | Texto secundário, labels suaves                      |
| `brand-mist`         | `#EEF2FF` | Chips, destaques, fundos tint indigo                 |
| `brand-coral`        | `#FF7A59` | Acento pontual (status, badges) — usar com moderação |
| `brand-surface`      | `#F8FAFC` | Canvas do app e fundo da coluna de login             |

| Papel UI          | Recomendação                                                   |
| ----------------- | -------------------------------------------------------------- |
| Fundo de card     | `bg-white` + `border-slate-200/90`                             |
| Borda             | `border-slate-200`                                             |
| Texto muted       | `text-slate-500` / `text-brand-gray`                           |
| Erro / destrutivo | `bg-red-50`, `text-red-700`, botão `UiButton variant="danger"` |
| Anéis de foco     | `focus-visible:outline-brand-indigo` (ver `UiButton`)          |

**Contraste:** texto de corpo mínimo **4,5:1** sobre fundo; CTAs primary = texto branco sobre `brand-indigo`.

---

## Tipografia

| Papel           | Classe / token                                | Notas                                                                                  |
| --------------- | --------------------------------------------- | -------------------------------------------------------------------------------------- |
| Corpo           | `font-sans` → Inter (`--font-sans`)           | Base **16px** em telas de produto; evitar corpo &lt; 12px                              |
| Títulos / marca | `font-display` (`--font-display` no `@theme`) | Mesma família que sans (Inter) até fonte display dedicada; `tracking-tight` em `h1–h4` |
| Peso            | `font-semibold` / `font-bold`                 | CTAs e links de ação; `tracking-tight` em títulos grandes                              |

Line-height confortável em copy de marketing: `leading-relaxed` em parágrafos.

---

## Espaçamento e forma

| Token             | Valor                   | Uso no produto        |
| ----------------- | ----------------------- | --------------------- |
| `--radius-app`    | `0.5rem` (8px)          | Inputs, botões padrão |
| Cards auth        | `rounded-2xl`           | Login, cadastro       |
| Padding card auth | `p-8 sm:p-10`           | Formulários centrados |
| Largura máx. form | `max-w-[420px]`–`500px` | Coluna de auth        |

Breakpoints de QA: **375, 768, 1024, 1440** px.

---

## Padrões de layout

### Auth (login, cadastro, convite)

- **Desktop:** split — `AuthMarketingPanel` / `InviteMarketingPanel` (`bg-brand-indigo`, `lg:w-[min(42%,600px)]`) + coluna clara com formulário.
- **Mobile:** painel marketing oculto; logo + nome no topo do form.
- **Chrome:** `AuthPageChrome` no rodapé quando aplicável.
- Header auxiliar (ajuda/suporte): texto `text-slate-600`, hover `text-brand-indigo`.

### App logado (painel)

- Canvas `bg-brand-surface`, conteúdo em cards brancos, hierarquia com `font-display` nos títulos de seção.
- Densidade **média** — dashboards podem ser mais densos; auth/onboarding mais espaçosos.

### Onboarding

- Fluxo em etapas, indicadores de progresso, CTAs primary full-width quando fizer sentido.
- Manter tokens `brand-*` consistentes com auth.

---

## Componentes (`src/components/ui`)

Implementação preferida — **não** duplicar estilos ad hoc.

### `UiButton`

- Variantes: `primary` | `secondary` | `outline` | `ghost` | `danger`
- Tamanhos: `sm` | `md` | `lg`
- Primary: `bg-brand-indigo`, hover `brand-indigo-hover`, `:active` scale sutil, foco visível, `cursor-pointer`
- Submit async: `:disabled="loading"` + rótulo de progresso (“Entrando…”, etc.)

### `UiInput`

- Sempre com `<label for="...">` visível — placeholder é complemento, não rótulo.
- `autocomplete` correto em auth (`email`, `current-password`).
- Estado inválido via prop `invalid` quando houver validação de campo.

### `UiCard`

- Auth: `border border-slate-200/90`, `shadow-sm`, padding explícito na `class` quando `padding="none"`.

### `UiIconButton`

- Uso: fechar modais, menu mobile, ações compactas.
- Prop **`ariaLabel`** obrigatória; ícone com `aria-hidden="true"`.
- Tamanho padrão **`md`**: `min-h-11 min-w-11` (44 px); `sm` para densidade extra.
- Mesmo feedback `:active` e foco do `UiButton`. Atributos extras (`id`, `aria-expanded`) via props do componente.

### Select / textarea nativos

- Estilo alinhado ao `UiInput`: `uiSelectClass` e `uiTextareaClass` em `src/components/ui/uiSelectClass.ts`.

### `UiModalLayer`

- Wrapper com `Teleport`, scrim, a11y (`role`, `aria-labelledby`) e **`<Transition name="ui-modal">`**.
- Painel filho usa classe `ui-modal-panel` (scale/fade leve; só opacidade com `prefers-reduced-motion`).
- Props: `open`, `labelledBy`, `describedBy`, `role`, `zClass`, `scrollable`, `align` (`center` | `sheet`), `panelClass`.
- Emit `@close` no clique do backdrop.

---

## Formulários e feedback

- Erro global: banner visível + **`role="alert"`** ou **`aria-live="polite"`** (meta de acessibilidade para telas auth).
- Erro de campo: mensagem **adjacente** ao campo, não só no topo.
- Loading: feedback no botão; considerar `aria-busy` no `<form>` durante submit.
- Não bloquear colar senha; não usar OTP manual como único caminho sem alternativa.

---

## Motion e interação

- Transições de cor/hover: **150 ms** em botões; feedback no **`:active`** (`scale(0.98)` leve no `UiButton`).
- **`prefers-reduced-motion`**: implementado em `src/assets/main.css` (animações/transições encurtadas globalmente).
- Sem parallax hero, sem animações decorativas longas.
- Evitar animar `width`/`height` de layout; preferir opacity/transform quando necessário.

---

## Anti-padrões (não usar)

- Emoji como ícone de interface
- Links mortos `href="#"` com `@click.prevent` em produção — usar rota, URL real ou `button`
- Hex hardcoded onde existe token `brand-*`
- Placeholder como único “label”
- Remover anel de foco visível
- Hover como **única** forma de revelar ação crítica
- Glassmorphism / blur pesado como identidade principal do Rappeli
- Dark mode forçado no marketing ou auth

---

## Checklist pré-entrega (UI)

- [ ] Lucide (ou set consistente), sem emoji
- [ ] `cursor-pointer` em elementos clicáveis não-button quando aplicável
- [ ] Contraste 4,5:1 no light mode
- [ ] Foco visível no teclado
- [ ] Alvos de toque ≥ 44 px em mobile
- [ ] Sem scroll horizontal em 375 px
- [ ] `prefers-reduced-motion` considerado
- [ ] Tokens `brand-*` / slate em vez de hex solto

---

## Referência rápida de arquivos

| Área                 | Caminho                                      |
| -------------------- | -------------------------------------------- |
| Theme Tailwind       | `src/assets/main.css`                        |
| URLs / suporte       | `src/constants/brandUrls.ts`                 |
| Auth login           | `src/views/auth/LoginView.vue`               |
| Marketing auth       | `src/components/auth/AuthMarketingPanel.vue` |
| Botão / input / card | `src/components/ui/`                         |

---

## Overrides por página

Arquivos em `design-system/rappeli/pages/` (prevalecem sobre este Master):

| Slug            | Rota               | Arquivo                    |
| --------------- | ------------------ | -------------------------- |
| login           | `/login`           | `pages/login.md`           |
| cadastro        | `/cadastro`        | `pages/cadastro.md`        |
| aceitar-convite | `/aceitar-convite` | `pages/aceitar-convite.md` |

Novas telas: adicione `<slug>.md` sem alterar o Master, salvo mudança global de marca.
