/* eslint-disable @typescript-eslint/no-namespace */
import { z } from "zod";
import { WorkflowDefinitionSchema } from "../_shared/workflowSchemas";

const WorkflowNodeColorSchema = z.string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Informe uma cor hexadecimal válida.")
    .nullable()
    .optional()
    .describe("Cor hexadecimal opcional usada para destacar o nó no workflow.");

const WorkflowNodePositionSchema = z.object({
    x: z.number().describe("Posição horizontal do nó no editor visual."),
    y: z.number().describe("Posição vertical do nó no editor visual."),
}).nullable().optional().describe("Posição opcional usada pelo editor visual.");

const CreateCompanyWorkflowNodeBodySchema = z.object({
    companyId: z.string().min(1).describe("ID da empresa dona do workflow."),
    workflowDefinitionId: z.string().min(1).describe("ID da definição de workflow alterada."),
    parentNodeId: z.string().min(1).nullable().optional().describe("ID do nó pai. Quando vazio, cria uma fase raiz."),
    kindId: z.string().min(1).nullable().optional().describe("Tipo do nó a ser criado. Quando vazio, o servidor usa o próximo tipo permitido pela hierarquia."),
    label: z.string().trim().min(1).max(80).describe("Rótulo exibido para o novo nó."),
    description: z.string().trim().max(240).nullable().optional().describe("Descrição opcional do novo nó."),
    color: WorkflowNodeColorSchema,
    isInitial: z.boolean().optional().describe("Marca o nó como inicial dentro do seu grupo de irmãos."),
    isTerminal: z.boolean().optional().describe("Marca o nó como etapa terminal do workflow."),
    position: WorkflowNodePositionSchema,
});

export namespace CreateCompanyWorkflowNodeControllerSchemas {
    export const Headers = z.object({
        authorization: z.string().optional().describe("Bearer token do usuário autenticado."),
    }).optional();

    export const Body = CreateCompanyWorkflowNodeBodySchema;
    export const Query = z.null();
    export const Params = z.null();
    export const Response = z.object({
        workflow: WorkflowDefinitionSchema.describe("Workflow atualizado após criar o nó."),
    });

    export type Input = z.infer<typeof CreateCompanyWorkflowNodeBodySchema>;
}
