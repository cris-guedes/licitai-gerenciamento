# MCP Tool → HTTP Endpoint Mapping

Cada ferramenta MCP tem um endpoint HTTP equivalente acessível via `GET /api/pncp/{slug}`.

Os parâmetros são passados como **query string** no HTTP (ex: `?cnpj=00394460000141&ano=2024`).

---

## Busca

| MCP Tool                 | HTTP Endpoint                     |
| ------------------------ | --------------------------------- |
| `pncp_buscar_licitacoes` | `GET /api/pncp/buscar-licitacoes` |

## Órgão

| MCP Tool                    | HTTP Endpoint                        |
| --------------------------- | ------------------------------------ |
| `pncp_consultar_orgao_cnpj` | `GET /api/pncp/consultar-orgao-cnpj` |
| `pncp_consultar_orgao_id`   | `GET /api/pncp/consultar-orgao-id`   |
| `pncp_buscar_orgao_filtro`  | `GET /api/pncp/buscar-orgao-filtro`  |

## Company Details

| MCP Tool                 | HTTP Endpoint                          |
| ------------------------ | -------------------------------------- |
| `consultar_empresa_cnpj` | `GET /api/pncp/consultar-empresa-cnpj` |

## Lookup

| MCP Tool                                       | HTTP Endpoint                             |
| ---------------------------------------------- | ----------------------------------------- |
| `pncp_listar_unidades_orgao`                   | `GET /api/pncp/listar-unidades-orgao`     |
| `pncp_listar_fontes_orcamentarias_contratacao` | `GET /api/pncp/listar-fontes-contratacao` |

## Contratação

| MCP Tool                                        | HTTP Endpoint                                            |
| ----------------------------------------------- | -------------------------------------------------------- |
| `pncp_consultar_item_contratacao`               | `GET /api/pncp/consultar-item-contratacao`               |
| `pncp_consultar_resultado_item`                 | `GET /api/pncp/consultar-resultado-item`                 |
| `pncp_listar_itens_contratacao`                 | `GET /api/pncp/listar-itens-contratacao`                 |
| `pncp_listar_resultados_item`                   | `GET /api/pncp/listar-resultados-item`                   |
| `pncp_listar_imagens_item`                      | `GET /api/pncp/listar-imagens-item`                      |
| `pncp_listar_documentos_contratacao`            | `GET /api/pncp/listar-documentos-contratacao`            |
| `pncp_consultar_historico_contratacao`          | `GET /api/pncp/consultar-historico-contratacao`          |
| `pncp_contar_itens_contratacao`                 | `GET /api/pncp/contar-itens-contratacao`                 |
| `pncp_contar_historico_contratacao`             | `GET /api/pncp/contar-historico-contratacao`             |
| `pncp_contar_documentos_contratacao`            | `GET /api/pncp/contar-documentos-contratacao`            |
| `pncp_obter_url_imagem_item`                    | `GET /api/pncp/obter-url-imagem-item`                    |
| `pncp_obter_url_documento_contratacao`          | `GET /api/pncp/obter-url-documento-contratacao`          |
| `pncp_obter_url_documento_contratacao_excluido` | `GET /api/pncp/obter-url-documento-contratacao-excluido` |

## Ata

| MCP Tool                       | HTTP Endpoint                           |
| ------------------------------ | --------------------------------------- |
| `pncp_consultar_ata`           | `GET /api/pncp/consultar-ata`           |
| `pncp_listar_atas_por_compra`  | `GET /api/pncp/listar-atas-por-compra`  |
| `pncp_listar_documentos_ata`   | `GET /api/pncp/listar-documentos-ata`   |
| `pncp_consultar_historico_ata` | `GET /api/pncp/consultar-historico-ata` |
| `pncp_contar_historico_ata`    | `GET /api/pncp/contar-historico-ata`    |
| `pncp_contar_documentos_ata`   | `GET /api/pncp/contar-documentos-ata`   |

## Contrato / Empenho

