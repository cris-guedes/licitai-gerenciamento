# Prompt: Backend Boilerplate — Clean Architecture com TypeScript + Prisma

> Use este prompt para instruir um agente de IA a gerar código novo seguindo exatamente as convenções e padrões deste boilerplate.

---

## Contexto Geral

Este backend é uma **API REST em TypeScript** seguindo os princípios da **Clean Architecture**. O código está organizado em camadas bem definidas onde dependências sempre apontam para dentro. Nunca o contrário.

```
Framework HTTP  →  Infraestrutura  →  Domínio
```

**A camada de domínio (use cases, repositórios, DTOs) não conhece e nunca importa nada do framework HTTP.** O framework é um detalhe de implementação que vive na borda exterior.

**Stack principal:**
- Runtime: Node.js + TypeScript
- ORM: Prisma (MySQL)
- Autenticação: JWT via `jsonwebtoken`
- Testes: Vitest

**Path alias:** `@/*` mapeia para `src/*`

---

## Estrutura de Diretórios

```
src/
├── domain/
│   ├── entities/                    # Tipos de domínio (wrappers finos sobre Prisma)
│   ├── errors/                      # Classes de erro customizadas com statusCode
│   ├── interfaces/
│   │   ├── repositories/            # Interfaces abstratas dos repositórios
│   │   └── providers/               # Interfaces de serviços externos (JWT, etc.)
│   └── use-cases/
│       ├── admin/                   # Operações administrativas por recurso
│       │   ├── providers/
│       │   │   ├── create-provider/
│       │   │   ├── get-providers/
│       │   │   ├── update-provider/
│       │   │   └── delete-provider/
│       │   ├── services/
│       │   ├── appointments/
│       │   └── ...
│       ├── auth/
│       └── onboarding/
│
├── infra/
│   └── prisma/
│       └── repositories/            # Implementações concretas com Prisma
│
├── config/
│   └── database.ts                  # Singleton do PrismaClient
│
└── main/
    ├── adapters/
    │   └── http-adapter.ts          # Contratos HTTP genéricos (HttpRequest, HttpResponse)
    ├── config/
    │   └── env.ts                   # Variáveis de ambiente
    └── shared/
        └── infra/db/prisma/
            └── schema.prisma        # Schema do banco
```

> A pasta `main/` é onde o framework HTTP se encaixa. Tudo que há nela é específico da borda da aplicação. O domínio (`domain/`) e a infraestrutura (`infra/`) são completamente independentes de framework.

---

## O Padrão de Caso de Uso (a Regra Mais Importante)

**Todo caso de uso é um diretório com exatamente estes arquivos:**

```
use-cases/admin/providers/create-provider/
├── CreateProvider.ts           # Lógica de negócio pura
├── CreateProviderController.ts # Handler HTTP genérico
├── makeCreateProvider.ts       # Factory de DI (wiring)
└── dtos/
    ├── CreateProviderDTOs.ts   # Interface de entrada
    └── CreateProviderView.ts   # Interface + Mapper de saída
```

### Regras de nomenclatura

| Operação  | Prefixo de caso de uso    |
| --------- | ------------------------- |
| Criar     | `Create`                  |
| Listar    | `Get` (plural)            |
| Buscar    | `Get` (singular) + `ById` |
| Atualizar | `Update`                  |
| Deletar   | `Delete`                  |

Nome do diretório em `kebab-case`. Nome das classes em `PascalCase`.

---

## Arquivo 1: `UseCase.ts` — Lógica de Negócio

Contém a lógica de negócio pura. **Não conhece framework HTTP, nem Prisma** — só conhece interfaces de repositório.

