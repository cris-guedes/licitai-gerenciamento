# Testing Patterns

**Analysis Date:** 2026-03-13

## Current State

**No tests exist in this codebase.**

There are zero `.test.ts`, `.test.tsx`, `.spec.ts`, or `.spec.tsx` files in `src/`. No test runner (Jest, Vitest, Playwright, Cypress) is configured or installed as a dependency in `package.json`. No test scripts exist in the `scripts` section of `package.json`.

---

## Test Framework

**Runner:** Not configured

**To add (recommended):**
- **Vitest** for unit and integration tests (compatible with Vite-based tooling, works well with Next.js 15+)
- **Playwright** for end-to-end tests

**Suggested install:**
```bash
npm install --save-dev vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/user-event
```

**Suggested `vitest.config.ts`:**
```ts
import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
```

---

## What Should Be Tested (Priority Order)

### High Priority

**1. Server use-case classes**
Each use-case in `src/server/modules/core-api/domain/use-cases/` has a pure `execute()` method that takes a params object and returns a result. These are ideal unit tests.

Pattern to follow:
```ts
// src/server/modules/core-api/domain/use-cases/auth/register-user/RegisterUser.test.ts
import { describe, it, expect, vi } from "vitest"
import { RegisterUser } from "./RegisterUser"
import { UserProvider } from "@/server/shared/infra/providers/user-provider"

describe("RegisterUser", () => {
  it("calls provider.create with the given params and returns the mapped view", async () => {
    const mockUser = {
      id: "user-1",
      email: "test@example.com",
      name: "Test User",
      emailVerified: false,
      password: null,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const mockProvider = {
      ...UserProvider,
      create: vi.fn().mockResolvedValue(mockUser),
    }

    const useCase = new RegisterUser(mockProvider as typeof UserProvider)
    const result = await useCase.execute({
      email: "test@example.com",
      name: "Test User",
      emailVerified: false,
    })

    expect(mockProvider.create).toHaveBeenCalledWith({
      email: "test@example.com",
      name: "Test User",
      emailVerified: false,
    })
    expect(result).toEqual(mockUser)
  })
})
```

Target use-cases to test first:
- `src/server/modules/core-api/domain/use-cases/auth/register-user/RegisterUser.ts`
- `src/server/modules/core-api/domain/use-cases/auth/fetch-user/FetchUser.ts`
- `src/server/modules/core-api/domain/use-cases/search/search-public-procurements/SearchPublicProcurements.ts`
- `src/server/modules/core-api/domain/use-cases/company-details/fetch-company-by-cnpj/FetchCompanyByCnpj.ts`

**2. Controller schema validation**
Each `*ControllerSchemas.ts` file defines a Zod schema. These schemas have non-trivial constraints and defaults. Test both valid and invalid inputs.

```ts
// src/server/modules/core-api/domain/use-cases/search/search-public-procurements/SearchPublicProcurementsControllerSchemas.test.ts
import { describe, it, expect } from "vitest"
import { SearchPublicProcurementsControllerSchemas } from "./SearchPublicProcurementsControllerSchemas"

describe("SearchPublicProcurementsControllerSchemas.Input", () => {
  it("accepts empty input (all fields optional)", () => {
    const result = SearchPublicProcurementsControllerSchemas.Input.safeParse({})
    expect(result.success).toBe(true)
  })

  it("rejects invalid tipoDocumento enum values", () => {
    const result = SearchPublicProcurementsControllerSchemas.Input.safeParse({
      tiposDocumento: ["invalid_value"],
    })
    expect(result.success).toBe(false)
  })

  it("accepts tamPagina up to 500", () => {
    const result = SearchPublicProcurementsControllerSchemas.Input.safeParse({ tamPagina: 500 })
    expect(result.success).toBe(true)
  })

  it("rejects tamPagina above 500", () => {
    const result = SearchPublicProcurementsControllerSchemas.Input.safeParse({ tamPagina: 501 })
    expect(result.success).toBe(false)
  })
})
```

**3. `SearchPublicProcurements` array serialization logic**
The `execute()` method in `src/server/modules/core-api/domain/use-cases/search/search-public-procurements/SearchPublicProcurements.ts` has critical serialization logic (joining arrays with `|`). This is a prime candidate for unit tests given the documented API quirks.

**4. Utility functions**
Pure functions with no side effects — easiest to test:
- `src/client/lib/utils/format.ts` — `formatCurrency`, `formatDate`, `maskCnpj`
- `src/client/features/auth/signup/components/StepContactInfo.tsx` — `formatPhone` (currently unexported; consider extracting)
- `src/server/modules/core-api/main/adapters/next-http-adapter.ts` — `coerceParams`

