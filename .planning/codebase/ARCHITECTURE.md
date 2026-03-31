# Architecture

**Analysis Date:** 2026-03-13

## Pattern Overview

**Overall:** Clean Architecture (explicitly named in `src/server/modules/core-api/readme.md`)

**Key Characteristics:**
- Dependency rule strictly enforced: Framework HTTP → Infrastructure → Domain. The domain never imports from framework or infrastructure.
- Every feature is a self-contained use case directory with fixed internal files.
- Dependency injection is performed exclusively inside `make<UseCaseName>.ts` factory files — no DI container.
- Providers serve as the infrastructure boundary: thin adapter classes that wrap external SDKs/services.
- Schema-First validation with Zod: the `ControllerSchemas.ts` file is the input contract; types are `z.infer<>` derivations.

## Layers

**Next.js App Router (HTTP boundary):**
- Purpose: Route registration only — thin glue between Next.js and the internal handler.
- Location: `src/app/`
- Contains: `page.tsx` files (React Server Components), `layout.tsx`, and `route.ts` files for API routes.
- Depends on: `src/server/modules/core-api/` (for the API handler) and `src/client/features/` (for rendering).
- Used by: Browser / HTTP clients.

**Core API Module:**
- Purpose: Internal HTTP dispatcher. Resolves a slug-based route key to a factory and executes it.
- Location: `src/server/modules/core-api/`
- Contains: `index.ts` (the `httpHandler` export), adapters, route registrations, use-case directories.
- Depends on: Domain use cases, infrastructure providers.
- Used by: `src/app/api/core/[...slug]/route.ts`.

**Domain (Use Cases):**
- Purpose: Business logic. Framework-agnostic. Only knows its own interfaces, DTOs, and providers.
- Location: `src/server/modules/core-api/domain/use-cases/`
- Contains: `UseCase.ts`, `UseCaseController.ts`, `makeUseCase.ts`, `dtos/` per use case.
- Depends on: Providers from `src/server/shared/infra/providers/` (injected via factory).
- Used by: Controllers within the same use case directory, nothing else.

**Infrastructure (Providers):**
- Purpose: Concrete implementations of external dependencies — external APIs, database access.
- Location: `src/server/shared/infra/providers/`
- Contains: Static-method provider classes wrapping PNCP SDK, OpenCNPJ service, Prisma ORM, and Better Auth.
- Depends on: `src/main/lib/` (generated API clients), `src/server/shared/infra/db/` (Prisma client).
- Used by: Factory functions inside use cases.

**Shared Infrastructure:**
- Purpose: Singletons and cross-cutting infrastructure concerns.
- Location: `src/server/shared/infra/`
- Contains: `db/client.ts` (Prisma singleton with `pg` driver), `db/schema.prisma` (DB schema), `auth/auth.ts` (Better Auth config), `types.ts` (utility TypeScript helpers).
- Depends on: `pg`, `@prisma/client`, `better-auth`.
- Used by: Providers, the auth route handler.

**External API Clients (`src/main/lib/`):**
- Purpose: Generated or hand-written TypeScript clients for external APIs.
- Location: `src/main/lib/`
- Contains: `pncp/` (auto-generated from `api.pncp.json`), `pncp-search/` (auto-generated from `api.pncp.search.yml`), `opencnpj/` (hand-written service).
- Depends on: External HTTP APIs only.
- Used by: Providers in `src/server/shared/infra/providers/`.

**Client (React / Next.js Frontend):**
- Purpose: All browser-side code. Organized into features, shared UI components, stores, hooks, and utilities.
- Location: `src/client/`
- Contains: Feature-scoped components/hooks/schemas, shadcn/ui primitives, Zustand stores, React Query hooks.
- Depends on: `src/app/api/` (via HTTP calls), `better-auth/react` (auth client).
- Used by: `src/app/` page and layout files.

## Data Flow

**API request (e.g., search public procurements):**

1. Browser sends `GET /api/core/search-public-procurements?q=...`
2. Next.js routes to `src/app/api/core/[...slug]/route.ts` → calls `httpHandler` from `src/server/modules/core-api/index.ts`.
3. `httpHandler` joins slug array to key `"search-public-procurements"`, looks it up in `allRoutes` (defined in `src/server/modules/core-api/main/configs/setup-routes.ts`).
4. The matched factory `makeSearchPublicProcurements` from `src/server/modules/core-api/domain/use-cases/search/search-public-procurements/makeSearchPublicProcurements.ts` is called, instantiating the use case and controller.
5. `adaptNextRoute` in `src/server/modules/core-api/main/adapters/next-http-adapter.ts` converts the `NextRequest` into a framework-agnostic `HttpRequest` (coercing query string types).
6. `SearchPublicProcurementsController.handle()` validates input with Zod (`SearchPublicProcurementsControllerSchemas.Input.parse`).
7. `SearchPublicProcurements.execute()` serializes array parameters with `|` separator and delegates to `PncpSearchProvider.searchDocuments()`.
8. `PncpSearchProvider` (in `src/server/shared/infra/providers/pncp-search-provider.ts`) extends `DefaultService` from the generated PNCP Search client.
9. Result is returned up the chain; `adaptNextRoute` wraps it in `NextResponse.json(data, { status: statusCode })`.

**Auth request (Better Auth):**

1. Browser sends `POST /api/auth/sign-in` (Better Auth standard path).
2. Next.js routes to `src/app/api/auth/[...all]/route.ts` → calls `toNextJsHandler(auth.handler)`.
3. Better Auth uses `customAuthAdapter` in `src/server/shared/infra/providers/auth.adapter.ts`, which intercepts user model operations and delegates to `UserProvider` (Prisma-backed), while non-user tables use the base Prisma adapter.

**Client-side MCP chat:**

