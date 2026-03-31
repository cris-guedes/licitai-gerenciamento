# Routes — Registro de Rotas e Swagger

Este diretório contém os arquivos de rota da Core API. Cada arquivo agrupa rotas de uma feature.

---

## Estrutura

```
main/
├── routes/
│   ├── <feature>.ts          # Record de rotas da feature
│   └── ...
└── configs/
    ├── setup-routes.ts       # Agrega todos os routes
    ├── schemas.ts            # Registry de endpoints (SEMPRE atualizar aqui)
    └── openapi.ts            # Geração do spec OpenAPI — nunca editar
```

---

## Padrão de arquivo de rota

Cada arquivo exporta um objeto mapeando `"path-slug"` → factory do controller.

```typescript
// main/routes/<feature>.ts
import type { Controller } from "../adapters/http-adapter";
import { makeXxx } from "../../domain/use-cases/<feature>/<use-case>/makeXxx";

export const xxxRoutes = {
    "xxx-endpoint": makeXxx,
} satisfies Record<string, () => Controller>;
```

O slug da chave **deve ser idêntico** ao `path` registrado em `schemas.ts` (sem a barra inicial).

---

## Como adicionar um novo endpoint — passo a passo

### 1. Criar o arquivo de rota (ou adicionar numa feature existente)

```typescript
// main/routes/minha-feature.ts
import type { Controller } from "../adapters/http-adapter";
import { makeNovoEndpoint } from "../../domain/use-cases/minha-feature/novo-endpoint/makeNovoEndpoint";

export const minhaFeatureRoutes = {
    "novo-endpoint": makeNovoEndpoint,
} satisfies Record<string, () => Controller>;
```

### 2. Registrar em `setup-routes.ts`

```typescript
// main/configs/setup-routes.ts
import { minhaFeatureRoutes } from "../routes/minha-feature";

export const allRoutes = {
    ...publicProcurementsRoutes,
    ...companyDetailsRoutes,
    ...minhaFeatureRoutes,   // ← adicionar aqui
} satisfies Record<string, () => Controller>;
```

### 3. Registrar em `schemas.ts` para gerar swagger e client tipados

> **Obrigatório.** Sem este passo, o endpoint não aparece na documentação OpenAPI nem nos serviços gerados no client.

```typescript
// main/configs/schemas.ts
import { NovoEndpointControllerSchemas } from "../../domain/use-cases/minha-feature/novo-endpoint/NovoEndpointControllerSchemas";
import { NovoItemSchema } from "../../domain/use-cases/minha-feature/novo-endpoint/NovoEndpointControllerSchemas";

export const apiEndpoints: EndpointConfig[] = [
    // ...entradas existentes...
    {
        path: "/novo-endpoint",
        operationId: "novoEndpoint",
        tag: "MinhaFeature",           // ← obrigatório: agrupa no serviço gerado
        summary: "Resumo curto do que faz",
        description: "Descrição completa para a documentação.",
        successDescription: "Descrição do retorno 200.",
        schemas: NovoEndpointControllerSchemas,
        extraSchemas: {                // ← opcional: registra sub-schemas como modelos separados
            NovoItem: NovoItemSchema,
        },
    },
];
```

O `openapi.ts` itera sobre `apiEndpoints` automaticamente — **nunca precisa ser editado**.

---

## O campo `tag` e como ele afeta a geração do client

Cada endpoint deve ter um `tag`. Endpoints com a **mesma tag** são agrupados no **mesmo serviço** gerado:

| tag em `schemas.ts` | Serviço gerado |
|---------------------|----------------|
| `"Search"`          | `SearchService.ts` |
| `"Company"`         | `CompanyService.ts` |
| `"MinhaFeature"`    | `MinhaFeatureService.ts` |

O `CoreApiClient` expõe cada serviço como propriedade:

```typescript
const client = new CoreApiClient({ ... }, CustomAxiosHttpRequest);
client.search.searchPublicProcurements({ ... });
client.company.fetchCompanyByCnpj({ ... });
client.minhaFeature.novoEndpoint({ ... });
```

---

## O campo `extraSchemas` e os modelos gerados

`extraSchemas` registra sub-schemas como entradas nomeadas em `components/schemas` do OpenAPI. Isso faz o codegen gerar arquivos `models/` separados para cada um:

```typescript
extraSchemas: {
    NovoItem: NovoItemSchema,   // → models/NovoItem.ts
}
```

Sem `extraSchemas`, apenas o `XxxResponse` é gerado como modelo. Com ele, os itens aninhados também viram modelos TypeScript reutilizáveis.

> O sub-schema **deve ser exportado** do `ControllerSchemas.ts` para ser importado aqui. Ver `domain/use-cases/README.md` para o padrão.

---

## Como regenerar o client após alterar endpoints

```bash
npm run generate:client
```

Isso executa dois passos em sequência:

| Passo | O que faz |
|-------|-----------|
| `generate:spec` | Chama `generateOpenApiSpec()` e grava `openapi.generated.json` na raiz |
| `openapi-typescript-codegen` | Lê o JSON e sobrescreve `src/client/main/infra/apis/api-core/` |

> **Nunca edite** os arquivos em `src/client/main/infra/apis/api-core/` — serão sobrescritos.

---

## Checklist ao adicionar um endpoint

- [ ] Factory `make<Xxx>.ts` criada no use case.
- [ ] `ControllerSchemas.ts` com `Response` tipado (não `z.any()`). Sub-schemas complexos exportados separadamente.
- [ ] Rota `"slug": makeXxx` adicionada no arquivo de routes da feature.
- [ ] Route file importado e espalhado em `setup-routes.ts`.
- [ ] Entrada adicionada em `schemas.ts` com `path`, `operationId`, `tag`, `summary`, `description`, `successDescription`, `schemas` e `extraSchemas` (se houver sub-schemas).
- [ ] `npm run generate:client` executado para atualizar os serviços do client.
