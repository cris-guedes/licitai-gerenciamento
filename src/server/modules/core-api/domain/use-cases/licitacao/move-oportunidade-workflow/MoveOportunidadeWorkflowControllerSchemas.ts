/* eslint-disable @typescript-eslint/no-namespace */
import { z } from "zod";
import { OportunidadeBoardItemSchema } from "../_shared/oportunidadeBoardSchemas";

const MoveOportunidadeWorkflowBodySchema = z.object({
    companyId: z.string().min(1).describe("ID da empresa dona da oportunidade."),
    oportunidadeId: z.string().min(1).describe("ID da oportunidade que será movida."),
    targetNodeId: z.string().min(1).describe("ID exato do nó de destino permitido pelo workflow."),
});

export namespace MoveOportunidadeWorkflowControllerSchemas {
    export const Headers = z.object({
        authorization: z.string().optional().describe("Bearer token do usuário autenticado."),
    }).optional();

    export const Body = MoveOportunidadeWorkflowBodySchema;
    export const Query = z.null();
    export const Params = z.null();
    export const Response = z.object({
        item: OportunidadeBoardItemSchema.describe("Oportunidade já atualizada após a movimentação no workflow."),
    });

    export type Input = z.infer<typeof MoveOportunidadeWorkflowBodySchema>;
}
