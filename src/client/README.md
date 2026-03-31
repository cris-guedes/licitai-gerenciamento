# Camada Client

Este diretório contém toda a camada client da aplicação: componentes, features, hooks, stores e a infraestrutura de comunicação com o backend.

---

## Estrutura

```
src/client/
├── components/        # Componentes UI compartilhados (shadcn/ui)
├── features/          # Verticais de feature — ver features/README.md
│   └── <feature>/
│       ├── components/  # UI — consome hooks
│       ├── hooks/       # React Query — consome services
│       ├── services/    # Chamadas à API — cérebro da feature
│       └── schemas/     # Schemas Zod + tipos TypeScript
├── hooks/             # Hooks globais reutilizáveis por qualquer feature
│   ├── use-core-api.ts              # Retorna CoreApiClient com token da sessão (memoizado)
│   └── auth/                        # Anti-corruption layer — único lugar que conhece o better-auth
│       ├── use-session/             # Módulo de sessão (tem helpers internos → subpasta)
│       │   ├── use-session.ts       # ← única API pública do módulo
│       │   ├── use-token.ts         # helper interno
│       │   └── use-user.ts          # helper interno
│       ├── use-sign-in.ts           # Wrapper de sign-in (sem helpers → arquivo direto)
│       ├── use-sign-up.ts           # Wrapper de sign-up
│       └── use-sign-out.ts          # Wrapper de sign-out
├── stores/            # Zustand stores globais
└── main/
    └── infra/
        ├── apis/
        │   ├── api-core/   # Gerado automaticamente — nunca editar
        │   │   ├── core/
        │   │   ├── models/
        │   │   ├── services/
        │   │   └── CoreApiClient.ts
        │   └── config/
        │       └── CustomAxiosHttpRequest.ts  # Configuração do axios (logs, interceptors)
        └── auth/
            └── auth.client.ts
```

---

## Regras de organização

### 1. Quanto mais genérico, mais externo

> **Princípio:** quanto mais genérico e reutilizável for um artefato, mais "para fora" ele fica na hierarquia de pastas.

| Escopo | Onde fica |
|--------|-----------|
| Usado apenas dentro de uma feature | `features/<feature>/hooks/` ou `features/<feature>/components/` |
| Usado por múltiplas features | `hooks/` (hooks) ou `components/` (UI) |
| Infraestrutura global (auth, API) | `main/infra/` |

**Exemplos práticos:**
- `use-search-licitacoes.ts` — específico da feature search → `features/search/hooks/`
- `use-token.ts` — qualquer feature pode precisar do token → `hooks/`
- `CustomAxiosHttpRequest.ts` — infraestrutura de rede global → `main/infra/apis/config/`

Nunca coloque em `hooks/` algo que só uma feature usa. Nunca coloque em `features/` algo que outras features também precisam.

### 2. Abstração por conceito dentro do contexto (package by feature recursivo)

> **Princípio:** dentro de qualquer diretório ou feature, quando surgem múltiplos arquivos com papel conceitual semelhante, agrupe-os em uma subpasta nomeada pelo conceito.

Isso é o **package by feature aplicado recursivamente**: cada nível da hierarquia pode ter sua própria organização interna por conceito.

**Como identificar o momento de criar uma subpasta:**
- Dois ou mais arquivos no mesmo diretório que respondem à mesma pergunta conceitual ("o que é isso?") — ex: todos são configurações, todos são adapters, todos são providers
- O nome do conceito é claro e evita ambiguidade com outros arquivos do diretório

**Exemplos:**
```
apis/
├── api-core/          # a "feature" de integração com a Core API
│   ├── core/          # base HTTP gerado
│   ├── models/        # modelos gerados
│   ├── services/      # serviços gerados
│   └── CoreApiClient.ts
└── config/            # ← abstração: arquivos de configuração da infra de APIs
    └── CustomAxiosHttpRequest.ts
```

Amanhã, se surgir um `CustomFetchRequest.ts` ou um `HttpLogger.ts`, eles vão para `config/` — não ficam soltos ao lado de `api-core/`.

**Não crie a subpasta prematuramente.** Se há apenas um arquivo, deixe-o no diretório pai e crie a pasta quando o padrão se confirmar.

---

## Conceitos-chave

