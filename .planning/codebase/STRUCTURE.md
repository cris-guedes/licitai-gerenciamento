# Codebase Structure

**Analysis Date:** 2026-03-13

## Directory Layout

```
licitai/
├── src/
│   ├── app/                          # Next.js App Router (pages + API routes)
│   │   ├── (auth)/                   # Route group: auth pages (no URL prefix)
│   │   │   ├── layout.tsx            # Auth layout: split-panel branding + form
│   │   │   └── signup/
│   │   │       └── page.tsx          # /signup route → renders SignupWizard
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── [...all]/
│   │   │   │       └── route.ts      # Better Auth handler (GET + POST)
│   │   │   └── core/
│   │   │       └── [...slug]/
│   │   │           └── route.ts      # Core API catch-all → httpHandler
│   │   ├── favicon.ico
│   │   ├── globals.css               # Tailwind base styles
│   │   ├── layout.tsx                # Root layout (HTML, font, lang)
│   │   └── page.tsx                  # / landing page
│   │
│   ├── client/                       # All browser-side code (React)
│   │   ├── components/
│   │   │   ├── Providers.tsx         # QueryClientProvider + TooltipProvider
│   │   │   └── ui/                   # shadcn/ui primitives (40+ components)
│   │   ├── features/                 # Feature-scoped UI modules
│   │   │   ├── auth/
│   │   │   │   └── signup/
│   │   │   │       └── components/
│   │   │   │           ├── SignupWizard.tsx      # Multi-step signup controller
│   │   │   │           ├── StepUserType.tsx      # Step 1: user type selection
│   │   │   │           └── StepContactInfo.tsx   # Step 2: contact info form
│   │   │   ├── landing-page/
│   │   │   │   └── components/
│   │   │   │       ├── Navbar.tsx
│   │   │   │       ├── Hero.tsx
│   │   │   │       ├── SocialProof.tsx
│   │   │   │       ├── Features.tsx
│   │   │   │       ├── Capabilities.tsx
│   │   │   │       ├── Testimonials.tsx
│   │   │   │       ├── UseCases.tsx
│   │   │   │       ├── CTA.tsx
│   │   │   │       └── Footer.tsx
│   │   │   └── wizard-mcp-chat/
│   │   │       ├── components/
│   │   │       │   ├── WizardMcpChat.tsx        # Root chat UI component
│   │   │       │   ├── ChatMessageList.tsx
│   │   │       │   ├── ChatMessageItem.tsx
│   │   │       │   ├── ChatInput.tsx
│   │   │       │   └── ToolResultRenderer.tsx
│   │   │       ├── hooks/
│   │   │       │   ├── use-mcp-client.ts        # Connects to MCP endpoint
│   │   │       │   └── use-mcp-chat.ts          # listTools + callTool (React Query)
│   │   │       ├── schemas/
│   │   │       │   └── chat.schema.ts           # Zod schemas: ChatConfig, ChatMessage
│   │   │       └── index.ts                     # Public barrel export
│   │   ├── hooks/
│   │   │   ├── use-debounce.ts
│   │   │   └── use-mobile.ts
│   │   ├── lib/
│   │   │   ├── auth/
│   │   │   │   └── auth.client.ts               # Better Auth client (signIn, signOut, useSession)
│   │   │   ├── utils/
│   │   │   │   └── format.ts
│   │   │   └── utils.ts                         # cn() helper (clsx + tailwind-merge)
│   │   └── stores/
│   │       ├── app.store.ts                     # Zustand: sidebar open/close
│   │       └── mcp.store.ts                     # Zustand: MCP client connection state
│   │
│   ├── server/                       # Server-only code (never imported by client)
│   │   ├── modules/
│   │   │   └── core-api/
│   │   │       ├── index.ts                     # Exports httpHandler (the Next.js entry point)
│   │   │       ├── readme.md                    # Clean Architecture reference doc
│   │   │       ├── domain/
│   │   │       │   └── use-cases/
│   │   │       │       ├── README.md            # Use case gold standard protocol
│   │   │       │       ├── auth/
│   │   │       │       │   ├── fetch-user/      # Use case: fetch user by field/id/email
│   │   │       │       │   └── register-user/   # Use case: create new user
│   │   │       │       ├── company-details/
│   │   │       │       │   └── fetch-company-by-cnpj/  # Use case: CNPJ lookup via OpenCNPJ
│   │   │       │       └── search/
│   │   │       │           └── search-public-procurements/  # Use case: PNCP full-text search
│   │   │       └── main/
│   │   │           ├── adapters/
│   │   │           │   ├── http-adapter.ts      # HttpRequest/HttpResponse contracts + helpers
│   │   │           │   └── next-http-adapter.ts # NextRequest → HttpRequest coercion
│   │   │           ├── configs/
│   │   │           │   └── setup-routes.ts      # Route registry: slug key → factory map
│   │   │           ├── routes/
│   │   │           │   ├── company-details.ts   # Route: "fetch-company-by-cnpj"
│   │   │           │   └── public-procurements.ts  # Route: "search-public-procurements"
│   │   │           └── scripts/                 # Dev-time codegen scripts (generate-swagger, etc.)
│   │   └── shared/
│   │       └── infra/
│   │           ├── auth/
│   │           │   └── auth.ts                  # Better Auth config (email/password, bearer, jwt)
│   │           ├── db/
│   │           │   ├── client.ts                # Prisma singleton with pg connection pool
│   │           │   ├── schema.prisma            # Database schema
│   │           │   └── migrations/              # Prisma migration SQL files
│   │           ├── providers/
│   │           │   ├── README.md                # Provider implementation standard
│   │           │   ├── user-provider.ts         # CRUD on User via Prisma
│   │           │   ├── company-details-provider.ts  # Extends OpenCnpjService
│   │           │   ├── pncp-search-provider.ts  # Extends DefaultService (PNCP Search)
│   │           │   ├── auth.adapter.ts          # Custom Better Auth DB adapter (uses UserProvider)
│   │           │   └── [30+ pncp-*-provider.ts] # Providers wrapping PNCP admin API services
│   │           └── types.ts                     # MethodKeys, ServiceParams, ServiceResponse utilities
│   │
│   └── main/                         # Shared utilities and generated API clients (isomorphic)
│       ├── docs/                     # Project documentation, API specs, design-system docs
│       │   ├── apis/
│       │   │   ├── api.pncp.json     # PNCP admin API OpenAPI spec
│       │   │   └── api.pncp.search.yml  # PNCP search API OpenAPI spec
│       │   └── design-system/
│       └── lib/
│           ├── opencnpj/
│           │   └── index.ts          # Hand-written OpenCNPJ HTTP client
│           ├── pncp/                 # Auto-generated PNCP admin API client
│           │   ├── core/             # Base HTTP infrastructure (request, cancellation, errors)
│           │   ├── models/           # ~100 generated DTO/model files
│           │   └── services/         # ~20 generated service classes
│           └── pncp-search/          # Auto-generated PNCP search API client
│               ├── core/
│               ├── models/           # SearchItem, SearchResponse
│               └── services/
│                   └── DefaultService.ts  # searchDocuments() method
│
├── public/                           # Static assets
├── .planning/                        # GSD planning documents
├── next.config.ts                    # Next.js config (minimal)
├── tsconfig.json                     # TypeScript config (@/* alias → ./src/*)
├── package.json
└── postcss.config.mjs
```

