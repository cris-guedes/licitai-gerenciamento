# Oportunidades: Board Kanban/Lista — Primeira Entrega

Este documento consolida a especificação técnica da primeira entrega do board de oportunidades.

O foco desta entrega é:

- criar a base persistida do workflow
- transformar a rota de oportunidades em uma visão operacional real
- suportar visualização em `kanban` e `lista`
- manter o modelo flexível para o futuro painel gerencial de workflow

## Objetivo de produto

O board deve permitir que a empresa ativa acompanhe o andamento de todas as oportunidades já captadas e consumadas para gestão.

Regras de negócio confirmadas:

- o board mostra apenas oportunidades da `empresa ativa`
- `DRAFT` não entra no board; continua em `Rascunhos`
- o board mostra apenas oportunidades com `Oportunidade.status = ACTIVE`
- qualquer colaborador da empresa pode visualizar
- apenas o `responsavelUserId` pode mover o card
- o criador da oportunidade é o responsável inicial por padrão
- a visão pode ser alternada entre `kanban` e `lista`
- as oportunidades da lista são tratadas individualmente

## Princípio estrutural

O fluxo não deve ser modelado apenas com enums soltas em `Oportunidade`.

Também não deve ficar apenas em JSON.

Como precisaremos:

- filtrar por fase e status
- ordenar por posição do workflow
- validar transições
- futuramente permitir edição do workflow pelo dono da empresa

o núcleo do workflow deve ser relacional.

## Modelo conceitual

A imagem de referência já define a hierarquia por legenda:

- azul = `status`
- verde = `fase`
- branco = `situação`

Esses três níveis serão o padrão inicial do produto, mas o modelo não deve ficar preso para sempre a essa estrutura.

Portanto:

- o sistema nasce com `phase`, `status` e `situation`
- mas o `kind` de um nó deve ser configurável
- a estrutura deve aceitar outros níveis no futuro sem remodelagem
- o board continuará usando por padrão:
  - `phase` como coluna
  - `status` como badge principal
  - `situation` como contexto secundário

Conclusão:

- a organização do workflow será hierárquica
- a movimentação será em grafo

Ou seja:

- pai/filho organiza os nós
- transições explícitas dizem para onde é permitido mover

## Relação com `Oportunidade.status`

`Oportunidade.status` continua existindo, mas com papel técnico de ciclo de vida da entidade:

- `DRAFT`
- `ACTIVE`
- `CANCELLED`

Ele não representa o andamento operacional do board.

O andamento operacional ficará em novos campos:

- `workflowDefinitionId`
- `currentNodeId`
- `currentPhaseNodeId`
- `currentStatusNodeId`
- `currentSituationNodeId`
- `workflowUpdatedAt`

## Tabelas novas

### Compatibilidade com editor visual

O modelo desta entrega deve ser compatível desde já com um editor visual baseado em grafo.

Referência preferencial para a futura UI:

- `React Flow`

Consequências de modelagem:

- `WorkflowNode` representa `nodes`
- `WorkflowTransition` representa `edges`
- `WorkflowNodeKind` define a semântica e o papel visual dos nós
- `metadata` deve aceitar dados de layout e apresentação do editor

Estruturas recomendadas em `metadata`:

- em `WorkflowNode.metadata`
  - `reactFlow.position`
  - `reactFlow.width`
  - `reactFlow.height`
- em `WorkflowTransition.metadata`
  - `reactFlow.label`
  - `reactFlow.style`
  - `reactFlow.animated`

### `WorkflowDefinition`

Representa uma definição versionada de workflow para uma empresa.

Campos mínimos:

- `id`
- `companyId`
- `name`
- `slug`
- `version`
- `isActive`
- `metadata`
- `createdAt`
- `updatedAt`

Regras:

- uma empresa pode ter várias versões
- apenas uma versão pode estar ativa por vez
- toda empresa nova nasce com um workflow padrão ativo
- o workflow define também quais `kinds` exercem papel no board
- a definição também pode guardar metadados do editor visual

Campos adicionais recomendados em `metadata`:

- `boardColumnKindKey`
- `primaryBadgeKindKey`
- `secondaryBadgeKindKey`

Valor padrão no seed inicial:

