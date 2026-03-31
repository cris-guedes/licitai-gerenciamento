# 📊 Status das Tools MCP — PNCP Radar

> Atualizado em: 2026-03-01

## Resumo

| Métrica                        | Valor                      |
| ------------------------------ | -------------------------- |
| **Tools registradas**          | 57                         |
| **Resources registrados**      | 9                          |
| **Serviços cobertos**          | 23 / 23                    |
| **Endpoints excluídos**        | 1 (usuário — sem valor para AI) |
| **Serviços não implementados** | 0                          |

---

## ✅ Tools Implementadas (57)

### 1. Ata de Registro de Preço (6 tools)

| Tool                           | Descrição                                      | Endpoint                                                                                             |
| ------------------------------ | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `pncp_consultar_ata`           | Consulta dados de uma ata de registro de preço | `GET /v1/orgaos/{cnpj}/compras/{anoCompra}/{sequencialCompra}/atas/{sequencialAta}`                  |
| `pncp_listar_atas_por_compra`  | Lista atas vinculadas a uma compra             | `GET /v1/orgaos/{cnpj}/compras/{anoCompra}/{sequencialCompra}/atas`                                  |
| `pncp_listar_documentos_ata`   | Lista documentos de uma ata                    | `GET /v1/orgaos/{cnpj}/compras/{anoCompra}/{sequencialCompra}/atas/{sequencialAta}/arquivos`         |
| `pncp_consultar_historico_ata` | Consulta histórico de alterações de uma ata    | `GET /v1/orgaos/{cnpj}/compras/{ano}/{sequencial}/atas/{sequencialAta}/historico`                    |
| `pncp_contar_historico_ata`    | Quantidade de registros no histórico da ata    | `GET /v1/orgaos/{cnpj}/compras/{ano}/{sequencial}/atas/{sequencialAta}/historico/quantidade`         |
| `pncp_contar_documentos_ata`   | Quantidade de documentos de uma ata            | `GET /v1/orgaos/{cnpj}/compras/{anoCompra}/{sequencialCompra}/atas/{sequencialAta}/arquivos/quantidade` |

### 2. Órgão (3 tools)

| Tool                        | Descrição                                   | Endpoint                          |
| --------------------------- | ------------------------------------------- | --------------------------------- |
| `pncp_consultar_orgao_cnpj` | Consulta órgão pelo CNPJ                    | `GET /v1/orgaos/{cnpj}`           |
| `pncp_consultar_orgao_id`   | Consulta órgão pelo ID numérico             | `GET /v1/orgaos/id/{orgaoId}`     |
| `pncp_buscar_orgao_filtro`  | Busca órgãos por razão social (texto livre) | `GET /v1/orgaos/`                 |

### 3. Contratação (13 tools)

