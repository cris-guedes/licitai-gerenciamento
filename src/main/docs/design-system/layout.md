# Layout — Licitare Design System

> Sistema de espaçamento, grid e estrutura de layouts.
> Última atualização: 2026-03-13

---

## Filosofia de layout

O layout do Licitare é construído sobre três princípios:

1. **Previsibilidade** — espaçamentos sempre múltiplos de 4px, nunca valores arbitrários
2. **Densidade consciente** — dashboards de dados precisam ser densos sem parecer pesados
3. **Estrutura fixa, conteúdo flexível** — sidebar e header têm dimensões fixas; o conteúdo se adapta

---

## 1. Escala de espaçamento

Base: **4px**. Todos os espaçamentos são múltiplos de 4.

| Token | Valor | Uso típico |
|---|---|---|
| `space-0` | 0px | Reset, sem espaçamento |
| `space-1` | 4px | Espaço mínimo entre elementos inline, ícone + label |
| `space-2` | 8px | Gap interno de badges, padding de tags, gap entre ícone e texto |
| `space-3` | 12px | Padding horizontal de botões small, gap entre itens compactos |
| `space-4` | 16px | Padding padrão de botões, gap entre campos de formulário |
| `space-5` | 20px | Padding interno de cards compactos |
| `space-6` | 24px | Padding padrão de cards, gap entre seções de formulário |
| `space-8` | 32px | Separação entre blocos de conteúdo, padding de modais |
| `space-10` | 40px | Espaçamento entre seções de página |
| `space-12` | 48px | Separação de seções maiores |
| `space-16` | 64px | Padding de páginas em mobile, espaçamento entre seções de landing |
| `space-20` | 80px | Espaçamento generoso entre seções de landing page |
| `space-24` | 96px | Seções hero, espaçamento máximo |

---

## 2. Estrutura do dashboard (Layout Shell)

