# Colors — Licitare Design System

> Sistema de cores oficial. Todos os valores de cor devem vir exclusivamente desta documentação.
> Última atualização: 2026-03-13

---

## Filosofia de cores

O sistema de cores do Licitare foi atualizado para uma estética **Premium High-Contrast**, baseada em:

1. **Autoridade Modernista** — o uso do Dark Obsidian (`#2b2e35`) como base para transmitir solidez e modernidade.
2. **Impacto e Foco** — o Vibrant Yellow (`#E2F32B`) como cor de destaque para ações críticas e atenção.
3. **Clareza Editorial** — uma paleta de cinzas suaves para fundos e textos, priorizando a legibilidade.

---

## 1. Paleta de Marca — Obsidian & Yellow

A identidade é ancorada pelo contraste entre a escuridão profunda do Obsidian e a energia neon do Yellow.

### Brand Primary: Obsidian
Usado para elementos estruturais, navegação principal e botões de alta prioridade.

| Token | Nome | HEX | HSL | Uso |
|---|---|---|---|---|
| `brand-obsidian-900` | Deep Obsidian | `#1a1c21` | `hsl(220, 12%, 11%)` | Fundos ultra-escuros, overlays |
| `brand-obsidian-600` | **Obsidian** | `#2b2e35` | `hsl(220, 10%, 19%)` | **Cor primária — botões, header, sidebar** |
| `brand-obsidian-400` | Steel Obsidian | `#4f525b` | `hsl(220, 8%, 34%)` | Hover de botões primários |

### Brand Accent: Vibrant Yellow
Usado para Call-to-Actions (CTAs) de impacto, indicadores de destaque e feedback de "wow".

| Token | Nome | HEX | HSL | Uso |
|---|---|---|---|---|
| `brand-yellow-500` | **Vibrant Yellow** | `#E2F32B` | `hsl(65, 90%, 56%)` | **Ações de destaque, CTAs de conversão** |
| `brand-yellow-600` | Acid Yellow | `#c9d926` | `hsl(65, 70%, 50%)` | Hover de elementos Yellow |

---

## 2. Paleta Neutra — Slate Gray

Usada para o corpo da interface, textos e superfícies secundárias.

| Token | HEX | Uso |
|---|---|---|
| `neutral-900` | `#2d3748` | Texto principal, títulos dark |
| `neutral-700` | `#4a5568` | Texto de corpo, labels |
| `neutral-500` | `#a0aec0` | Texto secundário, ícones inativos |
| `neutral-200` | `#edf2f7` | Hover de superfícies, bordas leves |
| `neutral-100` | `#e2e8f0` | Fundo de inputs, divisores |
| `neutral-50` | `#f7fafc` | **Fundo padrão de páginas** |

---

## 3. Cores de Estado Semântico (Fides Overlay Based)

| Token | HEX | Significado |
|---|---|---|
| `success` | `#38a169` | GPC Applied, Confirmações |
| `danger` | `#e53e3e` | GPC Overridden, Erros críticos |
| `warning` | `#f6ad55` | Alertas de prazo e atenção |
| `info` | `#3182ce` | Informações contextuais |
| `error-bg` | `#f7c2c2` | Fundo de mensagens de erro |

---

## 4. Implementação — CSS Custom Properties

```css
:root {
  /* Brand */
  --color-primary: #2b2e35;
  --color-primary-hover: #4f525b;
  --color-accent: #E2F32B;
  --color-accent-hover: #c9d926;

  /* Neutrals */
  --background-page: #f7fafc;
  --font-color: #4a5568;
  --font-color-dark: #2d3748;
  --hover-color: #edf2f7;
  --border-color: #e2e8f0;

  /* Semantic */
  --success: #38a169;
  --danger: #e53e3e;
  --error-bg: #f7c2c2;
  --inactive-color: #a0aec0;
}
```

---

## 5. Implementação — Tailwind CSS v4

```css
@theme {
  --color-brand-primary: #2b2e35;
  --color-brand-accent: #E2F32B;
  
  --color-neutral-900: #2d3748;
  --color-neutral-700: #4a5568;
  --color-neutral-100: #e2e8f0;
  --color-neutral-50: #f7fafc;

  --color-success: #38a169;
  --color-danger: #e53e3e;
}
```
B;
  --color-neutral-100: #F3F4F6;
  --color-neutral-50: #F9FAFB;

  --color-success: #16A34A;
  --color-danger: #DC2626;
  --color-warning: #D97706;
  --color-info: #0284C7;
}
```