```ts
// src/client/lib/utils/format.test.ts
import { describe, it, expect } from "vitest"
import { formatCurrency, formatDate, maskCnpj } from "./format"

describe("formatCurrency", () => {
  it("formats a number as BRL currency", () => {
    expect(formatCurrency(1500)).toBe("R$\u00a01.500,00")
  })
})

describe("maskCnpj", () => {
  it("applies CNPJ mask to a 14-digit string", () => {
    expect(maskCnpj("12345678000195")).toBe("12.345.678/0001-95")
  })
})
```

### Medium Priority

**5. Controller `handle()` methods**
Integration tests that verify the full request-to-response path through a controller, mocking the use-case:

```ts
// RegisterUserController.test.ts
import { describe, it, expect, vi } from "vitest"
import { RegisterUserController } from "./RegisterUserController"
import { RegisterUser } from "./RegisterUser"

describe("RegisterUserController", () => {
  it("returns 200 with the use-case result on valid input", async () => {
    const mockResult = { id: "1", email: "a@b.com", name: "A", emailVerified: true, password: null, image: null, createdAt: new Date(), updatedAt: new Date() }
    const mockUseCase = { execute: vi.fn().mockResolvedValue(mockResult) } as unknown as RegisterUser

    const controller = new RegisterUserController(mockUseCase)
    const response = await controller.handle({
      body: { email: "a@b.com", name: "A", emailVerified: true },
      query: undefined,
      params: undefined,
      headers: {},
    })

    expect(response.statusCode).toBe(200)
    expect(response.data).toEqual(mockResult)
  })

  it("returns 500 when the use-case throws", async () => {
    const mockUseCase = { execute: vi.fn().mockRejectedValue(new Error("DB error")) } as unknown as RegisterUser
    const controller = new RegisterUserController(mockUseCase)

    const response = await controller.handle({
      body: { email: "a@b.com", name: "A", emailVerified: true },
      query: undefined,
      params: undefined,
      headers: {},
    })

    expect(response.statusCode).toBe(500)
  })
})
```

**6. Client-side Zod schemas**
- `src/client/features/wizard-mcp-chat/schemas/chat.schema.ts` — `chatConfigSchema`, `chatInputSchema`
- Inline schemas in `StepContactInfo.tsx` (consider extracting to `src/client/features/auth/signup/schemas/`)

### Low Priority (E2E)

**7. Signup flow (E2E)**
The signup wizard in `src/client/features/auth/signup/components/SignupWizard.tsx` has multi-step state that benefits from E2E testing once the flow is complete.

**8. Landing page rendering**
Smoke tests confirming the landing page renders without errors.

---

## Suggested File Organization

Place test files co-located with the source files they test:

```
src/
  client/
    lib/
      utils/
        format.ts
        format.test.ts          ← co-located unit test
    features/
      auth/
        signup/
          components/
            SignupWizard.tsx
            SignupWizard.test.tsx  ← component test
  server/
    modules/
      core-api/
        domain/
          use-cases/
            auth/
              register-user/
                RegisterUser.ts
                RegisterUser.test.ts              ← use-case unit test
                RegisterUserController.ts
                RegisterUserController.test.ts    ← controller integration test
                RegisterUserControllerSchemas.ts
                RegisterUserControllerSchemas.test.ts ← schema validation test
```

---

## Mocking Patterns (Recommended)

**Providers (static classes):**
Mock individual static methods using `vi.spyOn` or pass a mock object typed as `typeof ProviderClass`:
```ts
const mockProvider = {
  ...UserProvider,
  create: vi.fn().mockResolvedValue(mockUser),
} as typeof UserProvider
```

**Prisma:**
Use `vitest-mock-extended` or manual mocks to avoid real DB connections:
```ts
vi.mock("@/server/shared/infra/db/client", () => ({
  prisma: {
    user: {
      create: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}))
```

**External API calls (`PncpSearchProvider`, `CompanyDetailsProvider`):**
Mock the provider class method directly to avoid network calls.

---

## Coverage

**Requirements:** None enforced (no configuration)

**Suggested baseline targets when tests are added:**
- Use-case classes: 100%
- Controller schemas: 100%
- Utility functions: 100%
- Controllers: 80%
- React components: opportunistic (focus on complex state logic)

---

*Testing analysis: 2026-03-13*
