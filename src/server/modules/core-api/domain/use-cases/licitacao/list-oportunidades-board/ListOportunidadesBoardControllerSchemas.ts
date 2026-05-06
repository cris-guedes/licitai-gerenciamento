/* eslint-disable @typescript-eslint/no-namespace */
import { z } from "zod";
import { OportunidadeBoardResponseSchema } from "../_shared/oportunidadeBoardSchemas";

const ListOportunidadesBoardQuerySchema = z.object({
    companyId: z.string().describe("ID da empresa ativa dona do board."),
    currentPhaseNodeId: z.string().optional().describe("Filtra o board por uma fase específica do workflow."),
    currentStatusNodeId: z.string().optional().describe("Filtra o board por um status específico do workflow."),
    currentSituationNodeId: z.string().optional().describe("Filtra o board por uma situação específica do workflow."),
    responsavelUserId: z.string().optional().describe("Filtra o board por um responsável específico."),
    q: z.string().optional().describe("Busca textual por número, órgão, objeto ou responsável."),
});

export namespace ListOportunidadesBoardControllerSchemas {
    export const Headers = z.object({
        authorization: z.string().optional().describe("Bearer token do usuário autenticado."),
    }).optional();

    export const Body = z.null();
    export const Query = ListOportunidadesBoardQuerySchema;
    export const Params = z.null();
    export const Response = OportunidadeBoardResponseSchema;

    export type Input = z.infer<typeof ListOportunidadesBoardQuerySchema>;
}
