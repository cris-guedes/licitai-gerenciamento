import { z } from "zod";

export const OportunidadeBoardNodeSchema = z.object({
    id: z.string().describe("ID do nó atual no workflow."),
    key: z.string().describe("Chave estável do nó."),
    label: z.string().describe("Nome legível do nó."),
    color: z.string().nullable().describe("Cor opcional do nó."),
    path: z.string().describe("Caminho completo do nó dentro do workflow."),
    isInitial: z.boolean().describe("Indica se este nó é inicial dentro do seu contexto."),
    isTerminal: z.boolean().describe("Indica se o nó representa um encerramento do fluxo."),
});

export const OportunidadeBoardResponsavelSchema = z.object({
    id: z.string().describe("ID do usuário responsável pela oportunidade."),
    name: z.string().describe("Nome do responsável."),
    email: z.string().describe("E-mail do responsável."),
});

export const OportunidadeBoardItemSchema = z.object({
    oportunidadeId: z.string().describe("ID da oportunidade listada no board."),
    oportunidadeStatus: z.enum(["DRAFT", "ACTIVE", "CANCELLED"]).describe("Status técnico atual da oportunidade."),
    licitacaoId: z.string().nullable().describe("ID da licitação oficial vinculada à oportunidade."),
    editalId: z.string().nullable().describe("ID do edital técnico vinculado."),
    workflowDefinitionId: z.string().nullable().describe("ID da definição de workflow usada pela oportunidade."),
    title: z.string().describe("Título principal exibido no card ou linha do board."),
    numero: z.string().nullable().describe("Número resumido do edital ou licitação."),
    modalidade: z.string().nullable().describe("Modalidade principal da oportunidade."),
    objetoResumo: z.string().nullable().describe("Resumo do objeto da contratação."),
    valorEstimado: z.string().nullable().describe("Valor estimado principal da oportunidade já formatável pela UI."),
    orgaoNome: z.string().nullable().describe("Órgão principal associado à oportunidade."),
    responsavel: OportunidadeBoardResponsavelSchema.nullable().describe("Usuário responsável pela movimentação da oportunidade."),
    workflow: z.object({
        currentNode: OportunidadeBoardNodeSchema.nullable().describe("Nó corrente exato do workflow."),
        phase: OportunidadeBoardNodeSchema.nullable().describe("Nó usado como coluna do kanban."),
        status: OportunidadeBoardNodeSchema.nullable().describe("Nó usado como badge principal do card."),
        situation: OportunidadeBoardNodeSchema.nullable().describe("Nó usado como contexto secundário do card."),
        updatedAt: z.string().nullable().describe("Data ISO da última alteração manual do workflow."),
    }).describe("Recorte atual do workflow aplicado à oportunidade."),
    itemCount: z.number().describe("Quantidade de itens da licitação que estão vinculados à oportunidade."),
    createdAt: z.string().describe("Data ISO de criação da oportunidade."),
    updatedAt: z.string().describe("Data ISO da última atualização da oportunidade."),
    canMove: z.boolean().describe("Indica se o usuário autenticado pode mover esta oportunidade no board."),
});

export const OportunidadeBoardResponseSchema = z.object({
    items: z.array(OportunidadeBoardItemSchema).describe("Oportunidades ativas exibidas no board da empresa."),
    total: z.number().describe("Quantidade total de oportunidades retornadas pela consulta."),
    columnSummaries: z.array(z.object({
        phaseNodeId: z.string().describe("ID da fase/coluna do workflow."),
        itemCount: z.number().describe("Quantidade de cards retornados nesta coluna."),
        valorEstimadoTotal: z.string().describe("Soma dos valores estimados dos cards retornados nesta coluna."),
    })).describe("Agregados por coluna considerando os filtros atuais."),
    filterOptions: z.object({
        responsaveis: z.array(OportunidadeBoardResponsavelSchema).describe("Responsáveis disponíveis para filtro."),
        situations: z.array(z.object({
            id: z.string().describe("ID da situação disponível para filtro."),
            label: z.string().describe("Nome legível da situação."),
        })).describe("Situações disponíveis para filtro."),
        valueRange: z.object({
            min: z.string().nullable().describe("Menor valor estimado disponível no board."),
            max: z.string().nullable().describe("Maior valor estimado disponível no board."),
        }).describe("Faixa total de valores estimados disponível no board."),
    }).describe("Opções auxiliares para filtros da UI."),
});
