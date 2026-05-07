/* eslint-disable @typescript-eslint/no-namespace */
import { z } from "zod";
import { WorkflowDefinitionSchema } from "../_shared/workflowSchemas";

const UpdateCompanyWorkflowTransitionBodySchema = z.object({
    companyId: z.string().min(1).describe("ID da empresa dona do workflow."),
    workflowDefinitionId: z.string().min(1).describe("ID da definição de workflow alterada."),
    transitionId: z.string().min(1).describe("ID da transição que será alterada."),
    transitionType: z.string().trim().max(60).nullable().optional().describe("Tipo semântico opcional da transição."),
});

export namespace UpdateCompanyWorkflowTransitionControllerSchemas {
    export const Headers = z.object({
        authorization: z.string().optional().describe("Bearer token do usuário autenticado."),
    }).optional();

    export const Body = UpdateCompanyWorkflowTransitionBodySchema;
    export const Query = z.null();
    export const Params = z.null();
    export const Response = z.object({
        workflow: WorkflowDefinitionSchema.describe("Workflow atualizado após alterar a transição."),
    });

    export type Input = z.infer<typeof UpdateCompanyWorkflowTransitionBodySchema>;
}
