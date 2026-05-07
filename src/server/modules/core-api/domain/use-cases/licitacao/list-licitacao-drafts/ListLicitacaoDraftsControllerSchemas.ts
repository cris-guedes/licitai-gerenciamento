import { z } from "zod";
import { LicitacaoDraftSummarySchema } from "../_shared/licitacaoWorkspaceSchemas";

const ListLicitacaoDraftsQuerySchema = z.object({
    companyId: z.string().describe("ID da empresa dona dos rascunhos a serem listados."),
});

export namespace ListLicitacaoDraftsControllerSchemas {
    export const Headers = z.object({
        authorization: z.string().optional().describe("Bearer token do usuário autenticado."),
    }).optional();

    export const Body = z.null();
    export const Query = ListLicitacaoDraftsQuerySchema;
    export const Params = z.null();
    export const Response = z.object({
        drafts: z.array(LicitacaoDraftSummarySchema).describe("Lista de licitações em andamento que podem ser retomadas."),
    });

    export type Input = z.infer<typeof ListLicitacaoDraftsQuerySchema>;
}
