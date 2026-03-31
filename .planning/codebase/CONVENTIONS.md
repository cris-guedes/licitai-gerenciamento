# Coding Conventions

**Analysis Date:** 2026-03-13

## TypeScript Usage

**Strict Mode:**
- `"strict": true` is enabled in `tsconfig.json`
- `"target": "ES2017"`, `"module": "esnext"`, `"moduleResolution": "bundler"`
- `isolatedModules: true` — do not rely on `const enum` or namespace merging at runtime

**Type Imports:**
- Use `import type` for type-only imports consistently throughout the codebase
- Example from `src/server/modules/core-api/domain/use-cases/auth/register-user/RegisterUser.ts`:
  ```ts
  import type { RegisterUserDTO } from "./dtos/RegisterUserDTOs";
  import { RegisterUserMapper, type RegisterUserView } from "./dtos/RegisterUserView";
  ```
- Inline `type` modifier is also used inside named import braces: `import { foo, type Bar }`

**Type Inference:**
- Prefer `z.infer<typeof schema>` to derive types from Zod schemas rather than defining types manually
- Example from `src/client/features/auth/signup/components/StepContactInfo.tsx`:
  ```ts
  type FormValues = z.infer<typeof schema>
  ```
- Use TypeScript namespace merging to co-locate a class with its types (see Server Patterns below)

**`any` Usage:**
- Avoided in feature code; `any` appears only in infrastructure generics and auto-generated library files
- Catch blocks use `error: any` as a pragmatic concession in controller try/catch
- Auto-generated files under `src/main/lib/pncp/` and `src/main/lib/pncp-search/` are excluded from this convention

**`@ts-expect-error` / `@ts-ignore`:**
- `@ts-expect-error` preferred over `@ts-ignore` (used once in `src/client/stores/mcp.store.ts` for non-standard MCP SDK field)
- `@ts-ignore` appears only in auto-generated SDK code (`src/main/lib/pncp*/core/request.ts`)
- Always include an explanatory comment on the same line

---

## Naming Conventions

**Files:**
- React components: `PascalCase.tsx` — e.g., `SignupWizard.tsx`, `StepContactInfo.tsx`
- Hooks: `use-kebab-case.ts` — e.g., `use-debounce.ts`, `use-mcp-chat.ts`
- Stores: `kebab-case.store.ts` — e.g., `app.store.ts`, `mcp.store.ts`
- Server use-case classes: `PascalCaseName.ts` — e.g., `RegisterUser.ts`, `RegisterUserController.ts`
- Server DTOs: grouped in a `dtos/` subdirectory with `PascalCaseNameDTOs.ts` / `PascalCaseNameView.ts`
- Server factory functions: `makePascalCaseName.ts` — e.g., `makeRegisterUser.ts`
- Controller schemas: `PascalCaseNameControllerSchemas.ts`
- Providers: `kebab-case-provider.ts` — e.g., `user-provider.ts`, `pncp-search-provider.ts`
- Schema files (client): `kebab-case.schema.ts` — e.g., `chat.schema.ts`

**Directories:**
- Feature directories: `kebab-case` — e.g., `landing-page`, `wizard-mcp-chat`, `auth`
- Server use-case directories: `kebab-case` — e.g., `register-user`, `fetch-user`
- UI component directory: `src/client/components/ui/` for all shadcn/ui components

**Functions:**
- camelCase for functions and hooks — `updateData`, `formatPhone`, `useMcpChat`
- PascalCase for React components — `SignupWizard`, `Hero`, `ChatInput`
- PascalCase for classes — `RegisterUser`, `RegisterUserController`, `UserProvider`
- Factory functions use `make` prefix — `makeRegisterUser`, `makeFetchUser`

**Variables:**
- camelCase throughout
- Constants in camelCase (not SCREAMING_SNAKE_CASE) — `initialData`, `statusLabel`
- Boolean-returning variables avoid `is` prefix inconsistently; `isLoadingTools`, `isPending` are used on the client side

**Types / Interfaces:**
- `interface Props` used for component prop types (not exported unless shared)
- `interface PascalCaseName` for shared types
- Namespace types are co-located with their class via TypeScript `namespace` merging

---

## Component Patterns

**"use client" Directive:**
- All interactive components declare `"use client"` as the first line
- Components WITHOUT `"use client"` are Server Components by default (e.g., `Hero.tsx`, `Navbar.tsx`, landing-page components)
- Route pages (`src/app/**`) are Server Components unless they directly contain interactive state
- The `src/client/components/Providers.tsx` is a client boundary that wraps QueryClient and Tooltip

