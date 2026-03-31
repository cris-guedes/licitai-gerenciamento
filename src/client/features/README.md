# Feature Architecture Guide For AI

This document defines how features must be created in this codebase.

Follow these rules as defaults unless the existing feature already has a stronger local pattern that should be preserved.

The goal is:

- vertical feature ownership
- explicit dependency injection
- components that do not know infra details
- hooks colocated with the UI context they serve
- lazy loading by user intent

---

## Core Mental Model

Each feature is a vertical slice.

A feature owns:

- its UI
- its feature-specific services
- its schemas and types
- its local use-case hooks

The most global component of a UI context is responsible for composing dependencies and connecting data to the visual tree.

In practice:

- the top component of the context acts as the controller
- the hook under that context acts as the reactive use-case/state layer
- child components should mostly receive props, callbacks, and already-prepared state

Do not hide the composition of dependencies in a random global hook if the dependency clearly belongs to a specific UI context.

---

## Non-Negotiable Rules

1. A feature must be self-contained. Do not import another feature's internal `components`, `hooks`, or `services`.
2. Every component should live in its own file.
3. Use-case hooks must live inside the component context they belong to, in a local `hooks/` folder.
4. External dependencies must be injected from the most global component of that context.
5. Child components should not know `useCoreApi()`, API clients, or low-level services.
6. Fetch data only when the user intent requires it. Do not eagerly load every tab/panel/modal payload up front.
7. Do not call a local use-case hook `*Controller`. In this architecture, the top component already plays the controller role.

---

## Recommended Folder Structure

```text
src/client/features/
└── <feature>/
    ├── components/
    │   ├── <ContextA>/
    │   │   ├── <ContextA>.tsx
    │   │   ├── hooks/
    │   │   │   └── use<ContextA>.ts
    │   │   ├── index.ts
    │   │   └── <ChildComponent>/
    │   │       ├── <ChildComponent>.tsx
    │   │       ├── hooks/
    │   │       │   └── use<ChildComponent>.ts
    │   │       └── index.ts
    │   └── <ContextB>/
    │       ├── <ContextB>.tsx
    │       ├── hooks/
    │       │   └── use<ContextB>.ts
    │       └── index.ts
    ├── services/
    ├── schemas/
    ├── types/
    └── utils/
```

Important:

- a feature-level `hooks/` folder is discouraged for use-case hooks
- only keep a hook at feature root if it truly belongs to the whole feature and not to a specific UI context
- in most cases, the correct place is `components/<Context>/hooks`

---

## Layers And Responsibilities

### `components/`

This is the UI tree for the feature.

The top component of each context should:

- create or receive the dependencies it needs
- inject those dependencies into its local use-case hook
- receive the reactive state/actions from that hook
- distribute props to children

Child components should:

- render UI
- emit callbacks
- stay unaware of infra

### `components/<Context>/hooks/`

These are contextual use-case hooks.

They exist to:

- orchestrate state for that UI context
- compose query/mutation behavior
- derive view-friendly state
- expose actions/intention in a shape the UI can consume

They do **not** exist to be generic dumping grounds for every hook in the feature.

Good names:

- `useSearchPage`
- `useLicitacaoDetail`
- `useSearchResultCard`

Avoid:

- `useSearchPageController`
- `useFeatureManager`
- `useEverything`

### `services/`

Services are the feature's boundary to external data sources.

They may wrap:

- API calls
- React Query hooks
- request configuration
- query key organization

Services are external dependencies from the perspective of the component context.

That means the top component of the context may compose them and inject them into its local hook.

### `schemas/`

Put Zod schemas and inferred types here when they define reusable business input/output shapes.

### `types/`

Use this for feature-specific types that do not belong in `schemas/`.

### `utils/`

Use this for pure feature helpers only.

---

## The Main Pattern

### 1. The top context component composes dependencies

Use the most global component in that context to create the API client and feature services.

Example from `search`:

```tsx
"use client"

import { Card } from "@/client/components/ui/card"
import { useCoreApi } from "@/client/hooks/use-core-api"
import { useSearchService } from "../../services/search"
import { SearchFilters } from "./SearchFilters"
import { SearchResultStack } from "./SearchResultStack"
import { useSearchPage } from "./hooks/useSearchPage"

export function SearchPage() {
  const api = useCoreApi()
  const searchService = useSearchService(api)

  const search = useSearchPage({ searchService })

  return (
    <div>
      <Card>
        <SearchFilters onSearch={search.search} onReset={search.reset} />
      </Card>

      <Card>
        <SearchResultStack {...search} onTextChange={search.updateQ} />
      </Card>
    </div>
  )
}
```

What matters here:

- dependency creation is visible
- the hook receives dependencies explicitly
- child components receive only what they need

### 2. The local hook orchestrates the use case

The local hook should manage the reactive behavior for that context.

Example shape:

```ts
type SearchPageDeps = {
  searchService: ReturnType<typeof useSearchService>
}

export function useSearchPage({ searchService }: SearchPageDeps) {
  const [filters, setFilters] = useState(SEARCH_FILTERS_DEFAULT)
  const [submitted, setSubmitted] = useState(false)

  const query = searchService.search({
    data: {
      q: filters.q || undefined,
      pagina: filters.pagina,
    },
    enabled: submitted,
  })

  function search(nextFilters: SearchFilters) {
    setFilters({ ...nextFilters, pagina: 1 })
    setSubmitted(true)
  }

  function reset() {
    setFilters(SEARCH_FILTERS_DEFAULT)
    setSubmitted(false)
  }

  return {
    filters,
    results: query.data?.items ?? [],
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
    search,
    reset,
  }
}
```