```typescript
// src/domain/use-cases/admin/providers/create-provider/CreateProvider.ts
import { UserRepository } from '@/domain/interfaces/repositories/user.repository';
import { MembershipRepository } from '@/domain/interfaces/repositories/membership.repository';
import { CreateProviderDTO } from './dtos/CreateProviderDTOs';
import { CreateProviderMapper, CreateProviderView } from './dtos/CreateProviderView';

export class CreateProvider {
    constructor(
        private readonly userRepository: UserRepository,          // interface, não Prisma
        private readonly membershipRepository: MembershipRepository, // interface, não Prisma
    ) { }

    async execute(params: CreateProvider.Params): Promise<CreateProvider.Response> {
        const { payload, establishmentId } = params;

        // Regra de negócio: busca ou cria o usuário global
        let user = await this.userRepository.findByEmail({ email: payload.email });
        if (!user) {
            user = await this.userRepository.create({
                name: `${payload.firstName} ${payload.lastName}`.trim(),
                email: payload.email,
                password: null,
                phone: payload.phone || payload.mobile
            });
        }

        // Regra de negócio: cria ou atualiza o vínculo no establishment
        let membership = await this.membershipRepository.loadByUser({
            userId: user.id,
            establishmentId
        });

        if (!membership) {
            membership = await this.membershipRepository.create({
                userId: user.id,
                establishmentId,
                role: 'PROFESSIONAL'
            });
        }

        // Retorna a view — o mapper decide o formato de saída
        return CreateProviderMapper.toView({ ...membership, user });
    }
}

// Namespace para Params e Response — evita importações circulares
export namespace CreateProvider {
    export type Params = CreateProviderDTO;
    export type Response = CreateProviderView;
}
```

**Princípios:**
- Construtor recebe apenas interfaces (nunca implementações concretas)
- Método único `execute(params)` — sem sobrecarga
- Namespace com `Params` e `Response` ao final do arquivo
- Lança erros de domínio (`NotFoundError`, `BadRequestError`) — nunca strings brutas
- Retorna sempre a view mapeada, nunca o modelo Prisma diretamente

---

## Arquivo 2: `Controller.ts` — Handler HTTP Genérico

Faz a ponte entre o mundo HTTP e o caso de uso. **Não importa nada do framework HTTP** — usa apenas os contratos genéricos do adapter.

```typescript
// src/domain/use-cases/admin/providers/create-provider/CreateProviderController.ts
import {
    Controller,
    HttpRequest,
    HttpResponse,
    serverError,
    created
} from '@/main/adapters/http-adapter';
import { CreateProvider } from './CreateProvider';

// Tipagem da "forma" desta rota — puramente TypeScript, sem dependência de framework
interface CreateProviderControllerTypes {
    Body: Parameters<CreateProvider['execute']>[0];  // mesmo tipo que o caso de uso espera
    Query: undefined;
    Params: undefined;
    Response: Awaited<ReturnType<CreateProvider['execute']>>;  // inferido do caso de uso
}

export class CreateProviderController implements Controller<CreateProviderControllerTypes> {
    constructor(private readonly createProvider: CreateProvider) { }

    async handle(
        request: HttpRequest<CreateProviderControllerTypes>
    ): Promise<HttpResponse<CreateProviderControllerTypes['Response']>> {
        try {
            // establishmentId vem do contexto do request (resolvido pelo middleware da borda)
            const establishmentId = request.establishmentId;
            if (!establishmentId) throw new Error('Establishment ID is required');

            const result = await this.createProvider.execute({
                ...request.body,
                establishmentId
            });

            return created(result);  // 201 Created
        } catch (error: any) {
            return serverError(error);
        }
    }
}

export namespace CreateProviderController {
    export type Types = CreateProviderControllerTypes;
    export type Body = CreateProviderControllerTypes['Body'];
    export type Query = CreateProviderControllerTypes['Query'];
    export type Params = CreateProviderControllerTypes['Params'];
    export type Response = CreateProviderControllerTypes['Response'];
}
```

### Contratos HTTP genéricos (`main/adapters/http-adapter.ts`)

Este arquivo define as interfaces que isolam o domínio do framework:

