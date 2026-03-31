# Use Case Standard — Core API

Padrão obrigatório para todos os Use Cases desta API REST. Agentes de IA e desenvolvedores devem seguir exatamente estas convenções.

---

## Estrutura de diretórios

```
domain/use-cases/<feature>/<use-case-name>/
├── <UseCaseName>.ts                   # Lógica de negócio pura
├── <UseCaseName>Controller.ts         # Handler HTTP genérico
├── <UseCaseName>ControllerSchemas.ts  # Schemas Zod (source of truth)
├── make<UseCaseName>.ts               # Factory de DI
└── dtos/
    ├── <UseCaseName>DTOs.ts           # Interface de entrada
    └── <UseCaseName>View.ts           # Tipo de saída + Mapper
```

---

## 1. `ControllerSchemas.ts` — Source of Truth

Define os contratos de entrada e saída via Zod. **Todo campo deve ter `.describe()`** — é o que alimenta a documentação OpenAPI automaticamente.

O namespace deve exportar sempre: `Headers`, `Body`, `Query`, `Params`, `Response` e o tipo `Input`.

### Regras de tipagem do Response

O `Response` **nunca pode ser `z.any()` ou `z.object({ ... })`com campos não tipados**. Ele é o que define:
- Os modelos TypeScript gerados no client (`models/`)
- O schema exibido na documentação OpenAPI / Scalar

#### Response simples (objeto direto)

```typescript
import { z } from "zod";

export const XxxResponseSchema = z.object({
    campo: z.string().describe("Descrição do campo"),
    outro: z.number().optional().describe("Outro campo"),
});

export namespace XxxControllerSchemas {
    export const Headers = z.object({
        "authorization": z.string().optional(),
    }).optional();

    export const Body   = z.null();
    export const Query  = XxxInputSchema;
    export const Params = z.null();

    export const Response = XxxResponseSchema;

    export type Input = z.infer<typeof XxxInputSchema>;
}
```

#### Response com sub-schemas (array de itens tipados)

Quando o Response contém itens complexos que devem aparecer como modelos separados no client, **exporte o sub-schema** para registrá-lo via `extraSchemas` em `schemas.ts`.

```typescript
import { z } from "zod";

// Exportado para registrar como modelo separado no OpenAPI
export const XxxItemSchema = z.object({
    id: z.string().describe("ID do item"),
    titulo: z.string().describe("Título"),
    valor: z.number().optional().describe("Valor estimado"),
});

export const XxxResponseSchema = z.object({
    data: z.array(XxxItemSchema).describe("Lista de itens"),
    totalRegistros: z.number().describe("Total de resultados"),
});

export namespace XxxControllerSchemas {
    export const Headers = z.object({
        "authorization": z.string().optional(),
    }).optional();

    export const Body   = z.null();
    export const Query  = XxxInputSchema;
    export const Params = z.null();

    export const Response = XxxResponseSchema;

    export type Input = z.infer<typeof XxxInputSchema>;
}
```

> **Por que exportar o sub-schema?** Para registrá-lo em `extraSchemas` em `schemas.ts`. Isso faz com que o codegen gere um arquivo `models/XxxItem.ts` separado, além do `models/XxxResponse.ts`.

**Regra:** `Query` e `Params` recebem `z.null()` quando não usados. Idem `Body` para GET/DELETE.

---

## 2. `UseCase.ts` — Lógica de negócio

Não conhece framework HTTP. Recebe e retorna tipos de domínio.

```typescript
export class Xxx {
    constructor(private readonly provider: typeof XxxProvider) {}

    async execute(params: Xxx.Params): Promise<Xxx.Response> {
        const result = await this.provider.doSomething(params);
        return XxxMapper.toView(result);
    }
}

export namespace Xxx {
    export type Params   = XxxDTO;
    export type Response = XxxView;
}
```

---

## 3. `Controller.ts` — Handler HTTP

Faz a ponte entre o adapter HTTP e o use case. Valida o input com o schema Zod.

```typescript
import { Controller, HttpRequest, HttpResponse, ok, serverError } from "@/server/modules/core-api/main/adapters/http-adapter";
import { XxxControllerSchemas } from "./XxxControllerSchemas";
import { Xxx } from "./Xxx";
import { z } from "zod";

interface XxxControllerTypes {
    Body:     undefined;
    Query:    Xxx.Params;
    Params:   undefined;
    Response: Xxx.Response;
}

export class XxxController implements Controller<XxxControllerTypes> {
    constructor(private readonly useCase: Xxx) {}

    async handle(request: HttpRequest<XxxControllerTypes>): Promise<HttpResponse<Xxx.Response>> {
        try {
            const params = XxxControllerSchemas.Query.parse(request.query);
            const result = await this.useCase.execute(params);
            return ok(result);
        } catch (error: any) {
            if (error instanceof z.ZodError) return serverError(new Error(error.message));
            return serverError(error);
        }
    }
}

export namespace XxxController {
    export type Types    = XxxControllerTypes;
    export type Query    = XxxControllerTypes['Query'];
    export type Response = XxxControllerTypes['Response'];
}
```

---

## 4. `makeXxx.ts` — Factory de DI

Instancia dependências e retorna o controller pronto. Único lugar onde `new` é chamado.

```typescript
import { XxxProvider } from "@/server/shared/infra/providers/xxx-provider";
import { Xxx } from "./Xxx";
import { XxxController } from "./XxxController";

export function makeXxx(): XxxController {
    const useCase = new Xxx(XxxProvider);
    return new XxxController(useCase);
}
```

---

## 5. `dtos/`

**`XxxDTOs.ts`** — Interface de entrada:

```typescript
export interface XxxDTO {
    campo: string;
}
```

**`XxxView.ts`** — Tipo de saída + Mapper:

```typescript
export type XxxView = { items: any[]; total: number };

export class XxxMapper {
    static toView(data: any): XxxView {
        return data; // transformações adicionadas conforme necessidade real
    }
}
```

---

## Checklist para criar um novo Use Case

1. **`ControllerSchemas.ts`** — Escrever schema Zod com `.describe()` em todos os campos. Exportar sub-schemas complexos para registrar como `extraSchemas`. Exportar namespace com `Query`, `Response`, etc.
2. **`dtos/XxxDTOs.ts`** — Interface de entrada.
3. **`dtos/XxxView.ts`** — Tipo de saída + Mapper (inicialmente `return data`).
4. **`Xxx.ts`** — Lógica de negócio, usa provider/repositório via interface.
5. **`XxxController.ts`** — Valida com o schema, chama use case, retorna helper de resposta.
6. **`makeXxx.ts`** — Instancia dependências e retorna o controller.
7. **Registrar rota e swagger** → ver `main/routes/README.md`.