A Sidebar agora utiliza o **Dark Obsidian (#2b2e35)** como cor de fundo, criando um contraste elegante com o corpo da página em **Soft Gray (#f7fafc)**.

```
┌─────────────────────────────────────────────────────┐
│  SIDEBAR (Obsidian #2b2e35) │  MAIN CONTENT (flexível)   │
│                        │ ┌─────────────────────────┐ │
│  [Logo]                │ │ TOPBAR (White / Border)  │ │
│                        │ ├─────────────────────────┤ │
│  Navegação amarela     │ │                         │ │
│  no estado ativo       │ │  PAGE CONTENT           │ │
│                        │ │  fundo: #f7fafc         │ │
│                        │ │                         │ │
│                        │ └─────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### Dimensões fixas

| Elemento | Valor | Breakpoint |
|---|---|---|
| Sidebar (expandida) | 240px | ≥ lg (1024px) |
| Sidebar (colapsada) | 56px | — |
| Sidebar (mobile) | Full width (drawer) | < lg |
| Topbar height | 56px | Todos |
| Page content padding | `24px 32px` | ≥ md |
| Page content padding | `16px 20px` | < md |

### Largura máxima do conteúdo

| Contexto | Max-width |
|---|---|
| Dashboard padrão | Sem limite (usa todo o espaço disponível) |
| Formulários | 640px centralizados |
| Modais de formulário | 560px |
| Landing page | 1280px com padding lateral |

---

## 3. Grid de conteúdo

### Grid de 12 colunas

Usar CSS Grid com 12 colunas para layouts de dashboard.

```css
.content-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 24px; /* space-6 */
}
```

### Breakpoints

| Nome | Valor | Comportamento |
|---|---|---|
| `sm` | 640px | — |
| `md` | 768px | 2 colunas em cards de métricas |
| `lg` | 1024px | Sidebar aparece; 3–4 colunas em cards |
| `xl` | 1280px | Layout completo |
| `2xl` | 1536px | Limite máximo de conteúdo |

### Cards de métricas (KPI cards)

```
Mobile (< md):     1 coluna
Tablet (md–lg):    2 colunas
Desktop (≥ lg):    4 colunas
```

### Layout de formulário

```
Mobile:    1 coluna (100%)
Tablet+:   2 colunas para campos de mesmo nível
Sempre:    Largura máxima de 640px para o formulário completo
```

---

## 4. Padding e margens de componentes

### Página

| Área | Padding |
|---|---|
| Conteúdo de página (desktop) | `padding: 24px 32px` |
| Conteúdo de página (mobile) | `padding: 16px 20px` |
| Cabeçalho de página + separador | `padding-bottom: 24px; margin-bottom: 24px` |

### Cards

| Variante | Padding |
|---|---|
| Card padrão | `24px` |
| Card compacto (tabela, lista) | `0` (sem padding, conteúdo encosta na borda) |
| Card de KPI/métrica | `20px 24px` |

### Formulários

| Elemento | Espaçamento |
|---|---|
| Gap entre campos | `16px` (space-4) |
| Gap entre grupos de campos | `24px` (space-6) |
| Gap entre seções do formulário | `32px` (space-8) |
| Padding interno de input | `8px 12px` |
| Padding de botão primário | `8px 16px` (small) / `10px 20px` (default) / `12px 24px` (large) |

### Tabelas

| Elemento | Valor |
|---|---|
| Padding de célula (padrão) | `12px 16px` |
| Padding de célula (compacto) | `8px 12px` |
| Altura de linha (padrão) | 48px |
| Altura de linha (compacto) | 40px |
| Altura do cabeçalho | 40px |

### Sidebar

| Elemento | Valor |
|---|---|
| Padding lateral interno | `12px` |
| Padding vertical de item de nav | `8px 12px` |
| Gap entre itens de nav | `2px` |
| Gap entre grupos de nav | `24px` |
| Padding do header (logo) | `16px 12px` |
| Padding do footer (avatar) | `12px` |

---

## 5. Elevação e sombras

O Licitare usa sombras com moderação. Superfícies se distinguem por cor de borda, não por profundidade excessiva.

| Token | Valor | Uso |
|---|---|---|
| `shadow-none` | `none` | Elementos sem elevação |
| `shadow-xs` | `0 1px 2px rgba(0,0,0,0.05)` | Botões, inputs com foco |
| `shadow-sm` | `0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)` | Cards padrão |
| `shadow-md` | `0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06)` | Dropdowns, popovers |
| `shadow-lg` | `0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)` | Modais, drawers |
| `shadow-xl` | `0 20px 25px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.04)` | Toasts flutuantes |

---

## 6. Border radius

| Token | Valor | Uso |
|---|---|---|
| `rounded-none` | `0` | Bordas retas (tabelas, divisores) |
| `rounded-sm` | `4px` | Badges, tags pequenas |
| `rounded` | `6px` | Inputs, botões, cards compactos |
| `rounded-md` | `8px` | Cards padrão, dropdowns |
| `rounded-lg` | `10px` | Modais, painéis laterais |
| `rounded-xl` | `12px` | Cards de KPI, elementos de destaque |
| `rounded-full` | `9999px` | Avatars, badges circulares, toggles |

---

## 7. z-index

| Token | Valor | Uso |
|---|---|---|
| `z-base` | `0` | Conteúdo normal |
| `z-raised` | `10` | Cards com hover, dropdowns inline |
| `z-dropdown` | `100` | Dropdowns, selects, comboboxes |
| `z-sticky` | `200` | Header e sidebar sticky |
| `z-overlay` | `300` | Overlay de modal |
| `z-modal` | `400` | Modais, drawers |
| `z-toast` | `500` | Notificações toast |
| `z-tooltip` | `600` | Tooltips (devem ficar acima de tudo) |

---

## 8. Scroll e overflow

- **Scroll da página** — o body/main nunca deve ter `overflow: hidden` no desktop
- **Tabelas** — tabelas longas recebem `overflow-x: auto` no container, não na tabela
- **Sidebar** — se a navegação for longa, adicionar `overflow-y: auto` com scroll sutil
- **Modais** — o conteúdo interno pode ter `overflow-y: auto`; o modal em si nunca

---

## 9. Implementação de referência

### Shell do dashboard (Next.js App Router)

```tsx
// src/app/(dashboard)/layout.tsx
export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen bg-neutral-50">
      <Sidebar />  {/* w-60, fixed height */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar />  {/* h-14 */}
        <main className="flex-1 overflow-y-auto p-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  )
}
```

### Cabeçalho de página padrão

```tsx
function PageHeader({ title, description, actions }) {
  return (
    <div className="flex items-start justify-between mb-6 pb-6 border-b border-neutral-200">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-neutral-500 mt-1">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  )
}
```

### Grid de KPI cards

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <KpiCard title="Licitações Ativas" value="42" />
  <KpiCard title="Contratos Vigentes" value="18" />
  <KpiCard title="Vencendo em 30 dias" value="5" status="warning" />
  <KpiCard title="Documentos Pendentes" value="12" status="danger" />
</div>
```
