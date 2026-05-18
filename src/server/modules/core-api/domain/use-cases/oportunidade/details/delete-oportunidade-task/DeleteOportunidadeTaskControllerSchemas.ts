/* eslint-disable @typescript-eslint/no-namespace */
import { z } from "zod";

const DeleteOportunidadeTaskBodySchema = z.object({
    companyId: z.string().min(1).describe("ID da empresa dona da oportunidade."),
    oportunidadeId: z.string().min(1).describe("ID da oportunidade dona da tarefa."),
    taskId: z.string().min(1).describe("ID da tarefa."),
});

export namespace DeleteOportunidadeTaskControllerSchemas {
    export const Headers = z.object({
        authorization: z.string().optional().describe("Bearer token do usuário autenticado."),
    }).optional();

    export const Body = DeleteOportunidadeTaskBodySchema;
    export const Query = z.null();
    export const Params = z.null();
    export const Response = z.object({
        taskId: z.string().describe("ID da tarefa removida."),
    });

    export type Input = z.infer<typeof DeleteOportunidadeTaskBodySchema>;
}
