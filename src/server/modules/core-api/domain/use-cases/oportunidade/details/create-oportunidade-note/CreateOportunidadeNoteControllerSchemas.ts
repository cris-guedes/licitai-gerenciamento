/* eslint-disable @typescript-eslint/no-namespace */
import { z } from "zod";
import { LicitacaoWorkspaceNoteSchema } from "../../../licitacao/_shared/licitacaoWorkspaceSchemas";

const CreateOportunidadeNoteBodySchema = z.object({
    companyId: z.string().min(1).describe("ID da empresa dona da oportunidade."),
    oportunidadeId: z.string().min(1).describe("ID da oportunidade que receberá a nota."),
    content: z.string().min(1).describe("Conteúdo textual da nota."),
});

export namespace CreateOportunidadeNoteControllerSchemas {
    export const Headers = z.object({
        authorization: z.string().optional().describe("Bearer token do usuário autenticado."),
    }).optional();

    export const Body = CreateOportunidadeNoteBodySchema;
    export const Query = z.null();
    export const Params = z.null();
    export const Response = z.object({
        note: LicitacaoWorkspaceNoteSchema.describe("Nota criada para a oportunidade."),
    });

    export type Input = z.infer<typeof CreateOportunidadeNoteBodySchema>;
}
