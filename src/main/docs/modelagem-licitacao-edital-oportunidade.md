# Modelagem Alvo: Licitação, Edital e Oportunidade

Este documento consolida a modelagem alvo do domínio de licitações da plataforma.

O objetivo aqui não é preservar o formato do banco atual, e sim definir a estrutura mais aderente ao que precisamos hoje:

- representar corretamente o processo oficial da licitação
- representar o edital com suas informações ricas
- consumar internamente o gerenciamento por meio de uma oportunidade
- separar análises de documento e análises de edital
- manter o rascunho como estado interno, sem criar tabela extra

## Princípios

### 1. `Licitacao` não é rascunho

`Licitacao` representa o processo oficial publicado nos canais externos, como PNCP e portais de origem.

Ela não deve carregar:

- estado interno de cadastro
- progresso do workspace
- preview de rascunho
- seleção de itens gerenciados
- análises internas

### 2. `Edital` concentra a riqueza documental

O edital contém a parte técnica e operacional da contratação:

- órgãos participantes
- cronograma
- regras do certame
- itens
- distribuição de itens por órgão
- habilitação

### 3. `Oportunidade` consuma a gestão interna

Quando decidimos começar a administrar uma licitação, criamos uma `Oportunidade`.

Essa entidade precisa resolver apenas o que é necessário hoje:

- vínculo com a empresa
- vínculo com a licitação e com o edital
- responsável
- status interno mínimo
- itens que estamos gerenciando

### 4. `draft` é status de `Oportunidade`

Não precisamos de uma tabela separada para rascunho.

O estado de rascunho é interno ao nosso trabalho, então ele deve viver em `Oportunidade.status`.

Fluxo mínimo:

- `DRAFT`
- `ACTIVE`
- `CANCELLED`

### 5. Análises por documento e por edital devem ser separadas

Nem toda análise é sobre um PDF isolado.

Precisamos distinguir:

- `DocumentAnalysis`: análise de um documento específico
- `EditalAnalysis`: análise do edital como contexto consolidado

Isso evita misturar, por exemplo:

- resumo de um anexo específico
- extração final de informações para cadastro do edital

## Agregados principais

### `Licitacao`

Representa o processo oficial e global.

Campos mínimos:

- `id`
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
- `srp`
- `valorEstimadoTotal`
- `valorHomologadoTotal`
- `dataPublicacao`
- `dataAberturaProposta`
- `dataEncerramentoProposta`
- `linkSistemaOrigem`
- `linkProcessoEletronico`
- `ultimaAtualizacaoOficial`
- `orgaoGerenciadorId`
- `createdAt`
- `updatedAt`

### `Edital`

Representa o edital e sua versão documental.

Campos mínimos:

- `id`
- `licitacaoId`
- `versao`
- `isAtual`
- `tipoVersao`
- `amparoLegal`
- `informacaoComplementar`
- `documentoPrincipalId`
- `createdAt`
- `updatedAt`

Observação:

- a relação alvo é `Licitacao 1:N Edital`
- isso permite edital original, retificação, adendo e consolidado

### `Oportunidade`

Representa a consumação do gerenciamento interno.

Campos mínimos:

- `id`
- `companyId`
- `licitacaoId`
- `editalId`
- `responsavelUserId`
- `status`
- `metadata`
- `createdAt`
- `updatedAt`

Uso de `metadata`:

- preview humanizado
- estado parcial de workspace, se necessário
- informações transitórias que não justificam coluna dedicada agora

## Estruturas filhas do edital

### `OrgaoPublico`

Catálogo reutilizável de órgãos.

Campos mínimos:

- `id`
- `cnpj`
- `razaoSocial`
- `codigoUnidade`
- `nomeUnidade`
- `municipio`
- `uf`
- `esfera`
- `poder`

### `EditalOrgao`

Relaciona o edital aos órgãos envolvidos.

Campos mínimos:

- `id`
- `editalId`
- `orgaoId`
- `papel`
- `createdAt`
- `updatedAt`

Papéis mínimos:

- `GERENCIADOR`
- `PARTICIPANTE`

### `EditalItem`

Representa o item oficial da licitação.

Campos mínimos:

- `id`
- `editalId`
- `numeroItem`
- `descricao`
- `tipoItem`
- `lote`
- `quantidadeTotal`
- `unidadeMedida`
- `valorUnitarioEstimado`
- `valorTotalEstimado`
- `codigoCatmatCatser`
- `codigoNcmNbs`
- `criterioJulgamentoItem`
- `beneficioTributario`
- `observacao`
- `createdAt`
- `updatedAt`

### `EditalOrgaoItem`

Relaciona órgão, item e quantidade.

Essa estrutura é necessária porque o mesmo item pode ter quantidades diferentes por órgão.

Campos mínimos:

- `id`
- `editalOrgaoId`
- `editalItemId`
- `quantidadeSolicitada`

### `EditalCronograma`

Campos mínimos:

- `editalId`
- `acolhimentoInicio`
- `acolhimentoFim`
- `horaLimite`
- `sessaoPublicaEm`
- `esclarecimentosAte`
- `impugnacaoAte`

### `EditalCertame`

Campos mínimos:

- `editalId`
- `modoDisputa`
- `criterioJulgamento`
- `tipoLance`
- `intervaloLances`
- `duracaoSessaoMinutos`
- `exclusivoMeEpp`
- `permiteConsorcio`
- `exigeVisitaTecnica`
- `permiteAdesao`
- `percentualAdesao`
- `regionalidade`
- `difal`
- `vigenciaAtaMeses`
- `vigenciaContratoDias`

### `EditalHabilitacaoExigencia`

Campos mínimos:

- `id`
- `editalId`
- `tipo`
- `categoria`
- `obrigatorio`
- `ordem`

## Itens gerenciados

### `OportunidadeItem`

Representa apenas os itens que nossa empresa decidiu administrar.

Campos mínimos:

- `id`
- `oportunidadeId`
- `editalItemId`
- `createdAt`
- `updatedAt`

Não vamos adicionar agora:

- score
- prioridade
- status interno por item
- observações extensas
- responsável por item

Se isso se tornar necessário depois, adicionamos de forma incremental.

## Análises

### `DocumentAnalysis`

Escopo:

- análise de documento isolado
- resumo de um PDF
- leitura de um anexo específico
- artefatos ligados a um único documento

### `EditalAnalysis`

Escopo:

- extração de informações do edital para cadastro
- resumo geral do edital considerando todos os documentos
- análises que dependem do contexto consolidado do edital

Campos mínimos:

- `id`
- `editalId`
- `companyId`
- `createdById`
- `type`
- `status`
- `result`
- `metrics`
- `errorMessage`
- `startedAt`
- `finishedAt`
- `createdAt`
- `updatedAt`

Tipos mínimos sugeridos:

- `EXTRACT_CADASTRO`
- `SUMMARY_GERAL`

## Relações alvo

- `Licitacao 1:N Edital`
- `Edital 1:N Documento`
- `Edital 1:N EditalItem`
- `Edital 1:N EditalOrgao`
- `EditalOrgao N:N EditalItem` via `EditalOrgaoItem`
- `Edital 1:1 EditalCronograma`
- `Edital 1:1 EditalCertame`
- `Edital 1:N EditalHabilitacaoExigencia`
- `Edital 1:N EditalAnalysis`
- `Company 1:N Oportunidade`
- `Licitacao 1:N Oportunidade`
- `Edital 1:N Oportunidade`
- `Oportunidade 1:N OportunidadeItem`

## Decisões fechadas

- `draft` fica em `Oportunidade.status`
- não haverá tabela separada de draft
- `Licitacao` guarda apenas o processo oficial
- `Edital` guarda a parte rica e técnica
- `Oportunidade` guarda apenas o mínimo interno necessário hoje
- `EditalAnalysis` será separada de `DocumentAnalysis`

## Próximo passo recomendado

Quando formos migrar o banco de fato, a ordem recomendada é:

1. redesenhar o `schema.prisma` alvo
2. separar o fluxo atual de rascunho para `Oportunidade.status = DRAFT`
3. transformar `Edital` em relação versionada com `Licitacao`
4. criar `EditalAnalysis`
5. normalizar itens, órgãos e distribuição por órgão