```typescript
// src/main/adapters/http-adapter.ts

export interface HttpRequest<T extends ControllerContract = any> {
    body: T['Body'];
    query: T['Query'];
    params: T['Params'];
    headers: Record<string, string | undefined>;
    // Contexto de tenant resolvido pela borda (middleware do framework)
    organizationId?: string;
    establishmentId?: string;
    user?: {
        id: string;
        email: string;
        role: string;
        firstName: string;
        lastName: string;
    };
}

export interface HttpResponse<TData = any> {
    statusCode: number;
    data: TData;
}

export interface ControllerContract {
    Body: any;
    Query: any;
    Params: any;
    Response: any;
}

export interface Controller<T extends ControllerContract = any> {
    handle(request: HttpRequest<T>): Promise<HttpResponse<T['Response']>>;
}

// Helpers de resposta — retornam o contrato genérico, sem acoplamento a framework
export const ok         = <T>(data: T): HttpResponse<T>     => ({ statusCode: 200, data });
export const created    = <T>(data: T): HttpResponse<T>     => ({ statusCode: 201, data });
export const noContent  = ():           HttpResponse         => ({ statusCode: 204, data: null });
export const badRequest = (e: Error):   HttpResponse         => ({ statusCode: 400, data: { message: e.message } });
export const notFound   = (e: Error):   HttpResponse         => ({ statusCode: 404, data: { message: e.message } });
export const unauthorized=(e: Error):   HttpResponse         => ({ statusCode: 401, data: { message: e.message } });
export const serverError= (e: Error):   HttpResponse         => ({ statusCode: 500, data: { message: e.message } });
```

**Integração com o framework (borda da aplicação):**

O framework (Next.js, Fastify, Express, etc.) converte seu objeto de request nativo para `HttpRequest`, chama `controller.handle()`, e devolve o resultado. Isso acontece **fora** da camada de domínio:

```typescript
// Exemplo genérico — implementado na borda, específico ao framework escolhido
const httpRequest: HttpRequest = {
    body:            frameworkRequest.body,
    query:           frameworkRequest.query,
    params:          frameworkRequest.params,
    headers:         frameworkRequest.headers,
    establishmentId: frameworkRequest.context.establishmentId, // resolvido pelo middleware
    user:            frameworkRequest.context.user,
};

const { statusCode, data } = await controller.handle(httpRequest);
// framework responde com statusCode e data
```

**Helpers de resposta disponíveis:**

| Função                | Status | Quando usar            |
| --------------------- | ------ | ---------------------- |
| `ok(data)`            | 200    | GET com dados          |
| `created(data)`       | 201    | POST com criação       |
| `noContent()`         | 204    | DELETE sem retorno     |
| `badRequest(error)`   | 400    | Validação de negócio   |
| `notFound(error)`     | 404    | Recurso não encontrado |
| `unauthorized(error)` | 401    | Sem autenticação       |
| `serverError(error)`  | 500    | Erro inesperado        |

**Regra:** `Query` e `Params` recebem `undefined` quando não usados. `Body` recebe `undefined` para GET/DELETE.

---

## Arquivo 3: `makeUseCase.ts` — Factory de Injeção de Dependência

Instancia e conecta todas as dependências. É o único lugar onde `new PrismaXxxRepository()` é chamado.

```typescript
// src/domain/use-cases/admin/providers/create-provider/makeCreateProvider.ts
import { CreateProviderController } from './CreateProviderController';
import { CreateProvider } from './CreateProvider';
import { PrismaUserRepository } from '@/infra/prisma/repositories/user.repository';
import { PrismaMembershipRepository } from '@/infra/prisma/repositories/membership.repository';

export function makeCreateProvider(): CreateProviderController {
    // 1. Instancia repositórios concretos (infraestrutura)
    const userRepository       = new PrismaUserRepository();
    const membershipRepository = new PrismaMembershipRepository();

    // 2. Instancia o caso de uso passando apenas interfaces
    const createProvider = new CreateProvider(userRepository, membershipRepository);

    // 3. Retorna o controller pronto — o framework chama controller.handle()
    return new CreateProviderController(createProvider);
}
```

