/* eslint-disable @typescript-eslint/no-namespace */
import { z } from "zod";

export const DeleteLicitacaoDraftBodySchema = z.object({
    companyId: z.string().min(1).describe("ID da empresa dona do rascunho."),
    oportunidadeId: z.string().min(1).describe("ID da oportunidade em rascunho que será excluída."),
});

export const DeleteLicitacaoDraftResponseSchema = z.object({
    oportunidadeId: z.string().describe("ID da oportunidade excluída."),
    deletedDocuments: z.number().int().nonnegative().describe("Quantidade de documentos removidos junto com o rascunho."),
    deleted: z.literal(true).describe("Confirma que o rascunho foi removido com sucesso."),
});

export namespace DeleteLicitacaoDraftControllerSchemas {
    export const Headers = z.object({
        authorization: z.string().optional().describe("Bearer token do usuário autenticado."),
    }).optional();

    export const Body = DeleteLicitacaoDraftBodySchema;
    export const Query = z.null();
    export const Params = z.null();
    export const Response = DeleteLicitacaoDraftResponseSchema;

    export type Input = z.infer<typeof DeleteLicitacaoDraftBodySchema>;
}
