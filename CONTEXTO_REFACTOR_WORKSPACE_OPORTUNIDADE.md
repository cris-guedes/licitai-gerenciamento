# Contexto para continuidade - Refatoracao de Workspace, Documentos e Oportunidade

Este arquivo resume o estado atual da refatoracao para que outra IA ou pessoa possa continuar sem perder o fio.

## Objetivo da refatoracao

Estamos padronizando o conceito de **workspace** como uma tela ou modal com:

- Sidebar lateral simples com os modulos principais da entidade.
- Cada modulo podendo ter tabs internas quando fizer sentido.
- Visual limpo, pouco poluido, parecido com o modal de detalhes da captacao.
- Componentes reutilizaveis para oportunidade, documento, contrato, empenho etc.

O foco atual e o workspace de **Oportunidade** e o preview de **Documentos**.

## Decisoes arquiteturais

- `Document preview` deve ser reutilizavel como pagina propria e como widget dentro de outras telas.
- O documento pode existir dentro de uma oportunidade/sessao, e a oportunidade funciona como agregador de documentos e analises.
- A IA de documento deve ser parte do widget: preview + chat + resumo.
- Se o documento esta `READY`, chat e resumo ficam disponiveis.
- Se o documento esta `PROCESSING` ou `FAILED`, o painel de IA mostra estado bloqueado.
- Hoje ainda nao existe uma rota clara para reprocessar documento ja existente; o processamento pesado ocorre no fluxo de upload.
- O workspace de oportunidade deve representar a entidade inteira, nao apenas uma visao resumida.

## Estado atual do workspace de oportunidade

Arquivo principal:

- `src/client/features/oportunidades/components/OportunidadeWorkspacePage.tsx`

Seções/sidebar:

- `src/client/features/oportunidades/components/OportunidadeWorkspaceSections.tsx`

Modulos principais:

- `OportunidadeOverviewModule.tsx`
- `OportunidadeDataModule.tsx`
- `OportunidadeDocumentsModule.tsx`
- `OportunidadeRulesModule.tsx`
- `OportunidadeItemsModule.tsx`
- `OportunidadeOrgaosModule.tsx`
- `OportunidadeWorkflowModule.tsx`
- `OportunidadeHistoryModule.tsx`
- `OportunidadeExecutionModule.tsx`

Sidebar atual:

- `Visao Geral`
- `Dados`
- `Documentos`
- `Regras`
- `Itens`
- `Orgaos`
- `Fluxo`
- `Contratos`
- `Historico`

## Documentos

O modulo de documentos foi alterado para:

- Mostrar uma lista lateral de documentos.
- Permitir minimizar/expandir essa lista.
- Mostrar o preview do documento selecionado com `DocumentSurface`.
- Mostrar o painel de IA com `DocumentAiPanel`.
- Reutilizar os servicos existentes de chat e resumo.

Arquivos relevantes:

- `src/client/features/oportunidades/components/modules/OportunidadeDocumentsModule.tsx`
- `src/client/components/document/DocumentSurface.tsx`
- `src/client/features/documents/components/DocumentAiPanel.tsx`
- `src/client/features/documents/components/DocumentChatPanel.tsx`
- `src/client/features/documents/components/DocumentSummaryPanel.tsx`
- `src/client/features/licitacoes/services/use-document-chat.service.ts`
- `src/client/features/licitacoes/services/use-document-summary.service.ts`

O mesmo `OportunidadeWorkspaceSections` tambem e usado no modal de captacao:

- `src/client/features/licitacoes/components/LicitacoesPage/OportunidadeDetailDialog.tsx`

Por isso o modal tambem recebeu `documentChatService` e `documentSummaryService`.

## Dados da oportunidade

Antes a aba `Dados` mostrava poucos campos e parecia fraca. Ela foi expandida para ser uma ficha cadastral completa da licitacao/edital.

Arquivo:

- `src/client/features/oportunidades/components/modules/OportunidadeDataModule.tsx`

Blocos atuais:

- Identificacao
- Origem e rastreabilidade
- Orgao e unidade
- Objeto, valores e fundamento
- Datas, versao e status
- Cronograma do edital

Campos adicionados no payload do workspace:

Licitação:

- `sourceSystem`
- `sourceReference`
- `numeroControlePncp`
- `anoCompra`
- `sequencialCompra`
- `numeroLicitacao`
- `processoAdministrativo`
- `modalidadeNome`
- `tipoInstrumentoNome`
- `objetoResumo`
- `situacaoOficial`
- `valorEstimadoTotal`
- `valorHomologadoTotal`
- `dataPublicacao`
- `dataAberturaProposta`
- `dataEncerramentoProposta`
- `linkSistemaOrigem`
- `linkProcessoEletronico`
- `ultimaAtualizacaoOficial`

Edital:

- `versao`
- `isAtual`
- `tipoVersao`
- `documentoPrincipalId`
- `orgaoCnpj`
- `orgaoRazaoSocial`
- `orgaoEsfera`
- `orgaoPoder`
- `unidadeCodigo`
- `unidadeNome`
- `municipio`
- `uf`
- `numero`
- `processo`
- `modalidade`
- `tipoInstrumento`
- `modoDisputa`
- `objeto`
- `valorEstimado`
- `dataAbertura`
- `dataEncerramento`
- `informacaoComplementar`
- `amparoLegal`
- `srp`
- `cronograma`
- `certame`
- `execucao`
- `itens`
- `orgaos`
- `habilitacoes`