**Regra:** Cada request cria uma nova instância via factory. Não há singleton de controller.

---

## Arquivo 4: `dtos/XxxDTOs.ts` — Entrada

```typescript
// src/domain/use-cases/admin/providers/create-provider/dtos/CreateProviderDTOs.ts
export interface CreateProviderDTO {
    payload: {
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
        mobile?: string;
    };
    establishmentId: string;  // nunca vem do body HTTP — injetado pelo adapter da borda
}
```

**Regra:** `establishmentId` **nunca** vem do body HTTP — ele é resolvido pelo middleware do framework e injetado pelo adapter na borda da aplicação.

---

## Arquivo 5: `dtos/XxxView.ts` — Saída + Mapper

O Mapper é um ponto único de transformação entre o modelo Prisma e a view de saída. **Por padrão ele retorna os dados como estão** — qualquer renomeação ou formatação de campos será feita manualmente quando necessário.

```typescript
// src/domain/use-cases/admin/providers/create-provider/dtos/CreateProviderView.ts
import { Membership, User } from '@/main/shared/infra/db/generated/prisma';

// O tipo de saída reflete o formato atual dos dados — sem transformação a priori
export type CreateProviderView = Membership & { user: User };

export class CreateProviderMapper {
    static toView(data: CreateProviderView): CreateProviderView {
        return data;  // pass-through — transformações são adicionadas manualmente conforme necessidade
    }
}
```

**Regras do Mapper:**
- Static method — nunca instancia o mapper
- **Por padrão retorna os dados sem transformação** (`return data`)
- Transformações (renomear campos, formatar datas) são adicionadas manualmente depois, conforme a necessidade real
- Para listas: `items.map(Mapper.toView)`

---

## Camada de Repositório

### Interface (Domínio)

```typescript
// src/domain/interfaces/repositories/user.repository.ts

// Namespace agrupa os tipos dos parâmetros de cada método
export namespace UserRepository {
    export type CreateParams = {
        name: string;
        email: string;
        password: string | null;
        phone?: string;
    };
    export type LoadByEmailParams = { email: string };
    export type LoadByIdParams   = { id: string };
    export type UpdateParams     = { id: string; name?: string; phone?: string };
}

// A interface em si — só assinaturas, sem implementação
export interface UserRepository {
    create(params: UserRepository.CreateParams):        Promise<User | null>;
    findByEmail(params: UserRepository.LoadByEmailParams): Promise<User | null>;
    loadByEmail(params: UserRepository.LoadByEmailParams): Promise<User | null>; // alias
    loadById(params: UserRepository.LoadByIdParams):    Promise<User | null>;
    update(params: UserRepository.UpdateParams):        Promise<User | null>;
}
```

### Implementação Prisma (Infraestrutura)

```typescript
// src/infra/prisma/repositories/user.repository.ts
import { getPrismaClient } from '@/config/database';
import { UserRepository } from '@/domain/interfaces/repositories/user.repository';

const prisma = getPrismaClient();

export class PrismaUserRepository implements UserRepository {
    async create(data: UserRepository.CreateParams) {
        return prisma.user.create({ data });
    }

    async findByEmail({ email }: UserRepository.LoadByEmailParams) {
        return prisma.user.findUnique({ where: { email } });
    }

    async loadByEmail(params: UserRepository.LoadByEmailParams) {
        return this.findByEmail(params);  // alias — delega ao método principal
    }

    async loadById({ id }: UserRepository.LoadByIdParams) {
        return prisma.user.findUnique({ where: { id } });
    }

    async update({ id, ...data }: UserRepository.UpdateParams) {
        return prisma.user.update({ where: { id }, data });
    }
}
```

**Padrões de query Prisma para listas com filtros:**

