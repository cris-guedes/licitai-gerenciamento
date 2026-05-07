/* eslint-disable @typescript-eslint/no-namespace */
import { z } from "zod";
import { WorkflowDefinitionSchema } from "../_shared/workflowSchemas";

const DeleteCompanyWorkflowTransitionBodySchema = z.object({
    companyId: z.string().min(1).describe("ID da empresa dona do workflow."),
    workflowDefinitionId: z.string().min(1).describe("ID da definição de workflow alterada."),
    transitionId: z.string().min(1).describe("ID da transição que será excluída."),
});

export namespace DeleteCompanyWorkflowTransitionControllerSchemas {
    export const Headers = z.object({
        authorization: z.string().optional().describe("Bearer token do usuário autenticado."),
    }).optional();

    export const Body = DeleteCompanyWorkflowTransitionBodySchema;
    export const Query = z.null();
    export const Params = z.null();
    export const Response = z.object({
        workflow: WorkflowDefinitionSchema.describe("Workflow atualizado após excluir a transição."),
    });

    export type Input = z.infer<typeof DeleteCompanyWorkflowTransitionBodySchema>;
}
