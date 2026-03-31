# PNCP API — Documentação das Especificações

Esta pasta contém os specs OpenAPI das APIs oficiais do Portal Nacional de Contratações Públicas (PNCP), usados para gerar os clientes TypeScript em `src/server/shared/lib/`.

---

## Arquivos

### `pncp-api.json`
**API de Gerenciamento PNCP** — `https://pncp.gov.br/api/pncp`

API autenticada para **publicação e gerenciamento** de contratações. Utilizada por órgãos para publicar editais, inserir itens, contratos, atas, arquivos, etc.

- **Autenticação**: requerida (token de órgão)
- **Lib gerada**: `src/server/shared/lib/pncp/`
- **Script**: `npm run generate:pncp`
- **Casos de uso no projeto**:
  - `GET /v1/orgaos/{cnpj}/compras/{ano}/{sequencial}/itens` — itens de uma contratação
  - `GET /v1/orgaos/{cnpj}/compras/{ano}/{sequencial}/arquivos` — documentos/arquivos
  - `GET /v1/orgaos/{cnpj}/compras/{ano}/{sequencial}/atas` — atas de registro de preço
  - `GET /v1/orgaos/{cnpj}/contratos/contratacao/{ano}/{sequencial}` — contratos
- **Nota**: após regenerar, corrigir manualmente `src/server/shared/lib/pncp/core/OpenAPI.ts`:
  ```ts
  BASE: 'https://pncp.gov.br/api/pncp',  // era '/api/pncp' (relativo — falha server-side)
  ```

---

### `pncp-consultas.json`
**API de Consulta PNCP** — `https://pncp.gov.br/api/consulta`

API **pública** (sem autenticação) para **consulta** de contratações publicadas.

- **Autenticação**: não requerida
- **Lib gerada**: `src/server/shared/lib/pncp-consultas/`
- **Script**: `npm run generate:pncp-consulta`
- **Casos de uso no projeto**:
  - `GET /v1/orgaos/{cnpj}/compras/{ano}/{sequencial}` — detalhe de uma contratação
  - `GET /v1/contratacoes/publicacao` — busca por data de publicação
  - `GET /v1/contratacoes/proposta` — contratações recebendo propostas
  - `GET /v1/contratacoes/atualizacao` — busca por data de atualização
  - `GET /v1/atas` — lista de atas
  - `GET /v1/contratos` — lista de contratos
- **Nota**: após regenerar, corrigir `src/server/shared/lib/pncp-consultas/PncpPortalClient.ts`:
  ```ts
  BASE: config?.BASE ?? 'https://pncp.gov.br/api/consulta',  // era '/api/consulta' (relativo)
  ```

---

### `api.pncp.search.yml`
**API de Busca PNCP** — `https://pncp.gov.br/api/search/`

API **pública** de busca full-text sobre os documentos indexados do PNCP.

- **Autenticação**: não requerida
- **Lib gerada**: `src/server/shared/lib/pncp-search/`
- **Parâmetro obrigatório**: `tipos_documento` (ex: `edital|aviso_licitacao`)
- **Arrays**: usar separador `|` (pipe), não repeated params
- **Casos de uso no projeto**: busca de oportunidades no Radar

---

## Entidades de Domínio (validadas em 2026-03-27)

Valores obtidos via `GET https://pncp.gov.br/api/pncp/v1/{recurso}`:

### Modalidades (`/v1/modalidades`)
| ID | Nome |
|----|------|
| 1  | Leilão - Eletrônico |
| 2  | Diálogo Competitivo |
| 3  | Concurso |
| 4  | Concorrência - Eletrônica |
| 5  | Concorrência - Presencial |
| 6  | Pregão - Eletrônico |
| 7  | Pregão - Presencial |
| 8  | Dispensa |
| 9  | Inexigibilidade |
| 10 | Manifestação de Interesse |
| 11 | Pré-qualificação |
| 12 | Credenciamento |
| 13 | Leilão - Presencial |
| 14 | Inaplicabilidade da Licitação |
| 15 | Chamada pública |
| 16 | Concorrência – Eletrônica Internacional |
| 17 | Concorrência – Presencial Internacional |
| 18 | Pregão – Eletrônico Internacional |
| 19 | Pregão – Presencial Internacional |

### Modos de Disputa (`/v1/modos-disputas`)
| ID | Nome |
|----|------|
| 1 | Aberto |
| 2 | Fechado |
| 3 | Aberto-Fechado |
| 4 | Dispensa Com Disputa |
| 5 | Não se aplica |
| 6 | Fechado-Aberto |

### Critérios de Julgamento (`/v1/criterios-julgamentos`)
| ID | Nome | Ativo |
|----|------|-------|
| 1 | Menor preço | ✓ |
| 2 | Maior desconto | ✓ |
| 3 | Melhor técnica ou conteúdo artístico | ✗ |
| 4 | Técnica e preço | ✓ |
| 5 | Maior lance | ✓ |
| 6 | Maior retorno econômico | ✓ |
| 7 | Não se aplica | ✓ |
| 8 | Melhor técnica | ✓ |
| 9 | Conteúdo artístico | ✓ |

### Fontes Orçamentárias (`/v1/fontes-orcamentarias`)
| ID | Nome | Valor no search |
|----|------|-----------------|
| 1 | Não se aplica | `nao_se_aplica` |
| 2 | Municipal | `municipal` |
| 3 | Estadual | `estadual` |
| 4 | Federal | `federal` |
| 5 | Organismo Internacional | `organismo_internacional` |
| 6 | Distrital | `distrital` |

### Tipos de Instrumento Convocatório (`/v1/tipos-instrumentos-convocatorios`)
| ID | Nome |
|----|------|
| 1 | Edital |
| 2 | Aviso de Contratação Direta |
| 3 | Ato que autoriza a Contratação Direta |
| 4 | Edital de Chamamento Público |

### Esfera (usado no search como filtro `esferas`)
| Sigla | Descrição |
|-------|-----------|
| F | Federal |
| E | Estadual |
| M | Municipal |
| D | Distrital |
| N | Não informado |

### Poder (usado no search como filtro `poderes`)
| Sigla | Descrição |
|-------|-----------|
| E | Executivo |
| L | Legislativo |
| J | Judiciário |
| N | Não se aplica |

### Tipo de Objeto da Contratação (usado no search como filtro `tipos`)
| ID | Nome |
|----|------|
| 1 | Bem |
| 2 | Serviço |
| 3 | Obra |
| 4 | Serviço de Engenharia |

---

## Como regenerar os clientes

```bash
# Regenerar lib da API de Gerenciamento (pncp-api.json)
npm run generate:pncp

# Regenerar lib da API de Consulta (pncp-consultas.json)
npm run generate:pncp-consulta

# Regenerar lib da API de Busca (api.pncp.search.yml)
# (necessita rodar openapi manualmente com o yml)
```

> **Atenção**: após `generate:pncp` e `generate:pncp-consulta`, corrigir o `BASE` URL
> nas libs geradas conforme indicado acima (os specs têm URL relativa por padrão).