## Directory Purposes

**`src/app/`:**
- Purpose: Next.js App Router root. Contains only routing glue — page components delegate rendering to `src/client/features/`, and API routes delegate to `src/server/`.
- Contains: `page.tsx`, `layout.tsx`, `route.ts`, global CSS, favicon.
- Key files: `src/app/api/core/[...slug]/route.ts` (all core API traffic), `src/app/api/auth/[...all]/route.ts` (Better Auth).

**`src/client/`:**
- Purpose: All React/browser code. Strictly client-only.
- Contains: Feature modules, shared UI library (shadcn), Zustand stores, React Query setup, custom hooks, utilities.
- Key files: `src/client/components/Providers.tsx`, `src/client/lib/auth/auth.client.ts`, `src/client/stores/mcp.store.ts`.

**`src/client/features/`:**
- Purpose: Self-contained feature modules. Each feature owns its components, hooks, and schemas.
- Contains: `landing-page/`, `auth/signup/`, `wizard-mcp-chat/`.
- Key files: `src/client/features/wizard-mcp-chat/components/WizardMcpChat.tsx`, `src/client/features/auth/signup/components/SignupWizard.tsx`.

**`src/client/components/ui/`:**
- Purpose: shadcn/ui component library — reusable, unstyled-by-default primitives.
- Contains: ~40 components (Button, Card, Dialog, Form, Input, Table, etc.).
- Key files: `src/client/components/ui/button.tsx`, `src/client/components/ui/form.tsx`.

**`src/server/modules/core-api/`:**
- Purpose: The entire REST API implementation following Clean Architecture.
- Contains: `domain/use-cases/` (business logic), `main/` (HTTP adapters + route registry).
- Key files: `src/server/modules/core-api/index.ts`, `src/server/modules/core-api/main/configs/setup-routes.ts`.