1. `WizardMcpChat` component mounts and calls `useMcpClient(endpoint)`.
2. `useMcpStore.connect()` opens a `StreamableHTTPClientTransport` connection to the MCP endpoint.
3. `useMcpChat` hook queries available tools via `client.listTools()` (React Query).
4. User selects a tool; `callTool.mutate()` calls `client.callTool(...)`.
5. Optimistic message is appended to local state; result updates it on resolution.

**State Management:**
- Global app state (sidebar): `src/client/stores/app.store.ts` (Zustand).
- MCP connection state: `src/client/stores/mcp.store.ts` (Zustand).
- Server state / async data: TanStack React Query (via `QueryClientProvider` in `src/client/components/Providers.tsx`).
- Local wizard state: `useState` inside `SignupWizard`.

## Key Abstractions

**Controller (HTTP-agnostic handler):**
- Purpose: Bridges `HttpRequest`/`HttpResponse` contracts to a use case. Never imports Next.js or any HTTP framework.
- Examples: `src/server/modules/core-api/domain/use-cases/search/search-public-procurements/SearchPublicProcurementsController.ts`
- Pattern: Implements `Controller<T>` interface from `src/server/modules/core-api/main/adapters/http-adapter.ts`. Defines a local `interface` with `Body`, `Query`, `Params`, `Response` slots. Validates input with Zod. Returns `ok()` / `serverError()` helpers.

**Use Case:**
- Purpose: Single-method business logic. Only knows providers (injected) and its own DTOs.
- Examples: `src/server/modules/core-api/domain/use-cases/search/search-public-procurements/SearchPublicProcurements.ts`
- Pattern: Class with `constructor(private readonly provider: typeof SomeProvider)` and `async execute(params): Promise<Response>`. Uses a `namespace` on the same export for `Params` and `Response` types.

**Factory (`make<UseCaseName>`):**
- Purpose: Single place where concrete dependencies are wired. Called once per HTTP request.
- Examples: `src/server/modules/core-api/domain/use-cases/search/search-public-procurements/makeSearchPublicProcurements.ts`
- Pattern: Plain function `makeX(): XController`. Instantiates provider, use case, controller — returns controller.

**Provider (infrastructure adapter):**
- Purpose: Wraps an external SDK or service behind a typed, domain-facing interface.
- Examples: `src/server/shared/infra/providers/pncp-search-provider.ts`, `src/server/shared/infra/providers/user-provider.ts`, `src/server/shared/infra/providers/company-details-provider.ts`
- Pattern: Class (often extending the generated SDK class) with a companion `namespace` for `Params<M>` and `Response<M>` utility types.

**ControllerSchemas:**
- Purpose: Zod schema that is the single source of truth for HTTP input validation. Every field carries a `.describe()` annotation for MCP consumers.
- Examples: `src/server/modules/core-api/domain/use-cases/search/search-public-procurements/SearchPublicProcurementsControllerSchemas.ts`
- Pattern: `export namespace XControllerSchemas { export const Input = ...; export type Input = z.infer<typeof ...>; }`

**DTOs and View/Mapper:**
- Purpose: Input type (`XxxDTO`) and output type + mapper class (`XxxView` / `XxxMapper.toView()`).
- Examples: `src/server/modules/core-api/domain/use-cases/auth/register-user/dtos/`
- Pattern: `XxxDTOs.ts` holds input interface. `XxxView.ts` holds output type and a static `Mapper` class with `toView(data)`.

**Route registry (`allRoutes`):**
- Purpose: Maps URL slug keys to factory functions. All routes are registered here.
- Location: `src/server/modules/core-api/main/configs/setup-routes.ts`
- Pattern: Plain object `satisfies Record<string, () => Controller>`. Route key IS the URL segment (e.g., `"search-public-procurements"`).

## Entry Points

**Next.js app:**
- Location: `src/app/layout.tsx`
- Triggers: All page renders.
- Responsibilities: HTML root, global CSS, Inter font variable, `pt-BR` lang.

**Landing page:**
- Location: `src/app/page.tsx`
- Triggers: `GET /`
- Responsibilities: Composes landing page sections from `src/client/features/landing-page/`.

**Core API handler:**
- Location: `src/app/api/core/[...slug]/route.ts`
- Triggers: `GET /api/core/**`
- Responsibilities: Re-exports `httpHandler` as Next.js `GET` export.

**Auth handler:**
- Location: `src/app/api/auth/[...all]/route.ts`
- Triggers: `GET/POST /api/auth/**`
- Responsibilities: Delegates all auth routes to Better Auth via `toNextJsHandler`.

**Signup page:**
- Location: `src/app/(auth)/signup/page.tsx`
- Triggers: `GET /signup`
- Responsibilities: Renders `SignupWizard` component.

## Error Handling

**Strategy:** Try/catch at the controller level. Errors bubble up and are caught in `handle()`, returning structured `HttpResponse` with appropriate status codes.

**Patterns:**
- `ZodError` → caught explicitly in controllers, mapped to `serverError(new Error(error.message))` (500).
- Generic errors → `serverError(error)` (500).
- Missing route → `NextResponse.json({ message: "Not found", path: key }, { status: 404 })` in `httpHandler`.
- External API errors → thrown as `Error` from provider/SDK layers, caught at controller.

## Cross-Cutting Concerns

**Logging:** Not present — `console.log` in one TODO comment only.
**Validation:** Zod at the controller boundary. `z.parse()` throws synchronously; caught in try/catch.
**Authentication:** Better Auth handles session/token management. `src/client/lib/auth/auth.client.ts` exposes `signIn`, `signUp`, `signOut`, `useSession` for client-side use.
**Path Alias:** `@/*` → `./src/*` (defined in `tsconfig.json`).

---

*Architecture analysis: 2026-03-13*