The hook should expose:

- state
- derived state
- actions
- UI-ready data

The hook should not expose raw infra details unless the UI truly needs them.

### 3. Child components stay small and local

Children should usually receive:

- plain data
- loading flags
- callbacks
- selected values

Prefer this:

```tsx
<SearchFilters onSearch={search.search} onReset={search.reset} />
```

Over this:

```tsx
<SearchFilters searchService={searchService} api={api} />
```

---

## Dependency Injection Rules

Dependency injection in this project is simple and explicit.

Preferred flow:

1. top component creates `api` with `useCoreApi()`
2. top component creates the feature services it needs
3. top component injects those services into the local contextual hook
4. local hook returns state/actions
5. children receive only the subset they need

This is the preferred direction because it keeps:

- composition visible
- dependencies testable
- UI contexts isolated

### Preferred

```tsx
const api = useCoreApi()
const procurementItemsService = useProcurementItemsService(api)
const card = useSearchResultCard(item, { procurementItemsService })
```

### Avoid

```tsx
function DeepChild() {
  const api = useCoreApi()
  const procurementService = useProcurementService(api)
  const data = procurementService.getEverything()
  ...
}
```

That pattern spreads infra knowledge through the tree and makes the feature harder to reason about.

---

## Lazy Loading By User Intent

This rule is very important.

Do not fetch data just because a component exists.

Fetch data when the user has expressed intent to see it.

Examples:

- a modal was opened
- a tab became active
- an accordion expanded
- a detail panel was explicitly requested

### Good example

In `LicitacaoDetail`, the feature only fetches the data for the active tab:

```ts
const detail = deps.procurementDetailService.get({
  item,
  enabled: isOpen,
})

const items = deps.procurementItemsService.get({
  item,
  enabled: isOpen && activeTab === "itens",
})

const files = deps.procurementFilesService.get({
  item,
  enabled: isOpen && activeTab === "documentos",
})
```

This is correct because the user may open the detail and never visit every tab.

### Another good example

In the result card, clicking "Ver itens" should only fetch the items, not every detail query for the procurement.

If the user did not open the full detail context, do not behave as if they did.

### Avoid

```ts
const detail = service.detail(...)
const files = service.files(...)
const history = service.history(...)
const atas = service.atas(...)
const contracts = service.contracts(...)
```

If all of that runs immediately when only one small interaction happened, the feature is doing too much work.

---

## Naming Rules

Use names that describe the UI context and use case.

### Components

- `SearchPage`
- `LicitacaoDetailContent`
- `SearchResultCard`

### Local hooks

- `useSearchPage`
- `useLicitacaoDetail`
- `useSearchResultCard`

### Services

- `useSearchService`
- `useProcurementItemsService`
- `useProcurementFilesService`

Do not invent overly abstract names when the context is already clear.

---

## Real Example From `search`

Use the `search` feature as the reference implementation for this pattern.

Important files:

- `src/client/features/search/components/SearchPage/SearchPage.tsx`
- `src/client/features/search/components/SearchPage/hooks/useSearchPage.ts`
- `src/client/features/search/components/SearchPage/SearchResultStack/SearchResultCard/SearchResultCard.tsx`
- `src/client/features/search/components/SearchPage/SearchResultStack/SearchResultCard/hooks/useSearchResultCard.ts`
- `src/client/features/search/components/LicitacaoDetail/LicitacaoDetailContent.tsx`
- `src/client/features/search/components/LicitacaoDetail/hooks/useLicitacaoDetail.ts`

What this feature demonstrates:

- explicit service composition in the top component
- hooks colocated inside the context they serve
- child components with smaller responsibilities
- dependency injection instead of hidden infra coupling
- lazy loading based on active tab or explicit interaction

---

## Decision Checklist For AI

Before creating a new feature or refactoring one, follow this checklist.

1. What is the top component for this UI context?
2. Which external services does this context need?
3. Can those services be composed in the top component and injected downward?
4. Does the use-case hook belong inside `components/<Context>/hooks`?
5. Are child components free from infra knowledge?
6. Is each component in its own file?
7. Are data fetches gated by actual user intent?
8. Is the naming tied to the real UI context instead of generic architecture jargon?

If the answer to any of these is "no", stop and simplify the design.

---

## Anti-Patterns To Avoid

- a generic root `hooks/` folder full of hooks that actually belong to specific components
- components importing `useCoreApi()` deep in the tree
- children directly constructing feature services
- one click triggering all detail queries for all tabs
- one huge file holding many unrelated components
- naming local hooks `Controller` when the component is already the controller in practice
- spreading infra concerns across many presentational components

---

## Final Principle

Build features so that an engineer or another AI can open the top component of a context and immediately understand:

- which dependencies exist
- which use case is being orchestrated
- which child components receive what
- when data is fetched

If that is visible in the top component, the feature is probably well-structured.