**`src/server/modules/core-api/domain/use-cases/`:**
- Purpose: Feature-grouped use cases. Each use case is a self-contained directory.
- Contains: Use case class, controller, factory, `dtos/` subdirectory, `ControllerSchemas.ts`.
- Key files: See use case directories under `auth/`, `company-details/`, `search/`.

**`src/server/shared/infra/`:**
- Purpose: All shared infrastructure: database, auth, and providers for all use cases.
- Contains: Prisma client singleton, DB schema, migrations, Better Auth config, provider classes.
- Key files: `src/server/shared/infra/db/schema.prisma`, `src/server/shared/infra/db/client.ts`, `src/server/shared/infra/auth/auth.ts`.

**`src/server/shared/infra/providers/`:**
- Purpose: Concrete implementations wrapping external services. Act as the infrastructure boundary.
- Contains: `user-provider.ts` (Prisma CRUD), `pncp-search-provider.ts` (PNCP Search), `company-details-provider.ts` (OpenCNPJ), `auth.adapter.ts` (Better Auth custom adapter), plus 30+ PNCP admin API providers.
- Key files: `src/server/shared/infra/providers/user-provider.ts`, `src/server/shared/infra/providers/pncp-search-provider.ts`.

**`src/main/lib/`:**
- Purpose: Isomorphic (runtime-agnostic) API client libraries. Shared between server providers and any future client usage.
- Contains: `pncp/` (auto-generated from JSON spec), `pncp-search/` (auto-generated from YAML spec), `opencnpj/` (hand-written).
- Key files: `src/main/lib/opencnpj/index.ts`, `src/main/lib/pncp-search/services/DefaultService.ts`.

**`src/main/docs/`:**
- Purpose: Reference documentation and OpenAPI spec files used for client generation.
- Contains: `apis/api.pncp.json`, `apis/api.pncp.search.yml`, design-system docs.

## Key File Locations

**Entry Points:**
- `src/app/layout.tsx`: Root HTML layout.
- `src/app/page.tsx`: Landing page (`/`).
- `src/app/(auth)/signup/page.tsx`: Signup page (`/signup`).
- `src/app/api/core/[...slug]/route.ts`: All `GET /api/core/**` requests.
- `src/app/api/auth/[...all]/route.ts`: All `GET/POST /api/auth/**` requests.

**Configuration:**
- `tsconfig.json`: TypeScript config, `@/*` → `./src/*` path alias.
- `src/server/shared/infra/db/schema.prisma`: Database schema (Prisma, PostgreSQL).
- `src/server/shared/infra/auth/auth.ts`: Better Auth configuration.
- `next.config.ts`: Next.js config (minimal, no custom settings).

**Core Logic:**
- `src/server/modules/core-api/index.ts`: HTTP handler entry point.
- `src/server/modules/core-api/main/configs/setup-routes.ts`: Route registry.
- `src/server/modules/core-api/main/adapters/http-adapter.ts`: `Controller`, `HttpRequest`, `HttpResponse` contracts.
- `src/server/shared/infra/db/client.ts`: Prisma singleton.
- `src/client/stores/mcp.store.ts`: MCP connection lifecycle.

**DB Schema:**
- `src/server/shared/infra/db/schema.prisma`: Models — `User`, `Session`, `Account`, `Verification`, `Organization`, `Company`, `Membership`, `CompanyMembership`.
- `src/server/shared/infra/db/migrations/`: SQL migration files managed by Prisma Migrate.

**Testing:**
- No test files detected in the codebase.

## Naming Conventions

**Files:**
- Use case directories: `kebab-case` (e.g., `search-public-procurements/`, `fetch-company-by-cnpj/`).
- TypeScript source files: `PascalCase` for classes/components (e.g., `SearchPublicProcurements.ts`, `WizardMcpChat.tsx`), `camelCase` for factories/hooks/utilities (e.g., `makeSearchPublicProcurements.ts`, `use-mcp-chat.ts`).
- Schema files: `PascalCase` + `ControllerSchemas` suffix (e.g., `SearchPublicProcurementsControllerSchemas.ts`).
- DTO files: `PascalCaseDTOs.ts` (input) and `PascalCaseView.ts` (output).
- Factory files: `make` prefix + `PascalCase` use case name (e.g., `makeSearchPublicProcurements.ts`).
- Provider files: `kebab-case` + `-provider.ts` suffix (e.g., `pncp-search-provider.ts`, `user-provider.ts`).
- Hook files: `use-kebab-case.ts` (e.g., `use-mcp-client.ts`, `use-debounce.ts`).
- Store files: `kebab-case.store.ts` (e.g., `app.store.ts`, `mcp.store.ts`).