- `boardColumnKindKey = "phase"`
- `primaryBadgeKindKey = "status"`
- `secondaryBadgeKindKey = "situation"`

### `WorkflowNodeKind`

Representa um tipo de nó dentro de uma definição de workflow.

O `kind` não deve ser enum fixa no banco.

Ele deve ser configurável por workflow.

Porém, toda empresa nasce com três kinds padrão:

- `phase`
- `status`
- `situation`

Campos mínimos:

- `id`
- `workflowDefinitionId`
- `key`
- `label`
- `description`
- `order`
- `parentKindId`
- `color`
- `metadata`
- `createdAt`
- `updatedAt`

Regras:

- `parentKindId` define a hierarquia esperada de kinds
- no fluxo padrão:
  - `status` tem pai `phase`
  - `situation` tem pai `status`
- novos kinds poderão surgir no futuro, como:
  - `substatus`
  - `motivo`
  - `resultado`

### `WorkflowNode`

Representa um nó concreto do workflow.

Um nó pode ser:

- uma fase
- um status
- uma situação
- ou qualquer novo kind permitido pela definição

Campos mínimos:

- `id`
- `workflowDefinitionId`
- `kindId`
- `parentId`
- `key`
- `label`
- `description`
- `order`
- `depth`
- `path`
- `isInitial`
- `isTerminal`
- `metadata`
- `createdAt`
- `updatedAt`

Regras:

- `parentId` permite a estrutura pai/filho
- `path` e `depth` ajudam em leitura, filtros e montagem de breadcrumb
- o modelo não fica preso a exatamente três camadas
- os nós padrão do seed seguirão a semântica `phase -> status -> situation`

### `WorkflowTransition`

Representa uma transição permitida entre dois nós do workflow.

Importante:

- a hierarquia não basta sozinha
- o fluxo possui ramificações, retornos, reabertura e convergência
- por isso a movimentação precisa de uma tabela de transição própria

Campos mínimos:

- `id`
- `workflowDefinitionId`
- `fromNodeId`
- `toNodeId`
- `transitionType`
- `metadata`
- `createdAt`
- `updatedAt`

Observações:

- `fromNodeId` e `toNodeId` sempre apontam para `WorkflowNode`
- o sistema poderá permitir transições entre nós do mesmo nível ou de ramos diferentes
- isso suporta retorno, reabertura, recurso e caminhos alternativos sem duplicar estrutura

## Alterações em `Oportunidade`

Novos campos:

- `workflowDefinitionId`
- `currentNodeId`
- `currentPhaseNodeId`
- `currentStatusNodeId`
- `currentSituationNodeId`
- `workflowUpdatedAt`

Novas regras:

- toda `Oportunidade` com `status = ACTIVE` deve ter workflow atual válido
- toda oportunidade ativa precisa apontar para uma definição de workflow da mesma empresa
- toda oportunidade ativa precisa apontar para um `currentNodeId`
- os campos `currentPhaseNodeId`, `currentStatusNodeId` e `currentSituationNodeId` são mantidos para filtro rápido

### Por que manter os nós resolvidos em `Oportunidade`

Apesar de o modelo estrutural ser genérico, o produto precisa:

- filtrar por fase
- filtrar por status
- agrupar colunas rapidamente
- ordenar board e lista sem subir a árvore inteira a cada consulta

Por isso:

- `currentNodeId` representa o ponto atual real no fluxo
- os demais ids funcionam como projeção materializada para consulta simples

## Regras de edição futura do workflow

Essas regras não serão implementadas agora na UI gerencial, mas devem orientar a modelagem desde já.

### Regra principal

Uma estrutura de workflow não pode ser alterada estruturalmente se já existir oportunidade usando seus nós.

Na prática:

- se a empresa quiser mudar um workflow em uso
- o sistema deverá criar uma nova versão
- a nova versão poderá ser ativada para novas oportunidades
- as antigas permanecem na versão anterior

Consequência de modelagem:

- `WorkflowDefinition` precisa de `version`
- `Oportunidade` precisa apontar para a definição usada

## Workflow padrão inicial

O workflow padrão inicial será semeado no banco para toda empresa nova.

Ele será derivado do fluxo da imagem de referência.

### Fases observadas na imagem

