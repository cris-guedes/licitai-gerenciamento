/* eslint-disable @typescript-eslint/no-namespace */
import { z } from "zod";
import { WorkflowDefinitionSchema } from "../_shared/workflowSchemas";

const DeleteCompanyWorkflowNodeBodySchema = z.object({
    companyId: z.string().min(1).describe("ID da empresa dona do workflow."),
    workflowDefinitionId: z.string().min(1).describe("ID da definição de workflow alterada."),
    nodeId: z.string().min(1).describe("ID do nó que será excluído junto com seus filhos."),
});

export namespace DeleteCompanyWorkflowNodeControllerSchemas {
    export const Headers = z.object({
        authorization: z.string().optional().describe("Bearer token do usuário autenticado."),
    }).optional();

    export const Body = DeleteCompanyWorkflowNodeBodySchema;
    export const Query = z.null();
    export const Params = z.null();
    export const Response = z.object({
        workflow: WorkflowDefinitionSchema.describe("Workflow atualizado após excluir o nó."),
    });

    export type Input = z.infer<typeof DeleteCompanyWorkflowNodeBodySchema>;
}