**Directories:**
- Feature directories: `kebab-case` (e.g., `landing-page/`, `wizard-mcp-chat/`).
- Use case group directories: `kebab-case` matching the domain concept (e.g., `auth/`, `company-details/`, `search/`).

**Classes:**
- Use cases: `PascalCase` verb+noun (e.g., `SearchPublicProcurements`, `FetchCompanyByCnpj`, `RegisterUser`).
- Controllers: `PascalCase` use case name + `Controller` (e.g., `SearchPublicProcurementsController`).
- Providers: `PascalCase` concept + `Provider` (e.g., `PncpSearchProvider`, `UserProvider`).

**TypeScript namespaces:**
- Always same name as the class. Holds `Params`, `Response`, and utility types (e.g., `namespace SearchPublicProcurements { type Params = ...; type Response = ...; }`).

## File Organization Within a Feature (Use Case)

Every use case follows this exact structure:

```
src/server/modules/core-api/domain/use-cases/<group>/<use-case-name>/
├── <UseCaseName>.ts                      # Business logic class
├── <UseCaseName>Controller.ts            # HTTP-agnostic controller
├── <UseCaseName>ControllerSchemas.ts     # Zod input schema (source of truth)
├── make<UseCaseName>.ts                  # DI factory (wires provider → use case → controller)
└── dtos/
    ├── <UseCaseName>DTOs.ts              # Input TypeScript interface (may mirror schema)
    └── <UseCaseName>View.ts              # Output type + static Mapper class
```

**Example — `search-public-procurements`:**
- `SearchPublicProcurements.ts` — `execute(params)` serializes array fields and calls `PncpSearchProvider`.
- `SearchPublicProcurementsController.ts` — validates query with Zod, calls use case, returns `ok(result)`.
- `SearchPublicProcurementsControllerSchemas.ts` — Zod schema with `.describe()` on every field.
- `makeSearchPublicProcurements.ts` — `new SearchPublicProcurements(PncpSearchProvider)` → `new SearchPublicProcurementsController(useCase)`.
- `dtos/` — DTO type and view/mapper.

## Where to Add New Code

**New API endpoint:**
1. Create use case directory: `src/server/modules/core-api/domain/use-cases/<group>/<use-case-name>/`.
2. Add all 5 files: `UseCase.ts`, `UseCaseController.ts`, `UseCaseControllerSchemas.ts`, `makeUseCase.ts`, `dtos/`.
3. Create or update a route file in `src/server/modules/core-api/main/routes/` mapping the slug key to the factory.
4. Add the route entry to `src/server/modules/core-api/main/configs/setup-routes.ts`.

**New provider (infrastructure adapter):**
- Add to `src/server/shared/infra/providers/` following `kebab-case-provider.ts` naming.
- Extend or wrap the relevant SDK class from `src/main/lib/`.

**New external API client:**
- Add generated or hand-written client to `src/main/lib/<client-name>/`.
- Spec files (if any) go to `src/main/docs/apis/`.

**New page:**
- Add `src/app/<route>/page.tsx` (and `layout.tsx` if needed).
- Feature UI code goes in `src/client/features/<feature-name>/`.

**New feature UI module:**
- Create `src/client/features/<feature-name>/` with subdirectories as needed: `components/`, `hooks/`, `schemas/`.
- Export public API from `index.ts` if the feature is consumed outside.

**New shared UI component:**
- Add to `src/client/components/ui/` following shadcn/ui conventions.

**New global client hook:**
- Add to `src/client/hooks/use-<name>.ts`.

**New global Zustand store:**
- Add to `src/client/stores/<name>.store.ts`.

**New database model:**
- Add to `src/server/shared/infra/db/schema.prisma`.
- Run `npx prisma migrate dev` to generate migration.

## Special Directories

**`src/main/lib/pncp/` and `src/main/lib/pncp-search/`:**
- Purpose: Auto-generated TypeScript clients from OpenAPI specs.
- Generated: Yes (via scripts in `src/server/modules/core-api/main/scripts/`).
- Committed: Yes (generated output is committed to the repo).

**`src/server/shared/infra/db/migrations/`:**
- Purpose: Prisma Migrate SQL migration history.
- Generated: Yes (by `prisma migrate dev`).
- Committed: Yes.

**`src/main/docs/`:**
- Purpose: Project reference documentation and API specification files.
- Generated: No.
- Committed: Yes.

**`.planning/`:**
- Purpose: GSD planning documents for orchestration and AI-assisted development.
- Generated: By GSD commands.
- Committed: Yes.

**`.next/`:**
- Purpose: Next.js build output.
- Generated: Yes.
- Committed: No (in `.gitignore`).

---

*Structure analysis: 2026-03-13*
