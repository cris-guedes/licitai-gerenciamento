/* eslint-disable @typescript-eslint/no-namespace */
import { z } from "zod";
import { OportunidadeBoardItemSchema } from "../_shared/oportunidadeBoardSchemas";

const UpdateOportunidadeBoardItemBodySchema = z.object({
    companyId: z.string().min(1).describe("ID da empresa dona da oportunidade."),
    oportunidadeId: z.string().min(1).describe("ID da oportunidade que será atualizada."),
    responsavelUserId: z.string().min(1).nullable().optional().describe("Novo responsável, ou null para deixar sem responsável."),
    phaseNodeId: z.string().min(1).optional().describe("Novo nó de fase do workflow."),
    statusNodeId: z.string().min(1).optional().describe("Novo nó de status do workflow."),
    situationNodeId: z.string().min(1).optional().describe("Novo nó de situação do workflow."),
}).refine(body =>
    body.responsavelUserId !== undefined
    || body.phaseNodeId !== undefined
    || body.statusNodeId !== undefined
    || body.situationNodeId !== undefined,
{
    message: "Informe pelo menos uma alteração para a oportunidade.",
});

export namespace UpdateOportunidadeBoardItemControllerSchemas {
    export const Headers = z.object({
        authorization: z.string().optional().describe("Bearer token do usuário autenticado."),
    }).optional();

    export const Body = UpdateOportunidadeBoardItemBodySchema;
    export const Query = z.null();
    export const Params = z.null();
    export const Response = z.object({
        item: OportunidadeBoardItemSchema.describe("Oportunidade já atualizada para o board."),
    });

    export type Input = z.infer<typeof UpdateOportunidadeBoardItemBodySchema>;
}