Nós do kind padrão `phase`, com chaves sugeridas:

- `analise_documental`
- `aguardando_resposta`
- `precificacao`
- `enviar_para_esclarecimento`
- `pregao_suspenso`
- `fase_de_lances`
- `ganho`
- `em_habilitacao`
- `recurso`
- `contrarrazao`
- `aguardando_contrato_ata`
- `enviar_para_contrato`

Observação:

- `contrarrazao` pode nascer inicialmente como fase própria ou como situação, dependendo do refinamento final da transcrição
- para esta primeira entrega, a estrutura deve suportar ambas as leituras sem remodelagem

### Status observados na imagem

Nós do kind padrão `status`, com chaves sugeridas:

- `na_fila`
- `em_analise`
- `impugnar_edital`
- `esclarecimento`
- `proposta_enviada`
- `em_disputa`
- `pregao_perdido`
- `pregao_ganho`
- `habilitado`
- `adjudicacao`
- `homologado`
- `finalizado`
- `perdida`
- `recurso`

### Situações observadas na imagem

Nós do kind padrão `situation`, com chaves sugeridas:

- `novo_edital_reabertura_pregao`
- `impugnacao_aceita`
- `impugnacao_recusada`
- `retorna_para_analise`
- `respondido`
- `produto_atendido`
- `produto_nao_atendido`
- `cadastrar_proposta`
- `aguardar_abertura_pregao`
- `aceita`
- `recusada`
- `aguardar_habilitacao`
- `proximo_concorrente`
- `enviar_para_possivel_recurso`
- `recurso_aceito`
- `recurso_nao_aceito`

### Observação importante sobre a primeira transcrição

A legenda da imagem resolve a hierarquia conceitual, mas alguns ramos ainda exigem refinamento antes do seed final.

Principalmente:

- quando `contrarrazao` deve ser `phase`, `status` ou `situation`
- quando `perdida` é nó terminal definitivo ou nó reabrível
- como representar ramos paralelos de recurso sem duplicação desnecessária
- quando um ramo deve ser modelado por hierarquia e quando deve ser modelado por transição

Esses pontos não bloqueiam a modelagem das tabelas nem a implementação do board.

## Primeira entrega do board

### Rota alvo

A rota atual de gerenciamento de licitações passa a ser o board operacional:

- `/org/[orgId]/[companyId]/licitacoes`

### Modos de visualização

#### `kanban`

- agrupamento pelos nós do kind definido em `WorkflowDefinition.metadata.boardColumnKindKey`
- no seed inicial, uma coluna por `phase`
- cards ordenados por atualização ou critério futuro específico
- drag and drop entre colunas
- apenas o responsável pode mover

#### `lista`

- mesma fonte de dados do kanban
- apresentação em tabela ou stack list
- filtros por fase, status, situação e responsável
- ações individuais por oportunidade

## Dados mínimos do card/linha

Cada oportunidade deve retornar para a UI:

- `oportunidadeId`
- `title`
- `displayName`
- `numeroLicitacao`
- `modalidade`
- `orgaoNome`
- `responsavel`
- `currentNode`
- `currentPhase`
- `currentStatus`
- `currentSituation`
- `workflowBreadcrumb`
- `itemCount`
- `updatedAt`
- `dataAbertura` ou data operacional principal quando existir

O `title` deve priorizar:

1. nome humanizado do preview ou oportunidade
2. objeto resumido da licitação
3. fallback técnico com número/modalidade

## Regras de movimentação

### Permissão

Só pode mover:

- usuário autenticado
- com acesso à empresa ativa
- que seja o `responsavelUserId` da oportunidade

### Validação

O backend deve validar:

- existência da oportunidade
- pertencimento à empresa ativa
- `status = ACTIVE`
- responsabilidade do usuário
- existência da transição na definição do workflow
- coerência entre `toNodeId` e os nós resolvidos de fase/status/situação

### Comportamento

Mover entre colunas implica alterar:

- `currentNodeId`
- `currentPhaseNodeId`
- `currentStatusNodeId`
- `currentSituationNodeId`
- `workflowUpdatedAt`

Para simplificar a primeira entrega:

