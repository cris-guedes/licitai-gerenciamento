import { z } from "zod";
import { LicitacaoWorkspaceSchema } from "../_shared/licitacaoWorkspaceSchemas";

const GetLicitacaoWorkspaceQuerySchema = z.object({
    companyId: z.string().describe("ID da empresa dona da licitação."),
    licitacaoId: z.string().describe("ID da licitação em andamento cujo workspace será restaurado."),
});

export namespace GetLicitacaoWorkspaceControllerSchemas {
    export const Headers = z.object({
        authorization: z.string().optional().describe("Bearer token do usuário autenticado."),
    }).optional();

    export const Body = z.null();
    export const Query = GetLicitacaoWorkspaceQuerySchema;
    export const Params = z.null();
    export const Response = LicitacaoWorkspaceSchema;

    export type Input = z.infer<typeof GetLicitacaoWorkspaceQuerySchema>;
}