| Tool                                            | Descrição                                          | Endpoint                                                                                               |
| ----------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `pncp_consultar_item_contratacao`               | Consulta um item específico de contratação         | `GET /v1/orgaos/{cnpj}/compras/{ano}/{sequencial}/itens/{numeroItem}`                                  |
| `pncp_consultar_resultado_item`                 | Consulta resultado de um item                      | `GET /v1/orgaos/{cnpj}/compras/{ano}/{sequencial}/itens/{numeroItem}/resultados/{sequencialResultado}` |
| `pncp_listar_itens_contratacao`                 | Lista todos os itens de uma contratação (paginado) | `GET /v1/orgaos/{cnpj}/compras/{ano}/{sequencial}/itens`                                               |
| `pncp_listar_resultados_item`                   | Lista resultados de um item                        | `GET /v1/orgaos/{cnpj}/compras/{ano}/{sequencial}/itens/{numeroItem}/resultados`                       |
| `pncp_listar_imagens_item`                      | Recupera metadados de imagens de um item           | `GET /v1/orgaos/{cnpj}/compras/{ano}/{sequencial}/itens/{numeroItem}/imagem`                           |
| `pncp_listar_documentos_contratacao`            | Lista documentos da contratação (paginado)         | `GET /v1/orgaos/{cnpj}/compras/{ano}/{sequencial}/arquivos`                                            |
| `pncp_consultar_historico_contratacao`          | Histórico de alterações da contratação             | `GET /v1/orgaos/{cnpj}/compras/{ano}/{sequencial}/historico`                                           |
| `pncp_contar_itens_contratacao`                 | Quantidade de itens                                | `GET /v1/orgaos/{cnpj}/compras/{ano}/{sequencial}/itens/quantidade`                                    |
| `pncp_contar_historico_contratacao`             | Quantidade de registros no histórico               | `GET /v1/orgaos/{cnpj}/compras/{ano}/{sequencial}/historico/quantidade`                                |
| `pncp_contar_documentos_contratacao`            | Quantidade de documentos                           | `GET /v1/orgaos/{cnpj}/compras/{ano}/{sequencial}/arquivos/quantidade`                                 |
| `pncp_obter_url_imagem_item`                    | URL de download de uma imagem de item              | `GET /v1/orgaos/{cnpj}/compras/{ano}/{sequencial}/itens/{numeroItem}/imagem/{sequencialImagem}`        |
| `pncp_obter_url_documento_contratacao`          | URL de download de um documento de contratação     | `GET /v1/orgaos/{cnpj}/compras/{ano}/{sequencial}/arquivos/{sequencialDocumento}`                      |
| `pncp_obter_url_documento_contratacao_excluido` | URL de download de documento excluído              | `GET /v1/orgaos/{cnpj}/compras/{ano}/{sequencial}/arquivos/excluidos/{sequencialDocumento}`            |

### 4. Contrato/Empenho (8 tools)

| Tool                                         | Descrição                                    | Endpoint                                                                                   |
| -------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `pncp_consultar_contrato`                    | Consulta dados de um contrato                | `GET /v1/orgaos/{cnpj}/contratos/{ano}/{sequencial}`                                       |
| `pncp_listar_documentos_contrato`            | Lista documentos do contrato (paginado)      | `GET /v1/orgaos/{cnpj}/contratos/{ano}/{sequencial}/arquivos`                              |
| `pncp_consultar_historico_contrato`          | Histórico de alterações do contrato          | `GET /v1/orgaos/{cnpj}/contratos/{ano}/{sequencial}/historico`                             |
| `pncp_contar_historico_contrato`             | Quantidade de registros no histórico         | `GET /v1/orgaos/{cnpj}/contratos/{ano}/{sequencial}/historico/quantidade`                  |
| `pncp_contar_documentos_contrato`            | Quantidade de documentos                     | `GET /v1/orgaos/{cnpj}/contratos/{ano}/{sequencial}/arquivos/quantidade`                   |
| `pncp_listar_contratos_contratacao`          | Lista contratos vinculados a uma contratação | `GET /v1/orgaos/{cnpj}/compras/{ano}/{sequencial}/contratos`                               |
| `pncp_obter_url_documento_contrato`          | URL de download de um documento de contrato  | `GET /v1/orgaos/{cnpj}/contratos/{ano}/{sequencial}/arquivos/{sequencialDocumento}`        |
| `pncp_obter_url_documento_contrato_excluido` | URL de download de documento excluído        | `GET /v1/orgaos/{cnpj}/contratos/{ano}/{sequencial}/arquivos/excluidos/{sequencialDocumento}` |

### 5. Termo de Contrato (7 tools)