- o drag altera principalmente o nó do kind configurado como coluna
- no seed inicial, o drag altera principalmente a `phase`
- o backend resolve o nó default mais adequado abaixo do destino
- os ids resolvidos em `Oportunidade` são recalculados a partir do `currentNodeId`

Mudanças finas de status e situação dentro da mesma fase podem ficar para uma ação secundária no card.

## Backend: casos de uso da primeira entrega

### `list-oportunidades-board`

Responsabilidade:

- listar oportunidades ativas da empresa
- aplicar filtros
- retornar estrutura pronta para `kanban` e `lista`

Filtros mínimos:

- `companyId`
- `phaseNodeId`
- `statusNodeId`
- `situationNodeId`
- `responsavelUserId`
- `q`

### `move-oportunidade-workflow`

Responsabilidade:

- executar transição do workflow
- validar responsabilidade
- validar transição permitida

Entrada mínima:

- `companyId`
- `oportunidadeId`
- `toNodeId`

### `get-company-workflow`

Responsabilidade:

- retornar o workflow ativo da empresa
- permitir montar colunas, labels, badges e menus

## Frontend: arquitetura da primeira entrega

Feature nova:

- `src/client/features/oportunidades/`

Estrutura sugerida:

```text
src/client/features/oportunidades/
├── components/
│   └── OportunidadesBoardPage/
│       ├── OportunidadesBoardPage.tsx
│       ├── hooks/
│       │   └── useOportunidadesBoardPage.ts
│       ├── BoardToolbar.tsx
│       ├── KanbanView.tsx
│       ├── ListView.tsx
│       ├── OportunidadeCard.tsx
│       ├── OportunidadeWorkflowBadge.tsx
│       └── index.ts
├── services/
│   └── use-oportunidade-board.service.ts
├── schemas/
├── types/
└── utils/
```

## Libs recomendadas

Para acelerar a implementação do frontend:

- `@dnd-kit/core`
- `@dnd-kit/sortable`
- `@dnd-kit/modifiers`

Libs já existentes a reutilizar:

- `@tanstack/react-query`
- `sonner`
- `shadcn/ui`
- `vaul`, se precisarmos de drawer de detalhe

## Preferência de visualização

A preferência `kanban` ou `lista` pode começar simples.

Sugestão da primeira entrega:

- armazenar em `localStorage`
- chave por empresa ativa

Exemplo conceitual:

- `oportunidades:view-mode:{companyId}`

Não é necessário persistir isso no banco agora.

## Seed inicial

Toda empresa nova deve nascer com:

- um `WorkflowDefinition` padrão ativo
- seus `WorkflowNodeKind` padrão
- seus nós ordenados
- suas transições válidas

Esse seed pode ser executado:

- no onboarding da empresa
- ou na criação explícita da empresa

Kinds padrão do seed:

- `phase`
- `status`
- `situation`

Compatibilidade visual do seed:

- o seed inicial já deve preencher `WorkflowNode.metadata.reactFlow.position`
- o seed inicial já pode preencher `WorkflowTransition.metadata.reactFlow.label`
- isso permite abrir a definição em um editor visual futuro sem precisar recalcular layout do zero

## Fora de escopo desta entrega

- editor visual do workflow
- clonagem/versionamento via UI
- migração automática de oportunidades entre versões de workflow
- ações em massa
- histórico visual completo de transições
- automações por fase/status/situação

## Ordem recomendada de implementação

1. modelar as tabelas de workflow
2. ligar `Oportunidade` ao workflow atual
3. criar seed padrão para empresas novas
4. implementar `get-company-workflow`
5. implementar `list-oportunidades-board`
6. implementar visão `lista`
7. implementar `move-oportunidade-workflow`
8. implementar visão `kanban` com drag and drop

## Critério de pronto da primeira entrega

Consideraremos a primeira entrega pronta quando:

- a empresa ativa conseguir visualizar todas as oportunidades `ACTIVE`
- o usuário puder alternar entre `kanban` e `lista`
- as colunas do kanban vierem do kind configurado como coluna no workflow ativo
- cada card mostrar fase, status e situação no seed inicial
- apenas o responsável conseguir mover o card
- o backend validar a transição e persistir o novo ponto do workflow
- a estrutura criada já suportar o futuro painel gerencial sem remodelagem