**Props Interfaces:**
- Simple, co-located `interface Props` is used for component-local prop types:
  ```ts
  interface Props {
    data: SignupData
    onBack: () => void
    onNext: (data: Pick<SignupData, "firstName" | "lastName" | "phone">) => void
  }
  ```
- Named, exported interfaces when types are shared across files (e.g., `SignupData` exported from `SignupWizard.tsx`)
- `type Props = ...` (using `type` alias) is used for intersection types: `type Props = Partial<ChatConfig> & { className?: string }`

**Exports:**
- Named exports for all components — never default export for components in `src/client/`
- Default exports for Next.js page files (`src/app/**`) as required by the framework
- Feature barrels: `index.ts` at feature root re-exports public API — e.g., `src/client/features/wizard-mcp-chat/index.ts`

**Component Function Style:**
- `function ComponentName(props: Props)` — standard function declaration (not arrow function) for components
- Arrow functions for helper utilities and callbacks inside components

**shadcn/ui Components:**
- UI primitives live in `src/client/components/ui/`
- Use the `cn()` helper from `src/client/lib/utils.ts` for conditional class composition
- `cva` (class-variance-authority) used within shadcn components for variant logic
- `Slot` from `radix-ui` used for `asChild` composition pattern

---

## Import Aliases and Path Conventions

**Path Alias:**
- `@/*` maps to `./src/*` (configured in `tsconfig.json`)

**Conventions by layer:**
- Client code imports: `@/client/components/...`, `@/client/features/...`, `@/client/lib/...`, `@/client/stores/...`
- Server code imports: `@/server/modules/...`, `@/server/shared/infra/...`
- Generated library code: `@/lib/pncp-search` maps to `src/main/lib/pncp-search` (used in `pncp-search-provider.ts`)
- Next.js app imports: `@/server/modules/core-api` (used in route handlers)

**Cross-layer rules (observed):**
- Client code never imports from `@/server/*`
- Server code never imports from `@/client/*`
- Both layers may import from `@/lib/*` (generated utilities in `src/main/lib/`)

**Import order pattern (observed in feature files):**
1. Framework imports (`next/link`, `react`, `react-hook-form`)
2. External libraries (`zod`, `lucide-react`, `@tanstack/react-query`)
3. Internal `@/client/*` or `@/server/*` imports
4. Relative imports (`./ComponentName`, `../schemas/...`)
5. Type-only imports (`import type ...`) mixed in at appropriate position

---

## CSS / Styling Conventions

**Framework:** Tailwind CSS v4

**`cn()` helper:**
- Always use `cn()` from `src/client/lib/utils.ts` for conditional or merged class strings:
  ```ts
  import { cn } from "@/client/lib/utils"

  className={cn("base-classes", condition && "conditional-class")}
  ```
- The `cn()` function combines `clsx` and `tailwind-merge`

**Object syntax for multiple conditions:**
- Use object notation inside `cn()` for multiple conditional classes:
  ```ts
  cn("text-xs", {
    "text-green-500": status === "connected",
    "text-yellow-500": status === "connecting",
    "text-destructive": status === "error",
    "text-muted-foreground": status === "idle",
  })
  ```

**Design Tokens (custom CSS variables):**
- `brand-obsidian` — primary dark brand color
- `brand-yellow` — primary accent/CTA color
- `neutral-soft` — soft background
- Standard shadcn semantic tokens: `primary`, `primary-foreground`, `muted`, `muted-foreground`, `foreground`, `background`, `border`, `destructive`, `ring`, `accent`

**Class ordering convention:**
- No Prettier-based Tailwind class sorting tool is configured; class order is author-determined
- Common pattern: layout → sizing → spacing → typography → color → effects → transitions → responsive variants

**Tailwind utility patterns observed:**
- `size-{n}` (not `w-{n} h-{n}`) for square elements
- `space-y-{n}` for vertical stacking within form groups and sections
- `container mx-auto max-w-7xl px-4` for page width constraint
- Opacity modifiers: `bg-brand-yellow/10`, `text-white/60`, `border-brand-obsidian/5`

---

## Error Handling Patterns

**Server-side (controllers):**
- All controller `handle()` methods use try/catch wrapping the use-case execution
- Zod parse errors are caught and converted to `serverError` (500 is used for schema validation failures — this is a known inconsistency, should be `badRequest` 400):
  ```ts
  try {
      const params = Schema.Input.parse(request.body);
      const result = await this.useCase.execute(params);
      return ok(result);
  } catch (error: any) {
      if (error instanceof z.ZodError) return serverError(new Error(error.message));
      return serverError(error);
  }
  ```
- HTTP response helpers defined in `src/server/modules/core-api/main/adapters/http-adapter.ts`:
  `ok`, `badRequest`, `notFound`, `serverError`