| MCP Tool                                     | HTTP Endpoint                                         |
| -------------------------------------------- | ----------------------------------------------------- |
| `pncp_consultar_contrato`                    | `GET /api/pncp/consultar-contrato`                    |
| `pncp_listar_documentos_contrato`            | `GET /api/pncp/listar-documentos-contrato`            |
| `pncp_consultar_historico_contrato`          | `GET /api/pncp/consultar-historico-contrato`          |
| `pncp_contar_historico_contrato`             | `GET /api/pncp/contar-historico-contrato`             |
| `pncp_contar_documentos_contrato`            | `GET /api/pncp/contar-documentos-contrato`            |
| `pncp_listar_contratos_contratacao`          | `GET /api/pncp/listar-contratos-contratacao`          |
| `pncp_obter_url_documento_contrato`          | `GET /api/pncp/obter-url-documento-contrato`          |
| `pncp_obter_url_documento_contrato_excluido` | `GET /api/pncp/obter-url-documento-contrato-excluido` |

## Termo de Contrato

| MCP Tool                                  | HTTP Endpoint                                      |
| ----------------------------------------- | -------------------------------------------------- |
| `pncp_consultar_termo_contrato`           | `GET /api/pncp/consultar-termo-contrato`           |
| `pncp_listar_termos_contrato`             | `GET /api/pncp/listar-termos-contrato`             |
| `pncp_listar_documentos_termo`            | `GET /api/pncp/listar-documentos-termo`            |
| `pncp_contar_documentos_termo`            | `GET /api/pncp/contar-documentos-termo`            |
| `pncp_contar_termos_contrato`             | `GET /api/pncp/contar-termos-contrato`             |
| `pncp_obter_url_documento_termo`          | `GET /api/pncp/obter-url-documento-termo`          |
| `pncp_obter_url_documento_termo_excluido` | `GET /api/pncp/obter-url-documento-termo-excluido` |

## Plano de Contratação

| MCP Tool                            | HTTP Endpoint                                |
| ----------------------------------- | -------------------------------------------- |
| `pncp_listar_itens_plano`           | `GET /api/pncp/listar-itens-plano`           |
| `pncp_consultar_sequenciais_plano`  | `GET /api/pncp/consultar-sequenciais-plano`  |
| `pncp_consultar_valores_categoria`  | `GET /api/pncp/consultar-valores-categoria`  |
| `pncp_contar_itens_plano`           | `GET /api/pncp/contar-itens-plano`           |
| `pncp_consultar_plano_com_itens`    | `GET /api/pncp/consultar-plano-com-itens`    |
| `pncp_listar_itens_por_contratacao` | `GET /api/pncp/listar-itens-por-contratacao` |
| `pncp_consultar_plano_consolidado`  | `GET /api/pncp/consultar-plano-consolidado`  |
| `pncp_consultar_valores_orgao`      | `GET /api/pncp/consultar-valores-orgao`      |
| `pncp_contar_planos_orgao`          | `GET /api/pncp/contar-planos-orgao`          |

## Conformidade

| MCP Tool                                                     | HTTP Endpoint                                                        |
| ------------------------------------------------------------ | -------------------------------------------------------------------- |
| `pncp_listar_conformidade_instrumento_modo_disputa`          | `GET /api/pncp/listar-conformidade-instrumento-modo-disputa`         |
| `pncp_consultar_conformidade_instrumento_modo_disputa`       | `GET /api/pncp/consultar-conformidade-instrumento-modo-disputa`      |
| `pncp_listar_conformidade_instrumento_modalidade_amparo`     | `GET /api/pncp/listar-conformidade-instrumento-modalidade-amparo`    |
| `pncp_consultar_conformidade_instrumento_modalidade_amparo`  | `GET /api/pncp/consultar-conformidade-instrumento-modalidade-amparo` |
| `pncp_listar_conformidade_modalidade_criterio_julgamento`    | `GET /api/pncp/listar-conformidade-modalidade-criterio`              |
| `pncp_consultar_conformidade_modalidade_criterio_julgamento` | `GET /api/pncp/consultar-conformidade-modalidade-criterio`           |
| `pncp_listar_conformidade_modalidade_fonte_orcamentaria`     | `GET /api/pncp/listar-conformidade-modalidade-fonte`                 |
| `pncp_consultar_conformidade_modalidade_fonte_orcamentaria`  | `GET /api/pncp/consultar-conformidade-modalidade-fonte`              |