| Tool                                      | Descrição                                      | Endpoint                                                                                                         |
| ----------------------------------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `pncp_consultar_termo_contrato`           | Consulta dados de um termo de contrato         | `GET /v1/orgaos/{cnpj}/contratos/{ano}/{sequencial}/termos/{sequencialTermo}`                                    |
| `pncp_listar_termos_contrato`             | Lista termos de um contrato (paginado)         | `GET /v1/orgaos/{cnpj}/contratos/{ano}/{sequencial}/termos`                                                      |
| `pncp_listar_documentos_termo`            | Lista documentos de um termo (paginado)        | `GET /v1/orgaos/{cnpj}/contratos/{ano}/{sequencial}/termos/{sequencialTermo}/arquivos`                           |
| `pncp_contar_documentos_termo`            | Quantidade de documentos do termo              | `GET /v1/orgaos/{cnpj}/contratos/{ano}/{sequencial}/termos/{sequencialTermo}/arquivos/quantidade`                |
| `pncp_contar_termos_contrato`             | Quantidade de termos de um contrato            | `GET /v1/orgaos/{cnpj}/contratos/{ano}/{sequencial}/termos/quantidade`                                           |
| `pncp_obter_url_documento_termo`          | URL de download de um documento de termo       | `GET /v1/orgaos/{cnpj}/contratos/{ano}/{sequencial}/termos/{sequencialTermo}/arquivos/{sequencialDocumento}`     |
| `pncp_obter_url_documento_termo_excluido` | URL de download de documento excluído de termo | `GET /v1/orgaos/{cnpj}/contratos/{ano}/{sequencial}/termos/{sequencialTermo}/arquivos/excluidos/{sequencialDocumento}` |

### 6. Plano de Contratação (9 tools)

| Tool                                | Descrição                                        | Endpoint                                                                  |
| ----------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------- |
| `pncp_listar_itens_plano`           | Lista itens de um plano por categoria (paginado) | `GET /v1/orgaos/{cnpj}/pca/{ano}/{sequencial}/itens`                      |
| `pncp_consultar_sequenciais_plano`  | Recupera sequenciais de um plano (requer UASG)   | `GET /v1/orgaos/{cnpj}/pca/{uasg}/{ano}/sequenciaisplano`                 |
| `pncp_consultar_valores_categoria`  | Valores do plano por categoria de item           | `GET /v1/orgaos/{cnpj}/pca/{ano}/{sequencial}/valorescategoriaitem`       |
| `pncp_contar_itens_plano`           | Quantidade de itens do plano                     | `GET /v1/orgaos/{cnpj}/pca/{ano}/{sequencial}/itens/quantidade`           |
| `pncp_consultar_plano_com_itens`    | Plano completo com todos os itens                | `GET /v1/orgaos/{cnpj}/pca/{ano}/{sequencial}/itens/plano`                |
| `pncp_listar_itens_por_contratacao` | Itens do plano vinculados a uma contratação      | `GET /v1/orgaos/{cnpj}/pca/{ano}/{sequencial}/itens/contratacao`          |
| `pncp_consultar_plano_consolidado`  | Dados consolidados do plano                      | `GET /v1/orgaos/{cnpj}/pca/{ano}/{sequencial}/consolidado`                |
| `pncp_consultar_valores_orgao`      | Valores dos planos de um órgão por categoria     | `GET /v1/orgaos/{cnpj}/pca/{ano}/valorescategoriaitem`                    |
| `pncp_contar_planos_orgao`          | Quantidade de planos de um órgão                 | `GET /v1/orgaos/{cnpj}/pca/{ano}/quantidade`                              |

### 7. Lookup — Tabelas Contextuais (2 tools)

| Tool                                           | Descrição                                                               | Endpoint                                                                   |
| ---------------------------------------------- | ----------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `pncp_listar_unidades_orgao`                   | Lista unidades (UASGs) de um órgão pelo CNPJ                           | `GET /v1/orgaos/{cnpj}/unidades`                                           |
| `pncp_listar_fontes_orcamentarias_contratacao` | Lista fontes orçamentárias de uma contratação (cnpj + ano + sequencial) | `GET /v1/orgaos/{cnpj}/compras/{ano}/{sequencial}/fonte-orcamentaria`      |

### 8. Conformidade (8 tools)