**Client-side (forms):**
- Validation is handled by Zod + react-hook-form via `zodResolver`
- Field-level errors displayed inline with `{errors.field && <p className="text-xs text-red-500">...</p>}`
- Async errors (e.g., JSON parse) use `form.setError(fieldName, { message: "..." })`
- Network errors in mutations tracked via TanStack Query's `onError` callback, stored in local state

**Client-side (stores):**
- Zustand store actions use try/catch and update an `error: string | null` state field
- Status is tracked as a discriminated string union: `"idle" | "connecting" | "connected" | "error"`

---

## Logging

- No structured logging library is used
- `console.log()` appears only in `SignupWizard.tsx` as a temporary debug statement tied to a `// TODO` comment
- No logging in server-side code (no pino/winston configured for request handlers)

---

## Comments

**When to comment:**
- JSDoc-style comments with `@example` on utility functions in `src/client/lib/utils/format.ts` and `src/client/hooks/use-debounce.ts`
- Inline block comments documenting empirical API discoveries (see `SearchPublicProcurements.ts` — detailed comments on PNCP API behavior)
- Section comments in JSX (`{/* Header */}`, `{/* Form */}`, `{/* Actions */}`) used consistently in multi-section components

**JSDoc pattern:**
```ts
/**
 * One-line description.
 * @example functionName(arg) → "result"
 */
export function functionName(arg: Type): ReturnType { ... }
```

---

## Server Architecture Patterns

**Use-case pattern (mandatory for all server features):**
Each use-case lives in its own directory and contains exactly these files:
- `UseCaseName.ts` — the use-case class with `execute()` method
- `UseCaseNameController.ts` — controller implementing `Controller<T>` interface
- `UseCaseNameControllerSchemas.ts` — Zod input schemas in a `namespace`
- `makeUseCaseName.ts` — factory function wiring dependencies
- `dtos/UseCaseNameDTOs.ts` — input type aliases
- `dtos/UseCaseNameView.ts` — output type and mapper class

**Namespace co-location:**
Classes expose their parameter and response types via TypeScript `namespace` merging:
```ts
export class RegisterUser { ... }
export namespace RegisterUser {
    export type Params = RegisterUserDTO;
    export type Response = RegisterUserView;
}
```
Controllers expose HTTP contract types via the same pattern:
```ts
export namespace RegisterUserController {
    export type Types    = RegisterUserControllerTypes;
    export type Body     = RegisterUserControllerTypes["Body"];
    export type Response = RegisterUserControllerTypes["Response"];
}
```

**Provider pattern:**
Static-method classes wrap all Prisma/external API calls:
```ts
export class UserProvider {
    static async create(data: UserProvider.CreateParams): Promise<UserProvider.User> { ... }
}
export namespace UserProvider {
    export type CreateParams = { ... };
    export type User = { ... };
}
```

**Route registration:**
Routes are plain objects mapping string keys to factory functions:
```ts
export const publicProcurementsRoutes = {
    "search-public-procurements": makeSearchPublicProcurements,
} satisfies Record<string, () => Controller>;
```
Unified in `src/server/modules/core-api/main/configs/setup-routes.ts` via spread into `allRoutes`.

---

## Observed Anti-Patterns / Inconsistencies

1. **Zod validation errors returned as 500 instead of 400** — all controllers catch `z.ZodError` and call `serverError()` (HTTP 500). Should use `badRequest()` (HTTP 400).
   Files: all `*Controller.ts` files in `src/server/modules/core-api/domain/use-cases/`

2. **Incomplete signup flow** — `SignupWizard.tsx` logs to console with a `TODO` comment instead of proceeding to step 3. The flow only has 2 UI steps but the comment indicates more are needed.
   File: `src/client/features/auth/signup/components/SignupWizard.tsx:46`

3. **`Providers` not wired into root layout** — `src/client/components/Providers.tsx` exists but is not imported in `src/app/layout.tsx`. TanStack Query and Tooltip context are unavailable globally.

4. **Mixed quote styles** — server files use double quotes, client files use double quotes consistently, but some shadcn UI components use double quotes while others use single quotes. No Prettier config enforces this.

5. **`error: any` in catch blocks** — all controllers use `catch (error: any)` instead of `catch (error: unknown)` with a type guard. This bypasses strict null checks.

6. **`findByField` dynamic field access** — `UserProvider.findByField()` accepts a `string` field name and uses dynamic property access. This is only safe because the caller is the Better Auth adapter with hardcoded fields, but the type signature does not enforce this.
   File: `src/server/shared/infra/providers/user-provider.ts:16`

---

*Convention analysis: 2026-03-13*
