# Typography — Licitare Design System

> Sistema tipográfico oficial. Prioridade extrema em legibilidade e hierarquia.
> Última atualização: 2026-03-13

---

## Filosofia tipográfica

A tipografia do Licitare segue uma abordagem **Editorial-Moderna**. Com uma base de **16px**, o sistema garante conforto visual em telas de alta resolução e clareza absoluta em dashboards complexos.

---

## 1. Fontes do sistema

### Fonte Principal — Inter
```css
font-family: 'Inter', sans-serif;
```
**Inter** é usada para toda a interface. Preferimos os pesos **Bold (700)** para títulos e **Medium (500)** para textos de corpo para manter o visual "premium" e legível.

---

## 2. Escala Tipográfica (Base 16px)

Baseada nas variáveis do sistema, nossa escala é calculada sobre o `base-font-size: 16px`.

| Token | Pixels | Rem | Uso |
|---|---|---|---|
| `text-body-xs` | 8px | 0.5rem | Micro-legendas, metadados comprimidos |
| `text-body-sm` | 12px | 0.75rem | Texto de suporte, legendas de gráfico, tags |
| `text-body` | 14px | 0.875rem | **Texto de corpo padrão, parágrafos** |
| `text-title` | 16px | 1rem | **Títulos de seções, labels de botões** |
| `text-hero` | 32px | 2rem | Títulos de destaque em Landing Pages |

---

## 3. Hierarquia

### H1 — Título Principal
- **Size:** 32px
- **Weight:** 700 (Bold)
- **Letter Spacing:** -0.02em
- **Color:** `--font-color-dark` (#2d3748)

### H2 — Título de Seção
- **Size:** 24px
- **Weight:** 700 (Bold)
- **Color:** `--font-color-dark` (#2d3748)

### H3 — Título de Card
- **Size:** 16px (text-title)
- **Weight:** 600 (SemiBold)
- **Color:** `--font-color-dark` (#2d3748)

### Body — Corpo de Texto
- **Size:** 14px (text-body)
- **Weight:** 400 (Regular)
- **Line Height:** 1.4em
- **Color:** `--font-color` (#4a5568)

---

## 4. Implementação — Tailwind CSS v4

```css
@theme {
  --font-sans: 'Inter', sans-serif;

  --text-xs: 0.5rem;      /* 8px */
  --text-sm: 0.75rem;     /* 12px */
  --text-base: 0.875rem;  /* 14px */
  --text-md: 1rem;        /* 16px */
  --text-lg: 1.5rem;      /* 24px */
  --text-xl: 2rem;        /* 32px */
}
```