| Tool                                                        | Descrição                                                                    | Endpoint                                                                                                          |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `pncp_listar_conformidade_instrumento_modo_disputa`         | Lista combinações válidas de instrumento convocatório × modo de disputa      | `GET /v1/tipo-instrumento-convocatorio-modo-disputa`                                                              |
| `pncp_consultar_conformidade_instrumento_modo_disputa`      | Verifica se uma combinação específica instrumento × modo de disputa é válida | `GET /v1/tipo-instrumento-convocatorio-modo-disputa/{tipoInstrumentoConvocatorioId}/{modoDisputaId}`              |
| `pncp_listar_conformidade_instrumento_modalidade_amparo`    | Lista combinações válidas de instrumento × modalidade × amparo legal         | `GET /v1/instrumento-convocatorio-modalidade-amparo-legal`                                                        |
| `pncp_consultar_conformidade_instrumento_modalidade_amparo` | Verifica se uma combinação específica instrumento × modalidade × amparo é válida | `GET /v1/instrumento-convocatorio-modalidade-amparo-legal/{amparoLegalId}/{modalidadeId}/{tipoInstrumentoConvocatorioId}` |
| `pncp_listar_conformidade_modalidade_criterio_julgamento`   | Lista combinações válidas de modalidade × critério de julgamento             | `GET /v1/modalidade-criterio-julgamento`                                                                          |
| `pncp_consultar_conformidade_modalidade_criterio_julgamento` | Verifica se uma combinação específica modalidade × critério é válida        | `GET /v1/modalidade-criterio-julgamento/{modalidadeId}/{criterioJulgamentoId}`                                    |
| `pncp_listar_conformidade_modalidade_fonte_orcamentaria`    | Lista combinações válidas de modalidade × fonte orçamentária                 | `GET /v1/modalidade-fonte-orcamentaria`                                                                           |
| `pncp_consultar_conformidade_modalidade_fonte_orcamentaria` | Verifica se uma combinação específica modalidade × fonte é válida            | `GET /v1/modalidade-fonte-orcamentaria/{modalidadeId}/{fonteOrcamentariaId}`                                      |

### 9. Dados Cadastrais (1 tool)

| Tool                    | Descrição                                             | Endpoint                                      |
| ----------------------- | ----------------------------------------------------- | --------------------------------------------- |
| `consultar_empresa_cnpj` | Consulta dados cadastrais de empresa pelo CNPJ (OpenCNPJ) | `GET https://kitana.opencnpj.com/cnpj/{cnpj}` |

---

## 📦 Resources Registrados (9)

Tabelas de referência estáticas expostas como MCP Resources (`pncp://lookup/*`).
O cliente MCP pode pré-carregar e cachear esses dados para enriquecer o contexto do AI.

| Resource URI                              | Provider                                  | Descrição                                          | Endpoint                                    |
| ----------------------------------------- | ----------------------------------------- | -------------------------------------------------- | ------------------------------------------- |
| `pncp://lookup/amparo-legal`              | `AmparoLegalProvider`                     | Amparos legais (Lei 14.133/2021, etc.)             | `GET /v1/amparos-legais`                    |
| `pncp://lookup/modalidade`                | `ModalidadeProvider`                      | Modalidades de licitação                           | `GET /v1/modalidades`                       |
| `pncp://lookup/modo-disputa`              | `ModoDeDisputaProvider`                   | Modos de disputa (Aberto, Fechado, etc.)           | `GET /v1/modos-disputa`                     |
| `pncp://lookup/criterio-julgamento`       | `CritRioDeJulgamentoProvider`             | Critérios de julgamento de propostas               | `GET /v1/criterios-julgamento`              |
| `pncp://lookup/instrumento-convocatorio`  | `InstrumentoConvocatRioProvider`          | Tipos de instrumento convocatório                  | `GET /v1/tipos-instrumento-convocatorio`    |
| `pncp://lookup/tipo-instrumento-cobranca` | `TipoDeInstrumentoDeCobranAProvider`      | Tipos de instrumento de cobrança em contratos      | `GET /v1/tipos-instrumento-cobranca`        |
| `pncp://lookup/fonte-orcamentaria`        | `FonteOrAmentRiaProvider`                 | Fontes orçamentárias disponíveis                   | `GET /v1/fontes-orcamentarias`              |
| `pncp://lookup/categoria-item`            | `CategoriaDeItemProvider`                 | Categorias de item (Material, Serviço, Obra, etc.) | `GET /v1/categorias-item`                   |
| `pncp://lookup/catalogo`                  | `CatLogoProvider`                         | Catálogo de materiais e serviços padronizados      | `GET /v1/catalogo`                          |

