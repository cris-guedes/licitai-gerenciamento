/* eslint-disable @typescript-eslint/no-namespace */
import { z } from "zod";
import { WorkflowDefinitionSchema } from "../_shared/workflowSchemas";

const GetCompanyWorkflowQuerySchema = z.object({
    companyId: z.string().describe("ID da empresa dona do workflow a ser carregado."),
});

export namespace GetCompanyWorkflowControllerSchemas {
    export const Headers = z.object({
        authorization: z.string().optional().describe("Bearer token do usuário autenticado."),
    }).optional();

    export const Body = z.null();
    export const Query = GetCompanyWorkflowQuerySchema;
    export const Params = z.null();
    export const Response = z.object({
        workflow: WorkflowDefinitionSchema.describe("Definição ativa do workflow da empresa, pronta para board e editor visual."),
    });

    export type Input = z.infer<typeof GetCompanyWorkflowQuerySchema>;
}