```typescript
// Filtros dinâmicos com paginação (offset-based)
async loadAll({ establishmentId, page = 1, pageSize = 20, q, role }: LoadAllParams) {
    const where: any = { establishmentId };  // escopo de tenant sempre presente

    if (role) {
        where.role = Array.isArray(role) ? { in: role } : role;
    }

    if (q) {
        where.user = {
            OR: [
                { name: { contains: q } },
                { email: { contains: q } }
            ]
        };
    }

    return prisma.membership.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { user: true }
    });
}
```

---

## Erros de Domínio

Sempre use as classes de erro do domínio dentro dos casos de uso. O adapter da borda captura o `error.statusCode` automaticamente.

```typescript
import {
    NotFoundError,      // 404
    BadRequestError,    // 400
    UnauthorizedError,  // 401
    ConflictError,      // 409
} from '@/domain/errors/app-error';

// No caso de uso:
if (!user) {
    throw new NotFoundError('Usuário não encontrado');
}

if (alreadyExists) {
    throw new ConflictError('Este e-mail já está cadastrado');
}
```

Implementação base:

```typescript
// src/domain/errors/app-error.ts
export class AppError extends Error {
    readonly statusCode: number;
    constructor(message: string, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
    }
}

export class NotFoundError    extends AppError { constructor(m?: string) { super(m ?? 'Not Found', 404); } }
export class BadRequestError  extends AppError { constructor(m?: string) { super(m ?? 'Bad Request', 400); } }
export class UnauthorizedError extends AppError { constructor(m?: string) { super(m ?? 'Unauthorized', 401); } }
export class ConflictError    extends AppError { constructor(m?: string) { super(m ?? 'Conflict', 409); } }
```

---

## Multi-Tenancy

**Hierarquia de dados:**
```
Organization  (billing / conta mestre)
└── Establishment  (isolamento real dos dados)
    ├── Membership  (User ↔ Establishment com Role)
    ├── Service
    ├── Appointment
    └── Customer
```

**Regra crítica:** Todo query ao banco **deve** incluir `establishmentId` no `where`. Nunca busque dados sem escopo de establishment.

```typescript
// CORRETO — dados isolados por tenant
prisma.appointment.findMany({ where: { establishmentId } })

// ERRADO — vaza dados de outros tenants
prisma.appointment.findMany({ where: { professionalId } })
```

O `establishmentId` é resolvido na borda da aplicação (middleware do framework) e disponibilizado em `HttpRequest.establishmentId`. O domínio apenas o recebe — nunca o resolve.

---

## Checklist para Criar um Novo Caso de Uso

Ao implementar `CreateXxx` para o recurso `Xxx`:

1. **`dtos/CreateXxxDTOs.ts`** — Interface de entrada com os campos do body + `establishmentId`
2. **`dtos/CreateXxxView.ts`** — Tipo de saída + Mapper (inicialmente `return data` sem transformação)
3. **`CreateXxx.ts`** — Lógica de negócio, injeta interfaces de repositório no construtor
4. **`CreateXxxController.ts`** — Extrai `establishmentId` do `request`, chama o use case, retorna helper de resposta
5. **`makeCreateXxx.ts`** — Factory: instancia repositórios Prisma, instancia use case, retorna controller

A integração com o framework (rotas, middlewares, validação de schema) é responsabilidade da **borda** e não faz parte deste padrão.

---

## Convenções Adicionais

- **Nunca importe framework HTTP na camada de domínio** — nem no use case, nem no controller, nem nos DTOs
- **Nunca use `any` na camada de domínio** — só em infra quando inevitável
- **Não há singleton de controller** — cada request cria um novo via factory
- **Paginação** sempre por `page` (1-indexed) + `pageSize` (padrão 20)
- **Todos os repositórios Prisma** usam `getPrismaClient()` do singleton em `config/database.ts`
- **Após mudanças no schema Prisma:** `npx prisma migrate dev` → commit do migration file gerado