## Backend

Workspace view:

- `src/server/modules/core-api/domain/use-cases/licitacao/_shared/licitacaoWorkspaceView.ts`

Schema OpenAPI/Zod:

- `src/server/modules/core-api/domain/use-cases/licitacao/_shared/licitacaoWorkspaceSchemas.ts`

Repositorio:

- `src/server/shared/infra/repositories/oportunidade.repository.ts`

O `findWorkspaceById` agora carrega dados estruturados do edital:

- `cronograma`
- `certame`
- `documents`
- `habilitacoes`
- `itensDetalhados`
- `orgaos` com `orgao` e itens vinculados

O mapper normaliza esses dados para o frontend.

## Client gerado e OpenAPI

Foi necessario regenerar o client:

```bash
npm run generate:client
```

Arquivos gerados/tocados:

- `openapi.generated.json`
- `src/client/main/infra/apis/api-core/models/GetLicitacaoWorkspaceResponse.ts`
- `src/client/main/infra/apis/api-core/services/ContratosService.ts`

Observacao: a geracao tambem revelou que a rota `/contratos/update` existia no backend, mas nao estava registrada em:

- `src/server/modules/core-api/main/configs/schemas.ts`

Essa rota foi adicionada ao registry para o metodo `postCoreContratosUpdate` voltar ao client gerado.

## Regras, itens e orgaos

Novos modulos de oportunidade:

- `OportunidadeRulesModule.tsx`
  - Regras do certame
  - Execucao
  - Habilitacao
- `OportunidadeItemsModule.tsx`
  - Tabela de itens
  - Lotes, quantidades, unidades e valores
- `OportunidadeOrgaosModule.tsx`
  - Orgao gerenciador
  - Participantes
  - Itens vinculados por orgao

## Historico e visual

O historico foi simplificado para ficar mais proximo do layout do historico da captacao.

Tambem houve limpeza de textos:

- Evitar termos como "workflow" na UI quando "fluxo" ou "ultima atualizacao" bastam.
- Header do modal de detalhes foi compactado para nao roubar espaco das tabs/modulos.
- Cards do board nao devem usar widget de workspace; devem mostrar apenas preview pequeno e botao de avancar.

## Verificacoes executadas

As verificacoes passaram apos as ultimas mudancas:

```bash
npx eslint ...
npx tsc --noEmit
```

O lint foi rodado de forma focada nos arquivos alterados relevantes.

## Pontos pendentes importantes

1. **Reprocessamento de documento existente**
   - O painel de IA ja mostra estado bloqueado quando o documento nao esta `READY`.
   - Ainda falta uma rota/use case clara para processar ou reprocessar um documento ja salvo.
   - Nao criar botao fake sem backend.

2. **Edicao profunda dos dados**
   - `OportunidadeDataModule` exibe muitos dados, mas o dialog de edicao ainda edita apenas campos centrais.
   - Se for continuar, separar edicao por blocos: identificacao, orgao, cronograma, certame, execucao.

3. **Polimento de layout**
   - Revisar comportamento do modulo `Documentos` em telas menores.
   - A lista lateral minimizavel esta implementada, mas pode precisar ajuste fino visual.

4. **Possivel modularizacao adicional**
   - Criar um wrapper mais forte para `DocumentWorkspaceWidget` dentro de oportunidades, evitando que cada modulo monte preview + IA manualmente.

5. **Dados extraidos**
   - Parte de execucao vem de `edital.dadosExtraidos`.
   - Se o formato mudar, ajustar `toExecucaoView` em `licitacaoWorkspaceView.ts`.

## Arquivos que outra IA deve olhar primeiro

Para continuar UI:

- `src/client/features/oportunidades/components/OportunidadeWorkspaceSections.tsx`
- `src/client/features/oportunidades/components/modules/OportunidadeDocumentsModule.tsx`
- `src/client/features/oportunidades/components/modules/OportunidadeDataModule.tsx`
- `src/client/features/oportunidades/components/modules/OportunidadeRulesModule.tsx`
- `src/client/features/oportunidades/components/modules/OportunidadeItemsModule.tsx`
- `src/client/features/oportunidades/components/modules/OportunidadeOrgaosModule.tsx`

Para continuar backend:

- `src/server/modules/core-api/domain/use-cases/licitacao/_shared/licitacaoWorkspaceView.ts`
- `src/server/modules/core-api/domain/use-cases/licitacao/_shared/licitacaoWorkspaceSchemas.ts`
- `src/server/shared/infra/repositories/oportunidade.repository.ts`
- `src/server/modules/core-api/domain/use-cases/document/`

Para contratos:

- `RESUMO_MODULO_CONTRATOS.md`
- `src/server/modules/core-api/domain/use-cases/contrato/`
- `src/client/features/contratos/`

## Cuidado com o worktree

O worktree esta com muitas alteracoes acumuladas de varias etapas, incluindo contratos, documentos, oportunidades e OpenAPI gerado.

Nao usar comandos destrutivos como:

```bash
git reset --hard
git checkout --
```

Sem confirmacao explicita do usuario.

