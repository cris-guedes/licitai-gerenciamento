import { z } from "zod";

export const WorkflowNodeKindSchema = z.object({
    id: z.string().describe("ID interno do tipo de nó do workflow."),
    key: z.string().describe("Chave estável usada pelo sistema para identificar o tipo de nó."),
    label: z.string().describe("Nome legível do tipo de nó."),
    description: z.string().nullable().describe("Descrição opcional do papel do tipo de nó."),
    order: z.number().describe("Ordem de exibição do tipo dentro da definição."),
    parentKindId: z.string().nullable().describe("Tipo pai, quando houver hierarquia entre kinds."),
    color: z.string().nullable().describe("Cor opcional associada ao tipo de nó."),
    metadata: z.unknown().nullable().describe("Metadados livres usados para layout e configurações visuais."),
    createdAt: z.string().describe("Data ISO de criação do tipo de nó."),
    updatedAt: z.string().describe("Data ISO da última atualização do tipo de nó."),
});

export const WorkflowNodeSchema = z.object({
    id: z.string().describe("ID do nó do workflow."),
    kindId: z.string().describe("ID do tipo do nó."),
    parentId: z.string().nullable().describe("ID do nó pai, quando este nó estiver abaixo de outro."),
    key: z.string().describe("Chave estável do nó."),
    label: z.string().describe("Nome legível do nó."),
    description: z.string().nullable().describe("Descrição opcional do nó."),
    order: z.number().describe("Ordem do nó entre seus irmãos."),
    depth: z.number().describe("Profundidade hierárquica do nó na árvore."),
    path: z.string().describe("Caminho completo do nó dentro da definição do workflow."),
    color: z.string().nullable().describe("Cor opcional do nó."),
    isInitial: z.boolean().describe("Indica se o nó é considerado ponto inicial dentro do seu nível."),
    isTerminal: z.boolean().describe("Indica se o nó representa um encerramento do fluxo."),
    metadata: z.unknown().nullable().describe("Metadados livres do nó, incluindo layout para editores visuais."),
    createdAt: z.string().describe("Data ISO de criação do nó."),
    updatedAt: z.string().describe("Data ISO da última atualização do nó."),
    kind: z.object({
        id: z.string().describe("ID do tipo do nó."),
        key: z.string().describe("Chave estável do tipo do nó."),
        label: z.string().describe("Nome legível do tipo do nó."),
        order: z.number().describe("Ordem do tipo do nó."),
        parentKindId: z.string().nullable().describe("Tipo pai do kind, quando existir."),
        color: z.string().nullable().describe("Cor opcional do tipo do nó."),
    }).describe("Resumo do tipo associado ao nó."),
});

export const WorkflowTransitionSchema = z.object({
    id: z.string().describe("ID interno da transição."),
    fromNodeId: z.string().describe("ID do nó de origem."),
    toNodeId: z.string().describe("ID do nó de destino."),
    transitionType: z.string().nullable().describe("Tipo semântico opcional da transição."),
    metadata: z.unknown().nullable().describe("Metadados livres da transição, incluindo labels de visualização."),
    createdAt: z.string().describe("Data ISO de criação da transição."),
    updatedAt: z.string().describe("Data ISO da última atualização da transição."),
});

export const WorkflowDefinitionSchema = z.object({
    id: z.string().describe("ID da definição de workflow ativa para a empresa."),
    companyId: z.string().describe("ID da empresa dona da definição."),
    name: z.string().describe("Nome do workflow."),
    slug: z.string().describe("Slug estável da definição."),
    version: z.number().describe("Versão da definição do workflow."),
    isActive: z.boolean().describe("Indica se esta é a definição ativa da empresa."),
    metadata: z.unknown().nullable().describe("Metadados globais da definição, como kinds usados no board."),
    createdAt: z.string().describe("Data ISO de criação da definição."),
    updatedAt: z.string().describe("Data ISO da última atualização da definição."),
    nodeKinds: z.array(WorkflowNodeKindSchema).describe("Tipos de nós disponíveis neste workflow."),
    nodes: z.array(WorkflowNodeSchema).describe("Nós hierárquicos que formam a estrutura do workflow."),
    transitions: z.array(WorkflowTransitionSchema).describe("Transições permitidas entre os nós do workflow."),
});