- **Geração automática:** Todo o código em `main/infra/apis/api-core/` é gerado pelo `openapi-typescript-codegen` a partir do schema OpenAPI do servidor. Qualquer edição manual será perdida na próxima geração.
- **Type safety end-to-end:** Os tipos de parâmetros e retorno dos serviços são derivados diretamente dos schemas Zod do servidor. Se o servidor muda, o cliente reflete após `npm run generate:client`.
- **Token via `useCoreApi()`:** O token JWT é injetado de forma centralizada através do hook `useCoreApi()`, que retorna um `CoreApiClient` memoizado com o token da sessão. Os hooks de feature chamam `useCoreApi()` e repassam o cliente para os métodos do service.

---

## Como usar os serviços

Cada serviço é agrupado por tag definida no servidor. O `CoreApiClient` expõe uma propriedade por tag:

```typescript
// Tag "Search" → api.search
await api.search.searchPublicProcurements({ q: "software", pagina: 1 });

// Tag "Company" → api.company
await api.company.fetchCompanyByCnpj({ cnpj: "00000000000191" });
```

---

## Padrão de hook de feature

Cada feature tem sua própria camada `services/` + `hooks/`. O hook obtém o cliente via `useCoreApi()` e passa para o service:

```typescript
// features/search/services/search.service.ts
export const SearchAPI = {
  buscar: (api: CoreApiClient, q: string) =>
    api.search.searchPublicProcurements({ q, pagina: 1 }),
}

// features/search/hooks/use-search.ts
export function useSearch(q: string) {
  const api = useCoreApi()
  return useQuery({
    queryKey: ["search", q],
    queryFn: () => SearchAPI.buscar(api, q),
    enabled: !!q,
  })
}
```

Ver [features/README.md](features/README.md) para a documentação completa do padrão de features.

---

## Hook global: `useSession`

`src/client/hooks/auth/use-session.ts` é o **único ponto de entrada** do módulo de autenticação. Ele agrega token, dados do usuário e estado de carregamento.

```typescript
import { useSession } from "@/client/hooks/auth/use-session/use-session";

const { token, user, isAuthenticated, isPending } = useSession();
```

Internamente, `use-session` usa `use-token` e `use-user` — esses helpers **nunca devem ser importados diretamente** fora de `use-session/`. Eles são detalhes de implementação.

### A pasta `auth/` como anti-corruption layer

Toda a pasta `auth/` tem um papel único: **isolar o better-auth do restante da aplicação**. Nenhum componente, feature hook ou store importa do better-auth diretamente — tudo passa pelos hooks de `auth/`.

```
hooks/auth/
├── use-session/      # tem helpers internos → subpasta
│   ├── use-session.ts
│   ├── use-token.ts
│   └── use-user.ts
├── use-sign-in.ts    # wrapper simples → arquivo direto (sem helpers)
├── use-sign-up.ts
└── use-sign-out.ts
```

Se o provider mudar (ex: trocar better-auth por Auth.js), **só a pasta `auth/` muda** — o resto da app continua igual.

### Padrão: hook central + helpers privados

Quando um conceito precisa de múltiplos hooks internos, crie uma subpasta com o nome do hook público:

```
hooks/auth/use-session/
├── use-session.ts   # API pública — único export fora da pasta
├── use-token.ts     # privado
└── use-user.ts      # privado
```

Quando o hook é um wrapper simples (sem helpers), fica como arquivo direto no nível do conceito — sem subpasta prematura.

---

## Como regenerar os serviços

Sempre que um endpoint for adicionado ou um schema alterado no servidor:

```bash
npm run generate:client
```

**O que acontece por trás:**

| Passo | Comando | O que faz |
|-------|---------|-----------|
| 1 | `npm run generate:spec` | Executa `generateOpenApiSpec()` e grava `openapi.generated.json` na raiz |
| 2 | `openapi-typescript-codegen` | Lê o JSON e sobrescreve `src/client/main/infra/apis/api-core/` |

---

## Fluxo completo ao adicionar um endpoint

1. Criar o use case no servidor com `ControllerSchemas.ts` tipado (sem `z.any()`).
2. Registrar em `src/server/modules/core-api/main/configs/schemas.ts` com `tag` e `extraSchemas` se necessário.
3. Rodar `npm run generate:client`.
4. O novo método aparece no serviço da tag correspondente (`SearchService`, `CompanyService`, etc.), tipado e pronto.
5. Criar o service (`features/<feature>/services/`) e o hook (`hooks/`) seguindo o padrão em `features/README.md`.