---

## ⏭️ Serviços Não Implementados

### Usuário (excluído por design)

| Serviço         | Motivo                                                                          |
| --------------- | ------------------------------------------------------------------------------- |
| `UsuRioService` | Retorna credenciais de usuário — sem valor para busca de editais e potencialmente sensível |

---

## 📁 Estrutura de Arquivos

```
src/server/
├── domain/use-cases/
│   ├── ata/                    (6 use cases) ✅
│   ├── orgao/                  (3 use cases) ✅
│   ├── contratacao/            (13 use cases) ✅
│   ├── contrato-empenho/       (8 use cases) ✅
│   ├── termo-contrato/         (7 use cases) ✅
│   ├── plano-contratacao/      (9 use cases) ✅
│   ├── conformidade/           (8 use cases) ✅
│   ├── company-details/        (1 use case) ✅
│   └── lookup/
│       ├── listar-unidades-orgao/       (tool) ✅
│       ├── listar-fontes-contratacao/   (tool) ✅
│       └── resources/                   (9 resources) ✅
│           ├── amparo-legal/
│           ├── modalidade/
│           ├── modo-disputa/
│           ├── criterio-julgamento/
│           ├── instrumento-convocatorio/
│           ├── tipo-instrumento-cobranca/
│           ├── fonte-orcamentaria/
│           ├── categoria-item/
│           └── catalogo/
├── infra/providers/
│   ├── ata-provider.ts                              ✅
│   ├── orgao-provider.ts                            ✅
│   ├── contratacao-provider.ts                      ✅
│   ├── contrato-empenho-provider.ts                 ✅
│   ├── termo-contrato-provider.ts                   ✅
│   ├── plano-contratacao-provider.ts                ✅
│   ├── company-details-provider.ts                  ✅
│   ├── unidade-provider.ts                          ✅
│   ├── fonte-orcamentaria-contratacao-provider.ts   ✅
│   ├── conformidade-instrumento-modo-disputa-provider.ts        ✅
│   ├── conformidade-instrumento-modalidade-amparo-provider.ts   ✅
│   ├── conformidade-modalidade-criterio-provider.ts             ✅
│   ├── conformidade-modalidade-fonte-provider.ts                ✅
│   ├── amparo-legal-provider.ts                     ✅
│   ├── modalidade-provider.ts                       ✅
│   ├── modo-disputa-provider.ts                     ✅
│   ├── criterio-julgamento-provider.ts              ✅
│   ├── instrumento-convocatorio-provider.ts         ✅
│   ├── tipo-instrumento-cobranca-provider.ts        ✅
│   ├── fonte-orcamentaria-provider.ts               ✅
│   ├── categoria-item-provider.ts                   ✅
│   └── catalogo-provider.ts                         ✅
└── main/
    ├── adapters/
    │   ├── mcp-tool-adapter.ts       ✅
    │   └── mcp-resource-adapter.ts   ✅
    ├── tools/
    │   ├── ata.ts                    ✅ (6 tools)
    │   ├── orgao.ts                  ✅ (3 tools)
    │   ├── contratacao.ts            ✅ (13 tools)
    │   ├── contrato-empenho.ts       ✅ (8 tools)
    │   ├── termo-contrato.ts         ✅ (7 tools)
    │   ├── plano-contratacao.ts      ✅ (9 tools)
    │   ├── lookup.ts                 ✅ (2 tools contextuais)
    │   ├── conformidade.ts           ✅ (8 tools de validação cruzada)
    │   └── company-details.ts        ✅ (1 tool)
    ├── resources/
    │   └── lookup.ts                 ✅ (9 resources estáticos)
    └── configs/
        ├── setup-tools.ts            ✅ (9 grupos registrados)
        └── setup-resources.ts        ✅ (1 grupo registrado)
```
