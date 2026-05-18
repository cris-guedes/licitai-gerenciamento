/* eslint-disable @typescript-eslint/no-namespace */
import { z } from "zod";

const DeleteOportunidadeNoteBodySchema = z.object({
    companyId: z.string().min(1).describe("ID da empresa dona da oportunidade."),
    oportunidadeId: z.string().min(1).describe("ID da oportunidade dona da nota."),
    noteId: z.string().min(1).describe("ID da nota."),
});

export namespace DeleteOportunidadeNoteControllerSchemas {
    export const Headers = z.object({
        authorization: z.string().optional().describe("Bearer token do usuário autenticado."),
    }).optional();

    export const Body = DeleteOportunidadeNoteBodySchema;
    export const Query = z.null();
    export const Params = z.null();
    export const Response = z.object({
        noteId: z.string().describe("ID da nota removida."),
    });

    export type Input = z.infer<typeof DeleteOportunidadeNoteBodySchema>;
}
