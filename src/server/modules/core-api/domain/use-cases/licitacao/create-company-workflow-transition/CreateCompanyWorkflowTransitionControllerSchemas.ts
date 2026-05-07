/* eslint-disable @typescript-eslint/no-namespace */
import { z } from "zod";
import { WorkflowDefinitionSchema } from "../_shared/workflowSchemas";

const CreateCompanyWorkflowTransitionBodySchema = z.object({
    companyId: z.string().min(1).describe("ID da empresa dona do workflow."),
    workflowDefinitionId: z.string().min(1).describe("ID da definição de workflow alterada."),
    fromNodeId: z.string().min(1).describe("ID do nó de origem da transição."),
    toNodeId: z.string().min(1).describe("ID do nó de destino da transição."),
    transitionType: z.string().trim().max(60).nullable().optional().describe("Tipo semântico opcional da transição."),
});

export namespace CreateCompanyWorkflowTransitionControllerSchemas {
    export const Headers = z.object({
        authorization: z.string().optional().describe("Bearer token do usuário autenticado."),
    }).optional();

    export const Body = CreateCompanyWorkflowTransitionBodySchema;
    export const Query = z.null();
    export const Params = z.null();
    export const Response = z.object({
        workflow: WorkflowDefinitionSchema.describe("Workflow atualizado após criar a transição."),
    });

    export type Input = z.infer<typeof CreateCompanyWorkflowTransitionBodySchema>;
}
